# AGENTS.md — goal-compaction.ts

## Purpose

Compaction policy and message trimming for long-running goal sessions. Reduces context overhead while preserving goal continuity.

## Core Functions

| Function | Purpose |
|----------|---------|
| `buildCompactionSummary(args)` | Build summary text for compaction |

## Opinionated Conventions

### What Gets Compacted

When a goal session becomes very long, the runtime may compact earlier turns to reduce context:
- Conversation history before the last N turns
- Summary of work done
- Key decisions and their rationale

### What Gets Preserved

- Current goal objective
- Recent context (last few turns)
- Active blockers or pauses
- Success criteria

### Summary Format

```ts
buildCompactionSummary(args) {
  return [
    `Compacted ${args.turnsBefore} turns, ${args.tokensSaved} tokens saved.`,
    `Previous work: ${args.summary}`,
    `Remaining: ${args.remainingTask}`
  ].join("\n");
}
```

## Testing Strategy

- Test summary building with various input lengths
- Test token estimation accuracy
- Test that preserved information is complete