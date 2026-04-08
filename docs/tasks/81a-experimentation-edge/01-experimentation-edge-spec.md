# Experimentation Edge Specification

## Files

```
packages/experimentation/edge/
├── package.json
├── tsconfig.json
├── README.md
├── src/
│   ├── index.ts
│   ├── client.ts
│   ├── flags.ts
│   ├── variants.ts
│   ├── hooks/
│   │   ├── useEdgeFlag.ts
│   │   └── useExperiment.ts
│   └── middleware/
│       └── flag-middleware.ts
└── scripts/
    └── sync-flags.ts
```

### `package.json`

```json
{
  "name": "@agency/experimentation-edge",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "exports": {
    ".": "./src/index.ts",
    "./client": "./src/client.ts",
    "./flags": "./src/flags.ts",
    "./hooks": "./src/hooks/index.ts",
    "./middleware": "./src/middleware/flag-middleware.ts"
  },
  "dependencies": {
    "@agency/core-types": "workspace:*",
    "@vercel/edge-config": "latest"
  },
  "devDependencies": {
    "@agency/config-eslint": "workspace:*",
    "@agency/config-typescript": "workspace:*"
  },
  "scripts": {
    "sync": "tsx scripts/sync-flags.ts"
  },
  "publishConfig": { "access": "restricted" }
}
```

### `src/client.ts`

```typescript
import { get } from '@vercel/edge-config';

export interface EdgeFlag {
  name: string;
  enabled: boolean;
  variant?: string;
  targeting?: FlagTargeting;
}

export interface FlagTargeting {
  percentage: number;  // 0-100 rollout
  regions?: string[];
  referrers?: string[];
}

export async function getEdgeFlag(flagName: string): Promise<EdgeFlag | null> {
  const flag = await get<EdgeFlag>(`flag:${flagName}`);
  return flag;
}

export async function getAllEdgeFlags(): Promise<Record<string, EdgeFlag>> {
  const flags = await get<Record<string, EdgeFlag>>('flags');
  return flags || {};
}
```

### `src/variants.ts`

```typescript
// A/B variant assignment with sticky bucketing

import { createHash } from 'crypto';

export interface VariantConfig {
  flag: string;
  variants: string[];  // e.g., ['control', 'treatment-a', 'treatment-b']
  weights?: number[];  // Optional weighting (defaults to equal)
}

export function assignVariant(
  visitorId: string,
  config: VariantConfig
): string {
  // Deterministic hash for sticky assignment
  const hash = createHash('md5')
    .update(`${visitorId}:${config.flag}`)
    .digest('hex');
  
  const hashInt = parseInt(hash.slice(0, 8), 16);
  
  // Weighted selection
  const weights = config.weights || 
    new Array(config.variants.length).fill(1 / config.variants.length);
  
  const cumulative = weights.reduce((acc, w, i) => {
    acc.push((acc[i - 1] || 0) + w);
    return acc;
  }, [] as number[]);
  
  const normalized = (hashInt % 1000000) / 1000000;
  
  for (let i = 0; i < cumulative.length; i++) {
    if (normalized < cumulative[i]) {
      return config.variants[i];
    }
  }
  
  return config.variants[0];
}

// Cookie-based visitor ID (no login required)
export function getVisitorId(request: Request): string {
  const cookie = request.headers.get('cookie');
  const match = cookie?.match(/visitor-id=([^;]+)/);
  
  if (match) return match[1];
  
  // Generate new visitor ID
  return crypto.randomUUID();
}
```

### `src/hooks/useEdgeFlag.ts`

```typescript
'use client';

import { use } from 'react';
import type { EdgeFlag } from '../client';

// Server-fetched flags passed via context
const FlagContext = React.createContext<Record<string, EdgeFlag>>({});

export function useEdgeFlag(flagName: string): boolean {
  const flags = use(FlagContext);
  return flags[flagName]?.enabled ?? false;
}

export function useEdgeVariant(flagName: string): string | undefined {
  const flags = use(FlagContext);
  return flags[flagName]?.variant;
}
```

### `src/hooks/useExperiment.ts`

```typescript
'use client';

import { useEffect, useState } from 'react';

interface ExperimentResult {
  variant: string;
  trackConversion: (event: string, value?: number) => void;
}

export function useExperiment(experimentId: string): ExperimentResult {
  const [variant] = useState(() => {
    // Read variant from SSR or cookie
    if (typeof window === 'undefined') return 'control';
    
    const match = document.cookie.match(new RegExp(`${experimentId}=([^;]+)`));
    return match?.[1] || 'control';
  });

  const trackConversion = (event: string, value?: number) => {
    // Send to analytics
    fetch('/api/experiment-conversion', {
      method: 'POST',
      body: JSON.stringify({ experimentId, variant, event, value })
    });
  };

  return { variant, trackConversion };
}
```

### `src/middleware/flag-middleware.ts`

```typescript
// Edge middleware for flag injection

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getAllEdgeFlags } from '../client';
import { assignVariant, getVisitorId } from '../variants';

export async function flagMiddleware(request: NextRequest) {
  // Fetch all flags from Edge Config (edge cache, ~5ms)
  const flags = await getAllEdgeFlags();
  
  // Assign variants for experiments
  const visitorId = getVisitorId(request);
  const variants: Record<string, string> = {};
  
  for (const [name, flag] of Object.entries(flags)) {
    if (flag.variant) {
      variants[name] = assignVariant(visitorId, {
        flag: name,
        variants: [flag.variant, `${flag.variant}-alt`]
      });
    }
  }

  // Inject into request headers for SSR
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-edge-flags', JSON.stringify(flags));
  requestHeaders.set('x-edge-variants', JSON.stringify(variants));
  requestHeaders.set('x-visitor-id', visitorId);

  const response = NextResponse.next({
    request: { headers: requestHeaders }
  });

  // Set visitor ID cookie if new
  if (!request.cookies.get('visitor-id')) {
    response.cookies.set('visitor-id', visitorId, {
      maxAge: 60 * 60 * 24 * 365, // 1 year
      httpOnly: true,
      secure: true,
      sameSite: 'strict'
    });
  }

  // Set experiment cookies for variant stickiness
  for (const [name, variant] of Object.entries(variants)) {
    response.cookies.set(`exp:${name}`, variant, {
      maxAge: 60 * 60 * 24 * 30, // 30 days
      httpOnly: true
    });
  }

  return response;
}
```

### `scripts/sync-flags.ts`

```typescript
#!/usr/bin/env tsx
// Sync flags from local config to Vercel Edge Config

import { createClient } from '@vercel/edge-config';

const edgeConfig = createClient(process.env.EDGE_CONFIG!);

interface FlagFile {
  flags: Record<string, {
    enabled: boolean;
    variant?: string;
    description: string;
  }>;
}

async function syncFlags() {
  const flagFile: FlagFile = await import('../flags.json');
  
  console.log('Syncing flags to Edge Config...');
  
  // Transform to Edge Config format
  const edgeFlags: Record<string, unknown> = {};
  
  for (const [name, config] of Object.entries(flagFile.flags)) {
    edgeFlags[`flag:${name}`] = {
      name,
      enabled: config.enabled,
      variant: config.variant,
      updatedAt: new Date().toISOString()
    };
  }
  
  // Bulk upsert
  await edgeConfig.set(edgeFlags);
  
  console.log(`Synced ${Object.keys(edgeFlags).length} flags`);
}

syncFlags().catch(console.error);
```

### README

```markdown
# @agency/experimentation-edge

Zero-latency feature flags using Vercel Edge Config.

## When to Use

- Hero variant A/B tests (no flicker)
- CTA button color experiments
- Pricing page tests
- High-traffic landing pages

## When NOT to Use

- Product analytics (use PostHog)
- Complex multi-variate tests (use LaunchDarkly)
- User cohort targeting (use PostHog)

## Setup

```bash
# Create Edge Config in Vercel Dashboard
vercel edge-config add marketing-flags

# Set environment variable
EDGE_CONFIG="https://edge-config.vercel.com/ecfg_xxx"
```

## Usage in Next.js App

```typescript
// middleware.ts
import { flagMiddleware } from '@agency/experimentation-edge/middleware';

export function middleware(request: NextRequest) {
  return flagMiddleware(request);
}
```

```typescript
// page.tsx (Server Component)
import { getAllEdgeFlags } from '@agency/experimentation-edge';

export default async function Page() {
  const flags = await getAllEdgeFlags();
  
  return (
    <div>
      {flags['new-hero']?.enabled ? <NewHero /> : <OldHero />}
    </div>
  );
}
```

```typescript
// Client Component
'use client';
import { useExperiment } from '@agency/experimentation-edge/hooks';

function PricingCTA() {
  const { variant, trackConversion } = useExperiment('pricing-cta-2024');
  
  return (
    <Button 
      variant={variant === 'treatment' ? 'primary' : 'secondary'}
      onClick={() => trackConversion('click')}
    >
      Get Started
    </Button>
  );
}
```

## Flag JSON Format

```json
{
  "flags": {
    "new-hero": {
      "enabled": true,
      "variant": "v2",
      "description": "New hero design test"
    }
  }
}
```

## Sync to Edge Config

```bash
pnpm --filter @agency/experimentation-edge sync
```

## Performance

- Flag fetch: ~5ms at edge
- No origin round-trip
- SSR-safe (no hydration mismatch)
- Sticky variants via cookies
```


## Related Tasks

- `81-experimentation` - Product feature flags (PostHog)
- `80-analytics` - Analytics tracking
