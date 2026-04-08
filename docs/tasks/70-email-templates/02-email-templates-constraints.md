# Email Templates Constraints

## Technical Constraints

### React Email Version
- **Must use React Email 5.0+** - Legacy `renderAsync` is deprecated; use synchronous `render`
- **Tailwind 4 CSS** - All styles must use Tailwind utility classes; inline styles deprecated
- **CSS Compatibility** - React Email includes CSS compatibility checker; templates must pass validation

### Template Requirements
- **Maximum width**: 600px (email client standard)
- **Image hosting**: External URLs only; no base64-encoded images for Outlook compatibility
- **Font stacks**: System fonts only; web fonts have poor email client support

### Testing Requirements
- **Mandatory sandbox testing** - All templates must be tested in Mailtrap before production
- **Cross-client validation** - Must render correctly in:
  - Gmail (web + mobile)
  - Outlook 2016+ (desktop + web)
  - Apple Mail (macOS + iOS)
  - Samsung Mail (Android)

### i18n Support (When Active)
- Templates must support `@agency/i18n` when that package is active
- Locale-aware date/number formatting via `@agency/core-utils`
- RTL language support via Tailwind RTL utilities

## Attachment Constraints
- **Maximum size**: 10MB per email (Postmark limit; lowest common denominator)
- **Total attachments**: Maximum 40MB (Resend limit)
- **Blocked file types**: `.exe`, `.zip`, `.js`, `.vbs`, `.scr` (security policy)
- **Virus scanning**: All attachments must be scanned before queueing

## Content Constraints
- **Plain text fallback**: All HTML emails must include `text` alternative
- **Link tracking**: Must respect `@agency/compliance` consent state before adding tracking pixels
- **Unsubscribe**: Marketing emails must include unsubscribe link (CAN-SPAM/GDPR)

## Dependencies
```
@agency/core-types      - workspace:* (required)
@react-email/components - latest (React Email 5.0+)
react                   - ^19.0.0
react-dom               - ^19.0.0
tailwindcss             - ^4.x (dev)
```

## Exit Criteria
- [ ] All templates pass Mailtrap rendering tests
- [ ] Cross-client compatibility verified
- [ ] Dark mode renders correctly
- [ ] Plain text fallback provided
- [ ] Accessibility checks pass (alt text, semantic structure)
