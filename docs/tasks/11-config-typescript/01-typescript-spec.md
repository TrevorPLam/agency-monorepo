# 11-config-typescript: Implementation Specification

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
    "./base": "./base.json",
    "./nextjs": "./nextjs.json",
    "./library": "./library.json"
  },
  "files": ["*.json", "README.md"],
  "publishConfig": { "access": "restricted" }
}
```

### `base.json`
```json
{
  "$schema": "https://json.schemastore.org/tsconfig",
  "compilerOptions": {
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "target": "ES2022",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "moduleResolution": "bundler",
    "module": "ESNext",
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "isolatedModules": true
  }
}

## TypeScript 6.0 Migration Guide

### Breaking Changes
- **`--moduleResolution node` removed**: Use `"moduleResolution": "bundler"` or `"nodenext"`
- **ES5 target deprecated**: `"target": "ES2022"` is now minimum
- **`strict: true` is default**: No longer needs explicit setting

### Migration Steps
1. Update `moduleResolution` to `"bundler"` or `"nodenext"`
2. Remove explicit `"strict": true"` (now default)
3. Update imports to use ES2022+ features
4. Test with `tsc --noEmit` to verify no type errors

### Compatibility Notes
- Works with Next.js 16+ and React 19+
- Biome type-aware linting requires `"moduleResolution": "bundler"`
- Vite 6.0 with Turbopack requires updated module resolution
```

### `nextjs.json`
```json
{
  "$schema": "https://json.schemastore.org/tsconfig",
  "extends": "./base.json",
  "compilerOptions": {
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "strictNullChecks": true,
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

### `library.json`
```json
{
  "$schema": "https://json.schemastore.org/tsconfig",
  "extends": "./base.json",
  "compilerOptions": {
    "composite": true,
    "tsBuildInfoFile": "./.tsbuildinfo"
  }
}
```

## Usage

**In a package:**
```json
{
  "extends": "@agency/config-typescript/library.json",
  "compilerOptions": {
    "outDir": "./dist"
  }
}
```

**In a Next.js app:**
```json
{
  "extends": "@agency/config-typescript/nextjs.json"
}
```

## Verification

```bash
# Type check all packages
pnpm turbo typecheck
```
