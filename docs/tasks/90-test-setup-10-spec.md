# 90-test-setup: Implementation Specification

## Task Header

| Field | Value |
|-------|-------|
| **State** | `planned` — Documented target; implementation not yet authorized |
| **Trigger** | First package or app requires test utilities |
| **Minimum Consumers** | 2+ packages/apps using shared test setup |
| **Dependencies** | Vitest 3.x, Testing Library React, Playwright |
| **Exit Criteria** | Test setup exported and used by at least 2 consumers |
| **Implementation Authority** | `REPO-STATE.md` — Phase: Planning, Build status: Not started |
| **Version Authority** | `DEPENDENCY.md` §12 — Vitest 3.x |
| **Supersedes** | n/a |
| **Superseded by** | n/a |

**Cross-references:**
- Decision status: `DECISION-STATUS.md` — Test setup `approved`
- Version pins: `DEPENDENCY.md` §12
- Architecture: `ARCHITECTURE.md` — Testing layer section
- Note: Vitest is the canonical test runner

## Files
```
packages/testing/setup/
├── package.json
├── tsconfig.json
├── 01-config-biome-migration-50-ref-quickstart.md
└── src/
    ├── index.ts
    ├── vitest.config.base.ts
    ├── vitest.config.react.ts
    ├── test-utils.tsx
    └── playwright.config.base.ts
```

### `package.json`
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
    "@testing-library/jest-dom": "6.9.1",
    "@testing-library/user-event": "14.6.1",
    "@playwright/test": "1.59.1",
    "jsdom": "29.0.2"
  },
  "devDependencies": {
    "@agency/config-eslint": "workspace:*",
    "@agency/config-typescript": "workspace:*"
  },
  "publishConfig": { "access": "restricted" }
}
```

### `src/vitest.config.base.ts`
```ts
import { defineConfig } from "vitest/config";

export const baseVitestConfig = defineConfig({
  test: {
    globals: true,
    environment: "node",
    include: ["src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
    exclude: ["node_modules", "dist", ".next"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: ["node_modules/", "dist/", "**/*.d.ts", "**/*.config.*"]
    }
  }
});

export default baseVitestConfig;
```

### `src/vitest.config.react.ts`
```ts
import { defineConfig, mergeConfig } from "vitest/config";
import { baseVitestConfig } from "./vitest.config.base";

export const reactVitestConfig = mergeConfig(
  baseVitestConfig,
  defineConfig({
    test: {
      environment: "jsdom",
      setupFiles: ["./src/test-setup.ts"],
      deps: {
        inline: [/@agency\/]
      }
    }
  })
);

export default reactVitestConfig;
```

### `src/test-utils.tsx`
```tsx
import { render as rtlRender, RenderOptions } from "@testing-library/react";
import { ReactElement } from "react";

function AllTheProviders({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

export function render(
  ui: ReactElement,
  options?: Omit<RenderOptions, "wrapper">
) {
  return rtlRender(ui, { wrapper: AllTheProviders, ...options });
}

export * from "@testing-library/react";
export { render };
```

### `src/playwright.config.base.ts`
```ts
import { defineConfig, devices } from "@playwright/test";

export const basePlaywrightConfig = defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "html",
  use: {
    baseURL: process.env.E2E_BASE_URL ?? "http://localhost:3000",
    trace: "on-first-retry",
    screenshot: "only-on-failure"
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "firefox", use: { ...devices["Desktop Firefox"] } },
    { name: "webkit", use: { ...devices["Desktop Safari"] } }
  ],
  webServer: {
    command: "pnpm dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI
  }
});

export default basePlaywrightConfig;
```

### `src/index.ts`
```ts
export { baseVitestConfig } from "./vitest.config.base";
export { reactVitestConfig } from "./vitest.config.react";
export { basePlaywrightConfig } from "./playwright.config.base";
export { render } from "./test-utils";
```

### README
```md
# @agency/test-setup
Shared testing configuration for Vitest, Testing Library, and Playwright.
## Usage (Vitest)
```ts
// vitest.config.ts
import { reactVitestConfig } from "@agency/test-setup/vitest/react";
export default reactVitestConfig;
```
## Usage (Playwright)
```ts
// playwright.config.ts
import { basePlaywrightConfig } from "@agency/test-setup/playwright";
export default basePlaywrightConfig;
```
## Add at Growth Stage
Include this package in devDependencies when testing infrastructure becomes consistent across multiple packages.
```
