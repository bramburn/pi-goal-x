# AGENTS.md — docs/

## Purpose

Architecture documents, design notes, and PRDs for pi-goal. These files capture design decisions and rationale that may not be obvious from code.

## File Structure

```
docs/
├── architecture.md        # Shipping extension architecture (read-only reference)
├── agent-flow-design.md   # Agent flow patterns
├── agentic-runtime-prd.md # Runtime product requirements
├── goal-ts-refactor-test-strategy.md  # Refactor testing approach
└── pi-autoresearch-survey.md          # Research survey (optional)
```

## Key Documents

### architecture.md

The **authoritative reference** for how the extension is implemented:
- Runtime shape and state
- Module responsibilities
- Lifecycle flow
- Disk format
- Completion audit
- Testing approach

This is the doc agents should read to understand the system.

### agentic-runtime-prd.md

Product requirements for the runtime:
- Feature specifications
- User stories
- Acceptance criteria
- Design decisions

### agent-flow-design.md

Patterns for agent interaction:
- Goal creation flow
- Confirmation patterns
- Lifecycle transitions
- Tool visibility rules

### goal-ts-refactor-test-strategy.md

Testing approach for refactoring:
- Migration strategy
- Backward compatibility
- Regression prevention

## Opinionated Conventions

### Doc Stability

`docs/architecture.md` is a **read-only reference**. It describes shipped behavior, not aspirational design. Update it only when behavior actually changes.

### Design Docs vs Specs

| docs/ | specs/ |
|-------|--------|
| Design rationale, trade-offs | Concrete implementation specs |
| May be informal | Structured (PRODUCT.md, TECH.md) |
| Historical context | Future work tracking |

### PRD vs SPEC

- **PRD (this directory)**: What the runtime should do, why
- **SPEC (specs/)**: How to implement it, when it's done

## Cross-References

- `extensions/AGENTS.md` — Module-level implementation details
- `specs/AGENTS.md` — Spec directory conventions

## Testing Notes

Docs don't have tests. Validation:
- Review against implementation in `extensions/`
- Check architecture.md accuracy when code changes
- Verify agent-flow-design matches prompt builders