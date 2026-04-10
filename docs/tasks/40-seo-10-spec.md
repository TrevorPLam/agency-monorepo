# 40-seo: Implementation Specification

## Task Header

| Field | Value |
|-------|-------|
| **State** | `conditional` — Package-controlled, opt-in only |
| **Trigger** | 2+ apps require SEO utilities and metadata patterns |
| **Minimum Consumers** | 2+ apps needing SEO |
| **Dependencies** | Next.js 16.2.3, React 19.2.5, `@agency/core-types` |
| **Exit Criteria** | SEO utilities exported and used by at least 2 apps |
| **Implementation Authority** | `REPO-STATE.md` — Conditional; requires explicit app opt-in |
| **Version Authority** | `DEPENDENCY.md` §2, §17 — Next.js 16.2.3, React 19.2.5 |
| **Supersedes** | n/a |
| **Superseded by** | n/a |

**Cross-references:**
- Decision status: `DECISION-STATUS.md` — SEO utilities `open`
- Version pins: `DEPENDENCY.md` §2, §17
- Architecture: `ARCHITECTURE.md` — SEO/optimization layer
- Note: Conditional; only marketing-focused apps typically need SEO

## Rationale (Package vs App)

This is a **shared package** (not an app) because:
- Multiple apps need SEO utilities: agency-website, client-sites, blog pages
- Metadata patterns, structured data schemas, and OpenGraph helpers should be consistent
- Centralized SEO logic prevents duplication and ensures best practices across all marketing surfaces
- Single source of truth for sitemap generation, robots.txt rules, and canonical URL logic


## Files

```
packages/seo/
├── package.json
├── tsconfig.json
├── 01-config-biome-migration-50-ref-quickstart.md
├── CHANGELOG.md
└── src/
    ├── index.ts
    ├── metadata/
    │   ├── index.ts
    │   ├── generate-metadata.ts
    │   ├── site-config.ts
    │   └── defaults.ts
    ├── structured-data/
    │   ├── index.ts
    │   ├── organization.tsx
    │   ├── website.tsx
    │   ├── breadcrumb.tsx
    │   ├── article.tsx
    │   ├── product.tsx
    │   ├── local-business.tsx
    │   └── faq.tsx
    ├── sitemap/
    │   ├── index.ts
    │   ├── generators.ts
    │   └── types.ts
    ├── robots/
    │   ├── index.ts
    │   └── rules.ts
    └── utils/
        ├── index.ts
        ├── canonical-url.ts
        ├── og-image.ts
        └── schema-validator.ts
```

### `package.json`

```json
{
  "name": "@agency/seo",
  "version": "0.1.0",
  "private": true,
  "description": "SEO utilities, metadata helpers, and structured data components",
  "type": "module",
  "exports": {
    ".": "./src/index.ts",
    "./metadata": "./src/metadata/index.ts",
    "./structured-data": "./src/structured-data/index.ts",
    "./sitemap": "./src/sitemap/index.ts",
    "./robots": "./src/robots/index.ts",
    "./utils": "./src/utils/index.ts"
  },
  "scripts": {
    "lint": "eslint src/",
    "typecheck": "tsc --noEmit",
    "test": "vitest run"
  },
  "dependencies": {
    "@agency/core-types": "workspace:*",
    "@agency/core-utils": "workspace:*",
    "@agency/ui-theme": "workspace:*"
  },
  "devDependencies": {
    "@agency/config-eslint": "workspace:*",
    "@agency/config-typescript": "workspace:*",
    "@agency/test-setup": "workspace:*",
    "next": "16.2.3",
    "react": "19.2.5",
    "react-dom": "19.2.5",
    "typescript": "6.0.0"
  },
  "peerDependencies": {
    "next": "^16.0.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0"
  },
  "publishConfig": {
    "access": "restricted"
  }
}
```

### `src/metadata/generate-metadata.ts`

```typescript
import type { Metadata, OpenGraph } from "next";
import { siteConfig } from "./site-config";

export interface MetadataOptions {
  title: string;
  description: string;
  path?: string;
  image?: string;
  noIndex?: boolean;
  type?: "website" | "article" | "profile";
  publishedTime?: string;
  modifiedTime?: string;
  authors?: string[];
  tags?: string[];
}

export function generateMetadata(options: MetadataOptions): Metadata {
  const url = options.path 
    ? `${siteConfig.url}${options.path}` 
    : siteConfig.url;
  
  const image = options.image || siteConfig.ogImage.default;

  return {
    title: {
      absolute: options.title,
      template: siteConfig.title.template,
    },
    description: options.description,
    metadataBase: new URL(siteConfig.url),
    alternates: {
      canonical: url,
    },
    openGraph: {
      type: options.type || "website",
      url,
      title: options.title,
      description: options.description,
      siteName: siteConfig.name,
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: options.title,
        },
      ],
      ...(options.publishedTime && { publishedTime: options.publishedTime }),
      ...(options.modifiedTime && { modifiedTime: options.modifiedTime }),
      ...(options.authors && { authors: options.authors }),
      ...(options.tags && { tags: options.tags }),
    } as OpenGraph,
    twitter: {
      card: "summary_large_image",
      title: options.title,
      description: options.description,
      images: [image],
      creator: siteConfig.social.twitter,
    },
    robots: options.noIndex 
      ? { index: false, follow: false }
      : siteConfig.robots,
    other: {
      "google-site-verification": siteConfig.verification.google,
    },
  };
}
```

### `src/structured-data/organization.tsx`

```typescript
import React from "react";
import { siteConfig } from "../metadata/site-config";

export interface OrganizationSchemaProps {
  logo?: string;
  sameAs?: string[];
}

export function OrganizationSchema({ 
  logo = siteConfig.logo,
  sameAs = [
    siteConfig.social.twitter,
    siteConfig.social.linkedin,
    siteConfig.social.github,
  ].filter(Boolean)
}: OrganizationSchemaProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteConfig.name,
    url: siteConfig.url,
    logo: `${siteConfig.url}${logo}`,
    sameAs,
    contactPoint: {
      "@type": "ContactPoint",
      email: siteConfig.email,
      contactType: "customer service",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
```

### `src/sitemap/generators.ts`

```typescript
import type { MetadataRoute } from "next";
import { siteConfig } from "../metadata/site-config";

export interface SitemapEntry {
  url: string;
  lastModified?: Date;
  changeFrequency?: MetadataRoute.Sitemap[number]["changeFrequency"];
  priority?: number;
}

export function generateSitemap(entries: SitemapEntry[]): MetadataRoute.Sitemap {
  return entries.map((entry) => ({
    url: entry.url,
    lastModified: entry.lastModified || new Date(),
    changeFrequency: entry.changeFrequency || "weekly",
    priority: entry.priority || 0.5,
  }));
}

export function createSitemapUrl(path: string): string {
  return `${siteConfig.url}${path}`;
}

// Common page sitemap entries
export const staticPages: SitemapEntry[] = [
  { url: siteConfig.url, priority: 1.0, changeFrequency: "daily" },
  { url: `${siteConfig.url}/about`, priority: 0.8, changeFrequency: "weekly" },
  { url: `${siteConfig.url}/services`, priority: 0.9, changeFrequency: "weekly" },
  { url: `${siteConfig.url}/work`, priority: 0.9, changeFrequency: "weekly" },
  { url: `${siteConfig.url}/blog`, priority: 0.8, changeFrequency: "daily" },
  { url: `${siteConfig.url}/contact`, priority: 0.7, changeFrequency: "monthly" },
];
```

### `src/robots/rules.ts`

```typescript
import type { MetadataRoute } from "next";
import { siteConfig } from "../metadata/site-config";

export interface RobotsRules {
  userAgent: string;
  allow?: string[];
  disallow?: string[];
  crawlDelay?: number;
}

export function generateRobotsTxt(
  sitemapUrl?: string
): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/_next/",
          "/admin/",
          "/*.json$",
          "/*.xml$",
        ],
      },
      {
        userAgent: "GPTBot",
        disallow: "/",
      },
      {
        userAgent: "ChatGPT-User",
        disallow: "/",
      },
    ],
    sitemap: sitemapUrl || `${siteConfig.url}/sitemap.xml`,
  };
}

// src/hreflang/hreflang-generator.ts
// 2026 Marketing Platform Addition: Hreflang for multilingual SEO

export interface HreflangConfig {
  defaultLocale: string;
  locales: string[];
  path: string;
}

export function generateHreflangTags(config: HreflangConfig) {
  const { defaultLocale, locales, path } = config;
  
  return locales.map((locale) => ({
    rel: 'alternate',
    hrefLang: locale,
    href: `/${locale}${path}`,
  }));
}

export function generateHreflangLinks(
  config: HreflangConfig
): { rel: string; hrefLang: string; href: string }[] {
  const links = generateHreflangTags(config);
  
  // Add x-default
  links.push({
    rel: 'alternate',
    hrefLang: 'x-default',
    href: `/${config.defaultLocale}${config.path}`,
  });
  
  return links;
}
```

### `src/index.ts`

```typescript
// Metadata
export { generateMetadata } from "./metadata/generate-metadata";
export { siteConfig } from "./metadata/site-config";
export { defaultMetadata } from "./metadata/defaults";

// Structured Data
export { OrganizationSchema } from "./structured-data/organization";
export { WebsiteSchema } from "./structured-data/website";
export { BreadcrumbSchema } from "./structured-data/breadcrumb";
export { ArticleSchema } from "./structured-data/article";
export { ProductSchema } from "./structured-data/product";
export { LocalBusinessSchema } from "./structured-data/local-business";
export { FAQSchema } from "./structured-data/faq";

// Sitemap
export { generateSitemap, createSitemapUrl, staticPages } from "./sitemap/generators";
export type { SitemapEntry } from "./sitemap/generators";

// Robots
export { generateRobotsTxt } from "./robots/rules";

// Utils
export { createCanonicalUrl } from "./utils/canonical-url";
export { generateOGImageUrl } from "./utils/og-image";
```


## Usage Example

```typescript
// In an app using @agency/seo
import { generateMetadata, OrganizationSchema } from "@agency/seo";

// app/layout.tsx
export const metadata = generateMetadata({
  title: "Digital Agency | Home",
  description: "Award-winning digital agency...",
});

// app/page.tsx
export default function HomePage() {
  return (
    <>
      <OrganizationSchema />
      {/* ... */}
    </>
  );
}
```


## Marketing Platform Features (2026)

### Hreflang for Multilingual Sites

```typescript
// apps/agency-website/app/[locale]/layout.tsx
import { generateHreflangLinks } from '@agency/seo/hreflang';

export async function generateMetadata({ params: { locale } }) {
  return {
    alternates: {
      languages: generateHreflangLinks({
        defaultLocale: 'en',
        locales: ['en', 'es', 'de'],
        path: '/services',
      }),
    },
  };
}
```

### Advanced Canonical Handling

```typescript
// src/canonical/advanced-canonical.ts
// Handles pagination, query params, trailing slashes

export interface CanonicalOptions {
  path: string;
  queryParams?: string[];
  pagination?: {
    currentPage: number;
    totalPages: number;
  };
}

export function generateAdvancedCanonical(options: CanonicalOptions): string {
  let url = options.path;
  
  // Remove trailing slash except for root
  if (url.length > 1 && url.endsWith('/')) {
    url = url.slice(0, -1);
  }
  
  // Handle pagination
  if (options.pagination && options.pagination.currentPage > 1) {
    url = `${url}/page/${options.pagination.currentPage}`;
  }
  
  return url;
}
```

### SEO Metadata Standards (docs/marketing)

All SEO metadata follows `docs/marketing/seo/metadata-standards.md`:
- Title: `{Page Title} | {Brand Name}` (max 60 chars)
- Description: Active voice, include primary keyword (max 160 chars)
- OG Images: 1200x630, branded

## Verification Steps

```bash
# Verify package exports
pnpm --filter @agency/seo typecheck

# Test metadata generation
pnpm --filter @agency/seo test

# Check in consuming app
pnpm --filter @agency/agency-website typecheck

# Validate hreflang implementation
pnpm --filter @agency/seo test:hreflang
```
