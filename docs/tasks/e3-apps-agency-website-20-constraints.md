# e3-apps-agency-website: Constraints and Boundaries

## Scope Constraints

### What This App May Contain

- Public marketing pages (homepage, services, portfolio, about, contact)
- Static content and MDX-based pages
- Contact forms with validation
- SEO metadata and structured data
- Analytics instrumentation (app-local only)
- shadcn/ui components from `@agency/ui-design-system`
- API routes for form handling and server-side operations

### What This App Must NOT Contain

- Authentication logic (no login/logout flows)
- Database drivers or direct DB connections
- CMS integration at package level (keep app-local if needed)
- Shared package extraction for single-use components
- Business logic that belongs in core packages
- Environment variable values in code

## Dependency Constraints

### Allowed Dependencies

```json
{
  "dependencies": [
    "next",
    "react",
    "react-dom",
    "@agency/core-types",
    "@agency/core-utils",
    "@agency/core-constants",
    "@agency/core-hooks",
    "@agency/ui-theme",
    "@agency/ui-icons",
    "@agency/ui-design-system"
  ]
}
```

### Forbidden Dependencies

- `@agency/auth-*` — No authentication in public website
- `@agency/data-db` — No database access
- `@agency/data-cms` — Keep CMS integration app-local
- `@agency/analytics` — App-local analytics only (package is conditional)
- Any database driver (pg, @neondatabase/serverless, etc.)

## Architecture Constraints

### Next.js 16.2 Constraints

- Use App Router exclusively
- Server Components for static content
- Client Components only for interactive elements
- Route Handlers for API endpoints
- `transpilePackages` for workspace dependencies
- Empty `tailwind.config` in `components.json` for v4

### App-Local First Rule

Per `REPO-STATE.md` Milestone 1:
- SEO logic remains app-local
- Analytics remains app-local  
- Monitoring remains app-local
- Forms and validation remain app-local
- Do NOT create shared packages for single-use patterns

## Performance Constraints

### Core Web Vitals Targets

- **LCP (Largest Contentful Paint)**: < 2.5s
- **FID (First Input Delay)**: < 100ms
- **CLS (Cumulative Layout Shift)**: < 0.1
- **TTFB (Time to First Byte)**: < 600ms
- **FCP (First Contentful Paint)**: < 1.8s
- **INP (Interaction to Next Paint)**: < 200ms

### Bundle Size Constraints

- First load JS < 250KB gzipped
- No runtime imports of server-only code
- Tree-shaking verified for all workspace packages

## Security Constraints

### Required Headers

```javascript
// next.config.mjs
async headers() {
  return [
    {
      source: '/:path*',
      headers: [
        { key: 'X-DNS-Prefetch-Control', value: 'on' },
        { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
        { key: 'X-XSS-Protection', value: '1; mode=block' },
        { key: 'Referrer-Policy', value: 'origin-when-cross-origin' },
      ],
    },
  ];
}
```

### Content Security Policy

- Strict CSP for production
- No inline scripts without nonces
- Frame ancestors limited to self

## Environment Constraints

### Required Environment Variables

```bash
NEXT_PUBLIC_SITE_URL=https://agency.com
NEXT_PUBLIC_SITE_NAME="Digital Agency"
```

### Optional Environment Variables

```bash
# Analytics (app-local)
NEXT_PUBLIC_PLAUSIBLE_DOMAIN=agency.com
NEXT_PUBLIC_POSTHOG_KEY=...

# Contact Form
CONTACT_FORM_WEBHOOK_URL=...
CONTACT_FORM_API_KEY=...

# CMS (if used, app-local only)
NEXT_PUBLIC_SANITY_PROJECT_ID=...
```

### Forbidden in Environment

- Database connection strings
- Internal API keys with broad permissions
- Production secrets in `.env.local` (use Vercel dashboard)

## Compliance Constraints

### GDPR/CCPA (if applicable)

- Cookie consent banner required
- Analytics only after consent
- Privacy policy page required
- Data deletion request handling

### Accessibility Requirements

- WCAG 2.1 AA compliance
- Semantic HTML throughout
- Keyboard navigation support
- Screen reader compatibility
- Color contrast 4.5:1 minimum

## Testing Constraints

### Minimum Test Coverage

- Core user journeys: 100% critical path
- Component rendering: Key components
- Form validation: All forms
- API routes: All handlers

### Required Tests

- Homepage renders without errors
- Contact form submits successfully
- All links navigate correctly
- Mobile responsive verification
- Lighthouse score 95+
