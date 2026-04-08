# Email Queue Implementation Guide

## When to Use Queue Mode

Use BullMQ queue when:
- Sending >1,000 emails/day
- Burst sending >50 emails/minute
- Scheduled/delayed email sends
- Need retry logic for failures

## Quick Start

### 1. Install Dependencies
```bash
pnpm add bullmq ioredis
```

### 2. Set Up Redis
```bash
# Local development
docker run -d -p 6379:6379 redis:alpine

# Production: Use Redis Cloud, Upstash, or AWS ElastiCache
```

### 3. Create Queue Worker
```typescript
// packages/communication/email-service/src/worker.ts
import { Worker } from "bullmq";
import { createEmailService } from "./send";
import type { QueuedEmailOptions } from "./types";

const emailService = createEmailService({
  resendApiKey: process.env.RESEND_API_KEY,
  defaultFrom: { email: "noreply@agency.com", name: "Agency" }
});

export const emailWorker = new Worker<QueuedEmailOptions>(
  "email-queue",
  async (job) => {
    console.log(`Sending email ${job.id}: ${job.data.subject}`);
    
    try {
      const result = await emailService.send(job.data);
      console.log(`Email sent: ${result.id}`);
      return result;
    } catch (error) {
      console.error(`Failed to send email ${job.id}:`, error);
      throw error; // BullMQ will retry based on job options
    }
  },
  {
    connection: new Redis(process.env.REDIS_URL),
    concurrency: 5, // Process 5 jobs concurrently
    limiter: {
      max: 5, // Resend free tier: 5 req/s
      duration: 1000
    }
  }
);

// Graceful shutdown
process.on("SIGTERM", async () => {
  await emailWorker.close();
});
```

### 4. Queue Emails
```typescript
import { createEmailQueue } from "@agency/email-service";

const queue = createEmailQueue(process.env.REDIS_URL);

// Immediate send
await queue.add({
  to: { email: "user@example.com", name: "User" },
  subject: "Welcome",
  html: renderedTemplate
});

// Delayed send (schedule for tomorrow)
const tomorrow = new Date();
tomorrow.setDate(tomorrow.getDate() + 1);

await queue.add({
  to: { email: "user@example.com", name: "User" },
  subject: "Reminder",
  html: reminderTemplate
}, {
  delay: tomorrow.getTime() - Date.now()
});
```

## Monitoring

### Queue Dashboard
```bash
# Install BullMQ dashboard
pnpm add @bull-board/express

# View at http://localhost:3000/admin/queues
```

### Key Metrics
- Queue depth (should be < 1000)
- Processing rate (should match provider limits)
- Failed job count (should be < 1%)
- Average job duration (should be < 5s)

## Retry Strategy

Default retry configuration:
```typescript
{
  attempts: 5,
  backoff: {
    type: "exponential",
    delay: 2000  // 2s, 4s, 8s, 16s, 32s
  }
}
```

### Handling Permanent Failures
```typescript
emailWorker.on("failed", async (job, err) => {
  if (job.attemptsMade >= 5) {
    // Log to monitoring
    console.error(`Email permanently failed after 5 retries`, {
      jobId: job.id,
      error: err.message,
      recipient: job.data.to
    });
    
    // Add to suppression list if hard bounce
    if (err.message.includes("bounce")) {
      await addToSuppressionList(job.data.to.email);
    }
  }
});
```

## Rate Limiting by Provider

Adjust concurrency based on provider:

```typescript
// Resend Free: 5 req/s
concurrency: 5,
limiter: { max: 5, duration: 1000 }

// Resend Paid: 100 req/s
concurrency: 20,
limiter: { max: 100, duration: 1000 }

// Postmark: 100 req/s
concurrency: 20,
limiter: { max: 100, duration: 1000 }
```

## Production Deployment

### Docker Compose
```yaml
version: "3.8"
services:
  redis:
    image: redis:alpine
    ports:
      - "6379:6379"
  
  email-worker:
    build: .
    environment:
      - REDIS_URL=redis://redis:6379
      - RESEND_API_KEY=${RESEND_API_KEY}
    depends_on:
      - redis
```

### Environment Variables
```bash
# Required
REDIS_URL=redis://localhost:6379
RESEND_API_KEY=re_xxx

# Optional
EMAIL_WORKER_CONCURRENCY=5
EMAIL_RATE_LIMIT_MAX=5
EMAIL_RATE_LIMIT_DURATION=1000
```

## Troubleshooting

### Jobs Stuck in Queue
1. Check worker is running: `ps aux | grep worker`
2. Check Redis connection: `redis-cli ping`
3. Check for errors in worker logs

### Rate Limit Errors
1. Verify concurrency < provider limit
2. Check limiter configuration
3. Consider upgrading provider plan

### Memory Leaks
1. Ensure `job.removeOnComplete` is set
2. Monitor Redis memory usage
3. Set `removeOnFail` to prevent accumulation
