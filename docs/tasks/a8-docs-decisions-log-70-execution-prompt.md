# a8-docs-decisions-log: Handoff Prompt

Use this prompt only for bounded decision-documentation work that already has human approval.

## Read first

1. `docs/tasks/a8-docs-decisions-log-00-overview.md`
2. `docs/tasks/a8-docs-decisions-log-10-spec.md`
3. `docs/decisions/01-config-biome-migration-50-ref-quickstart.md`
4. `docs/DECISION-STATUS.md`
5. Any related ADR or task family

## Prompt

Record or update a lightweight repository decision without replacing the status register or ADR system.

Requirements:

- Keep the entry scoped to one actual decision.
- Include owner, date, consequences, and review timing.
- Update `docs/DECISION-STATUS.md` if the decision status changes.
- Promote to an ADR if the choice is durable, high-blast-radius, or hard to reverse.

