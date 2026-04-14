# e3-apps-agency-website: QA Checklist

## Pre-Release Validation

### Functionality

- [ ] Homepage loads without 404s or console errors
- [ ] All navigation links navigate correctly
- [ ] Contact form validation works (required fields, email format)
- [ ] Contact form submits successfully
- [ ] Mobile menu opens/closes correctly
- [ ] All CTAs are clickable and navigate correctly
- [ ] Portfolio/work items display correctly
- [ ] Blog posts list and detail pages work (if applicable)

### Performance

- [ ] Lighthouse Performance score ≥ 95
- [ ] Lighthouse Accessibility score ≥ 95
- [ ] Lighthouse Best Practices score ≥ 95
- [ ] Lighthouse SEO score ≥ 95
- [ ] First Contentful Paint < 1.8s
- [ ] Largest Contentful Paint < 2.5s
- [ ] No render-blocking resources warnings

### Responsive Design

- [ ] Desktop (1920px, 1440px, 1280px) layouts correct
- [ ] Tablet (768px) layout correct
- [ ] Mobile (375px, 414px) layout correct
- [ ] No horizontal scroll on any viewport
- [ ] Touch targets ≥ 44x44px on mobile

### SEO

- [ ] Title tags unique per page
- [ ] Meta descriptions present and unique
- [ ] OpenGraph images render correctly (1200x630)
- [ ] Twitter card images render correctly
- [ ] Canonical URLs set correctly
- [ ] Sitemap.xml generated and accessible at /sitemap.xml
- [ ] robots.txt present at /robots.txt
- [ ] Structured data (JSON-LD) where appropriate

### Accessibility

- [ ] WCAG 2.1 AA compliance verified with axe-core
- [ ] Keyboard navigation works throughout
- [ ] Focus indicators visible
- [ ] Color contrast ≥ 4.5:1 for text
- [ ] Alt text on all images
- [ ] Form labels associated with inputs
- [ ] ARIA landmarks present (header, main, footer)
- [ ] Screen reader announces page changes

### Security

- [ ] HTTPS enforced
- [ ] Security headers present (CSP, HSTS, X-Frame-Options)
- [ ] No secrets in client-side code
- [ ] API routes validate input
- [ ] Rate limiting on form submissions

### Cross-Browser

- [ ] Chrome (latest)
- [ ] Safari (latest)
- [ ] Firefox (latest)
- [ ] Edge (latest)

### Analytics

- [ ] Page view tracking fires
- [ ] Event tracking configured for key interactions
- [ ] No duplicate analytics calls
- [ ] Consent mode respected (if GDPR applicable)

### Environment

- [ ] Production environment variables set
- [ ] No development/debug flags in production
- [ ] Error monitoring configured (if applicable)

## Build Verification

```bash
# Clean build test
rm -rf apps/agency-website/.next
pnpm --filter @agency/agency-website build

# Verify build output
ls -la apps/agency-website/.next/
```

## Deployment Verification

- [ ] Deployed to production URL
- [ ] Custom domain configured (if applicable)
- [ ] SSL certificate valid
- [ ] Vercel Speed Insights enabled
- [ ] Vercel Analytics enabled (if applicable)

## Sign-Off

| Check | Owner | Status | Date |
|-------|-------|--------|------|
| Functionality | | ☐ | |
| Performance | | ☐ | |
| Responsive | | ☐ | |
| SEO | | ☐ | |
| Accessibility | | ☐ | |
| Security | | ☐ | |
| Cross-Browser | | ☐ | |
| Analytics | | ☐ | |

**Final Approval**: _________________ Date: _______
