# Email Service QA Checklist

## Code Review Checklist

### Package Structure
- [ ] Package at `packages/communication/email-service/`
- [ ] `package.json` name: `@agency/email-service`
- [ ] Exports for providers, queue, retry utilities
- [ ] Dependencies include `resend`, `postmark`, `@getbrevo/brevo`, `bullmq`, `ioredis`

### Provider Implementation
- [ ] Resend provider implemented
- [ ] Postmark provider implemented
- [ ] Brevo provider implemented
- [ ] Provider selection logic (Postmark > Brevo > Resend)
- [ ] Format helpers for addresses and recipients

### Queue Implementation (if high volume)
- [ ] BullMQ Queue created for email sending
- [ ] Worker processes jobs
- [ ] Rate limiting configured per provider
- [ ] Exponential backoff for retries
- [ ] Failed job handling

### Retry Logic
- [ ] Exponential backoff with jitter implemented
- [ ] Maximum retry attempts configured
- [ ] Provider-specific rate limits documented

## Testing Commands

```bash
# Install dependencies
pnpm install

# Run unit tests
pnpm test

# Run integration tests (requires API keys)
pnpm test:integration

# Type check
pnpm typecheck

# Build
pnpm build
```

## Integration Tests

```typescript
// Test provider switching
import { createEmailService } from "@agency/email-service";

async function testProviders() {
  // Test Resend (default)
  const resendService = createEmailService({
    resendApiKey: process.env.RESEND_API_KEY,
    defaultFrom: { email: "test@agency.com", name: "Test" }
  });
  
  const result1 = await resendService.send({
    to: { email: "user@example.com", name: "User" },
    subject: "Test",
    html: "<p>Test</p>"
  });
  console.assert(result1.success, "Resend send failed");
  
  // Test Postmark
  const postmarkService = createEmailService({
    postmarkApiKey: process.env.POSTMARK_API_KEY,
    defaultFrom: { email: "test@agency.com", name: "Test" }
  });
  
  const result2 = await postmarkService.send({
    to: { email: "user@example.com", name: "User" },
    subject: "Test",
    html: "<p>Test</p>"
  });
  console.assert(result2.success, "Postmark send failed");
  
  console.log("All providers working!");
}

// Test queue
import { createEmailQueue } from "@agency/email-service";

async function testQueue() {
  const queue = createEmailQueue(process.env.REDIS_URL);
  
  const job = await queue.add({
    to: { email: "test@example.com", name: "Test" },
    subject: "Queued Test",
    html: "<p>Queued</p>",
    delay: 5000
  });
  
  console.assert(job.id, "Job creation failed");
  console.log("Queue working!");
}
```

## Pre-Release Verification

- [ ] All three providers tested
- [ ] Queue mode tested (if implemented)
- [ ] Bounce webhook handler reviewed
- [ ] Rate limiting verified
- [ ] Retry logic tested
- [ ] Environment variables documented
- [ ] CHANGELOG.md updated
- [ ] Version bumped

## Security Checklist

- [ ] API keys not committed to repo
- [ ] Environment variables used
- [ ] No secrets logged
- [ ] Webhook signature verification implemented
