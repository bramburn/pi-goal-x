# AGENTS.md — goal-auditor.ts

## Purpose

Independent completion auditor for goal completion verification. Spawns a separate in-memory pi session that inspects artifacts and decides whether the user's objective is genuinely satisfied.

## Architecture

### Config Loading

Config is loaded from two sources with priority:
1. **Environment variables**: `PI_GOAL_AUDITOR_PROVIDER`, `PI_GOAL_AUDITOR_MODEL`, `PI_GOAL_AUDITOR_THINKING_LEVEL`
2. **File**: `.pi/goal-auditor.json`

File config is merged with env vars, with env vars taking precedence.

### Config Schema

```ts
interface GoalAuditorConfig {
  provider?: string;       // e.g., "google"
  model?: string;           // e.g., "gemini-2.5-flash"
  thinkingLevel?: ThinkingLevel;
  disabled?: boolean;
}
```

### Session Creation

The auditor creates a minimal pi session with:
- **Read-only tools**: `read`, `grep`, `find`, `ls`, `bash` (no write/edit)
- **Minimal resource loader**: No extensions, no skills, no prompts
- **Appended system prompt**: "You are a read-only completion auditor..."

## Core Functions

| Function | Purpose |
|----------|---------|
| `loadGoalAuditorConfig(cwd, env)` | Load and merge file + env config |
| `saveGoalAuditorFileConfig(cwd, config)` | Persist config to file |
| `parseGoalAuditorConfig(raw)` | Parse raw JSON into config |
| `buildGoalAuditorPrompt(args)` | Build auditor instruction prompt |
| `parseAuditorDecision(output)` | Extract `<approved/>` or `<disapproved/>` |
| `runGoalCompletionAuditor(args)` | Execute the audit session |

### Progress Callback

`runGoalCompletionAuditor` accepts an `onProgress` callback that fires on:
- Session start
- Tool execution start/end
- Message updates
- Session end

The callback receives `AuditorProgress`:
```ts
interface AuditorProgress {
  currentTool?: string;
  currentToolArgs?: string;
  currentToolStartedAt?: number;
  recentOutput: string[];
  phase: "running" | "tool_executing" | "producing_report" | "done";
  elapsedMs: number;
}
```

## Opinionated Conventions

### Disapproval Wins

```ts
parseAuditorDecision(output) {
  const approved = /<approved\s*\/>/.test(output);
  const disapproved = /<disapproved\s*\/>/.test(output);
  return { approved: approved && !disapproved, disapproved };
  // If both markers present, disapproved wins
}
```

This prevents accidental double-approval when the executor's summary includes `<approved/>` text.

### Model Resolution

Resolution order:
1. `provider/model` from config → exact lookup
2. `provider` only → first available from that provider
3. `model` with slash → `provider/model` split lookup
4. `model` without slash → name/id match, ambiguous = error
5. Neither → use current/default model

### Audit Prompt Design

The auditor prompt includes:
1. **Role**: "You are the independent completion auditor"
2. **Skepticism directive**: "Do not approve from paperwork..."
3. **Tool restriction**: "Use read/grep/find/ls/bash as needed..."
4. **Disapproval triggers**: "If the work is only an alpha scaffold..."
5. **Required format**: Final line must be `<approved/>` or `<disapproved/>`
6. **Checklist**: Extract criteria → inspect → explain gaps → decide

### Abort Handling

The `signal` parameter wires to the session's abort mechanism:
- External abort (Esc key) stops the session
- Session abort doesn't throw—it returns with captured output
- After session returns, signal.aborted is checked again
- Any abort is treated as disapproval regardless of exception propagation

### Resource Loader Isolation

The auditor's resource loader returns empty lists for everything except system prompt. This ensures:
- No user extensions load in the audit session
- No custom skills affect the audit decision
- The audit is deterministic based only on the prompt and available tools

## Testing Strategy

- Test config parsing with missing/invalid fields
- Test model resolution for all priority cases
- Test decision parsing (both markers, neither, one)
- Test abort signal propagation
- Mock `createSession` to test session creation and event handling