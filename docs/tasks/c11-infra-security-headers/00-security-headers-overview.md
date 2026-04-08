# c11-infra-security-headers: Shared Security Headers Policy

## Purpose
Create a shared security headers policy including CSP (Content Security Policy) as part of 2026 enterprise-grade monorepo standards. Marketing repos with forms, embeds, analytics, and CMS previews benefit from one reviewed policy rather than app-by-app ad hoc headers.

## Dependencies
- `00-foundation` - Root scaffolding
- `41a-compliance-security-headers` - Compliance headers package
- `e3-apps-agency-website` - First app to apply policy

## Scope

### Headers Covered

1. **Content Security Policy (CSP)**
   - Script sources (self, inline hashes, trusted CDNs)
   - Style sources
   - Image/media sources (including CMS domains)
   - Frame ancestors (clickjacking protection)
   - Connect sources (API endpoints, analytics)

2. **Security Headers**
   - X-Frame-Options
   - X-Content-Type-Options
   - Referrer-Policy
   - Permissions-Policy
   - Strict-Transport-Security

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

## Build Condition

**Add immediately** - CSP is explicitly called out in production references as part of the "serious monorepo" bar.

## Verification

```bash
# Test headers
curl -I https://agency-website.vercel.app | grep -i security

# CSP validation
npx csp-evaluator https://agency-website.vercel.app
```
