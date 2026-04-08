# Security Headers Specification

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
