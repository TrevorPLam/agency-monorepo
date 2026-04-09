# 60-auth-internal: Agent Handoff Prompt

## Context

You are implementing `@agency/auth-internal`, the Clerk-based authentication package for internal tools (CRM, invoicing, project tracker).

## Files to Read First

1. `docs/tasks/60-auth-internal/00-auth-internal-overview.md` — Purpose and scope
2. `docs/tasks/60-auth-internal/01-auth-internal-spec.md` — Implementation spec
3. `docs/tasks/60-auth-internal/02-auth-internal-constraints.md` — Security rules
4. `docs/tasks/60-auth-internal/03-auth-internal-adr-clerk.md` — Why Clerk was chosen
5. `docs/tasks/60-auth-internal/04-auth-internal-guide-setup.md` — Setup instructions

## What to Build

Create the package at `packages/auth/internal/` with:

### Required Files
- `package.json` — Dependencies: `@clerk/nextjs@7.0.12`, `@agency/core-types`
- `tsconfig.json` — Extends `@agency/config-typescript`
- `README.md` — Usage documentation
- `src/index.ts` — Public exports
- `src/proxy.ts` — Next.js 16+ proxy (or `middleware.ts` for ≤15)
- `src/session.ts` — Session helpers
- `src/roles.ts` — Role type definitions

### Implementation Notes

**Next.js Version Check:**
- If implementing for Next.js 16+: use `proxy.ts` with exported `proxy()` function
- If implementing for Next.js ≤15: use `middleware.ts` with exported `middleware()` function

**Clerk 7.x Async Pattern:**
```typescript
// Server-side (async in 7.x+)
const { userId } = await auth();

// Client-side (remains sync)
const { userId } = useAuth();
```

**Package Exports:**
```json
{
  "exports": {
    ".": "./src/index.ts",
    "./proxy": "./src/proxy.ts",
    "./session": "./src/session.ts",
    "./roles": "./src/roles.ts"
  }
}
```

## Constraints (DO NOT VIOLATE)

1. **No database imports** — `@agency/auth-internal` must NOT import from `@agency/data-db`
2. **No UI domain imports** — Keep auth separate from `@agency/ui-*`
3. **Only Clerk SDK** — No other auth providers in this package
4. **Environment variables only** — No hard-coded API keys
5. **Server/client separation** — Server code in `session.ts`, client hooks separate

## Testing Requirements

- Unit test: Session validation logic
- Integration test: Sign-in flow with test credentials
- E2E test (in consuming app): Protected route access

## Verification Steps

1. Build passes: `pnpm --filter @agency/auth-internal build`
2. Typecheck passes: `pnpm --filter @agency/auth-internal typecheck`
3. Lint passes: `pnpm --filter @agency/auth-internal lint`
4. Test app can: sign in, access protected route, sign out

## Questions to Resolve

- [ ] What roles are needed? (suggest: admin, manager, viewer)
- [ ] Which internal tool is the first consumer? (usually CRM)
- [ ] Next.js version of target app? (determines proxy.ts vs middleware.ts)

## Output

When complete, update:
- [ ] `docs/tasks/60-auth-internal/05-auth-internal-qa-checklist.md` — Mark items complete
- [ ] `CHANGELOG.md` in package — Document initial implementation
- [ ] Create follow-up task if enterprise SSO anticipated
