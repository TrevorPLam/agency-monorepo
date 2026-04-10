# Test Setup: Constraints & Boundaries

## Purpose
Technical constraints and architectural boundaries for the `@agency/test-setup` package to ensure it remains a pure configuration package without business logic.

## Critical Constraints

### Configuration-Only Rule
- **No Business Logic**: This package contains ONLY test runner configuration
- **No Test Utilities**: Custom matchers, mocks, and fixtures belong in `@agency/core-testing` (25)
- **No Test Data**: Realistic data factories belong in `@agency/test-fixtures` (91)
- **No Component Logic**: Render helpers must be thin wrappers only

### Allowed Contents
| Category | Belongs | Notes |
|----------|---------|-------|
| Vitest base configs | ✅ Yes | `vitest.config.base.ts`, `vitest.config.react.ts` |
| Playwright base config | ✅ Yes | `playwright.config.base.ts` |
| Test runner setup files | ✅ Yes | `test-setup.ts` for global configuration |
| Render wrappers | ✅ Yes | Thin React Testing Library wrappers |
| ❌ Custom matchers | ❌ No | Use `@agency/core-testing` |
| ❌ Mock factories | ❌ No | Use `@agency/core-testing` or `@agency/test-fixtures` |
| ❌ Test data generators | ❌ No | Use `@agency/test-fixtures` |
| ❌ Database utilities | ❌ No | Use `@agency/data-db` test utilities |

### Dependency Constraints
- **No internal dependencies**: Cannot import from any `@agency/*` package
- **External test tooling only**: Vitest, Testing Library, Playwright
- **Zero business logic coupling**: Configs must be generic and reusable

## Package Relationship Rules

```
@agency/test-setup (config only)
  ↓ imported by
@agency/core-testing (matchers, basic fixtures, mocks)
  ↓ imported by
@agency/test-fixtures (rich data factories with Faker.js)
  ↓ imported by
apps/* (test suites)
```

### Usage Rules
1. **Apps import configs** from `@agency/test-setup` for test runner configuration
2. **Apps import utilities** from `@agency/core-testing` for matchers and mocks
3. **Apps import factories** from `@agency/test-fixtures` when realistic data is needed
4. **Never** import from apps back into test packages

## Turborepo Task Integration

### Required turbo.json Configuration
```json
{
  "tasks": {
    "test": {
      "dependsOn": ["^build"],
      "outputs": ["coverage/**"]
    },
    "test:watch": {
      "cache": false,
      "persistent": true
    },
    "test:e2e": {
      "dependsOn": ["build"],
      "outputs": ["playwright-report/**", "test-results/**"]
    }
  }
}
```

### CI vs Local Execution
- **CI**: Use `vitest run` (non-watch mode) for caching compatibility
- **Local**: Use `vitest --watch` via `test:watch` task

## Compliance Requirements

### Version Alignment
| Package | Required Version | Reason |
|---------|-----------------|----------|
| vitest | 4.1.3 | Turborepo 2.x compatibility |
| @testing-library/react | 16.3.2 | React 19 support |
| @playwright/test | 1.59.1 | Latest stable |
| jsdom | 29.0.2 | Browser environment |

### Configuration Standards
- All configs must use `defineConfig` from Vitest
- React configs must extend base configs via `mergeConfig`
- Playwright configs must support all three browsers (Chromium, Firefox, WebKit)

## Enforcement

```bash
# Verify no business logic
pnpm --filter @agency/test-setup lint

# Check no disallowed imports
pnpm --filter @agency/test-setup depcheck

# Validate configs are importable
node -e "require('./packages/testing/setup/dist/vitest.config.base.js')"
```

## Exit Criteria

- [ ] All configs are pure configuration (no logic)
- [ ] No imports from `@agency/*` packages except workspace protocol
- [ ] Turbo.json tasks defined and working
- [ ] CI test execution produces cacheable outputs
- [ ] Documentation references correct package relationships
