# Lead Capture Specification (Marketing Platform Edition)

## Rationale (Package vs App)

This is a **shared package** because:
- Lead capture patterns repeat across agency website, client sites, and landing pages
- Spam mitigation and validation logic should be centralized
- CRM integration points need consistent handling
- Attribution tracking must be uniform across all lead forms
- Progressive form orchestration benefits from shared state management

## Files

```
packages/lead-capture/
├── package.json
├── tsconfig.json
├── 01-config-biome-migration-50-ref-quickstart.md
├── CHANGELOG.md
└── src/
    ├── index.ts
    ├── components/
    │   ├── index.ts
    │   ├── lead-form.tsx           # Main form component
    │   ├── progressive-form.tsx      # Multi-step form
    │   ├── form-field.tsx          # Reusable field wrapper
    │   └── submit-button.tsx       # Loading/submit states
    ├── validation/
    │   ├── index.ts
    │   ├── schema.ts               # Zod schemas
    │   ├── honeypot.ts             # Spam detection
    │   └── rate-limit.ts           # Submission throttling
    ├── attribution/
    │   ├── index.ts
    │   ├── capture-utm.ts          # UTM param storage
    │   ├── touchpoint-tracker.ts   # Multi-touch attribution
    │   └── enrichment.ts           # Lead data enrichment
    ├── spam/
    │   ├── index.ts
    │   ├── recaptcha.ts            # reCAPTCHA integration
    │   ├── turnstile.ts            # Cloudflare Turnstile
    │   └── email-validation.ts     # Email verification
    ├── crm/
    │   ├── index.ts
    │   ├── hubspot.ts              # HubSpot integration
    │   ├── salesforce.ts           # Salesforce integration
    │   └── webhook.ts              # Generic webhook
    └── types/
        └── index.ts
```

### package.json

```json
{
  "name": "@agency/lead-capture",
  "version": "0.1.0",
  "private": true,
  "description": "Lead capture forms with validation, spam protection, and CRM integration",
  "type": "module",
  "exports": {
    ".": "./src/index.ts",
    "./components": "./src/components/index.ts",
    "./validation": "./src/validation/index.ts",
    "./attribution": "./src/attribution/index.ts",
    "./spam": "./src/spam/index.ts",
    "./crm": "./src/crm/index.ts",
    "./types": "./src/types/index.ts"
  },
  "scripts": {
    "lint": "eslint src/",
    "typecheck": "tsc --noEmit",
    "test": "vitest run"
  },
  "dependencies": {
    "@agency/core-types": "workspace:*",
    "@agency/core-utils": "workspace:*",
    "@agency/analytics": "workspace:*",
    "@agency/compliance-consent": "workspace:*",
    "zod": "^3.23.0",
    "react-hook-form": "^7.51.0",
    "@hookform/resolvers": "^3.3.0"
  },
  "devDependencies": {
    "@agency/config-eslint": "workspace:*",
    "@agency/config-typescript": "workspace:*",
    "@agency/test-setup": "workspace:*",
    "@types/node": "25.5.2",
    "@types/react": "19.2.14",
    "react": "19.2.5",
    "react-dom": "19.2.5",
    "typescript": "6.0.0"
  },
  "peerDependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0"
  },
  "publishConfig": {
    "access": "restricted"
  }
}
```

### src/validation/schema.ts

```typescript
import { z } from 'zod';

// Per docs/marketing/lead-capture/validation-standards.md

export const LeadFormSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  
  firstName: z
    .string()
    .min(1, 'First name is required')
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must be less than 50 characters'),
  
  lastName: z
    .string()
    .min(1, 'Last name is required')
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must be less than 50 characters'),
  
  company: z
    .string()
    .max(100, 'Company name must be less than 100 characters')
    .optional(),
  
  phone: z
    .string()
    .regex(/^\+?[\d\s-()]+$/, 'Please enter a valid phone number')
    .optional(),
  
  message: z
    .string()
    .max(1000, 'Message must be less than 1000 characters')
    .optional(),
  
  // Honeypot field (hidden, should be empty)
  _gotcha: z.string().max(0).optional(),
  
  // Consent
  marketingConsent: z.boolean().default(false),
});

export type LeadFormData = z.infer<typeof LeadFormSchema>;

// Progressive form (multi-step)
export const ProgressiveFormStep1Schema = LeadFormSchema.pick({
  firstName: true,
  lastName: true,
  email: true,
});

export const ProgressiveFormStep2Schema = LeadFormSchema.pick({
  company: true,
  phone: true,
});

export const ProgressiveFormStep3Schema = LeadFormSchema.pick({
  message: true,
  marketingConsent: true,
});
```

### src/spam/honeypot.ts

```typescript
// Honeypot technique for bot detection
// Per docs/marketing/lead-capture/spam-mitigation.md

export interface HoneypotConfig {
  fieldName: string;
  maxSubmissionTime: number; // seconds
  minSubmissionTime: number; // seconds
}

export const defaultHoneypotConfig: HoneypotConfig = {
  fieldName: '_gotcha',
  maxSubmissionTime: 300, // 5 minutes
  minSubmissionTime: 3,   // 3 seconds (too fast = bot)
};

export function checkHoneypot(
  data: Record<string, unknown>,
  config: HoneypotConfig = defaultHoneypotConfig
): { isValid: boolean; reason?: string } {
  // Check honeypot field
  const honeypotValue = data[config.fieldName];
  if (honeypotValue && String(honeypotValue).length > 0) {
    return { isValid: false, reason: 'honeypot_filled' };
  }
  
  return { isValid: true };
}

export function checkSubmissionTiming(
  formLoadTime: number,
  submitTime: number,
  config: HoneypotConfig = defaultHoneypotConfig
): { isValid: boolean; reason?: string } {
  const duration = (submitTime - formLoadTime) / 1000;
  
  if (duration < config.minSubmissionTime) {
    return { isValid: false, reason: 'too_fast' };
  }
  
  if (duration > config.maxSubmissionTime) {
    return { isValid: false, reason: 'session_expired' };
  }
  
  return { isValid: true };
}
```

### src/attribution/touchpoint-tracker.ts

```typescript
// Multi-touch attribution tracking
// Per docs/marketing/analytics/attribution-model.md

import { getStoredAttribution } from '@agency/analytics/attribution';

export interface LeadAttribution {
  source: string;
  medium: string;
  campaign?: string;
  content?: string;
  term?: string;
  landingPage: string;
  referrer: string;
  touchpoints: Touchpoint[];
}

export interface Touchpoint {
  timestamp: string;
  source: string;
  medium: string;
  campaign?: string;
  path: string;
}

export function captureLeadAttribution(): LeadAttribution {
  const utm = getStoredAttribution();
  
  return {
    source: utm.utm_source || 'direct',
    medium: utm.utm_medium || 'none',
    campaign: utm.utm_campaign,
    content: utm.utm_content,
    term: utm.utm_term,
    landingPage: typeof window !== 'undefined' ? window.location.pathname : '',
    referrer: typeof document !== 'undefined' ? document.referrer : '',
    touchpoints: getTouchpointHistory(),
  };
}

function getTouchpointHistory(): Touchpoint[] {
  if (typeof window === 'undefined') return [];
  
  const stored = sessionStorage.getItem('__touchpoint_history');
  if (!stored) return [];
  
  try {
    return JSON.parse(stored);
  } catch {
    return [];
  }
}
```

### src/components/lead-form.tsx

```typescript
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { LeadFormSchema, type LeadFormData } from '../validation/schema';
import { checkHoneypot, checkSubmissionTiming } from '../spam/honeypot';
import { captureLeadAttribution } from '../attribution/touchpoint-tracker';
import { useAnalytics } from '@agency/analytics/hooks';

interface LeadFormProps {
  formId: string;
  onSubmit: (data: LeadFormData & { attribution: unknown }) => Promise<void>;
  crmIntegration?: 'hubspot' | 'salesforce' | 'webhook';
}

export function LeadForm({ formId, onSubmit, crmIntegration }: LeadFormProps) {
  const { track } = useAnalytics();
  const formLoadTime = Date.now();
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<LeadFormData>({
    resolver: zodResolver(LeadFormSchema),
  });
  
  const handleFormSubmit = async (data: LeadFormData) => {
    // Track form start (if first submission attempt)
    await track({
      name: 'lead_form_submit',
      properties: { form_id: formId },
    });
    
    // Spam checks
    const honeypotCheck = checkHoneypot(data);
    if (!honeypotCheck.isValid) {
      setError('root', { message: 'Submission failed. Please try again.' });
      return;
    }
    
    const timingCheck = checkSubmissionTiming(formLoadTime, Date.now());
    if (!timingCheck.isValid) {
      setError('root', { message: 'Session expired. Please refresh and try again.' });
      return;
    }
    
    // Capture attribution
    const attribution = captureLeadAttribution();
    
    // Submit with attribution
    await onSubmit({ ...data, attribution });
    
    // Track success
    await track({
      name: 'lead_capture_success',
      properties: {
        form_id: formId,
        crm_integration: crmIntegration,
        has_company: !!data.company,
        has_phone: !!data.phone,
      },
    });
  };
  
  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      {/* Honeypot field - hidden from humans */}
      <input
        type="text"
        {...register('_gotcha')}
        className="hidden"
        tabIndex={-1}
        autoComplete="off"
      />
      
      {/* Form fields */}
      <div>
        <label htmlFor="firstName">First Name *</label>
        <input {...register('firstName')} />
        {errors.firstName && <span>{errors.firstName.message}</span>}
      </div>
      
      <div>
        <label htmlFor="email">Email *</label>
        <input type="email" {...register('email')} />
        {errors.email && <span>{errors.email.message}</span>}
      </div>
      
      {/* ... other fields ... */}
      
      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Submitting...' : 'Submit'}
      </button>
      
      {errors.root && <div role="alert">{errors.root.message}</div>}
    </form>
  );
}
```

## Marketing Platform Features (2026)

### Spam Mitigation Stack

Per `docs/marketing/lead-capture/spam-mitigation.md`:

1. **Honeypot Fields** - Hidden fields bots fill out
2. **Submission Timing** - Minimum/maximum time checks
3. **Rate Limiting** - IP-based throttling (via `@agency/config-rate-limit`)
4. **Email Validation** - Real-time MX record verification
5. **CAPTCHA** - Cloudflare Turnstile (privacy-friendly) or reCAPTCHA v3

### Attribution Tracking

```typescript
// Full attribution on every lead
{
  "lead_id": "lead_abc123",
  "form_id": "contact_page",
  "attribution": {
    "source": "google",
    "medium": "cpc",
    "campaign": "spring-2024",
    "landing_page": "/services/web-design",
    "touchpoints": [
      { "source": "google", "medium": "organic", "path": "/blog" },
      { "source": "google", "medium": "cpc", "path": "/services" }
    ]
  }
}
```

### Progressive Form Orchestration

For forms with >4 fields or >40% abandonment (per condition-gated tasks):

```typescript
import { ProgressiveForm } from '@agency/lead-capture/components';

<ProgressiveForm
  steps={[
    { fields: ['firstName', 'lastName', 'email'], title: 'Contact Info' },
    { fields: ['company', 'phone'], title: 'Company Details' },
    { fields: ['message'], title: 'Project Details' },
  ]}
  onStepChange={(step) => track({ name: 'lead_form_step_complete', properties: { step } })}
/>
```

### Endpoint Ownership

```typescript
// apps/agency-website/app/api/leads/route.ts
import { submitLead } from '@agency/lead-capture/crm/hubspot';
import { checkRateLimit } from '@agency/config-rate-limit';

export async function POST(request: Request) {
  const ip = request.headers.get('x-forwarded-for') || 'unknown';
  
  // Rate limiting
  const rateLimit = await checkRateLimit(`leads:${ip}`, 5, 3600);
  if (!rateLimit.success) {
    return Response.json({ error: 'Rate limit exceeded' }, { status: 429 });
  }
  
  // Process lead
  const data = await request.json();
  const result = await submitLead(data);
  
  return Response.json(result);
}
```

## Verification Steps

```bash
# Test form validation
pnpm --filter @agency/lead-capture test

# Test spam detection
pnpm --filter @agency/lead-capture test:spam

# Test CRM integration
pnpm --filter @agency/lead-capture test:crm

# Integration test
pnpm --filter @agency/agency-website test:lead-capture
```
