# 14-config-biome: Implementation Constraints

## Purpose
Define hard boundaries for Biome evaluation so the repo can compare it against the canonical ESLint + Prettier lane without drifting into unapproved default adoption.

## Hard Constraints

### Version Management
- **Biome Version Lock**: Evaluation targets must use the Biome version approved in `DEPENDENCY.md`
- **No Manual Version Overrides**: Individual evaluation targets cannot override the approved Biome version in their own `package.json`
- **Catalog-Only Dependencies**: Use catalog references or the repo-approved evaluation pin rather than ad hoc version specifiers

### Configuration Extensibility
- **Base Configuration Only**: Evaluation targets should extend from the shared base configuration instead of inventing multiple Biome setups
- **No Extending Extends Chains**: Maximum of one level of extension (base → target overrides)
- **Shared `biome.json`**: Use `biome.json` consistently where Biome is being evaluated

### Performance Constraints
- **Measured Benchmarking**: Benchmark Biome against ESLint + Prettier on representative targets; do not treat marketing ratios as guaranteed outcomes
- **No Default Toolchain Switch**: Biome evaluation must not replace ESLint + Prettier as the default lane
- **Workspace-Aware**: Evaluation config must respect monorepo boundaries and workspace protocol

### Integration Requirements
- **Canonical Lane Preservation**: ESLint + Prettier must remain intact while Biome is evaluated
- **TypeScript Integration**: Evaluate TypeScript support against current strict type-checking expectations
- **IDE Integration**: VS Code Biome extension must be assessed before any adoption recommendation

## Forbidden Patterns

### ❌ Never Use These
```json
{
  "linter": {
    "rules": {
      "style": "off"  // Use Biome formatter instead
    }
  },
  "formatter": {
    "enabled": false  // Use Biome formatter
  }
}
```

### ❌ Avoid These Anti-Patterns
- **Multiple biome.json files**: Don't create `biome.dev.json`, `biome.build.json` - use single `biome.json`
- **Per-package biome.json**: Don't extend from other packages, only from `@agency/config-biome`
- **Ignoring Biome errors**: Never use `// biome-ignore` without filing a Biome issue or ADR
- **Performance Overrides**: Don't disable performance optimizations for convenience
- **Silent Adoption**: Don't switch root `lint` or `format` scripts to Biome during evaluation

## Compliance Requirements

### Linting Rules
- **Type Safety**: Assess whether Biome can cover required type-safety expectations without weakening the current lane
- **Import Boundaries**: Verify that boundary-enforcement needs can be matched before recommending adoption
- **Code Quality**: Compare rule coverage honestly rather than assuming parity

### Testing Requirements
- **Representative Targets**: Run Biome on realistic packages or fixtures that reflect actual repo needs
- **Baseline Comparison**: Compare output and ergonomics against the current ESLint + Prettier lane

## Exit Criteria

A Biome evaluation is complete when:
1. At least one approved evaluation target extends the shared Biome configuration
2. Benchmark results are recorded against the current lint/format baseline
3. Linting and boundary-enforcement gaps are documented honestly
4. IDE integration and workflow tradeoffs are assessed
5. Documentation is comprehensive and scoped to evaluation work
6. The repo's default ESLint + Prettier lane remains unchanged

## Review Process

1. **Architecture Review**: Verify evaluation work follows `ARCHITECTURE.md` dependency flow rules
2. **Version Audit**: Confirm evaluation targets use the Biome version approved in `DEPENDENCY.md`
3. **Performance Testing**: Benchmark Biome against the current ESLint + Prettier baseline
4. **IDE Validation**: Test the VS Code Biome extension in representative package scenarios
5. **Security Review**: Ensure Biome evaluation does not introduce unnecessary risk or workflow drift

## Consequences

This evaluation lane makes it possible to assess Biome rigorously while preserving the existing ESLint + Prettier defaults until a human decision explicitly changes them.
