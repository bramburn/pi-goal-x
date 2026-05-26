# AGENTS.md — goal-pool.ts

## Purpose

Open-goal pool helpers and session focus resolution. This module operates on in-memory goal collections, independent of storage or runtime state.

## Core Functions

| Function | Purpose |
|----------|---------|
| `goalPoolFromGoals(goals)` | Convert iterable to Map, dropping completed goals |
| `openGoalsFromPool(pool)` | Get active/paused goals sorted by creation time |
| `focusedGoalFromPool(pool, id)` | Get a specific goal by ID |
| `otherOpenGoalCount(pool, focusedId)` | Count non-focused open goals |
| `resolveSessionFocus(args)` | Determine which goal should be focused |
| `goalSelectorLabel(goal, focusedId)` | Format goal for selector UI |
| `buildGoalListText(pool, focusedId)` | Human-readable goal list |
| `buildUnfocusedOpenGoalsSummary(count)` | Unfocused session message |
| `mergeFocusedGoalWithDisk(args)` | Merge memory + disk usage numbers |

## Focus Resolution Algorithm

`resolveSessionFocus()` implements priority-based focus resolution:

1. **Valid focus entry** → Use `focusEntry.focusedGoalId` if goal exists and isn't complete
2. **Explicit null focus** → Remain unfocused (user deliberately cleared)
3. **Legacy goal** → Use legacy session goal if pool doesn't have it (migration)
4. **Single open goal** → Auto-focus for backward compatibility
5. **Multiple open goals** → Remain unfocused (let user choose)

This order is intentional: explicit user focus wins over auto-focus, and auto-focus only happens when there's exactly one choice.

## Opinionated Conventions

### No Side Effects

All functions are pure. They accept all data as arguments and return new values. No reading from disk, no writing to disk, no global state access.

### Sorting is Deterministic

`openGoalsFromPool()` sorts by `createdAt` then `id` for stable ordering. This ensures consistent list output regardless of iteration order.

### Display Formatting

Functions here handle display formatting because `goal-core.ts` provides shared utilities. The distinction:
- `goal-core.ts`: Low-level formatting primitives (truncate, format, labels)
- `goal-pool.ts`: Composition of those primitives into output strings

### Focus is Human-Owned

The resolution algorithm never auto-selects when multiple open goals exist. The agent cannot switch focus autonomously. This is a design constraint, not a technical limitation.

### Usage Merge Strategy

When merging memory and disk records (for `mergeFocusedGoalWithDisk`):

```ts
const tokensUsed = Math.max(memory.usage.tokensUsed, disk.usage.tokensUsed);
const activeSeconds = Math.max(memory.usage.activeSeconds, disk.usage.activeSeconds);
```

Takes the maximum of each field to preserve the highest observed usage. This handles:
- Turn that updated memory but not disk yet
- Audit that updated disk but memory is stale

## Testing Strategy

- Test focus resolution with each priority level
- Test sorting stability (same input = same order)
- Test open/complete filtering
- Test label formatting with various widths and content lengths