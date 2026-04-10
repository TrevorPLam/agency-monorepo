# ADR: Better Auth for Client Portals

## Status

Accepted

## Date

2026-04-08

## Context

Client portals have requirements that differ significantly from internal tools:

- External users may scale to thousands per client
- Data ownership is a first-order requirement (client contracts, compliance)
- Zero per-MAU cost at scale is economically critical
- Need for advanced features: 2FA, passkeys, organizations, invitations

Better Auth reached stable v1.0 in 2025 and provides a comprehensive self-hosted alternative to managed auth providers.

## Decision

Use Better Auth as the primary authentication provider for client portals.

Better Auth provides:
- Self-hosted sessions and user data (stored in agency-controlled database)
- Zero per-MAU cost
- Native Drizzle ORM adapter
- Plugin system: 2FA, passkeys, organizations, admin, stripe integration
- Framework-agnostic core with first-class Next.js support

### Better Auth 1.6.x Configuration

```typescript
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "@better-auth/drizzle-adapter";

export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: "pg" }),
  experimental: { 
    joins: true // 2-3x performance improvement for session/org queries
  },
  plugins: [
    // organization(), // Enable for multi-tenant client portals
    // twoFactor(),    // Enable for high-security portals
    // passkey(),      // Enable for passwordless experience
  ]
});
```

### Session Freshness (1.6.x Breaking Change Introduced in 1.6.0)

```typescript
// In Better Auth 1.6.x, session.freshAge calculates from createdAt
// NOT from updatedAt (behavior in <1.6.0)
// This means session activity no longer extends the freshness window

// To disable freshness checking entirely:
{
  session: { freshAge: 0 }
}
```

## Consequences

### Positive

- Full data ownership — user and session data in agency database
- Zero marginal cost per user
- Plugin ecosystem enables advanced features without vendor dependencies
- Drizzle adapter integrates natively with `@agency/data-db`
- Organization plugin provides multi-tenancy out of the box
- Can be extended with custom plugins if needed

### Negative

- Requires database schema management (migrations via `npx auth migrate`)
- More initial setup than managed providers
- Session management responsibility shifts to agency
- Must maintain Better Auth version updates

### Neutral

- Supabase Auth retained as fallback for clients wanting managed auth
- Better Auth 1.6.x moved Drizzle adapter to separate package (`@better-auth/drizzle-adapter`)
- Experimental joins feature requires Drizzle relations in schema

## Alternatives Considered

### Clerk for client portals

Why rejected:
- Per-MAU pricing becomes prohibitive at scale
- User data leaves agency-controlled infrastructure
- Some client contracts require data ownership guarantees

### Auth.js (NextAuth v5) for client portals

Why rejected:
- v5 still in beta as of April 2026
- Better Auth has more comprehensive plugin ecosystem
- Better Auth organizations feature enables multi-tenancy natively
- Better Auth's Drizzle adapter is more mature

### Supabase Auth for client portals (fallback retained)

Why retained as fallback:
- Some clients prefer managed auth despite tradeoffs
- Already using Supabase as database fallback option
- Unified Supabase backend reduces vendor count for some clients

### WorkOS for client portals

Why rejected as default:
- WorkOS is enterprise SSO escalation, not general auth
- Higher cost structure aimed at enterprise SAML/SCIM
- Overkill for standard client portal use case

## References

- ADR-004: Dual-Lane Authentication Architecture
- DEPENDENCY.md §5: Auth layer provider matrix
- Better Auth Documentation: https://better-auth.com/docs
- Better Auth Changelog: https://better-auth.com/changelog
