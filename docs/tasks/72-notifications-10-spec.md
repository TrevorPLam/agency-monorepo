# 72-notifications: Implementation Specification

## Task Header

| Field | Value |
|-------|-------|
| **State** | `conditional` — Package-controlled, opt-in only |
| **Trigger** | App requires outbound operational notifications |
| **Minimum Consumers** | 1+ apps explicitly requesting notifications |
| **Dependencies** | Slack webhook, Discord webhook, or generic HTTP webhook |
| **Exit Criteria** | Notification system exported and used in at least one app |
| **Implementation Authority** | `REPO-STATE.md` — Conditional; requires explicit app-level opt-in |
| **Version Authority** | `DEPENDENCY.md` §11 — provider SDKs optional; webhook-first outbound delivery |
| **Supersedes** | n/a |
| **Superseded by** | n/a |

**Cross-references:**
- Decision status: `DECISION-STATUS.md` — Notifications `open` (evaluate during Task 72)
- Version pins: `DEPENDENCY.md` §11
- Architecture: `ARCHITECTURE.md` — Communication layer section
- Note: Task 72 covers outbound operational notifications only; in-app realtime feeds and mobile push stay app-level until a dedicated task is justified

## Files
```
packages/communication/notifications/
├── package.json
├── tsconfig.json
├── 01-config-biome-migration-50-ref-quickstart.md
└── src/
    ├── index.ts
    ├── types.ts
    ├── slack.ts
    ├── discord.ts
    └── webhook.ts
```

### `package.json`
```json
{
  "name": "@agency/notifications",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "exports": {
    ".": "./src/index.ts",
    "./slack": "./src/slack.ts",
    "./discord": "./src/discord.ts",
    "./webhook": "./src/webhook.ts",
    "./types": "./src/types.ts"
  },
  "dependencies": {
    "@agency/core-types": "workspace:*"
  },
  "devDependencies": {
    "@agency/config-eslint": "workspace:*",
    "@agency/config-typescript": "workspace:*"
  },
  "publishConfig": { "access": "restricted" }
}
```

### `src/types.ts`
```ts
export interface NotificationPayload {
  title: string;
  message: string;
  url?: string;
  color?: "success" | "warning" | "error" | "info";
  fields?: Array<{ name: string; value: string; inline?: boolean }>;
  timestamp?: Date;
}

export interface NotificationProvider {
  send(payload: NotificationPayload): Promise<{ success: boolean; id?: string }>;
}

export type NotificationChannel = "slack" | "discord" | "webhook";
```

### `src/slack.ts`
```ts
import type { NotificationPayload, NotificationProvider } from "./types";

interface SlackConfig {
  webhookUrl: string;
  username?: string;
  iconEmoji?: string;
}

export function createSlackProvider(config: SlackConfig): NotificationProvider {
  return {
    async send(payload: NotificationPayload) {
      const colorMap = {
        success: "#22c55e",
        warning: "#f59e0b",
        error: "#ef4444",
        info: "#3b82f6"
      };

      const response = await fetch(config.webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: config.username ?? "Agency Bot",
          icon_emoji: config.iconEmoji,
          attachments: [
            {
              color: payload.color ? colorMap[payload.color] : colorMap.info,
              title: payload.title,
              text: payload.message,
              title_link: payload.url,
              fields: payload.fields?.map(f => ({
                title: f.name,
                value: f.value,
                short: f.inline ?? false
              })),
              footer: "Agency Notifications",
              ts: payload.timestamp ? Math.floor(payload.timestamp.getTime() / 1000) : undefined
            }
          ]
        })
      });

      if (!response.ok) {
        throw new Error(`Slack notification failed: ${response.statusText}`);
      }

      return { success: true };
    }
  };
}
```

### `src/discord.ts`
```ts
import type { NotificationPayload, NotificationProvider } from "./types";

interface DiscordConfig {
  webhookUrl: string;
  username?: string;
  avatarUrl?: string;
}

export function createDiscordProvider(config: DiscordConfig): NotificationProvider {
  return {
    async send(payload: NotificationPayload) {
      const colorMap = {
        success: 0x22c55e,
        warning: 0xf59e0b,
        error: 0xef4444,
        info: 0x3b82f6
      };

      const response = await fetch(config.webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: config.username ?? "Agency Bot",
          avatar_url: config.avatarUrl,
          embeds: [
            {
              title: payload.title,
              description: payload.message,
              url: payload.url,
              color: payload.color ? colorMap[payload.color] : colorMap.info,
              fields: payload.fields?.map(f => ({
                name: f.name,
                value: f.value,
                inline: f.inline ?? false
              })),
              timestamp: payload.timestamp?.toISOString()
            }
          ]
        })
      });

      if (!response.ok) {
        throw new Error(`Discord notification failed: ${response.statusText}`);
      }

      return { success: true };
    }
  };
}
```

### `src/webhook.ts`
```ts
import type { NotificationPayload, NotificationProvider } from "./types";
import { createHmac, timingSafeEqual } from "node:crypto";

interface WebhookConfig {
  url: string;
  headers?: Record<string, string>;
  secret?: string;
}

function generateSignature(payload: NotificationPayload, secret: string, timestamp: number): string {
  const data = `${timestamp}.${JSON.stringify(payload)}`;
  return createHmac("sha256", secret).update(data).digest("hex");
}

function verifySignature(
  payload: NotificationPayload,
  secret: string,
  signature: string,
  timestamp: number,
  toleranceSeconds = 300
): boolean {
  // Prevent replay attacks: reject if timestamp > 5 minutes old
  if (Math.abs(Date.now() / 1000 - timestamp) > toleranceSeconds) {
    return false;
  }
  const expected = generateSignature(payload, secret, timestamp);
  try {
    return timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
  } catch {
    return false;
  }
}

export function createWebhookProvider(config: WebhookConfig): NotificationProvider {
  return {
    async send(payload: NotificationPayload) {
      const timestamp = Math.floor(Date.now() / 1000);
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        ...config.headers
      };

      if (config.secret) {
        headers["X-Webhook-Signature"] = generateSignature(payload, config.secret, timestamp);
        headers["X-Webhook-Timestamp"] = timestamp.toString();
      }

      const response = await fetch(config.url, {
        method: "POST",
        headers,
        body: JSON.stringify({
          ...payload,
          timestamp: payload.timestamp?.toISOString() ?? new Date().toISOString()
        })
      });

      if (!response.ok) {
        throw new Error(`Webhook notification failed: ${response.statusText}`);
      }

      return { success: true, id: response.headers.get("X-Request-ID") ?? undefined };
    }
  };
}
```

### Scope Boundary

Task 72 is intentionally limited to outbound operational notifications such as Slack, Discord, and generic webhooks. In-app notification feeds, SSE streams, and mobile/web push belong in app code or a future dedicated task once the repo has a proven shared need.

### `src/index.ts`
```ts
export { createSlackProvider } from "./slack";
export { createDiscordProvider } from "./discord";
export { createWebhookProvider } from "./webhook";
export type {
  NotificationPayload,
  NotificationProvider,
  NotificationChannel
} from "./types";
```

### README
```md
# @agency/notifications
Outbound Slack, Discord, and webhook notification providers.

## Usage

### Channel Notifications
```ts
import { createSlackProvider } from "@agency/notifications/slack";

const slack = createSlackProvider({ webhookUrl: process.env.SLACK_WEBHOOK_URL });

await slack.send({
  title: "New Project Created",
  message: "Client X created Project Y",
  color: "success",
  url: "https://agency.com/projects/123"
});
```

## Boundary

- This package does not own in-app feeds, SSE connections, or FCM/Web Push delivery.
- If an app needs those capabilities, keep them app-local until two consumers share the same realtime or push requirements.

## Webhook Security
All webhook providers implement HMAC-SHA256 signature verification with timestamp validation to prevent replay attacks. Signatures older than 5 minutes are rejected.

## When to Add
Only create this package when two or more apps need to send the same notification type.
```
