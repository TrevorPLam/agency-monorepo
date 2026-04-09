# a6-docs-dependency-truth-version-authority: Specification

## Task Header

| Field | Value |
|---|---|
| **State** | `approved` — documentation work is authorized now |
| **Trigger** | Immediate control-plane work |
| **Minimum Consumers** | Repository-wide |
| **Dependencies** | `docs/DEPENDENCY.md`, `docs/DECISION-STATUS.md`, `docs/REPO-STATE.md`, all version-sensitive task families |
| **Exit Criteria** | Task docs, handoff prompts, and control docs use one version-governance model with no ambiguous “latest stable” shortcuts |
| **Implementation Authority** | `docs/REPO-STATE.md` — documentation-only authority |
| **Version Authority** | `docs/DEPENDENCY.md` remains the operational pin source |
| **Supersedes** | n/a |
| **Superseded by** | n/a |

## Cross-references

- Standard: `docs/standards/dependency-truth.md`
- Version tables: `docs/DEPENDENCY.md`
- State: `docs/REPO-STATE.md`
- Decisions: `docs/DECISION-STATUS.md`
- Architecture: `docs/ARCHITECTURE.md`

## Canonical outputs

This task family governs:

- `docs/standards/dependency-truth.md`
- The version-claim rules used by all task families
- The source-precedence model for dependency facts

## Source precedence

Use this precedence for dependency and version claims:

1. Official vendor docs, release notes, changelogs, or official package registries
2. Repository-approved ADRs or explicit dependency decisions
3. `docs/DEPENDENCY.md`
4. Task-family references
5. Generator examples or handoff prompts

Lower-priority sources must not silently override higher-priority sources.

## Classification rules

The owned standard must define and govern:

- Verified exact pins
- Approved ranges
- Tool-only latest usage
- Validation-pending placeholders

## Operational rule

`docs/DEPENDENCY.md` is the operational source of exact pins.

This task family and its owned standard do not replace `docs/DEPENDENCY.md`; they define how to interpret, verify, and update it safely.

## Explicit prohibitions

Do not allow:

- Runtime dependency pins justified only by “latest stable” language
- Task docs that invent exact versions not present in `docs/DEPENDENCY.md`
- Handoff prompts that override the dependency authority chain
- Generator examples that imply runtime `latest` usage

## Required downstream behavior

All version-sensitive task families must:

- Point to `docs/DEPENDENCY.md` for exact pins
- Point to this family or the owned standard for classification rules when needed
- Avoid duplicating version-governance prose unless a task-specific exception exists