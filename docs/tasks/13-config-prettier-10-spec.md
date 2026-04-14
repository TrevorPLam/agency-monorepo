# 13-config-prettier: Implementation Specification

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
| **Dependencies** | Prettier 3.6.2 |
| **Exit Criteria** | Root package.json, pnpm-workspace.yaml, turbo.json committed and verified |
| **Implementation Authority** | `REPO-STATE.md` — Phase: Planning, Build status: Not started |
| **Version Authority** | `DEPENDENCY.md` §4 — Prettier 3.6.2 |
| **Supersedes** | n/a |
| **Superseded by** | `01-config-biome-migration` (if Biome replaces Prettier) |

**Cross-references:**
- Decision status: `DECISION-STATUS.md` — Prettier remains canonical while Biome evaluation stays deferred
- Version pins: `DEPENDENCY.md` §4
- Related: Task 01 (biome-migration) may supersede if approved

## Files
```
packages/config/prettier-config/
├── package.json
├── index.json
└── 01-config-biome-migration-50-ref-quickstart.md
```

### `package.json`
```json
{
  "name": "@agency/config-prettier",
  "version": "0.1.0",
  "private": true,
  "main": "index.json",
  "files": ["index.json", "01-config-biome-migration-50-ref-quickstart.md"],
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
