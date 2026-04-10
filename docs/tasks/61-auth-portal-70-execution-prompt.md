# 61-auth-portal: Agent Handoff Prompt

## Context

You are implementing `@agency/auth-portal`, the Better Auth-based authentication package for client portals. This uses Better Auth 1.6.2 with Drizzle adapter.

## Critical: Better Auth 1.6.x Breaking Changes (Introduced in 1.6.0)

**Adapter Import Changed:**
```typescript
// WRONG (pre-1.6.x):
import { drizzleAdapter } from "better-auth/adapters/drizzle";

// CORRECT (1.6.2):
import { drizzleAdapter } from "@better-auth/drizzle-adapter";
```

**Session Freshness Changed:**
- In 1.6.x: `session.freshAge` calculates from `createdAt` (not `updatedAt`)
- Session activity no longer extends freshness window
- To disable: `{ session: { freshAge: 0 } }`

**OIDC Provider Deprecated:**
- `oidc-provider` plugin emits deprecation warning
- Migrate to `@better-auth/oauth-provider` if needed

## Files to Read First

1. `docs/tasks/61-auth-portal-00-overview.md` — Purpose and scope
2. `docs/tasks/61-auth-portal-10-spec.md` — Implementation spec (updated for 1.6.2)
3. `docs/tasks/61-auth-portal-20-constraints.md` — Security rules
4. `docs/tasks/61-auth-portal-30-adr-better-auth.md` — Why Better Auth was chosen
5. `docs/tasks/61-auth-portal-40-guide-setup.md` — Setup instructions

## What to Build

Create the package at `packages/auth/portal/` with:

### Required Files
- `package.json` — Dependencies: `better-auth@1.6.2`, `@better-auth/drizzle-adapter@1.6.2`, `@agency/data-db`, `@agency/core-types`
- `tsconfig.json` — Extends `@agency/config-typescript`
- `01-config-biome-migration-50-ref-quickstart.md` — Usage documentation with 1.6.x notes
- `src/index.ts` — Public exports
- `src/auth.ts` — Better Auth server configuration
- `src/client.ts` — Better Auth client
- `src/types.ts` — TypeScript interfaces
- `src/supabase-auth.ts` — Supabase fallback (if implementing dual-provider)
- `src/supabase-client.ts` — Supabase client fallback

### Implementation Template

```typescript
// src/auth.ts
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import type { DatabaseClient } from "@agency/data-db";

export function createAuth(db: DatabaseClient) {
  return betterAuth({
    database: drizzleAdapter(db, { provider: "pg" }),
    experimental: { 
      joins: true // Enable for 2-3x performance improvement
    },
    plugins: [
      // Enable as needed:
      // organization(), // Multi-tenant support
      // twoFactor(),    // 2FA
      // passkey(),      // WebAuthn
    ]
  });
}
```

### Package Exports

```json
{
  "exports": {
    ".": "./src/index.ts",
    "./auth": "./src/auth.ts",
    "./auth-better": "./src/auth.ts",
    "./auth-supabase": "./src/supabase-auth.ts",
    "./client": "./src/client.ts",
    "./client-better": "./src/client.ts",
    "./client-supabase": "./src/supabase-client.ts",
    "./types": "./src/types.ts"
  }
}
```

## Constraints (DO NOT VIOLATE)

1. **Must use `@better-auth/drizzle-adapter`** — Not the old built-in adapter
2. **Must import from `@agency/data-db`** — For database client
3. **No UI domain imports** — Keep auth separate from `@agency/ui-*`
4. **Environment-based provider selection** — `AUTH_PROVIDER` env var
5. **Organization = Client mapping** — Each agency client is one Better Auth org

## Database Schema Requirements

Before using this package:
1. Run the Better Auth CLI generator command from the setup guide to create Drizzle schema
2. Apply migrations: `pnpm --filter @agency/data-db drizzle:migrate`
3. Verify tables: `user`, `session`, `account`, `verification`
4. If using organizations: also `organization`, `member`, `invitation`

## Multi-Tenant Configuration

If implementing organization support:

```typescript
import { organization } from "better-auth/plugins";

plugins: [
  organization({
    // Restrict organization creation to admin users
    allowUserToCreateOrganization: false
  })
]
```

Map agency clients to organizations:
```typescript
// When creating new agency client
await auth.api.createOrganization({
  name: client.companyName,
  slug: client.slug
});
```

## Testing Requirements

- Unit test: Auth configuration loads
- Integration test: Database connection with Drizzle adapter
- E2E test: Sign-up, sign-in, session validation, sign-out
- Multi-tenant test: Organization isolation (if enabled)

## Verification Steps

1. Build passes: `pnpm --filter @agency/auth-portal build`
2. Typecheck passes: `pnpm --filter @agency/auth-portal typecheck`
3. Lint passes: `pnpm --filter @agency/auth-portal lint`
4. Schema generation step from the setup guide works
5. Migrations apply: `drizzle-kit migrate` succeeds
6. Test app can: sign up, sign in, access protected route, sign out

## Questions to Resolve

- [ ] Is organization/multi-tenant support needed immediately? (can be added later)
- [ ] Which client portal is the first consumer?
- [ ] Is passkey support required? (2026 standard, but optional)
- [ ] Supabase fallback needed now? (can add later)

## Migration from 1.5.x (If Applicable)

If updating existing implementation:
1. Update dependencies: `pnpm up better-auth@1.6.2`
2. Install adapter: `pnpm add @better-auth/drizzle-adapter@1.6.2`
3. Update import path in `auth.ts`
4. Review session freshness configuration
5. Test thoroughly before deploying

## Output

When complete, update:
- [ ] `docs/tasks/61-auth-portal-60-qa-checklist.md` — Mark items complete
- [ ] `CHANGELOG.md` in package — Document 1.6.2 implementation
- [ ] Create follow-up task for organization plugin if not implemented now


