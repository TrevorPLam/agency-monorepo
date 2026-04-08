# Notifications Constraints

## Minimum Consumer Rule

**CRITICAL**: This package must NOT be created until:
- At least **2 consumers** genuinely need the same notification type
- Direct provider calls would cause code duplication

### When NOT to Create
- Single app calling one webhook directly
- Simple Slack/Discord notifications (call provider SDK directly)
- One-off integrations

### When to Create
- Multiple apps need Slack notifications with same formatting
- Webhook security patterns need standardization
- In-app notification center needed across multiple apps

## Security Constraints

### Webhook HMAC Requirements
All webhook implementations MUST:
- Use HMAC-SHA256 signature generation
- Include timestamp in signature payload
- Reject signatures older than 300 seconds (5 minutes)
- Use `crypto.timingSafeEqual` to prevent timing attacks

### Secret Management
- Webhook secrets: 32+ character random strings
- Secrets stored in environment variables only
- Never logged or exposed in error messages

## Provider-Specific Constraints

### Slack
- **Rate limit**: 1 message/second per webhook
- **Message size**: 40,000 characters maximum
- **Retry**: 3 attempts with exponential backoff
- **Error handling**: 403 = stop retrying; others = exponential backoff

### Discord
- **Rate limit**: 5 messages/second per webhook
- **Embed limits**: 10 embeds per message, 6000 characters total
- **File attachments**: 25MB maximum (with Nitro: 100MB)

### FCM (Firebase Cloud Messaging)
- **Cost**: Completely free (no usage limits as of 2026)
- **Token expiry**: iOS tokens can expire; implement token refresh
- **APNs dependency**: Requires Apple Developer account for iOS push

## In-App Notification Constraints

### Server-Sent Events (SSE)
- **Connection limit**: Browser default 6 connections per domain
- **Reconnection**: Client must implement exponential backoff reconnection
- **Heartbeat**: Server should send comment lines (`: ping`) every 30s to keep alive

### Notification Feed Data Model
```typescript
interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: Date;
  actionUrl?: string;
  metadata?: Record<string, unknown>;
}
```

### Retention Policy
- **Unread notifications**: 90 days
- **Read notifications**: 30 days
- **Archived/deleted**: Immediate hard delete (GDPR compliance)

## Scaling Constraints

### When to Escalate to Orchestration
Consider `72a-notifications-orchestration` (Knock/Novu) when:
- Notification workflows exceed 3 channels
- Complex branching logic required (if/then/else)
- Multi-step sequences (digest, delay, batch)
- Preference management complexity exceeds custom implementation

### Cost Breakpoints
| Volume | Webhooks (DIY) | Knock | Novu |
|--------|---------------|-------|------|
| <10k/mo | Free | $250/mo | Free tier |
| 100k/mo | Free | $250/mo | $200/mo |
| 1M/mo | Free | Custom | Enterprise |

## Real-Time Delivery Constraints

### SSE vs WebSocket Decision Matrix
| Factor | SSE | WebSocket |
|--------|-----|-----------|
| Direction | Server→Client only | Bidirectional |
| Protocol | HTTP (port 80/443) | ws/wss (custom port) |
| Reconnection | Built-in | Manual implementation |
| Use case | Notifications, updates | Chat, collaborative editing |

### FCM Delivery Reliability
- **Best effort**: FCM does not guarantee delivery
- **TTL**: Set appropriate time-to-live (default 4 weeks)
- **Priority**: Use `high` priority for critical notifications only

## Dependencies
```
@agency/core-types        - workspace:* (required)
@agency/email-service      - workspace:* (optional, for email notifications)
@slack/web-api            - latest (optional, for Slack)
bullmq                    - ^5.0.0 (optional, for queue workers)
```

## Exit Criteria
- [ ] HMAC signature verification implemented and tested
- [ ] At least 2 consumers validated
- [ ] Provider rate limiting respected
- [ ] Retry logic with exponential backoff functional
- [ ] SSE/FCM in-app delivery working (if implemented)
- [ ] Token refresh mechanism (FCM) implemented
