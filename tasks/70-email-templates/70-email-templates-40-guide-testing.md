# Email Templates Testing Guide

## Mailtrap Sandbox Setup

Mailtrap provides a safe environment for testing emails without sending to real addresses.

### 1. Create Mailtrap Account
1. Sign up at [mailtrap.io](https://mailtrap.io)
2. Create a new inbox for your project
3. Copy the SMTP credentials or API credentials

### 2. Configure Environment
```bash
# .env.local
MAILTRAP_HOST=sandbox.smtp.mailtrap.io
MAILTRAP_PORT=587
MAILTRAP_USER=your_username
MAILTRAP_PASSWORD=your_password
```

### 3. Test Script
```typescript
// scripts/test-email.ts
import { createTestEmailService } from "@agency/email-service";
import { WelcomeEmail } from "@agency/email-templates/welcome";
import { render } from "@react-email/components";

async function testEmail() {
  const email = createTestEmailService({
    smtpHost: process.env.MAILTRAP_HOST,
    smtpPort: parseInt(process.env.MAILTRAP_PORT!),
    smtpUser: process.env.MAILTRAP_USER,
    smtpPass: process.env.MAILTRAP_PASSWORD
  });

  const html = await render(<WelcomeEmail name="Test User" loginUrl="https://example.com" />);
  
  await email.send({
    to: { email: "test@example.com", name: "Test" },
    subject: "Test: Welcome Email",
    html
  });
  
  console.log("Email sent to Mailtrap inbox");
}

testEmail();
```

## Cross-Client Testing Checklist

Test every template in these clients before production:

### Web Clients
- [ ] Gmail (Chrome, Firefox, Safari)
- [ ] Outlook Web
- [ ] Apple Mail Web
- [ ] Yahoo Mail

### Desktop Clients
- [ ] Outlook 2016/2019/2021 (Windows)
- [ ] Outlook for Mac
- [ ] Apple Mail (macOS)
- [ ] Thunderbird

### Mobile Clients
- [ ] Gmail App (iOS, Android)
- [ ] Apple Mail (iOS)
- [ ] Samsung Mail (Android)
- [ ] Outlook Mobile

## Visual Testing Checklist

For each client, verify:

- [ ] **Layout**: 600px max width maintained
- [ ] **Colors**: Background colors render correctly
- [ ] **Text**: Font sizes readable (14px minimum)
- [ ] **Images**: External images load (with alt text)
- [ ] **Buttons**: Clickable, styled correctly
- [ ] **Links**: Underlined or clearly styled
- [ ] **Dark Mode**: Readable in dark mode (if supported)

## Common Issues & Fixes

### Outlook Background Colors
```tsx
// Outlook doesn't support background-color on <div>
// Use <table> with bgcolor attribute
<table role="presentation" cellPadding="0" cellSpacing="0" style={{ width: "100%" }}>
  <tr>
    <td bgcolor="#f9fafb">
      {/* Content */}
    </td>
  </tr>
</table>
```

### Gmail Responsive
```tsx
// Gmail app supports responsive but needs this meta
<Head>
  <meta name="x-apple-disable-message-reformatting" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</Head>
```

### Dark Mode
```tsx
// Use CSS custom properties for dark mode support
<Body style={{ 
  backgroundColor: "#f9fafb",
  color: "#111827"
}}>
  {/* React Email 5.0 Dark Mode Switcher handles the rest */}
</Body>
```

## Automation with React Email Preview

```bash
# Start React Email preview server
pnpm email:dev

# Run visual regression tests
pnpm email:test
```

The preview server shows how templates render across different viewports.

## Pre-Production Checklist

Before deploying any template:

1. [ ] Tested in Mailtrap sandbox
2. [ ] Cross-client compatibility verified
3. [ ] Plain text version generated
4. [ ] Alt text on all images
5. [ ] Links are functional
6. [ ] Responsive on mobile
7. [ ] Dark mode readable
8. [ ] No broken images
9. [ ] Spam score < 5 (use Mailtrap spam checker)
10. [ ] Accessibility: semantic HTML, color contrast > 4.5:1
