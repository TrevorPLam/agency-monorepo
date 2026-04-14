# e3-apps-agency-website: AI Execution Prompt

> **⚠️ IMPLEMENTATION AUTHORITY CHECK ⚠️**
>
> Before implementing, verify:
> 1. `REPO-STATE.md` — Agency website is approved for Milestone 1
> 2. `DEPENDENCY.md` — Versions match current locks
> 3. `AGENTS.md` — Operating rules understood
>
> Stop and escalate if any conflict found.

## Task Scope

Implement `apps/agency-website/` — the public marketing website for the agency.

## Required Reading Order

1. `e3-apps-agency-website-00-overview.md` — Purpose and scope
2. `e3-apps-agency-website-10-spec.md` — Implementation specification
3. `e3-apps-agency-website-20-constraints.md` — Boundaries and limits
4. `e3-apps-agency-website-30-adr-nextjs.md` — Architecture decisions
5. `e3-apps-agency-website-40-guide-local-dev.md` — Development guide
6. `e3-apps-agency-website-60-qa-checklist.md` — Validation criteria
7. This file — Execution instructions

## Implementation Sequence

### Phase 1: Foundation (Do First)

1. **Verify dependencies exist**:
   - Check `20-core-types`, `21-core-utils`, `22-core-constants`, `23-core-hooks` are scaffolded
   - Check `30-ui-theme`, `31-ui-icons`, `32-ui-design-system` are scaffolded
   - If missing: STOP and escalate

2. **Create app directory structure**:
   ```
   apps/agency-website/
   ├── src/
   │   ├── app/
   │   ├── components/
   │   └── lib/
   ├── public/
   └── .env.example
   ```

3. **Create package.json** with exact versions from spec

4. **Create next.config.mjs** with:
   - `transpilePackages` for all workspace deps
   - `typedRoutes: true`
   - `serverActionsLogging: true`
   - Image remotePatterns for Sanity and Unsplash

5. **Create components.json** for shadcn/ui v4:
   - Tailwind config: `""` (empty string)
   - CSS path pointing to design system
   - Correct aliases for workspace imports

### Phase 2: Core Pages

Implement in this order:

1. **layout.tsx** — Root layout with fonts, metadata, analytics
2. **page.tsx** — Homepage with hero, services, portfolio, testimonials, CTA
3. **services/page.tsx** — Services listing
4. **work/page.tsx** — Portfolio showcase
5. **about/page.tsx** — About page with team
6. **contact/page.tsx** — Contact form

### Phase 3: Shared Components

1. **Header** — Navigation with mobile menu
2. **Footer** — Links, social, copyright
3. **Hero** — Homepage hero section
4. **ServicesGrid** — Services display
5. **PortfolioShowcase** — Work samples
6. **TestimonialCarousel** — Client quotes
7. **CTABanner** — Call-to-action sections
8. **ContactForm** — Form with validation

### Phase 4: API Routes

1. **api/contact/route.ts** — Form submission handler
   - Validate input with Zod
   - Send to webhook or email service
   - Return appropriate responses

### Phase 5: SEO & Performance

1. **Metadata** — generateMetadata for each page
2. **sitemap.ts** — Dynamic sitemap generation
3. **robots.ts** — Robots configuration
4. **opengraph-image.tsx** — OG image generation

## Critical Rules

### DO

- Use Server Components by default
- Use Client Components only when needed (interactivity, browser APIs)
- Import from workspace packages: `import { Button } from '@agency/ui-design-system'`
- Keep app-local: SEO, analytics, forms
- Validate environment variables with Zod
- Test after each phase

### DO NOT

- Import from `apps/*` (no app-to-app imports)
- Import from package internals: `import { X } from '@agency/ui-design-system/src/...'`
- Create shared packages for single-use components
- Add authentication logic
- Install database drivers
- Use TypeScript enums (use const assertions)

## Version Verification

Before implementation, confirm these versions match `DEPENDENCY.md`:

```json
{
  "next": "16.2.0",
  "react": "19.2.0",
  "react-dom": "19.2.0",
  "tailwindcss": "4.1.12",
  "typescript": "5.8.3"
}
```

If versions differ: STOP and check `DEPENDENCY.md` for authority.

## Testing Requirements

After each phase:

```bash
# Type check
pnpm --filter @agency/agency-website typecheck

# Build test
pnpm --filter @agency/agency-website build

# Check for console errors
# Manually verify in browser
```

## Escalation Triggers

STOP and request human decision if:

- Shared package dependency doesn't exist
- Version conflict with `DEPENDENCY.md`
- Need to create new shared package
- Constraint violation required
- Unclear boundary between app and shared code

## Verification Checklist

Before marking complete:

- [ ] All pages render without errors
- [ ] Type check passes
- [ ] Build succeeds
- [ ] Lighthouse score ≥ 95
- [ ] Mobile responsive verified
- [ ] QA checklist items complete

## Final Command

Implement `apps/agency-website/` following the spec, constraints, and guide documents. Start with Phase 1, verify after each phase, escalate on ambiguity.
