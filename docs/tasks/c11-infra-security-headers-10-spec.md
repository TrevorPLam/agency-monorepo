# c11-infra-security-headers: Implementation Specification

## Task Header

| Field | Value |
|-------|-------|
| **State** | `conditional` — Package-controlled, opt-in only |
| **Trigger** | App requires security headers implementation |
| **Minimum Consumers** | 1+ production apps |
| **Dependencies** | Next.js 16.2.3, TypeScript 6.0 |
| **Exit Criteria** | Security headers implemented and verified |
| **Implementation Authority** | `REPO-STATE.md` — Conditional; requires explicit security need |
| **Version Authority** | `DEPENDENCY.md` §1, §2 — TypeScript 6.0, Next.js 16.2.3 |
| **Supersedes** | c9-infra-security-headers (legacy config draft) |
| **Superseded by** | n/a |

**Cross-references:**
- Decision status: `DECISION-STATUS.md` — Security headers impl `open`
- Version pins: `DEPENDENCY.md` §1, §2
- Related task: `41a-compliance-security-headers` covers optional compliance-package policy templates
- Note: Optional; implementation-focused security headers

## Headers Covered

### Content Security Policy (CSP)
- Script sources (self, inline hashes, trusted CDNs)
- Style sources
- Image/media sources (including CMS domains)
- Frame ancestors (clickjacking protection)
- Connect sources (API endpoints, analytics)

### Security Headers
- X-Frame-Options
- X-Content-Type-Options
- Referrer-Policy
- Permissions-Policy
- Strict-Transport-Security

## Implementation

### Shared Policy Package

```typescript
// packages/config/security-headers/src/policy.ts
export const marketingSecurityPolicy = {
  contentSecurityPolicy: {
    directives: {
      'default-src': ["'self'"],
      'script-src': [
        "'self'",
        "'unsafe-eval'", // Required for some analytics
        'https://plausible.io',
        'https://*.clerk.accounts.dev',
      ],
      'style-src': ["'self'", "'unsafe-inline'"],
      'img-src': ["'self'", 'https:', 'data:', 'blob:'],
      'connect-src': [
        "'self'",
        'https://api.resend.com',
        'https://*.supabase.co',
        'https://plausible.io',
      ],
      'frame-ancestors': ["'none'"],
    },
  },
  // ...other headers
};
```

### Next.js Integration

```javascript
// apps/agency-website/next.config.js
const { marketingSecurityPolicy } = require('@agency/config-security-headers');

module.exports = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: Object.entries(marketingSecurityPolicy).map(
          ([key, value]) => ({
            key,
            value: Array.isArray(value) ? value.join('; ') : value,
          })
        ),
      },
    ];
  },
};
```

## Critical Requirements

1. **Marketing-Specific CSP**
   - Allow analytics providers (Plausible, PostHog)
   - Allow CMS image domains (Sanity CDN)
   - Allow email embed domains
   - Block unsafe inline scripts (use nonces/hashes)

2. **Per-App Customization**
   - Base policy in shared config
   - Apps can extend (not replace) policy
   - Environment-specific variations (dev vs prod)

## Verification

```bash
# Test headers
curl -I https://agency-website.vercel.app | grep -i security

# CSP validation
npx csp-evaluator https://agency-website.vercel.app
```
