# Marketing Standards Specification

## Documentation Structure

```
docs/marketing/
├── README.md
├── seo/
│   ├── README.md
│   ├── metadata-standards.md
│   ├── structured-data-guide.md
│   └── hreflang-guide.md
├── analytics/
│   ├── README.md
│   ├── event-taxonomy.md
│   ├── conversion-tracking.md
│   └── attribution-model.md
├── content/
│   ├── README.md
│   ├── page-builder-guide.md
│   ├── cms-workflows.md
│   └── review-checklist.md
├── campaigns/
│   ├── README.md
│   ├── landing-page-standards.md
│   ├── utm-conventions.md
│   └── a-b-testing-guide.md
└── performance/
    ├── README.md
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
