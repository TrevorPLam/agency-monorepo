# Notifications Implementation Prompt

## Task
Implement the `@agency/notifications` package with multi-channel notification providers.

## Required Files

Create in `packages/communication/notifications/src/`:

### types.ts
```typescript
export interface NotificationPayload {
  title: string;
  message: string;
  channel: NotificationChannel;
  timestamp?: Date;
  url?: string;
  color?: "success" | "warning" | "error" | "info";
  metadata?: Record<string, unknown>;
}

export interface NotificationProvider {
  send(payload: NotificationPayload): Promise<{ success: boolean; id?: string }>;
}

export type NotificationChannel = "slack" | "discord" | "webhook" | "sse" | "fcm";
```

### slack.ts
```typescript
import type { NotificationPayload, NotificationProvider } from "./types";

interface SlackConfig {
  webhookUrl: string;
}

export function createSlackProvider(config: SlackConfig): NotificationProvider {
  return {
    async send(payload: NotificationPayload) {
      const response = await fetch(config.webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: payload.title,
          attachments: [{
            color: payload.color === "success" ? "#22c55e" : 
                   payload.color === "error" ? "#ef4444" : "#3b82f6",
            text: payload.message,
            title: payload.title,
            title_link: payload.url
          }]
        })
      });
      
      if (!response.ok) throw new Error(`Slack error: ${response.statusText}`);
      return { success: true };
    }
  };
}
```

### discord.ts
Similar structure to Slack, use Discord embed format

### webhook.ts
Implement with HMAC-SHA256:
- Generate signature with timestamp + payload
- Include X-Webhook-Signature and X-Webhook-Timestamp headers
- Verify function available for consumers

### sse.ts
- Client-side `createSSEConnection()` with EventSource
- Server-side `createNotificationStream()` generator function
- Heartbeat/keepalive comments

### fcm.ts
- Firebase Cloud Messaging implementation
- Server key authentication
- Token-based targeting

### index.ts
Export all providers and types

## Implementation Notes

1. **Security First**: Webhook HMAC must use timingSafeEqual
2. **Timestamp Validation**: 5-minute window for replay prevention
3. **Optional Providers**: Don't import external SDKs, consumers pass them in
4. **SSE**: Prefer SSE over WebSockets for one-way notifications
5. **FCM**: Note that it's completely free but requires Firebase project

## Verification Steps

1. Test Slack webhook with test workspace
2. Test Discord webhook with test server
3. Verify HMAC signature with test webhook endpoint
4. Test timestamp rejection (>5 min old)
5. Test SSE connection with test stream
6. Verify all exports work from consuming package

## Exit Criteria

- [ ] Slack notifications send successfully
- [ ] Discord notifications send successfully
- [ ] Webhook HMAC signatures validated
- [ ] Timestamp validation prevents replays
- [ ] SSE client connects and receives messages
- [ ] FCM sends push notifications (if configured)
- [ ] Two consumers exist (required for package creation)
- [ ] All types compile and export
- [ ] Security audit passed (timingSafeEqual used)
