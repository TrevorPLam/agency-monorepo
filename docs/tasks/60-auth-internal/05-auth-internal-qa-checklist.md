# 60-auth-internal: QA Checklist

## Pre-Implementation

- [ ] Review 02-auth-internal-constraints.md
- [ ] Review 03-auth-internal-adr-clerk.md
- [ ] Clerk account created and configured
- [ ] Environment variables documented
- [ ] Role structure defined in Clerk Dashboard

## Implementation Verification

### Package Structure
- [ ] `@agency/auth-internal` package created in `packages/auth/internal/`
- [ ] `package.json` has correct exports field
- [ ] `@clerk/nextjs@7.0.12` installed
- [ ] No imports from higher-level domains

### Middleware/Proxy
- [ ] File named `proxy.ts` for Next.js 16+, `middleware.ts` for ≤15
- [ ] `clerkMiddleware()` configured correctly
- [ ] Matcher excludes static files and health checks
- [ ] Middleware tested in development

### Session Handling
- [ ] `auth()` used server-side (async pattern for Clerk 7.x+)
- [ ] `useAuth()` used client-side
- [ ] Session validation on all protected routes
- [ ] 401 returned for unauthenticated, 403 for unauthorized

### Role-Based Access
- [ ] Roles created in Clerk Dashboard
- [ ] Role checks in middleware (route protection)
- [ ] Role checks in server actions
- [ ] No client-side-only role checks for security decisions

### UI Components
- [ ] `<SignIn />` component renders correctly
- [ ] `<SignUp />` component renders correctly
- [ ] `<UserButton />` shows in header
- [ ] Redirects work after sign-in/up

## Security Checks

- [ ] Environment variables not committed to git
- [ ] `CLERK_SECRET_KEY` only on server
- [ ] `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` public
- [ ] Sign-in/up URLs match configuration
- [ ] After-sign URLs redirect appropriately

## Integration Tests

- [ ] Sign-in flow works end-to-end
- [ ] Sign-out works and clears session
- [ ] Protected routes reject unauthenticated users
- [ ] Role-based access works (admin vs viewer)
- [ ] Session persists across page reloads

## Performance

- [ ] No excessive auth API calls on page load
- [ ] User data cached appropriately
- [ ] Middleware doesn't impact static page performance

## Documentation

- [ ] README.md describes package usage
- [ ] Usage examples in package guide
- [ ] Environment variables documented

## Exit Criteria

- [ ] All checklist items complete
- [ ] CI passes (build, lint, typecheck)
- [ ] At least one internal tool using the package
- [ ] Code review approved
