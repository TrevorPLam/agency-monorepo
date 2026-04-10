# e7-apps-email-preview: Implementation Specification

## Task Header

| Field | Value |
|-------|-------|
| **State** | `conditional` — Package-controlled, opt-in only |
| **Trigger** | Team requires email template preview tool |
| **Minimum Consumers** | 1 (preview app) |
| **Dependencies** | Next.js 16.2.3, React 19.2.5, `@agency/email-templates` |
| **Exit Criteria** | Email preview app deployed and accessible |
| **Implementation Authority** | `REPO-STATE.md` — Conditional; requires explicit need |
| **Version Authority** | `DEPENDENCY.md` §2 — Next.js 16.2.3 |
| **Supersedes** | n/a |
| **Superseded by** | n/a |

**Cross-references:**
- Decision status: `DECISION-STATUS.md` — Email preview `open`
- Version pins: `DEPENDENCY.md` §2
- Note: Conditional; development tool for email template authors

## Application Structure

```
apps/email-preview/
├── app/
│   ├── layout.tsx
│   ├── page.tsx              # Template gallery/index
│   ├── preview/
│   │   └── [template]/
│   │       ├── page.tsx      # Desktop preview
│   │       └── raw/
│   │           └── route.ts  # Raw HTML endpoint
│   ├── api/
│   │   └── send-test/
│   │       └── route.ts      # Test send endpoint
│   ├── env.ts
│   └── globals.css
├── lib/
│   ├── templates.ts          # Template registry
│   ├── preview-data.ts       # Mock data for templates
│   └── send-test.ts          # Test email logic
├── components/
│   ├── template-gallery.tsx
│   ├── preview-frame.tsx     # Responsive preview
│   ├── variable-editor.tsx   # Edit template variables
│   └── code-viewer.tsx       # HTML source view
├── next.config.js
├── package.json
├── tsconfig.json
└── tailwind.config.ts
```

## Key Features

### Template Gallery
- List all email templates from `@agency/email-templates`
- Thumbnail previews
- Template metadata (name, description, variables)

### Responsive Preview
- Desktop view (600px email width)
- Mobile view (320px)
- Live refresh on template changes

### Variable Editor
- Edit template variables in UI
- JSON editor for complex data
- Reset to defaults

### Raw HTML Access
- `/preview/[template]/raw` returns raw HTML
- Useful for external testing tools
- Litmus/Email on Acid compatibility

### Test Send
- Send preview to specified email address
- Uses `@agency/email-service` with test credentials
- Rate limited per environment

## Critical Requirements

### Per-App Environment

```typescript
// apps/email-preview/app/env.ts
import { createEnv } from "@agency/core-env";
import { z } from "zod";

export const env = createEnv({
  server: {
    EMAIL_PREVIEW_API_KEY: z.string(),
    RESEND_API_KEY: z.string().optional(), // For test sends
    POSTMARK_API_KEY: z.string().optional(),
  },
  client: {
    NEXT_PUBLIC_APP_NAME: z.string().default("Email Preview"),
  },
});
```

### Security Considerations
- Preview app should be **deployment-environment protected**
- Authentication required in production (Clerk/Better Auth)
- Rate limiting on test send endpoint
- No access to production email credentials

### Template Hot Reload
- Watch `@agency/email-templates` for changes
- Fast refresh in dev mode
- Build-time template embedding for production

## Verification Steps

```bash
# Start email preview
pnpm --filter email-preview dev

# Open http://localhost:3002 (or assigned port)
# Verify all templates render correctly
# Test variable editing
# Send test email (if configured)
```

## References

- [next-forge email setup](https://www.next-forge.com/docs/setup/quickstart)
- [React Email documentation](https://react.email/docs)
