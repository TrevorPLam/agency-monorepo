# 70-email-templates/00-package: Shared Email Templates

## Purpose
React Email templates and reusable layout components. Transactional receipts, password resets, notification digests, welcome emails.

## Files
```
packages/communication/email-templates/
├── package.json
├── tsconfig.json
├── README.md
└── src/
    ├── index.ts
    ├── layouts/
    │   └── base.tsx
    └── templates/
        ├── welcome.tsx
        ├── password-reset.tsx
        └── invoice-receipt.tsx
```

### `package.json`
```json
{
  "name": "@agency/email-templates",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "exports": {
    ".": "./src/index.ts",
    "./welcome": "./src/templates/welcome.tsx",
    "./password-reset": "./src/templates/password-reset.tsx",
    "./invoice-receipt": "./src/templates/invoice-receipt.tsx",
    "./layouts/base": "./src/layouts/base.tsx"
  },
  "dependencies": {
    "@agency/core-types": "workspace:*",
    "@react-email/components": "1.0.10",
    "react": "^19.0.0",
    "react-dom": "^19.0.0"
  },
  "devDependencies": {
    "@agency/config-eslint": "workspace:*",
    "@agency/config-typescript": "workspace:*",
    "react-email": "latest"
  },
  "publishConfig": { "access": "restricted" }
}
```

### `src/layouts/base.tsx`
```tsx
import { Html, Head, Preview, Body, Container, Section, Text } from "@react-email/components";

interface BaseLayoutProps {
  preview: string;
  children: React.ReactNode;
}

export function BaseLayout({ preview, children }: BaseLayoutProps) {
  return (
    <Html>
      <Head />
      <Preview>{preview}</Preview>
      <Body style={{ backgroundColor: "#f9fafb", margin: 0, padding: 0 }}>
        <Container style={{ maxWidth: "600px", margin: "0 auto", padding: "24px" }}>
          <Section style={{ backgroundColor: "#ffffff", borderRadius: "8px", padding: "32px" }}>
            {children}
          </Section>
          <Text style={{ color: "#6b7280", fontSize: "12px", textAlign: "center", marginTop: "24px" }}>
            Sent by Agency Name
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
```

### `src/templates/welcome.tsx`
```tsx
import { Heading, Text, Button } from "@react-email/components";
import { BaseLayout } from "../layouts/base";

interface WelcomeEmailProps {
  name: string;
  loginUrl: string;
}

export function WelcomeEmail({ name, loginUrl }: WelcomeEmailProps) {
  return (
    <BaseLayout preview={`Welcome to Agency, ${name}`}>
      <Heading style={{ color: "#111827", fontSize: "24px", fontWeight: 600 }}>
        Welcome, {name}
      </Heading>
      <Text style={{ color: "#374151", fontSize: "16px", lineHeight: "24px" }}>
        Your account is ready. Click below to get started.
      </Text>
      <Button
        href={loginUrl}
        style={{
          backgroundColor: "#111827",
          color: "#ffffff",
          padding: "12px 24px",
          borderRadius: "6px",
          textDecoration: "none",
          fontSize: "14px",
          fontWeight: 500
        }}
      >
        Go to Dashboard
      </Button>
    </BaseLayout>
  );
}
```

### `src/templates/password-reset.tsx`
```tsx
import { Heading, Text, Button } from "@react-email/components";
import { BaseLayout } from "../layouts/base";

interface PasswordResetEmailProps {
  resetUrl: string;
  expiresInMinutes?: number;
}

export function PasswordResetEmail({ resetUrl, expiresInMinutes = 60 }: PasswordResetEmailProps) {
  return (
    <BaseLayout preview="Reset your password">
      <Heading style={{ color: "#111827", fontSize: "24px", fontWeight: 600 }}>
        Reset your password
      </Heading>
      <Text style={{ color: "#374151", fontSize: "16px", lineHeight: "24px" }}>
        Click the button below to reset your password. This link expires in {expiresInMinutes} minutes.
      </Text>
      <Button
        href={resetUrl}
        style={{
          backgroundColor: "#111827",
          color: "#ffffff",
          padding: "12px 24px",
          borderRadius: "6px",
          textDecoration: "none",
          fontSize: "14px",
          fontWeight: 500
        }}
      >
        Reset Password
      </Button>
      <Text style={{ color: "#6b7280", fontSize: "14px", marginTop: "24px" }}>
        If you did not request this, you can safely ignore this email.
      </Text>
    </BaseLayout>
  );
}
```

### `src/templates/invoice-receipt.tsx`
```tsx
import { Heading, Text, Section, Row, Column } from "@react-email/components";
import { BaseLayout } from "../layouts/base";
import { formatCurrency } from "@agency/core-utils/currency";

interface InvoiceReceiptEmailProps {
  invoiceNumber: string;
  amount: number;
  currency: string;
  clientName: string;
  paidAt: string;
}

export function InvoiceReceiptEmail({ invoiceNumber, amount, currency, clientName, paidAt }: InvoiceReceiptEmailProps) {
  return (
    <BaseLayout preview={`Invoice ${invoiceNumber} paid`}>
      <Heading style={{ color: "#111827", fontSize: "24px", fontWeight: 600 }}>
        Payment Received
      </Heading>
      <Text style={{ color: "#374151", fontSize: "16px" }}>
        Hi {clientName}, thank you for your payment.
      </Text>
      <Section style={{ backgroundColor: "#f9fafb", padding: "16px", borderRadius: "6px", margin: "24px 0" }}>
        <Row>
          <Column>
            <Text style={{ margin: 0, color: "#6b7280", fontSize: "14px" }}>Invoice</Text>
            <Text style={{ margin: "4px 0 0", color: "#111827", fontSize: "18px", fontWeight: 600 }}>
              {invoiceNumber}
            </Text>
          </Column>
          <Column>
            <Text style={{ margin: 0, color: "#6b7280", fontSize: "14px" }}>Amount</Text>
            <Text style={{ margin: "4px 0 0", color: "#111827", fontSize: "18px", fontWeight: 600 }}>
              {formatCurrency(amount / 100, currency)}
            </Text>
          </Column>
          <Column>
            <Text style={{ margin: 0, color: "#6b7280", fontSize: "14px" }}>Date</Text>
            <Text style={{ margin: "4px 0 0", color: "#111827", fontSize: "18px", fontWeight: 600 }}>
              {paidAt}
            </Text>
          </Column>
        </Row>
      </Section>
    </BaseLayout>
  );
}
```

### `src/index.ts`
```ts
export { BaseLayout } from "./layouts/base";
export { WelcomeEmail } from "./templates/welcome";
export { PasswordResetEmail } from "./templates/password-reset";
export { InvoiceReceiptEmail } from "./templates/invoice-receipt";
```

### README
```md
# @agency/email-templates
React Email templates for transactional emails.
## Usage
```tsx
import { WelcomeEmail } from "@agency/email-templates/welcome";
import { render } from "@react-email/components";
const html = await render(<WelcomeEmail name="John" loginUrl="https://..." />);
```
## Preview
Run `pnpm email:dev` to start the React Email preview server.
```
