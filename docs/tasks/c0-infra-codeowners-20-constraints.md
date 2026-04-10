# c0-infra-codeowners: Constraints

## Hard Constraints

- The repository must have a single root `.github/CODEOWNERS` file.
- CODEOWNERS patterns must use valid GitHub syntax only. Do not rely on unsupported glob behavior or negation.
- Prefer GitHub teams over individual usernames wherever a stable team exists.
- Every shared package domain and every infrastructure root path must have an explicit owner.
- Security-sensitive paths must include security-aware ownership, not only functional ownership.
- Broad fallback ownership must remain at the top or bottom in a way that does not shadow critical explicit rules.

## Scope Boundaries

- This task defines ownership mapping and review boundaries only.
- Branch protection configuration may be referenced here, but full branch/ruleset automation belongs to infrastructure workflow tasks.
- Do not invent client-specific ownership patterns unless the corresponding app namespace already exists.
- Do not encode temporary individual reviewer assignments as permanent repository policy unless there is no team alternative.

## Authoring Rules

- Prefer root-relative patterns such as `/packages/core/` over deep source-file ownership unless the area is truly sensitive.
- Keep overlapping rules intentional and documented.
- Document placeholder team handles clearly so implementation cannot mistake them for production-ready values.
- Keep docs, architecture, and workflow ownership aligned with the same platform and tech-lead boundaries described elsewhere in the repo.

## Validation Expectations

- The final CODEOWNERS file must cover the entire repo without orphaned high-risk paths.
- The ownership map must be explainable to reviewers in one pass.
- A sample PR touching package, app, docs, and workflow paths should request the expected owners.
