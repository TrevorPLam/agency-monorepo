# 00-foundation/00-root-scaffolding: Root Repository Scaffolding

## Purpose
Create the foundation of the monorepo with workspace configuration, package manager setup, and orchestration tooling.

## Dependencies
- None (this is the first task)
- Followed by: TASK_1 (ESLint), TASK_2 (TypeScript), TASK_35 (VS Code settings)

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
├── README.md (see TASK_32)
└── .vscode/ (see TASK_35)
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
24.0.0
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
  "packageManager": "pnpm@10.33.0",
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
    "@changesets/cli": "2.30.0",
    "prettier": "3.5.0",
    "turbo": "2.9.4"
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
```

### `turbo.json`
```json
{
  "$schema": "https://turbo.build/schema.json",
  "globalDependencies": ["**/.env.*local", "**/tsconfig.json"],
  "globalEnv": ["NODE_ENV", "DATABASE_URL"],
  "pipeline": {
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
5. **Prettier Integration**: Root `format` script uses Prettier (config in TASK_34)

## Verification Steps

```bash
# Verify Node version
node -v  # Should be v24.x.x

# Verify pnpm version
pnpm -v  # Should be 10.33.0

# Verify workspace recognition
pnpm recursive list  # Should list all packages

# Verify Turbo tasks
pnpm turbo build --dry-run

# Verify formatting works (after TASK_34)
pnpm format:check
```

## Next Steps

1. Create TASK_1 (ESLint Config)
2. Create TASK_2 (TypeScript Config)
3. Create TASK_3 (Tailwind Config)
4. Create TASK_34 (Prettier Config)
5. Create TASK_35 (VS Code Settings)
