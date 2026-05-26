# AGENTS.md — specs/

## Purpose

Implementation specs for pi-goal features. Each spec is a time-stamped directory tracking a specific feature or refactor from conception to completion.

## Directory Convention

```
specs/
├── SPECS.yaml                    # Spec registry and status
├── YYYY-MM-DD-kebab-feature/    # Individual spec directories
│   ├── PRODUCT.md               # What to build, why
│   ├── TECH.md                  # How to build it (optional)
│   └── MILESTONES.md            # Implementation log
└── AGENTS.md                    # This file
```

## Naming Convention

Spec directories use `YYYY-MM-DD-kebab-feature` format:
- Date: When the spec was created
- Feature: Short kebab-case description

Examples:
- `2026-05-13-drafting-runtime-simplification`
- `2026-05-17-drafting-prompt-normalization`

## Spec Files

### PRODUCT.md (Required)

What to build and why:
- Feature description
- User stories / use cases
- Success criteria
- Boundaries and constraints
- Open questions

### TECH.md (Optional)

How to build it:
- Technical approach
- Data model changes
- API changes
- Migration strategy
- Dependencies

Write this after PRODUCT.md is stable and before implementation.

### MILESTONES.md (Required)

Implementation log:
- Milestones achieved
- Failed attempts
- Setbacks and fixes
- Validation notes
- Decisions made

This is a free-form log, not a strict schema. Update as work progresses.

## Spec Registry (SPECS.yaml)

```yaml
version: 1
focused: <spec-id>
status_vocabulary:
  - draft
  - ready_for_review
  - implementing
  - validating
  - audit_running
  - audit_failed
  - completed
  - archived
commands:
  focus: /spec-focus <spec-id>
  unfocus: /spec-unfocus
  status: /spec-status [spec-id]
  finish: /spec-finish [spec-id]
specs:
  - id: <spec-id>
    path: specs/<dir-name>
    title: <human title>
    status: <current status>
    focused: <boolean>
    last_audit: <timestamp or null>
    updated: <date>
```

## Opinionated Conventions

### Spec Lifecycle

1. **Create**: Make directory with PRODUCT.md
2. **Refine**: Clarify until ready for implementation
3. **Implement**: Write TECH.md if complex, then implement
4. **Validate**: Test against PRODUCT.md criteria
5. **Complete**: Mark done, archive

### Focus Rule

Only one spec can be `focused: true` at a time. The focused spec is the one currently being implemented.

### Update Order

When behavior changes mid-workflow:
1. Update `PRODUCT.md` first (what changed)
2. Update `TECH.md` second (if the approach changed)
3. Update implementation
4. Update `MILESTONES.md` (record the change)

### AGENTS.md Placement

The `AGENTS.md` for `specs/` lives in `specs/AGENTS.md`. The root `AGENTS.md` mentions the convention but doesn't duplicate details here.

## Cross-References

- `AGENTS.md` (root) — Mentions this convention
- `extensions/AGENTS.md` — Implementation details for specs

## Testing Notes

Specs are documentation, not code. Validation:
- PRODUCT.md has clear, testable criteria
- TECH.md is consistent with PRODUCT.md
- MILESTONES.md is up-to-date