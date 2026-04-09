# 41-compliance: Implementation Specification

## Task Header

| Field | Value |
|-------|-------|
| **State** | `conditional` — Package-controlled, opt-in only |
| **Trigger** | 2+ apps require GDPR/privacy compliance and consent management |
| **Minimum Consumers** | 2+ apps needing compliance |
| **Dependencies** | React 19.2.5, TypeScript 6.0, `@agency/core-types` |
| **Exit Criteria** | Compliance utilities exported and used by at least 2 apps |
| **Implementation Authority** | `REPO-STATE.md` — Conditional; requires explicit app opt-in |
| **Version Authority** | `DEPENDENCY.md` §1, §2 — TypeScript 6.0, React 19.2.5 |
| **Supersedes** | n/a |
| **Superseded by** | n/a |

**Cross-references:**
- Decision status: `DECISION-STATUS.md` — Compliance utilities `open`
- Version pins: `DEPENDENCY.md` §1, §2
- Architecture: `ARCHITECTURE.md` — Compliance layer
- Note: Conditional; only client-facing apps typically need compliance

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

// 2026 CCPA/CPRA Additions - Effective January 1, 2026

export type SensitivePersonalInfo =
  | "ssn"
  | "driver_license"
  | "passport"
  | "biometric"
  | "health"
  | "financial"
  | "geolocation"
  | "racial"
  | "religious"
  | "neural"; // NEW 2026: Neural data (EEG, BCI readings)

export interface GlobalPrivacyControl {
  signalDetected: boolean;
  honored: boolean;
  timestamp: string;
  confirmationShown: boolean; // 2026: Must show visible confirmation
}

export interface AutomatedDecisionMaking {
  enabled: boolean;
  categories: ADMTCategory[];
  optOutAvailable: boolean;
  optOutMethod: string;
  explanationUrl?: string;
}

export type ADMTCategory =
  | "financial_services"
  | "housing"
  | "education"
  | "employment"
  | "healthcare"
  | "insurance";

export interface UserDataRights {
  access: boolean;
  deletion: boolean;
  portability: boolean;
  correction: boolean;
  optOutSale: boolean;
  optOutSharing: boolean;
  optOutADMT: boolean; // NEW 2026: Right to opt out of automated decisions
  limitUse: boolean;
}

export interface Compliance2026 {
  gpc: GlobalPrivacyControl;
  admt: AutomatedDecisionMaking;
  dataRights: UserDataRights;
  sensitiveInfoCollected: SensitivePersonalInfo[];
  dataBrokerRegistered: boolean; // Required for data brokers Aug 2026
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

### `src/utils/gpc-detection.ts`

```typescript
// Global Privacy Control (GPC) detection - REQUIRED for CCPA 2026 compliance
// Effective January 1, 2026: Must detect, honor, and confirm GPC signals

import type { GlobalPrivacyControl } from "../types";

export interface GPCDetectionResult {
  signalPresent: boolean;
  signalAvailable: boolean; // Is GPC API available in browser
}

/**
 * Detect GPC signal from browser
 * Checks both navigator.globalPrivacyControl and Sec-GPC header
 */
export function detectGPCSignal(): GPCDetectionResult {
  // Check if GPC is supported by browser
  const gpcAvailable = typeof navigator !== 'undefined' && 
    'globalPrivacyControl' in navigator;
  
  // Check the actual signal value
  const gpcSignal = gpcAvailable 
    ? (navigator as Navigator & { globalPrivacyControl?: boolean }).globalPrivacyControl 
    : undefined;
  
  return {
    signalPresent: gpcSignal === true,
    signalAvailable: gpcAvailable,
  };
}

/**
 * Determine if analytics/marketing should be blocked based on GPC
 * 2026 Requirement: Must honor GPC as opt-out of sale/sharing
 */
export function shouldBlockTrackingDueToGPC(): boolean {
  const { signalPresent } = detectGPCSignal();
  return signalPresent;
}

/**
 * Create GPC compliance record for 2026 CCPA requirements
 * Must show visible confirmation (not silent processing)
 */
export function createGPCRecord(
  confirmationShown: boolean
): GlobalPrivacyControl {
  const { signalPresent } = detectGPCSignal();
  
  return {
    signalDetected: signalPresent,
    honored: signalPresent, // Must honor if detected
    timestamp: new Date().toISOString(),
    confirmationShown, // 2026: Required visible confirmation
  };
}

/**
 * Server-side GPC detection from request headers
 * Next.js middleware or API route usage
 */
export function detectGPCFromHeaders(headers: Headers): boolean {
  // Check Sec-GPC header (1 = opt-out)
  const gpcHeader = headers.get('sec-gpc');
  return gpcHeader === '1';
}

/**
 * Combined DNT (Do Not Track) and GPC check
 * DNT: legacy, GPC: modern standard (2026)
 */
export function shouldRespectTrackingOptOut(request: Request): boolean {
  const dnt = request.headers.get('dnt') === '1';
  const gpc = detectGPCFromHeaders(request.headers);
  
  return dnt || gpc;
}
```

### `src/components/gpc-indicator.tsx`

```typescript
"use client";

import { useEffect, useState } from "react";
import { detectGPCSignal, createGPCRecord } from "../utils/gpc-detection";
import { useConsentStore } from "../store/consent-store";

/**
 * GPC Status Indicator - REQUIRED for 2026 CCPA compliance
 * Must show visible confirmation that GPC signal is honored
 */
export function GPCIndicator() {
  const [gpcStatus, setGpcStatus] = useState<{
    detected: boolean;
    available: boolean;
  } | null>(null);
  
  const setConsent = useConsentStore((state) => state.setAllConsent);

  useEffect(() => {
    const gpc = detectGPCSignal();
    setGpcStatus({
      detected: gpc.signalPresent,
      available: gpc.signalAvailable,
    });

    // If GPC detected, automatically opt out of sale/sharing
    if (gpc.signalPresent) {
      // Update consent to reflect GPC opt-out
      setConsent({
        necessary: true,
        analytics: false,
        marketing: false,
        functional: false,
        personalization: false,
      });
      
      // Record GPC compliance
      const record = createGPCRecord(true);
      
      // Send to analytics/consent bridge
      console.log("GPC signal honored:", record);
    }
  }, [setConsent]);

  // Only show if GPC is available in browser
  if (!gpcStatus?.available) return null;

  return (
    <div 
      role="status" 
      aria-live="polite"
      className="text-sm text-muted-foreground"
    >
      {gpcStatus.detected ? (
        <span className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-500" aria-hidden="true" />
          Global Privacy Control active - tracking disabled
        </span>
      ) : (
        <span className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-gray-400" aria-hidden="true" />
          GPC not detected
        </span>
      )}
    </div>
  );
}
```

### 2026 CCPA/CPRA Compliance Notes

**Effective January 1, 2026:**

1. **Global Privacy Control (GPC)**
   - Must detect `navigator.globalPrivacyControl` or `Sec-GPC` header
   - Signal MUST be honored as opt-out of sale/sharing
   - Must show visible confirmation (not silent processing)
   - Joint enforcement by CA, CO, CT attorneys general since Sept 2025

2. **Neural Data as Sensitive PI**
   - Added to sensitive personal information categories
   - Includes EEG readings, brain-computer interface data
   - Requires explicit opt-in consent

3. **Automated Decision-Making (ADMT)**
   - Consumers can request info about ADMT methodology
   - Can appeal automated decisions
   - Can opt out of ADMT processing entirely (with limited exceptions)
   - Applies to financial services, housing, education, employment, healthcare

4. **Opt-Out Confirmation**
   - Shifted from optional to mandatory Jan 2026
   - Businesses must provide visible confirmation that opt-out processed

5. **Historical Data Access**
   - Extended data access windows to Jan 2022 or earlier if maintained
   - Must be documented in privacy policy

6. **Data Broker Registration**
   - DROP (Delete Request and Opt-out Platform) available Jan 2026
   - Data brokers must access system every 45 days starting Aug 2026

**Phased Deadlines:**
- Jan 1, 2027: ADMT requirements for existing systems
- Apr 1, 2028: Cybersecurity audits ($100M+ revenue)
- Apr 1, 2029: Cybersecurity audits ($50M-$100M revenue)
- Apr 1, 2030: Cybersecurity audits (<$50M revenue)


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
