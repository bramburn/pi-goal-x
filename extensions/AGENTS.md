# AGENTS.md — extensions/

## Purpose

This directory contains the pi-goal extension source code. The extension provides a goal-oriented coding agent workflow with confirmation drafting, lifecycle management, and completion auditing.

## File Structure

```
extensions/
├── goal.ts              # Orchestration layer, entry point, slash commands
├── goal-record.ts       # Goal record types, creation, cloning, normalization
├── goal-pool.ts         # Open-goal pool helpers, focus resolution
├── goal-core.ts         # Display formatting utilities
├── goal-draft.ts        # Confirmation prompts, draft validation
├── goal-policy.ts       # Lifecycle validation, completion/abort reports
├── goal-auditor.ts      # Independent auditor agent for completion verification
├── goal-questionnaire.ts        # Built-in questionnaire types, TUI runner
├── goal-tool-names.ts           # Tool name constants, visibility lists
├── goal-ledger.ts       # Goal event ledger
├── goal-compaction.ts   # Compaction policy
├── prompts/             # Prompt builders
│   └── goal-prompts.ts
├── storage/             # File I/O
│   └── goal-files.ts
└── widgets/             # UI components
    ├── goal-widget.ts
    └── goal-notifications.ts
```

## Architecture Overview

### Layer Responsibilities

```
┌─────────────────────────────────────────┐
│         goal.ts (Orchestration)         │
│  Slash commands, tool registration,     │
│  session events, auto-continue,         │
│  usage accounting                       │
└─────────────────┬───────────────────────┘
                  │
    ┌─────────────┼─────────────┐
    │             │             │
    ▼             ▼             ▼
┌────────┐  ┌──────────┐  ┌────────────┐
│Prompts │  │ Policy   │  │ Questionnaire│
│Builders│  │ Validation│  │ Runner       │
└────────┘  └──────────┘  └────────────┘
    │             │             │
    ▼             ▼             ▼
┌────────┐  ┌──────────┐  ┌────────────┐
│ Storage│  │ Auditor  │  │ Widgets    │
│ (I/O)  │  │ (Agent)  │  │ (TUI)      │
└────────┘  └──────────┘  └────────────┘
```

### State Flow

```
User Input → Slash Command Handler
                  ↓
          State Validation (goal-policy.ts)
                  ↓
          Tool/Lifecycle Action
                  ↓
          Storage (goal-files.ts) ←→ Disk
                  ↓
          Prompt Update (goal-prompts.ts)
                  ↓
          LLM Interaction
                  ↓
          Auto-Continue Timer → continuation
```

## Core Concepts

### Goal Lifecycle

```
drafting → active → paused → completed → archived
               ↓         ↓
             aborted   (via update_goal)
```

### Session Focus

- A session can have one focused goal at a time
- Focus is stored in session entries, not goal files
- Focus is human-owned: the agent cannot switch focus autonomously
- Multiple open goals can exist; user chooses which to focus

### Sisyphus Mode

A prompt/criteria variant, not a separate execution state:
- Different drafting prompt with ordered-step preservation
- Different continuation prompt with patience/slow-lane guidance
- Same lifecycle tools and states
- Stricter completion expectations

## Design Principles

### 1. Pure Functions Where Possible

Display formatting (`goal-core.ts`), validation (`goal-policy.ts`), and prompts (`prompts/`) are pure functions with no side effects. This makes them testable and predictable.

### 2. Re-read from Disk on Every Focused Operation

Storage layer always reads current state from disk before lifecycle actions. External changes (file edits, deletions) win over stale memory.

### 3. Validation Returns User-Presentable Messages

Lifecycle validation returns `{ ok: true }` or `{ ok: false, message: string }`. Error messages are human-readable and suitable for direct display.

### 4. No Hidden State Machines

The "drafting" state is a thin session-local `GoalConfirmationIntent`, not a separate runtime phase. This keeps complexity low while enabling the confirmation flow.

### 5. Auditor is Independent

The completion auditor is a separate in-memory pi session with only read-only tools. It cannot be influenced by the executor beyond the initial prompt.

### 6. Tool Visibility is Runtime-Gated

Tools are registered but availability is computed at runtime based on:
- Current state (drafting, active, paused, unfocused)
- User intent (sisyphus vs regular goal)
- Lifecycle progress (post-stop block list)

## Module Overview

### Key Files to Understand

1. **`goal.ts`**: Start here. Contains the extension entry point, all slash commands, and orchestrates other modules.

2. **`goal-record.ts`**: All type definitions and pure functions for goal data.

3. **`goal-pool.ts`**: Focus resolution logic—understands how multiple goals coexist.

4. **`goal-policy.ts`**: The "rules" of goal lifecycle—what's allowed and what's not.

5. **`goal-auditor.ts`**: The completion gate—understands what makes a goal truly done.

### Subdirectories

- `prompts/AGENTS.md` — Prompt builders and drafting flow
- `storage/AGENTS.md` — File I/O, path safety, and persistence
- `widgets/AGENTS.md` — TUI components and display rendering

## Extension Points

### Adding a New Tool

1. Define the tool name constant in `goal-tool-names.ts`
2. Add to appropriate tool lists (`ACTIVE_GOAL_TOOL_NAMES`, etc.)
3. Register in `goal.ts` with `defineTool`
4. Implement handler function
5. Add validation in `goal-policy.ts` if needed

### Adding a New Slash Command

1. Add command handler in `goal.ts`
2. Add command to the slash command list in `defineTools`
3. Handle state validation (drafting, unfocused, etc.)
4. Update prompts if the command affects context

### Customizing Prompts

Edit `prompts/goal-prompts.ts`:
- `goalPrompt()`: Active goal context
- `continuationPrompt()`: Checkpoint continuation
- `goalTweakDraftingPrompt()`: Goal revision
- `staleContinuationPrompt()`: Neutralize stale prompts

## Testing Strategy

### Unit Tests (`tests/`)

Fast tests that mock I/O and focus on logic:
- Parsing and normalization
- Validation rules
- Display formatting
- Prompt builders
- Policy decisions

### Integration Tests

Tests that use real file I/O in a temp directory:
- Storage read/write
- Goal lifecycle with disk persistence
- Focus resolution across multiple goals

### Experiment Harness (`experiments/`)

End-to-end tests with real pi sessions:
- Full goal lifecycle
- Auditor decisions
- Auto-continue behavior

## Cross-References

- `agents/AGENTS.md` — Repository overview and high-level architecture
- `tests/AGENTS.md` — Unit and integration tests
- `experiments/AGENTS.md` — E2E experiment harness

## Debugging

### Goal State Issues

Check `.pi/goals/active_goal_*.md` files directly:
- JSON header contains metadata
- Markdown body contains editable objective

### Focus Issues

Check session entries for `pi-goal-focus`:
- `focusedGoalId: string | null`
- `reason: "created" | "selected" | ...`

### Auditor Issues

Check `.pi/goal-auditor.json` or environment variables:
- `PI_GOAL_AUDITOR_PROVIDER`
- `PI_GOAL_AUDITOR_MODEL`
- `PI_GOAL_AUDITOR_THINKING_LEVEL`