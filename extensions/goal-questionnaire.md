# AGENTS.md — goal-questionnaire.ts

## Purpose

Built-in questionnaire types, normalization, and TUI question runner. Provides a self-contained question interface without external dependencies.

## Key Types

```ts
interface GoalQuestionnaireQuestion {
  id: string;
  question: string;
  context?: string;
  options: string[];
  recommended?: number;  // Index of recommended option
  allowCustom?: boolean;
}

interface GoalQuestionnaireAnswer {
  id: string;
  question: string;
  answer: string;
  wasCustom: boolean;
}

interface GoalQuestionnaireResult {
  questions: GoalQuestionnaireQuestion[];
  answers: GoalQuestionnaireAnswer[];
  cancelled: boolean;
}

type ProposalDecision = "confirm" | "continue";
```

## Core Functions

| Function | Purpose |
|----------|---------|
| `normalizeQuestionnaireQuestions(questions)` | Validate, dedupe IDs, filter empty options |
| `formatQuestionnaireAnswers(result)` | Format answers as markdown for tool result |
| `shouldAutoConfirmProposal(args)` | Check for auto-confirm eligibility |
| `proposalDecisionFromQuestionnaireResult(args)` | Map result to confirm/continue |
| `isHeadlessQuestionSufficientForDraft(args)` | Check if TUI is needed for drafting |
| `proposalDialogFailureMessage(error)` | Format error for confirmation failure |
| `runGoalQuestionnaire(ctx, questions)` | Execute TUI questionnaire |
| `registerQuestionnaireTools(ctx, handlers)` | Register goal_questionnaire tool |

## Questionnaire UI Design

The TUI questionnaire uses:
- **Tab navigation**: Multiple questions across tabs
- **Arrow keys**: Navigate options
- **Enter**: Select option / confirm
- **Esc**: Cancel
- **Type**: Custom answer input mode

### UI States

| State | Behavior |
|-------|----------|
| Single question | Show options, Enter confirms, Esc cancels |
| Multi-question | Tab bar, arrow navigation, Enter advances |
| Custom input | Editor for free-text answer |
| All answered | Final Enter confirms, Esc goes back |

## Opinionated Conventions

### Self-Contained

The questionnaire is built into pi-goal rather than depending on external packages. This ensures:
- No peer dependency conflicts
- Consistent styling with pi-tui
- Full control over behavior

### Normalization Rules

```ts
// ID deduplication: if duplicate, append index
if (seenIds.has(id)) id = `${id}-${i + 1}`;

// Empty option filtering: remove empty strings
const options = q.options.filter(option => option.trim().length > 0);

// Default allowCustom to true
return { ...q, allowCustom: q.allowCustom ?? true };
```

### Auto-Confirm Logic

```ts
shouldAutoConfirmProposal(args) {
  if (args.autoConfirmEnv === "0") return false;  // explicit opt-out
  return !args.hasUI || args.autoConfirmEnv === "1";
  // Has no UI → auto-confirm
  // Has UI + env=1 → auto-confirm
  // Has UI + no env → show dialog
}
```

### Headless Sufficiency

`isHeadlessQuestionSufficientForDraft` checks if a question can be skipped in headless mode:
- Topic too short (< 20 chars) → needs question
- Topic ends with common suffixes (整理笔记, organize notes, notes, 笔记) → needs question
- Otherwise → sufficient for direct draft

This handles common vague requests without blocking on questions.

### Proposal Decision Flow

```
propose_goal_draft tool call
    ↓
validateGoalDraftProposal()
    ↓
showProposalDialog() [if not auto-confirm]
    ↓
User clicks Confirm → proposalDecision = "confirm"
User clicks Continue → proposalDecision = "continue"
    ↓
If "confirm": create goal, focus it, print report
If "continue": keep drafting, agent asks more questions
```

### Error Handling

Dialog failures are non-fatal:
- The goal is NOT created
- Drafting remains active
- User can retry after fixing the issue

This is intentional: confirmation failures shouldn't leave the system in a broken state.

## Testing Strategy

- Test normalization with edge cases (empty, duplicate IDs, invalid options)
- Test auto-confirm decision logic
- Test proposal decision mapping
- Test headless sufficiency detection
- Test error message formatting
- Integration test the TUI runner (requires mock TUI)