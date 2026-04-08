# 60-auth-internal: Internal Auth (Clerk)

## Purpose
Clerk configuration, middleware helpers, and typed session utilities for internal tools.

## Dependencies
- `@agency/core-types` — Domain types
- `@agency/config-typescript` — TypeScript configuration

## Scope
This package provides:
- Clerk SDK configuration for internal tools
- Middleware for route protection
- Session helper functions
- Typed user roles for internal staff

## Condition Block
- **Build when:** First internal tool needs authentication
- **Do not build when:** Tools are public-only

## Exit Criteria
- [ ] Clerk middleware configured
- [ ] Session helpers typed
- [ ] Role-based access patterns documented
- [ ] Used by at least one internal tool

## Next Steps
1. Configure Clerk SDK
2. Implement middleware pattern
3. Add session utilities
4. Document role hierarchy
