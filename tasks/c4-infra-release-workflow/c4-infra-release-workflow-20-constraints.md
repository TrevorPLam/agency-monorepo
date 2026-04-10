# c4-infra-release-workflow: Constraints

## Hard Constraints

- The release workflow must depend on root Changesets configuration and must not introduce a parallel versioning system.
- Release automation must run from `main` only.
- Publishing credentials must come from GitHub secrets or equivalent secure repository settings, never from committed files.
- The workflow must be safe to no-op when no releasable package changes exist.
- Release automation must not publish apps, docs, or root-only changes as packages.

## Scope Boundaries

- This task covers the GitHub Actions workflow that consumes Changesets output.
- It does not define semver rules; that belongs to the Changesets task.
- It does not replace CI quality gates; CI must remain a prerequisite.
- It does not require public npm publishing if the repo still remains private-only.

## Workflow Rules

- Use pinned Node and pnpm versions from repository authority.
- Require a token with the minimum repo scope needed for PR creation or version commits.
- Keep release steps deterministic and auditable.
- Avoid auto-publishing if the repository is not yet in a real package-publishing phase.
- Prefer a version PR flow before any publish step when rollout risk is still high.

## Validation Expectations

- The workflow must create or update a predictable version PR.
- Publishing behavior must be clearly documented as enabled, disabled, or deferred.
- Secrets, tokens, and registry expectations must be explicitly listed.
