# ADR 000: Title

## Status

Proposed

<!-- Allowed values:
- Proposed
- Accepted
- Deprecated
- Superseded by ADR-XXX
-->

## Date

YYYY-MM-DD

## Context

What is the issue we are seeing that motivates this decision?

Include:
- the current problem,
- why the problem matters,
- what repository areas are affected,
- why this decision is worth documenting at the architecture level.

Questions this section should answer:
- What is happening?
- Why is it a problem now?
- Why will it matter later if left ambiguous?
- Why is this decision hard or expensive to reverse?

## Decision

What change are we proposing or agreeing to implement?

State the decision clearly and directly.

Good:
- "Use pnpm workspaces with Turborepo for the launch-stage monorepo."
- "Group packages by business domain rather than by technical role."
- "Use Neon PostgreSQL with Drizzle ORM for operational data."

Bad:
- "We currently prefer..."
- "One option is..."
- "This might be revisited soon..."

If the decision includes constraints, list them explicitly.

## Consequences

What becomes easier or harder because of this decision?

This section should be honest.
Architectural decisions always create both benefits and tradeoffs.

### Positive

- What this decision simplifies
- What it enables
- What future work it makes easier
- What failure mode it prevents

### Negative

- What complexity it introduces
- What tradeoff is being accepted
- What limitation the team must live with
- What extra discipline or tooling is now required

### Neutral

- Follow-on tasks created by this decision
- Documentation or tooling updates required
- Areas that are not improved but must still adapt

## Alternatives Considered

What other options were evaluated, and why were they rejected?

For each alternative:
- name it clearly,
- explain why it was considered,
- explain why it was not chosen.

Example format:

### Alternative: Nx from day one

Why considered:
- stronger built-in module boundary enforcement
- richer project graph tooling

Why rejected:
- more complexity than needed at launch
- higher setup overhead for a small initial repo
- migration path exists later without restructuring

## References

List links to relevant internal documents, related ADRs, package guides, or notes.

Examples:
- `ARCHITECTURE.md`
- `DEPENDENCY.md`
- `docs/AGENTS.md`
- `docs/DECISION-STATUS.md`
- `docs/architecture/README.md`
- `docs/architecture/ADRs/README.md`
- related package guides
- related later ADRs

## Notes for authors

Use this template for all new ADRs.

Rules:
- One ADR per major decision.
- Keep the title specific.
- Keep the decision durable.
- Do not use this for minor implementation details.
- Do not rewrite accepted history silently.
- If the decision changes later, create a new ADR and supersede the old one.

## Quality checklist

Before submitting an ADR, confirm:

- [ ] The decision is architectural, not merely implementation detail
- [ ] The decision is stated directly in the Decision section
- [ ] The Context explains why this matters
- [ ] Positive and negative consequences are both documented
- [ ] Alternatives are named and explicitly rejected
- [ ] Status uses an allowed value
- [ ] Date is filled in
- [ ] The ADR has been added to `docs/architecture/ADRs/README.md`
- [ ] Any related docs that depend on this decision were updated

## Copy workflow

1. Copy this file to `NNN-topic-name.md`
2. Replace the title and date
3. Update the status
4. Fill in all sections
5. Add the ADR to the index in `docs/architecture/ADRs/README.md`
6. Cross-link any affected architecture or package docs