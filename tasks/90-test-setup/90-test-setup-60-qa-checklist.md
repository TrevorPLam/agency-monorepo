# Test Setup: QA Checklist

## Package Validation

### Configuration Files
- [ ] `vitest.config.base.ts` exports valid base configuration
- [ ] `vitest.config.react.ts` extends base with jsdom environment
- [ ] `playwright.config.base.ts` supports Chromium, Firefox, WebKit
- [ ] All configs use `defineConfig` from appropriate packages
- [ ] No business logic in configuration files

### Package Structure
- [ ] `package.json` has `private: true` and `publishConfig.access: restricted`
- [ ] `type: "module"` specified
- [ ] `exports` field properly configured for all config paths
- [ ] No dependencies on `@agency/*` packages (except workspace configs)
- [ ] All devDependencies are testing tools only

### Version Alignment
- [ ] `vitest` pinned to 4.1.3
- [ ] `@testing-library/react` pinned to 16.3.2
- [ ] `@playwright/test` pinned to 1.59.1
- [ ] `jsdom` pinned to 29.0.2

## Functionality Testing

### Config Import Tests
```bash
# Verify base config imports
node -e "import('@agency/test-setup/vitest/base').then(m => console.log('✓ base config'))"

# Verify react config imports  
node -e "import('@agency/test-setup/vitest/react').then(m => console.log('✓ react config'))"

# Verify playwright config imports
node -e "import('@agency/test-setup/playwright').then(m => console.log('✓ playwright config'))"
```

### TypeScript Compilation
- [ ] `tsc --noEmit` passes for all config files
- [ ] No type errors in exported configurations
- [ ] `mergeConfig` type inference works correctly

### Package Consumer Test
Create a test package that imports configs:
```typescript
// test-consumer/vitest.config.ts
import { reactVitestConfig } from '@agency/test-setup/vitest/react';
export default reactVitestConfig;
```
- [ ] Config loads without errors
- [ ] Tests run with imported config
- [ ] Coverage reporting works

## Turborepo Integration

### Task Configuration
- [ ] `turbo.json` includes `test` task with `dependsOn: ["^build"]`
- [ ] `turbo.json` includes `test:watch` with `cache: false, persistent: true`
- [ ] `turbo.json` includes `test:e2e` with proper outputs

### Cache Configuration
- [ ] Test task outputs configured (`coverage/**`)
- [ ] Test task inputs include test files and source files
- [ ] Test:watch correctly marked as non-cacheable

## Documentation

### README Requirements
- [ ] README.md explains package purpose (config only)
- [ ] Usage examples for extending configs
- [ ] Clear reference to `@agency/core-testing` for utilities
- [ ] Clear reference to `@agency/test-fixtures` for data factories
- [ ] Version compatibility table

### ADRs Present
- [ ] ADR: Turborepo integration strategy
- [ ] ADR: Server Components testing limitations
- [ ] Constraints document explaining configuration-only rule

## Cross-Package Integration

### Relationship to 25-core-testing
- [ ] Documentation references `@agency/core-testing` for matchers/mocks
- [ ] No circular dependencies between packages
- [ ] Consumer can use both packages together

### Relationship to 91-test-fixtures
- [ ] Documentation references `@agency/test-fixtures` for data factories
- [ ] No duplicate fixture logic between packages
- [ ] Clear separation: config vs data

### Relationship to Apps
- [ ] Example app successfully extends configs
- [ ] Playwright E2E tests can import base config
- [ ] CI workflow can run tests across all apps

## Performance Benchmarks

### Config Load Time
- [ ] Base config loads in <100ms
- [ ] React config loads in <150ms
- [ ] Playwright config loads in <100ms

### Test Execution
- [ ] Empty test suite runs in <2s
- [ ] React component test runs in <500ms
- [ ] E2E test startup in <5s

## Exit Criteria

Before marking this task complete:

1. [ ] All configuration files are pure config (no logic)
2. [ ] Three ADRs are documented and accepted
3. [ ] Constraints document is enforced via linting
4. [ ] At least one consumer app uses the configs successfully
5. [ ] CI passes with Turborepo caching
6. [ ] Documentation is accurate and complete
7. [ ] No markdown lint errors in new files
8. [ ] Changeset created for initial release

## Sign-off

- [ ] Package structure reviewed
- [ ] Configurations tested in consumer
- [ ] Documentation reviewed for accuracy
- [ ] Version pins verified against DEPENDENCY.md
- [ ] Ready for growth-stage implementation
