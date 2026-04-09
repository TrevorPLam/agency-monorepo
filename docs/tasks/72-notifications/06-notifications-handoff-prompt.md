# Notifications Implementation Prompt

## Task
Implement the `@agency/notifications` package for outbound operational notifications via Slack, Discord, and generic webhooks.

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

export type NotificationChannel = "slack" | "discord" | "webhook";
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

### index.ts
Export all providers and types

## Implementation Notes

1. **Security First**: Webhook HMAC must use timingSafeEqual
2. **Timestamp Validation**: 5-minute window for replay prevention
3. **Optional Providers**: Don't import external SDKs, consumers pass them in
4. **Scope Control**: Do not add in-app feeds, SSE, WebSockets, or mobile/web push support

## Verification Steps

1. Test Slack webhook with test workspace
2. Test Discord webhook with test server
3. Verify HMAC signature with test webhook endpoint
4. Test timestamp rejection (>5 min old)
5. Verify all exports work from consuming package

## Exit Criteria

- [ ] Slack notifications send successfully
- [ ] Discord notifications send successfully
- [ ] Webhook HMAC signatures validated
- [ ] Timestamp validation prevents replays
- [ ] Two consumers exist (required for package creation)
- [ ] All types compile and export
- [ ] Security audit passed (timingSafeEqual used)
