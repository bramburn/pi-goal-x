# AGENTS.md — goal-core.ts

## Purpose

Shared display formatting utilities. Pure functions that transform goal data into human-readable strings. No side effects, no state, no I/O.

## Functions

### Text Utilities

| Function | Purpose |
|----------|---------|
| `truncateText(value, max?)` | Collapse to one line, ellipsis if too long |
| `displayObjectiveTitle(objective)` | Extract first meaningful line as title |

### Formatting

| Function | Purpose |
|----------|---------|
| `formatTokenValue(value)` | Compact: `12.4K (12,400) tokens` or `1.5M` |
| `formatDuration(seconds)` | Human: `2h34m15s`, `5m30s`, `45s` |

### Status

| Function | Purpose |
|----------|---------|
| `statusLabel(goal)` | Compact status: `running`, `paused (agent)`, `sisyphus paused` |
| `footerStatus(goal)` | One-line status for terminal footer |

## Opinionated Conventions

### Compact Numbers

`formatTokenValue()` shows both compact and exact forms:
```ts
// Under 10K: just number
"5,000 tokens"

// 10K-999K: compact + exact
"12.4K (12,400) tokens"

// 1M+: compact only
"1.5M tokens"
```

This balances readability with precision.

### Duration Precision

`formatDuration()` uses variable precision:
- `XhYYmZZs` for hours
- `XmYYs` for minutes
- `Xs` for seconds

No milliseconds—too noisy for human display.

### Objective Title Extraction

`displayObjectiveTitle()` parses structured goal formats:
1. Skips `=== Sisyphus Goal ===` headers
2. Looks for `Objective: <text>` first
3. Falls back to first non-header, non-empty line
4. Truncates if still too long

This handles both free-form and structured goal formats.

### Re-export Pattern

`goal-core.ts` re-exports `isQuestionLikeToolName` from `goal-tool-names.ts`. This is intentional—display utilities may need to check tool types, and `goal-core.ts` is the natural import point for UI code. The re-export avoids spreading tool-name logic across multiple files.

## Testing Strategy

- Snapshot test all formatting output
- Test boundary cases (0, negative, very large numbers)
- Test truncation with Unicode characters (proper width calculation)
- Test objective title parsing with various formats