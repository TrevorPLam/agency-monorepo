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

## Scope Boundary

This task is limited to outbound operational notifications. In-app feeds, SSE streams, and mobile/web push are outside the baseline scope and remain app-level concerns until a dedicated shared task is justified.

## Dependencies
```
@agency/core-types        - workspace:* (required)
@agency/email-service      - workspace:* (optional, for email notifications)
@slack/web-api            - 7.15.0 (optional, for Slack)
bullmq                    - 5.73.3 (optional, for queue workers)
```

## Exit Criteria
- [ ] HMAC signature verification implemented and tested
- [ ] At least 2 consumers validated
- [ ] Provider rate limiting respected
- [ ] Retry logic with exponential backoff functional
- [ ] Outbound provider adapters validated for Slack, Discord, or webhooks as required
