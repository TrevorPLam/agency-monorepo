# 15-config-vite: ADR - Performance-Focused Build Tooling

## Status
**Superseded** - Earlier draft overstated Vite's role in a Next-first repo.

## Context
The repository is Next-first, with Turbopack as the default build lane for Next.js apps. Vite remains relevant only for non-Next packages, standalone tools, or other explicitly approved edge cases.

## Decision
Do not standardize on Vite as the primary build tool for the repo. Keep it as a conditional option for non-Next consumers only.

### Rationale
1. Vite can be useful for non-Next consumers with real bundling needs
2. Next.js apps already have a default build lane through Turbopack
3. Treating Vite as universal would create unnecessary parallel-tooling ambiguity
4. The repo should not imply that Next.js apps use Vite via Turbopack
5. Conditional tooling reduces blast radius and documentation drift

### Implementation Details
- No new Next.js apps use `@agency/config-vite` by default
- Only non-Next consumers with explicit need may adopt this lane
- Vite is not a foundational repo package
- Any future adoption must stay scoped to the consumer that justifies it

## Migration Strategy
1. Keep Turbopack as the default for Next.js apps
2. Use Vite only where a non-Next consumer proves the need
3. Avoid repo-wide migration language unless the repo strategy changes

## Consequences
This keeps the repo's build-tool story aligned with its Next-first architecture while preserving Vite as a narrow, optional lane.
