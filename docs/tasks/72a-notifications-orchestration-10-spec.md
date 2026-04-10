# 72a-notifications-orchestration: Implementation Specification

## Task Header

| Field | Value |
|-------|-------|
| **State** | `conditional` — Package-controlled, opt-in only |
| **Trigger** | 2+ production consumers share the same multi-channel notification workflow |
| **Minimum Consumers** | 2+ apps with proven shared workflow routing needs |
| **Dependencies** | `@agency/notifications`, React 19.2.5, one chosen orchestration provider |
| **Exit Criteria** | Base notifications prove insufficient and one orchestrator is integrated behind a narrow routing surface |
| **Implementation Authority** | `REPO-STATE.md` — Conditional; advanced escalation only after Task 72 proves insufficient |
| **Version Authority** | `DEPENDENCY.md` §2 — React 19.2.5 |
| **Supersedes** | n/a |
| **Superseded by** | n/a |

**Cross-references:**
- Decision status: `DECISION-STATUS.md` — Notification orchestration `open`
- Version pins: `DEPENDENCY.md` §11
- Note: Sub-task of 72-notifications; do not build until there is a concrete shared workflow gap that simple outbound notifications cannot cover

## Files

```
packages/communication/notifications-orchestration/
├── package.json
├── tsconfig.json
├── 01-config-biome-migration-50-ref-quickstart.md
└── src/
    ├── index.ts
    ├── provider.ts
    ├── router.ts
    └── workflows/
        └── welcome-series.ts
```

## Scope Boundary

Task 72a is not a default extension of Task 72. It exists only for cases where multiple apps need the same multi-step, cross-channel workflow behavior and a plain Slack/Discord/webhook adapter is no longer sufficient.

## Candidate Providers (choose one after proof)

| Provider | Use only when | Keep out of baseline scope |
|----------|---------------|----------------------------|
| Knock | Managed enterprise workflow tooling is justified by budget and shared workflow complexity | Do not pre-bundle for speculative future enterprise needs |
| Novu | Open-source/self-hosted orchestration is required by a proven workflow need | Do not add just to compare options in advance |

## Minimal Routing Surface

```typescript
// src/provider.ts
export interface NotificationWorkflowProvider {
  trigger(workflowKey: string, recipientId: string, data: Record<string, unknown>): Promise<void>;
  syncPreferences?(recipientId: string, preferences: Record<string, boolean>): Promise<void>;
}

// src/router.ts
import type { NotificationWorkflowProvider } from "./provider";

export function createNotificationRouter(provider: NotificationWorkflowProvider) {
  return {
    async trigger(workflowKey: string, recipientId: string, data: Record<string, unknown>) {
      await provider.trigger(workflowKey, recipientId, data);
    },
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
    "@agency/notifications": "workspace:*"
  },
  "peerDependencies": {
    "react": "^19.0.0"
  }
}
```

## README

```md
# @agency/notifications-orchestration

Shared routing surface for a single chosen notification orchestrator.

## When to Use

- Multiple apps need the same multi-step notification workflow
- Base outbound notifications from Task 72 are already implemented and insufficient
- One orchestrator has been selected for real consumer requirements

## Boundary

- Do not install both Knock and Novu in the baseline package.
- Choose exactly one provider after workflow requirements are validated.
- Keep provider-specific UI feeds out of this package unless two consumers share the same UI surface.

## Setup

1. Validate the shared workflow gap.
2. Choose one orchestrator.
3. Add only that provider's SDK.
4. Route workflows through the minimal provider interface above.
```
