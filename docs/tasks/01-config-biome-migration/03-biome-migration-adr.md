# ADR: Hybrid ESLint + Biome Migration Strategy

## Status

**Accepted**

## Context

The agency monorepo has established ESLint 9 with comprehensive rule coverage across 85+ packages. Migrating to Biome provides significant performance benefits (25-56x faster) but creates rule coverage gaps for specialized ESLint plugins that the agency relies on.

### Current State
- **ESLint**: 300+ rules, mature plugin ecosystem
- **Biome**: 423 rules, growing rapidly but gaps exist
- **Agency Dependencies**: React Hooks, Unicorn, custom agency plugins

## Decision

Use a **hybrid migration approach** where Biome handles formatting and core linting, while ESLint remains for specialized rules not yet covered by Biome.

## Rationale

### Why Hybrid Over Full Migration

1. **Rule Coverage Preservation**: Critical agency rules (React Hooks, Unicorn) have no Biome equivalent yet
2. **Risk Mitigation**: Gradual transition reduces risk of breaking existing functionality
3. **Performance Benefits**: Biome handles 80% of linting workload (formatting + core rules)
4. **Team Training**: Developers can learn Biome gradually while maintaining ESLint familiarity
5. **Rollback Safety**: ESLint remains available during transition period

### Performance Analysis

Based on 2026 benchmarks:
- **Large codebases (25K+ files)**: Biome 56x faster than ESLint
- **CI/CD pipelines**: 45.2s → 0.8s for full linting
- **Format-on-save**: Near-instant vs 2-3 seconds with Prettier
- **Memory usage**: Biome uses 50% less memory than ESLint + Prettier combo

## Consequences

### Positive

- **Immediate Performance Gains**: 25-56x improvement in linting speed
- **Developer Experience**: Format-on-save becomes near-instant
- **CI/CD Efficiency**: Significant pipeline time reduction
- **Gradual Learning**: Team can adopt Biome incrementally
- **Risk Mitigation**: ESLint safety net during transition

### Negative

- **Tool Complexity**: Two linting tools to maintain during migration
- **Configuration Overhead**: Need to maintain two configurations
- **Learning Curve**: Team must learn Biome rule naming (camelCase vs kebab-case)
- **Migration Duration**: 4 weeks total transition period

## Implementation Strategy

### Phase 1: Foundation (Week 1)
- Install Biome alongside ESLint
- Configure Biome for formatting and core rules
- Keep ESLint for React Hooks and Unicorn rules
- Set up hybrid CI configuration

### Phase 2: Core Migration (Week 2)
- Migrate core packages to Biome-first
- Retain ESLint for React Hooks validation
- Document rule mapping and workarounds

### Phase 3: UI Migration (Week 3)
- Migrate UI packages to Biome-first
- Add visual regression testing
- Update design system documentation

### Phase 4: Application Migration (Week 4)
- Migrate all applications to Biome-first
- Remove ESLint from final configurations
- Decommission ESLint dependencies

## Migration Timeline

| Week | Focus | Deliverable | Risk |
|-------|---------|------------|-------|
| 1 | Assessment & Setup | LOW |
| 2 | Core Packages | MEDIUM |
| 3 | UI Packages | MEDIUM |
| 4 | Applications & Cleanup | HIGH |

## Success Criteria

- [ ] All packages use Biome for formatting and 80%+ of linting
- [ ] ESLint retained only for rules not covered by Biome
- [ ] CI/CD performance improved by 25%+
- [ ] Team training completed with 90%+ adoption
- [ ] Zero production incidents during migration
- [ ] Documentation updated with hybrid examples

## References

- [Biome Migration Guide](https://biomejs.dev/guides/migrate-eslint-prettier/)
- [ESLint vs Biome Benchmarks](https://www.pkgpulse.com/blog/eslint-vs-biome-2026)
- [Biome Rule Mapping](https://biomejs.dev/linter/rules-sources)
