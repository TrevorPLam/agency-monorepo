# a6-docs-dependency-truth-version-authority: Handoff Prompt

Use this prompt only for bounded dependency-governance work that already has human approval.

## Read first

1. `docs/tasks/a6-docs-dependency-truth-version-authority-00-overview.md`
2. `docs/tasks/a6-docs-dependency-truth-version-authority-10-spec.md`
3. `docs/standards/dependency-truth.md`
4. `docs/DEPENDENCY.md`
5. The task family or prompt you are updating

## Prompt

Update dependency-governance documentation without inventing versions or creating a second source of truth.

Requirements:

- Treat `docs/DEPENDENCY.md` as the operational source of exact pins.
- Use the four dependency-truth classifications exactly as documented.
- Do not introduce runtime `latest` usage.
- If a dependency lane or provider choice changes materially, update the relevant decision record instead of hiding the change inside a task spec.
- Keep edits scoped to the documented authority chain.

