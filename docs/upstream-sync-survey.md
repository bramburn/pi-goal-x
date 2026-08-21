# Upstream Sync Survey: pi-goal-x vs upstream/capyup/pi-goal

**Base:** `upstream/main` (ec2bcbe)  
**Head:** `origin/main` (7e1c5d6)  
**Gap:** 48 commits (802802f → 7e1c5d6)

---

## Summary by Type

| Type | Count | Key Theme |
|------|-------|-----------|
| test(e2e) | 11 | Subagent-based E2E test infrastructure |
| chore | 10 | Releases, bumps, rename, gallery metadata |
| fix(goal) | 3 | Auditor cancel flow, Esc key consumption, completion on abort |
| test(goal-auditor) | 2 | Abort-scenario tests |
| test(auditor) | 2 | Integration + unit tests for disabled/skipped |
| fix | 2 | Goal completion report, Esc-to-skip message |
| docs(milestones) | 2 | Milestone recordings |
| test(goal-policy) | 1 | Completion report validation |
| test | 1 | Handler-level update tests |
| fix(goal-auditor) | 1 | Post-prompt abort detection |
| fix(auditor) | 1 | Deferred archival timing |
| feat(widget) | 1 | Auditor progress display widget |
| feat(update_goal) | 1 | updatedObjective parameter for mid-flight sync |
| feat(ledger) | 1 | audit_skipped event type |
| feat(goal-auditor) | 1 | createSession factory + AbortSignal wiring |
| feat(goal) | 1 | Auditor lifecycle integration (disable/escape/widget) |
| feat(drafting) | 1 | Proposal-refinement language normalization |
| feat | 1 | Session window support (multiple goal sessions) |
| docs(readme) | 1 | README updates for auditor features |
| docs | 1 | Session window documentation |
| Add AGENTS.md | 1 | Architecture guides throughout repository |

---

## Summary by Feature Area

### Area 1: Auditor Lifecycle (16 commits)
**Theme:** Complete overhaul of the goal completion auditor — adding progress UI, Esc-to-skip, disabled bypass, abort detection, and deferred archival.

| Commit | Type | Description |
|--------|------|-------------|
| 802802f | feat(auditor) | Add disabled config flag + real-time progress callbacks |
| e0eaa6c | feat(ledger) | Add audit_skipped event type with reason + metadata |
| 2249166 | feat(widget) | Auditor progress display with spinner, tool tracking, skip hint |
| 5deba4c | feat(goal) | Integrate auditor lifecycle — disable, escape abort, lag fix, widget sequencing |
| 8db245c | docs(milestones) | Record audit lifecycle implementation |
| 94e82ec | docs(readme) | Document auditor progress widget, Esc-to-skip, disabled bypass, confirmBypassAuditor |
| 6f8b35f | feat(goal-auditor) | Add createSession factory + wire AbortSignal to session.abort() |
| 23a6b38 | fix(goal) | Consume Escape key during audit to prevent cascading goal pause |
| bbcbe2c | test(goal-auditor) | Abort-scenario tests for runGoalCompletionAuditor |
| 7381d59 | fix(goal) | Complete goal on audit abort instead of leaving it open |
| 97849cd | docs(milestones) | Record audit-cancellation-loop fix |
| c467011 | fix(goal-auditor) | Detect abort when session.prompt returns without throwing |
| ad35603 | test(goal-auditor) | Test for post-prompt abort detection |
| 43fe212 | fix(goal) | Include auditor output in completion report on approval |
| 8c7aee1 | test(goal-policy) | Validate completion report includes full auditor output |
| 2d06944 | fix | Correct Esc-to-skip auditor widget message to reflect actual behavior |
| 1cf8801 | fix | Expose skip once with triggerTurn, mirroring disabled-bypass path |

### Area 2: Deferred Goal Archival (7 commits)
**Theme:** Goals are now archived after the agent turn completes, not immediately on completion.

| Commit | Type | Description |
|--------|------|-------------|
| b036ff9 | fix(auditor) | Defer goal archival until after agent turn completes |
| 5ee4559 | chore | Bump to 0.8.2 for deferred goal archival |
| 1820c95 | test(auditor) | Integration tests for deferred archival lifecycle |
| 1d08a55 | chore | Update CHANGELOG for 0.8.2 |
| 1527684 | test(e2e) | Comprehensive coverage for deferred archival + objective update |
| 11ae637 | test(e2e) | Fix deferred archival assertion in real pi fork test |
| e5f1c10 | test(e2e) | Add filesystem check to deferred archival fork test |

### Area 3: Session Window Support (3 commits)
**Theme:** Multiple goal sessions can coexist; objective update can sync mid-flight.

| Commit | Type | Description |
|--------|------|-------------|
| bf562f3 | feat | Add session window support for multiple goal sessions |
| 7e1c5d6 | docs | Update all documentation for session window support |
| 7ca41eb | feat(update_goal) | Add updatedObjective parameter for mid-flight requirement sync |

### Area 4: E2E Test Infrastructure (11 commits)
**Theme:** Fully automated subagent-based E2E test runner that spawns real pi processes.

| Commit | Type | Description |
|--------|------|-------------|
| a85f3fb | test(e2e) | Subagent-based E2E test infrastructure with documentation |
| 942b562 | test(e2e) | Extension-level E2E test following pi-mcp-bridge pattern |
| b4ad70d | test(e2e) | Fully automated subagent e2e test runner |
| 94a1636 | test(e2e) | Real pi fork test spawns subagent with local dev extension |
| edcc58c | test(e2e) | Real pi fork test spawns subagent via /run e2e-test-runner |
| 434e330 | test(e2e) | Make fork assertions format-agnostic (verify behavior, not format) |
| 338cc40 | test(e2e) | Remove flaky AI-dependent fork test, keep deterministic mock-pi tests |
| 340bc5e | test(e2e) | Deterministic pi --mode json fork test with --append-system-prompt |

### Area 5: Architecture Documentation (4 commits)
**Theme:** AGENTS.md guides added throughout the repository.

| Commit | Type | Description |
|--------|------|-------------|
| 34d39cd | Add AGENTS.md | Architecture guides throughout repository |
| specs/AGENTS.md | new | Spec directory conventions + naming |
| tests/AGENTS.md | new | Test strategy + conventions |
| docs/AGENTS.md | new | Repo overview + navigation |

### Area 6: Drafting Prompt Normalization (1 commit)
**Theme:** Normalize proposal-refinement cycle language.

| Commit | Type | Description |
|--------|------|-------------|
| 131298d | feat(drafting) | Normalize proposal-refinement cycle language + C19 benchmark |

### Area 7: Chores / Meta (6 commits)
| Commit | Type | Description |
|--------|------|-------------|
| d18de8d | chore | Rename @capyup/pi-goal to pi-goal-x + document fork |
| aa0d97c | chore | Bump to 0.8.0 |
| d1d26dd | chore | Bump to 0.8.1 + audit log message clarifications |
| 0f18487 | chore | Bump to 0.7.1 |
| ec77f74 | chore | Add gallery image metadata + placeholder screenshot for pi.dev/packages |
| 65e7fd6 | chore | Update package-lock.json version metadata |
| 5bf7221 | chore(release) | Release version 0.7.0 |
| 9dcb749 | chore | Add changelog covering all releases |

---

## Files Changed (57 files, +6465 -109)

### New Files
- `specs/AGENTS.md`
- `specs/2026-05-17-drafting-prompt-normalization/MILESTONES.md`
- `specs/2026-05-17-drafting-prompt-normalization/PRODUCT.md`
- `specs/2026-05-17-drafting-prompt-normalization/TECH.md`
- `tests/AGENTS.md`
- `tests/e2e/e2e-test-runner.md`
- `tests/e2e/e2e-test.chain.md`
- `tests/e2e/extension.test.ts`
- `tests/e2e/run.ts`
- `tests/goal-auditor.test.ts` (expanded)
- `tests/goal-deferred-archival.test.ts` (new)
- `tests/goal-files.test.ts` (new)
- `tests/goal-ledger.test.ts` (new)
- `tests/goal-sessions.test.ts` (new)
- `tests/goal-update-objective.test.ts` (new)
- `tests/goal-policy.test.ts` (expanded)

### Modified Key Files
- `extensions/goal-auditor.ts` — auditor lifecycle + progress widget + disabled config
- `extensions/goal-core.ts` — Esc key consume, abort detection, completion on abort
- `extensions/goal-draft.ts` — updatedObjective parameter
- `extensions/goal-ledger.ts` — audit_skipped event type
- `extensions/widgets/goal-widget.ts` — auditor progress display
- `extensions/storage/goal-sessions.ts` — session window support
- `extensions/goal-pool.ts` — session window support
- `extensions/goal-policy.ts` — auditor output in completion report
- `AGENTS.md` — updated with fork context

---

## Notable Code Changes

### 1. Auditor Progress Widget (`extensions/widgets/goal-widget.ts`)
Added a new progress display showing spinner, tool count, and Esc-to-skip hint during auditor runs. Shows "Auditor reviewing…" with live tool-tracked progress.

### 2. Deferred Archival (`extensions/goal-auditor.ts`)
Archival now happens after the agent turn completes, not immediately on goal completion. Prevents race condition where archival fires before the agent's final turn output is processed.

### 3. updatedObjective Parameter (`extensions/goal-draft.ts`)
New `updatedObjective` field in `update_goal` that syncs mid-flight requirement changes into the active goal session.

### 4. createSession Factory + AbortSignal (`extensions/goal-auditor.ts`)
Auditor now creates its own session via factory, wiring AbortSignal so the auditor can be cancelled properly when the session aborts.

### 5. Session Window Support (`extensions/storage/goal-sessions.ts`, `extensions/goal-pool.ts`)
Multiple goal sessions can coexist; the storage layer tracks sessions by window/sessionId so goals from different windows don't conflict.

### 6. Esc Key Consume + Abort on Prompt Return (`extensions/goal-core.ts`)
Escape key is consumed during audit to prevent cascading goal pause. Abort detection also fires when `session.prompt` returns without throwing.

### 7. E2E Test Infrastructure (`tests/e2e/run.ts`, `tests/e2e/extension.test.ts`)
Fully automated subagent-based E2E test runner that spawns real `pi` processes, runs test chains, and validates filesystem state — mirroring the `pi-mcp-bridge` pattern.
