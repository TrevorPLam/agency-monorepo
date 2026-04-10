# 15-config-vite: QA Checklist

## Purpose
Comprehensive quality-assurance checklist for conditional Vite adoption in an approved non-Next consumer.

## Pre-Implementation Checklist

### Configuration Validation
- [ ] An approved non-Next consumer has been identified and documented
- [ ] The target consumer extends `@agency/config-vite` base configuration
- [ ] The target consumer does not override the approved Vite version from the workspace catalog
- [ ] Vite configuration uses `vite.config.ts` consistently for the target consumer
- [ ] Performance-oriented settings are enabled where they benefit the target consumer
- [ ] Native ESM support is configured appropriately

### Build Performance Validation
- [ ] A baseline exists for the current build or dev workflow being replaced
- [ ] Native ESM bundling is enabled
- [ ] Tree shaking works correctly
- [ ] HMR speed is acceptable for the target consumer's workflow
- [ ] Build artifacts are optimized

### Integration Requirements
- [ ] No standard Next.js app has been moved to Vite
- [ ] TypeScript integration is fully functional
- [ ] Required plugins work correctly
- [ ] Development server performance is appropriate for the target consumer

### Development Experience Validation
- [ ] HMR works where applicable
- [ ] Development server starts quickly
- [ ] Error overlay is functional
- [ ] Source maps are generated correctly

## Post-Implementation Checklist

### Performance Verification
- [ ] Target-consumer build speed improvement is confirmed
- [ ] Native ESM benefits are realized
- [ ] HMR latency is acceptable
- [ ] Bundle sizes are reasonable for the consumer's output
- [ ] Memory usage is stable during dev/build workflows

### Functionality Testing
- [ ] Required Vite plugins work correctly
- [ ] The build process produces optimized output
- [ ] The development server provides the intended experience
- [ ] Existing non-Vite workspace flows remain unaffected

### Migration Validation
- [ ] The scoped migration path is functional for the approved consumer
- [ ] Legacy build configuration is preserved until the migration is validated
- [ ] Rollback steps are documented and tested or reviewed

### IDE Experience Validation
- [ ] VS Code tooling works for the target consumer
- [ ] IntelliSense provides proper completions
- [ ] Error messages are clear and actionable
- [ ] Language-server performance is acceptable

## Exit Criteria

A Vite configuration implementation is complete when:
1. At least one approved non-Next consumer uses unified Vite configuration from the workspace catalog
2. Performance improvements are measurable and significant for that consumer
3. Next.js applications remain on Turbopack by default
4. TypeScript integration provides full type safety
5. Documentation is comprehensive and scoped correctly
6. The migration path is clear and functional for additional approved non-Next consumers
7. Quality gates meet or exceed the target consumer's baseline measurements

## Rollback Plan

If issues are discovered during implementation:
1. Revert the approved consumer to its previous build configuration
2. Document performance impact and migration blockers
3. Address the root cause before retrying the scoped migration
4. Do not widen Vite adoption until the current consumer is stable

## Success Metrics

Target improvements to validate:
- **Faster builds** compared to the target consumer's prior baseline
- **Acceptable HMR latency** for dev-server workflows
- **Native ESM** benefits fully realized
- **Optimized bundle output** where bundle analysis matters
- **Stable memory usage** during local development and build runs
- **Better developer experience** for the approved consumer without changing repo-wide defaults
