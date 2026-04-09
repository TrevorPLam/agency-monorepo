# 41a-compliance-security-headers: Implementation Specification

## Task Header

| Field | Value |
|-------|-------|
| **State** | `conditional` — Package-controlled, opt-in only |
| **Trigger** | App requires security header management |
| **Minimum Consumers** | 1+ apps with security requirements |
| **Dependencies** | Next.js 16.2.3, TypeScript 6.0 |
| **Exit Criteria** | Security headers package exported and used |
| **Implementation Authority** | `REPO-STATE.md` — Conditional; requires explicit app opt-in |
| **Version Authority** | `DEPENDENCY.md` §1, §2 — TypeScript 6.0, Next.js 16.2.3 |
| **Superseded by** | n/a |

**Cross-references:**
- Decision status: `DECISION-STATUS.md` — Security headers `open`
- Version pins: `DEPENDENCY.md` §1, §2
- Related task: `c11-infra-security-headers` is the canonical infra implementation track; this task remains a conditional compliance-package layer
- Note: Sub-task of 41-compliance; optional security hardening

## Files

```
packages/compliance/security-headers/
├── package.json
├── tsconfig.json
├── README.md
├── src/
│   ├── index.ts
│   ├── gdpr-csp.ts
│   ├── privacy-policies.ts
│   ├── cross-origin.ts
│   ├── audit.ts
│   └── types.ts
└── templates/
    ├── strict-gdpr.json
    └── ccpa-compliant.json
```

### `package.json`

```json
{
  "name": "@agency/compliance-security-headers",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "exports": {
    ".": "./src/index.ts",
    "./gdpr": "./src/gdpr-csp.ts",
    "./privacy": "./src/privacy-policies.ts",
    "./audit": "./src/audit.ts"
  },
  "dependencies": {
    "@agency/core-types": "workspace:*",
    "@agency/config-security-headers": "workspace:*"
  },
  "devDependencies": {
    "@agency/config-eslint": "workspace:*",
    "@agency/config-typescript": "workspace:*"
  },
  "publishConfig": { "access": "restricted" }
}
```

### `src/gdpr-csp.ts`

```typescript
// GDPR-compliant Content Security Policy

import type { CSPOptions } from '@agency/config-security-headers/csp';

export interface GdprCSPOptions {
  allowAnalytics?: boolean;  // Only if consent given
  allowMarketing?: boolean;  // Only if consent given
  allowThirdParties?: string[];  // Explicit allowlist
}

export function buildGdprCSP(options: GdprCSPOptions = {}): CSPOptions {
  const selfOnly = ["'self'"];
  
  const directives: CSPOptions['directives'] = {
    'default-src': selfOnly,
    'script-src': ["'self'"],
    'style-src': ["'self'", "'unsafe-inline'"], // Often needed, low risk
    'img-src': ["'self'", 'data:', 'blob:'],
    'font-src': ["'self'"],
    'connect-src': ["'self'"],
    'media-src': ["'self'"],
    'object-src': ["'none'"],
    'frame-ancestors': ["'none'"],
    'base-uri': ["'self'"],
    'form-action': ["'self'"],
    'upgrade-insecure-requests': true
  };

  // Only add analytics if explicitly allowed with consent
  if (options.allowAnalytics) {
    directives['script-src']!.push(
      'https://www.googletagmanager.com',
      'https://www.google-analytics.com',
      'https://plausible.io'
    );
    directives['connect-src']!.push(
      'https://www.google-analytics.com',
      'https://plausible.io'
    );
    directives['img-src']!.push('https://www.google-analytics.com');
  }

  // Only add marketing if explicitly allowed with consent
  if (options.allowMarketing) {
    directives['script-src']!.push(
      'https://googleads.g.doubleclick.net',
      'https://connect.facebook.net'
    );
    directives['frame-src'] = [
      "'self'",
      'https://googleads.g.doubleclick.net'
    ];
  }

  // Add explicitly allowed third parties
  if (options.allowThirdParties) {
    directives['script-src']!.push(...options.allowThirdParties);
    directives['connect-src']!.push(...options.allowThirdParties);
  }

  return {
    directives,
    reportOnly: false,
    useNonce: true
  };
}

// Dynamic CSP based on consent state
export async function getConsentAwareCSP(
  consentState: { analytics: boolean; marketing: boolean }
): Promise<CSPOptions> {
  return buildGdprCSP({
    allowAnalytics: consentState.analytics,
    allowMarketing: consentState.marketing
  });
}
```

### `src/privacy-policies.ts`

```typescript
// Privacy-preserving header policies

export interface PrivacyHeaders {
  'Referrer-Policy': string;
  'Permissions-Policy': string;
  'Cross-Origin-Embedder-Policy': string;
  'Cross-Origin-Opener-Policy': string;
  'Cross-Origin-Resource-Policy': string;
}

export function buildPrivacyHeaders(strict = true): PrivacyHeaders {
  if (strict) {
    return {
      // Minimal referrer leakage
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      
      // Block all device access by default
      'Permissions-Policy': 
        'camera=(), microphone=(), geolocation=(), ' +
        'payment=(), usb=(), magnetometer=(), ' +
        'gyroscope=(), accelerometer=()',
      
      // Isolate from cross-origin windows
      'Cross-Origin-Opener-Policy': 'same-origin',
      
      // Require explicit opt-in for cross-origin embedding
      'Cross-Origin-Embedder-Policy': 'require-corp',
      
      // Don't share resources cross-origin
      'Cross-Origin-Resource-Policy': 'same-origin'
    };
  }

  // Relaxed for embedded content
  return {
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'geolocation=(self), camera=(), microphone=()',
    'Cross-Origin-Opener-Policy': 'same-origin-allow-popups',
    'Cross-Origin-Embedder-Policy': 'credentialless',
    'Cross-Origin-Resource-Policy': 'cross-origin'
  };
}

// DNT (Do Not Track) respect
export function shouldRespectDNT(request: Request): boolean {
  return request.headers.get('dnt') === '1' || 
         request.headers.get('sec-gpc') === '1'; // Global Privacy Control
}
```

### `src/audit.ts`

```typescript
// Security header audit logging for compliance

export interface HeaderAuditEntry {
  timestamp: string;
  url: string;
  headers: Record<string, string>;
  complianceChecks: {
    gdpr: boolean;
    ccpa: boolean;
    security: boolean;
  };
  issues: string[];
}

export class HeaderAuditor {
  private log: HeaderAuditEntry[] = [];

  audit(url: string, headers: Record<string, string>): HeaderAuditEntry {
    const issues: string[] = [];
    
    // GDPR checks
    const gdprCompliant = 
      headers['content-security-policy']?.includes("'self'") ?? false;
    
    if (!gdprCompliant) {
      issues.push('CSP may allow third-party data leakage');
    }

    // CCPA checks
    const ccpaCompliant = 
      headers['referrer-policy']?.includes('strict') ?? false;
    
    if (!ccpaCompliant) {
      issues.push('Referrer-Policy may leak user data');
    }

    // Security checks
    const securityChecks = [
      'strict-transport-security',
      'x-content-type-options',
      'x-frame-options'
    ];
    
    for (const header of securityChecks) {
      if (!headers[header]) {
        issues.push(`Missing ${header}`);
      }
    }

    const entry: HeaderAuditEntry = {
      timestamp: new Date().toISOString(),
      url,
      headers,
      complianceChecks: {
        gdpr: gdprCompliant,
        ccpa: ccpaCompliant,
        security: issues.length === 0
      },
      issues
    };

    this.log.push(entry);
    return entry;
  }

  generateReport(): string {
    const total = this.log.length;
    const gdprPass = this.log.filter(e => e.complianceChecks.gdpr).length;
    const ccpaPass = this.log.filter(e => e.complianceChecks.ccpa).length;
    
    return `
Security Header Audit Report
============================
Total Audits: ${total}
GDPR Compliant: ${gdprPass}/${total} (${Math.round(gdprPass/total*100)}%)
CCPA Compliant: ${ccpaPass}/${total} (${Math.round(ccpaPass/total*100)}%)

Issues Found:
${this.log.flatMap(e => e.issues.map(i => `- ${e.url}: ${i}`)).join('\n')}
    `.trim();
  }

  export(): HeaderAuditEntry[] {
    return [...this.log];
  }
}
```

### README

```markdown
# @agency/compliance-security-headers

Privacy-compliant security headers for GDPR/CCPA requirements.

## GDPR-Compliant CSP

Default configuration blocks all third-party resources:

```typescript
import { buildGdprCSP } from '@agency/compliance-security-headers/gdpr';

const csp = buildGdprCSP({
  allowAnalytics: userConsent.analytics,
  allowMarketing: userConsent.marketing
});
```

Analytics/marketing scripts only load after consent.

## Privacy Headers

```typescript
import { buildPrivacyHeaders } from '@agency/compliance-security-headers/privacy';

const headers = buildPrivacyHeaders(true); // Strict mode

// Results in:
// Referrer-Policy: strict-origin-when-cross-origin
// Permissions-Policy: camera=(), microphone=(), geolocation=()
// Cross-Origin-Opener-Policy: same-origin
```

## DNT/GPC Respect

```typescript
import { shouldRespectDNT } from '@agency/compliance-security-headers/privacy';

if (shouldRespectDNT(request)) {
  // Disable all tracking
  analytics.optOut();
}
```

## Compliance Audit

```typescript
import { HeaderAuditor } from '@agency/compliance-security-headers/audit';

const auditor = new HeaderAuditor();
auditor audit('https://client.com', responseHeaders);
console.log(auditor.generateReport());
```

## Legal Requirements Met

- **GDPR Article 32**: Security of processing (technical measures)
- **CCPA 1798.150**: Reasonable security procedures
- **ePrivacy Directive**: Cookie/script restrictions

## Integration with Consent

Works with `@agency/analytics-consent-bridge`:

```typescript
const consent = useConsentStore.getState().state;
const csp = await getConsentAwareCSP(consent);
```
```


## Related Tasks

- `c9-infra-security-headers` - Standard security headers
- `41-compliance` - Consent management
- `80b-analytics-consent-bridge` - Analytics consent
