# 11-config-typescript/00-package: Shared TypeScript Configuration

## Purpose
Centralize strict TypeScript compiler settings and provide variants for Next.js apps and library packages.

## Files
```
packages/config/typescript-config/
├── package.json
├── base.json
├── nextjs.json
├── library.json
└── README.md
```

### `package.json`
```json
{
  "name": "@agency/config-typescript",
  "version": "0.1.0",
  "private": true,
  "exports": {
    ".": "./base.json",
    "./base": "./base.json",
    "./nextjs": "./nextjs.json",
    "./library": "./library.json"
  },
  "files": ["base.json", "nextjs.json", "library.json", "README.md"],
  "dependencies": { "typescript": "6.0.0" },
  "publishConfig": { "access": "restricted" }
}
```
TypeScript 6.0 is the final JavaScript-based version and a transitional release before the Go-rewritten TypeScript 7.0. This package centralizes compiler policy to avoid updating dozens of configs when TypeScript changes.

### `base.json`
```json
{
  "$schema": "https://json.schemastore.org/tsconfig",
  "compilerOptions": {
    "target": "ES2025",
    "lib": ["ES2025"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "verbatimModuleSyntax": true,
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "noImplicitOverride": true,
    "useDefineForClassFields": true,
    "resolveJsonModule": true,
    "skipLibCheck": true,
    "isolatedModules": true,
    "declaration": true
  }
}
```
TS 6.0 changes defaults: `strict: true` is now default, `target: es2025` and `module: esnext` are the new baseline, and the old `moduleResolution: node` has been deprecated. TypeScript 7.0 (Go rewrite) will not support the legacy `node` resolver, making `moduleResolution: bundler` the recommended forward-compatible choice.

### `nextjs.json`
```json
{
  "$schema": "https://json.schemastore.org/tsconfig",
  "extends": "./base.json",
  "compilerOptions": {
    "lib": ["DOM", "DOM.Iterable", "ES2025"],
    "jsx": "preserve",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowJs": false,
    "incremental": true,
    "noEmit": true,
    "plugins": [{ "name": "next" }]
  }
}
```

### `library.json`
```json
{
  "$schema": "https://json.schemastore.org/tsconfig",
  "extends": "./base.json",
  "compilerOptions": {
    "lib": ["ES2025"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "composite": false,
    "noEmit": true,
    "jsx": "react-jsx"
  }
}
```

### README
```md
# @agency/config-typescript
Shared TypeScript configs for the monorepo.
## Exports
- `@agency/config-typescript` / `./base` (strict base)
- `@agency/config-typescript/nextjs` (Next.js apps)
- `@agency/config-typescript/library` (shared packages)
## Usage (Next.js app)
```json
{ "extends": "@agency/config-typescript/nextjs" }
```
## Usage (library package)
```json
{ "extends": "@agency/config-typescript/library" }
```
```
