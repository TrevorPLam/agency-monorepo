# Core Testing: Quality Assurance Checklist

## Implementation Verification

### Framework Compliance
- [ ] All utilities are framework-agnostic (work with Vitest, Jest)
- [ ] No test runner API dependencies in base utilities
- [ ] Vitest 4.x patterns used correctly
- [ ] Custom matchers properly extended

### Fixture Quality
- [ ] All fixtures use `crypto.randomUUID()` for IDs
- [ ] Sensible defaults provided for all required fields
- [ ] Partial override pattern supported
- [ ] Type-specific factories for discriminated unions
- [ ] Array creation utilities (`createMany`) implemented

### Mock Utilities
- [ ] Mock fetch supports configurable response/error/delay
- [ ] localStorage mock properly clears between tests
- [ ] All mocks have proper TypeScript types
- [ ] Mock state is isolated (no cross-test pollution)

### Performance Testing
- [ ] Benchmark utilities support Vitest 4.x bench mode
- [ ] Performance thresholds documented
- [ ] Warmup iterations configurable
- [ ] Results include min/max/average times

### Type Safety
- [ ] All exports properly typed
- [ ] Fixture factories use generics correctly
- [ ] No `any` types in public API
- [ ] Type inference works for consumers

### Testing Coverage
- [ ] Unit tests for all fixture factories
- [ ] Mock utility tests verify isolation
- [ ] Performance tests run reliably
- [ ] Custom matcher tests verify behavior

### Documentation
- [ ] README explains all fixtures
- [ ] Usage examples for each pattern
- [ ] Migration guide from Jest (if applicable)
- [ ] ADR documents Vitest 4.x decision

### Governance Compliance
- [ ] Dependencies limited to `@agency/core-types`
- [ ] No circular dependencies
- [ ] Export structure supports tree-shaking
- [ ] `sideEffects: false` in package.json

## Release Readiness

### Critical Path Items
- [ ] Vitest 4.x integration verified
- [ ] Custom matchers implemented and tested
- [ ] Fixture factories cover all core-types
- [ ] Mock utilities tested in real apps
- [ ] Documentation complete

### Blocking Issues
**None** - Package is experimental per architecture condition-gating rules

## Sign-off

*Lead Developer*: _________________________
*Date*: _________________________
*Quality Gate*: EXPERIMENTAL

## Notes

This package (`25-core-testing`) is marked as **experimental** per ARCHITECTURE.md condition-gating. Per task 90-91, testing packages should only be built when:
- Task 90 (`test-setup`): When duplication of test configuration is observed
- Task 91 (`test-fixtures`): When multiple test suites need the same factories

This directory exists as a research/experimental space for testing utilities that may migrate to the standardized task numbers when the condition triggers are met.
