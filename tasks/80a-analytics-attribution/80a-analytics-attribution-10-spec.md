# 80a-analytics-attribution: Implementation Specification

## Task Header

| Field | Value |
|-------|-------|
| **State** | `conditional` — Package-controlled, opt-in only |
| **Trigger** | 2+ consumers share the same attribution reporting questions beyond simple UTM capture |
| **Minimum Consumers** | 2+ apps with attribution modeling needs |
| **Dependencies** | `@agency/analytics`, `uuid` |
| **Exit Criteria** | Attribution helpers are extracted only after two consumers prove the same reporting and storage requirements |
| **Implementation Authority** | `REPO-STATE.md` — Conditional; requires explicit analytics need |
| **Version Authority** | `DEPENDENCY.md` §8 — selected analytics lane |
| **Supersedes** | n/a |
| **Superseded by** | n/a |

**Cross-references:**
- Decision status: `DECISION-STATUS.md` — Attribution `open`
- Version pins: `DEPENDENCY.md` §8
- Note: Sub-task of 80-analytics; do not build by default, and keep simple UTM/session capture inside Task 80 until two consumers need the same attribution model

## Files

```
packages/analytics/attribution/
├── package.json
├── tsconfig.json
├── README.md
├── src/
│   ├── index.ts
│   ├── models.ts
│   ├── touchpoints.ts
│   ├── paths.ts
│   ├── reporting.ts
│   ├── storage.ts
│   └── types.ts
└── scripts/
    └── attribution-report.ts
```

### `package.json`

```json
{
  "name": "@agency/analytics-attribution",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "exports": {
    ".": "./src/index.ts",
    "./models": "./src/models.ts",
    "./touchpoints": "./src/touchpoints.ts",
    "./reporting": "./src/reporting.ts"
  },
  "dependencies": {
    "@agency/core-types": "workspace:*",
    "@agency/analytics": "workspace:*",
    "uuid": "13.0.0"
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
// Attribution data types

export type Channel = 
  | 'organic_search' 
  | 'paid_search' 
  | 'social_organic' 
  | 'social_paid' 
  | 'email' 
  | 'direct' 
  | 'referral' 
  | 'display';

export type AttributionModel = 
  | 'first_touch' 
  | 'last_touch' 
  | 'linear' 
  | 'time_decay' 
  | 'position_based';

export interface Touchpoint {
  id: string;
  userId: string;
  timestamp: string;
  channel: Channel;
  campaign?: string;
  source?: string;
  medium?: string;
  content?: string;
  landingPage: string;
  device: 'desktop' | 'mobile' | 'tablet';
}

export interface Conversion {
  id: string;
  userId: string;
  timestamp: string;
  touchpoints: Touchpoint[];  // Ordered path
  revenue: number;
  currency: string;
  conversionType: string;
}

export interface AttributionResult {
  channel: Channel;
  conversions: number;
  revenue: number;
  contributionPercentage: number;
  assistedConversions: number;
  model: AttributionModel;
}
```

### `src/touchpoints.ts`

```typescript
// Touchpoint tracking and session management

import { v4 as uuidv4 } from 'uuid';
import type { Touchpoint, Channel } from './types';

export interface TrackingParams {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  gclid?: string;     // Google Ads
  fbclid?: string;    // Facebook
  li_fat_id?: string; // LinkedIn
}

export class TouchpointTracker {
  private storage: Storage;

  constructor(storage: Storage = localStorage) {
    this.storage = storage;
  }

  trackTouchpoint(url: string, referrer?: string): Touchpoint {
    const params = this.parseUrlParams(url);
    const channel = this.detectChannel(params, referrer);
    
    const touchpoint: Touchpoint = {
      id: uuidv4(),
      userId: this.getUserId(),
      timestamp: new Date().toISOString(),
      channel,
      campaign: params.utm_campaign,
      source: params.utm_source,
      medium: params.utm_medium,
      content: params.utm_content,
      landingPage: url,
      device: this.detectDevice()
    };

    // Store in user journey
    this.appendToJourney(touchpoint);
    
    return touchpoint;
  }

  private parseUrlParams(url: string): TrackingParams {
    const searchParams = new URL(url).searchParams;
    return {
      utm_source: searchParams.get('utm_source') || undefined,
      utm_medium: searchParams.get('utm_medium') || undefined,
      utm_campaign: searchParams.get('utm_campaign') || undefined,
      utm_content: searchParams.get('utm_content') || undefined,
      gclid: searchParams.get('gclid') || undefined,
      fbclid: searchParams.get('fbclid') || undefined
    };
  }

  private detectChannel(params: TrackingParams, referrer?: string): Channel {
    // Paid detection (click IDs)
    if (params.gclid) return 'paid_search';
    if (params.fbclid) return 'social_paid';
    
    // UTM-based detection
    if (params.utm_medium === 'cpc' || params.utm_medium === 'ppc') {
      return 'paid_search';
    }
    if (params.utm_medium === 'social') {
      return params.utm_source?.includes('ad') ? 'social_paid' : 'social_organic';
    }
    if (params.utm_medium === 'email') {
      return 'email';
    }
    if (params.utm_medium === 'display' || params.utm_medium === 'banner') {
      return 'display';
    }
    
    // Referrer-based detection
    if (referrer) {
      if (referrer.includes('google')) return 'organic_search';
      if (referrer.includes('facebook.com') || referrer.includes('instagram.com')) return 'social_organic';
      if (referrer.includes('linkedin.com')) return 'social_organic';
    }
    
    return 'direct';
  }

  private getUserId(): string {
    let userId = this.storage.getItem('attribution-user-id');
    if (!userId) {
      userId = uuidv4();
      this.storage.setItem('attribution-user-id', userId);
    }
    return userId;
  }

  private appendToJourney(touchpoint: Touchpoint): void {
    const key = `journey:${touchpoint.userId}`;
    const journey: Touchpoint[] = JSON.parse(this.storage.getItem(key) || '[]');
    journey.push(touchpoint);
    this.storage.setItem(key, JSON.stringify(journey));
  }

  private detectDevice(): Touchpoint['device'] {
    const width = window.innerWidth;
    if (width < 768) return 'mobile';
    if (width < 1024) return 'tablet';
    return 'desktop';
  }

  getJourney(userId: string): Touchpoint[] {
    const key = `journey:${userId}`;
    return JSON.parse(this.storage.getItem(key) || '[]');
  }

  clearJourney(userId: string): void {
    this.storage.removeItem(`journey:${userId}`);
  }
}
```

### `src/models.ts`

```typescript
// Attribution model calculations

import type { Conversion, AttributionResult, AttributionModel, Channel } from './types';

export function calculateAttribution(
  conversions: Conversion[],
  model: AttributionModel
): AttributionResult[] {
  switch (model) {
    case 'first_touch':
      return firstTouchModel(conversions);
    case 'last_touch':
      return lastTouchModel(conversions);
    case 'linear':
      return linearModel(conversions);
    case 'time_decay':
      return timeDecayModel(conversions);
    case 'position_based':
      return positionBasedModel(conversions);
    default:
      return lastTouchModel(conversions);
  }
}

function firstTouchModel(conversions: Conversion[]): AttributionResult[] {
  const channelMap = new Map<Channel, { conversions: number; revenue: number }>();

  for (const conv of conversions) {
    if (conv.touchpoints.length === 0) continue;
    
    const firstTouch = conv.touchpoints[0];
    const current = channelMap.get(firstTouch.channel) || { conversions: 0, revenue: 0 };
    
    channelMap.set(firstTouch.channel, {
      conversions: current.conversions + 1,
      revenue: current.revenue + conv.revenue
    });
  }

  return buildResults(channelMap, conversions, 'first_touch');
}

function lastTouchModel(conversions: Conversion[]): AttributionResult[] {
  const channelMap = new Map<Channel, { conversions: number; revenue: number }>();

  for (const conv of conversions) {
    if (conv.touchpoints.length === 0) continue;
    
    const lastTouch = conv.touchpoints[conv.touchpoints.length - 1];
    const current = channelMap.get(lastTouch.channel) || { conversions: 0, revenue: 0 };
    
    channelMap.set(lastTouch.channel, {
      conversions: current.conversions + 1,
      revenue: current.revenue + conv.revenue
    });
  }

  return buildResults(channelMap, conversions, 'last_touch');
}

function linearModel(conversions: Conversion[]): AttributionResult[] {
  const channelMap = new Map<Channel, { conversions: number; revenue: number }>();

  for (const conv of conversions) {
    if (conv.touchpoints.length === 0) continue;
    
    const weight = 1 / conv.touchpoints.length;
    
    for (const touch of conv.touchpoints) {
      const current = channelMap.get(touch.channel) || { conversions: 0, revenue: 0 };
      
      channelMap.set(touch.channel, {
        conversions: current.conversions + weight,
        revenue: current.revenue + (conv.revenue * weight)
      });
    }
  }

  return buildResults(channelMap, conversions, 'linear');
}

function timeDecayModel(conversions: Conversion[]): AttributionResult[] {
  const channelMap = new Map<Channel, { conversions: number; revenue: number }>();
  const HALF_LIFE_DAYS = 7;
  const HALF_LIFE_MS = HALF_LIFE_DAYS * 24 * 60 * 60 * 1000;

  for (const conv of conversions) {
    if (conv.touchpoints.length === 0) continue;
    
    const convTime = new Date(conv.timestamp).getTime();
    
    // Calculate decay weights
    let totalWeight = 0;
    const weights = conv.touchpoints.map(touch => {
      const touchTime = new Date(touch.timestamp).getTime();
      const daysBefore = (convTime - touchTime) / (24 * 60 * 60 * 1000);
      const weight = Math.pow(0.5, daysBefore / HALF_LIFE_DAYS);
      totalWeight += weight;
      return weight;
    });
    
    // Normalize and apply
    for (let i = 0; i < conv.touchpoints.length; i++) {
      const touch = conv.touchpoints[i];
      const normalizedWeight = weights[i] / totalWeight;
      
      const current = channelMap.get(touch.channel) || { conversions: 0, revenue: 0 };
      
      channelMap.set(touch.channel, {
        conversions: current.conversions + normalizedWeight,
        revenue: current.revenue + (conv.revenue * normalizedWeight)
      });
    }
  }

  return buildResults(channelMap, conversions, 'time_decay');
}

function positionBasedModel(conversions: Conversion[]): AttributionResult[] {
  const channelMap = new Map<Channel, { conversions: number; revenue: number }>();

  for (const conv of conversions) {
    if (conv.touchpoints.length === 0) continue;
    if (conv.touchpoints.length === 1) {
      // Single touchpoint gets 100%
      const touch = conv.touchpoints[0];
      const current = channelMap.get(touch.channel) || { conversions: 0, revenue: 0 };
      channelMap.set(touch.channel, {
        conversions: current.conversions + 1,
        revenue: current.revenue + conv.revenue
      });
      continue;
    }
    
    // 40% first, 40% last, 20% distributed among middle
    const firstTouch = conv.touchpoints[0];
    const lastTouch = conv.touchpoints[conv.touchpoints.length - 1];
    const middleTouches = conv.touchpoints.slice(1, -1);
    
    // First touch (40%)
    const firstCurrent = channelMap.get(firstTouch.channel) || { conversions: 0, revenue: 0 };
    channelMap.set(firstTouch.channel, {
      conversions: firstCurrent.conversions + 0.4,
      revenue: firstCurrent.revenue + (conv.revenue * 0.4)
    });
    
    // Last touch (40%)
    const lastCurrent = channelMap.get(lastTouch.channel) || { conversions: 0, revenue: 0 };
    channelMap.set(lastTouch.channel, {
      conversions: lastCurrent.conversions + 0.4,
      revenue: lastCurrent.revenue + (conv.revenue * 0.4)
    });
    
    // Middle touches (20% split)
    if (middleTouches.length > 0) {
      const middleWeight = 0.2 / middleTouches.length;
      for (const touch of middleTouches) {
        const current = channelMap.get(touch.channel) || { conversions: 0, revenue: 0 };
        channelMap.set(touch.channel, {
          conversions: current.conversions + middleWeight,
          revenue: current.revenue + (conv.revenue * middleWeight)
        });
      }
    }
  }

  return buildResults(channelMap, conversions, 'position_based');
}

function buildResults(
  channelMap: Map<Channel, { conversions: number; revenue: number }>,
  conversions: Conversion[],
  model: AttributionModel
): AttributionResult[] {
  const totalRevenue = conversions.reduce((sum, c) => sum + c.revenue, 0);
  
  return Array.from(channelMap.entries()).map(([channel, data]) => ({
    channel,
    conversions: Math.round(data.conversions),
    revenue: Math.round(data.revenue),
    contributionPercentage: totalRevenue > 0 ? (data.revenue / totalRevenue) * 100 : 0,
    assistedConversions: 0, // Calculated separately
    model
  }));
}
```

### `src/reporting.ts`

```typescript
// Attribution reporting and insights

import type { AttributionResult, Channel } from './types';

export interface BudgetRecommendation {
  channel: Channel;
  currentAllocation: number;
  recommendedAllocation: number;
  change: number;
  reason: string;
}

export function generateBudgetRecommendations(
  results: AttributionResult[],
  currentBudget: Record<Channel, number>
): BudgetRecommendation[] {
  const totalBudget = Object.values(currentBudget).reduce((a, b) => a + b, 0);
  const totalRevenue = results.reduce((a, b) => a + b.revenue, 0);
  
  const recommendations: BudgetRecommendation[] = [];
  
  for (const result of results) {
    const currentAllocation = currentBudget[result.channel] || 0;
    const currentPercentage = (currentAllocation / totalBudget) * 100;
    
    // Recommended allocation proportional to revenue contribution
    const recommendedPercentage = totalRevenue > 0 
      ? (result.revenue / totalRevenue) * 100 
      : 0;
    
    const recommendedAllocation = (recommendedPercentage / 100) * totalBudget;
    
    recommendations.push({
      channel: result.channel,
      currentAllocation,
      recommendedAllocation,
      change: recommendedAllocation - currentAllocation,
      reason: `Contributed ${result.contributionPercentage.toFixed(1)}% of revenue with ${result.conversions} conversions`
    });
  }
  
  return recommendations.sort((a, b) => Math.abs(b.change) - Math.abs(a.change));
}

export function generateInsights(results: AttributionResult[]): string[] {
  const insights: string[] = [];
  const sortedByRevenue = [...results].sort((a, b) => b.revenue - a.revenue);
  
  if (sortedByRevenue.length === 0) return insights;
  
  const topChannel = sortedByRevenue[0];
  insights.push(`${topChannel.channel} is your top revenue driver (${topChannel.contributionPercentage.toFixed(1)}%)`);
  
  // Find underperforming channels
  const lowPerformers = results.filter(r => r.conversions > 0 && r.contributionPercentage < 5);
  if (lowPerformers.length > 0) {
    insights.push(`${lowPerformers.length} channels contribute less than 5% each - consider budget reallocation`);
  }
  
  // Find channels with high assist rate
  const highAssist = results.filter(r => r.assistedConversions > r.conversions * 2);
  if (highAssist.length > 0) {
    const names = highAssist.map(r => r.channel).join(', ');
    insights.push(`${names} show high assist rates - important for consideration stage`);
  }
  
  return insights;
}
```

### README

```markdown
# @agency/analytics-attribution

Multi-touch attribution modeling for marketing budget optimization.

## Attribution Models

| Model | Best For | Formula |
|-------|----------|---------|
| First Touch | Brand awareness campaigns | 100% to first interaction |
| Last Touch | Direct response campaigns | 100% to last interaction |
| Linear | Long sales cycles | Equal split across all touches |
| Time Decay | Short sales cycles | More credit to recent touches |
| Position Based | Complex journeys | 40% first, 40% last, 20% middle |

## Usage

```typescript
import { TouchpointTracker, calculateAttribution } from '@agency/analytics-attribution';

// Track touchpoints
const tracker = new TouchpointTracker();
tracker.trackTouchpoint(window.location.href, document.referrer);

// On conversion
const journey = tracker.getJourney(userId);
const conversion = {
  userId,
  timestamp: new Date().toISOString(),
  touchpoints: journey,
  revenue: 1000,
  conversionType: 'purchase'
};

// Calculate attribution
const results = calculateAttribution([conversion], 'time_decay');
console.log(results);
// [{ channel: 'paid_search', revenue: 600, contributionPercentage: 60, ... }]
```

## Budget Recommendations

```typescript
import { generateBudgetRecommendations } from '@agency/analytics-attribution/reporting';

const recommendations = generateBudgetRecommendations(results, {
  paid_search: 5000,
  social_paid: 3000,
  organic_search: 0
});

// Returns reallocation suggestions based on contribution
```

## Data Requirements

- UTM parameters on all campaign URLs
- Touchpoint persistence (localStorage/cookie)
- Conversion events sent to data warehouse

## Privacy

- Touchpoint data expires after 90 days
- No PII stored in attribution data
- Respects user consent preferences
```


## Related Tasks

- `80-analytics` - Base analytics package
- `80b-analytics-consent-bridge` - Privacy-compliant tracking
