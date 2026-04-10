# c6-infra-changesets: Constraints

## Hard Constraints

- Changesets configuration must live at the repository root under `.changeset/`.
- Package versioning rules must flow through one canonical Changesets config.
- Do not add package-local versioning systems or parallel release metadata.
- Changesets must describe shared package impact, not app-only or documentation-only churn.
- Release publishing remains outside this task unless another task explicitly wires it.

## Scope Boundaries

- This task configures Changesets and contributor guidance.
- Automated release PR creation belongs to release workflow tasks.
- Publishing packages to registries is out of scope here.
- App-only changes, docs-only changes, and root governance changes should not require a changeset unless they affect package consumers.

## Authoring Rules

- Keep `baseBranch` aligned with `main`.
- Keep `updateInternalDependencies` conservative and explicit.
- Document when contributors may skip a changeset.
- Require clear semver reasoning for patch, minor, and major changes.

## Validation Expectations

- `config.json` must match the intended monorepo model.
- Contributors must have a repo-local README explaining how to create and review changesets.
- A sample changeset flow should be easy to test without publishing anything.
