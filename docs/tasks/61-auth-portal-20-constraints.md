# 61-auth-portal: Constraints & Security Rules

## Security Constraints

### Session Handling
- Sessions stored in database (Better Auth default) — ensure `session` table has proper indexes
- Session cookies must be `httpOnly`, `secure` (HTTPS only), `sameSite=lax` minimum
- Session tokens rotated on privilege escalation (role change, organization switch)

### Multi-Tenant Isolation
- Each agency client maps to one Better Auth Organization
- Users cannot access cross-client data even with valid session
- Organization scoping enforced at database query level

### Better Auth 1.6.x Breaking Changes (introduced in 1.6.0)
```typescript
// session.freshAge now calculates from createdAt, not updatedAt
// Previously: activity extended freshness window
// Now: freshness is fixed from session creation

// Migration: Review session refresh logic
// To disable freshness check entirely:
{
  session: { freshAge: 0 }
}
```

### OIDC Provider Deprecation
- `oidc-provider` plugin deprecated starting in 1.6.0
- Migrate to `@better-auth/oauth-provider` if using custom OIDC
- One-time deprecation warning emitted — plan migration before v2.0

## Operational Limits

### Database Performance
- Enable `experimental.joins` in Better Auth 1.6.x for 2-3x performance improvement
- Requires Drizzle relations in schema — run the Better Auth schema generator command from the setup guide to update
- Monitor query performance for `/get-session` and `/get-full-organization` endpoints

### Scalability Limits
- Better Auth: No per-MAU cost, but database connection limits apply
- Supabase Auth: 50,000 MAU on free tier, scales with Supabase plan
- Plan connection pooling (Neon handles this automatically)

## Provider Selection Constraints

### When to Use Better Auth (Primary)
- Default for all new client portals
- Required for data ownership compliance
- Required for zero per-MAU cost at scale
- Enables advanced plugins: 2FA, passkeys, organizations

### When to Use Supabase Auth (Fallback)
- Client explicitly requests managed auth
- Already using Supabase for database with RLS
- Faster time-to-market preferred over customization

### Never Mix Providers
- One provider per portal app
- Migration between providers requires user password reset
- Document migration procedure if provider switch anticipated

## Data Isolation Rules

### Organization Mapping
```typescript
// Each agency client = one Better Auth Organization
// Organization ID maps to client_id in operational database

export async function resolveClientFromOrg(orgId: string) {
  // Query agency database for client_id by organization_id
  return db.query.clients.findFirst({
    where: eq(clients.organizationId, orgId)
  });
}
```

### Query Enforcement
- Every database query must include `client_id` filter
- Auth session provides organization context
- Never rely on client-provided identifiers for data access

## Environment Configuration

### Better Auth (Default)
```
BETTER_AUTH_SECRET=openssl rand -base64 32
BETTER_AUTH_URL=https://portal.agency.com
DATABASE_URL=postgresql://...
AUTH_PROVIDER=better
```

### Supabase Auth (Fallback)
```
NEXT_PUBLIC_SUPABASE_URL=https://...supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_KEY=eyJ...
AUTH_PROVIDER=supabase
```

## Migration Constraints

### Database Schema
- Better Auth schema changes require `npx auth migrate`
- Destructive changes need rollback plan
- Test migrations on Neon branch before production

### User Migration
- Password hashes don't transfer between providers
- Migration procedure: export users → email password reset → import to new provider
- Plan for user communication about migration

## Compliance & Security

### Data Residency
- Better Auth: Data stays in agency-controlled database
- Supabase Auth: Data in Supabase infrastructure
- Document where each client's data resides

### Audit Requirements
- Log all auth events: sign-in, sign-out, role changes
- Include IP address and user agent for security reviews
- Retain 90 days minimum, per client contract requirements

### Passkey/WebAuthn (2026 Standard)
- Enabled via Better Auth passkey plugin
- Recommended for high-security client portals
- Graceful fallback to password for unsupported browsers
