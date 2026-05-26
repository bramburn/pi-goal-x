# AGENTS.md

This is the root of the pi-goal repository. See `agents/AGENTS.md` for repository-wide architecture guidance.

## Repository Overview

pi-goal is a goal-oriented coding agent extension that provides:
- Confirmation drafting before work begins
- Lifecycle management (active, paused, complete, aborted)
- Independent completion auditing
- Multi-goal pool with session focus

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