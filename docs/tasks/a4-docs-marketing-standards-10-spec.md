# a4-docs-marketing-standards: Implementation Specification

## Task Header

| Field | Value |
|-------|-------|
| **State** | `conditional` — Package-controlled, opt-in only |
| **Trigger** | Client sites require marketing documentation |
| **Minimum Consumers** | 1+ apps with marketing requirements |
| **Dependencies** | None (meta documentation) |
| **Exit Criteria** | Marketing standards published and referenced |
| **Implementation Authority** | `REPO-STATE.md` — Conditional; requires explicit app opt-in |
| **Version Authority** | `DEPENDENCY.md` — repository version-governance baseline for marketing documentation |
| **Supersedes** | n/a |
| **Superseded by** | n/a |

**Cross-references:**
- Decision status: `DECISION-STATUS.md` — Marketing standards `open`
- Location: `docs/marketing/`
- Note: Optional; only needed for SEO/marketing-focused apps

## Documentation Structure

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

## SEO Standards

### Title Format
```
{Page Title} | {Brand Name}
Max 60 characters
```

### Description Format
Active voice, include primary keyword
Max 160 characters

### Open Graph
- og:title: Match page title
- og:description: Match meta description
- og:image: 1200x630, branded

### Structured Data
- Article pages: Article schema
- Product pages: Product schema
- Organization: Organization schema on homepage

## Analytics Taxonomy

### Category: Page
- page_view
- page_engagement (30s on page)
- scroll_depth (25%, 50%, 75%, 100%)

### Category: Lead
- lead_form_start
- lead_form_step_complete
- lead_form_submit
- lead_capture_success

### Category: Content
- content_click
- external_link_click
- file_download
- video_play

### Properties (All Events)
- page_path
- page_title
- referrer
- utm_source (if present)
- utm_campaign (if present)

## Campaign Conventions

### UTM Standards

#### Required Parameters
- utm_source: google, facebook, newsletter, etc.
- utm_medium: cpc, social, email, organic
- utm_campaign: campaign-name-YYYY-MM

#### Landing Page Requirements
- Consistent headline with ad copy
- Single primary CTA
- Form above fold on desktop
- Phone CTA on mobile

## References

- [Sanity marketing demo](https://github.com/sanity-io/demo-marketing-site-nextjs)
