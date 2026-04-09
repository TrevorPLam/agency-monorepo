# 70-email-templates: Implementation Specification

## Task Header

| Field | Value |
|-------|-------|
| **State** | `conditional` — Package-controlled, opt-in only |
| **Trigger** | App requires transactional email with React components |
| **Minimum Consumers** | 1+ apps explicitly requesting email |
| **Dependencies** | React Email 5.2.x, `@react-email/*` packages |
| **Exit Criteria** | Email templates exported and used in at least one app |
| **Implementation Authority** | `REPO-STATE.md` — Conditional; requires explicit app-level opt-in |
| **Version Authority** | `DEPENDENCY.md` §6 — React Email 5.2.10, `@react-email/components@1.0.12` |
| **Supersedes** | n/a |
| **Superseded by** | n/a |

**Cross-references:**
- Decision status: `DECISION-STATUS.md` — React Email `leaning` (stable, evaluate during Task 70)
- Version pins: `DEPENDENCY.md` §18
- Architecture: `ARCHITECTURE.md` — Communication layer section
- Note: Transactional email is optional; not all apps require it

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
    "@react-email/components": "1.0.12",
    "react": "19.2.5",
    "react-dom": "19.2.5"
  },
  "devDependencies": {
    "@agency/config-eslint": "workspace:*",
    "@agency/config-typescript": "workspace:*",
    "react-email": "5.2.10",
    "tailwindcss": "^4.x"
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
      <Heading className="text-gray-900 text-2xl font-semibold">
        Welcome, {name}
      </Heading>
      <Text className="text-gray-700 text-base leading-6">
        Your account is ready. Click below to get started.
      </Text>
      <Button
        href={loginUrl}
        className="bg-gray-900 text-white px-6 py-3 rounded-md no-underline text-sm font-medium"
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
      <Heading className="text-gray-900 text-2xl font-semibold">
        Reset your password
      </Heading>
      <Text className="text-gray-700 text-base leading-6">
        Click the button below to reset your password. This link expires in {expiresInMinutes} minutes.
      </Text>
      <Button
        href={resetUrl}
        className="bg-gray-900 text-white px-6 py-3 rounded-md no-underline text-sm font-medium"
      >
        Reset Password
      </Button>
      <Text className="text-gray-500 text-sm mt-6">
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
      <Heading className="text-gray-900 text-2xl font-semibold">
        Payment Received
      </Heading>
      <Text className="text-gray-700 text-base">
        Hi {clientName}, thank you for your payment.
      </Text>
      <Section className="bg-gray-50 p-4 rounded-md my-6">
        <Row>
          <Column>
            <Text className="m-0 text-gray-500 text-sm">Invoice</Text>
            <Text className="mt-1 text-gray-900 text-lg font-semibold">
              {invoiceNumber}
            </Text>
          </Column>
          <Column>
            <Text className="m-0 text-gray-500 text-sm">Amount</Text>
            <Text className="mt-1 text-gray-900 text-lg font-semibold">
              {formatCurrency(amount / 100, currency)}
            </Text>
          </Column>
          <Column>
            <Text className="m-0 text-gray-500 text-sm">Date</Text>
            <Text className="mt-1 text-gray-900 text-lg font-semibold">
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

## React Email 5.0 Migration Notes
- Use `render` (not `renderAsync`) - synchronous in React Email 5.0
- Tailwind 4 CSS classes supported with compatibility checking
- Dark Mode Switcher available for email theming

## Usage
```tsx
import { WelcomeEmail } from "@agency/email-templates/welcome";
import { render } from "@react-email/components";

// React Email 5.0: render is synchronous
const html = await render(<WelcomeEmail name="John" loginUrl="https://..." />);
```

## Testing
Test in Mailtrap sandbox before production. See guide for details.

## Preview
Run `pnpm email:dev` to start the React Email preview server.
```
