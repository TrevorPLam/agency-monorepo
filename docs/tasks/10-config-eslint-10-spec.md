# 10-config-eslint: Implementation Specification

> **⚠️ NON-AUTHORITATIVE DOCUMENT ⚠️**
>
> This is a planning specification, not implementation authority.
>
> **Before implementing:**
> 1. Read `REPO-STATE.md` — confirms what is approved to build now
> 2. Read `DECISION-STATUS.md` — confirms locked vs open decisions
> 3. Read `DEPENDENCY.md` — provides exact version authority
>
> **If this document conflicts with the above:** The governance documents win. Stop and escalate.

## Task Header

| Field | Value |
|-------|-------|
| **State** | `planned` — Documented target; implementation not yet authorized |
| **Trigger** | Repository initialization — always required |
| **Minimum Consumers** | n/a (root infrastructure) |
| **Dependencies** | ESLint ^9.0.0, `@typescript-eslint/*` ^8.0.0, `eslint-config-next` (validate at activation) |
| **Exit Criteria** | Root package.json, pnpm-workspace.yaml, turbo.json committed and verified |
| **Implementation Authority** | `REPO-STATE.md` — Phase: Planning, Build status: Not started |
| **Version Authority** | `DEPENDENCY.md` §3 — ESLint, `@typescript-eslint`, and `eslint-config-next` |
| **Supersedes** | n/a |
| **Superseded by** | n/a |

## Cross-references

- Decision status: `DECISION-STATUS.md` — ESLint canonical, Biome `open`
- Version pins: `DEPENDENCY.md` §3, §18
- Architecture: `ARCHITECTURE.md` — Linting configuration section
- Related: `13-config-prettier` remains the canonical formatter; `14-config-biome` and `01-config-biome-migration` remain evaluation tracks only

## Files
```
packages/config/eslint-config/
├── package.json
├── base.mjs
├── next.mjs
└── 01-config-biome-migration-50-ref-quickstart.md
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
  "files": ["base.mjs", "next.mjs", "01-config-biome-migration-50-ref-quickstart.md"],
  "peerDependencies": { "eslint": "^9.0.0" },
  "dependencies": {
    "@typescript-eslint/eslint-plugin": "^8.0.0",
    "@typescript-eslint/parser": "^8.0.0",
    "eslint-config-next": "16.2.3",
    "eslint-plugin-import": "^2.31.0"
  },
  "publishConfig": { "access": "restricted" }
}
```

ESLint 9 flat config is the canonical lint lane. Shared configuration packages must export flat config objects directly for use in `eslint.config.js`. Use the approved ranges from `DEPENDENCY.md` instead of minor-version guidance embedded in task prose.

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
      ] }]
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
