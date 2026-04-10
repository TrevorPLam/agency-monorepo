# c5-infra-preview-deploy: Handoff Prompt

Implement the preview deployment workflow described in `c5-infra-preview-deploy-10-spec.md`.

## Goal

Add a PR-driven preview deployment workflow that deploys only the apps that need preview URLs and reports those URLs back to the pull request.

## Required Outcomes

- `.github/workflows/preview.yml` exists.
- Preview deploys are scoped to affected or explicitly labeled apps.
- PR comments show the resulting preview URLs.
- Provider tokens, org IDs, and project IDs are documented as required configuration.

## Constraints

- Do not deploy every app on every PR.
- Do not use production-only secrets by default.
- Do not replace CI quality gates with preview deploy status.
- Keep provider-specific setup out of committed secrets.

## Validation

- Verify a test PR produces the expected preview behavior.
- Verify the PR comment updates cleanly.
- Report any app-specific provider setup still required.
