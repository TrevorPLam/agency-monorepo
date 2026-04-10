# D1 Infra Db Migrations Specification

## Task Header

| Field | Value |
|-------|-------|
| **State** | `planned` — Documented target; implementation not yet authorized |
| **Trigger** | First approved database implementation using the shared data layer |
| **Minimum Consumers** | Repository-wide once the database lane is activated |
| **Dependencies** | `50-data-db`, `d2-infra-environment-mgmt`, `a5-docs-tenant-isolation-data-governance`, `a6-docs-dependency-truth-version-authority` |
| **Exit Criteria** | Migration scripts, workflow hooks, and safety rules are specified clearly for development, CI, and production |
| **Implementation Authority** | `REPO-STATE.md` — Planning only until the database lane is approved |
| **Version Authority** | `DEPENDENCY.md` §1, §4 when implementation becomes approved |
| **Supersedes** | n/a |
| **Superseded by** | n/a |

## Cross-references

- Decision status: `DECISION-STATUS.md` — Database access through shared package `locked`
- Version governance: `docs/standards/dependency-truth.md`
- Tenant isolation: `docs/standards/tenant-isolation-data-governance.md`
- Related tasks: `50-data-db`, `d2-infra-environment-mgmt`

## Files

```
docs/
└── database/
    └── migrations.md
tools/
└── scripts/
    └── migrate.ts
.github/
└── workflows/
    └── db-migrate.yml
```

### Migration Script (`tools/scripts/migrate.ts`)
```typescript
#!/usr/bin/env tsx

/**
 * Database Migration Script
 * 
 * Usage:
 *   pnpm db:migrate          # Run pending migrations
 *   pnpm db:migrate --dry-run # Preview without applying
 *   pnpm db:migrate --force   # Skip confirmations in production
 */

import { drizzle } from "drizzle-orm/neon-http";
import { migrate } from "drizzle-orm/neon-http/migrator";
import { neon } from "@neondatabase/serverless";
import { config } from "dotenv";
import { resolve } from "path";
import { fileURLToPath } from "url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));

// Load environment variables
config({ path: resolve(__dirname, "../../.env.local") });

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error("Error: DATABASE_URL environment variable is required");
  process.exit(1);
}

async function runMigrations() {
  const args = process.argv.slice(2);
  const dryRun = args.includes("--dry-run");
  const force = args.includes("--force");
  
  console.log(`Database URL: ${DATABASE_URL.replace(/:[^:@]+@/, ":****@")}`);
  console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
  
  if (dryRun) {
    console.log("\n[DRY RUN MODE] Migrations will not be applied");
  }
  
  // Safety check for production
  if (DATABASE_URL.includes("production") && !force) {
    console.error("\n⚠️  WARNING: This appears to be a production database!");
    console.error("Use --force flag to proceed with production migrations.");
    process.exit(1);
  }
  
  try {
    const sql = neon(DATABASE_URL);
    const db = drizzle(sql);
    
    const migrationsFolder = resolve(__dirname, "../../packages/data/database/migrations");
    
    if (dryRun) {
      console.log(`\nWould apply migrations from: ${migrationsFolder}`);
      // List migration files
      const fs = await import("fs");
      const files = fs.readdirSync(migrationsFolder)
        .filter(f => f.endsWith(".sql"))
        .sort();
      console.log(`Found ${files.length} migration files`);
      files.forEach(f => console.log(`  - ${f}`));
    } else {
      console.log("\nApplying migrations...");
      await migrate(db, { migrationsFolder });
      console.log("✅ Migrations completed successfully");
    }
  } catch (error) {
    console.error("\n❌ Migration failed:", error);
    process.exit(1);
  }
}

runMigrations();
```

### Documentation (`docs/database/migrations.md`)
```markdown
# Database Migration Workflow

## Overview

This document describes how to manage database schema changes safely across environments.

## Migration Philosophy

1. **Immutable History**: Never modify existing migration files after they've been applied
2. **Additive Changes**: Prefer adding columns/tables over modifying existing ones
3. **Backward Compatibility**: Migrations should not break running applications
4. **Tested Migrations**: Always test migrations on a copy of production data

## Creating Migrations

### Using Drizzle Kit

```bash
# Generate migration from schema changes
cd packages/data/database
pnpm drizzle-kit generate:neon

# This creates a new migration file in ./migrations/
# Review the generated SQL before committing
```

### Migration Naming

Migration files are named automatically by Drizzle Kit:
```
0000_init.sql
0001_add_user_table.sql
0002_add_project_status.sql
```

## Running Migrations

### Local Development

```bash
# Apply pending migrations
pnpm db:migrate

# Preview without applying
pnpm db:migrate --dry-run
```

### Production

```bash
# Production migrations require --force flag
NODE_ENV=production pnpm db:migrate --force
```

## Migration Workflow

### 1. Development Phase
```
1. Make schema changes in schema/*.ts files
2. Generate migration: pnpm drizzle-kit generate:neon
3. Review generated SQL
4. Test locally: pnpm db:migrate
5. Commit migration file
```

### 2. CI/Preview Phase
```
1. CI runs migrations automatically on preview deployments
2. Uses branch-specific database (Neon branching)
3. Tests run against migrated schema
```

### 3. Production Phase
```
1. Migration runs as part of deployment
2. Requires explicit --force flag
3. Runs before application deployment
4. Rollback plan ready if needed
```

## Neon Branching Strategy

Neon's database branching enables safe migration testing:

```
main (production)
  ├── dev-branch (shared development)
  ├── feature-auth-2025-01 (feature branch)
  └── pr-123-preview (PR preview)
```

### Creating Feature Branches

```bash
# Via Neon CLI
neon branches create --name feature-X --parent main

# Set DATABASE_URL to branch URL for testing
DATABASE_URL=postgresql://...feature-X... pnpm db:migrate
```

## Rollback Procedures

### If Migration Fails

1. **Stop deployment**: Prevent app from deploying
2. **Assess damage**: Check what was partially applied
3. **Manual cleanup**: May need to fix database state manually
4. **Fix forward**: Create new migration to fix issues

### Never Roll Back Migrations

Instead of rolling back:
1. Create a new migration that undoes the change
2. This preserves migration history
3. Safer in production environments

## Best Practices

### DO
- ✅ Review all generated SQL before committing
- ✅ Test migrations on a copy of production data
- ✅ Keep migrations small and focused
- ✅ Use transactions for data consistency
- ✅ Add indexes in separate migrations from schema changes

### DON'T
- ❌ Edit existing migration files after applying
- ❌ Delete migration files from history
- ❌ Run migrations without backups in production
- ❌ Add destructive changes without warning period
- ❌ Mix schema and data migrations (do data changes separately)

## Emergency Contacts

- Database Owner: @agency/data-owner
- Platform Team: @agency/platform-team
- On-Call Rotation: See PagerDuty
```

### CI Workflow (`.github/workflows/db-migrate.yml`)
```yaml
name: Database Migrations

on:
  push:
    branches: [main]
    paths:
      - "packages/data/database/migrations/**"
  workflow_dispatch:
    inputs:
      environment:
        description: "Environment to run migrations"
        required: true
        default: "staging"
        type: choice
        options:
          - staging
          - production
      dry_run:
        description: "Dry run (don't apply changes)"
        type: boolean
        default: false

concurrency:
  group: db-migrate-${{ github.ref }}
  cancel-in-progress: false

jobs:
  migrate:
    name: Run Database Migrations
    runs-on: ubuntu-latest
    environment: ${{ github.event.inputs.environment || 'staging' }}
    
    steps:
      - uses: actions/checkout@v4
      
      - uses: pnpm/action-setup@v3
        with:
          version: 10.33.0
      
      - uses: actions/setup-node@v4
        with:
          node-version: 24
          cache: pnpm
      
      - name: Install dependencies
        run: pnpm install --frozen-lockfile
      
      - name: Set up database connection
        run: |
          if [ "${{ github.event.inputs.environment }}" = "production" ]; then
            echo "DATABASE_URL=${{ secrets.DATABASE_URL_PRODUCTION }}" >> $GITHUB_ENV
          else
            echo "DATABASE_URL=${{ secrets.DATABASE_URL_STAGING }}" >> $GITHUB_ENV
          fi
      
      - name: Run migrations
        run: |
          if [ "${{ github.event.inputs.dry_run }}" = "true" ]; then
            pnpm db:migrate --dry-run
          elif [ "${{ github.event.inputs.environment }}" = "production" ]; then
            pnpm db:migrate --force
          else
            pnpm db:migrate
          fi
      
      - name: Verify schema
        run: |
          cd packages/data/database
          pnpm drizzle-kit check:neon
```


## Root package.json Scripts

Add to root `package.json`:
```json
{
  "scripts": {
    "db:migrate": "tsx tools/scripts/migrate.ts",
    "db:generate": "cd packages/data/database && pnpm drizzle-kit generate:neon",
    "db:check": "cd packages/data/database && pnpm drizzle-kit check:neon",
    "db:studio": "cd packages/data/database && pnpm drizzle-kit studio"
  }
}
```


## Verification

```bash
# Generate a test migration
pnpm db:generate

# Check what would be applied
pnpm db:migrate --dry-run

# Apply migrations
pnpm db:migrate

# Verify schema consistency
pnpm db:check
```


## Safety Features

1. **Dry-run mode**: Preview changes before applying
2. **Production protection**: Requires --force flag for production databases
3. **Environment isolation**: Separate databases per environment
4. **CI enforcement**: Migrations run automatically in CI
5. **Schema validation**: Post-migration schema checks
