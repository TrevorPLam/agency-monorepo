# Notifications QA Checklist

## Code Review Checklist

### Package Structure
- [ ] Package at `packages/communication/notifications/`
- [ ] `package.json` name: `@agency/notifications`
- [ ] Exports for Slack, Discord, webhook, SSE, FCM
- [ ] No external provider dependencies in package.json (bring your own)

### Provider Implementations
- [ ] Slack provider with webhook URL config
- [ ] Discord provider with webhook URL config
- [ ] Webhook provider with HMAC signature support
- [ ] SSE client and server implementations
- [ ] FCM provider with Firebase config

### Security
- [ ] HMAC-SHA256 signature generation
- [ ] Timestamp validation (5-minute window)
- [ ] timingSafeEqual comparison
- [ ] Replay attack prevention

## Testing Commands

```bash
# Install dependencies
pnpm install

# Run tests
pnpm test

# Type check
pnpm typecheck

# Build
pnpm build
```

## Integration Tests

```typescript
// Test Slack
import { createSlackProvider } from "@agency/notifications/slack";

async function testSlack() {
  const slack = createSlackProvider({
    webhookUrl: process.env.SLACK_WEBHOOK_URL
  });
  
  await slack.send({
    title: "Test Notification",
    message: "This is a test",
    color: "success",
    url: "https://example.com"
  });
  
  console.log("Slack notification sent");
}

// Test Webhook Security
import { createWebhookProvider } from "@agency/notifications/webhook";

async function testWebhookSecurity() {
  const provider = createWebhookProvider({
    url: "https://example.com/webhook",
    secret: "test-secret-32-chars-long"
  });
  
  // Send notification
  await provider.send({
    title: "Secure Test",
    message: "With signature",
    channel: "webhook"
  });
  
  console.log("Webhook sent with HMAC signature");
}

// Test SSE
import { createSSEConnection } from "@agency/notifications";

async function testSSE() {
  const connection = createSSEConnection({
    endpoint: "http://localhost:3000/api/notifications/stream",
    onMessage: (data) => {
      console.log("Received:", data);
    },
    onError: (err) => {
      console.error("SSE error:", err);
    }
  });
  
  // Close after test
  setTimeout(() => connection.close(), 5000);
}
```

## Pre-Release Verification

- [ ] Slack webhook tested
- [ ] Discord webhook tested
- [ ] Webhook HMAC signature verified
- [ ] Timestamp validation tested
- [ ] SSE connection tested
- [ ] FCM push tested (if configured)
- [ ] Two consumers validated for package creation
- [ ] Types compile
- [ ] CHANGELOG.md updated

## Security Checklist

- [ ] Secrets not committed
- [ ] HMAC implementation uses timingSafeEqual
- [ ] Timestamp validation prevents replays
- [ ] Secrets 32+ characters
- [ ] No secrets in logs
