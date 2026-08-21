# AGENTS.md

This is the root of the pi-goal repository. See `agents/AGENTS.md` for repository-wide architecture guidance.

## Repository Overview

pi-goal-x is a goal-oriented coding agent extension that provides:
- Confirmation drafting before work begins
- Lifecycle management (active, paused, complete, aborted)
- Independent completion auditing
- Multi-goal pool with session window support
- Deferred goal archival (archived after agent turn completes, not immediately)

### Fork Status

pi-goal-x is a fork of [capyup/pi-goal](https://github.com/capyup/pi-goal). The fork is **ahead** of upstream by 48 commits (v0.5.0 → v0.9.0). See `docs/upstream-sync-survey.md` for the full commit breakdown and `docs/upstream-sync-report.md` for the change inclusion report.

## Directory Structure

```
├── agents/           # Agent guidance files (see agents/AGENTS.md)
├── extensions/        # TypeScript source for the pi-goal extension
├── tests/             # Unit and integration tests
├── experiments/       # End-to-end experiment harness
├── docs/              # Architecture docs and PRDs
└── specs/             # Implementation specs (YYYY-MM-DD-kebab-feature/)
```

## Agent Guidance

For help navigating this codebase, see:
- `agents/AGENTS.md` — Repository overview and high-level architecture
- `extensions/AGENTS.md` — Extension implementation details
- Individual module AGENTS.md files for specific areas

## Spec Directories

Spec directories live under `specs` unless a nested AGENTS.md documents a more specific convention.

Spec directory names use `YYYY-MM-DD-kebab-feature`, for example `2026-05-13-drafting-runtime-simplification`.

Spec directories include:
- `PRODUCT.md` — What to build and why
- `TECH.md` — How to build it (optional, for complex specs)
- `MILESTONES.md` — Free-form implementation log

`MILESTONES.md` records meaningful implementation milestones, failed attempts, setbacks, fixes, validation notes, and decisions without a strict schema.

When a user steers behavior mid-workflow, update `PRODUCT.md` first when behavior changes, then `TECH.md`, then implementation, tests, and `MILESTONES.md` as needed.

## Naming Convention

Use `AGENTS.md` (not `CLAUDE.md` or `.clauderc`). This follows the pi-dev convention for agent guidance files.

## Key Capabilities Added in Fork (ahead of upstream)

### Session Window Support (v0.9.0)

Multiple goal sessions can coexist. The `extensions/storage/goal-sessions.ts` module manages session files under `.pi/sessions/`. Each session has an `id`, `name`, `createdAt`, and `updatedAt`. Switch between sessions via `/goal-settings` → `sessions` or `session-settings` command.

### updatedObjective Parameter (v0.8.2)

`update_goal` now accepts an `updatedObjective` field that syncs mid-flight requirement changes into the active goal without terminating the session. Use it when the user's requirements change during a goal. Can be combined with `status=complete` to update and complete in one call. Ledger event: `goal_tweaked`.

### Deferred Goal Archival (v0.8.2)

Goals are archived **after** the agent turn completes, not immediately on `update_goal(status=complete)`. This prevents a race condition where archival fires before the agent's final turn output is processed. The pattern is: set goal complete in-memory → write active file → return completion report → defer `archiveGoalFile()` to turn_end.

### Auditor Lifecycle (v0.7.0–v0.8.0)

The goal completion auditor received a major overhaul:

- **Progress widget**: Live TUI display with spinner, tool count, elapsed time, and recent output lines during audit runs.
- **Esc-to-skip**: Press Escape during an active audit to bypass and mark the goal complete (mirrors the disabled-bypass pattern exactly).
- **Disabled bypass**: `confirmBypassAuditor: true` on `update_goal` confirms the user wants to skip verification when the auditor is disabled in settings.
- **AbortSignal wiring**: The auditor now uses a `createSession` factory with `AbortController`, making it properly interruptible. Post-prompt abort detection handles the case where `session.prompt()` returns without throwing.
- **Audit skipped ledger event**: `audit_skipped` events are emitted with `reason: "disabled" | "user_aborted"` and full auditor config metadata.

### Goal Ledger (v0.7.0)

A JSONL event log at `.pi/goals/goal_events.jsonl` records all lifecycle events: `goal_created`, `goal_focused`, `goal_paused`, `goal_resumed`, `goal_tweaked`, `completion_requested`, `audit_started`, `audit_result`, `audit_skipped`, `goal_completed`, `goal_aborted`, `goal_unfocused`. Use `readGoalLedger()` + `reconstructGoalLedger()` to replay state.

### E2E Test Infrastructure (v0.8.0)

`tests/e2e/` contains a fully automated subagent-based E2E test runner that:
- Spawns real `pi` processes via child_process
- Runs named test chains from `tests/e2e/e2e-test.chain.md`
- Validates filesystem state post-run
- Follows the `pi-mcp-bridge` pattern for extension-level testing

Run with `npx ts-node tests/e2e/run.ts` or via the chain-based runner.

## Pre-existing Test Failures (Windows environment)

4 of 104 tests fail in this Windows development environment due to pre-existing issues unrelated to the 48 commits:

1. `goal-auditor.test.ts` — `@earendil-works/pi-coding-agent` package not installed
2. `goal-questionnaire.test.ts` — `@earendil-works/pi-ai` package not installed
3. `goal-widget.test.ts` — `@earendil-works/pi-tui` package not installed
4. `goalLedgerPath` in `goal-ledger.test.ts` — Windows `path.resolve` normalizes forward slashes to backslashes; test assertion uses forward-slash string (pre-existing assertion bug, not a code bug)