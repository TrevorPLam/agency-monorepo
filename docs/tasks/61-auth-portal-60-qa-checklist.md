# 61-auth-portal: QA Checklist

## Pre-Implementation

- [ ] Review 61-auth-portal-20-constraints.md
- [ ] Review 61-auth-portal-30-adr-better-auth.md
- [ ] Database schema ready with Drizzle
- [ ] Environment variables documented
- [ ] Client isolation strategy defined

## Implementation Verification

### Package Structure
- [ ] `@agency/auth-portal` package created in `packages/auth/portal/`
- [ ] `package.json` has correct exports field
- [ ] `better-auth@1.6.2` installed
- [ ] `@better-auth/drizzle-adapter@1.6.2` installed
- [ ] No imports from higher-level domains except `@agency/data-db`

### Database Schema
- [ ] Better Auth tables created via the approved Better Auth CLI generation step
- [ ] Migrations applied to database
- [ ] Relations defined in Drizzle schema (if using experimental joins)
- [ ] Indexes on session table for performance

### Auth Configuration
- [ ] `BETTER_AUTH_SECRET` set (32+ bytes, cryptographically random)
- [ ] `BETTER_AUTH_URL` matches application domain
- [ ] Drizzle adapter configured with `provider: "pg"`
- [ ] Experimental joins enabled (optional, for performance)
- [ ] 1.6.x session freshness behavior understood

### API Routes
- [ ] `[...all]/route.ts` created for Better Auth API
- [ ] Database client passed to auth handler
- [ ] API routes tested in development

### Session Validation
- [ ] Server-side session validation works
- [ ] Client-side session hooks work
- [ ] Session rejected when expired
- [ ] Session refresh works correctly

### Multi-Tenant (If Enabled)
- [ ] Organization plugin configured
- [ ] Organization creation restricted to admins
- [ ] Client-to-organization mapping defined
- [ ] Cross-organization access blocked

## Security Checks

- [ ] Environment variables not committed to git
- [ ] `BETTER_AUTH_SECRET` never exposed to client
- [ ] Cookies are `httpOnly`, `secure`, `sameSite=lax` minimum
- [ ] Session tokens rotated on privilege change
- [ ] Rate limiting on auth endpoints

## Better Auth 1.6.x Specific

- [ ] Import path updated: `@better-auth/drizzle-adapter`
- [ ] Session freshness behavior reviewed (createdAt vs updatedAt)
- [ ] OIDC provider not used (deprecated) or migration planned
- [ ] Experimental joins enabled if using organizations heavily

## Provider Fallback (Supabase)
- [ ] `AUTH_PROVIDER` environment variable works
- [ ] Supabase Auth configuration valid
- [ ] Switching between providers documented
- [ ] Dual-provider tests pass

## Integration Tests

- [ ] Sign-up flow works end-to-end
- [ ] Sign-in flow works end-to-end
- [ ] Sign-out clears session
- [ ] Protected routes reject unauthenticated users
- [ ] Organization switching works (if enabled)
- [ ] Passkey registration works (if enabled)

## Performance

- [ ] Session queries performant (<100ms)
- [ ] Experimental joins show improvement (if enabled)
- [ ] No N+1 query issues with organizations
- [ ] Database connection pooling working

## Migration Testing (If Applicable)

- [ ] 1.5.x to 1.6.x migration tested
- [ ] Import paths updated
- [ ] Session behavior verified after migration
- [ ] Rollback plan documented

## Documentation

- [ ] 01-config-biome-migration-50-ref-quickstart.md describes package usage
- [ ] Better Auth 1.6.x breaking changes documented
- [ ] Organization setup guide (if applicable)
- [ ] Environment variables documented

## Exit Criteria

- [ ] All checklist items complete
- [ ] CI passes (build, lint, typecheck)
- [ ] At least one client portal using the package
- [ ] Code review approved
- [ ] Security audit passed
