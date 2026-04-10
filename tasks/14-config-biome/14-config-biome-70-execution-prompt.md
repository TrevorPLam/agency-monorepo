# 14-config-biome: Handoff Prompt

## Purpose
AI agent instructions for running a bounded Biome evaluation without changing the repo's default linting or formatting lane.

## Context
You are evaluating Biome in a monorepo that currently uses:
- pnpm 10.33.0 with workspace catalog
- TypeScript 6.0.0 with Project References
- Turborepo 2.9.5 with tasks-based configuration
- ESLint + Prettier as the canonical linting and formatting lane
- `DEPENDENCY.md` and `DECISION-STATUS.md` as the authority for any tooling-lane change

## Implementation Instructions

### Primary Goal
Create isolated Biome evaluation artifacts that:
1. Benchmark Biome against the current ESLint + Prettier baseline
2. Verify rule coverage and boundary-enforcement parity
3. Capture editor, CI, and migration costs before any adoption decision
4. Avoid changing default root or package scripts to Biome
5. Produce evidence for a later decision review rather than silently changing the toolchain

### Key Requirements

#### 1. Evaluation Configuration (`biome.json`)
- Use a repo-approved Biome version from `DEPENDENCY.md`
- Keep the configuration isolated to evaluation targets
- Do not replace canonical ESLint or Prettier configs during evaluation

#### 2. Isolated Integration
- Use opt-in evaluation scripts such as `lint:biome:eval` and `format:biome:eval`
- Limit evaluation to approved packages, fixtures, or benchmark targets
- Keep default `lint`, `format`, and CI commands on ESLint + Prettier

#### 3. Validation Requirements
- Compare lint and format output with the canonical lane
- Capture missing rules, workflow gaps, and migration blockers
- Document whether editor and CI ergonomics are acceptable

### Critical Implementation Details

#### Package Configuration
```json
{
  "devDependencies": {
    "@agency/config-biome": "workspace:*"
  },
  "scripts": {
    "lint:biome:eval": "biome check .",
    "format:biome:eval": "biome format .",
    "lint:biome:fix:eval": "biome check . --apply"
  }
}
```

#### Root Integration
```json
{
  "scripts": {
    "lint:biome:eval": "pnpm --filter <evaluation-target> lint:biome:eval",
    "format:biome:eval": "pnpm --filter <evaluation-target> format:biome:eval"
  }
}
```

### Evaluation Targets
- **Benchmarking**: Measure runtime against the current ESLint + Prettier baseline
- **Parity**: Verify whether Biome can match required rule and boundary coverage
- **Memory / CI**: Confirm the evaluation lane behaves acceptably in editor and automation
- **Migration Cost**: Identify what would need to change before any wider adoption

### Evaluation Strategy
1. **Phase 1**: Add isolated evaluation config and scripts
2. **Phase 2**: Benchmark representative targets and record gaps
3. **Phase 3**: Update decision docs only if evaluation results justify wider adoption

### Quality Gates
- Biome evaluation must not change the repo's default lint or format commands
- Benchmark and parity findings must be documented
- Any gaps or blockers must be recorded before recommending adoption
- Canonical ESLint + Prettier workflows must remain intact throughout evaluation

### Testing Strategy
1. Benchmark Biome against ESLint + Prettier on representative targets
2. Compare lint and format output on at least one realistic package
3. Test IDE integration with the VS Code Biome extension
4. Validate opt-in evaluation commands in CI or local automation

## Success Criteria
Implementation is complete when:
1. Biome evaluation artifacts exist without changing repo defaults
2. Benchmark and parity findings are documented
3. Any evaluation package uses Biome through opt-in scripts only
4. Adoption blockers or required follow-up work are explicit
5. Documentation points back to the decision and version authorities

## Common Pitfalls to Avoid

- ❌ **Silent Default Switches**: Don't replace default `lint` or `format` scripts with Biome
- ❌ **Unapproved Version Drift**: Don't install arbitrary Biome versions outside `DEPENDENCY.md`
- ❌ **Workspace Drift**: Don't spread evaluation config across packages that were not approved for the experiment
- ❌ **Premature Migration**: Don't remove ESLint or Prettier before a decision update explicitly approves it

## Next Steps After Implementation
1. Record benchmark and parity findings in the relevant decision docs
2. Keep ESLint + Prettier as the only default lane unless the decision docs change
3. Add migration planning only if evaluation results justify it
4. Document any required rule-gap, CI, or editor follow-up work

Remember: this task exists to evaluate Biome, not to authorize a repo-wide tooling switch.
