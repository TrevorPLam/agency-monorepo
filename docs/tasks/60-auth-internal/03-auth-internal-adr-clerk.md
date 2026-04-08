# ADR: Clerk for Internal Tools

## Status

Accepted

## Date

2026-04-08

## Context

Internal tools (CRM, invoicing, project tracker) require authentication but have different constraints than client portals:

- Small, predictable user base (agency team members only)
- Need for rapid implementation
- No data ownership concerns — user identity is transient operational data
- Willingness to trade per-MAU cost for development velocity

## Decision

Use Clerk as the authentication provider for all internal tools.

Clerk provides:
- Pre-built React components (`<SignIn />`, `<SignUp />`, `<UserButton />`)
- Zero backend configuration for standard flows
- Managed sessions, password reset, email verification
- Built-in user management dashboard
- SAML support available at higher tier for future enterprise needs

### Next.js 16+ Configuration

```typescript
// proxy.ts (Next.js 16+) or middleware.ts (Next.js ≤15)
import { clerkMiddleware } from "@clerk/nextjs";

export default clerkMiddleware();

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
```

### Async Auth Pattern (Clerk 7.x+)

```typescript
// Server-side auth check
import { auth } from "@clerk/nextjs/server";

export async function GET() {
  const { userId } = await auth(); // Note: async in 7.x+
  if (!userId) return new Response("Unauthorized", { status: 401 });
  // ...
}
```

## Consequences

### Positive

- Fastest possible auth implementation — components drop into React apps
- No database schema changes required
- Password reset, email verification, 2FA available with minimal code
- User management UI included
- Session security handled by vendor

### Negative

- Per-MAU pricing applies (10,000 free tier)
- User data lives in Clerk infrastructure
- Vendor lock-in — migration requires user password reset
- Custom auth flows require workarounds

### Neutral

- Must track MAU to avoid unexpected billing
- SAML requires Business tier upgrade

## Alternatives Considered

### Better Auth for internal tools

Why rejected:
- Slower initial setup (database schema, configuration)
- Benefits of data ownership not valuable for transient internal users
- Clerk's DX advantage outweighs cost at low volume

### Supabase Auth for internal tools

Why rejected:
- Adds vendor when Clerk already provides what we need
- No significant advantage over Clerk for internal use case
- Would require additional package `@agency/auth-internal-supabase`

## References

- ADR-004: Dual-Lane Authentication Architecture
- DEPENDENCY.md §5: Auth layer provider matrix
- Clerk Documentation: https://clerk.com/docs
