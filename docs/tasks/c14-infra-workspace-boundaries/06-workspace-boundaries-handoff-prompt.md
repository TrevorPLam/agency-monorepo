# c14-infra-workspace-boundaries: Handoff Prompt

Implement the workspace-boundary enforcement tool described in `01-workspace-boundaries-spec.md`.

## Goal

Add a deterministic boundary-check workflow that catches illegal imports and package-boundary violations beyond what ESLint alone covers.

## Required Outcomes

- A repository-local boundary checker exists.
- The checker validates public-export usage and dependency-direction rules.
- CI runs the boundary check.
- Violations report actionable file and rule details.

## Constraints

- Do not allow app-to-app imports.
- Do not allow packages to import from apps.
- Do not rely on noisy heuristics when explicit rule matching is possible.
- Keep fix-mode conservative and optional.

## Validation

- Verify the checker passes on a clean repo.
- Verify seeded violations fail with readable output.
- Report any remaining gaps between ESLint rules and boundary-check coverage.
