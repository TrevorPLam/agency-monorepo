# ADR: React Email 5.0 Migration

## Status
Accepted

## Context
React Email 4.0 was the previous stable version used in the monorepo. In early 2026, React Email 5.0 was released with significant improvements but also breaking changes that affect template rendering.

Key changes in React Email 5.0:
- `renderAsync` deprecated in favor of synchronous `render`
- Tailwind 4 CSS support with built-in compatibility checker
- Dark Mode Switcher component for email theming
- Resend Templates integration for visual editor collaboration
- 8 new pre-built components (Avatars, Stats, Testimonials)

## Decision
Migrate all email templates to React Email 5.0.

## Consequences

### Positive
- **Simpler API**: `render()` is synchronous and easier to use than `renderAsync`
- **Tailwind 4**: Better CSS compatibility and performance
- **Dark Mode**: Native theming support improves UX for dark mode email clients
- **Future-proof**: Aligns with latest React Email ecosystem

### Negative
- **Breaking change**: All existing `renderAsync` calls must be updated
- **Tailwind 3 to 4**: Some utility classes may need adjustment
- **Dependency update**: Requires coordinated update across consuming apps

## Implementation

### Code Changes Required
```tsx
// BEFORE (React Email 4.x)
import { renderAsync } from "@react-email/components";
const html = await renderAsync(<WelcomeEmail name="John" />);

// AFTER (React Email 5.x)
import { render } from "@react-email/components";
const html = await render(<WelcomeEmail name="John" />);
```

### Style Migration
```tsx
// BEFORE - inline styles
<Button style={{ backgroundColor: "#111827", padding: "12px 24px" }}>

// AFTER - Tailwind classes
<Button className="bg-gray-900 px-6 py-3">
```

## Migration Guide
1. Update `package.json` dependencies to `latest`
2. Replace all `renderAsync` with `render`
3. Convert inline styles to Tailwind utility classes
4. Test all templates in Mailtrap sandbox
5. Verify dark mode rendering

## References
- [React Email 5.0 Release Notes](https://resend.com/blog/react-email-5)
- [Tailwind 4 Migration Guide](https://tailwindcss.com/docs/v4-beta)
