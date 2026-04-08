# Seo


## Purpose

Shared SEO utilities and components for all marketing-facing applications. Provides metadata generation helpers, structured data components, sitemap utilities, and canonical URL management that any app can consume.


## Condition Block

- **Build when:** Multiple marketing surfaces need consistent SEO metadata, structured data, or sitemap generation.
- **Do not build when:** SEO needs are limited to a single app with simple requirements.
- **Minimum consumer rule:** Two consumers required — this package exists to eliminate SEO duplication across surfaces.
- **Exit criteria:**
  - [ ] Metadata generation helpers used by at least two apps
  - [ ] Structured data components (Organization, Website, Breadcrumb) functional
  - [ ] Sitemap generation and robots.txt utilities working
  - [ ] README with SEO implementation guide
  - [ ] Changeset documenting initial release


## Dependencies

- TASK_2 (Core Types) - for structured data types
- TASK_4 (Core Utils) - for URL helpers
- TASK_7 (UI Theme) - for brand constants in metadata


## Consumer Apps

- `apps/agency-website` - Primary marketing site
- `apps/client-sites/*` - Client landing pages
- Any future marketing microsites


## Success Criteria

- Metadata generates correctly in consuming apps
- Structured data validates with Google's Rich Results Test
- Sitemap.xml and robots.ts generate without errors
- Type-safe exports for all SEO utilities
- No Next.js app code in this package (pure utilities/components)
