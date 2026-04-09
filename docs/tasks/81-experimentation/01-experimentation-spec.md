# 81-experimentation: Implementation Specification

## Task Header

| Field | Value |
|-------|-------|
| **State** | `conditional` — Package-controlled, opt-in only |
| **Trigger** | App requires A/B testing or feature flags |
| **Minimum Consumers** | 1+ apps explicitly requesting experimentation |
| **Dependencies** | PostHog SDK, React 19.2.5, `@agency/core-types` |
| **Exit Criteria** | Experimentation utilities exported and used in at least one app |
| **Implementation Authority** | `REPO-STATE.md` — Conditional; requires explicit app-level opt-in |
| **Version Authority** | `DEPENDENCY.md` §2 — React 19.2.5 |
| **Superseded by** | n/a |

**Cross-references:**
- Decision status: `DECISION-STATUS.md` — Experimentation `open` (PostHog `leaning`)
- Version pins: `DEPENDENCY.md` §2
- Architecture: `ARCHITECTURE.md` — Experimentation layer
- Note: Conditional; most apps don't need experimentation infrastructure

## Status

Ready for implementation (April 2026)

This package provides A/B testing and feature flag infrastructure using PostHog as the primary backend. It supports both client-side and server-side feature flag evaluation.

## Files

```
packages/experimentation/
├── package.json
├── tsconfig.json
├── README.md
├── CHANGELOG.md
└── src/
    ├── index.ts
    ├── client/
    │   ├── index.ts
    │   ├── posthog-client.ts
    │   └── bootstrap.ts
    ├── server/
    │   ├── index.ts
    │   └── posthog-server.ts
    ├── hooks/
    │   ├── index.ts
    │   ├── useFeatureFlag.ts
    │   ├── useExperiment.ts
    │   └── useFeatureFlags.ts
    ├── components/
    │   ├── FeatureFlag.tsx
    │   └── Experiment.tsx
    ├── types/
    │   └── index.ts
    └── utils/
        ├── variant-assignment.ts
        └── tracking.ts
```

### `package.json`

```json
{
  "name": "@agency/experimentation",
  "version": "0.1.0",
  "private": true,
  "description": "A/B testing and feature flag management with PostHog",
  "type": "module",
  "exports": {
    ".": "./src/index.ts",
    "./client": "./src/client/index.ts",
    "./server": "./src/server/index.ts",
    "./hooks": "./src/hooks/index.ts",
    "./components": "./src/components/index.ts",
    "./types": "./src/types/index.ts"
  },
  "scripts": {
    "lint": "eslint src/",
    "typecheck": "tsc --noEmit",
    "test": "vitest run"
  },
  "dependencies": {
    "@agency/core-types": "workspace:*",
    "@agency/analytics": "workspace:*",
    "posthog-js": "1.366.0",
    "posthog-node": "5.29.2"
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
// Feature flag types

export interface FeatureFlagConfig {
  key: string;
  defaultValue: boolean | string | number;
}

export interface ExperimentConfig {
  key: string;
  variants: string[];
  defaultVariant?: string;
}

export interface FeatureFlagResult<T = boolean> {
  enabled: T extends boolean ? boolean : T;
  loading: boolean;
  error?: Error;
}

export interface ExperimentResult {
  variant: string;
  trackConversion: (event: string, value?: number) => void;
  loading: boolean;
  error?: Error;
}

// PostHog-specific types
export interface PostHogFeatureFlag {
  id: number;
  key: string;
  active: boolean;
  filters?: {
    groups?: Array<{
      properties?: Array<{
        key: string;
        value: unknown;
        operator?: string;
      }>;
      rollout_percentage?: number;
    }>;
  };
}

// Evaluation modes
export type EvaluationMode = 'remote' | 'local' | 'bootstrap';

export interface EvaluationConfig {
  mode: EvaluationMode;
  // Local evaluation cache TTL (ms)
  cacheTtl?: number;
  // Bootstrap flags (for SSR)
  bootstrapFlags?: Record<string, boolean | string>;
}
```

### `src/client/posthog-client.ts`

```typescript
// Client-side PostHog initialization and feature flag evaluation

import posthog from 'posthog-js';

let clientInitialized = false;

export function initPostHog(
  apiKey: string,
  options: {
    apiHost?: string;
    bootstrapFlags?: Record<string, boolean | string>;
    enableSessionRecording?: boolean;
  } = {}
) {
  if (clientInitialized || typeof window === 'undefined') {
    return posthog;
  }

  posthog.init(apiKey, {
    api_host: options.apiHost || 'https://app.posthog.com',
    loaded: (ph) => {
      // Apply bootstrap flags if provided (prevents flicker)
      if (options.bootstrapFlags) {
        ph.featureFlags.override(options.bootstrapFlags);
      }
    },
    // Enable debug mode in development
    debug: process.env.NODE_ENV === 'development',
    // Capture session recordings (configurable)
    capture_pageview: false, // We handle this manually
    disable_session_recording: !options.enableSessionRecording,
  });

  clientInitialized = true;
  return posthog;
}

export function getPostHogClient() {
  return posthog;
}

// Check if client is ready
export function isPostHogReady(): boolean {
  return clientInitialized && posthog.__loaded;
}
```

### `src/server/posthog-server.ts`

```typescript
// Server-side PostHog feature flag evaluation
// Supports local evaluation (fast) and remote evaluation (accurate)

import { PostHog } from 'posthog-node';

let serverClient: PostHog | null = null;

export function initServerPostHog(
  apiKey: string,
  options: {
    apiHost?: string;
    // Enable local evaluation (caches flag definitions)
    enableLocalEvaluation?: boolean;
  } = {}
) {
  if (!serverClient) {
    serverClient = new PostHog(apiKey, {
      host: options.apiHost || 'https://app.posthog.com',
      // Enable local evaluation for performance
      featureFlagsPollingInterval: options.enableLocalEvaluation ? 30000 : undefined,
    });
  }
  return serverClient;
}

export async function evaluateFlagServer(
  flagKey: string,
  distinctId: string,
  options: {
    personProperties?: Record<string, unknown>;
    groups?: Record<string, unknown>;
  } = {}
): Promise<boolean | string> {
  const client = serverClient || initServerPostHog(process.env.POSTHOG_SERVER_KEY!);

  try {
    // Local evaluation (fast, no API call)
    const result = await client.getFeatureFlag(
      flagKey,
      distinctId,
      options.personProperties,
      undefined,
      options.groups
    );

    return result ?? false;
  } catch (error) {
    console.error(`[Experimentation] Failed to evaluate flag ${flagKey}:`, error);
    return false;
  }
}

export async function evaluateFlagsServer(
  flagKeys: string[],
  distinctId: string,
  options: {
    personProperties?: Record<string, unknown>;
  } = {}
): Promise<Record<string, boolean | string>> {
  const client = serverClient || initServerPostHog(process.env.POSTHOG_SERVER_KEY!);

  try {
    const results = await client.getAllFeatureFlags(
      distinctId,
      options.personProperties
    );

    // Filter to requested keys only
    return flagKeys.reduce((acc, key) => {
      acc[key] = results[key] ?? false;
      return acc;
    }, {} as Record<string, boolean | string>);
  } catch (error) {
    console.error('[Experimentation] Failed to evaluate flags:', error);
    return flagKeys.reduce((acc, key) => {
      acc[key] = false;
      return acc;
    }, {} as Record<string, boolean | string>);
  }
}

// Get experiment variant server-side
export async function getExperimentVariantServer(
  experimentKey: string,
  distinctId: string
): Promise<string> {
  const client = serverClient || initServerPostHog(process.env.POSTHOG_SERVER_KEY!);

  try {
    const variant = await client.getFeatureFlag(experimentKey, distinctId);
    return (variant as string) || 'control';
  } catch (error) {
    console.error(`[Experimentation] Failed to get variant for ${experimentKey}:`, error);
    return 'control';
  }
}
```

### `src/hooks/useFeatureFlag.ts`

```typescript
'use client';

import { useState, useEffect, useCallback } from 'react';
import { getPostHogClient, isPostHogReady } from '../client/posthog-client';
import type { FeatureFlagConfig, FeatureFlagResult } from '../types';

export function useFeatureFlag<T extends boolean | string>(
  config: FeatureFlagConfig & { type?: 'boolean' | 'string' }
): FeatureFlagResult<T> {
  const [result, setResult] = useState<FeatureFlagResult<T>>({
    enabled: config.defaultValue as T,
    loading: true,
  });

  const evaluateFlag = useCallback(() => {
    const client = getPostHogClient();

    if (!isPostHogReady()) {
      return;
    }

    try {
      const value = client.isFeatureEnabled(config.key);

      if (config.type === 'string') {
        const stringValue = client.getFeatureFlag(config.key);
        setResult({
          enabled: (stringValue || config.defaultValue) as T,
          loading: false,
        });
      } else {
        setResult({
          enabled: (value ?? config.defaultValue) as T,
          loading: false,
        });
      }
    } catch (error) {
      setResult({
        enabled: config.defaultValue as T,
        loading: false,
        error: error instanceof Error ? error : new Error(String(error)),
      });
    }
  }, [config.key, config.defaultValue, config.type]);

  useEffect(() => {
    evaluateFlag();

    // Re-evaluate when flags change
    const client = getPostHogClient();
    if (client.onFeatureFlags) {
      client.onFeatureFlags(evaluateFlag);
    }
  }, [evaluateFlag]);

  return result;
}

// Simpler boolean flag hook
export function useBooleanFlag(key: string, defaultValue = false): boolean {
  const { enabled, loading } = useFeatureFlag({ key, defaultValue });
  return loading ? defaultValue : (enabled as boolean);
}
```

### `src/hooks/useExperiment.ts`

```typescript
'use client';

import { useState, useEffect, useCallback } from 'react';
import { getPostHogClient, isPostHogReady } from '../client/posthog-client';
import type { ExperimentConfig, ExperimentResult } from '../types';

export function useExperiment(config: ExperimentConfig): ExperimentResult {
  const [result, setResult] = useState<ExperimentResult>({
    variant: config.defaultVariant || 'control',
    trackConversion: () => {},
    loading: true,
  });

  useEffect(() => {
    const client = getPostHogClient();

    if (!isPostHogReady()) {
      return;
    }

    try {
      // Get assigned variant
      const variant = (client.getFeatureFlag(config.key) as string) || config.defaultVariant || 'control';

      // Track experiment exposure
      client.capture('$experiment_viewed', {
        experiment_id: config.key,
        experiment_variant: variant,
      });

      // Conversion tracking function
      const trackConversion = (event: string, value?: number) => {
        client.capture(event, {
          experiment_id: config.key,
          experiment_variant: variant,
          conversion_value: value,
        });
      };

      setResult({
        variant,
        trackConversion,
        loading: false,
      });
    } catch (error) {
      setResult({
        variant: config.defaultVariant || 'control',
        trackConversion: () => {},
        loading: false,
        error: error instanceof Error ? error : new Error(String(error)),
      });
    }
  }, [config.key, config.defaultVariant]);

  return result;
}

// Hook for multi-variant experiments with weights
export function useMultiVariantExperiment(
  experimentKey: string,
  variants: string[],
  options: {
    defaultVariant?: string;
    onVariantAssigned?: (variant: string) => void;
  } = {}
): { variant: string; loading: boolean } {
  const [variant, setVariant] = useState(options.defaultVariant || 'control');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const client = getPostHogClient();

    if (!isPostHogReady()) {
      return;
    }

    const assigned = (client.getFeatureFlag(experimentKey) as string) || options.defaultVariant || 'control';
    setVariant(assigned);
    setLoading(false);

    if (options.onVariantAssigned) {
      options.onVariantAssigned(assigned);
    }
  }, [experimentKey, options.defaultVariant, options.onVariantAssigned]);

  return { variant, loading };
}
```

### `src/components/FeatureFlag.tsx`

```typescript
'use client';

import { ReactNode } from 'react';
import { useBooleanFlag, useFeatureFlag } from '../hooks';

interface FeatureFlagProps {
  flag: string;
  children: ReactNode;
  fallback?: ReactNode;
  defaultValue?: boolean;
}

export function FeatureFlag({
  flag,
  children,
  fallback = null,
  defaultValue = false,
}: FeatureFlagProps) {
  const isEnabled = useBooleanFlag(flag, defaultValue);

  return <>{isEnabled ? children : fallback}</>;
}

// Component for string-based feature flags (multi-variant)
interface FeatureVariantProps {
  flag: string;
  variant: string;
  children: ReactNode;
  defaultValue?: string;
}

export function FeatureVariant({
  flag,
  variant,
  children,
  defaultValue = 'control',
}: FeatureVariantProps) {
  const { enabled } = useFeatureFlag({
    key: flag,
    defaultValue,
    type: 'string',
  });

  return <>{enabled === variant ? children : null}</>;
}
```

### `src/components/Experiment.tsx`

```typescript
'use client';

import { ReactNode } from 'react';
import { useExperiment } from '../hooks';

interface ExperimentProps {
  experimentKey: string;
  variants: Record<string, ReactNode>;
  defaultVariant?: string;
  loadingComponent?: ReactNode;
}

export function Experiment({
  experimentKey,
  variants,
  defaultVariant = 'control',
  loadingComponent = null,
}: ExperimentProps) {
  const { variant, loading } = useExperiment({
    key: experimentKey,
    variants: Object.keys(variants),
    defaultVariant,
  });

  if (loading) {
    return <>{loadingComponent}</>;
  }

  const content = variants[variant] || variants[defaultVariant];

  return <>{content}</>;
}

// Simplified A/B test component (control vs treatment)
interface ABTestProps {
  experimentKey: string;
  control: ReactNode;
  treatment: ReactNode;
  loadingComponent?: ReactNode;
}

export function ABTest({
  experimentKey,
  control,
  treatment,
  loadingComponent,
}: ABTestProps) {
  return (
    <Experiment
      experimentKey={experimentKey}
      variants={{ control, treatment }}
      loadingComponent={loadingComponent}
    />
  );
}
```

### Server-Side Usage (Next.js App Router)

```typescript
// app/page.tsx (Server Component)
import { evaluateFlagServer, getExperimentVariantServer } from '@agency/experimentation/server';
import { headers } from 'next/headers';
import { cookies } from 'next/headers';

export default async function HomePage() {
  // Get distinct ID from cookie or generate new
  const cookieStore = cookies();
  const distinctId = cookieStore.get('distinct_id')?.value || `anon_${generateId()}`;

  // Evaluate feature flags server-side (bypasses ad-blockers)
  const isNewFeatureEnabled = await evaluateFlagServer('new-feature', distinctId);
  const heroVariant = await getExperimentVariantServer('hero-design-2024', distinctId);

  // Fetch different data based on variant
  const heroData = await fetchHeroData(heroVariant);

  return (
    <main>
      {heroVariant === 'treatment' ? (
        <NewHero data={heroData} />
      ) : (
        <OriginalHero data={heroData} />
      )}

      {isNewFeatureEnabled && <NewFeatureComponent />}
    </main>
  );
}

function generateId(): string {
  return Math.random().toString(36).substring(2, 15);
}
```

### Bootstrap Pattern (Prevent Flicker)

```typescript
// app/layout.tsx
import { evaluateFlagsServer } from '@agency/experimentation/server';
import { ExperimentationProvider } from '@agency/experimentation/components';

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Pre-fetch flags on server to prevent client-side flicker
  const cookieStore = cookies();
  const distinctId = cookieStore.get('distinct_id')?.value || 'anonymous';

  const bootstrapFlags = await evaluateFlagsServer(
    ['new-feature', 'redesign', 'premium-tier'],
    distinctId
  );

  return (
    <html lang="en">
      <body>
        <ExperimentationProvider
          apiKey={process.env.NEXT_PUBLIC_POSTHOG_KEY!}
          bootstrapFlags={bootstrapFlags}
        >
          {children}
        </ExperimentationProvider>
      </body>
    </html>
  );
}
```

## Environment Variables

```bash
# PostHog Feature Flags
NEXT_PUBLIC_POSTHOG_KEY=phc_...
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com
POSTHOG_SERVER_KEY=phc_... (different from client key)

# For local evaluation (server-side)
POSTHOG_PERSONAL_API_KEY=phx_...

# Optional: Bootstrap evaluation mode
EXPERIMENTATION_MODE=bootstrap|remote|local
```

## Verification Steps

```bash
# Test feature flag utilities
pnpm --filter @agency/experimentation test

# Test server-side evaluation
pnpm --filter @agency/experimentation test:server

# Integration test with real PostHog project
EXPERIMENTATION_TEST_MODE=1 pnpm --filter @agency/experimentation test:integration
```

## Related Tasks

- `80-analytics` - PostHog analytics integration
- `81a-experimentation-edge` - Edge Config for zero-latency experiments
- `80b-analytics-consent-bridge` - Consent-aware feature flags
