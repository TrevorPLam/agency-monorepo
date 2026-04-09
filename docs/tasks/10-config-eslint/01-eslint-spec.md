# 10-config-eslint: Implementation Specification

## Task Header

| Field | Value |
|-------|-------|
| **State** | `planned` — Documented target; implementation not yet authorized |
| **Trigger** | Repository initialization — always required |
| **Minimum Consumers** | n/a (root infrastructure) |
| **Dependencies** | ESLint 9.x, `@typescript-eslint/*`, `eslint-config-next@16.2.3` |
| **Exit Criteria** | Root package.json, pnpm-workspace.yaml, turbo.json committed and verified |
| **Implementation Authority** | `REPO-STATE.md` — Phase: Planning, Build status: Not started |
| **Version Authority** | `DEPENDENCY.md` §1, §3 — pnpm 10.33.0 locked via packageManager |
| **Supersedes** | n/a |
| **Superseded by** | n/a |

## Cross-references

- Decision status: `DECISION-STATUS.md` — pnpm workspaces + Turborepo `locked`
- Version pins: `DEPENDENCY.md` §1, §3
- Architecture: `ARCHITECTURE.md` — Final stack section

**Cross-references:**
- Decision status: `DECISION-STATUS.md` — ESLint canonical, Biome `open`
- Version pins: `DEPENDENCY.md` §3, §18
- Architecture: `ARCHITECTURE.md` — Linting configuration section
- Related: Task 14 (14-config-biome) evaluation determines future canonical status

## Files
```
packages/config/eslint-config/
├── package.json
├── base.mjs
├── next.mjs
└── README.md
```

### `package.json`
```json
{
  "name": "@agency/config-eslint",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "exports": {
    ".": "./base.mjs",
    "./base": "./base.mjs",
    "./next": "./next.mjs"
  },
  "files": ["base.mjs", "next.mjs", "README.md"],
  "peerDependencies": { "eslint": "^9.3.0" },
  "dependencies": {
    "@typescript-eslint/eslint-plugin": "^8.57.0",
    "@typescript-eslint/parser": "^8.57.0",
    "eslint-config-next": "16.2.3",
    "eslint-plugin-import": "^2.31.0"
  },
  "publishConfig": { "access": "restricted" }
}
```

ESLint 9 flat config has been the default configuration system since v9.0.0. Shared configuration packages must export flat config objects directly for use in `eslint.config.js`. `@typescript-eslint` v8.0.0 (latest minor versions ~8.56.1) includes all TypeScript linting rules and the ESLint parser. `eslint-config-next` v16.2.3 is the latest official Next.js configuration and includes Next-specific rules plus React and React Hooks recommendations.

### `base.mjs`

```js
import js from '@eslint/js';
import ts from 'typescript-eslint';
import importPlugin from 'eslint-plugin-import';

const restrictedZones = [
  { target: "./packages/core", from: "./packages/(ui|data|auth|communication)", message: "Core packages cannot import from higher-level domains." },
  { target: "./packages/data", from: "./packages/(ui|auth)", message: "Data packages cannot import from UI or auth packages." },
  { target: "./packages/config", from: "./packages/(ui|data|auth|communication)", message: "Config packages must stay at the bottom of the dependency graph." },
  { target: "./packages", from: "./apps", message: "Packages may not import from apps." }
];

export default [
  js.configs.recommended,
  ...ts.configs.recommended,
  {
    ignores: ["**/.next/**", "**/dist/**", "**/build/**", "**/coverage/**", "**/node_modules/**", "**/.turbo/**"]
  },
  {
    files: ["**/*.{js,mjs,cjs,ts,mts,cts,tsx,jsx}"],
    languageOptions: {
      parser: ts.parser,
      parserOptions: { ecmaVersion: "latest", sourceType: "module" }
    },
    plugins: {
      import: importPlugin,
    },
    rules: {
      // Enforce monorepo dependency boundaries
      "import/no-restricted-paths": ["error", { zones: restrictedZones }],
      "import/no-cycle": "error",
      "import/no-self-import": "error",
      // Prevent importing from apps into packages
      "no-restricted-imports": ["error", { patterns: [
        { group: ["../../apps/*", "../../../apps/*", "~/apps/*"], message: "Do not import from apps inside packages." },
        { group: ["../*/src/*", "../../*/src/*", "../../../*/src/*"], message: "Use the package's public exports, not internal src files." }
      ] ]
    }
  },
  // Biome configuration for hybrid approach
  {
    files: ["**/*.{js,mjs,cjs,ts,mts,cts,tsx,jsx}"],
    languageOptions: {
      parser: ts.parser,
      parserOptions: { ecmaVersion: "latest", sourceType: "module" }
    },
    plugins: {
      import: importPlugin,
    },
    rules: {
      // Biome-specific rules (formatting, core linting)
      "complexity/noForEach": "error",
      "complexity/noStaticOnlyClass": "error",
      "suspicious/noDoubleEquals": "error",
      "style/noNegationElse": "off",
      "style/useForOf": "error",
      "style/useNodejsImportProtocol": "error",
      "style/useNumberNamespace": "error",
      "organizeImports": { "enabled": true },
      // Disable Biome rules that conflict with ESLint plugins during migration
      "complexity/noStaticOnlyClass": "off",
      "suspicious/noDoubleEquals": "off"
    },
    // Biome formatter configuration
    formatter: {
      enabled: true,
      formatWithErrors: true
    },
    // JavaScript globals for Biome
    javascript: {
      globals: ["Global1"]
    }
  }
];
```

### `next.mjs`
```js
import baseConfig from "./base.mjs";
import nextPlugin from "@next/eslint-plugin-next";

export default [
  ...baseConfig,
  {
    plugins: { '@next/next': nextPlugin },
    rules: {
      ...nextPlugin.configs.recommended.rules,
      ...nextPlugin.configs['core-web-vitals'].rules,
    },
  },
];
```

The `core-web-vitals` variant includes base Next rules plus performance rules that impact Core Web Vitals.

### README
```md
# @agency/config-eslint
Shared ESLint config enforcing dependency boundaries and providing TypeScript/Next.js defaults.
## Exports
- `@agency/config-eslint` or `@agency/config-eslint/base`
- `@agency/config-eslint/next`
## Usage (package)
```js
import config from "@agency/config-eslint";
export default [...config];
```
## Usage (Next.js app)
```js
import config from "@agency/config-eslint/next";
export default [...config];
```
## Enforced Rules
- Packages must not import from apps.
- Lower-level domains must not import from higher-level domains.
- Consumers must use public package exports, not internal `src` paths.
```

## Verification

```bash
# Test base config
pnpm --filter @agency/config-eslint lint

# Verify in consuming package
pnpm --filter @agency/core-utils lint

# Test import restrictions work correctly
# This should fail if core imports from ui:
# cd packages/core && pnpm lint
```
