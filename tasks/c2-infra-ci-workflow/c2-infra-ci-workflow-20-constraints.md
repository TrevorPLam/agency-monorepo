# c2-infra-ci-workflow: Constraints

## Hard Constraints

- CI must run on pull requests and pushes to `main`.
- CI must install dependencies with `pnpm install --frozen-lockfile`.
- CI must not require production secrets to lint, typecheck, build, or run the baseline test suite.
- CI must fail the workflow when build, lint, typecheck, or test fails.
- CI must keep release, deploy, and publish concerns out of the baseline workflow.

## Scope Boundaries

- This task defines the baseline quality gate only.
- Release automation belongs to release workflow tasks.
- Preview deploy logic belongs to preview/deploy tasks.
- Database migrations or destructive infra operations must not run automatically in this baseline CI workflow.

## Execution Rules

- Use pinned Node and pnpm versions from repository authority.
- Prefer deterministic Turborepo commands over ad hoc script chaining.
- Keep concurrency enabled so stale workflow runs cancel cleanly.
- Use mocked or safe CI-only environment values where tests require presence of env vars.
- Keep the changeset check informational unless the repo owner explicitly requires hard failure.

## Validation Expectations

- The workflow must be understandable from one file.
- Required secrets and variables must be documented.
- A PR touching shared packages must exercise the baseline quality gate without leaking credentials.
