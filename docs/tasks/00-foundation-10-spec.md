# 00-foundation: Implementation Specification

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
>
> **Versions in this document:** Must be cross-referenced against `DEPENDENCY.md`. Do not use versions from this file without verification.

## Task Header

| Field | Value |
|-------|-------|
| **State** | `planned` — Documented target; implementation not yet authorized |
| **Trigger** | Repository initialization — always required |
| **Minimum Consumers** | n/a (root infrastructure) |
| **Dependencies** | Node 24.x LTS, pnpm 10.15.1 |
| **Exit Criteria** | Root package.json, pnpm-workspace.yaml, turbo.json committed and verified |
| **Implementation Authority** | `REPO-STATE.md` — Phase: Planning, Build status: Not started |
| **Version Authority** | `DEPENDENCY.md` §1 — pnpm 10.15.1 locked via packageManager |
| **Supersedes** | n/a |
| **Superseded by** | n/a |

**Cross-references:**
- Decision status: `DECISION-STATUS.md` — pnpm workspaces + Turborepo `locked`
- Version pins: `DEPENDENCY.md` §1, §3
- Architecture: `ARCHITECTURE.md` — Final stack section

## Files

### Root Directory Structure
```
agency-monorepo/
├── .gitignore
├── .nvmrc
├── .prettierignore
├── package.json
├── pnpm-workspace.yaml
├── turbo.json
├── 01-config-biome-migration-50-ref-quickstart.md (see `e0-apps-root-readme`)
└── .vscode/ (see `d0-infra-vscode`)
    ├── settings.json
    ├── extensions.json
    └── launch.json
```

### `.gitignore`
```gitignore
# Dependencies
node_modules/
.pnpm-store/

# Build outputs
.next/
dist/
build/
*.tsbuildinfo

# Environment
.env
.env.local
.env.*.local
.env.production

# Logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*
lerna-debug.log*

# Testing
coverage/
.nyc_output/

# Turbo
.turbo/

# IDE
.vscode/*
!.vscode/extensions.json
!.vscode/settings.json
.idea/
*.swp
*.swo
*~

# OS
.DS_Store
Thumbs.db

# Misc
*.pem
*.der
*.cert
```

### `.nvmrc`
```
24.11.0
```

### `.prettierignore`
```gitignore
# Build outputs
.next/
dist/
build/
coverage/

# Dependencies
node_modules/
.pnpm-store/

# Lock files
pnpm-lock.yaml
package-lock.json
yarn.lock

# Turbo
.turbo/

# Generated files
*.generated.ts
*.generated.tsx
```

### `package.json`
```json
{
  "name": "agency-monorepo",
  "version": "0.1.0",
  "private": true,
  "description": "Agency monorepo with pnpm workspaces and Turborepo",
  "packageManager": "pnpm@10.15.1",
  "engines": {
    "node": ">=20.9.0"
  },
  "scripts": {
    "build": "turbo run build",
    "dev": "turbo run dev",
    "lint": "turbo run lint",
    "test": "turbo run test",
    "typecheck": "turbo run typecheck",
    "format": "prettier --write \"**/*.{ts,tsx,md,json}\"",
    "format:check": "prettier --check \"**/*.{ts,tsx,md,json}\"",
    "changeset": "changeset",
    "version-packages": "changeset version",
    "release": "turbo run build --filter=!docs && changeset publish",
    "clean": "turbo run clean && rm -rf node_modules .turbo"
  },
  "devDependencies": {
    "@changesets/cli": "2.29.6",
    "prettier": "3.6.2",
    "turbo": "2.5.6"
  }
}
```

### `pnpm-workspace.yaml`
```yaml
packages:
  - "apps/*"
  - "packages/*"
  - "packages/**/*"
  - "tools/*"

# Centralized dependency version management
# Use "catalog:" in package.json to reference these versions
catalog:
  # Core runtime dependencies — Milestone 1 only
  react: 19.2.0
  react-dom: 19.2.0
  next: 16.2.0
  typescript: 5.8.3
  
  # Styling — Milestone 1 only
  tailwindcss: 4.1.12
  
  # Development dependencies — Milestone 1 only
  "@types/react": 19.2.0
  "@types/node": 22.15.0
  eslint: ^9.0.0
  
  # Build tools — Milestone 1 only
  turbo: 2.5.6
```

### `turbo.json`
```json
{
  "$schema": "https://turbo.build/schema.json",
  "globalDependencies": ["**/.env.*local", "**/tsconfig.json"],
  "globalEnv": ["NODE_ENV", "DATABASE_URL"],
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "!.next/cache/**", "dist/**"]
    },
    "lint": {
      "dependsOn": ["^build"]
    },
    "typecheck": {
      "dependsOn": ["^build"]
    },
    "test": {
      "dependsOn": ["^build"]
    },
    "clean": {
      "cache": false
    },
    "dev": {
      "cache": false,
      "persistent": true
    }
  }
}
```

## Critical Requirements

1. **Node Version**: 24.x LTS (minimum 20.9.0 for Next.js 16 compatibility)
2. **pnpm Version**: 10.33.0 locked via `packageManager` field
3. **Workspace Pattern**: Must include `packages/**/*` for nested package structure
4. **Turborepo Remote Caching**: Configure `TURBO_TOKEN` and `TURBO_TEAM` env vars in CI
5. **Prettier Integration**: Root `format` script uses Prettier (config in `13-config-prettier`)

## Verification Steps

```bash
# Verify Node version
node -v  # Should be v24.x.x

# Verify pnpm version
pnpm -v  # Should be 10.15.1

# Verify workspace recognition
pnpm recursive list  # Should list all packages

# Verify Turbo tasks
pnpm turbo build --dry-run

# Verify formatting works (after `13-config-prettier`)
pnpm format:check
```
