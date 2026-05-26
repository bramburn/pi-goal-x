# AGENTS.md — tests/

## Purpose

Fast unit and integration tests for the pi-goal extension. Tests validate individual modules and component interactions without spinning up full pi sessions.

## File Structure

```
tests/
├── goal-*.test.ts     # Unit tests per module
├── e2e/               # E2E test fixtures (optional)
```

## Test Files

| File | Module | What it Tests |
|------|--------|--------------|
| `goal-record.test.ts` | `goal-record.ts` | Types, creation, cloning, normalization |
| `goal-pool.test.ts` | `goal-pool.ts` | Focus resolution, pool helpers |
| `goal-core.test.ts` | `goal-core.ts` | Display formatting, truncation |
| `goal-draft.test.ts` | `goal-draft.ts` | Confirmation prompts, validation |
| `goal-policy.test.ts` | `goal-policy.ts` | Lifecycle validation, status transitions |
| `goal-auditor.test.ts` | `goal-auditor.ts` | Auditor config, decision parsing |
| `goal-questionnaire.test.ts` | `goal-questionnaire.ts` | Questionnaire normalization, UI flow |
| `goal-tool-names.test.ts` | `goal-tool-names.ts` | Tool constants, visibility lists |
| `goal-prompts.test.ts` | `prompts/goal-prompts.ts` | Prompt builders, content |
| `goal-files.test.ts` | `storage/goal-files.ts` | Storage I/O, path safety |
| `goal-widget.test.ts` | `widgets/goal-widget.ts` | Widget rendering, display states |
| `goal-notifications.test.ts` | `widgets/goal-notifications.ts` | Notification text |
| `goal-ledger.test.ts` | `goal-ledger.ts` | Event ledger, parsing |
| `goal-compaction.test.ts` | `goal-compaction.ts` | Compaction summary |
| `goal-e2e.test.ts` | — | End-to-end lifecycle |
| `goal-update-objective.test.ts` | — | Objective update flow |
| `goal-deferred-archival.test.ts` | — | Deferred archival behavior |

## Running Tests

```bash
npm test          # Run all tests
npm run check     # Type checking
```

## Opinionated Conventions

### Test Naming

Test files use `.test.ts` suffix:
- One test file per source module
- Filename matches source: `goal-pool.ts` → `goal-pool.test.ts`

### Test Structure

Each test file follows a common pattern:
1. Import the module under test
2. Set up fixtures/mocks
3. Execute the function/behavior
4. Assert expected outcomes

### Mock Strategy

- **Storage tests**: Use temp directories, real fs operations
- **UI tests**: Mock `theme` and `tui` interfaces
- **Prompt tests**: Snapshot or structured output comparison

### Fast Feedback

Unit tests should be:
- Fast (< 1s each)
- Deterministic (no flaky timing)
- Isolated (no cross-test state)

For slow/integration tests, use `experiments/` harness instead.

## Cross-References

- `extensions/AGENTS.md` — Source module architecture
- `experiments/AGENTS.md` — E2E experiments vs unit tests

## Testing Strategy

### Unit Tests (this directory)

- Test pure functions in isolation
- Mock external dependencies
- Validate error handling
- Cover edge cases

### Integration Tests

- Storage read/write cycles
- Goal lifecycle with disk persistence
- Focus resolution with real files

### Experiment Harness (`experiments/`)

- Full pi session lifecycle
- Real model calls
- Complex multi-turn scenarios