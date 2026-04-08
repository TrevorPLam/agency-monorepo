# Auth Portal


## Purpose
Authentication for client-facing portals. **Primary**: Better Auth for full control and zero per-MAU cost. **Fallback**: Supabase Auth when client prefers managed solution or unified backend. Supports 2FA, passkeys, RBAC, and organizations.


## Condition Block

- **Build when:** The first client portal requires a logged-in experience (user accounts, protected routes, session management).
- **Do not build when:** Client sites are brochure-only or public-only without authentication needs.
- **Minimum consumer rule:** One real portal is sufficient — this is specialized auth infrastructure for client-facing applications.
- **Exit criteria:**
  - [ ] Better Auth integration working with Drizzle adapter
  - [ ] Session management functional in at least one portal app
  - [ ] Organization/team logic validated (if needed)
  - [ ] 2FA or passkey plugins configured (if required)
  - [ ] README with portal auth patterns and examples
  - [ ] Changeset documenting initial release
