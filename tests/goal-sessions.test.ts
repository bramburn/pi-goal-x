import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import path from "node:path";
import { tmpdir } from "node:os";
import test from "node:test";

import {
	createSession,
	deleteSessionFile,
	readAllSessions,
	readCurrentSessionId,
	readSessionFile,
	writeCurrentSessionId,
	SESSIONS_DIR,
} from "../extensions/storage/goal-sessions.ts";

function tempCtx(): { cwd: string } {
	return { cwd: mkdtempSync(path.join(tmpdir(), "pi-goal-sessions-")) };
}

function cleanup(ctx: { cwd: string }): void {
	rmSync(ctx.cwd, { recursive: true, force: true });
}

test("createSession creates a session file", () => {
	const ctx = tempCtx();
	try {
		const session = createSession(ctx, "Test Session");

		assert.equal(session.name, "Test Session");
		assert.ok(session.id.startsWith("sess_"));
		assert.ok(session.createdAt);
		assert.ok(session.updatedAt);
	} finally {
		cleanup(ctx);
	}
});

test("readSessionFile reads existing session", () => {
	const ctx = tempCtx();
	try {
		const created = createSession(ctx, "My Session");
		const read = readSessionFile(ctx, created.id);

		assert.ok(read);
		assert.equal(read.id, created.id);
		assert.equal(read.name, "My Session");
	} finally {
		cleanup(ctx);
	}
});

test("readSessionFile returns null for non-existent session", () => {
	const ctx = tempCtx();
	try {
		const result = readSessionFile(ctx, "non_existent_id");
		assert.equal(result, null);
	} finally {
		cleanup(ctx);
	}
});

test("deleteSessionFile removes session file", () => {
	const ctx = tempCtx();
	try {
		const session = createSession(ctx, "To Delete");
		assert.ok(readSessionFile(ctx, session.id));

		const deleted = deleteSessionFile(ctx, session.id);
		assert.equal(deleted, true);
		assert.equal(readSessionFile(ctx, session.id), null);
	} finally {
		cleanup(ctx);
	}
});

test("readAllSessions returns all sessions sorted by name", () => {
	const ctx = tempCtx();
	try {
		createSession(ctx, "Zebra");
		createSession(ctx, "Alpha");
		createSession(ctx, "Middle");

		const sessions = readAllSessions(ctx);

		assert.equal(sessions.length, 3);
		assert.equal(sessions[0].name, "Alpha");
		assert.equal(sessions[1].name, "Middle");
		assert.equal(sessions[2].name, "Zebra");
	} finally {
		cleanup(ctx);
	}
});

test("readAllSessions returns empty array when no sessions", () => {
	const ctx = tempCtx();
	try {
		const sessions = readAllSessions(ctx);
		assert.equal(sessions.length, 0);
	} finally {
		cleanup(ctx);
	}
});

test("writeCurrentSessionId and readCurrentSessionId", () => {
	const ctx = tempCtx();
	try {
		assert.equal(readCurrentSessionId(ctx), null);

		writeCurrentSessionId(ctx, "session_123");
		assert.equal(readCurrentSessionId(ctx), "session_123");

		writeCurrentSessionId(ctx, null);
		assert.equal(readCurrentSessionId(ctx), null);
	} finally {
		cleanup(ctx);
	}
});