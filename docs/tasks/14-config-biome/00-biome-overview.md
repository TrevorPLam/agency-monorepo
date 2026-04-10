# 14-config-biome: Biome Configuration

## Purpose
Document the Biome evaluation lane without authorizing Biome as the repo's default linting or formatting tool.

## Dependencies
- Related to: `10-config-eslint`, `13-config-prettier`, `01-config-biome-migration`
- Consumed by: Evaluation work only until a decision update explicitly approves adoption

## Scope
This package provides:
- A sample shared Biome configuration for evaluation
- Benchmarking and comparison criteria against ESLint + Prettier
- Documentation of what Biome would need to replace before adoption
- A non-default lane that must not silently become canonical

## Evaluation Focus
- Benchmark lint and format performance against the current ESLint + Prettier baseline
- Verify boundary-enforcement parity before any adoption decision
- Confirm editor, CI, and migration costs before changing the default lane
- Keep evaluation artifacts isolated from the canonical toolchain

## Evaluation Strategy
Biome remains a deferred evaluation track:
1. Compare feature coverage with the canonical ESLint + Prettier lane
2. Validate a repo-approved version in `DEPENDENCY.md`
3. Record the decision in `DECISION-STATUS.md` before changing any default tooling lane

## Next Steps
1. Keep ESLint + Prettier as the only default lane
2. Use this family only for bounded evaluation work
3. Do not move new packages to Biome by default unless the decision docs change first
