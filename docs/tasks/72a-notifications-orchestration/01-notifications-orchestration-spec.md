# Notifications Orchestration Specification

## Files

```
packages/communication/notifications-orchestration/
├── package.json
├── tsconfig.json
├── README.md
└── src/
    ├── index.ts
    ├── knock.ts
    ├── novu.ts
    └── workflows/
        └── welcome-series.ts
```

## Provider Comparison

| Feature | Knock | Novu |
|---------|-------|------|
| **Pricing** | $250/mo entry | Free tier (10k/mo) |
| **Open Source** | No | Yes (MIT) |
| **Self-hostable** | No | Yes |
| **React Components** | Yes (comprehensive) | Yes (basic) |
| **Multi-tenant** | Native | Manual |
| **Best For** | Enterprise workflows | Budget/OSS preference |

## Knock Implementation

```typescript
// src/knock.ts
import { Knock } from "@knocklabs/node";

interface KnockConfig {
  apiKey: string;
  workflowKey: string;
}

export function createKnockProvider(config: KnockConfig) {
  const knock = new Knock(config.apiKey);
  
  return {
    async trigger(
      userId: string,
      data: Record<string, unknown>
    ) {
      await knock.workflows.trigger(config.workflowKey, {
        recipients: [userId],
        data
      });
    },
    
    async identifyUser(userId: string, userData: unknown) {
      await knock.users.identify(userId, userData);
    },
    
    async setPreferences(
      userId: string,
      preferences: Record<string, boolean>
    ) {
      await knock.users.setPreferences(userId, {
        workflows: preferences
      });
    }
  };
}
```

## Novu Implementation

```typescript
// src/novu.ts
import { Novu } from "@novu/node";

interface NovuConfig {
  apiKey: string;
  workflowId: string;
}

export function createNovuProvider(config: NovuConfig) {
  const novu = new Novu(config.apiKey);
  
  return {
    async trigger(
      subscriberId: string,
      payload: Record<string, unknown>
    ) {
      await novu.trigger(config.workflowId, {
        to: { subscriberId },
        payload
      });
    },
    
    async identifySubscriber(
      subscriberId: string,
      data: unknown
    ) {
      await novu.subscribers.identify(subscriberId, data);
    },
    
    async updatePreferences(
      subscriberId: string,
      preferences: Record<string, boolean>
    ) {
      await novu.subscribers.updatePreferences(
        subscriberId,
        preferences
      );
    }
  };
}
```

## Example Workflow: Welcome Series

```typescript
// src/workflows/welcome-series.ts
// This maps to a workflow configured in Knock/Novu dashboard

export interface WelcomeSeriesPayload {
  userName: string;
  onboardingUrl: string;
  tips: string[];
}

// Workflow steps (configured in provider):
// 1. Send welcome email immediately
// 2. Wait 24 hours
// 3. Send onboarding tip (if not completed)
// 4. Wait 48 hours
// 5. Send final reminder (if still not completed)
// 6. Add to "nurture" segment
```

## React Components

```tsx
// For Knock: Pre-built notification feed
import { NotificationFeed } from "@knocklabs/react";

function NotificationBell() {
  return (
    <NotificationFeed
      userId={currentUser.id}
      tenant={currentOrganization.id}
    />
  );
}

// For Novu: Custom implementation using hooks
import { useNotifications } from "./hooks/use-notifications";

function NovuNotificationBell() {
  const { notifications, markAsRead } = useNotifications();
  
  return (
    <NotificationDropdown
      notifications={notifications}
      onMarkAsRead={markAsRead}
    />
  );
}
```

## Package.json

```json
{
  "name": "@agency/notifications-orchestration",
  "version": "0.1.0",
  "private": true,
  "dependencies": {
    "@knocklabs/node": "latest",
    "@knocklabs/react": "latest",
    "@novu/node": "latest"
  },
  "peerDependencies": {
    "react": "^19.0.0"
  }
}
```

## README

```md
# @agency/notifications-orchestration

Enterprise notification workflows using Knock or Novu.

## When to Use

- Multi-channel sequences (email + push + in-app)
- Complex branching logic
- Preference management at scale
- Notification digests/batching

## Provider Selection

Use **Knock** when:
- Budget allows $250+/mo
- Need comprehensive React components
- Want managed infrastructure

Use **Novu** when:
- Budget constrained
- Prefer open source
- Need self-hosting option
- Volume <100k/month

## Setup

1. Configure provider in dashboard
2. Create workflows
3. Map workflow keys to environment variables
4. Implement user identification
```
