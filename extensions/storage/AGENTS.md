# AGENTS.md — storage/

## Purpose

This directory contains file I/O operations for the pi-goal extension. It handles all disk interactions for goals: reading, writing, archiving, and path safety validation.

## Architecture

### File: `goal-files.ts`

Single file containing all storage operations. No sub-modules needed—storage logic is cohesive.

### Core Functions

| Function | Purpose |
|----------|---------|
| `readActiveGoalPool(ctx)` | Entry point. Returns `Map<goalId, GoalRecord>` from disk |
| `readActiveGoalFiles(ctx)` | Scans `.pi/goals/`, returns parsed active goal records |
| `writeActiveGoalFile(ctx, goal)` | Writes goal to disk, sanitizes paths first |
| `archiveGoalFile(ctx, goal)` | Moves goal to archived directory, cleans up active file |
| `parseGoalFile(path)` | Parses a single goal file (JSON header + markdown body) |
| `serializeGoalFile(goal)` | Converts goal record to file content |
| `mergeGoalPromptFromDisk(ctx, goal)` | Syncs `# Goal Prompt` section edits back into memory |

### Path Safety

All path operations go through safety checks:

```ts
export function isSafeRelativeUnder(ctx, rootRel, relPath): relPath is string
export function isSafeActivePath(ctx, relPath): relPath is string
export function isSafeArchivedPath(ctx, relPath): relPath is string
```

Rejection criteria:
- Absolute paths
- Path traversal (`..`)
- NUL bytes
- Symlinks (checked at write time, filtered at read time)
- Paths outside the goal directories

### File Naming Convention

```
.pi/goals/active_goal_<timestamp>_<id>.md
.pi/goals/archived/goal_<timestamp>_<id>.md
```

- `timestamp`: `YYYYMMDDHHMMSS` + 2-digit centiseconds
- `id`: `safeIdPart()` from `goal-record.ts` (URL-safe, no special chars)

### Atomic Writes

Writes use a temp-file-then-rename pattern:
1. Write to `<path>.<pid>.<timestamp>.tmp`
2. Rename to final path

This prevents partial writes on crash and ensures files are either complete or absent.

## Opinionated Conventions

### Always Re-read from Disk

The storage layer is designed for the pattern: **read on every focused operation, write on every mutation**. The runtime re-reads the focused goal before lifecycle actions to pick up external changes.

```ts
// DON'T cache and trust stale state
const cached = goalsById.get(focusedGoalId);

// DO re-read for critical operations
const diskGoal = readActiveGoalPool(ctx).get(focusedGoalId);
if (!diskGoal) return; // goal was deleted externally
```

### Objective Merge Strategy

Users can edit the `# Goal Prompt` section directly. On lifecycle operations, the storage layer merges edits back:

```ts
export function mergeGoalPromptFromDisk(ctx, current): GoalRecord {
  // Only syncs objective, preserves metadata from memory
  return { ...current, objective: parsed.objective };
}
```

This allows in-place editing without requiring the extension to handle full file updates for every keystroke.

### Reject Symlinks

Symlinks are rejected at write time and filtered at read time. This prevents:
- Goal files that point outside `.pi/goals/`
- Conflicting edits to the same goal from different paths
- Security issues with path traversal via symlinks

### Archive Strategy

Archiving:
1. Writes the goal to `.pi/goals/archived/`
2. Deletes the `activePath` from the record
3. Unlinks the active file

If unlink fails (file already deleted externally), the archive copy still exists. The goal is effectively archived even if the active file cleanup fails.

## File Format

```markdown
<!-- pi-goal-metadata: {"id":"...","status":"active",...} -->

# Goal Prompt

<user objective text>

## Progress

- Status: active
- Auto-continue: on
- Sisyphus mode: no
- Time spent: 2m 34s
- Tokens used: 12.4K
```

The JSON comment header (version 3) contains all metadata. The markdown body contains editable user content. Parsing extracts objective from markdown, falling back to JSON `objective` field for backward compatibility.

## Testing Notes

Storage is the hardest part to test because it touches the filesystem. Strategy:
- Mock `ctx.cwd` to a temp directory in tests
- Use real file operations in integration tests
- Test path safety with edge cases (absolute, traversal, NUL, symlinks)
- Test atomic write behavior with interrupted writes