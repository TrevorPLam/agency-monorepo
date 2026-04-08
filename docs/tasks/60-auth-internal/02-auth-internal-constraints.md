# 60-auth-internal: Constraints & Security Rules

## Security Constraints

### Session Handling
- Sessions are managed by Clerk's infrastructure — never implement custom session storage
- Session tokens must be validated server-side; never trust client-side session data
- Use Clerk's `auth()` helper for all session validation (async in Clerk 7.x+)

### Role-Based Access Control (RBAC)
- Roles are defined in Clerk Dashboard, not in code
- Role checks must happen at both middleware (route protection) and server action levels
- Never rely solely on client-side role checks for security decisions

### Middleware Configuration
- File must be named `proxy.ts` for Next.js 16+, `middleware.ts` for Next.js ≤15
- Use `clerkMiddleware()` from `@clerk/nextjs`
- Configure matcher to exclude static files, API routes that don't need auth, and health checks

### API Route Protection
- All internal tool API routes must validate sessions
- Use `auth()` from `@clerk/nextjs/server` (async)
- Return 401 for unauthenticated, 403 for unauthorized (wrong role)

### Environment Variables
```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/
```

## Operational Limits

### Clerk Free Tier
- 10,000 monthly active users (MAU)
- Beyond this: paid plan required ($25/month + per-MAU overage)
- Plan for migration if internal tools exceed 10 users (buffer for testing)

### Rate Limiting
- Clerk enforces rate limits on API calls
- Implement client-side request debouncing for sign-in attempts
- Cache user data appropriately; don't fetch on every render

## Integration Constraints

### Database Access
- `@agency/auth-internal` must NOT import from `@agency/data-db`
- Keep auth concerns separate from data concerns
- If user data needs to sync to operational database, do it in the app layer

### UI Components
- Use Clerk's pre-built components: `<SignIn />`, `<SignUp />`, `<UserButton />`
- Custom styling via Clerk's appearance API, not component replacement
- For custom flows, use Clerk's headless hooks

## Compliance Requirements

### Data Residency
- Clerk stores session data in their infrastructure
- User profile data stays in Clerk unless explicitly synced
- Document which internal tools handle sensitive data requiring audit logs

### Audit Trail
- Log significant actions with user ID and timestamp
- Include Clerk's `sessionId` in audit logs for traceability
- Retain logs per agency policy (recommend 90 days minimum)

## Migration Constraints

### Provider Lock-in
- Clerk is a managed service — switching means user password reset
- If migration anticipated, document user export procedure
- Keep role definitions portable (don't use Clerk-specific role features heavily)

### Escalation Path
- If enterprise SSO needed: Clerk supports SAML at Business tier
- If Clerk becomes cost-prohibitive: migration path to WorkOS or Better Auth
- Document decision criteria for when to escalate
