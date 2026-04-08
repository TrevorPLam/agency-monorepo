# 01-config/00-eslint: Shared ESLint Configuration

## Purpose
Enforce one-way dependency flow (`config/core → data/auth/communication/ui → apps`) via `no-restricted-paths` zones. Provide a reusable, sharable ESLint configuration.

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
  "peerDependencies": { "eslint": "^9.0.0" },
  "dependencies": {
    "@typescript-eslint/eslint-plugin": "^8.0.0",
    "@typescript-eslint/parser": "^8.0.0",
    "eslint-config-next": "16.2.2"
  },
  "publishConfig": { "access": "restricted" }
}
```
ESLint 9 flat config has been the default configuration system since v9.0.0. Shared configuration packages must export flat config objects directly for use in `eslint.config.js`. `@typescript-eslint` v8.0.0 (latest minor versions ~8.56.1) includes all TypeScript linting rules and the ESLint parser. `eslint-config-next` v16.2.2 is the latest official Next.js configuration and includes Next-specific rules plus React and React Hooks recommendations.

### `base.mjs`
```js
const restrictedZones = [
  { target: "./packages/core", from: "./packages/(ui|data|auth|communication)", message: "Core packages cannot import from higher-level domains." },
  { target: "./packages/data", from: "./packages/(ui|auth)", message: "Data packages cannot import from UI or auth packages." },
  { target: "./packages/config", from: "./packages/(ui|data|auth|communication)", message: "Config packages must stay at the bottom of the dependency graph." },
  { target: "./packages", from: "./apps", message: "Packages may not import from apps." }
];

export default [
  { ignores: ["**/.next/**", "**/dist/**", "**/build/**", "**/coverage/**", "**/node_modules/**", "**/.turbo/**"] },
  {
    files: ["**/*.{js,mjs,cjs,ts,mts,cts,tsx,jsx}"],
    languageOptions: {
      parser: (await import("@typescript-eslint/parser")).default,
      parserOptions: { ecmaVersion: "latest", sourceType: "module" }
    },
    plugins: { "@typescript-eslint": (await import("@typescript-eslint/eslint-plugin")).default },
    rules: {
      "no-restricted-imports": ["error", { patterns: [
        { group: ["../../apps/*", "../../../apps/*", "~/apps/*"], message: "Do not import from apps inside packages." },
        { group: ["../*/src/*", "../../*/src/*", "../../../*/src/*"], message: "Use the package's public exports, not internal src files." }
      ] } ]
    }
  },
  { files: ["packages/**/*.{ts,tsx,js,jsx,mjs,cjs}"], rules: { "no-restricted-paths": ["error", { zones: restrictedZones }] } }
];
```

### `next.mjs`
```js
import baseConfig from "./base.mjs";
import nextVitals from "eslint-config-next/core-web-vitals";

export default [...baseConfig, ...nextVitals];
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
