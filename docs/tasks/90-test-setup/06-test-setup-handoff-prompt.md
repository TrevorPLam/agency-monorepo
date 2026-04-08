# Test Setup: Implementation Prompt

## Context
You are implementing the `@agency/test-setup` package for the agency monorepo. This is a **condition-gated** package that should only be built when test configuration duplication is observed across 2+ packages.

## Package Purpose
Provide shared testing configuration for:
- Vitest (base and React configs)
- Playwright (E2E base config)
- React Testing Library setup

**Critical Rule**: This package contains ONLY configuration. No business logic, no custom matchers, no test utilities.

## File Structure

```
packages/testing/setup/
├── package.json
├── tsconfig.json
├── README.md
└── src/
    ├── index.ts
    ├── vitest.config.base.ts
    ├── vitest.config.react.ts
    ├── playwright.config.base.ts
    └── test-utils.tsx
```

## Implementation Steps

### 1. Create Package Structure

```bash
mkdir -p packages/testing/setup/src
```

### 2. Package Configuration

Create `package.json`:
```json
{
  "name": "@agency/test-setup",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "exports": {
    ".": "./src/index.ts",
    "./vitest/base": "./src/vitest.config.base.ts",
    "./vitest/react": "./src/vitest.config.react.ts",
    "./playwright": "./src/playwright.config.base.ts",
    "./utils": "./src/test-utils.tsx"
  },
  "dependencies": {
    "vitest": "4.1.3",
    "@testing-library/react": "16.3.2",
    "@testing-library/jest-dom": "latest",
    "@testing-library/user-event": "latest",
    "@playwright/test": "1.59.1",
    "jsdom": "latest"
  },
  "devDependencies": {
    "@agency/config-eslint": "workspace:*",
    "@agency/config-typescript": "workspace:*"
  },
  "publishConfig": { "access": "restricted" }
}
```

### 3. Vitest Base Config

Create `src/vitest.config.base.ts`:
```typescript
import { defineConfig } from 'vitest/config';

export const baseVitestConfig = defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    exclude: ['node_modules', 'dist', '.next'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'dist/', '**/*.d.ts', '**/*.config.*']
    }
  }
});

export default baseVitestConfig;
```

### 4. Vitest React Config

Create `src/vitest.config.react.ts`:
```typescript
import { defineConfig, mergeConfig } from 'vitest/config';
import { baseVitestConfig } from './vitest.config.base';

export const reactVitestConfig = mergeConfig(
  baseVitestConfig,
  defineConfig({
    test: {
      environment: 'jsdom',
      setupFiles: ['./src/test-setup.ts'],
      deps: {
        inline: [/@agency\/]
      }
    }
  })
);

export default reactVitestConfig;
```

### 5. Playwright Base Config

Create `src/playwright.config.base.ts`:
```typescript
import { defineConfig, devices } from '@playwright/test';

export const basePlaywrightConfig = defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: process.env.E2E_BASE_URL ?? 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure'
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } }
  ],
  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI
  }
});

export default basePlaywrightConfig;
```

### 6. Test Utilities

Create `src/test-utils.tsx`:
```typescript
import { render as rtlRender, RenderOptions } from '@testing-library/react';
import { ReactElement } from 'react';

function AllTheProviders({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

export function render(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  return rtlRender(ui, { wrapper: AllTheProviders, ...options });
}

export * from '@testing-library/react';
export { render };
```

### 7. Index Export

Create `src/index.ts`:
```typescript
export { baseVitestConfig } from './vitest.config.base';
export { reactVitestConfig } from './vitest.config.react';
export { basePlaywrightConfig } from './playwright.config.base';
export { render } from './test-utils';
```

### 8. README

Create `README.md`:
```markdown
# @agency/test-setup

Shared testing configuration for Vitest, Testing Library, and Playwright.

## Usage

### Vitest (Node.js packages)
```typescript
// vitest.config.ts
import { baseVitestConfig } from '@agency/test-setup/vitest/base';
export default baseVitestConfig;
```

### Vitest (React packages)
```typescript
// vitest.config.ts
import { reactVitestConfig } from '@agency/test-setup/vitest/react';
export default reactVitestConfig;
```

### Playwright
```typescript
// playwright.config.ts
import { basePlaywrightConfig } from '@agency/test-setup/playwright';
export default basePlaywrightConfig;
```

## Related Packages

- `@agency/core-testing` - Custom matchers, mocks, and utilities
- `@agency/test-fixtures` - Data factories with Faker.js

## When to Add

Only create this package when you notice duplicated test configuration across 2+ packages.
```

## Verification Commands

After implementation, run:

```bash
# Install dependencies
pnpm install

# Type check
pnpm --filter @agency/test-setup typecheck

# Verify configs load
node -e "import('./packages/testing/setup/src/vitest.config.base.ts').then(() => console.log('✓'))"

# Check exports
pnpm --filter @agency/test-setup build --dry-run
```

## Constraints Check

Before completing, verify:
- [ ] No imports from `@agency/*` packages (except configs)
- [ ] No business logic in config files
- [ ] No custom matchers (those go in core-testing)
- [ ] No data factories (those go in test-fixtures)

## References

- See `02-test-setup-constraints.md` for detailed boundaries
- See `03-test-setup-adr-turborepo-integration.md` for CI strategy
- See `03-test-setup-adr-server-components.md` for RSC testing rules
