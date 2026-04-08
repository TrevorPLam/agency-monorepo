# 13-config-prettier: Implementation Specification

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
  "main": "index.json",
  "files": ["index.json", "README.md"],
  "publishConfig": { "access": "restricted" }
}
```

### `index.json`
```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": false,
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false,
  "bracketSpacing": true,
  "arrowParens": "always",
  "endOfLine": "lf"
}
```

## Usage

**In consuming package `package.json`:**
```json
{
  "prettier": "@agency/config-prettier"
}
```

**Or in `.prettierrc`:**
```json
"@agency/config-prettier"
```

**Root `package.json` scripts:**
```json
{
  "scripts": {
    "format": "prettier --write \"**/*.{ts,tsx,md,json}\"",
    "format:check": "prettier --check \"**/*.{ts,tsx,md,json}\""
  }
}
```

## Verification

```bash
# Check formatting
pnpm format:check

# Fix formatting
pnpm format
```
