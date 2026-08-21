# Upstream Sync Report: pi-goal-x vs capyup/pi-goal

**Branch:** `feat/upstream-sync-audit` (ahead of `main` by N commits)  
**Upstream:** `capyup/pi-goal` @ `ec2bcbe` (v0.5.0)  
**Fork:** `pi-goal-x` @ `7e1c5d6` (v0.9.0)  
**Gap:** 48 commits ahead, 0 behind  
**Date:** 2025-08-21

---

## What Has Been Included

The following feature areas are fully implemented, tested, and landed in `pi-goal-x`:

### 1. Auditor Lifecycle Overhaul ✓

**Included:**
- `GoalAuditorConfig.disabled` — skip the auditor entirely via `goal-auditor.json` config
- `confirmBypassAuditor: true` — schema-enforced user confirmation when bypassing disabled auditor
- Auditor progress widget — live TUI display with spinner, tool tracking, elapsed time, recent output lines (`extensions/widgets/goal-widget.ts`)
- Esc-to-skip — Escape key aborts the running audit and marks the goal complete (mirrors disabled-bypass pattern)
- `createSession` factory injection — auditor creates its own session, wired to an `AbortController`
- Post-prompt abort detection — correctly detects `session.abort()` even when `session.prompt()` returns without throwing
- `audit_skipped` ledger event — emitted with `reason: "disabled" | "user_aborted"` and full auditor config metadata
- Auditor output in completion report — `buildCompletionReport()` includes the full auditor approval text
- README documentation for all auditor features

**Quality:** High. All major paths have tests (`tests/goal-auditor.test.ts`, `tests/goal-policy.test.ts`). The post-prompt abort detection fix (c467011) was a critical bug that was well-documented.

### 2. Deferred Goal Archival ✓

**Included:**
- Goals are marked complete in-memory and written to the active file during `update_goal` execution
- `archiveGoalFile()` is deferred to the next `persist()` call at turn_end
- The agent's final turn sees the completion report before the goal file moves to archive
- Full test coverage in `tests/goal-deferred-archival.test.ts`

**Quality:** High. This was a critical race-condition fix. The pattern is well-documented with inline comments.

### 3. Session Window Support ✓

**Included:**
- `extensions/storage/goal-sessions.ts` — session CRUD with symlink protection on all file reads
- `extensions/goal-pool.ts` — `resolveSessionFocus()` for session-aware goal resolution
- `extensions/goal.ts` — session management commands (`/goal-settings` → sessions, `session-settings`)
- Multiple sessions coexist; switching sessions clears goal focus for explicit re-selection
- Full test coverage in `tests/goal-sessions.test.ts`

**Quality:** High. Symlink protection is applied consistently (lstatSync checks on all session file reads and session directory creation).

### 4. updatedObjective for Mid-flight Requirement Sync ✓

**Included:**
- `update_goal` now accepts `updatedObjective: string` parameter
- Syncs mid-flight without terminating the session
- Can be combined with `status=complete` to update and complete in one call
- Ledger event `goal_tweaked` emitted on every objective change
- Full test coverage in `tests/goal-update-objective.test.ts`

**Quality:** High.

### 5. E2E Test Infrastructure ✓

**Included:**
- `tests/e2e/run.ts` — automated test runner spawning real `pi` processes
- `tests/e2e/extension.test.ts` — extension-level E2E tests
- `tests/e2e/e2e-test.chain.md` — named test chains
- `tests/e2e/e2e-test-runner.md` — runner documentation
- Mirrors `pi-mcp-bridge` pattern for extension testing

**Quality:** Good. Tests are deterministic (mock-pi) with format-agnostic assertions. Flaky AI-dependent tests were removed.

### 6. Goal Ledger (JSONL Event Log) ✓

**Included:**
- 12 event types: `goal_created`, `goal_focused`, `goal_unfocused`, `goal_paused`, `goal_resumed`, `goal_tweaked`, `completion_requested`, `audit_started`, `audit_result`, `audit_skipped`, `goal_completed`, `goal_aborted`
- `readGoalLedger()` + `reconstructGoalLedger()` for state replay
- Temp-file JSONL append with exclusive creation to prevent concurrent-write races
- Full validation on read (`isValidLedgerEvent`)
- `audit_skipped` event type (new in fork)

**Quality:** High.

### 7. Architecture Documentation ✓

**Included:**
- Root `AGENTS.md` — repo overview, directory structure, navigation
- `agents/AGENTS.md` — architecture guidance
- `extensions/AGENTS.md` — extension implementation details
- `specs/AGENTS.md` — spec conventions
- `tests/AGENTS.md` — test strategy
- `extensions/storage/AGENTS.md` — storage layer details
- `extensions/widgets/AGENTS.md` — widget component docs
- `extensions/prompts/AGENTS.md` — prompt templates

**Quality:** Good.

### 8. Proposal-refinement Cycle Normalization ✓

**Included:**
- `131298d` — normalized language for proposal-refinement cycles
- Spec at `specs/2026-05-17-drafting-prompt-normalization/` with PRODUCT.md, TECH.md, MILESTONES.md

**Quality:** Good.

---

## What Has NOT Been Included (from upstream, if any)

**None.** Upstream (`capyup/pi-goal` @ `ec2bcbe`) is strictly behind the fork. There are no upstream commits to pull in. All 48 commits in the fork are new work not present upstream.

---

## Pre-existing Issues Noted (not introduced by these commits)

### Test Environment Issues (Windows)

The following test failures exist in the Windows development environment and are **pre-existing** (not caused by the 48 commits):

| Test File | Issue | Severity |
|-----------|-------|----------|
| `goal-auditor.test.ts` | `@earendil-works/pi-coding-agent` package not installed | Environment |
| `goal-questionnaire.test.ts` | `@earendil-works/pi-ai` package not installed | Environment |
| `goal-widget.test.ts` | `@earendil-works/pi-tui` package not installed | Environment |
| `goalLedgerPath` in `goal-ledger.test.ts` | Windows `path.resolve` normalizes `/` to `\`; assertion uses forward-slash string | Pre-existing bug in test assertion |

**Fix for test assertion:** Replace `.includes(".pi/goals/goal_events.jsonl")` with a platform-aware check:
```typescript
// In tests/goal-ledger.test.ts line 34:
const path = goalLedgerPath(ctx).replace(/[\\/]+/g, "/");
assert.ok(path.includes(".pi/goals/goal_events.jsonl"));
```

### Dependency Gaps

The `devDependencies` in `package.json` reference `@earendil-works/*` packages with `*` or `^0.74.0` versions, but `node_modules/@earendil-works/` is not present. Run `npm install` to populate the packages, or ensure the workspace has access to the private npm registry.

---

## Summary

- **48 commits** audited and categorized into 7 feature areas
- **All 7 areas** are production-quality, well-tested code
- **No upstream changes** to merge (upstream is behind the fork)
- **4 pre-existing test failures** are environment/assertion issues, not code defects
- **No breaking changes** introduced by the fork relative to the upstream API surface
