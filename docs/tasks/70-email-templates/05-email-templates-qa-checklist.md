# Email Templates QA Checklist

## Code Review Checklist

### Package Structure
- [ ] Package located at `packages/communication/email-templates/`
- [ ] `package.json` has correct name: `@agency/email-templates`
- [ ] Exports configured for all templates and layouts
- [ ] React Email 5.0+ dependencies specified

### Template Implementation
- [ ] All templates use React Email components (not raw HTML)
- [ ] Tailwind 4 utility classes used (not inline styles)
- [ ] `render()` used (not `renderAsync`)
- [ ] Base layout component created and reused
- [ ] TypeScript interfaces defined for all template props

### Cross-Client Compatibility
- [ ] Tested in Mailtrap sandbox
- [ ] Verified in Gmail (web)
- [ ] Verified in Outlook (web + desktop)
- [ ] Verified in Apple Mail (macOS + iOS)
- [ ] Mobile responsive (max-width: 600px)

### Accessibility
- [ ] All images have alt text
- [ ] Color contrast > 4.5:1
- [ ] Semantic HTML structure
- [ ] Plain text fallback generated

## Testing Commands

```bash
# Install dependencies
pnpm install

# Start preview server
pnpm email:dev

# Run type check
pnpm typecheck

# Run tests
pnpm test

# Build
pnpm build
```

## Integration Test

```typescript
// Test all templates render correctly
import { render } from "@react-email/components";
import { WelcomeEmail, PasswordResetEmail, InvoiceReceiptEmail } from "@agency/email-templates";

async function testTemplates() {
  // Test Welcome Email
  const welcome = await render(
    <WelcomeEmail name="Test User" loginUrl="https://example.com/login" />
  );
  console.assert(welcome.includes("Welcome, Test User"), "Welcome email failed");
  
  // Test Password Reset
  const reset = await render(
    <PasswordResetEmail resetUrl="https://example.com/reset" expiresInMinutes={60} />
  );
  console.assert(reset.includes("Reset your password"), "Password reset failed");
  
  // Test Invoice Receipt
  const invoice = await render(
    <InvoiceReceiptEmail 
      invoiceNumber="INV-001"
      amount={10000}
      currency="USD"
      clientName="Test Client"
      paidAt="2026-01-01"
    />
  );
  console.assert(invoice.includes("Payment Received"), "Invoice receipt failed");
  
  console.log("All templates render correctly!");
}

testTemplates();
```

## Pre-Release Verification

- [ ] Version bumped in `package.json`
- [ ] CHANGELOG.md updated
- [ ] All tests passing
- [ ] No console errors in preview
- [ ] TypeScript compilation succeeds
- [ ] Exports verified (can import from all paths)
