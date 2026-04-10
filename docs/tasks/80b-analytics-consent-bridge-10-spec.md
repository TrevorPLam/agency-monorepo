# 80b-analytics-consent-bridge: Implementation Specification

## Task Header

| Field | Value |
|-------|-------|
| **State** | `deferred` — Reserved for a proven shared cross-provider need |
| **Trigger** | 2+ analytics integrations require the same consent synchronization behavior |
| **Minimum Consumers** | 2+ apps or provider lanes sharing one consent-sync contract |
| **Dependencies** | `@agency/compliance-consent`, React 19.2.5 |
| **Exit Criteria** | Shared consent-sync helpers are extracted only after direct app/provider integrations are duplicated |
| **Implementation Authority** | `REPO-STATE.md` — Deferred until a shared cross-provider need is proven |
| **Version Authority** | `DEPENDENCY.md` §2 — React 19.2.5 |
| **Supersedes** | n/a |
| **Superseded by** | n/a |

**Cross-references:**
- Decision status: `DECISION-STATUS.md` — Consent bridge `open`
- Version pins: `DEPENDENCY.md` §2
- Note: Sub-task of 80-analytics; single-provider consent gating stays in the app or base analytics package until shared cross-provider duplication appears

## Files

```
packages/analytics/consent-bridge/
├── package.json
├── tsconfig.json
├── 01-config-biome-migration-50-ref-quickstart.md
├── src/
│   ├── index.ts
│   ├── types.ts
│   ├── store.ts
│   ├── providers/
│   │   ├── index.ts
│   │   ├── posthog.ts
│   │   └── plausible.ts
│   └── hooks/
│       ├── useConsent.ts
│       └── useAnalyticsReady.ts
└── tests/
    └── consent-flow.test.ts
```

### `package.json`

```json
{
  "name": "@agency/analytics-consent-bridge",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "exports": {
    ".": "./src/index.ts",
    "./types": "./src/types.ts",
    "./hooks": "./src/hooks/index.ts",
    "./providers": "./src/providers/index.ts"
  },
  "dependencies": {
    "@agency/core-types": "workspace:*",
    "zustand": "5.0.12"
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
export type ConsentCategory = 'necessary' | 'analytics' | 'marketing' | 'personalization';

export interface ConsentState {
  necessary: boolean;  // Always true, required for site function
  analytics: boolean;  // Anonymous usage tracking
  marketing: boolean;  // Ad tracking, remarketing
  personalization: boolean;  // User-specific content
  timestamp: string;
  source: 'banner' | 'settings' | 'default';
}

export interface ConsentPreferences {
  analytics?: boolean;
  marketing?: boolean;
  personalization?: boolean;
}

export type ConsentChangeCallback = (state: ConsentState) => void;

export interface AnalyticsProvider {
  name: string;
  updateConsent: (state: ConsentState) => void;
  isReady: () => boolean;
}
```

### `src/store.ts`

```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ConsentState, ConsentPreferences, ConsentChangeCallback } from './types';

interface ConsentStore {
  state: ConsentState;
  providers: AnalyticsProvider[];
  setConsent: (prefs: ConsentPreferences, source: ConsentState['source']) => void;
  acceptAll: () => void;
  rejectAll: () => void;
  registerProvider: (provider: AnalyticsProvider) => () => void;
  getConsentFor: (category: keyof ConsentPreferences) => boolean;
}

const defaultConsent: ConsentState = {
  necessary: true,
  analytics: false,
  marketing: false,
  personalization: false,
  timestamp: new Date().toISOString(),
  source: 'default'
};

export const useConsentStore = create<ConsentStore>()(
  persist(
    (set, get) => ({
      state: defaultConsent,
      providers: [],

      setConsent: (prefs, source) => {
        const newState: ConsentState = {
          ...defaultConsent,
          ...prefs,
          timestamp: new Date().toISOString(),
          source
        };
        
        set({ state: newState });
        
        // Propagate to all registered providers
        get().providers.forEach(provider => {
          provider.updateConsent(newState);
        });
      },

      acceptAll: () => {
        get().setConsent(
          { analytics: true, marketing: true, personalization: true },
          'banner'
        );
      },

      rejectAll: () => {
        get().setConsent(
          { analytics: false, marketing: false, personalization: false },
          'banner'
        );
      },

      registerProvider: (provider) => {
        set(state => ({ providers: [...state.providers, provider] }));
        
        // Initial sync with current consent state
        provider.updateConsent(get().state);
        
        return () => {
          set(state => ({
            providers: state.providers.filter(p => p.name !== provider.name)
          }));
        };
      },

      getConsentFor: (category) => get().state[category] ?? false
    }),
    {
      name: 'agency-consent-store',
      partialize: (state) => ({ state: state.state })
    }
  )
);
```

### `src/providers/posthog.ts`

```typescript
import type { ConsentState, AnalyticsProvider } from '../types';

declare global {
  interface Window {
    posthog?: {
      opt_out_capturing: () => void;
      opt_in_capturing: () => void;
      has_opted_out_capturing: () => boolean;
    };
  }
}

export function createPostHogConsentProvider(): AnalyticsProvider {
  return {
    name: 'posthog',
    
    isReady: () => typeof window !== 'undefined' && typeof window.posthog !== 'undefined',
    
    updateConsent: (state: ConsentState) => {
      if (typeof window === 'undefined' || !window.posthog) return;

      if (state.analytics) {
        window.posthog.opt_in_capturing();
      } else {
        window.posthog.opt_out_capturing();
      }
    }
  };
}
```

### `src/providers/plausible.ts`

```typescript
import type { ConsentState, AnalyticsProvider } from '../types';

declare global {
  interface Window {
    plausible?: (...args: unknown[]) => void;
  }
}

export function createPlausibleConsentProvider(): AnalyticsProvider {
  return {
    name: 'plausible',
    
    isReady: () => typeof window !== 'undefined' && typeof window.plausible === 'function',
    
    updateConsent: (state: ConsentState) => {
      // Plausible is privacy-first by default
      // Only need to disable if explicitly rejected
      if (typeof window === 'undefined') return;
      
      // Plausible respects DNT, but we can add data-exclude attribute
      const script = document.querySelector('script[data-domain]');
      if (script) {
        if (state.analytics) {
          script.removeAttribute('data-exclude');
        } else {
          script.setAttribute('data-exclude', '');
        }
      }
    }
  };
}
```

### `src/hooks/useConsent.ts`

```typescript
'use client';

import { useConsentStore } from '../store';
import type { ConsentPreferences } from '../types';

export function useConsent() {
  const { state, setConsent, acceptAll, rejectAll } = useConsentStore();

  return {
    consent: state,
    hasConsent: (category: keyof ConsentPreferences) => state[category],
    setConsent: (prefs: ConsentPreferences) => setConsent(prefs, 'settings'),
    acceptAll,
    rejectAll,
    timestamp: state.timestamp,
    source: state.source
  };
}
```

### `src/index.ts`

```typescript
export { useConsentStore } from './store';
export { useConsent } from './hooks/useConsent';
export type { ConsentState, ConsentPreferences, AnalyticsProvider } from './types';

export { createPostHogConsentProvider } from './providers/posthog';
export { createPlausibleConsentProvider } from './providers/plausible';
```

### README

```markdown
# @agency/analytics-consent-bridge

Unified consent management for multi-provider analytics.

## Problem Solved

When sites use both Plausible and PostHog, consent must be synchronized:
- User rejects analytics → Both providers stop tracking
- User grants analytics consent → Both adopted providers can resume tracking
- Consent changes must propagate everywhere instantly

## Usage

```typescript
import { 
  useConsentStore, 
  createPlausibleConsentProvider,
  createPostHogConsentProvider,
} from '@agency/analytics-consent-bridge';

// Register providers on app init
const unregisterPlausible = useConsentStore.getState()
  .registerProvider(createPlausibleConsentProvider());

const unregisterPostHog = useConsentStore.getState()
  .registerProvider(createPostHogConsentProvider());
```

## Consent Categories

| Category | Includes | Typical Use |
|----------|----------|-------------|
| Necessary | Site function, security | Always granted |
| Analytics | Anonymous usage | Plausible, PostHog pageviews |
| Marketing | Non-analytics marketing tooling | Managed outside this package |
| Personalization | User-specific content | Recommendation engines |
```


## Related Tasks

- `41-compliance` - Core consent management UI
- `80-analytics` - Selected analytics lane helpers
- `80a-analytics-attribution` - Cross-provider attribution
