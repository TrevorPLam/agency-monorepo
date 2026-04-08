# Compliance Specification

## Rationale (Package vs App)

This is a **shared package** (not an app) because:
- Every marketing and client-facing app needs consent management
- Consent patterns must be consistent across the entire user journey
- Centralized privacy logic ensures compliance across multi-app experiences
- Shared consent state prevents redundant prompts and conflicting preferences
- Single source of truth for privacy configuration and cookie categorization


## Files

```
packages/compliance/consent/
├── package.json
├── tsconfig.json
├── README.md
├── CHANGELOG.md
└── src/
    ├── index.ts
    ├── components/
    │   ├── index.ts
    │   ├── consent-banner.tsx
    │   ├── consent-preferences.tsx
    │   ├── cookie-table.tsx
    │   └── privacy-center-link.tsx
    ├── hooks/
    │   ├── index.ts
    │   ├── use-consent.ts
    │   ├── use-consent-category.ts
    │   ├── use-geolocation.ts
    │   └── use-privacy-settings.ts
    ├── store/
    │   ├── index.ts
    │   ├── consent-store.ts
    │   ├── storage.ts
    │   └── types.ts
    ├── utils/
    │   ├── index.ts
    │   ├── region-detection.ts
    │   ├── cookie-categories.ts
    │   └── consent-validator.ts
    ├── config/
    │   ├── index.ts
    │   ├── default-categories.ts
    │   └── privacy-settings.ts
    └── types/
        └── index.ts
```

### `package.json`

```json
{
  "name": "@agency/compliance-consent",
  "version": "0.1.0",
  "private": true,
  "description": "GDPR/CCPA consent management components and utilities",
  "type": "module",
  "exports": {
    ".": "./src/index.ts",
    "./components": "./src/components/index.ts",
    "./hooks": "./src/hooks/index.ts",
    "./store": "./src/store/index.ts",
    "./utils": "./src/utils/index.ts",
    "./config": "./src/config/index.ts",
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
    "@agency/ui-design-system": "workspace:*",
    "zustand": "^4.5.0"
  },
  "devDependencies": {
    "@agency/config-eslint": "workspace:*",
    "@agency/config-typescript": "workspace:*",
    "@agency/test-setup": "workspace:*",
    "@types/node": "latest",
    "@types/react": "latest",
    "react": "19.2.4",
    "react-dom": "19.2.4",
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

### `src/types/index.ts`

```typescript
export type ConsentCategory = 
  | "necessary" 
  | "analytics" 
  | "marketing" 
  | "functional" 
  | "personalization";

export type ConsentStatus = "granted" | "denied" | "pending";

export interface ConsentState {
  necessary: true; // Always granted
  analytics: ConsentStatus;
  marketing: ConsentStatus;
  functional: ConsentStatus;
  personalization: ConsentStatus;
  timestamp: string;
  version: string;
}

export type Region = "EU" | "UK" | "US-CA" | "US" | "OTHER";

export interface PrivacySettings {
  companyName: string;
  privacyPolicyUrl: string;
  cookiePolicyUrl: string;
  contactEmail: string;
  regionsRequiringConsent: Region[];
  cookieCategories: CookieCategoryConfig[];
}

export interface CookieCategoryConfig {
  id: ConsentCategory;
  name: string;
  description: string;
  required: boolean;
  cookies: CookieInfo[];
}

export interface CookieInfo {
  name: string;
  provider: string;
  purpose: string;
  expiry: string;
  type: string;
}
```

### `src/store/consent-store.ts`

```typescript
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ConsentState, ConsentCategory } from "../types";

interface ConsentStore extends ConsentState {
  setConsent: (category: ConsentCategory, granted: boolean) => void;
  setAllConsent: (granted: Record<ConsentCategory, boolean>) => void;
  resetConsent: () => void;
  hasConsent: (category: ConsentCategory) => boolean;
  isConsentGiven: boolean;
}

const STORAGE_KEY = "agency-consent-preferences";
const CONSENT_VERSION = "1.0.0";

const defaultState: ConsentState = {
  necessary: true,
  analytics: "pending",
  marketing: "pending",
  functional: "pending",
  personalization: "pending",
  timestamp: "",
  version: CONSENT_VERSION,
};

export const useConsentStore = create<ConsentStore>()(
  persist(
    (set, get) => ({
      ...defaultState,
      
      setConsent: (category, granted) => {
        if (category === "necessary") return; // Cannot be changed
        set({
          [category]: granted ? "granted" : "denied",
          timestamp: new Date().toISOString(),
        });
      },
      
      setAllConsent: (granted) => {
        set({
          analytics: granted.analytics ? "granted" : "denied",
          marketing: granted.marketing ? "granted" : "denied",
          functional: granted.functional ? "granted" : "denied",
          personalization: granted.personalization ? "granted" : "denied",
          timestamp: new Date().toISOString(),
        });
      },
      
      resetConsent: () => {
        set(defaultState);
      },
      
      hasConsent: (category) => {
        const state = get();
        return category === "necessary" || state[category] === "granted";
      },
      
      isConsentGiven: () => {
        const state = get();
        return state.timestamp !== "";
      },
    }),
    {
      name: STORAGE_KEY,
    }
  )
);
```

### `src/hooks/use-consent.ts`

```typescript
"use client";

import { useConsentStore } from "../store/consent-store";
import type { ConsentCategory } from "../types";

export function useConsent() {
  const store = useConsentStore();
  
  return {
    // State
    consent: {
      necessary: store.necessary,
      analytics: store.analytics,
      marketing: store.marketing,
      functional: store.functional,
      personalization: store.personalization,
    },
    isConsentGiven: store.isConsentGiven(),
    timestamp: store.timestamp,
    version: store.version,
    
    // Actions
    setConsent: store.setConsent,
    setAllConsent: store.setAllConsent,
    resetConsent: store.resetConsent,
    hasConsent: store.hasConsent,
  };
}

export function useConsentCategory(category: ConsentCategory) {
  const { hasConsent } = useConsent();
  return hasConsent(category);
}
```

### `src/components/consent-banner.tsx`

```typescript
"use client";

import { useState, useEffect } from "react";
import { Button } from "@agency/ui-design-system/button";
import { useConsent } from "../hooks/use-consent";
import { useGeolocation } from "../hooks/use-geolocation";
import { shouldShowConsentBanner } from "../utils/region-detection";

export function ConsentBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const { setAllConsent, isConsentGiven } = useConsent();
  const { region, isLoading } = useGeolocation();

  useEffect(() => {
    if (!isLoading && !isConsentGiven) {
      setIsVisible(shouldShowConsentBanner(region));
    }
  }, [region, isLoading, isConsentGiven]);

  const handleAcceptAll = () => {
    setAllConsent({
      necessary: true,
      analytics: true,
      marketing: true,
      functional: true,
      personalization: true,
    });
    setIsVisible(false);
  };

  const handleAcceptNecessary = () => {
    setAllConsent({
      necessary: true,
      analytics: false,
      marketing: false,
      functional: false,
      personalization: false,
    });
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div 
      role="dialog"
      aria-modal="true"
      aria-labelledby="consent-title"
      className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background p-4 shadow-lg"
    >
      <div className="mx-auto max-w-7xl">
        <h2 id="consent-title" className="text-lg font-semibold">
          Privacy Preferences
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          We use cookies to enhance your browsing experience, serve personalized ads or content, 
          and analyze our traffic. By clicking "Accept All", you consent to our use of cookies.
        </p>
        <div className="mt-4 flex gap-2">
          <Button onClick={handleAcceptAll}>Accept All</Button>
          <Button variant="outline" onClick={handleAcceptNecessary}>
            Necessary Only
          </Button>
          <Button variant="ghost" asChild>
            <a href="/privacy">Learn More</a>
          </Button>
        </div>
      </div>
    </div>
  );
}
```

### `src/utils/region-detection.ts`

```typescript
import type { Region } from "../types";

const REGIONS_REQUIRING_CONSENT: Region[] = ["EU", "UK", "US-CA"];

export async function detectRegion(): Promise<Region> {
  try {
    // Use IP geolocation service or Next.js middleware detection
    const response = await fetch("/api/region");
    const { region } = await response.json();
    return region as Region;
  } catch {
    return "OTHER";
  }
}

export function shouldShowConsentBanner(region: Region | null): boolean {
  if (!region) return false;
  return REGIONS_REQUIRING_CONSENT.includes(region);
}

// Client-side fallback using timezone
export function detectRegionFromTimezone(): Region {
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  
  if (timezone.startsWith("Europe/")) {
    if (timezone === "Europe/London") return "UK";
    return "EU";
  }
  
  if (timezone.startsWith("America/")) {
    // Rough approximation - production should use proper geolocation
    const caTimezones = ["America/Los_Angeles", "America/San_Francisco"];
    if (caTimezones.includes(timezone)) return "US-CA";
    return "US";
  }
  
  return "OTHER";
}
```

### `src/index.ts`

```typescript
// Components
export { ConsentBanner } from "./components/consent-banner";
export { ConsentPreferences } from "./components/consent-preferences";
export { CookieTable } from "./components/cookie-table";
export { PrivacyCenterLink } from "./components/privacy-center-link";

// Hooks
export { useConsent, useConsentCategory } from "./hooks/use-consent";
export { useGeolocation } from "./hooks/use-geolocation";
export { usePrivacySettings } from "./hooks/use-privacy-settings";

// Store
export { useConsentStore } from "./store/consent-store";

// Utils
export { detectRegion, shouldShowConsentBanner, detectRegionFromTimezone } from "./utils/region-detection";
export { getCookieCategories } from "./utils/cookie-categories";

// Config
export { defaultCategories } from "./config/default-categories";
export { defaultPrivacySettings } from "./config/privacy-settings";

// Types
export type {
  ConsentCategory,
  ConsentStatus,
  ConsentState,
  Region,
  PrivacySettings,
  CookieCategoryConfig,
  CookieInfo,
} from "./types";
```


## Usage Example

```typescript
// In an app's layout.tsx
import { ConsentBanner } from "@agency/compliance-consent/components";

export default function Layout({ children }) {
  return (
    <>
      {children}
      <ConsentBanner />
    </>
  );
}

// In analytics tracking code
import { useConsent } from "@agency/compliance-consent/hooks";

function trackEvent(eventName: string, data: object) {
  const { hasConsent } = useConsent();
  
  if (!hasConsent("analytics")) {
    console.log("Analytics tracking blocked by consent");
    return;
  }
  
  // Send to analytics platform
  analytics.track(eventName, data);
}
```


## Required API Route

Apps using this package need a region detection endpoint:

```typescript
// app/api/region/route.ts
import { NextResponse } from "next/server";
import { detectRegionFromHeaders } from "@agency/compliance-consent/utils";

export async function GET(request: Request) {
  const region = detectRegionFromHeaders(request.headers);
  return NextResponse.json({ region });
}
```


## Verification Steps

```bash
# Test store functionality
pnpm --filter @agency/compliance-consent test

# Verify type exports
pnpm --filter @agency/compliance-consent typecheck

# Check integration in app
pnpm --filter @agency/agency-website build
```
