# Guide: Extending Test Configuration

## Purpose
How to extend `@agency/test-setup` configurations in individual packages and apps.

## Basic Extension Pattern

### 1. Install Dependencies

```bash
pnpm add -D @agency/test-setup vitest
```

### 2. Extend Base Config

**For Node.js packages:**
```typescript
// vitest.config.ts
import { defineConfig, mergeConfig } from 'vitest/config';
import { baseVitestConfig } from '@agency/test-setup/vitest/base';

export default mergeConfig(
  baseVitestConfig,
  defineConfig({
    test: {
      // Package-specific overrides
      include: ['src/**/*.test.ts'],
    }
  })
);
```

**For React packages:**
```typescript
// vitest.config.ts
import { defineConfig, mergeConfig } from 'vitest/config';
import { reactVitestConfig } from '@agency/test-setup/vitest/react';

export default mergeConfig(
  reactVitestConfig,
  defineConfig({
    test: {
      // Package-specific overrides
      include: ['src/**/*.test.{ts,tsx}'],
    }
  })
);
```

### 3. Add Test Script

```json
// package.json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest --watch",
    "test:ui": "vitest --ui"
  }
}
```

## Advanced Configuration

### Custom Test Environment

```typescript
// vitest.config.ts
import { defineConfig, mergeConfig } from 'vitest/config';
import { baseVitestConfig } from '@agency/test-setup/vitest/base';

export default mergeConfig(
  baseVitestConfig,
  defineConfig({
    test: {
      environment: 'happy-dom', // Alternative to jsdom
      environmentMatchGlobs: [
        ['**/*.dom.test.ts', 'jsdom'],
        ['**/*.node.test.ts', 'node']
      ]
    }
  })
);
```

### Coverage Configuration

```typescript
// vitest.config.ts
import { defineConfig, mergeConfig } from 'vitest/config';
import { baseVitestConfig } from '@agency/test-setup/vitest/base';

export default mergeConfig(
  baseVitestConfig,
  defineConfig({
    test: {
      coverage: {
        enabled: true,
        reporter: ['text', 'html', 'json'],
        exclude: [
          'node_modules/',
          '**/*.config.*',
          '**/*.d.ts',
          '**/types/**'
        ]
      }
    }
  })
);
```

### Setup Files

```typescript
// vitest.config.ts
import { defineConfig, mergeConfig } from 'vitest/config';
import { reactVitestConfig } from '@agency/test-setup/vitest/react';

export default mergeConfig(
  reactVitestConfig,
  defineConfig({
    test: {
      setupFiles: ['./src/test-setup.ts']
    }
  })
);
```

```typescript
// src/test-setup.ts
import '@testing-library/jest-dom';
import { expect } from 'vitest';

// Add custom matchers from core-testing
import { createCustomMatchers } from '@agency/core-testing/matchers';
expect.extend(createCustomMatchers());
```

## Playwright Configuration

### Extend Base Playwright Config

```typescript
// playwright.config.ts
import { defineConfig, mergeConfig } from '@playwright/test';
import { basePlaywrightConfig } from '@agency/test-setup/playwright';

export default mergeConfig(
  basePlaywrightConfig,
  defineConfig({
    testDir: './e2e',
    webServer: {
      command: 'pnpm build && pnpm start',
      url: 'http://localhost:3000',
      reuseExistingServer: !process.env.CI
    }
  })
);
```

### App-Specific Playwright Settings

```typescript
// playwright.config.ts
import { defineConfig, mergeConfig, devices } from '@playwright/test';
import { basePlaywrightConfig } from '@agency/test-setup/playwright';

export default mergeConfig(
  basePlaywrightConfig,
  defineConfig({
    projects: [
      {
        name: 'chromium',
        use: { ...devices['Desktop Chrome'] }
      },
      {
        name: 'Mobile Chrome',
        use: { ...devices['Pixel 5'] }
      }
    ]
  })
);
```

## Package-Specific Patterns

### UI Package

```typescript
// packages/ui/design-system/vitest.config.ts
import { defineConfig, mergeConfig } from 'vitest/config';
import { reactVitestConfig } from '@agency/test-setup/vitest/react';

export default mergeConfig(
  reactVitestConfig,
  defineConfig({
    test: {
      include: ['src/**/*.test.{ts,tsx}'],
      coverage: {
        include: ['src/components/**/*'],
        exclude: ['src/**/*.stories.{ts,tsx}']
      }
    }
  })
);
```

### Data Package

```typescript
// packages/data/db/vitest.config.ts
import { defineConfig, mergeConfig } from 'vitest/config';
import { baseVitestConfig } from '@agency/test-setup/vitest/base';

export default mergeConfig(
  baseVitestConfig,
  defineConfig({
    test: {
      environment: 'node',
      include: ['src/**/*.test.ts'],
      // Database tests may need longer timeout
      testTimeout: 30000
    }
  })
);
```

### Next.js App

```typescript
// apps/agency-website/vitest.config.ts
import { defineConfig, mergeConfig } from 'vitest/config';
import { reactVitestConfig } from '@agency/test-setup/vitest/react';
import path from 'path';

export default mergeConfig(
  reactVitestConfig,
  defineConfig({
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src')
      }
    },
    test: {
      include: ['src/**/*.test.{ts,tsx}'],
      exclude: [
        '**/node_modules/**',
        '**/.next/**',
        '**/e2e/**' // E2E tests use Playwright
      ]
    }
  })
);
```

## Testing Import Patterns

### Correct Import Patterns

```typescript
// ✅ Import config from test-setup
import { reactVitestConfig } from '@agency/test-setup/vitest/react';

// ✅ Import matchers from core-testing
import { createCustomMatchers } from '@agency/core-testing/matchers';

// ✅ Import fixtures from test-fixtures (when needed)
import { createMockClient } from '@agency/test-fixtures/client';

// ❌ Don't import test-setup in production code
// ❌ Don't import test-fixtures in production code
```

## Troubleshooting

### Module Resolution Issues

If Vitest can't resolve workspace packages:

```typescript
// vitest.config.ts
import { defineConfig, mergeConfig } from 'vitest/config';
import { reactVitestConfig } from '@agency/test-setup/vitest/react';
import tsconfigPaths from 'vite-tsconfig-paths';

export default mergeConfig(
  reactVitestConfig,
  defineConfig({
    plugins: [tsconfigPaths()] // Resolves tsconfig paths
  })
);
```

### React Server Components

For RSC testing limitations, see: `03-test-setup-adr-server-components.md`

## Verification

```bash
# Verify config loads
pnpm vitest run --config ./vitest.config.ts

# Check coverage works
pnpm vitest run --coverage

# Verify Playwright config
pnpm playwright test --list
```
