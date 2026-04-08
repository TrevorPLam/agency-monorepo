# Email Service Constraints

## Deliverability Prerequisites (Non-Negotiable)

### Before ANY Production Email Sending
The following must be configured and verified:

1. **SPF Record** - `v=spf1 include:resend.com ~all` (or provider-specific)
2. **DKIM Signing** - 2048-bit key minimum; must pass validation
3. **DMARC Policy** - Start with `p=none` (monitoring), evolve to `p=quarantine`
4. **Domain Warm-up** - New domains: start with <100 emails/day, increase 20% weekly

### Authentication Requirements by Provider
| Provider | SPF | DKIM | DMARC |
|----------|-----|------|-------|
| Resend | Required | Required | Recommended |
| Postmark | Required | Auto-enabled | Recommended |
| Brevo | Required | Required | Required |

## Rate Limits (Hard Constraints)

### Provider Rate Limits (April 2026)
| Provider | Free Tier | Paid Tier | Burst Handling |
|----------|-----------|-----------|----------------|
| Resend | 5 req/s | 100 req/s | Exponential backoff required |
| Postmark | 5 req/s | 100 req/s | Exponential backoff required |
| Brevo | 10 req/s | 200 req/s | Exponential backoff required |

### Queue Mode Triggers
- **High volume**: >1,000 emails/day requires BullMQ queue
- **Burst sending**: >50 emails/minute requires queue with rate limiting
- **Scheduled sends**: Any delayed email requires queue

## Bounce Rate Limits
- **Hard bounces**: Immediately suppress email addresses
- **Soft bounces**: Retry 3x over 72 hours, then suppress
- **Critical threshold**: >5% bounce rate = **PROVIDER SUSPENSION RISK**
- **Target**: Maintain <2% bounce rate

## Data Retention (GDPR Compliance)
- **Sent email logs**: 30 days (default), configurable
- **Failed attempts**: 90 days for debugging
- **Bounce records**: 1 year for reputation management
- **Right to erasure**: Must support deletion of user email history on request

## Security Constraints
- **API keys**: Never commit to repository; use environment variables
- **Webhook endpoints**: Must verify HMAC signatures
- **TLS**: All provider connections require TLS 1.2+

## Provider Selection Matrix

### Default Choice: Resend
- Developer-friendly API
- 3,000 emails/mo free tier
- React Email integration

### Upgrade to Postmark When:
- Deliverability to enterprise inboxes is critical
- Need message streams (transactional vs broadcast separation)
- Require inbound email processing

### Choose Brevo When:
- Marketing + transactional blend needed
- Budget constraints (lower paid tier entry)
- SMS/WhatsApp integration required

## Queue Configuration
```typescript
// BullMQ defaults for email queue
{
  attempts: 5,
  backoff: {
    type: 'exponential',
    delay: 2000  // 2s, 4s, 8s, 16s, 32s
  },
  removeOnComplete: 100,
  removeOnFail: 50
}
```

## Dependencies
```
@agency/email-templates   - workspace:* (required)
@agency/core-types        - workspace:* (required)
resend                   - latest
postmark                 - 4.0.7
@getbrevo/brevo          - latest (optional)
bullmq                   - ^5.0.0 (optional, for queue mode)
ioredis                  - ^5.0.0 (required if bullmq used)
```

## Exit Criteria
- [ ] SPF/DKIM/DMARC configured and verified
- [ ] At least one provider successfully sending
- [ ] Bounce webhook handler implemented
- [ ] Rate limiting tested and functional
- [ ] Queue mode working (if high volume)
- [ ] Retry logic with exponential backoff verified
