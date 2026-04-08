# Lead Enrichment Specification

## Files

```
packages/lead-capture/enrichment/
├── package.json
├── tsconfig.json
├── README.md
├── src/
│   ├── index.ts
│   ├── providers/
│   │   ├── clearbit.ts
│   │   ├── apollo.ts
│   │   └── mock.ts
│   ├── enrichment.ts
│   ├── scoring.ts
│   ├── cache.ts
│   └── types.ts
└── tests/
    └── enrichment.test.ts
```

### `package.json`

```json
{
  "name": "@agency/lead-capture-enrichment",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "exports": {
    ".": "./src/index.ts",
    "./providers": "./src/providers/index.ts",
    "./scoring": "./src/scoring.ts"
  },
  "dependencies": {
    "@agency/core-types": "workspace:*",
    "@agency/data-db": "workspace:*"
  },
  "devDependencies": {
    "@agency/config-eslint": "workspace:*",
    "@agency/config-typescript": "workspace:*"
  },
  "publishConfig": { "access": "restricted" }
}
```

### `src/types.ts`

```typescript
// Enrichment data types

export interface EnrichedLead {
  email: string;
  person?: PersonData;
  company?: CompanyData;
  enrichmentScore: number;  // 0-100 confidence
  enrichedAt: string;
  source: string;
}

export interface PersonData {
  name?: string;
  title?: string;
  role?: 'executive' | 'manager' | 'individual' | 'founder' | 'other';
  seniority?: 'c-suite' | 'vp' | 'director' | 'manager' | 'individual';
  linkedin?: string;
  twitter?: string;
  bio?: string;
  avatar?: string;
}

export interface CompanyData {
  name: string;
  domain: string;
  industry?: string;
  subIndustry?: string;
  size?: '1-10' | '11-50' | '51-200' | '201-500' | '501-1000' | '1000+';
  employeeCount?: number;
  revenue?: string;
  funding?: string;
  founded?: number;
  location?: {
    city?: string;
    state?: string;
    country?: string;
  };
  technologies?: string[];
  linkedin?: string;
  twitter?: string;
  logo?: string;
}

export interface EnrichmentConfig {
  provider: 'clearbit' | 'apollo' | 'mock';
  apiKey: string;
  cacheEnabled: boolean;
  cacheTtl: number;  // seconds
  fallbackToCache: boolean;
}
```

### `src/providers/clearbit.ts`

```typescript
// Clearbit Enrichment API integration

import type { EnrichedLead, EnrichmentConfig } from '../types';

const CLEARBIT_API = 'https://person.clearbit.com/v2/combined/find';

export async function enrichWithClearbit(
  email: string,
  config: EnrichmentConfig
): Promise<EnrichedLead | null> {
  try {
    const response = await fetch(
      `${CLEARBIT_API}?email=${encodeURIComponent(email)}`,
      {
        headers: {
          'Authorization': `Bearer ${config.apiKey}`
        }
      }
    );

    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error(`Clearbit API error: ${response.status}`);
    }

    const data = await response.json();

    return {
      email,
      person: data.person ? {
        name: data.person.name?.fullName,
        title: data.person.employment?.title,
        role: standardizeRole(data.person.employment?.role),
        seniority: standardizeSeniority(data.person.employment?.seniority),
        linkedin: data.person.linkedin?.handle,
        twitter: data.person.twitter?.handle,
        bio: data.person.bio,
        avatar: data.person.avatar
      } : undefined,
      company: data.company ? {
        name: data.company.name,
        domain: data.company.domain,
        industry: data.company.category?.industry,
        subIndustry: data.company.category?.subIndustry,
        size: standardizeSize(data.company.metrics?.employees),
        employeeCount: data.company.metrics?.employees,
        revenue: data.company.metrics?.estimatedAnnualRevenue,
        founded: data.company.foundedYear,
        location: {
          city: data.company.geo?.city,
          state: data.company.geo?.state,
          country: data.company.geo?.country
        },
        technologies: data.company.tech,
        linkedin: data.company.linkedin?.handle,
        twitter: data.company.twitter?.handle,
        logo: data.company.logo
      } : undefined,
      enrichmentScore: calculateScore(data),
      enrichedAt: new Date().toISOString(),
      source: 'clearbit'
    };
  } catch (error) {
    console.error('Clearbit enrichment failed:', error);
    return null;
  }
}

function standardizeRole(role?: string): PersonData['role'] {
  if (!role) return 'other';
  const r = role.toLowerCase();
  if (r.includes('founder') || r.includes('ceo') || r.includes('owner')) return 'founder';
  if (r.includes('manager') || r.includes('lead')) return 'manager';
  if (r.includes('exec') || r.includes('chief') || r.includes('vp')) return 'executive';
  return 'individual';
}

function standardizeSeniority(seniority?: string): PersonData['seniority'] {
  if (!seniority) return 'individual';
  const s = seniority.toLowerCase();
  if (s.includes('c-suite') || s.includes('exec')) return 'c-suite';
  if (s.includes('vp') || s.includes('vice')) return 'vp';
  if (s.includes('director')) return 'director';
  if (s.includes('manager')) return 'manager';
  return 'individual';
}

function standardizeSize(employees?: number): CompanyData['size'] {
  if (!employees) return undefined;
  if (employees <= 10) return '1-10';
  if (employees <= 50) return '11-50';
  if (employees <= 200) return '51-200';
  if (employees <= 500) return '201-500';
  if (employees <= 1000) return '501-1000';
  return '1000+';
}

function calculateScore(data: any): number {
  let score = 0;
  if (data.person) score += 30;
  if (data.company) score += 30;
  if (data.person?.employment) score += 20;
  if (data.company?.metrics) score += 20;
  return score;
}
```

### `src/enrichment.ts`

```typescript
// Main enrichment orchestrator

import type { EnrichedLead, EnrichmentConfig, LeadFormData } from './types';
import { enrichWithClearbit } from './providers/clearbit';
import { getCachedEnrichment, cacheEnrichment } from './cache';

export class LeadEnricher {
  private config: EnrichmentConfig;

  constructor(config: EnrichmentConfig) {
    this.config = config;
  }

  async enrich(email: string, formData?: LeadFormData): Promise<EnrichedLead> {
    // Check cache first
    if (this.config.cacheEnabled) {
      const cached = await getCachedEnrichment(email);
      if (cached) return cached;
    }

    // Attempt enrichment
    let enriched: EnrichedLead | null = null;

    switch (this.config.provider) {
      case 'clearbit':
        enriched = await enrichWithClearbit(email, this.config);
        break;
      // Add other providers here
    }

    // Merge with form data if enrichment incomplete
    if (enriched && formData) {
      enriched = this.mergeWithFormData(enriched, formData);
    }

    // Cache result
    if (enriched && this.config.cacheEnabled) {
      await cacheEnrichment(email, enriched, this.config.cacheTtl);
    }

    // Return basic lead if enrichment failed
    return enriched || {
      email,
      enrichmentScore: 0,
      enrichedAt: new Date().toISOString(),
      source: 'none'
    };
  }

  private mergeWithFormData(
    enriched: EnrichedLead,
    formData: LeadFormData
  ): EnrichedLead {
    return {
      ...enriched,
      person: {
        ...enriched.person,
        name: enriched.person?.name || formData.name,
        title: enriched.person?.title || formData.title
      },
      company: {
        ...enriched.company,
        name: enriched.company?.name || formData.company
      }
    };
  }
}
```

### `src/scoring.ts`

```typescript
// Lead quality scoring based on enrichment

import type { EnrichedLead } from './types';

export interface LeadScore {
  total: number;        // 0-100
  fit: number;        // Company/person fit
  intent: number;     // Engagement signals
  data: {
    hasCompanyData: boolean;
    hasPersonData: boolean;
    companySize?: string;
    seniority?: string;
  };
}

export function scoreLead(lead: EnrichedLead, clientConfig?: any): LeadScore {
  let fit = 0;
  let intent = 0;

  // Company data presence (max 30)
  if (lead.company) {
    fit += 15;
    if (lead.company.size) fit += 5;
    if (lead.company.industry) fit += 5;
    if (lead.company.revenue) fit += 5;
  }

  // Person data presence (max 30)
  if (lead.person) {
    fit += 10;
    if (lead.person.title) fit += 10;
    if (lead.person.seniority) fit += 10;
  }

  // Seniority bonus for decision-makers
  if (lead.person?.senity === 'c-suite' || lead.person?.seniority === 'vp') {
    intent += 20;
  } else if (lead.person?.seniority === 'director') {
    intent += 15;
  } else if (lead.person?.seniority === 'manager') {
    intent += 10;
  }

  // Company size fit (configurable)
  if (clientConfig?.targetCompanySizes?.includes(lead.company?.size)) {
    intent += 15;
  }

  // Enrichment confidence
  intent += Math.round(lead.enrichmentScore / 10);

  return {
    total: Math.min(100, fit + intent),
    fit: Math.min(60, fit),
    intent: Math.min(40, intent),
    data: {
      hasCompanyData: !!lead.company,
      hasPersonData: !!lead.person,
      companySize: lead.company?.size,
      seniority: lead.person?.seniority
    }
  };
}

// Route lead based on score
export function routeLead(score: LeadScore): 'sales' | 'nurture' | 'qualified' {
  if (score.total >= 70) return 'sales';
  if (score.total >= 40) return 'qualified';
  return 'nurture';
}
```

### README

```markdown
# @agency/lead-capture-enrichment

Social profile data enhancement for lead forms.

## The Problem

- Form asks: Name, Email, Company, Title, Size, Industry
- Result: 60% abandonment

## The Solution

Ask only email, enrich the rest:

```typescript
import { LeadEnricher } from '@agency/lead-capture-enrichment';

const enricher = new LeadEnricher({
  provider: 'clearbit',
  apiKey: process.env.CLEARBIT_KEY,
  cacheEnabled: true,
  cacheTtl: 86400 // 24 hours
});

const lead = await enricher.enrich('john@example.com', {
  name: 'John',  // From form
  company: 'Example'  // From form (fallback)
});

// Returns:
// {
//   email: 'john@example.com',
//   person: { title: 'VP Engineering', seniority: 'vp', ... },
//   company: { size: '51-200', industry: 'Software', revenue: '$10M', ... },
//   enrichmentScore: 85
// }
```

## Lead Scoring

```typescript
import { scoreLead, routeLead } from '@agency/lead-capture-enrichment/scoring';

const score = scoreLead(enrichedLead, {
  targetCompanySizes: ['51-200', '201-500']
});

console.log(score.total); // 0-100
const route = routeLead(score); // 'sales' | 'nurture' | 'qualified'
```

## Privacy Compliance

- Data cached for 24 hours only
- No PII stored beyond enrichment data
- Respects email domain privacy settings
- GDPR data processing agreement required

## CRM Integration

```typescript
// HubSpot
await hubspot.contacts.create({
  email: lead.email,
  properties: {
    company: lead.company?.name,
    jobtitle: lead.person?.title,
    num_employees: lead.company?.employeeCount
  }
});
```
```


## Related Tasks

- `82-lead-capture` - Simple lead forms
- `82a-lead-forms-progressive` - Multi-step forms
- `e2-apps-analytics` - Lead analytics
