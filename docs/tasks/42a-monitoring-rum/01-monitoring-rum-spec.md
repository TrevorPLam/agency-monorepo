# 42a-monitoring-rum: Implementation Specification

## Task Header

| Field | Value |
|-------|-------|
| **State** | `conditional` — Package-controlled, opt-in only |
| **Trigger** | App requires Real User Monitoring (RUM) |
| **Minimum Consumers** | 1+ apps with performance monitoring needs |
| **Dependencies** | Sentry 10.x OR PostHog, React 19.2.5 |
| **Exit Criteria** | RUM package exported and integrated |
| **Implementation Authority** | `REPO-STATE.md` — Conditional; requires explicit app opt-in |
| **Version Authority** | `DEPENDENCY.md` §2, §16 — React 19.2.5, Sentry 10.x |
| **Superseded by** | n/a |

**Cross-references:**
- Decision status: `DECISION-STATUS.md` — RUM `open`
- Version pins: `DEPENDENCY.md` §2, §16
- Note: Sub-task of 42-monitoring; optional performance analytics

## Files

```
packages/monitoring/rum/
├── package.json
├── tsconfig.json
├── README.md
├── src/
│   ├── index.ts
│   ├── vitals.ts
│   ├── crux.ts
│   ├── attribution.ts
│   ├── storage.ts
│   ├── hooks/
│   │   ├── useWebVitals.ts
│   │   └── usePagePerformance.ts
│   └── dashboard/
│       ├── api.ts
│       └── types.ts
└── scripts/
    └── crux-batch-fetch.ts
```

### `package.json`

```json
{
  "name": "@agency/monitoring-rum",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "exports": {
    ".": "./src/index.ts",
    "./vitals": "./src/vitals.ts",
    "./crux": "./src/crux.ts",
    "./hooks": "./src/hooks/index.ts"
  },
  "dependencies": {
    "@agency/core-types": "workspace:*",
    "web-vitals": "5.2.0",
    "@agency/data-db": "workspace:*"
  },
  "devDependencies": {
    "@agency/config-eslint": "workspace:*",
    "@agency/config-typescript": "workspace:*"
  },
  "publishConfig": { "access": "restricted" }
}
```

### `src/vitals.ts`

```typescript
import { 
  onINP, 
  onLCP, 
  onCLS, 
  onTTFB, 
  onFCP,
  type Metric 
} from 'web-vitals';

export interface WebVitalsReport {
  inp: Metric | null;  // Interaction to Next Paint (2026 critical)
  lcp: Metric | null;  // Largest Contentful Paint
  cls: Metric | null;  // Cumulative Layout Shift
  ttfb: Metric | null; // Time to First Byte
  fcp: Metric | null;  // First Contentful Paint
  url: string;
  timestamp: string;
  deviceType: 'mobile' | 'desktop' | 'tablet';
  connection: string;
}

export interface VitalsOptions {
  onReport?: (report: WebVitalsReport) => void;
  reportAllChanges?: boolean;
  analyticsEndpoint?: string;
}

export function initWebVitals(options: VitalsOptions = {}) {
  const report: Partial<WebVitalsReport> = {
    url: window.location.href,
    timestamp: new Date().toISOString(),
    deviceType: getDeviceType(),
    connection: (navigator as any).connection?.effectiveType || 'unknown'
  };

  // INP - Critical for 2026 rankings
  onINP((metric) => {
    report.inp = metric;
    maybeReport(report as WebVitalsReport, options);
  }, { reportAllChanges: options.reportAllChanges });

  // LCP
  onLCP((metric) => {
    report.lcp = metric;
    maybeReport(report as WebVitalsReport, options);
  }, { reportAllChanges: options.reportAllChanges });

  // CLS
  onCLS((metric) => {
    report.cls = metric;
    maybeReport(report as WebVitalsReport, options);
  }, { reportAllChanges: options.reportAllChanges });

  // TTFB
  onTTFB((metric) => {
    report.ttfb = metric;
    maybeReport(report as WebVitalsReport, options);
  });

  // FCP
  onFCP((metric) => {
    report.fcp = metric;
    maybeReport(report as WebVitalsReport, options);
  });
}

function getDeviceType(): WebVitalsReport['deviceType'] {
  const width = window.innerWidth;
  if (width < 768) return 'mobile';
  if (width < 1024) return 'tablet';
  return 'desktop';
}

function maybeReport(report: WebVitalsReport, options: VitalsOptions) {
  // Only report when all metrics collected or timeout
  if (options.onReport) {
    options.onReport(report);
  }

  // Send to analytics endpoint if configured
  if (options.analyticsEndpoint && report.lcp && report.cls) {
    navigator.sendBeacon?.(
      options.analyticsEndpoint,
      JSON.stringify(report)
    );
  }
}
```

### `src/crux.ts`

```typescript
// Chrome User Experience Report API client

export interface CruxOptions {
  apiKey: string;
  origin: string;  // e.g., "https://example.com"
  formFactor?: 'PHONE' | 'DESKTOP' | 'TABLET' | 'ALL_FORM_FACTORS';
}

export interface CruxMetrics {
  first_contentful_paint: Distribution;
  largest_contentful_paint: Distribution;
  first_input_delay: Distribution;
  cumulative_layout_shift: Distribution;
  experimental_time_to_first_byte: Distribution;
  interaction_to_next_paint: Distribution;  // 2026 critical
}

interface Distribution {
  histogram: Array<{ start: number | string; end?: number | string; density: number }>;
  percentiles: { p75: number };
}

export async function fetchCruxData(options: CruxOptions): Promise<CruxMetrics | null> {
  const url = 'https://chromeuxreport.googleapis.com/v1/records:queryRecord';
  
  const body = {
    origin: options.origin,
    formFactor: options.formFactor || 'ALL_FORM_FACTORS'
  };

  try {
    const response = await fetch(`${url}?key=${options.apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      throw new Error(`CrUX API error: ${response.status}`);
    }

    const data = await response.json();
    return data.record?.metrics || null;
  } catch (error) {
    console.error('Failed to fetch CrUX data:', error);
    return null;
  }
}

// Interpret CrUX scores
export function assessCruxScore(metric: string, p75: number): 'good' | 'needs-improvement' | 'poor' {
  const thresholds: Record<string, [number, number]> = {
    'largest_contentful_paint': [2500, 4000],    // ms
    'first_input_delay': [100, 300],              // ms
    'cumulative_layout_shift': [0.1, 0.25],      // unitless
    'first_contentful_paint': [1800, 3000],      // ms
    'experimental_time_to_first_byte': [800, 1800], // ms
    'interaction_to_next_paint': [200, 500]      // ms (2026 critical)
  };

  const [good, poor] = thresholds[metric] || [0, 0];
  
  if (p75 <= good) return 'good';
  if (p75 <= poor) return 'needs-improvement';
  return 'poor';
}
```

### `src/attribution.ts`

```typescript
// Attribute performance by page, component, traffic source

export interface PerformanceAttribution {
  page: string;
  trafficSource: string;
  component?: string;
  vitals: {
    lcp: number;
    inp: number;
    cls: number;
  };
  timestamp: string;
}

export function createAttributionTracker() {
  const attributions: PerformanceAttribution[] = [];

  return {
    track: (attribution: Omit<PerformanceAttribution, 'timestamp'>) => {
      attributions.push({
        ...attribution,
        timestamp: new Date().toISOString()
      });
    },

    getByPage: (page: string) => {
      return attributions.filter(a => a.page === page);
    },

    getByTrafficSource: (source: string) => {
      return attributions.filter(a => a.trafficSource === source);
    },

    getSummary: () => {
      const byPage = new Map<string, PerformanceAttribution[]>();
      
      attributions.forEach(a => {
        const existing = byPage.get(a.page) || [];
        existing.push(a);
        byPage.set(a.page, existing);
      });

      return Array.from(byPage.entries()).map(([page, data]) => ({
        page,
        count: data.length,
        avgLCP: average(data.map(d => d.vitals.lcp)),
        avgINP: average(data.map(d => d.vitals.inp)),
        avgCLS: average(data.map(d => d.vitals.cls))
      }));
    },

    export: () => [...attributions]
  };
}

function average(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((a, b) => a + b, 0) / values.length;
}
```

### `src/hooks/useWebVitals.ts`

```typescript
'use client';

import { useEffect, useState } from 'react';
import { initWebVitals, type WebVitalsReport } from '../vitals';

export function useWebVitals(analyticsEndpoint?: string) {
  const [vitals, setVitals] = useState<WebVitalsReport | null>(null);

  useEffect(() => {
    initWebVitals({
      onReport: setVitals,
      analyticsEndpoint
    });
  }, [analyticsEndpoint]);

  return vitals;
}
```

### `src/index.ts`

```typescript
export { initWebVitals, type WebVitalsReport, type VitalsOptions } from './vitals';
export { fetchCruxData, assessCruxScore, type CruxOptions, type CruxMetrics } from './crux';
export { createAttributionTracker, type PerformanceAttribution } from './attribution';
export { useWebVitals } from './hooks/useWebVitals';
```

### README

```markdown
# @agency/monitoring-rum

Real User Monitoring using Web Vitals and Chrome User Experience Report.

## Why Field Data Matters

Google ranks on **CrUX field data**, not Lighthouse lab scores:
- Lab = Simulated, controlled environment
- Field = Real users, real networks, real devices

## Web Vitals 2026 Priority

1. **INP** (Interaction to Next Paint) - Critical new metric
   - Measures responsiveness to all interactions
   - Replaces FID in ranking factors

2. **LCP** (Largest Contentful Paint) - Loading speed
3. **CLS** (Cumulative Layout Shift) - Visual stability

## Usage

```typescript
import { initWebVitals, fetchCruxData } from '@agency/monitoring-rum';

// Real-time tracking
initWebVitals({
  analyticsEndpoint: '/api/vitals',
  onReport: (report) => {
    console.log('INP:', report.inp?.value);
  }
});

// CrUX origin data
const crux = await fetchCruxData({
  apiKey: process.env.CRUX_API_KEY!,
  origin: 'https://client-site.com'
});

console.log('75th percentile LCP:', crux?.largest_contentful_paint.percentiles.p75);
```

## Performance Attribution

Track by traffic source to identify slow channels:
- Organic search (typically fast)
- Social ads (often slower, budget devices)
- Email campaigns (varies by list demographics)
```


## Related Tasks

- `42-monitoring` - Base performance monitoring
- `42b-monitoring-ppr-helpers` - PPR performance tracking
- `80-analytics` - Analytics integration
