# Email Bounce Handling Guide

## Bounce Types

### Hard Bounces (Permanent Failures)
- Invalid email address
- Domain doesn't exist
- Recipient server rejects all mail
- **Action**: Immediately suppress, never retry

### Soft Bounces (Temporary Failures)
- Mailbox full
- Server temporarily unavailable
- Message too large
- **Action**: Retry 3x over 72 hours

### Complaints (Spam Reports)
- Recipient clicked "Report Spam"
- **Action**: Immediately suppress globally
- **Target**: <0.1% complaint rate

## Webhook Setup

### Resend Bounce Webhook
```typescript
// app/api/webhooks/resend/route.ts
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  const event = await req.json();
  
  switch (event.type) {
    case "email.bounced":
      await handleBounce({
        email: event.data.to,
        type: event.data.bounceType, // "hard" | "soft"
        reason: event.data.bounceDescription,
        messageId: event.data.emailId
      });
      break;
      
    case "email.complained":
      await handleComplaint({
        email: event.data.to,
        messageId: event.data.emailId
      });
      break;
      
    case "email.delivered":
      await markDelivered(event.data.emailId);
      break;
  }
  
  return new Response("OK");
}

async function handleBounce({ email, type, reason }: BounceEvent) {
  if (type === "hard") {
    // Immediately suppress
    await db.suppressedEmails.create({
      email,
      reason,
      suppressedAt: new Date()
    });
    
    console.warn(`Hard bounce: ${email} - ${reason}`);
  } else {
    // Soft bounce: increment counter
    await db.emailBounces.increment(email);
    
    const count = await db.emailBounces.getCount(email);
    if (count >= 3) {
      await db.suppressedEmails.create({
        email,
        reason: `Soft bounce limit exceeded: ${reason}`,
        suppressedAt: new Date()
      });
    }
  }
}

async function handleComplaint({ email }: { email: string }) {
  // Global suppression
  await db.suppressedEmails.create({
    email,
    reason: "Spam complaint",
    suppressedAt: new Date(),
    global: true
  });
  
  // Alert admin
  await sendAdminAlert(`Spam complaint from ${email}`);
}
```

## Suppression List Management

### Database Schema
```typescript
// packages/data/db/src/schema/suppressions.ts
export const suppressedEmails = pgTable("suppressed_emails", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  reason: text("reason").notNull(),
  suppressedAt: timestamp("suppressed_at").defaultNow(),
  global: boolean("global").default(false), // true = all clients
  clientId: uuid("client_id").references(() => clients.id),
  createdAt: timestamp("created_at").defaultNow()
});
```

### Pre-Send Check
```typescript
// In email service before sending
async function canSend(email: string, clientId: string): Promise<boolean> {
  const suppressed = await db.suppressedEmails.findFirst({
    where: {
      email,
      OR: [
        { global: true },
        { clientId }
      ]
    }
  });
  
  return !suppressed;
}
```

## Monitoring & Alerts

### Bounce Rate Monitoring
```typescript
// Run daily
async function checkBounceRate() {
  const stats = await db.sentEmails.getStats({
    since: new Date(Date.now() - 24 * 60 * 60 * 1000)
  });
  
  const bounceRate = stats.bounced / stats.total;
  
  if (bounceRate > 0.05) {
    // 5% threshold = provider suspension risk
    await sendAdminAlert(
      `CRITICAL: Bounce rate ${(bounceRate * 100).toFixed(1)}% - ` +
      `Risk of provider suspension`
    );
  } else if (bounceRate > 0.02) {
    // 2% threshold = warning
    await sendAdminAlert(
      `WARNING: Bounce rate ${(bounceRate * 100).toFixed(1)}% - ` +
      `Review list hygiene`
    );
  }
}
```

### Complaint Rate Monitoring
```typescript
async function checkComplaintRate() {
  const stats = await db.sentEmails.getStats({
    since: new Date(Date.now() - 24 * 60 * 60 * 1000)
  });
  
  const complaintRate = stats.complaints / stats.total;
  
  if (complaintRate > 0.001) {
    // 0.1% threshold
    await sendAdminAlert(
      `CRITICAL: Complaint rate ${(complaintRate * 100).toFixed(2)}% - ` +
      `Immediate action required`
    );
  }
}
```

## List Hygiene Best Practices

### Double Opt-In
```typescript
// After signup, send confirmation email
async function sendDoubleOptIn(email: string) {
  const token = generateToken();
  
  await db.pendingConfirmations.create({
    email,
    token,
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
  });
  
  await sendEmail({
    to: email,
    template: "confirm-subscription",
    data: { confirmUrl: `/confirm?token=${token}` }
  });
}
```

### Re-Engagement Campaigns
```typescript
// For inactive subscribers (no opens in 90 days)
async function sendReEngagement(email: string) {
  await sendEmail({
    to: email,
    template: "re-engagement",
    data: {
      keepUrl: `/keep-subscribed?token=${token}`,
      unsubscribeUrl: `/unsubscribe?token=${token}`
    }
  });
  
  // Wait 7 days, then suppress if no action
  await scheduleSuppression(email, 7 * 24 * 60 * 60 * 1000);
}
```

## Dashboard Metrics

Track these metrics in your admin dashboard:

| Metric | Target | Alert Threshold |
|--------|--------|-----------------|
| Bounce Rate | <2% | >5% |
| Complaint Rate | <0.1% | >0.3% |
| Delivery Rate | >95% | <90% |
| List Growth | Positive | Negative 30 days |

## References
- [Resend Webhooks](https://resend.com/docs/dashboard/webhooks/introduction)
- [Postmark Bounce Webhook](https://postmarkapp.com/developer/webhooks/bounce-webhook)
- [Email Deliverability Best Practices](https://mailchimp.com/resources/email-deliverability/)
