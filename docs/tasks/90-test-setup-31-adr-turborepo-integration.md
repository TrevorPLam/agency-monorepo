# ADR: Turborepo Integration Strategy for Testing

## Status
**Accepted**

## Context
The monorepo can use two approaches for test execution:
1. **Vitest Projects**: Unified test runner with merged coverage
2. **Turborepo per-package**: Cached, parallel test execution per package

## Decision

Use a **hybrid approach**:
- **Local development**: Vitest Projects for unified test running and debugging
- **CI/CD**: Turborepo per-package tasks for caching and parallelization

## Rationale

| Approach | Pros | Cons | Best For |
|----------|------|------|----------|
| Vitest Projects | Merged coverage out-of-box; unified debugging | No Turborepo caching; slower CI | Local development |
| Turborepo per-package | Cached; parallel; granular | Manual coverage merge needed | CI/CD |
| Hybrid | Best of both worlds | More configuration | This monorepo |

## Implementation

### Local Development (Vitest Projects)

Root `vitest.config.ts`:
```typescript
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    projects: [
      'packages/*',
      'apps/*'
    ],
    coverage: {
      enabled: true,
      reporter: ['text', 'html', 'json'],
      reportsDirectory: './coverage'
    }
  }
});
```

Usage:
```bash
# Run all tests from root
pnpm vitest

# Run specific project
pnpm vitest --project packages/ui
```

### CI/CD (Turborepo)

`turbo.json`:
```json
{
  "tasks": {
    "test": {
      "dependsOn": ["^build"],
      "outputs": ["coverage/**"]
    },
    "test:ci": {
      "dependsOn": ["^build"],
      "outputs": ["coverage/**"]
    },
    "test:e2e": {
      "dependsOn": ["build"],
      "outputs": ["playwright-report/**"]
    }
  }
}
```

Per-package `package.json`:
```json
{
  "scripts": {
    "test": "vitest run",
    "test:ci": "vitest run --coverage",
    "test:e2e": "playwright test"
  }
}
```

### Coverage Merging (CI)

Use `nyc` to merge coverage reports:
```bash
# Run tests for all packages
turbo run test:ci

# Merge coverage reports
nyc merge coverage/packages/*/coverage-final.json .nyc_output/coverage.json

# Generate final report
nyc report --reporter=html --reporter=text-summary
```

## Configuration Package Structure

```
packages/testing/setup/
├── src/
│   ├── vitest.config.base.ts      # Base config (node env)
│   ├── vitest.config.react.ts     # React config (jsdom env)
│   ├── playwright.config.base.ts  # Playwright base config
│   └── test-setup.ts              # Global test setup
├── package.json
└── 01-config-biome-migration-50-ref-quickstart.md
```

### Export Pattern
```typescript
// packages/testing/setup/src/index.ts
export { baseVitestConfig } from './vitest.config.base';
export { reactVitestConfig } from './vitest.config.react';
export { basePlaywrightConfig } from './playwright.config.base';
```

## Consequences

### Positive
- Fast local development with unified test runner
- Cached CI runs for faster pipelines
- Merged coverage reporting available locally
- Flexibility to run single package or full suite

### Negative
- More complex configuration (two approaches)
- Coverage merge step required in CI
- Team must understand when to use which approach

## Migration Path

1. Start with Vitest Projects for simplicity
2. Add Turborepo tasks when CI caching becomes important
3. Implement coverage merging when needed
4. Document which command to use when

## References

- [Turborepo Vitest Guide](https://turborepo.dev/docs/guides/tools/vitest)
- [Vitest Projects Configuration](https://vitest.dev/guide/projects)
- [Vitest 4.1 Coverage Options](https://vitest.dev/config/coverage#coverage-changed)
