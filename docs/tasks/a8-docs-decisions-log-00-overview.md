# a8-docs-decisions-log: Decision Log Ownership

## Task Header

| Field | Value |
|---|---|
| **State** | `approved` — documentation work is authorized now |
| **Trigger** | Immediate, while `docs/decisions/` remains part of the target architecture |
| **Minimum Consumers** | Repository-wide |
| **Dependencies** | `docs/DECISION-STATUS.md`, `a2-docs-adrs`, `docs/architecture/01-config-biome-migration-50-ref-quickstart.md`, `docs/AGENTS.md` |
| **Exit Criteria** | `docs/decisions/` has an explicit purpose, entry template, and promotion path to ADRs |
| **Implementation Authority** | `docs/REPO-STATE.md` — documentation-only authority |
| **Version Authority** | Repository governance only |
| **Supersedes** | n/a |
| **Superseded by** | n/a |

## Cross-references

- `docs/decisions/01-config-biome-migration-50-ref-quickstart.md`
- `docs/DECISION-STATUS.md`
- `docs/architecture/01-config-biome-migration-50-ref-quickstart.md`
- `docs/AGENTS.md`

## Purpose

This task family creates the missing owner for `docs/decisions/`.

It defines the lightweight decision-log layer between the status register and heavyweight ADRs so non-obvious technical choices stop disappearing into chat history.

## Owns

- The purpose and structure of `docs/decisions/`
- The decision-entry template
- Promotion rules from decision log to ADR
- Linking expectations from task families to decision notes

## Excludes

- Replacing `docs/DECISION-STATUS.md`
- Replacing ADRs
- Recording raw unresolved speculation as if it were a decision