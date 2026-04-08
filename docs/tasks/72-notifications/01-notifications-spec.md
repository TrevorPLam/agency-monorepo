# Notifications Specification

## Files
```
packages/communication/notifications/
├── package.json
├── tsconfig.json
├── README.md
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

interface WebhookConfig {
  url: string;
  headers?: Record<string, string>;
  secret?: string;
}

export function createWebhookProvider(config: WebhookConfig): NotificationProvider {
  return {
    async send(payload: NotificationPayload) {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        ...config.headers
      };

      if (config.secret) {
        headers["X-Webhook-Signature"] = generateSignature(payload, config.secret);
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

function generateSignature(payload: NotificationPayload, secret: string): string {
  // In production, use crypto.subtle or node:crypto for HMAC
  return `sha256=${secret.slice(0, 16)}`;
}
```

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
Slack, Discord, and generic webhook notification providers.
## Usage
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
## When to Add
Only create this package when two or more apps need to send the same notification type.
```
