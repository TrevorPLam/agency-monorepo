# e2-apps-analytics: Implementation Specification

## Task Header

| Field | Value |
|-------|-------|
| **State** | `conditional` — Package-controlled, opt-in only |
| **Trigger** | App requires integrated analytics dashboard |
| **Minimum Consumers** | 1+ apps with analytics visualization needs |
| **Dependencies** | Next.js 16.2.3, React 19.2.5, `@agency/analytics` |
| **Exit Criteria** | Analytics app deployed and displaying data |
| **Implementation Authority** | `REPO-STATE.md` — Conditional; requires explicit business need |
| **Version Authority** | `DEPENDENCY.md` §2 — Next.js 16.2.3, React 19.2.5 |
| **Supersedes** | n/a |
| **Superseded by** | n/a |

**Cross-references:**
- Decision status: `DECISION-STATUS.md` — Analytics app `open`
- Version pins: `DEPENDENCY.md` §2
- Note: Conditional; internal tool for analytics visualization

## Overview

Per ARCHITECTURE.md and DEPENDENCY.md, the agency uses a **two-analytics architecture**:

| Tool | Purpose | Use In |
|------|---------|--------|
| **Plausible** | Marketing analytics, no cookies, GDPR-compliant | Public websites (agency-website, client sites) |
| **PostHog** | Product analytics, session replay, feature flags | Internal tools, client portals |


## Files

```
docs/
└── analytics/
    ├── overview.md
    ├── plausible-setup.md
    └── posthog-setup.md
packages/
└── analytics/
    ├── plausible-web/
    │   ├── package.json
    │   ├── tsconfig.json
    │   ├── 01-config-biome-migration-50-ref-quickstart.md
    │   └── src/
    │       ├── index.ts
    │       └── provider.tsx
    └── posthog-client/
        ├── package.json
        ├── tsconfig.json
        ├── 01-config-biome-migration-50-ref-quickstart.md
        └── src/
            ├── index.ts
            ├── provider.tsx
            └── hooks/
                └── useFeatureFlag.ts
```


## Package 1: Plausible Web (`packages/analytics/plausible-web`)

### `package.json`
```json
{
  "name": "@agency/analytics-plausible",
  "version": "0.1.0",
  "private": true,
  "description": "Plausible analytics for marketing sites",
  "type": "module",
  "exports": {
    ".": "./src/index.ts",
    "./provider": "./src/provider.tsx"
  },
  "dependencies": {
    "@plausible-analytics/tracker": "0.4.4",
    "react": "19.2.5"
  },
  "devDependencies": {
    "@agency/config-eslint": "workspace:*",
    "@agency/config-typescript": "workspace:*",
    "@types/react": "19.2.14",
    "typescript": "6.0.0"
  }
}
```

### Provider (`src/provider.tsx`)
```typescript
"use client";

import { useEffect } from "react";
import Plausible from "@plausible-analytics/tracker";

interface PlausibleProviderProps {
  children: React.ReactNode;
  domain: string;
  apiHost?: string;
}

export function PlausibleProvider({
  children,
  domain,
  apiHost = "https://plausible.io",
}: PlausibleProviderProps) {
  useEffect(() => {
    const plausible = Plausible({
      domain,
      apiHost,
      trackLocalhost: process.env.NODE_ENV === "development",
    });

    // Track page views automatically
    plausible.trackPageview();
  }, [domain, apiHost]);

  return <>{children}</>;
}

// Hook for manual event tracking
export function usePlausible() {
  return {
    trackEvent: (eventName: string, props?: Record<string, string>) => {
      if (typeof window !== "undefined" && (window as any).plausible) {
        (window as any).plausible(eventName, { props });
      }
    },
  };
}
```

### Index (`src/index.ts`)
```typescript
export { PlausibleProvider, usePlausible } from "./provider";
```

### README (`01-config-biome-migration-50-ref-quickstart.md`)
```markdown
# @agency/analytics-plausible

Plausible Analytics integration for marketing sites.

## Usage

### In your app layout.tsx:
```typescript
import { PlausibleProvider } from "@agency/analytics-plausible/provider";

export default function RootLayout({ children }) {
  return (
    <PlausibleProvider domain="yourdomain.com">
      {children}
    </PlausibleProvider>
  );
}
```

### Track custom events:
```typescript
import { usePlausible } from "@agency/analytics-plausible/provider";

function ContactButton() {
  const { trackEvent } = usePlausible();
  
  return (
    <button onClick={() => trackEvent("contact-click")}>
      Contact Us
    </button>
  );
}
```

## Environment Variables

```bash
# No environment variables needed for Plausible
# Domain is passed as prop to provider
```

## GDPR Compliance

Plausible is GDPR-compliant by default:
- No cookies used
- No personal data collected
- No cross-site tracking
- No data sold to third parties
```


## Package 2: PostHog Client (`packages/analytics/posthog-client`)

### `package.json`
```json
{
  "name": "@agency/analytics-posthog",
  "version": "0.1.0",
  "private": true,
  "description": "PostHog analytics for product insights and feature flags",
  "type": "module",
  "exports": {
    ".": "./src/index.ts",
    "./provider": "./src/provider.tsx",
    "./hooks": "./src/hooks/index.ts"
  },
  "dependencies": {
    "posthog-js": "1.366.0",
    "posthog-node": "5.29.2",
    "react": "19.2.5"
  },
  "devDependencies": {
    "@agency/config-eslint": "workspace:*",
    "@agency/config-typescript": "workspace:*",
    "@types/react": "19.2.14",
    "typescript": "6.0.0"
  }
}
```

### Provider (`src/provider.tsx`)
```typescript
"use client";

import { useEffect } from "react";
import posthog from "posthog-js";

interface PostHogProviderProps {
  children: React.ReactNode;
  apiKey: string;
  apiHost?: string;
  userId?: string;
  userProperties?: Record<string, any>;
}

export function PostHogProvider({
  children,
  apiKey,
  apiHost = "https://us.i.posthog.com",
  userId,
  userProperties,
}: PostHogProviderProps) {
  useEffect(() => {
    // Initialize PostHog
    posthog.init(apiKey, {
      api_host: apiHost,
      capture_pageview: true,
      capture_pageleave: true,
      persistence: "localStorage",
      loaded: (posthog) => {
        if (userId) {
          posthog.identify(userId, userProperties);
        }
      },
    });

    return () => {
      posthog.shutdown();
    };
  }, [apiKey, apiHost, userId, userProperties]);

  return <>{children}</>;
}

// Hook for tracking
export function usePostHog() {
  return {
    track: (eventName: string, properties?: Record<string, any>) => {
      posthog.capture(eventName, properties);
    },
    identify: (userId: string, properties?: Record<string, any>) => {
      posthog.identify(userId, properties);
    },
    reset: () => {
      posthog.reset();
    },
  };
}
```

### Feature Flag Hook (`src/hooks/useFeatureFlag.ts`)
```typescript
import { useEffect, useState } from "react";
import posthog from "posthog-js";

export function useFeatureFlag(flagName: string): boolean {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    // Check initial state
    setEnabled(posthog.isFeatureEnabled(flagName) ?? false);

    // Listen for changes
    const unsubscribe = posthog.onFeatureFlags(() => {
      setEnabled(posthog.isFeatureEnabled(flagName) ?? false);
    });

    return () => {
      unsubscribe?.();
    };
  }, [flagName]);

  return enabled;
}

// Hook for multivariate flags
export function useFeatureFlagVariant(flagName: string): string | null {
  const [variant, setVariant] = useState<string | null>(null);

  useEffect(() => {
    setVariant(posthog.getFeatureFlag(flagName) as string | null);

    const unsubscribe = posthog.onFeatureFlags(() => {
      setVariant(posthog.getFeatureFlag(flagName) as string | null);
    });

    return () => {
      unsubscribe?.();
    };
  }, [flagName]);

  return variant;
}
```

### Index (`src/index.ts`)
```typescript
export { PostHogProvider, usePostHog } from "./provider";
export { useFeatureFlag, useFeatureFlagVariant } from "./hooks/useFeatureFlag";
```

### README (`01-config-biome-migration-50-ref-quickstart.md`)
```markdown
# @agency/analytics-posthog

PostHog analytics for internal tools and client portals.

## Features
- Product analytics (events, funnels, retention)
- Session replay
- Feature flags
- User identification

## Usage

### In your app layout.tsx:
```typescript
import { PostHogProvider } from "@agency/analytics-posthog/provider";

export default function RootLayout({ children }) {
  return (
    <PostHogProvider
      apiKey={process.env.NEXT_PUBLIC_POSTHOG_KEY}
      userId={currentUser?.id}
      userProperties={{
        email: currentUser?.email,
        role: currentUser?.role,
      }}
    >
      {children}
    </PostHogProvider>
  );
}
```

### Track events:
```typescript
import { usePostHog } from "@agency/analytics-posthog/provider";

function CreateProjectButton() {
  const { track } = usePostHog();
  
  const handleClick = async () => {
    await createProject();
    track("project_created", { source: "dashboard" });
  };
  
  return <button onClick={handleClick}>Create Project</button>;
}
```

### Feature flags:
```typescript
import { useFeatureFlag } from "@agency/analytics-posthog/hooks";

function Dashboard() {
  const newDashboardEnabled = useFeatureFlag("new-dashboard-v2");
  
  return newDashboardEnabled ? <NewDashboard /> : <OldDashboard />;
}
```

## Environment Variables

```bash
# Client-side (public)
NEXT_PUBLIC_POSTHOG_KEY=phc_...
NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com

# Server-side (for server events)
POSTHOG_API_KEY=phx_...
```
```


## Documentation

### Overview (`docs/analytics/overview.md`)
```markdown
# Analytics Overview

The agency uses two complementary analytics tools:

## Plausible (Marketing Analytics)

**Use for:** Agency website, client landing pages, public marketing sites

**Key Features:**
- GDPR-compliant without cookie consent
- Simple, privacy-focused
- Page views, referrers, custom events
- No personal data collection

**Setup:**
1. Sign up at https://plausible.io
2. Add domain
3. Add script tag or use @agency/analytics-plausible package

## PostHog (Product Analytics)

**Use for:** CRM, client portals, internal tools

**Key Features:**
- Product analytics (events, funnels, cohorts)
- Session replay
- Feature flags for gradual rollouts
- User identification

**Setup:**
1. Sign up at https://posthog.com
2. Create project
3. Add @agency/analytics-posthog package

## Decision Matrix

| Scenario | Tool | Why |
|----------|------|-----|
| Track page views on agency website | Plausible | GDPR-compliant, no cookies |
| Track feature usage in CRM | PostHog | Product analytics depth |
| A/B test new dashboard design | PostHog | Built-in feature flags |
| Measure marketing campaign | Plausible | Simple, privacy-safe |
| Session replay for UX research | PostHog | Session recording feature |

## Privacy & Compliance

### Plausible
- ✅ GDPR compliant by default
- ✅ No cookies
- ✅ No personal data
- ✅ EU-hosted option available

### PostHog
- ⚠️ Requires cookie consent in EU
- ⚠️ Collects user data (with consent)
- ✅ Self-hosting option available
- ✅ Data retention controls

## Implementation Checklist

### Public Sites (Plausible)
- [ ] Domain added to Plausible
- [ ] Script included in layout
- [ ] Custom events for key actions
- [ ] Goals configured in dashboard

### Internal Tools (PostHog)
- [ ] Project created in PostHog
- [ ] API keys in environment
- [ ] Provider wrapped around app
- [ ] User identification configured
- [ ] Key events instrumented
- [ ] Feature flags set up
```

### Plausible Setup Guide (`docs/analytics/plausible-setup.md`)
```markdown
# Plausible Setup Guide

## 1. Account Setup

1. Go to https://plausible.io
2. Sign up for account
3. Add your domain (e.g., `youragency.com`)
4. Choose hosting region (EU for GDPR compliance)

## 2. Installation

### Option A: Script Tag (Simplest)

Add to your app's layout:
```html
<script
  defer
  data-domain="yourdomain.com"
  src="https://plausible.io/js/script.js"
></script>
```

### Option B: Package (Recommended)

Use `@agency/analytics-plausible`:
```typescript
import { PlausibleProvider } from "@agency/analytics-plausible/provider";

<PlausibleProvider domain="yourdomain.com">
  {children}
</PlausibleProvider>
```

## 3. Custom Events

Track important actions:
```typescript
import { usePlausible } from "@agency/analytics-plausible/provider";

const { trackEvent } = usePlausible();

trackEvent("contact-form-submit");
trackEvent("pricing-view", { plan: "pro" });
```

## 4. Goals

Set up goals in Plausible dashboard:
- Contact form submissions
- Newsletter signups
- Time on page > 2 minutes

## 5. Shared Link

Create shared link for clients:
1. Go to Site Settings → Visibility
2. Enable "Make stats publicly available"
3. Share link with client

## Pricing

- 10k pageviews/month: $9/month
- 100k pageviews/month: $19/month
- Unlimited sites on same plan
```

### PostHog Setup Guide (`docs/analytics/posthog-setup.md`)
```markdown
# PostHog Setup Guide

## 1. Account Setup

1. Go to https://posthog.com
2. Sign up (free tier: 1M events/month)
3. Create new project
4. Copy API keys

## 2. Environment Variables

```bash
# Client-side (public)
NEXT_PUBLIC_POSTHOG_KEY=phc_xxxxxxxxxxxxxxxxxxxx

# Server-side (private)
POSTHOG_API_KEY=phx_xxxxxxxxxxxxxxxxxxxx
```

## 3. Provider Setup

Wrap your app:
```typescript
import { PostHogProvider } from "@agency/analytics-posthog/provider";

function App({ children }) {
  const user = useCurrentUser(); // From your auth
  
  return (
    <PostHogProvider
      apiKey={process.env.NEXT_PUBLIC_POSTHOG_KEY}
      userId={user?.id}
      userProperties={{
        email: user?.email,
        plan: user?.plan,
      }}
    >
      {children}
    </PostHogProvider>
  );
}
```

## 4. Event Tracking

Track key actions:
```typescript
import { usePostHog } from "@agency/analytics-posthog/provider";

function CreateInvoiceButton() {
  const { track } = usePostHog();
  
  const handleCreate = async () => {
    const invoice = await createInvoice();
    track("invoice_created", {
      amount: invoice.amount,
      client_id: invoice.clientId,
    });
  };
  
  return <button onClick={handleCreate}>Create Invoice</button>;
}
```

## 5. Feature Flags

Create flag in PostHog dashboard:
```typescript
import { useFeatureFlag } from "@agency/analytics-posthog/hooks";

function Dashboard() {
  const newLayout = useFeatureFlag("dashboard-v2");
  return newLayout ? <NewLayout /> : <OldLayout />;
}
```

## 6. Session Replay

Enable in PostHog project settings:
- Sampling rate: 10% for production
- Mask sensitive inputs (credit cards, passwords)

## Key Events to Track

### CRM
- `project_created`
- `invoice_sent`
- `client_added`
- `task_completed`

### Client Portal
- `document_downloaded`
- `message_sent`
- `invoice_paid`

## Pricing

- Free: 1M events/month
- $0.00025 per event after
- Self-hosting available

## Privacy

Add to privacy policy:
"We use PostHog for product analytics. You can opt out of analytics tracking in your account settings."
```


## Implementation Examples

### Agency Website (Plausible)

```typescript
// apps/agency-website/src/app/layout.tsx
import { PlausibleProvider } from "@agency/analytics-plausible/provider";

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <PlausibleProvider domain="myagency.com">
          {children}
        </PlausibleProvider>
      </body>
    </html>
  );
}
```

### CRM (PostHog)

```typescript
// apps/internal-tools/crm/src/app/layout.tsx
import { PostHogProvider } from "@agency/analytics-posthog/provider";
import { auth } from "@agency/auth-internal";

export default async function RootLayout({ children }) {
  const { userId } = await auth();
  
  return (
    <PostHogProvider
      apiKey={process.env.NEXT_PUBLIC_POSTHOG_KEY}
      userId={userId}
    >
      {children}
    </PostHogProvider>
  );
}
```


## Root package.json Scripts

Add to root `package.json`:
```json
{
  "scripts": {
    "analytics:docs": "echo 'See docs/analytics/'"
  }
}
```


## Verification

```bash
# Plausible tracking
# Visit website, check Plausible dashboard for pageview

# PostHog tracking
# Trigger event in app, check PostHog events feed
```


## Related Tasks
- `32-ui-design-system`: analytics event components
- `e1-apps-crm`: likely first internal app to instrument with PostHog
- `d2-infra-environment-mgmt`: analytics keys and environment handling
