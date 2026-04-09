# 71-email-service: Implementation Specification

## Task Header

| Field | Value |
|-------|-------|
| **State** | `conditional` — Package-controlled, opt-in only |
| **Trigger** | App requires transactional email delivery |
| **Minimum Consumers** | 1+ apps explicitly requesting email delivery |
| **Dependencies** | `resend@6.10.0`, `postmark@4.0.7`, `@getbrevo/brevo@5.0.3`, `@agency/email-templates` |
| **Exit Criteria** | Email service exported and integrated in at least one app |
| **Implementation Authority** | `REPO-STATE.md` — Conditional; requires explicit app-level opt-in |
| **Version Authority** | `DEPENDENCY.md` §6 — `resend@6.10.0`, `postmark@4.0.7`, `@getbrevo/brevo@5.0.3` |
| **Supersedes** | n/a |
| **Superseded by** | n/a |

**Cross-references:**
- Decision status: `DECISION-STATUS.md` — Email service `open` (vendor TBD during Task 71)
- Version pins: `DEPENDENCY.md` §6
- Architecture: `ARCHITECTURE.md` — Communication layer section
- Dependency-truth policy: `docs/standards/dependency-truth.md`
- Note: Email delivery is optional; requires React Email templates first

## Files
```
packages/communication/email-service/
├── package.json
├── tsconfig.json
├── README.md
└── src/
    ├── index.ts
    ├── types.ts
    ├── queue.ts
    ├── retry.ts
    ├── providers/
    │   ├── resend.ts
    │   ├── postmark.ts
    │   └── brevo.ts
    └── send.ts
```

### `package.json`
```json
{
  "name": "@agency/email-service",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "exports": {
    ".": "./src/index.ts",
    "./types": "./src/types.ts",
    "./send": "./src/send.ts"
  },
  "dependencies": {
    "@agency/email-templates": "workspace:*",
    "resend": "6.10.0",
    "postmark": "4.0.7",
    "@getbrevo/brevo": "5.0.3",
    "bullmq": "5.73.3",
    "ioredis": "5.10.1"
  },
  "devDependencies": {
    "@agency/config-eslint": "workspace:*",
    "@agency/config-typescript": "workspace:*"
  },
  "publishConfig": { "access": "restricted" }
}
```

### `src/types.ts`
```ts
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

export type EmailTemplate = "welcome" | "password-reset" | "invoice-receipt" | "notification-digest";

export interface QueuedEmailOptions extends SendEmailOptions {
  id?: string;
  delay?: number;
  attempts?: number;
}

export interface EmailQueue {
  add(email: QueuedEmailOptions): Promise<{ id: string }>;
}

// Bounce event types for webhook handling
export interface BounceEvent {
  type: "hard" | "soft" | "complaint" | "delivery";
  email: string;
  messageId: string;
  reason?: string;
  timestamp: string;
}
```

### `src/providers/resend.ts`
```ts
import { Resend } from "resend";
import type { EmailProvider, SendEmailOptions } from "../types";

export function createResendProvider(apiKey: string): EmailProvider {
  const resend = new Resend(apiKey);

  return {
    async send(options: SendEmailOptions) {
      const { data, error } = await resend.emails.send({
        from: formatAddress(options.from),
        to: formatRecipients(options.to),
        subject: options.subject,
        html: options.html,
        text: options.text,
        reply_to: options.replyTo ? formatAddress(options.replyTo) : undefined,
        attachments: options.attachments?.map(att => ({
          filename: att.filename,
          content: att.content instanceof Buffer ? att.content.toString("base64") : att.content
        }))
      });

      if (error) throw new Error(`Resend error: ${error.message}`);
      return { id: data?.id ?? "unknown", success: true };
    }
  };
}

function formatAddress(r: { email: string; name?: string }): string {
  return r.name ? `${r.name} <${r.email}>` : r.email;
}

function formatRecipients(r: SendEmailOptions["to"]): string | string[] {
  if (Array.isArray(r)) return r.map(formatAddress);
  return formatAddress(r);
}
```

### `src/providers/postmark.ts`
```ts
import postmark from "postmark";
import type { EmailProvider, SendEmailOptions } from "../types";

export function createPostmarkProvider(apiKey: string): EmailProvider {
  const client = new postmark.ServerClient(apiKey);

  return {
    async send(options: SendEmailOptions) {
      const result = await client.sendEmail({
        From: formatAddress(options.from),
        To: formatRecipients(options.to),
        Subject: options.subject,
        HtmlBody: options.html,
        TextBody: options.text,
        ReplyTo: options.replyTo ? formatAddress(options.replyTo) : undefined,
        Attachments: options.attachments?.map(att => ({
          Name: att.filename,
          Content: att.content instanceof Buffer ? att.content.toString("base64") : att.content,
          ContentType: att.contentType ?? "application/octet-stream"
        }))
      });

      return { id: result.MessageID, success: result.ErrorCode === 0 };
    }
  };
}

function formatAddress(r: { email: string; name?: string }): string {
  return r.name ? `${r.name} <${r.email}>` : r.email;
}

function formatRecipients(r: SendEmailOptions["to"]): string {
  if (Array.isArray(r)) return r.map(formatAddress).join(", ");
  return formatAddress(r);
}
```

### `src/providers/brevo.ts`
```ts
import { TransactionalEmailsApi, SendSmtpEmail } from "@getbrevo/brevo";
import type { EmailProvider, SendEmailOptions } from "../types";

export function createBrevoProvider(apiKey: string): EmailProvider {
  const api = new TransactionalEmailsApi();
  api.setApiKey(0, apiKey); // 0 = api-key

  return {
    async send(options: SendEmailOptions) {
      const sendSmtpEmail = new SendSmtpEmail();
      sendSmtpEmail.subject = options.subject;
      sendSmtpEmail.htmlContent = options.html;
      sendSmtpEmail.textContent = options.text;
      sendSmtpEmail.sender = { email: options.from.email, name: options.from.name };
      sendSmtpEmail.to = formatRecipientsBrevo(options.to);
      
      if (options.replyTo) {
        sendSmtpEmail.replyTo = { email: options.replyTo.email, name: options.replyTo.name };
      }

      const result = await api.sendTransacEmail(sendSmtpEmail);
      return { id: result.messageId ?? "unknown", success: true };
    }
  };
}

function formatRecipientsBrevo(r: SendEmailOptions["to"]): Array<{ email: string; name?: string }> {
  if (Array.isArray(r)) return r;
  return [r];
}
```

### `src/queue.ts`
```ts
import { Queue } from "bullmq";
import Redis from "ioredis";
import type { QueuedEmailOptions, EmailQueue } from "./types";

interface EmailJobData extends QueuedEmailOptions {
  provider: "resend" | "postmark" | "brevo";
}

export function createEmailQueue(redisUrl: string): EmailQueue {
  const queue = new Queue<EmailJobData>("email-queue", {
    connection: new Redis(redisUrl),
    defaultJobOptions: {
      attempts: 5,
      backoff: {
        type: "exponential",
        delay: 2000 // Initial delay 2s, then 4s, 8s, 16s, 32s
      },
      removeOnComplete: 100,
      removeOnFail: 50
    }
  });

  return {
    async add(email: QueuedEmailOptions) {
      const job = await queue.add("send-email", email as EmailJobData, {
        delay: email.delay,
        attempts: email.attempts ?? 5
      });
      return { id: job.id ?? "unknown" };
    }
  };
}
```

### `src/retry.ts`
```ts
// Exponential backoff with jitter for rate limit handling
export function calculateRetryDelay(attempt: number, baseDelayMs = 2000): number {
  const exponentialDelay = baseDelayMs * Math.pow(2, attempt - 1);
  const jitter = Math.random() * 0.1 * exponentialDelay; // 0-10% jitter
  return Math.min(exponentialDelay + jitter, 60000); // Cap at 60s
}

// Provider-specific rate limits (April 2026)
export const RATE_LIMITS = {
  resend: { free: 5, paid: 100 },      // requests per second
  postmark: { free: 5, paid: 100 },  // requests per second
  brevo: { free: 10, paid: 200 }     // requests per second
} as const;
```

### `src/send.ts`
```ts
import { createResendProvider } from "./providers/resend";
import { createPostmarkProvider } from "./providers/postmark";
import { createBrevoProvider } from "./providers/brevo";
import type { EmailProvider, SendEmailOptions } from "./types";

export interface EmailServiceConfig {
  resendApiKey?: string;
  postmarkApiKey?: string;
  brevoApiKey?: string;
  defaultFrom: { email: string; name: string };
  redisUrl?: string; // Required for queue mode
}

export function createEmailService(config: EmailServiceConfig): EmailProvider {
  // Provider priority: Postmark > Brevo > Resend (default)
  const provider = config.postmarkApiKey
    ? createPostmarkProvider(config.postmarkApiKey)
    : config.brevoApiKey
      ? createBrevoProvider(config.brevoApiKey)
      : createResendProvider(config.resendApiKey ?? "");

  return {
    async send(options: SendEmailOptions) {
      return provider.send({
        ...options,
        from: options.from ?? config.defaultFrom
      });
    }
  };
}

export async function sendTransactionalEmail(
  config: EmailServiceConfig,
  options: SendEmailOptions
) {
  const service = createEmailService(config);
  return service.send(options);
}
```

### `src/index.ts`
```ts
export { createEmailService, sendTransactionalEmail } from "./send";
export { createResendProvider } from "./providers/resend";
export { createPostmarkProvider } from "./providers/postmark";
export { createBrevoProvider } from "./providers/brevo";
export { createEmailQueue } from "./queue";
export { calculateRetryDelay, RATE_LIMITS } from "./retry";
export type {
  EmailRecipient,
  SendEmailOptions,
  EmailProvider,
  EmailTemplate,
  QueuedEmailOptions,
  EmailQueue,
  BounceEvent
} from "./types";
```

### README
```md
# @agency/email-service
Send-layer abstraction over Resend (default) and Postmark (premium).
## Usage
```ts
import { createEmailService } from "@agency/email-service";
import { render } from "@react-email/components";
import { WelcomeEmail } from "@agency/email-templates/welcome";

const email = createEmailService({
  resendApiKey: process.env.RESEND_API_KEY,
  defaultFrom: { email: "noreply@agency.com", name: "Agency" }
});

const html = await render(<WelcomeEmail name="John" loginUrl="..." />);
await email.send({
  to: { email: "john@example.com", name: "John" },
  subject: "Welcome",
  html
});
```
## Provider Selection
Priority order (environment variable check):
1. `POSTMARK_API_KEY` → Postmark (premium deliverability)
2. `BREVO_API_KEY` → Brevo (marketing + transactional blend)
3. `RESEND_API_KEY` → Resend (default, developer-friendly)

Zero application code changes required to switch providers.

## Queue Mode (High Volume)
For high-volume sending, use the queue interface with BullMQ:
```ts
import { createEmailQueue } from "@agency/email-service";

const queue = createEmailQueue(process.env.REDIS_URL);
await queue.add({
  to: { email: "user@example.com", name: "User" },
  subject: "Welcome",
  html: renderedTemplate,
  delay: 5000, // Optional: delay 5 seconds
  attempts: 5  // Retry up to 5 times with exponential backoff
});
```

## Rate Limiting
Built-in exponential backoff for provider rate limits:
- Resend: 5 req/s (free), 100 req/s (paid)
- Postmark: 5 req/s (free), 100 req/s (paid)
- Brevo: 10 req/s (free), 200 req/s (paid)
```
