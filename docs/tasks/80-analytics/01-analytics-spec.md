# 80-analytics: Implementation Specification

## Task Header

| Field | Value |
|-------|-------|
| **State** | `conditional` — Package-controlled, opt-in only |
| **Trigger** | Repository initialization — always required |
| **Minimum Consumers** | n/a (root infrastructure) |
| **Dependencies** | Plausible OR PostHog OR Google Analytics 4, React 19.2.5 |
| **Exit Criteria** | Root package.json, pnpm-workspace.yaml, turbo.json committed and verified |
| **Implementation Authority** | `REPO-STATE.md` — Phase: Planning, Build status: Not started |
| **Version Authority** | `DEPENDENCY.md` §2 — React 19.2.5 |
| **Supersedes** | n/a |
| **Superseded by** | n/a |

## Cross-references

- Decision status: `DECISION-STATUS.md` — Analytics `open` (evaluate during Task 80)
- Version pins: `DEPENDENCY.md` §2
- Architecture: `ARCHITECTURE.md` — Analytics layer

## Rationale (Package vs App)

This is a **shared package** (not an app) because:
- Every app (marketing sites, client portals, internal tools) needs analytics
- Tracking patterns must be consistent for accurate cross-app attribution
- Privacy-compliant tracking logic should be centralized and reusable
- Multi-platform analytics (Plausible + PostHog + GA4) needs unified abstraction
- Attribution tracking requires shared utilities across the entire user journey


## Files

```
packages/analytics/
├── package.json
├── tsconfig.json
├── README.md
├── CHANGELOG.md
└── src/
    ├── index.ts
    ├── providers/
    │   ├── index.ts
    │   ├── plausible.ts
    │   ├── posthog.ts
    │   ├── ga4.ts
    │   └── base.ts
    ├── components/
    │   ├── index.ts
    │   ├── page-view-tracker.tsx
    │   ├── event-tracker.tsx
    │   └── analytics-provider.tsx
    ├── hooks/
    │   ├── index.ts
    │   ├── use-analytics.ts
    │   ├── use-page-view.ts
    │   └── use-event-tracking.ts
    ├── attribution/
    │   ├── index.ts
    │   ├── utm-tracking.ts
    │   ├── session-storage.ts
    │   └── touchpoint-tracker.ts
    ├── utils/
    │   ├── index.ts
    │   ├── event-sanitizer.ts
    │   ├── identity-resolution.ts
    │   └── debug-logger.ts
    └── types/
        └── index.ts
```

### `package.json`

```json
{
  "name": "@agency/analytics",
  "version": "0.1.0",
  "private": true,
  "description": "Multi-platform analytics tracking with privacy compliance",
  "type": "module",
  "exports": {
    ".": "./src/index.ts",
    "./providers": "./src/providers/index.ts",
    "./components": "./src/components/index.ts",
    "./hooks": "./src/hooks/index.ts",
    "./attribution": "./src/attribution/index.ts",
    "./utils": "./src/utils/index.ts",
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
    "@agency/compliance-consent": "workspace:*"
  },
  "devDependencies": {
    "@agency/config-eslint": "workspace:*",
    "@agency/config-typescript": "workspace:*",
    "@agency/test-setup": "workspace:*",
    "@types/node": "25.5.2",
    "@types/react": "19.2.14",
    "posthog-js": "1.365.5",
    "posthog-node": "5.29.2",
    "react": "19.2.5",
    "react-dom": "19.2.5",
    "typescript": "6.0.2"
  },
  "peerDependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "next": "^16.0.0"
  },
  "publishConfig": {
    "access": "restricted"
  }
}
```

### `src/types/index.ts`

```typescript
export type AnalyticsProvider = "plausible" | "posthog" | "ga4" | "all";

export interface AnalyticsEvent {
  name: string;
  properties?: Record<string, unknown>;
  timestamp?: Date;
  sessionId?: string;
}

export interface PageViewEvent extends AnalyticsEvent {
  name: "page_view";
  properties: {
    path: string;
    title: string;
    referrer?: string;
    utm_source?: string;
    utm_medium?: string;
    utm_campaign?: string;
    utm_content?: string;
    utm_term?: string;
  };
}

export interface ConversionEvent extends AnalyticsEvent {
  name: "conversion" | "lead_capture" | "purchase" | "signup";
  properties: {
    value?: number;
    currency?: string;
    conversionId: string;
    touchpoints: Touchpoint[];
  };
}

export interface Touchpoint {
  source: string;
  medium: string;
  campaign?: string;
  timestamp: Date;
  path: string;
}

export interface AttributionModel {
  type: "first_touch" | "last_touch" | "linear" | "time_decay" | "position_based";
  lookbackDays?: number;
}

export interface AnalyticsConfig {
  plausible?: {
    domain: string;
    apiHost?: string;
  };
  posthog?: {
    apiKey: string;
    apiHost?: string;
    personProfiles?: "always" | "never" | "identified_only";
  };
  ga4?: {
    measurementId: string;
  };
  debug?: boolean;
  enableInDevelopment?: boolean;
}
```

### `src/hooks/use-analytics.ts`

```typescript
"use client";

import { useCallback } from "react";
import { useConsent } from "@agency/compliance-consent/hooks";
import { AnalyticsManager } from "../providers/base";
import type { AnalyticsEvent, AnalyticsConfig } from "../types";

export function useAnalytics(config: AnalyticsConfig) {
  const { hasConsent } = useConsent();
  const manager = new AnalyticsManager(config);

  const track = useCallback(
    async (event: AnalyticsEvent) => {
      // Check consent before tracking
      if (!hasConsent("analytics")) {
        if (config.debug) {
          console.log("[Analytics] Blocked by consent:", event.name);
        }
        return;
      }

      // Sanitize event data (remove PII if no personalData consent)
      const sanitizedEvent = await sanitizeEvent(event, hasConsent("personalData"));
      
      await manager.track(sanitizedEvent);
    },
    [hasConsent, config]
  );

  const identify = useCallback(
    async (userId: string, traits?: Record<string, unknown>) => {
      if (!hasConsent("analytics")) return;
      if (!hasConsent("personalData")) {
        // Anonymize traits
        const anonymizedTraits = anonymizeUserTraits(traits);
        await manager.identify(userId, anonymizedTraits);
        return;
      }
      
      await manager.identify(userId, traits);
    },
    [hasConsent, config]
  );

  const page = useCallback(
    async (properties: Record<string, unknown>) => {
      if (!hasConsent("analytics")) return;
      await manager.page(properties);
    },
    [hasConsent, config]
  );

  return {
    track,
    identify,
    page,
    isEnabled: hasConsent("analytics"),
  };
}

function sanitizeEvent(
  event: AnalyticsEvent, 
  hasPersonalDataConsent: boolean
): AnalyticsEvent {
  if (hasPersonalDataConsent) return event;

  // Remove PII from event properties
  const sanitized = { ...event };
  if (sanitized.properties) {
    delete sanitized.properties.email;
    delete sanitized.properties.name;
    delete sanitized.properties.phone;
    delete sanitized.properties.userId;
  }
  return sanitized;
}

function anonymizeUserTraits(traits?: Record<string, unknown>) {
  if (!traits) return {};
  // Keep only non-identifying traits
  const { email, name, phone, ...safeTraits } = traits;
  return safeTraits;
}
```

### `src/providers/base.ts`

```typescript
import type { AnalyticsEvent, AnalyticsConfig } from "../types";
import { PlausibleProvider } from "./plausible";
import { PostHogProvider } from "./posthog";
import { GA4Provider } from "./ga4";

export class AnalyticsManager {
  private providers: AnalyticsProvider[] = [];
  private config: AnalyticsConfig;

  constructor(config: AnalyticsConfig) {
    this.config = config;
    this.initializeProviders();
  }

  private initializeProviders() {
    if (this.config.plausible) {
      this.providers.push(new PlausibleProvider(this.config.plausible));
    }
    if (this.config.posthog) {
      this.providers.push(new PostHogProvider(this.config.posthog));
    }
    if (this.config.ga4) {
      this.providers.push(new GA4Provider(this.config.ga4));
    }
  }

  async track(event: AnalyticsEvent): Promise<void> {
    if (!this.shouldTrack()) return;

    const promises = this.providers.map((provider) =>
      provider.track(event).catch((err) => {
        if (this.config.debug) {
          console.error(`[Analytics] ${provider.name} error:`, err);
        }
      })
    );

    await Promise.all(promises);
  }

  async identify(userId: string, traits?: Record<string, unknown>): Promise<void> {
    if (!this.shouldTrack()) return;

    const promises = this.providers.map((provider) =>
      provider.identify(userId, traits).catch((err) => {
        if (this.config.debug) {
          console.error(`[Analytics] ${provider.name} identify error:`, err);
        }
      })
    );

    await Promise.all(promises);
  }

  async page(properties: Record<string, unknown>): Promise<void> {
    await this.track({
      name: "page_view",
      properties,
    });
  }

  private shouldTrack(): boolean {
    if (typeof window === "undefined") return false;
    if (process.env.NODE_ENV === "development" && !this.config.enableInDevelopment) {
      return false;
    }
    return true;
  }
}

interface AnalyticsProvider {
  name: string;
  track(event: AnalyticsEvent): Promise<void>;
  identify(userId: string, traits?: Record<string, unknown>): Promise<void>;
}
```

### `src/components/page-view-tracker.tsx`

```typescript
"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { useAnalytics } from "../hooks/use-analytics";
import { parseUtmParams } from "../attribution/utm-tracking";

interface PageViewTrackerProps {
  siteId: string;
}

export function PageViewTracker({ siteId }: PageViewTrackerProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { page } = useAnalytics({
    plausible: { domain: siteId },
  });

  useEffect(() => {
    const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : "");
    const utmParams = parseUtmParams(searchParams);

    page({
      path: url,
      title: document.title,
      referrer: document.referrer,
      ...utmParams,
    });
  }, [pathname, searchParams, page]);

  return null;
}
```

### `src/attribution/utm-tracking.ts`

```typescript
import type { ReadonlyURLSearchParams } from "next/navigation";

export interface UTMParams {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
}

export function parseUtmParams(
  searchParams: ReadonlyURLSearchParams | null
): UTMParams {
  if (!searchParams) return {};

  return {
    utm_source: searchParams.get("utm_source") || undefined,
    utm_medium: searchParams.get("utm_medium") || undefined,
    utm_campaign: searchParams.get("utm_campaign") || undefined,
    utm_content: searchParams.get("utm_content") || undefined,
    utm_term: searchParams.get("utm_term") || undefined,
  };
}

export function storeAttributionData(params: UTMParams): void {
  if (typeof window === "undefined") return;

  const sessionData = {
    ...params,
    timestamp: new Date().toISOString(),
    landingPage: window.location.pathname,
  };

  // Store in sessionStorage for session-level attribution
  sessionStorage.setItem("__utm_attribution", JSON.stringify(sessionData));
}

export function getStoredAttribution(): UTMParams | null {
  if (typeof window === "undefined") return null;

  const stored = sessionStorage.getItem("__utm_attribution");
  if (!stored) return null;

  try {
    const data = JSON.parse(stored);
    return {
      utm_source: data.utm_source,
      utm_medium: data.utm_medium,
      utm_campaign: data.utm_campaign,
      utm_content: data.utm_content,
      utm_term: data.utm_term,
    };
  } catch {
    return null;
  }
}

export function buildAttributionString(params: UTMParams): string {
  const parts = [];
  if (params.utm_source) parts.push(`source: ${params.utm_source}`);
  if (params.utm_medium) parts.push(`medium: ${params.utm_medium}`);
  if (params.utm_campaign) parts.push(`campaign: ${params.utm_campaign}`);
  return parts.join(" | ");
}
```

### `src/index.ts`

```typescript
// Components
export { PageViewTracker } from "./components/page-view-tracker";
export { EventTracker } from "./components/event-tracker";
export { AnalyticsProvider } from "./components/analytics-provider";

// Hooks
export { useAnalytics } from "./hooks/use-analytics";
export { usePageView } from "./hooks/use-page-view";
export { useEventTracking } from "./hooks/use-event-tracking";

// Providers
export { AnalyticsManager } from "./providers/base";
export { PlausibleProvider } from "./providers/plausible";
export { PostHogProvider } from "./providers/posthog";
export { GA4Provider } from "./providers/ga4";

// Attribution
export {
  parseUtmParams,
  storeAttributionData,
  getStoredAttribution,
  buildAttributionString,
} from "./attribution/utm-tracking";

// Utils
export { sanitizeEventData } from "./utils/event-sanitizer";
export { resolveUserIdentity } from "./utils/identity-resolution";

// Types
export type {
  AnalyticsProvider,
  AnalyticsEvent,
  PageViewEvent,
  ConversionEvent,
  Touchpoint,
  AttributionModel,
  AnalyticsConfig,
} from "./types";
```


## Usage Example

```typescript
// In app layout.tsx
import { AnalyticsProvider } from "@agency/analytics/components";

export default function RootLayout({ children }) {
  return (
    <AnalyticsProvider
      config={{
        plausible: { domain: "agency.com" },
        posthog: {
          apiKey: process.env.NEXT_PUBLIC_POSTHOG_KEY,
          apiHost: process.env.NEXT_PUBLIC_POSTHOG_HOST,
        },
        debug: process.env.NODE_ENV === "development",
      }}
    >
      {children}
    </AnalyticsProvider>
  );
}

// Track custom events
import { useAnalytics } from "@agency/analytics/hooks";

function ContactForm() {
  const { track } = useAnalytics();

  const handleSubmit = async (data) => {
    await track({
      name: "contact_form_submit",
      properties: {
        form_id: "contact_page",
        has_company: !!data.company,
      },
    });
  };
}
```


## Marketing Platform Event Taxonomy (2026)

### Event Categories

```typescript
// src/taxonomy/index.ts
// Standardized event taxonomy for marketing consistency

export const EventCategories = {
  // Page lifecycle
  PAGE: 'page',
  
  // Lead generation
  LEAD: 'lead',
  
  // Content engagement
  CONTENT: 'content',
  
  // E-commerce (if applicable)
  ECOMMERCE: 'ecommerce',
  
  // Campaign attribution
  CAMPAIGN: 'campaign',
} as const;

export const Events = {
  // Page events
  PAGE_VIEW: 'page_view',
  PAGE_ENGAGEMENT: 'page_engagement',
  SCROLL_DEPTH: 'scroll_depth',
  
  // Lead events
  LEAD_FORM_START: 'lead_form_start',
  LEAD_FORM_STEP_COMPLETE: 'lead_form_step_complete',
  LEAD_FORM_SUBMIT: 'lead_form_submit',
  LEAD_CAPTURE_SUCCESS: 'lead_capture_success',
  LEAD_QUALIFICATION: 'lead_qualification',
  
  // Content events
  CONTENT_CLICK: 'content_click',
  EXTERNAL_LINK_CLICK: 'external_link_click',
  FILE_DOWNLOAD: 'file_download',
  VIDEO_PLAY: 'video_play',
  VIDEO_ENGAGEMENT: 'video_engagement',
  
  // Campaign events
  CAMPAIGN_CLICK: 'campaign_click',
  UTM_CAPTURE: 'utm_capture',
} as const;

// Standard event properties
export interface StandardProperties {
  page_path: string;
  page_title: string;
  page_referrer: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
  device_type: 'desktop' | 'tablet' | 'mobile';
  browser: string;
  timestamp: string;
  session_id: string;
}

// Lead event properties
export interface LeadEventProperties extends StandardProperties {
  form_id: string;
  form_name?: string;
  form_step?: number;
  form_total_steps?: number;
  lead_source: string;
  lead_medium: string;
  lead_campaign?: string;
  has_email: boolean;
  has_phone: boolean;
  has_company: boolean;
}

// Content event properties
export interface ContentEventProperties extends StandardProperties {
  content_id: string;
  content_type: 'article' | 'video' | 'download' | 'link';
  content_title?: string;
  content_category?: string;
}
```

### Consent-Aware Tracking

```typescript
// src/consent/tracking.ts
// Per docs/marketing/analytics/consent-bridge.md

import { useConsent } from '@agency/compliance-consent';

export function useConsentAwareTracking() {
  const { hasConsent } = useConsent();
  
  return {
    canTrackAnalytics: hasConsent('analytics'),
    canTrackMarketing: hasConsent('marketing'),
    canTrackPersonalization: hasConsent('personalization'),
    canTrackFullStory: hasConsent('functional'),
  };
}

// Wrap tracking calls
export async function trackWithConsent(
  event: AnalyticsEvent,
  consentType: 'analytics' | 'marketing'
) {
  const { hasConsent } = useConsent();
  
  if (!hasConsent(consentType)) {
    console.log(`[Analytics] Blocked: ${event.name} (no ${consentType} consent)`);
    return;
  }
  
  await track(event);
}
```

### Conversion Instrumentation

```typescript
// src/conversion/index.ts
// Track conversions with attribution

export interface ConversionEvent {
  name: 'conversion' | 'purchase' | 'lead_generated' | 'demo_requested';
  properties: {
    conversion_id: string;
    conversion_value?: number;
    currency?: string;
    funnel_stage: 'awareness' | 'interest' | 'consideration' | 'decision' | 'action';
    touchpoints: Touchpoint[];
    time_to_convert: number; // seconds
  };
}

export function trackConversion(event: ConversionEvent) {
  // Include full attribution data
  const attribution = getStoredAttribution();
  
  return track({
    ...event,
    properties: {
      ...event.properties,
      ...attribution,
    },
  });
}
```

### Server-Side Tracking (Next.js App Router)

```typescript
// src/server/posthog-server.ts
// Server-side analytics for Next.js App Router Server Components
// Bypasses ad-blockers and handles iOS privacy restrictions

import { PostHog } from 'posthog-node';

// Singleton pattern for serverless environments
let posthogClient: PostHog | null = null;

export function getServerPostHog(): PostHog {
  if (!posthogClient) {
    posthogClient = new PostHog(process.env.POSTHOG_SERVER_KEY!, {
      host: process.env.POSTHOG_HOST || 'https://app.posthog.com',
      // Flush immediately for serverless (no batching)
      flushAt: 1,
      flushInterval: 0,
    });
  }
  return posthogClient;
}

export interface ServerTrackEvent {
  event: string;
  properties?: Record<string, unknown>;
  userId?: string;
  anonymousId?: string;
}

export async function trackServerEvent({
  event,
  properties = {},
  userId,
  anonymousId,
}: ServerTrackEvent) {
  const client = getServerPostHog();
  
  // Use anonymous ID if no user ID
  const distinctId = userId || anonymousId || `anon_${generateId()}`;
  
  client.capture({
    distinctId,
    event,
    properties: {
      ...properties,
      // Mark as server-tracked for filtering
      $lib: 'server-node',
      // Add server timestamp
      server_timestamp: new Date().toISOString(),
    },
  });
  
  // Flush immediately for serverless
  await client.flush();
}

// Helper for Server Components
export async function trackPageViewServer(
  pathname: string,
  searchParams: Record<string, string>,
  headers: Headers
) {
  const userAgent = headers.get('user-agent') || '';
  const referrer = headers.get('referer') || '';
  
  await trackServerEvent({
    event: '$pageview',
    properties: {
      pathname,
      search_params: searchParams,
      referrer,
      // Server-only data
      user_agent_hash: hashString(userAgent),
      // iOS app detection (for SKAdNetwork compatibility note)
      is_ios_app: detectIosApp(userAgent),
    },
  });
}

function generateId(): string {
  return Math.random().toString(36).substring(2, 15);
}

function hashString(str: string): string {
  // Simple hash for privacy - not meant to be reversible
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash.toString(16);
}

function detectIosApp(userAgent: string): boolean {
  return /iPhone|iPad|iPod/.test(userAgent) && !/Safari/.test(userAgent);
}
```

### Server Component Usage

```typescript
// app/blog/[slug]/page.tsx
import { trackPageViewServer } from '@agency/analytics/server';
import { headers } from 'next/headers';

export default async function BlogPost({ 
  params 
}: { 
  params: { slug: string } 
}) {
  // Track server-side (bypasses ad-blockers)
  const headersList = headers();
  await trackPageViewServer(
    `/blog/${params.slug}`,
    {},
    headersList
  );
  
  return (
    <article>
      {/* Page content */}
    </article>
  );
}
```

### Server/Client Provider Pattern

```typescript
// src/providers/analytics-provider.tsx
'use client';

import { PostHogProvider } from 'posthog-js/react';
import { useEffect } from 'react';

interface AnalyticsProviderProps {
  children: React.ReactNode;
  // Server-fetched distinct ID for session continuity
  serverDistinctId?: string;
}

export function AnalyticsProvider({ 
  children, 
  serverDistinctId 
}: AnalyticsProviderProps) {
  useEffect(() => {
    // Initialize client-side PostHog
    if (typeof window !== 'undefined') {
      import('posthog-js').then((posthog) => {
        posthog.default.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
          api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
          // Use server distinct ID if available (session continuity)
          loaded: (ph) => {
            if (serverDistinctId) {
              ph.identify(serverDistinctId);
            }
          },
        });
      });
    }
  }, [serverDistinctId]);

  return (
    <PostHogProvider client={undefined}>
      {children}
    </PostHogProvider>
  );
}
```

## Environment Variables

Apps using this package need:

```bash
# Plausible
NEXT_PUBLIC_PLAUSIBLE_DOMAIN=agency.com

# PostHog
NEXT_PUBLIC_POSTHOG_KEY=phc_...
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com
POSTHOG_SERVER_KEY=phc_... (server-side key, different from client key)

# PostHog Feature Flags (server-side)
POSTHOG_PERSONAL_API_KEY=phx_... (for local evaluation)

# GA4
NEXT_PUBLIC_GA4_MEASUREMENT_ID=G-...

# Consent management (per docs/marketing/analytics)
NEXT_PUBLIC_CONSENT_MODE=gdpr-ccpa
```


## Verification Steps

```bash
# Test analytics utilities
pnpm --filter @agency/analytics test

# Verify type exports
pnpm --filter @agency/analytics typecheck

# Check integration
pnpm --filter @agency/agency-website build
```
