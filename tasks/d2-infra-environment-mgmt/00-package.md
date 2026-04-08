# d2-infra-environment-mgmt/00-package: Environment and Secrets Management

## Purpose
Establish secure patterns for managing environment variables, secrets, and configuration across development, staging, and production.

## Dependencies
- TASK_0 (Root Repository Scaffolding)

## Files

```
docs/
└── environment/
    ├── environment-setup.md
    ├── secrets-management.md
    └── env-validation.md
tools/
└── scripts/
    └── validate-env.ts
```

### Environment Validation Script (`tools/scripts/validate-env.ts`)
```typescript
#!/usr/bin/env tsx

/**
 * Environment Variable Validation Script
 * 
 * Usage:
 *   pnpm env:validate              # Validate current env
 *   pnpm env:validate --schema=app # Validate specific schema
 *   pnpm env:validate --strict     # Fail on warnings
 */

import { z } from "zod";
import { config } from "dotenv";
import { resolve } from "path";
import { existsSync } from "fs";

// Base schema for all apps
const baseSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  NEXT_PUBLIC_APP_URL: z.string().url(),
});

// Database schema
const databaseSchema = baseSchema.extend({
  DATABASE_URL: z.string().regex(/^postgresql:\/\//, "Must be a PostgreSQL URL"),
});

// Internal tool schema (with Clerk)
const internalToolSchema = databaseSchema.extend({
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string().startsWith("pk_"),
  CLERK_SECRET_KEY: z.string().startsWith("sk_"),
  NEXT_PUBLIC_CLERK_SIGN_IN_URL: z.string().default("/sign-in"),
  NEXT_PUBLIC_CLERK_SIGN_UP_URL: z.string().default("/sign-up"),
});

// Client portal schema (with Better Auth)
const portalSchema = databaseSchema.extend({
  BETTER_AUTH_SECRET: z.string().min(32),
  NEXT_PUBLIC_AUTH_URL: z.string().url(),
});

const schemas = {
  base: baseSchema,
  database: databaseSchema,
  internal: internalToolSchema,
  portal: portalSchema,
  app: internalToolSchema, // alias
};

async function validateEnv() {
  const args = process.argv.slice(2);
  const schemaName = args.find(arg => arg.startsWith("--schema="))?.split("=")[1] || "base";
  const strict = args.includes("--strict");
  
  // Load .env.local if it exists
  const envPath = resolve(process.cwd(), ".env.local");
  if (existsSync(envPath)) {
    config({ path: envPath });
  }
  
  const schema = schemas[schemaName as keyof typeof schemas];
  if (!schema) {
    console.error(`Unknown schema: ${schemaName}`);
    console.error(`Available schemas: ${Object.keys(schemas).join(", ")}`);
    process.exit(1);
  }
  
  console.log(`Validating environment with schema: ${schemaName}\n`);
  
  const result = schema.safeParse(process.env);
  
  if (!result.success) {
    console.error("❌ Environment validation failed:\n");
    
    for (const issue of result.error.issues) {
      const path = issue.path.join(".");
      const isMissing = issue.message.includes("Required");
      const prefix = isMissing ? "🔴 MISSING" : "⚠️  INVALID";
      console.error(`${prefix}: ${path}`);
      console.error(`   ${issue.message}\n`);
    }
    
    if (strict || result.error.issues.some(i => i.message.includes("Required"))) {
      process.exit(1);
    } else {
      console.warn("⚠️  Warnings found but continuing (use --strict to fail)");
    }
  } else {
    console.log("✅ Environment validation passed!");
    console.log(`\nValidated ${Object.keys(result.data).length} variables`);
  }
}

validateEnv();
```

### Environment Setup Guide (`docs/environment/environment-setup.md`)
```markdown
# Environment Setup Guide

## Overview

This guide covers how to configure environment variables for the monorepo.

## Environment Files

### Root Level (Not Recommended for Secrets)
Root `.env` files affect all apps but shouldn't contain secrets:
```
TURBO_TOKEN=xxx          # OK: Turborepo remote cache
TURBO_TEAM=agency        # OK: Team identifier
```

### Per-App Environment
Each app has its own `.env.local`:
```
apps/internal-tools/crm/.env.local
apps/agency-website/.env.local
```

### Environment File Hierarchy

```
.env                 # Default (committed, no secrets)
.env.local           # Local overrides (gitignored)
.env.[mode]          # Mode-specific (e.g., .env.test)
.env.[mode].local    # Mode-specific local overrides
```

## Required Variables by App Type

### All Apps
```bash
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Database-Connected Apps
```bash
DATABASE_URL=postgresql://user:pass@host:5432/dbname
```

### Internal Tools (Clerk)
```bash
# Required
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Optional (defaults shown)
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/
```

### Client Portals (Better Auth)
```bash
BETTER_AUTH_SECRET=your-secret-min-32-chars
NEXT_PUBLIC_AUTH_URL=http://localhost:3000
```

## Getting Clerk Keys

1. Go to https://dashboard.clerk.com
2. Create or select your application
3. Copy keys from "API Keys" section:
   - **Publishable key**: starts with `pk_test_` or `pk_live_`
   - **Secret key**: starts with `sk_test_` or `sk_live_`

## Getting Neon Database URL

1. Go to https://console.neon.tech
2. Select your project
3. Click "Connection Details"
4. Copy the connection string
5. Format: `postgresql://user:pass@host:5432/dbname?sslmode=require`

## Local Development Setup

```bash
# 1. Copy example file
cd apps/internal-tools/crm
cp .env.example .env.local

# 2. Edit .env.local with your values
# (Use 1Password or similar for secrets)

# 3. Validate environment
pnpm env:validate --schema=internal

# 4. Start development
pnpm dev
```

## Vercel Deployment

### Adding Environment Variables

1. Go to Vercel Dashboard → Select Project
2. Settings → Environment Variables
3. Add variables for each environment:
   - Production
   - Preview (for PR deployments)
   - Development

### CLI Method
```bash
# Link local project to Vercel
vercel link

# Pull environment variables
vercel env pull .env.local

# Add environment variable
vercel env add DATABASE_URL production
```

## Security Best Practices

### DO
- ✅ Use strong, unique secrets for each environment
- ✅ Rotate secrets regularly (every 90 days)
- ✅ Use 1Password/Bitwarden for team secret sharing
- ✅ Validate environment variables at startup
- ✅ Use separate databases per environment

### DON'T
- ❌ Never commit `.env.local` or `.env.production`
- ❌ Never share production secrets in Slack/Discord
- ❌ Don't use the same Clerk keys for dev and production
- ❌ Don't log secrets (mask them in error messages)
- ❌ Don't expose internal URLs publicly

## Troubleshooting

### "Missing environment variable" error
Run validation to see which variables are missing:
```bash
pnpm env:validate --schema=internal --strict
```

### Database connection fails
1. Check DATABASE_URL format
2. Verify IP allowlist (Neon/Vercel)
3. Test connection: `psql $DATABASE_URL -c "SELECT 1"`

### Clerk authentication fails
1. Verify keys start with correct prefix (pk_/sk_)
2. Check you're using test keys for development
3. Verify sign-in/sign-up URLs are configured
```

### Secrets Management Guide (`docs/environment/secrets-management.md`)
```markdown
# Secrets Management

## Overview

Secure handling of API keys, database credentials, and authentication secrets.

## Team Secret Sharing (1Password Example)

### Setup
1. Create shared vault: "Agency Development"
2. Store credentials per environment:
   - `Agency CRM - Development`
   - `Agency CRM - Production`
   
### Secret Format
```
Title: Agency CRM - Development
Category: Database
Fields:
  - DATABASE_URL: postgresql://...
  - CLERK_PUBLISHABLE_KEY: pk_test_...
  - CLERK_SECRET_KEY: sk_test_...
```

### Onboarding New Team Member
1. Add to 1Password vault
2. Share vault invite link
3. Document: "Get secrets from 1Password vault 'Agency Development'"

## CI/CD Secrets

### GitHub Actions
Secrets stored in GitHub → Settings → Secrets and variables → Actions:

```
DATABASE_URL_STAGING       # Staging database
DATABASE_URL_PRODUCTION    # Production database
CLERK_SECRET_KEY           # Production Clerk key
VERCEL_TOKEN              # Vercel deployment
TURBO_TOKEN               # Turborepo remote cache
```

### Accessing in Workflows
```yaml
env:
  DATABASE_URL: ${{ secrets.DATABASE_URL_STAGING }}
```

## Secret Rotation

### Scheduled Rotation (Every 90 Days)
1. Generate new secret in service dashboard
2. Update 1Password vault
3. Update Vercel environment variables
4. Update GitHub secrets if used in CI
5. Revoke old secret after 24-hour grace period

### Emergency Rotation
1. Immediately revoke compromised secret
2. Generate replacement
3. Update all environments simultaneously
4. Notify team via secure channel

## Audit Trail

Keep log of:
- Who has access to which secrets
- When secrets were last rotated
- Which services use which secrets

Template:
```markdown
| Secret | Environment | Last Rotated | Owner |
|--------|-------------|--------------|-------|
| DATABASE_URL | Production | 2025-01-15 | Platform Team |
| CLERK_SECRET_KEY | Production | 2025-01-15 | Security Lead |
```

## Local Secret Storage

### macOS: Keychain
```bash
# Store secret
security add-generic-password -s "agency-crm" -a "database-url" -w "postgresql://..."

# Retrieve secret
security find-generic-password -s "agency-crm" -a "database-url" -w
```

### Cross-Platform: 1Password CLI
```bash
# Install: brew install 1password-cli

# Get secret
export DATABASE_URL=$(op read "op://Agency Development/CRM/database-url")
```
```

## Root package.json Scripts

Add to root `package.json`:
```json
{
  "scripts": {
    "env:validate": "tsx tools/scripts/validate-env.ts",
    "env:example": "find apps -name '.env.example' -exec echo '=== {} ===' \; -exec cat {} \;"
  }
}
```

## Verification

```bash
# Validate development environment
cd apps/internal-tools/crm
pnpm env:validate --schema=internal

# Validate with strict mode (fail on warnings)
pnpm env:validate --schema=internal --strict
```

## Related Tasks
- TASK_11: Database Package (DATABASE_URL setup)
- TASK_12: Internal Auth (Clerk keys)
- TASK_13: Portal Auth (Better Auth secrets)
- TASK_39: Deployment Guide (Vercel env setup)
