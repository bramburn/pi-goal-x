# AGENTS.md — goal-ledger.ts

## Purpose

Event ledger for goal lifecycle history. Records significant goal events for audit trail and debugging.

## Key Types

```ts
interface GoalLedgerEvent {
  timestamp: number;
  goalId: string;
  kind: "checkpoint" | "stale" | "drafting";
  status?: GoalStatus;
  objective?: string;
}
```

## Core Functions

| Function | Purpose |
|----------|---------|
| `appendGoalEvent(pool, args)` | Append event to ledger |
| `latestAuditorResultForGoal(pool, goalId)` | Get last audit result for a goal |
| `readGoalLedger(cwd)` | Read ledger from disk |

## Opinionated Conventions

### Event Types

- `checkpoint`: Regular continuation turn
- `stale`: Continuation for an old goal that is no longer focused
- `drafting`: Goal confirmation/drafting activity

### Ledger Persistence

The ledger is stored in `.pi/goal-events.jsonl` (one JSON per line). This format is:
- Append-only (fast writes)
- Easy to parse incrementally
- Human-readable for debugging

### Progress Tracking

The ledger is separate from goal records. It tracks:
- When checkpoints occurred
- How long each phase took
- When focus changed

This enables post-hoc analysis of goal performance.

## Testing Strategy

- Test event appending
- Test ledger parsing (valid and invalid lines)
- Test latest result retrieval