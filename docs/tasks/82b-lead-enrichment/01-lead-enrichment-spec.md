# 82b-lead-enrichment: Implementation Specification

## Task Header

| Field | Value |
|-------|-------|
| **State** | `conditional` — Package-controlled, opt-in only |
| **Trigger** | App requires lead data enrichment from external sources |
| **Minimum Consumers** | 1+ apps with lead enrichment needs |
| **Dependencies** | Clearbit OR Apollo API, TypeScript 6.0 |
| **Exit Criteria** | Lead enrichment package exported and integrated |
| **Implementation Authority** | `REPO-STATE.md` — Conditional; requires explicit business need |
| **Version Authority** | `DEPENDENCY.md` §1 — TypeScript 6.0 |
| **Superseded by** | n/a |

**Cross-references:**
- Decision status: `DECISION-STATUS.md` — Lead enrichment `open`
- Version pins: `DEPENDENCY.md` §1
- Note: Sub-task of 82-lead-capture; optional data enhancement

## Files

```
packages/lead-capture/enrichment/
├── package.json
├── tsconfig.json
├── README.md
├── src/
│   ├── index.ts
│   ├── providers/
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
  provider: 'apollo' | 'zoominfo' | 'cognism' | 'lusha' | 'mock';
  apiKey: string;
  cacheEnabled: boolean;
  cacheTtl: number;  // seconds
  fallbackToCache: boolean;
}
```

### `src/providers/apollo.ts`

```typescript
// Apollo.io Enrichment API integration
// Primary provider as of April 2026 (replaces deprecated Clearbit)

import type { EnrichedLead, EnrichmentConfig } from '../types';

const APOLLO_API = 'https://api.apollo.io/v1';

export async function enrichWithApollo(
  email: string,
  config: EnrichmentConfig
): Promise<EnrichedLead | null> {
  try {
    const response = await fetch(
      `${APOLLO_API}/people/match`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
          'X-Api-Key': config.apiKey
        },
        body: JSON.stringify({
          email,
          // Privacy-compliant: don't request personal emails
          reveal_personal_emails: false,
          // Direct dial costs extra credits - disable by default
          show_direct_dial: false
        })
      }
    );

    if (!response.ok) {
      if (response.status === 404) return null;
      if (response.status === 429) {
        // Rate limit: implement backoff
        throw new Error('Apollo rate limit exceeded');
      }
      throw new Error(`Apollo API error: ${response.status}`);
    }

    const data = await response.json();
    const person = data.person;
    const organization = person?.organization;

    return {
      email,
      person: person ? {
        name: person.name,
        title: person.title,
        role: standardizeRole(person.title),
        seniority: standardizeSeniority(person.title),
        linkedin: person.linkedin_url,
        bio: person.bio,
        avatar: person.photo_url
      } : undefined,
      company: organization ? {
        name: organization.name,
        domain: organization.domain,
        industry: organization.industry,
        subIndustry: organization.sub_industry,
        size: standardizeSize(organization.estimated_num_employees),
        employeeCount: organization.estimated_num_employees,
        revenue: organization.annual_revenue,
        founded: organization.founded_year,
        location: {
          city: organization.city,
          state: organization.state,
          country: organization.country
        },
        technologies: organization.technologies,
        linkedin: organization.linkedin_url,
        logo: organization.logo_url
      } : undefined,
      enrichmentScore: calculateApolloScore(person, organization),
      enrichedAt: new Date().toISOString(),
      source: 'apollo'
    };
  } catch (error) {
    console.error('Apollo enrichment failed:', error);
    return null;
  }
}

function calculateApolloScore(person: any, organization: any): number {
  let score = 0;
  if (person) score += 30;
  if (organization) score += 30;
  if (person?.title) score += 20;
  if (organization?.estimated_num_employees) score += 20;
  return score;
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
import { enrichWithApollo } from './providers/apollo';
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
      case 'apollo':
        enriched = await enrichWithApollo(email, this.config);
        break;
      case 'mock':
        enriched = await this.mockEnrich(email);
        break;
      // Add other providers (zoominfo, cognism, lusha) here
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

## Provider Migration Notice (April 2026)

Clearbit has been deprecated and is now HubSpot Breeze Intelligence (HubSpot-only).
Apollo.io is the recommended replacement with a generous free tier and 230M+ contacts.

## The Problem

- Form asks: Name, Email, Company, Title, Size, Industry
- Result: 60% abandonment

## The Solution

Ask only email, enrich the rest:

```typescript
import { LeadEnricher } from '@agency/lead-capture-enrichment';

const enricher = new LeadEnricher({
  provider: 'apollo',
  apiKey: process.env.APOLLO_API_KEY,
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
