# c2-infra-ci-workflow: Handoff Prompt

Implement the baseline GitHub Actions CI workflow described in `01-infra-ci-workflow-spec.md`.

## Goal

Add a deterministic PR and `main` quality gate that installs dependencies, builds, lints, typechecks, and tests the repo using pinned Node, pnpm, and Turborepo versions.

## Required Outcomes

- `.github/workflows/ci.yml` exists and runs on PRs and pushes to `main`.
- The workflow uses pinned runtime/tool versions from repo authority.
- Build, lint, typecheck, and test steps fail the workflow when broken.
- Required cache and environment inputs are documented.

## Constraints

- Do not add deploy or release logic.
- Do not require production credentials.
- Keep destructive database or infra steps out of the baseline CI workflow.
- Keep the workflow readable and deterministic.

## Validation

- Confirm the workflow parses in GitHub Actions.
- Confirm a test PR runs the workflow.
- Report required secrets, variables, and any still-manual GitHub settings.
