# a8-docs-decisions-log: Specification

## Task Header

| Field | Value |
|---|---|
| **State** | `approved` — documentation work is authorized now |
| **Trigger** | Immediate, while `docs/decisions/` remains part of the target architecture |
| **Minimum Consumers** | Repository-wide |
| **Dependencies** | `docs/DECISION-STATUS.md`, `a2-docs-adrs`, `docs/architecture/README.md`, `docs/AGENTS.md` |
| **Exit Criteria** | The repo has a clear separation between status register, decision log, and ADRs |
| **Implementation Authority** | `docs/REPO-STATE.md` — documentation-only authority |
| **Version Authority** | `docs/DEPENDENCY.md` — repository version-governance baseline for decision logging |
| **Supersedes** | n/a |
| **Superseded by** | n/a |

## Cross-references

- Owned directory: `docs/decisions/`
- Status register: `docs/DECISION-STATUS.md`
- ADRs: `docs/architecture/ADRs/`

## Canonical outputs

This task family governs:

- `docs/decisions/README.md`
- The lightweight decision-entry template
- Linking rules from task families to decision-log entries when needed

## Required definitions

The owned docs must define:

- What belongs in the decision log
- What does not belong there
- The difference between decision status, decision log, and ADR
- The template for a decision entry
- Review and revisit expectations
- Promotion criteria to ADRs
- Archiving rules

## Explicit prohibitions

Do not allow `docs/decisions/` to become:

- A duplicate of the ADR directory
- A shadow replacement for `docs/DECISION-STATUS.md`
- A dumping ground for unresolved speculation
- A way to sneak architecture changes through without status alignment