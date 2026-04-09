# Email Templates Implementation Prompt

## Task
Implement the `@agency/email-templates` package according to the specification.

## Required Files

Create these files in `packages/communication/email-templates/`:

### package.json
- Name: `@agency/email-templates`
- Dependencies: `@react-email/components@1.0.12`, `react@19.2.5`, `react-dom@19.2.5`
- DevDependencies: `react-email@5.2.10`, `tailwindcss@4.2.2`
- Exports for: base layout, welcome, password-reset, invoice-receipt templates

### src/layouts/base.tsx
- Use `<Html>`, `<Head>`, `<Preview>`, `<Body>`, `<Container>` from React Email
- 600px max-width container
- Tailwind classes for styling
- Accept `preview` prop for email preview text

### src/templates/welcome.tsx
- Props: `{ name: string; loginUrl: string }`
- Use Heading, Text, Button from React Email
- Tailwind classes: `text-gray-900`, `text-2xl`, `font-semibold`, etc.

### src/templates/password-reset.tsx
- Props: `{ resetUrl: string; expiresInMinutes?: number }`
- Include expiration warning text
- CTA button to reset password

### src/templates/invoice-receipt.tsx
- Props: `{ invoiceNumber, amount, currency, clientName, paidAt }`
- Use Section, Row, Column for layout
- Format currency using helper

### src/index.ts
- Export all templates and layouts
- Use explicit exports for tree-shaking

## Implementation Notes

1. **React Email 5.0**: Use `render()` not `renderAsync` - it's synchronous now
2. **Tailwind 4**: Use utility classes everywhere, no inline styles
3. **Base Layout**: Create a reusable layout that all templates extend
4. **TypeScript**: Define interfaces for all props
5. **Testing**: Use React Email preview server for visual testing

## Verification Steps

1. Run `pnpm email:dev` and verify all templates render
2. Check cross-client compatibility in Mailtrap
3. Verify TypeScript compilation
4. Test exports from consuming package

## Exit Criteria

- [ ] All templates render correctly in preview
- [ ] Mailtrap testing shows cross-client compatibility
- [ ] TypeScript types compile
- [ ] Exports work from external packages
- [ ] Tailwind classes used (no inline styles)
