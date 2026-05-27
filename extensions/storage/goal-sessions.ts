import * as fs from "node:fs";
import * as path from "node:path";

import { nowIso } from "../goal-record.ts";

export const SESSIONS_DIR = ".pi/sessions";
export const CURRENT_SESSION_FILE = ".pi/sessions/current_session";

export interface GoalSession {
	id: string;
	name: string;
	createdAt: string;
	updatedAt: string;
}

export interface SessionContext {
	cwd: string;
}

export function normalizeSessionPath(relPath: string): string {
	return relPath.split(/[\\/]+/).join("/");
}

export function isSafeSessionPath(ctx: SessionContext, relPath: string | undefined): relPath is string {
	if (!relPath || path.isAbsolute(relPath) || relPath.includes("\0")) return false;
	const normalized = normalizeSessionPath(relPath);
	const parent = normalizeSessionPath(path.posix.dirname(normalized));
	if (parent !== normalizeSessionPath(SESSIONS_DIR)) return false;
	const root = path.resolve(ctx.cwd, SESSIONS_DIR);
	const absolutePath = path.resolve(ctx.cwd, normalized);
	const relative = path.relative(root, absolutePath);
	return !relative.startsWith("..") && !path.isAbsolute(relative);
}

export function sessionFilePath(ctx: SessionContext, sessionId: string): string {
	return path.resolve(ctx.cwd, SESSIONS_DIR, `${sessionId}.json`);
}

export function ensureSessionsDirectory(ctx: SessionContext): void {
	const absolutePath = path.resolve(ctx.cwd, SESSIONS_DIR);
	fs.mkdirSync(absolutePath, { recursive: true });
	if (fs.lstatSync(absolutePath).isSymbolicLink()) throw new Error(`Sessions directory is a symlink: ${SESSIONS_DIR}`);
}

export function newSessionId(): string {
	return `sess_${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

export function serializeSession(session: GoalSession): string {
	return JSON.stringify({ version: 1, ...session }, null, 2);
}

export function parseSession(filePath: string): GoalSession | null {
	try {
		if (fs.lstatSync(filePath).isSymbolicLink()) return null;
		const content = fs.readFileSync(filePath, "utf8");
		const raw = JSON.parse(content) as Record<string, unknown>;
		if (!raw || raw.version !== 1) return null;
		const id = typeof raw.id === "string" && raw.id ? raw.id : null;
		const name = typeof raw.name === "string" && raw.name ? raw.name.trim() : null;
		if (!id || !name) return null;
		const timestamp = nowIso();
		return {
			id,
			name,
			createdAt: typeof raw.createdAt === "string" ? raw.createdAt : timestamp,
			updatedAt: typeof raw.updatedAt === "string" ? raw.updatedAt : timestamp,
		};
	} catch {
		return null;
	}
}

export function writeSessionFile(ctx: SessionContext, session: GoalSession): GoalSession {
	ensureSessionsDirectory(ctx);
	const filePath = sessionFilePath(ctx, session.id);
	const updated = { ...session, updatedAt: nowIso() };
	fs.writeFileSync(filePath, serializeSession(updated), "utf8");
	return updated;
}

export function readSessionFile(ctx: SessionContext, sessionId: string): GoalSession | null {
	const filePath = sessionFilePath(ctx, sessionId);
	return parseSession(filePath);
}

export function deleteSessionFile(ctx: SessionContext, sessionId: string): boolean {
	const filePath = sessionFilePath(ctx, sessionId);
	try {
		if (fs.existsSync(filePath) && !fs.lstatSync(filePath).isSymbolicLink()) {
			fs.unlinkSync(filePath);
			return true;
		}
		return false;
	} catch {
		return false;
	}
}

export function readCurrentSessionId(ctx: SessionContext): string | null {
	const filePath = path.resolve(ctx.cwd, CURRENT_SESSION_FILE);
	try {
		if (fs.lstatSync(filePath).isSymbolicLink()) return null;
		const content = fs.readFileSync(filePath, "utf8").trim();
		return content || null;
	} catch {
		return null;
	}
}

export function writeCurrentSessionId(ctx: SessionContext, sessionId: string | null): void {
	ensureSessionsDirectory(ctx);
	const filePath = path.resolve(ctx.cwd, CURRENT_SESSION_FILE);
	if (sessionId === null) {
		// Clear current session by writing empty
		fs.writeFileSync(filePath, "", "utf8");
		return;
	}
	fs.writeFileSync(filePath, sessionId, "utf8");
}

export function readAllSessions(ctx: SessionContext): GoalSession[] {
	const root = path.resolve(ctx.cwd, SESSIONS_DIR);
	let entries: string[];
	try {
		if (fs.lstatSync(root).isSymbolicLink()) return [];
		entries = fs.readdirSync(root);
	} catch {
		return [];
	}
	return entries
		.filter((name) => name.endsWith(".json") && name !== "current_session")
		.map((name) => {
			const filePath = path.resolve(root, name);
			return parseSession(filePath);
		})
		.filter((session): session is GoalSession => session !== null)
		.sort((a, b) => a.name.localeCompare(b.name));
}

export function renameSession(ctx: SessionContext, sessionId: string, newName: string): GoalSession | null {
	const existing = readSessionFile(ctx, sessionId);
	if (!existing) return null;
	const updated = { ...existing, name: newName.trim(), updatedAt: nowIso() };
	return writeSessionFile(ctx, updated);
}

export function createSession(ctx: SessionContext, name: string): GoalSession {
	const session: GoalSession = {
		id: newSessionId(),
		name: name.trim(),
		createdAt: nowIso(),
		updatedAt: nowIso(),
	};
	return writeSessionFile(ctx, session);
}