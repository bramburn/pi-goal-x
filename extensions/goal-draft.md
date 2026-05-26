# AGENTS.md — goal-draft.ts

## Purpose

Lightweight goal confirmation and draft proposal handling. This module bridges the user conversation and goal creation lifecycle.

## Key Types

```ts
type GoalDraftingFocus = "goal" | "sisyphus";

interface GoalConfirmationIntentLike {
  focus: GoalDraftingFocus;
  originalTopic: string;
  startedAt?: number;
}

interface DraftProposalInput {
  intent: GoalConfirmationIntentLike | null;
  hasUnfinishedGoal: boolean;
  objective: string;
  sisyphus?: boolean;
  draftId?: string;  // Deprecated, ignored
}

type DraftProposalValidation =
  | { ok: true; objective: string; expectedSisyphus: boolean }
  | { ok: false; message: string; clearDrafting?: boolean };
```

## Core Functions

| Function | Purpose |
|----------|---------|
| `promptSafeObjective(objective)` | Escape `<untrusted_objective>` tags in objective |
| `buildDraftConfirmationText(args)` | Format draft for user confirmation dialog |
| `validateGoalDraftProposal(input)` | Validate and gate `propose_goal_draft` tool calls |
| `evaluateDraftingToolGate(args)` | Determine if tool should be blocked during drafting |
| `goalDraftingPrompt(topic, focus)` | Build drafting interview prompt for the agent |

## Opinionated Conventions

### Lightweight Confirmation

Drafting is not a separate long-running state machine. The `GoalConfirmationIntent` is thin:
- Stores requested focus and original topic
- Start time for potential timeout (future use)
- Does NOT store proposed objective until agent proposes

This allows the agent to iterate on the proposal without committing to intermediate states.

### Sisyphus Mode Gate

`validateGoalDraftProposal()` enforces that `sisyphus` parameter matches the command the user invoked:
- `/goals` → `sisyphus=false` required
- `/sisyphus` → `sisyphus=true` required

The agent cannot change modes autonomously. This is the "focus gate" that prevents accidental mode mismatches.

### Tool Gate is Permissive

`evaluateDraftingToolGate()` currently returns `{ block: false }` for all tools. The design comment explains:

> "Goal confirmation is prompt-guided, not runtime-enforced. The agent should avoid substantive work before confirmation, but minimal reconnaissance is allowed."

This keeps the runtime simple while trusting the prompt guidance. Future restrictions would be added here if needed.

### Deprecated draftId

The `draftId` parameter in `DraftProposalInput` is accepted for backward compatibility but ignored. Normal goal confirmation no longer depends on hidden prompt identity.

### Drafting Prompt Structure

The drafting prompt has three parts:
1. **Header**: Sets context (`[GOAL CONFIRMATION focus=...]`)
2. **Common protocol**: Rules for all drafts
3. **Mode-specific items**: Template and `propose_goal_draft` call guidance

Mode-specific items include:
- Regular goal: standard structure
- Sisyphus goal: includes ordered steps preservation, no preflight injection

## Testing Strategy

- Test validation with various invalid inputs (empty objective, mode mismatch)
- Test confirmation text formatting
- Test sisyphus mode gate enforcement
- Test escape of `<untrusted_objective>` tags in objective