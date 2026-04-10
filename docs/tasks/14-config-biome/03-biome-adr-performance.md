# 14-config-biome: ADR - Performance-Focused Tooling

## Status
**Draft** - Evaluation note only; not accepted as the repo default.

## Context
The repository currently standardizes on ESLint for linting and Prettier for formatting. Biome may be evaluated later, but no repo-wide adoption is approved in the current planning phase.

## Decision
Keep Biome as a documented evaluation lane only. Do not adopt it as the primary tooling solution unless the decision and repo-state docs are updated first.

### Rationale
1. The repo needs one canonical lane until there is explicit approval to change it
2. Performance claims alone are not enough without boundary-rule and workflow parity
3. Biome versioning is still evaluation-bound in `DEPENDENCY.md`
4. A parallel default would increase documentation and implementation drift
5. Any migration cost must be justified by real operational benefit

### Implementation Details
- No new packages use `@agency/config-biome` by default
- Evaluation remains isolated to tooling research or explicit pilot work
- ESLint + Prettier remain the canonical defaults until decision state changes
- Any future adoption requires an explicit update to `DECISION-STATUS.md` and `REPO-STATE.md`

## Migration Strategy
1. Validate feature parity and repo fit first
2. Record a decision update before any default-lane change
3. Only then define a migration sequence for real consumers

## Consequences
This keeps the tooling lane stable and prevents Biome from sounding canonical before the repo is ready to adopt it.
