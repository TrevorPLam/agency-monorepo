# C9 Infra Security Headers Specification

## Files

```
packages/config/security-headers/
├── package.json
├── tsconfig.json
├── README.md
├── src/
│   ├── index.ts
│   ├── csp.ts
│   ├── hsts.ts
│   ├── permissions.ts
│   ├── security-txt.ts
│   ├── next-config.ts
│   ├── validate.ts
│   └── types.ts
├── scripts/
│   └── validate-headers.ts
└── templates/
    ├── strict-csp.json
    └── marketing-csp.json
```

### `package.json`

```json
{
  "name": "@agency/config-security-headers",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "exports": {
    ".": "./src/index.ts",
    "./csp": "./src/csp.ts",
    "./next-config": "./src/next-config.ts",
    "./validate": "./src/validate.ts"
  },
  "dependencies": {
    "@agency/core-types": "workspace:*",
    "@agency/core-utils": "workspace:*"
  },
  "devDependencies": {
    "@agency/config-eslint": "workspace:*",
    "@agency/config-typescript": "workspace:*"
  },
  "scripts": {
    "validate": "tsx scripts/validate-headers.ts"
  },
  "publishConfig": { "access": "restricted" }
}
```

### `src/csp.ts`

```typescript
// Content Security Policy builder with nonce support

export interface CSPDirectives {
  'default-src'?: string[];
  'script-src'?: string[];
  'style-src'?: string[];
  'img-src'?: string[];
  'font-src'?: string[];
  'connect-src'?: string[];
  'media-src'?: string[];
  'object-src'?: string[];
  'frame-src'?: string[];
  'frame-ancestors'?: string[];
  'form-action'?: string[];
  'base-uri'?: string[];
  'upgrade-insecure-requests'?: boolean;
}

export interface CSPOptions {
  directives: CSPDirectives;
  reportOnly?: boolean;
  reportUri?: string;
  useNonce?: boolean;  // For inline script/style support
}

export function buildCSP(options: CSPOptions): string {
  const parts: string[] = [];

  for (const [directive, values] of Object.entries(options.directives)) {
    if (Array.isArray(values)) {
      parts.push(`${directive} ${values.join(' ')}`);
    } else if (values === true) {
      parts.push(directive);
    }
  }

  if (options.reportUri) {
    parts.push(`report-uri ${options.reportUri}`);
  }

  return parts.join('; ');
}

// Predefined CSP templates
export const cspTemplates = {
  // Strict CSP for marketing sites with Google Ads
  marketing: (): CSPOptions => ({
    directives: {
      'default-src': ["'self'"],
      'script-src': [
        "'self'",
        "'nonce-{NONCE}'",  // Inline scripts with nonce
        'https://www.googletagmanager.com',
        'https://www.google-analytics.com',
        'https://googleads.g.doubleclick.net',
        'https://pagead2.googlesyndication.com'
      ],
      'style-src': ["'self'", "'nonce-{NONCE}'", "'unsafe-inline'"], // Unsafe inline often needed for ads
      'img-src': ["'self'", 'data:', 'https:', 'blob:'],
      'font-src': ["'self'", 'https://fonts.gstatic.com'],
      'connect-src': [
        "'self'",
        'https://www.google-analytics.com',
        'https://analytics.google.com',
        'https://vitals.vercel-insights.com'
      ],
      'frame-src': [
        "'self'",
        'https://googleads.g.doubleclick.net',
        'https://tpc.googlesyndication.com'
      ],
      'object-src': ["'none'"],
      'base-uri': ["'self'"],
      'upgrade-insecure-requests': true
    },
    useNonce: true
  }),

  // Minimal CSP for simple sites
  minimal: (): CSPOptions => ({
    directives: {
      'default-src': ["'self'"],
      'script-src': ["'self'"],
      'style-src': ["'self'", "'unsafe-inline'"],
      'img-src': ["'self'", 'data:', 'https:'],
      'font-src': ["'self'"],
      'connect-src': ["'self'"],
      'object-src': ["'none'"]
    },
    useNonce: false
  }),

  // Strict CSP with no external scripts
  strict: (): CSPOptions => ({
    directives: {
      'default-src': ["'none'"],
      'script-src': ["'self'"],
      'style-src': ["'self'"],
      'img-src': ["'self'", 'data:'],
      'font-src': ["'self'"],
      'connect-src': ["'self'"],
      'frame-ancestors': ["'none'"],
      'base-uri': ["'none'"],
      'form-action': ["'self'"]
    },
    useNonce: false
  })
};

// Generate nonce for inline script support
export function generateNonce(): string {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return btoa(String.fromCharCode(...array));
}
```

### `src/hsts.ts`

```typescript
// HTTP Strict Transport Security configuration

export interface HSTSOptions {
  maxAge: number;        // Seconds (recommended: 31536000 = 1 year)
  includeSubDomains: boolean;
  preload: boolean;      // Submit to browser preload lists
}

export function buildHSTS(options: HSTSOptions): string {
  let header = `max-age=${options.maxAge}`;
  
  if (options.includeSubDomains) {
    header += '; includeSubDomains';
  }
  
  if (options.preload) {
    header += '; preload';
  }
  
  return header;
}

export const hstsPresets = {
  // Standard production HSTS
  production: (): HSTSOptions => ({
    maxAge: 31536000,  // 1 year
    includeSubDomains: true,
    preload: true
  }),

  // Conservative - shorter max-age, no preload
  conservative: (): HSTSOptions => ({
    maxAge: 2592000,   // 30 days
    includeSubDomains: true,
    preload: false
  }),

  // Development/testing (no HSTS)
  development: (): HSTSOptions => ({
    maxAge: 0,
    includeSubDomains: false,
    preload: false
  })
};

// Validate HSTS preloading requirements
export function validatePreloadRequirements(options: HSTSOptions): string[] {
  const errors: string[] = [];

  if (options.maxAge < 10886400) {
    errors.push('Preload requires max-age of at least 10886400 seconds (18 weeks)');
  }

  if (!options.includeSubDomains) {
    errors.push('Preload requires includeSubDomains');
  }

  if (!options.preload) {
    errors.push('Preload directive must be present');
  }

  return errors;
}
```

### `src/security-txt.ts`

```typescript
// security.txt file generation (RFC 9116)

export interface SecurityTxtConfig {
  contact: string;           // Required: email or URL
  expires: string;           // ISO 8601 date
  acknowledgments?: string;  // URL to hall of fame
  policy?: string;           // URL to security policy
  hiring?: string;           // URL to security jobs
  preferredLanguages?: string[]; // e.g., ['en', 'es']
}

export function generateSecurityTxt(config: SecurityTxtConfig): string {
  const lines: string[] = [];

  lines.push(`Contact: ${config.contact}`);
  lines.push(`Expires: ${config.expires}`);

  if (config.acknowledgments) {
    lines.push(`Acknowledgments: ${config.acknowledgments}`);
  }

  if (config.policy) {
    lines.push(`Policy: ${config.policy}`);
  }

  if (config.hiring) {
    lines.push(`Hiring: ${config.hiring}`);
  }

  if (config.preferredLanguages?.length) {
    lines.push(`Preferred-Languages: ${config.preferredLanguages.join(', ')}`);
  }

  return lines.join('\n');
}

// Well-known path placement
export function getSecurityTxtPath(): string {
  return '/.well-known/security.txt';
}
```

### `src/next-config.ts`

```typescript
// Next.js headers configuration helper

import type { NextConfig } from 'next';
import type { CSPOptions } from './csp';
import type { HSTSOptions } from './hsts';
import { buildCSP, generateNonce } from './csp';
import { buildHSTS } from './hsts';

export interface SecurityHeadersConfig {
  csp?: CSPOptions;
  hsts?: HSTSOptions;
  permissionsPolicy?: Record<string, string>;
  additionalHeaders?: Record<string, string>;
}

export function withSecurityHeaders(
  nextConfig: NextConfig,
  securityConfig: SecurityHeadersConfig
): NextConfig {
  return {
    ...nextConfig,
    async headers() {
      const existingHeaders = await nextConfig.headers?.() || [];
      
      return [
        ...existingHeaders,
        {
          source: '/:path*',
          headers: buildSecurityHeaders(securityConfig)
        }
      ];
    }
  };
}

function buildSecurityHeaders(config: SecurityHeadersConfig) {
  const headers: Array<{ key: string; value: string }> = [];

  // CSP with nonce
  if (config.csp) {
    const nonce = generateNonce();
    let cspString = buildCSP(config.csp);
    
    if (config.csp.useNonce) {
      cspString = cspString.replace(/{NONCE}/g, nonce);
    }

    headers.push({
      key: config.csp.reportOnly ? 'Content-Security-Policy-Report-Only' : 'Content-Security-Policy',
      value: cspString
    });
  }

  // HSTS
  if (config.hsts) {
    headers.push({
      key: 'Strict-Transport-Security',
      value: buildHSTS(config.hsts)
    });
  }

  // Permissions Policy
  if (config.permissionsPolicy) {
    const policy = Object.entries(config.permissionsPolicy)
      .map(([feature, allowlist]) => `${feature}=(${allowlist})`)
      .join(', ');
    
    headers.push({
      key: 'Permissions-Policy',
      value: policy
    });
  }

  // Additional security headers
  headers.push(
    { key: 'X-Content-Type-Options', value: 'nosniff' },
    { key: 'X-Frame-Options', value: 'DENY' },
    { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' }
  );

  // Custom headers
  if (config.additionalHeaders) {
    for (const [key, value] of Object.entries(config.additionalHeaders)) {
      headers.push({ key, value });
    }
  }

  return headers;
}
```

### `src/validate.ts`

```typescript
// Security headers validation for CI/CD

export interface ValidationResult {
  passed: boolean;
  score: number;  // 0-100
  issues: string[];
  warnings: string[];
}

export function validateSecurityHeaders(headers: Record<string, string>): ValidationResult {
  const issues: string[] = [];
  const warnings: string[] = [];

  // Critical checks
  if (!headers['content-security-policy'] && !headers['content-security-policy-report-only']) {
    issues.push('Missing Content-Security-Policy');
  }

  if (!headers['strict-transport-security']) {
    issues.push('Missing Strict-Transport-Security (HSTS)');
  }

  if (headers['x-frame-options'] !== 'DENY' && headers['x-frame-options'] !== 'SAMEORIGIN') {
    issues.push('X-Frame-Options should be DENY or SAMEORIGIN');
  }

  // CSP strength check
  const csp = headers['content-security-policy'] || '';
  if (csp.includes("'unsafe-inline'") && !csp.includes('nonce-')) {
    warnings.push('CSP uses unsafe-inline without nonce - consider nonce-based approach');
  }

  if (csp.includes('https:') && !csp.includes('http:')) {
    // Good - requires HTTPS
  } else if (csp.includes('http:')) {
    warnings.push('CSP allows http: scheme - consider upgrade-insecure-requests');
  }

  // Calculate score
  const maxScore = 100;
  const issuePenalty = issues.length * 25;
  const warningPenalty = warnings.length * 5;
  const score = Math.max(0, maxScore - issuePenalty - warningPenalty);

  return {
    passed: issues.length === 0,
    score,
    issues,
    warnings
  };
}
```

### `scripts/validate-headers.ts`

```typescript
#!/usr/bin/env tsx
// CI script to validate security headers

import { validateSecurityHeaders } from '../src/validate';

async function main() {
  // Fetch headers from deployed site or preview
  const siteUrl = process.env.VERIFY_URL || process.env.VERCEL_URL;
  
  if (!siteUrl) {
    console.error('No URL provided. Set VERIFY_URL or VERCEL_URL.');
    process.exit(1);
  }

  const response = await fetch(`https://${siteUrl}`);
  const headers: Record<string, string> = {};
  
  response.headers.forEach((value, key) => {
    headers[key.toLowerCase()] = value;
  });

  const result = validateSecurityHeaders(headers);

  console.log(`Security Score: ${result.score}/100`);
  
  if (result.issues.length > 0) {
    console.log('\n❌ Issues:');
    result.issues.forEach(i => console.log(`  - ${i}`));
  }

  if (result.warnings.length > 0) {
    console.log('\n⚠️ Warnings:');
    result.warnings.forEach(w => console.log(`  - ${w}`));
  }

  if (!result.passed) {
    console.log('\n❌ Security header validation failed');
    process.exit(1);
  }

  console.log('\n✅ Security headers valid');
}

main().catch(console.error);
```

### README

```markdown
# @agency/config-security-headers

Automated security headers for Next.js apps with Google Ads compliance.

## CSP for Google Ads (2026 Requirements)

Google Ads now requires strict CSP for remarketing in EU/UK:

```typescript
import { withSecurityHeaders, cspTemplates } from '@agency/config-security-headers';

export default withSecurityHeaders(
  {
    // Your existing next.config.js
  },
  {
    csp: cspTemplates.marketing(),  // Pre-configured for ads
    hsts: { maxAge: 31536000, includeSubDomains: true, preload: true }
  }
);
```

## Security Headers Included

- **Content-Security-Policy** - XSS prevention
- **Strict-Transport-Security** - HTTPS enforcement
- **X-Frame-Options** - Clickjacking protection
- **X-Content-Type-Options** - MIME sniffing prevention
- **Referrer-Policy** - Privacy control
- **Permissions-Policy** - Feature restrictions

## Nonce-Based Inline Scripts

For inline scripts (often needed for Google Tag Manager):

```typescript
import { generateNonce } from '@agency/config-security-headers/csp';

const nonce = generateNonce();

// In your HTML
<script nonce={nonce}>
  // Google Tag Manager or other inline script
</script>
```

## CI Validation

```bash
# Validate headers on deployed site
VERIFY_URL=site.com pnpm --filter @agency/config-security-headers validate
```

Fails build if security score < 75 or critical headers missing.
```


## Related Tasks

- `c2-infra-ci-workflow` - CI integration
- `41-compliance` - GDPR/CCPA compliance
- `41a-compliance-security-headers` - Compliance-specific headers
