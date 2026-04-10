# 14-config-biome: QA Checklist

## Purpose
Comprehensive quality-assurance checklist for bounded Biome evaluation and validation.

## Pre-Implementation Checklist

### Configuration Validation
- [ ] An approved evaluation target has been identified and documented
- [ ] The evaluation target extends `@agency/config-biome` base configuration
- [ ] The evaluation target does not override the approved Biome version
- [ ] Biome configuration uses `biome.json` consistently for evaluation work
- [ ] Evaluation scripts are opt-in and do not replace default lint/format commands

### Performance Validation
- [ ] Performance is benchmarked against the current ESLint + Prettier baseline
- [ ] Any unified-tooling benefit is treated as a hypothesis, not a guaranteed outcome
- [ ] Workspace-aware configuration respects monorepo boundaries
- [ ] Memory usage stays within acceptable limits

### Integration Requirements
- [ ] ESLint + Prettier remain the canonical default lane
- [ ] TypeScript integration is evaluated honestly
- [ ] IDE integration works on the evaluation target
- [ ] VS Code Biome extension is configured and tested where needed

## Post-Implementation Checklist

### Performance Verification
- [ ] Linting speed comparison against ESLint is documented
- [ ] Workflow impact is documented, including any regressions
- [ ] Memory usage is stable during evaluation runs
- [ ] No hidden regressions were introduced by the evaluation setup

### Functionality Testing
- [ ] Biome rules run correctly on the evaluation target
- [ ] Formatting output is comparable to the current lane where relevant
- [ ] Import boundary enforcement gaps are identified explicitly
- [ ] Type-checking expectations are compared against the current workflow

### Migration Validation
- [ ] The evaluation path is scoped and repeatable
- [ ] Rollback or cleanup steps are documented
- [ ] Documentation covers evaluation scenarios and non-goals
- [ ] No default-lane migration was implied accidentally

### IDE Experience Validation
- [ ] VS Code Biome extension works across workspace
- [ ] IntelliSense provides proper completions
- [ ] Error messages are clear and actionable
- [ ] Language server performance is acceptable

## Exit Criteria

A Biome evaluation is complete when:
1. At least one approved evaluation target uses the shared Biome configuration
2. Performance comparisons are measurable and clearly documented
3. ESLint + Prettier remain the default lane
4. IDE integration and workflow tradeoffs are understood
5. Documentation is comprehensive and scoped to evaluation work
6. Any future migration path is clearly separated from current approval
7. Quality gates meet or exceed the evaluation target's baseline measurements

## Rollback Plan

If issues are discovered during implementation:
1. Revert the evaluation target to its prior workflow if needed
2. Document performance impact and evaluation blockers
3. Address the root cause before expanding evaluation scope
4. Keep the canonical ESLint + Prettier lane unchanged

## Success Metrics

Target improvements to validate:
- **Benchmark delta** compared to the current ESLint baseline
- **Potential tooling simplification** only if parity is proven
- **Workflow impact** on build and editor behavior
- **Memory usage** stability during evaluation
- **Developer ergonomics** on representative targets
