# AGENTS.md — agents/

## Purpose

This directory contains agent configuration files that guide LLMs through the repository's structure, conventions, and patterns. These files follow the `AGENTS.md` naming convention (not `CLAUDE.md` or `.clauderc`).

## Files

```
agents/
└── AGENTS.md      # Root-level architecture guide for this repo
```

## Architecture Guide Content

The root `AGENTS.md` provides:

- **Repository overview**: Directory structure and purpose of each top-level module
- **Core architecture**: Runtime state machine, lifecycle states, goal concepts
- **Module responsibilities**: Table mapping modules to files and responsibilities
- **Data flow**: How state flows through the system
- **Disk layout**: Goal file format and location
- **Tool visibility**: Which tools are available in each state
- **Auto-continue**: Checkpoint and empty-turn behavior
- **Completion audit**: How goals are verified
- **Key conventions**: Naming, state management, path safety
- **Testing**: How to run tests
- **Spec convention**: How specs are organized

## Conventions

### AGENTS.md vs CLAUDE.md

Use `AGENTS.md` naming (pi-dev convention). This repo uses:
- `AGENTS.md` for pi-coding-agent guidance
- `agents/AGENTS.md` for cross-LLM architecture documentation

Do NOT use:
- `CLAUDE.md` (Anthropic-specific)
- `.clauderc` (Anthropic JSON config)

### Cross-References

From `agents/AGENTS.md`, reference:
- `extensions/AGENTS.md` for extension implementation details
- `experiments/AGENTS.md` for experiment harness
- `tests/AGENTS.md` for testing approach
- `specs/AGENTS.md` for spec conventions

### Scope

The root `agents/AGENTS.md` provides a **horizontal** view across all modules. Individual module AGENTS.md files provide **vertical** depth into their specific area. Don't duplicate content—cross-reference instead.

## Testing Notes

The `agents/AGENTS.md` file is documentation, not code. Validation strategy:
- Review against actual file structure
- Check cross-references point to existing files
- Verify conventions match implementation