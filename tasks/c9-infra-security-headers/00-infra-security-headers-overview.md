# C9 Infra Security Headers


## Purpose
Automated security headers (CSP, HSTS, etc.) validation and deployment for all client sites. Ensures compliance with Google Ads requirements, prevents XSS attacks, and maintains consistent security posture across the agency's deployed applications.


## Condition Block

- **Build when:** Client sites run Google Ads (requires strict CSP) OR security audit identifies header gaps OR multiple apps need consistent security policy.
- **Do not build when:** Single app with manual header configuration OR hosting provider (Vercel) handles all security.
- **Minimum consumer rule:** One client site with advertising compliance needs.
- **Exit criteria:**
  - [ ] CSP generator with nonce-based inline script support
  - [ ] HSTS preloading validation
  - [ ] Security headers CI check (fails build on regression)
  - [ ] security.txt generation
  - [ ] Permissions-Policy builder
  - [ ] Cross-origin isolation helpers (COOP/COEP)
  - [ ] Used by at least one deployed client site
  - [ ] README with header configuration guide
  - [ ] Changeset documenting initial release


## Dependencies

- `10-config-eslint` (Linting rules)
- `41-compliance` (Privacy/security integration)
