# AGENTS.md — experiments/

## Purpose

End-to-end experiment harness for validating pi-goal runtime behavior with real pi sessions and model calls.

## File Structure

```
experiments/
├── README.md           # Overview, running experiments
├── PLAN.md            # Experiment roadmap
├── cases/             # Individual experiment cases
│   ├── INPUT.md       # Case input parameters
│   ├── BENCH.md       # Benchmark criteria (optional)
│   └── _smoke/        # Smoke test cases
├── harness/           # Experiment runner scripts
│   └── run.sh         # Main experiment runner
└── observations/      # Notes from experiment runs
```

## Key Concepts

### Experiment Case Structure

Each case directory contains:
- `INPUT.md`: Experiment parameters and expected outcomes
- Optional `BENCH.md`: Benchmark/grading criteria

Cases are named by pattern, e.g., `C1-vague-goal-set`, `C10-verify-command-gate`.

### Running Experiments

```bash
cd experiments
bash harness/run.sh <case-name> --count 3 --grade --no-smoke
```

### Observation Logs

After running experiments, results are logged to `observations/` for analysis and pattern detection.

## Current Validation Targets

The harness validates these behaviors:
- Draft-before-run goal creation (`/goals-set`, `/sisyphus-set`)
- User confirmation through `propose_goal_draft`
- Focused multi-goal execution
- Pause, abort, clear, resume, and tweak lifecycle
- Empty-turn guard for autonomous continuations
- Visible independent completion audit
- Post-compaction resync from durable goal files

## Removed Experiments

Cases targeting old designs are no longer part of the harness:
- Resource-limit lifecycle patterns
- Fixed-turn continuation guards
- Step-counter mechanisms

New cases should model the current runtime only.

## Opinionated Conventions

### Case Naming

Use `C<N>-<kebab-case-description>` format:
- `C1-vague-goal-set`
- `C10-verify-command-gate`
- `C16-compact-mid-sisyphus`

### Smoke Tests

`cases/_smoke/` contains quick sanity checks run before full experiment suites.

### Output Artifacts

`runs/` directory contains generated artifacts:
- Per-run logs
- Session transcripts
- Timing data

These are generated artifacts, not part of the package release.

## Cross-References

- `extensions/AGENTS.md` — Runtime implementation details
- `tests/AGENTS.md` — Unit/integration tests vs e2e experiments

## Testing Notes

Experiments are integration/e2e tests:
- Spin up real pi sessions
- Make real model calls
- Validate actual runtime behavior

Use unit tests (`tests/`) for fast feedback before running experiments.