# AGENTS.md — goal-policy.ts

## Purpose

Lifecycle policy validation and completion/abort report building. Pure functions that validate lifecycle actions and format output strings.

## Key Types

```ts
type GoalStatusLike = "active" | "paused" | "complete";
type StopReasonLike = "user" | "agent";

interface GoalPolicyRecordLike extends GoalDisplayRecordLike {
  id: string;
  status: GoalStatusLike;
  updatedAt?: string;
  pauseReason?: string;
  pauseSuggestedAction?: string;
}

type PolicyValidation =
  | { ok: true }
  | { ok: false; message: string };
```

## Validation Functions

| Function | Purpose |
|----------|---------|
| `validateGoalCreationSlot(goal)` | Check if goal can be created (always ok, reserved for future) |
| `validateGoalCompletion(args)` | Check if goal can be marked complete |
| `validateGoalUpdate(args)` | Check if goal objective can be updated |
| `validateGoalAbort(args)` | Check if goal can be aborted |
| `validatePauseGoal(args)` | Check if goal can be paused |
| `validateResumeGoal(goal)` | Check if goal can be resumed |
| `isGoalUnfinished(goal)` | Boolean: is goal active or paused? |
| `isRunnableStatus(status)` | Boolean: can goal accept checkpoint work? |
| `isCompletableStatus(status)` | Boolean: can goal be marked complete? |

## Builder Functions

| Function | Purpose |
|----------|---------|
| `buildPausedByAgentGoal(goal, args)` | Transform goal to paused state |
| `buildAbortedByAgentGoal(goal, args)` | Transform goal to aborted state |
| `buildCompletionReport(args)` | Format completion output |
| `buildGoalCreatedReport(args)` | Format creation output |
| `clearGoalCommandMessage(args)` | Format `/goal-clear` response |
| `abortGoalCommandMessage(args)` | Format `/goal-abort` response |

## Continuation Helpers

| Function | Purpose |
|----------|---------|
| `shouldQueueContinuation(goal)` | Should auto-continue be queued? |
| `shouldArmPostCompactReminder(goal)` | Should reminder be armed after compaction? |
| `shouldInjectPostCompactReminder(args)` | Should reminder be shown? |

## Opinionated Conventions

### Validation Returns Messages

Validation failures return descriptive messages that are shown directly to the user. This eliminates the need for the caller to generate error text.

### Status-Based Validation

Each lifecycle action has a status check:
- `update_goal` (complete): requires `active` or `paused`
- `pause_goal`: requires `active` only
- `abort_goal`: requires `active` or `paused`
- `update_goal` (objective): requires `active` or `paused`, not `complete`

### Running Goal ID Check

Completion and abort validation checks `runningGoalId` to prevent actions on goals that have been switched during execution. This prevents race conditions in concurrent scenarios.

### Abort Transforms to Paused

`buildAbortedByAgentGoal()` sets status to `paused`, not `aborted`. The `pauseReason` contains "Aborted: " prefix. This preserves the abort reason while keeping the goal in a defined state. The file archiver handles final state.

### Completion Report Structure

```ts
// With audit approval:
"Goal audit approved.\n\nAuditor approval:\n<report>\n\nGoal complete.\n\nCompletion summary:\n<summary>\n\n<detailed summary>"

// With audit skipped:
"Goal audit skipped.\n\nReason: <reason>\n\nGoal complete.\n\n<detailed summary>"

// Without audit:
"Goal complete.\n\n<detailed summary>"
```

## Testing Strategy

- Test each validation with valid and invalid states
- Test status transition builders
- Test report formatting with all optional fields
- Test that validation messages are user-presentable