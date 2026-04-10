# c4-infra-release-workflow: Handoff Prompt

Implement the release workflow described in `01-infra-release-workflow-spec.md`.

## Goal

Add a root GitHub Actions workflow that consumes Changesets output and manages version PR or publish steps in a deterministic, auditable way.

## Required Outcomes

- `.github/workflows/release.yml` exists.
- The workflow is tied to the root Changesets configuration.
- Required tokens and secrets are documented.
- The workflow clearly distinguishes version PR behavior from publish behavior.

## Constraints

- Do not invent a second versioning system.
- Do not publish apps or docs as packages.
- Do not commit secrets or registry credentials.
- Keep the workflow safe when no releasable package changes exist.

## Validation

- Verify the workflow parses and triggers correctly.
- Verify version PR behavior with a sample changeset.
- Report whether publishing is active, deferred, or intentionally disabled.
