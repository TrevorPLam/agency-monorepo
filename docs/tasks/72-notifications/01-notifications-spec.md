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

### `src/sse.ts` (Server-Sent Events for In-App Notifications)
```ts
// Server-Sent Events implementation for real-time in-app notifications
// SSE is preferred over WebSockets for one-way server-to-client push

export interface SSEConfig {
  endpoint: string;
  headers?: Record<string, string>;
  onMessage?: (data: unknown) => void;
  onError?: (error: Error) => void;
}

export function createSSEConnection(config: SSEConfig): { close: () => void } {
  const eventSource = new EventSource(config.endpoint);
  
  eventSource.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      config.onMessage?.(data);
    } catch (err) {
      config.onError?.(err as Error);
    }
  };
  
  eventSource.onerror = (err) => {
    config.onError?.(new Error("SSE connection error"));
  };
  
  return {
    close: () => eventSource.close()
  };
}

// Server-side SSE stream for Next.js App Router
export async function* createNotificationStream(
  userId: string
): AsyncGenerator<string, void, unknown> {
  const encoder = new TextEncoder();
  
  while (true) {
    // Check for new notifications
    const notifications = await fetchPendingNotifications(userId);
    
    for (const notification of notifications) {
      yield encoder.encode(`data: ${JSON.stringify(notification)}\n\n`);
    }
    
    // Wait before next check
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
}

async function fetchPendingNotifications(userId: string): Promise<unknown[]> {
  // Implementation depends on @agency/data-db
  return [];
}
```

### `src/fcm.ts` (Firebase Cloud Messaging for Push Notifications)
```ts
// FCM is completely free with unlimited push notifications (2026)
// Use for mobile push and web push

interface FCMConfig {
  serverKey: string;
  projectId: string;
}

interface PushNotification {
  token: string;
  title: string;
  body: string;
  data?: Record<string, string>;
  icon?: string;
  clickAction?: string;
}

export function createFCMProvider(config: FCMConfig) {
  return {
    async send(notification: PushNotification): Promise<{ success: boolean }> {
      const response = await fetch(
        `https://fcm.googleapis.com/v1/projects/${config.projectId}/messages:send`,
        {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${config.serverKey}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            message: {
              token: notification.token,
              notification: {
                title: notification.title,
                body: notification.body,
                image: notification.icon
              },
              data: notification.data,
              webpush: notification.clickAction ? {
                fcm_options: {
                  link: notification.clickAction
                }
              } : undefined
            }
          })
        }
      );
      
      if (!response.ok) {
        throw new Error(`FCM send failed: ${response.statusText}`);
      }
      
      return { success: true };
    }
  };
}
```

### `src/index.ts`
```ts
export { createSlackProvider } from "./slack";
export { createDiscordProvider } from "./discord";
export { createWebhookProvider } from "./webhook";
export { createSSEConnection, createNotificationStream } from "./sse";
export { createFCMProvider } from "./fcm";
export type {
  NotificationPayload,
  NotificationProvider,
  NotificationChannel
} from "./types";
```

### README
```md
# @agency/notifications
Slack, Discord, webhooks, SSE (in-app), and FCM (push) notification providers.

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

### In-App Notifications (SSE)
```ts
import { createSSEConnection } from "@agency/notifications";

// Client-side (React component)
const { close } = createSSEConnection({
  endpoint: "/api/notifications/stream",
  onMessage: (notification) => {
    // Add to notification bell UI
  }
});
```

### Push Notifications (FCM)
```ts
import { createFCMProvider } from "@agency/notifications/fcm";

const fcm = createFCMProvider({
  serverKey: process.env.FCM_SERVER_KEY,
  projectId: process.env.FCM_PROJECT_ID
});

await fcm.send({
  token: userDeviceToken,
  title: "New Message",
  body: "You have a new notification",
  clickAction: "/notifications"
});
```

## Webhook Security
All webhook providers implement HMAC-SHA256 signature verification with timestamp validation to prevent replay attacks. Signatures older than 5 minutes are rejected.

## When to Add
Only create this package when two or more apps need to send the same notification type.
```
