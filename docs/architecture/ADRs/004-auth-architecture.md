# ADR 004: Dual-Lane Authentication Architecture

## Status

Accepted

## Date

2026-04-08

## Context

The agency monorepo needs authentication for two distinct use cases:

1. **Internal tools** (CRM, invoicing, project tracker): Team-only access, predictable low user counts, need for fast developer experience
2. **Client portals**: External user access, potentially high user counts, data ownership requirements, zero per-MAU cost at scale

The authentication strategy must satisfy:
- Data ownership: Client portal user data should not leave agency-controlled infrastructure
- Cost scaling: Internal tools have fixed small teams; client portals may scale to thousands
- Developer velocity: Internal tools need fast auth implementation
- Compliance flexibility: Some clients may have strict data residency requirements
- Migration safety: Auth provider changes should be isolated to single packages

## Decision

Implement a **dual-lane authentication architecture**:

- **Internal tools lane**: Clerk (`@agency/auth-internal`) — managed auth, fastest DX, per-MAU pricing acceptable at low volume
- **Client portal lane**: Better Auth (`@agency/auth-portal`) — self-hosted, zero per-MAU cost, full data ownership

### Decision Rules

1. **Never mix providers within the same app** — one auth lane per application
2. **Package isolation** — all Clerk code lives in `@agency/auth-internal`, all Better Auth code lives in `@agency/auth-portal`
3. **Provider migration** — if a provider must change, only one package is rewritten
4. **Organization mapping** — each agency client maps to one Better Auth Organization for multi-tenant isolation
5. **Escalation path** — Enterprise SSO requirements escalate to WorkOS, not to a third in-repo provider

### Better Auth 1.6.0 Configuration (Current)

```typescript
// Experimental joins enabled for 2-3x performance improvement
// Session freshness calculated from createdAt (not updatedAt as in <1.6.0)
// OIDC provider deprecated — use @better-auth/oauth-provider if needed
```

## Consequences

### Positive

- Internal tools get fastest possible auth implementation (Clerk pre-built components)
- Client portals achieve zero marginal auth cost at scale
- Data ownership remains under agency control for client-facing systems
- Package boundaries make provider migration a localized change
- Better Auth's plugin system enables 2FA, passkeys, and organization management without vendor lock-in
- Neon database branching works seamlessly with self-hosted Better Auth schema

### Negative

- Two auth systems to maintain (though isolated to separate packages)
- Team must understand two different auth APIs
- Clerk's per-MAU pricing creates cost pressure if internal tools scale unexpectedly
- Better Auth requires database connection management (handled by `@agency/data-db`)
- Migration between providers requires user password reset

### Neutral

- Documentation must cover both lanes in onboarding
- CI/CD tests needed for both auth packages
- Security audits apply to both lanes
- Each lane needs separate QA checklist

## Alternatives Considered

### Alternative: Clerk for everything

Why considered:
- Single auth system to learn and maintain
- Excellent developer experience across all apps
- Unified user management dashboard

Why rejected:
- Per-MAU pricing scales poorly for client portals with thousands of users
- Client portal user data lives outside agency-controlled infrastructure
- Data ownership requirements for some clients cannot be met

### Alternative: Better Auth for everything

Why considered:
- Single auth system to learn and maintain
- Full data ownership for all use cases
- Zero per-MAU cost across the board

Why rejected:
- Slower developer velocity for internal tools that need auth "now"
- Internal tools don't benefit from data ownership tradeoff
- Clerk's managed approach is acceptable for low-volume internal use
- Better Auth requires more setup (database schema, session management)

### Alternative: Auth.js (NextAuth v5) for client portals

Why considered:
- Popular open-source choice
- Strong Next.js integration
- Zero per-MAU cost

Why rejected:
- v5 still in beta as of April 2026
- Better Auth reached stable v1.0 and has more comprehensive feature set
- Better Auth's Drizzle adapter aligns with our database choice
- Better Auth organizations feature enables multi-tenancy natively

### Alternative: Supabase Auth for client portals (fallback)

Why considered:
- Already using Supabase as database fallback
- Unified backend reduces vendor count
- Good free tier

Why retained as fallback:
- Better Auth remains primary for data ownership
- Supabase Auth available when client specifically requests managed auth
- Dual-provider support built into `@agency/auth-portal` specification

## References

- `ARCHITECTURE.md` — Package taxonomy and dependency flow
- `DEPENDENCY.md` §5 — Auth layer provider matrix and package pins
- `docs/tasks/60-auth-internal/` — Internal auth implementation
- `docs/tasks/61-auth-portal/` — Portal auth implementation
- ADR-003 — Database and ORM selection (Drizzle/Neon foundation for Better Auth)
- Better Auth Changelog: https://better-auth.com/changelog
- Clerk Documentation: https://clerk.com/docs
