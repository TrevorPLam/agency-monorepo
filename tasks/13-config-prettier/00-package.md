# 13-config-prettier/00-package: Prettier Configuration

## Purpose
Shared Prettier configuration for consistent code formatting across all packages and apps.

## Dependencies
- TASK_0 (Root Repository Scaffolding)

## Files

```
packages/config/prettier-config/
├── package.json
├── index.json
└── README.md
```

### `package.json`
```json
{
  "name": "@agency/config-prettier",
  "version": "0.1.0",
  "private": true,
  "description": "Shared Prettier configuration for the monorepo",
  "type": "module",
  "exports": {
    ".": "./index.json"
  },
  "files": ["index.json", "README.md"],
  "devDependencies": {
    "prettier": "3.5.0"
  },
  "peerDependencies": {
    "prettier": "^3.0.0"
  },
  "publishConfig": {
    "access": "restricted"
  }
}
```

### `index.json`
```json
{
  "semi": true,
  "singleQuote": false,
  "tabWidth": 2,
  "useTabs": false,
  "trailingComma": "es5",
  "printWidth": 100,
  "bracketSpacing": true,
  "bracketSameLine": false,
  "arrowParens": "always",
  "endOfLine": "lf",
  "quoteProps": "as-needed",
  "jsxSingleQuote": false,
  "embeddedLanguageFormatting": "auto"
}
```

### `README.md`
```markdown
# @agency/config-prettier

Shared Prettier configuration for the agency monorepo.

## Usage

### In a package/app `package.json`:
```json
{
  "prettier": "@agency/config-prettier"
}
```

### Or in `.prettierrc.json`:
```json
"@agency/config-prettier"
```

## Configuration

- **semi**: true - Always use semicolons
- **singleQuote**: false - Use double quotes
- **tabWidth**: 2 - 2 spaces for indentation
- **trailingComma**: "es5" - Trailing commas where valid in ES5
- **printWidth**: 100 - Wrap lines at 100 characters
- **endOfLine**: "lf" - Use LF line endings
```

## Usage in Root Package.json

Add to root `package.json`:
```json
{
  "scripts": {
    "format": "prettier --write \"**/*.{ts,tsx,md,json}\"",
    "format:check": "prettier --check \"**/*.{ts,tsx,md,json}\""
  },
  "prettier": "@agency/config-prettier"
}
```

## Usage in Apps/Packages

Each app/package should reference the shared config:
```json
{
  "name": "@agency/my-app",
  "prettier": "@agency/config-prettier",
  "devDependencies": {
    "@agency/config-prettier": "workspace:*",
    "prettier": "3.5.0"
  }
}
```

## Prettier Ignore

Root `.prettierignore` (from TASK_0):
```gitignore
.next/
dist/
build/
coverage/
node_modules/
.pnpm-store/
pnpm-lock.yaml
.turbo/
*.generated.ts
```

## Verification

```bash
# Check formatting without changing files
pnpm format:check

# Fix formatting issues
pnpm format

# Check a specific package
pnpm --filter @agency/ui-design-system format:check
```

## IDE Integration

### VS Code
Install "Prettier - Code: formatter" extension. Settings in TASK_35.

### WebStorm
Enable "Reformat code" with Prettier on save.

## CI Integration

Add to CI workflow (TASK_25):
```yaml
- name: Check formatting
  run: pnpm format:check
```
