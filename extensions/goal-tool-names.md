# AGENTS.md — goal-tool-names.ts

## Purpose

Tool name constants and tool visibility lists. Single source of truth for what tools exist and when they should be available.

## Constants

### Core Tool Names

```ts
const PROPOSE_DRAFT_TOOL_NAME = "propose_goal_draft";
const CREATE_GOAL_TOOL_NAME = "create_goal";        // Hidden, legacy
const GET_GOAL_TOOL_NAME = "get_goal";
const UPDATE_GOAL_TOOL_NAME = "update_goal";
const PAUSE_GOAL_TOOL_NAME = "pause_goal";
const ABORT_GOAL_TOOL_NAME = "abort_goal";
const TWEAK_APPLY_TOOL_NAME = "apply_goal_tweak";
const QUESTION_TOOL_NAME = "goal_question";
const QUESTIONNAIRE_TOOL_NAME = "goal_questionnaire";
const SISYPHUS_STEP_TOOL_NAME = "step_complete";   // Hidden, legacy
```

### Tool Collections

| Constant | Contents |
|----------|----------|
| `ACTIVE_GOAL_TOOL_NAMES` | Lifecycle tools for active goals |
| `POST_STOP_ALLOWED_TOOLS` | Tools allowed after stop fires |
| `GOAL_PROGRESS_TOOL_NAMES` | Tools that count as "real work" |
| `QUESTION_LIKE_TOOLS` | Tools that are "question-like" |

### Tool Sets

```ts
const POST_STOP_ALLOWED_TOOL_SET = new Set(POST_STOP_ALLOWED_TOOLS);
const GOAL_PROGRESS_TOOL_SET = new Set(GOAL_PROGRESS_TOOL_NAMES);
```

## Functions

| Function | Purpose |
|----------|---------|
| `lifecycleToolNamesForGoalStatus(status)` | Get available tools for a goal state |
| `isQuestionLikeToolName(name)` | Is this a question/dialogue tool? |

## Opinionated Conventions

### Hidden Tools

Some tools are registered but not exposed to the agent:
- `create_goal`: Rejected if called directly; use `propose_goal_draft`
- `step_complete`: Legacy Sisyphus compatibility, not required

The runtime still registers these tools so old transcripts don't break, but they're not in active tool lists.

### Post-Stop Block List

After `pause_goal`, `abort_goal`, `update_goal=complete`, or `apply_goal_tweak` fires, the runtime blocks tool calls. The exception list (`POST_STOP_ALLOWED_TOOLS`) includes:
- `get_goal` (read-only inspection)
- `goal_question` / `goal_questionnaire` (dialogue)
- Other question-like tools

This allows the agent to inspect state or continue dialogue without doing work after a stop signal.

### Progress Detection

`GOAL_PROGRESS_TOOL_NAMES` identifies tools that count as "real work" for the empty-turn guard. If a turn ends without any of these being called, auto-continue doesn't queue the next checkpoint.

### Question-Like Detection

`isQuestionLikeToolName()` checks if a tool is dialogue/clarification rather than work:
- Matches `goal_question`, `goal_questionnaire`
- Matches any tool name containing `question`, `clarify`, `ask`, or `query`

This is used by the drafting gate and tool visibility logic.

## Testing Strategy

- Test tool collections are non-empty
- Test question-like detection with various names
- Test lifecycle tool sets for each status
- Test that hidden tools are not in active lists