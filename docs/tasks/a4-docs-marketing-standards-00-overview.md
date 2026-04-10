# a4-docs-marketing-standards: Marketing Standards Documentation

## Purpose
Create a dedicated standards area for marketing-specific documentation. Marketing repositories benefit from documented SEO rules, analytics taxonomy, page-builder conventions, campaign standards, and content governance.

## Dependencies
- `a0-a3` - Base documentation infrastructure
- `40-seo` - SEO package
- `80-analytics` - Analytics package

## Scope

### Documentation Structure
```
docs/marketing/
├── 01-config-biome-migration-50-ref-quickstart.md
├── seo/
│   ├── 01-config-biome-migration-50-ref-quickstart.md
│   ├── metadata-standards.md
│   ├── structured-data-guide.md
│   └── hreflang-guide.md
├── analytics/
│   ├── 01-config-biome-migration-50-ref-quickstart.md
│   ├── event-taxonomy.md
│   ├── conversion-tracking.md
│   └── attribution-model.md
├── content/
│   ├── 01-config-biome-migration-50-ref-quickstart.md
│   ├── page-builder-guide.md
│   ├── cms-workflows.md
│   └── review-checklist.md
├── campaigns/
│   ├── 01-config-biome-migration-50-ref-quickstart.md
│   ├── landing-page-standards.md
│   ├── utm-conventions.md
│   └── a-b-testing-guide.md
└── performance/
    ├── 01-config-biome-migration-50-ref-quickstart.md
    ├── core-web-vitals-targets.md
    └── image-standards.md
```

### SEO Standards

```markdown
# SEO Metadata Standards

## Title Format
`{Page Title} | {Brand Name}`
Max 60 characters

## Description Format
Active voice, include primary keyword
Max 160 characters

## Open Graph
- og:title: Match page title
- og:description: Match meta description
- og:image: 1200x630, branded

## Structured Data
- Article pages: Article schema
- Product pages: Product schema
- Organization: Organization schema on homepage
```

### Analytics Taxonomy

```markdown
# Event Taxonomy

## Category: Page
- page_view
- page_engagement (30s on page)
- scroll_depth (25%, 50%, 75%, 100%)

## Category: Lead
- lead_form_start
- lead_form_step_complete
- lead_form_submit
- lead_capture_success

## Category: Content
- content_click
- external_link_click
- file_download
- video_play

## Properties (All Events)
- page_path
- page_title
- referrer
- utm_source (if present)
- utm_campaign (if present)
```

### Campaign Conventions

```markdown
# UTM Standards

## Required Parameters
- utm_source: google, facebook, newsletter, etc.
- utm_medium: cpc, social, email, organic
- utm_campaign: campaign-name-YYYY-MM

## Landing Page Requirements
- Consistent headline with ad copy
- Single primary CTA
- Form above fold on desktop
- Phone CTA on mobile
```

## Build Condition

**Add when** - This is documentation, not code. Add when:
- Marketing team needs documented standards
- Multiple team members work on campaigns
- Client work requires consistent SEO/analytics approach
- Page-builder/content workflows need documentation

## References

- [Sanity marketing demo](https://github.com/sanity-io/demo-marketing-site-nextjs)
