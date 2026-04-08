# Email Service Implementation Prompt

## Task
Implement the `@agency/email-service` package with provider abstraction and queue support.

## Required Files

Create in `packages/communication/email-service/src/`:

### types.ts
```typescript
export interface EmailRecipient {
  email: string;
  name?: string;
}

export interface SendEmailOptions {
  to: EmailRecipient | EmailRecipient[];
  from: EmailRecipient;
  subject: string;
  html: string;
  text?: string;
  replyTo?: EmailRecipient;
  attachments?: Array<{
    filename: string;
    content: string | Buffer;
    contentType?: string;
  }>;
}

export interface EmailProvider {
  send(options: SendEmailOptions): Promise<{ id: string; success: boolean }>;
}

export interface QueuedEmailOptions extends SendEmailOptions {
  id?: string;
  delay?: number;
  attempts?: number;
}

export interface EmailQueue {
  add(email: QueuedEmailOptions): Promise<{ id: string }>;
}

export interface BounceEvent {
  type: "hard" | "soft" | "complaint" | "delivery";
  email: string;
  messageId: string;
  reason?: string;
  timestamp: string;
}
```

### providers/resend.ts
- Create Resend client from API key
- Implement `send()` method mapping to Resend API
- Format attachments as base64 if Buffer

### providers/postmark.ts
- Create Postmark ServerClient
- Implement `send()` method
- Handle Postmark-specific response format

### providers/brevo.ts
- Use `@getbrevo/brevo` SDK
- Create SendSmtpEmail instance
- Map fields correctly

### queue.ts
- Create BullMQ Queue with Redis connection
- Configure exponential backoff
- Set retry attempts to 5
- Implement `add()` method with delay support

### retry.ts
- Export `calculateRetryDelay()` function
- Export `RATE_LIMITS` object with provider limits

### send.ts
- Implement `createEmailService()` with provider selection
- Priority: Postmark > Brevo > Resend
- Export `sendTransactionalEmail()` helper

### index.ts
- Export all providers, queue, retry utilities
- Export all types

## Implementation Notes

1. **Provider Selection**: Check environment variables in order: POSTMARK_API_KEY, BREVO_API_KEY, RESEND_API_KEY
2. **Queue Mode**: Only create queue if Redis URL provided
3. **Error Handling**: Throw descriptive errors for provider failures
4. **Attachments**: Convert Buffers to base64 for Resend/Postmark

## Verification Steps

1. Configure environment variables (use Mailtrap for testing)
2. Test each provider independently
3. Verify provider switching works
4. Test queue mode with Redis
5. Verify rate limiting
6. Check retry logic with failed sends

## Exit Criteria

- [ ] All three providers send successfully
- [ ] Provider switching works without code changes
- [ ] Queue mode functional (if Redis available)
- [ ] Rate limits respected
- [ ] Retry logic with exponential backoff works
- [ ] Types compile and export correctly
