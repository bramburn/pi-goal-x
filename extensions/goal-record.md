# AGENTS.md — goal-record.ts

## Purpose

Types and pure functions for goal records. This is the data model layer—zero runtime state, zero I/O, zero side effects.

## Types

### Status Types

```ts
type GoalStatus = "active" | "paused" | "complete";
type StopReason = "user" | "agent";
type GoalEventKind = "checkpoint" | "stale" | "drafting";
type DraftingFocus = "goal" | "sisyphus";
type GoalFocusReason = "created" | "selected" | "resumed" | "completed" | "cleared" | "aborted" | "migrated";
```

### Core Record

```ts
interface GoalRecord {
  id: string;                      // Generated, safe for paths
  objective: string;               // User-provided, untrusted
  status: GoalStatus;
  autoContinue: boolean;
  usage: GoalUsage;                // { tokensUsed, activeSeconds }
  sisyphus: boolean;
  createdAt: string;               // ISO timestamp
  updatedAt: string;
  activePath?: string;             // Disk path (set on write)
  archivedPath?: string;          // Disk path (set on archive)
  stopReason?: StopReason;
  pauseReason?: string;            // Agent-set blocker description
  pauseSuggestedAction?: string;   // Agent-suggested next step
}
```

### Session Entries

```ts
interface GoalFocusEntry {
  version: 1;
  focusedGoalId: string | null;    // null = unfocused
  reason: GoalFocusReason;
}

interface GoalStateEntry {
  version: 3;
  goal: GoalRecord | null;         // Legacy compatibility
}
```

## Pure Functions

| Function | Purpose |
|----------|---------|
| `nowIso(now?)` | Current or given timestamp as ISO string |
| `newGoalId()` | Generate unique goal ID: `<timestamp>-<random>` |
| `safeIdPart(value)` | Sanitize for file paths: alphanumeric, underscore, dash, max 80 chars |
| `normalizeRelPath(path)` | Normalize path separators to forward slash |
| `asRecord(value)` | Type guard: object that is not an array |
| `emptyUsage()` | Fresh usage object: `{ tokensUsed: 0, activeSeconds: 0 }` |
| `cloneGoal(goal)` | Shallow clone with cloned usage object |
| `normalizeGoalRecord(value)` | Parse and validate raw object into GoalRecord |
| `normalizeUsage(value)` | Parse and validate raw usage object |
| `normalizeGoalFocusEntry(value)` | Parse and validate focus entry |
| `createGoal(config)` | Create new goal record from creation config |

## Opinionated Conventions

### Untrusted Objective

The `objective` field is always treated as user-provided data. Functions like `promptSafeObjective()` escape the `<untrusted_objective>` tag syntax if the user accidentally includes it, but the content is otherwise preserved verbatim.

### ID Generation

Goal IDs are generated client-side and must be:
- Unique (timestamp + random suffix)
- Safe for file paths (`safeIdPart()` strips special chars)
- Stable across serialization/deserialization

### Normalization Pattern

Every function that accepts raw user/external data calls `normalize*()` functions to validate and sanitize. This keeps validation logic centralized and testable.

```ts
export function normalizeGoalRecord(value: unknown): GoalRecord | null {
  const raw = asRecord(value);  // Type guard first
  if (!raw) return null;
  
  // Validate each field, use defaults for missing/invalid
  const objective = typeof raw.objective === "string" ? raw.objective.trim() : "";
  if (!objective) return null;  // Fail closed: empty objective is invalid
  
  // ... more validation
  return { ... };
}
```

### Null Safety

All public functions handle null/undefined inputs gracefully:
- `normalize*()` returns `null` for invalid input
- Accessors return `null` or defaults, never throw

### Cloning for Immutability

When modifying a goal record, use `cloneGoal()` first to avoid mutating the original:

```ts
const next = { ...cloneGoal(goal), status: "complete", updatedAt: nowIso() };
```

This ensures the original record is preserved in case of errors or rollbacks.

## Testing Strategy

- Test normalization with invalid/missing/extraneous fields
- Test ID generation uniqueness
- Test cloning independence (mutation doesn't affect original)
- Test path safety (safeIdPart strips everything non-alphanumeric except underscore/dash)