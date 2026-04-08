# 71-email-service/00-package: Email Service

## Purpose
Send-layer abstraction over Resend and Postmark. Apps call `sendEmail()` without knowing which provider handles delivery.

## Files
```
packages/communication/email-service/
├── package.json
├── tsconfig.json
├── README.md
└── src/
    ├── index.ts
    ├── types.ts
    ├── providers/
    │   ├── resend.ts
    │   └── postmark.ts
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
    "resend": "latest",
    "postmark": "4.0.7"
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

### `src/send.ts`
```ts
import { createResendProvider } from "./providers/resend";
import { createPostmarkProvider } from "./providers/postmark";
import type { EmailProvider, SendEmailOptions } from "./types";

export interface EmailServiceConfig {
  resendApiKey?: string;
  postmarkApiKey?: string;
  defaultFrom: { email: string; name: string };
}

export function createEmailService(config: EmailServiceConfig): EmailProvider {
  const provider = config.postmarkApiKey
    ? createPostmarkProvider(config.postmarkApiKey)
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
export type {
  EmailRecipient,
  SendEmailOptions,
  EmailProvider,
  EmailTemplate
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
- If `POSTMARK_API_KEY` is set, Postmark is used
- Otherwise Resend is used
- Zero application code changes required to switch
```
