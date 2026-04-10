# a6-docs-dependency-truth-version-authority: Constraints

## Hard constraints

- Do not use `latest` for runtime dependencies.
- Do not record undocumented exact pins.
- Do not let task specs drift from `docs/DEPENDENCY.md`.
- Do not let generator examples become a shadow source of truth.
- Do not treat architecture prose as version authority.

## Documentation constraints

- Keep exact-pin tables in `docs/DEPENDENCY.md`.
- Keep classification and source-precedence logic in `docs/standards/dependency-truth.md`.
- Use the same four classification names everywhere.

## Review constraints

- Any new version claim must identify its source tier.
- Any stale pin correction must update `docs/DEPENDENCY.md` before dependent docs.
- If a dependency lane changes materially, update `docs/DECISION-STATUS.md` or an ADR before implementation work begins.