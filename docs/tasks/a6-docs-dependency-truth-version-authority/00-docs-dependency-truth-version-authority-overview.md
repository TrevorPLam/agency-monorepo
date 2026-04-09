# a6-docs-dependency-truth-version-authority: Dependency Truth and Version Authority

## Task Header

| Field | Value |
|---|---|
| **State** | `approved` — documentation work is authorized now |
| **Trigger** | Immediate control-plane work |
| **Minimum Consumers** | Repository-wide |
| **Dependencies** | `docs/DEPENDENCY.md`, `docs/DECISION-STATUS.md`, `docs/REPO-STATE.md`, all version-sensitive task families |
| **Exit Criteria** | The dependency-truth standard, task-family docs, and control-doc references all agree on one version-governance model |
| **Implementation Authority** | `docs/REPO-STATE.md` — documentation-only authority; dependency installation remains gated |
| **Version Authority** | `docs/DEPENDENCY.md` remains the operational source of exact pins |
| **Supersedes** | n/a |
| **Superseded by** | n/a |

## Cross-references

- `docs/standards/dependency-truth.md`
- `docs/DEPENDENCY.md`
- `docs/DECISION-STATUS.md`
- `docs/REPO-STATE.md`
- `docs/AGENTS.md`

## Purpose

This task family governs how version claims are classified, verified, updated, and referenced across the planning system.

It exists so task docs, handoff prompts, and architecture notes do not silently invent or override dependency truth.

## Owns

- The dependency-truth standard in `docs/standards/dependency-truth.md`
- Version-claim classification rules
- Source-precedence rules for dependency facts
- The stale-pin correction workflow
- Cross-links from version-sensitive task families back to one authority model

## Excludes

- Maintaining every exact version table directly in this task family
- Package installation work
- Root manifest creation

Exact pins remain in `docs/DEPENDENCY.md`.

## Deliverables

- This 7-file task family
- The owned standard at `docs/standards/dependency-truth.md`
- Updated references so version-sensitive docs point to the correct authority chain