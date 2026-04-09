# 13-config-prettier: Implementation Specification

## Task Header

| Field | Value |
|-------|-------|
| **State** | `planned` — Documented target; implementation not yet authorized |
| **Trigger** | Repository initialization — always required |
| **Minimum Consumers** | n/a (root infrastructure) |
| **Dependencies** | Prettier 3.5.0 |
| **Exit Criteria** | Root package.json, pnpm-workspace.yaml, turbo.json committed and verified |
| **Implementation Authority** | `REPO-STATE.md` — Phase: Planning, Build status: Not started |
| **Version Authority** | `DEPENDENCY.md` §13 — Prettier 3.5.0 |
| **Supersedes** | n/a |
| **Superseded by** | `01-config-biome-migration` (if Biome replaces Prettier) |

**Cross-references:**
- Decision status: `DECISION-STATUS.md` — Prettier canonical until Biome evaluation complete
- Version pins: `DEPENDENCY.md` §13
- Related: Task 01 (biome-migration) may supersede if approved

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
