# c5-infra-preview-deploy: Constraints

## Hard Constraints

- Preview deployments must only run for apps that actually need visual or environment review.
- Preview automation must not assume every PR deploys every app.
- Provider credentials must be injected through secure CI secrets only.
- Preview environments must not point at production-only secrets or destructive infrastructure by default.
- The workflow must make it obvious which app was deployed and which preview URL belongs to which PR.

## Scope Boundaries

- This task covers preview deployment workflow behavior only.
- It does not replace CI.
- It does not define permanent hosting architecture for every app.
- It does not require preview deploys for packages or docs with no deployable runtime.

## Execution Rules

- Prefer affected-app or label-gated deployment over blanket deployment.
- Keep preview comments idempotent so PR threads do not accumulate noisy duplicate comments.
- Use short-lived preview artifacts and environments where possible.
- Ensure provider-specific project IDs or org IDs remain outside committed files.

## Validation Expectations

- A test PR should produce the expected preview URL comment.
- Non-target apps should not deploy unnecessarily.
- Required provider configuration must be documented by app.
