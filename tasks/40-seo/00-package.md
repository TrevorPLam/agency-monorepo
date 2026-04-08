# 40-seo/00-package: SEO Package

## Purpose

Shared SEO utilities and components for all marketing-facing applications. Provides metadata generation helpers, structured data components, sitemap utilities, and canonical URL management that any app can consume.

## Rationale (Package vs App)

This is a **shared package** (not an app) because:
- Multiple apps need SEO utilities: agency-website, client-sites, blog pages
- Metadata patterns, structured data schemas, and OpenGraph helpers should be consistent
- Centralized SEO logic prevents duplication and ensures best practices across all marketing surfaces
- Single source of truth for sitemap generation, robots.txt rules, and canonical URL logic

## Dependencies

- TASK_2 (Core Types) - for structured data types
- TASK_4 (Core Utils) - for URL helpers
- TASK_7 (UI Theme) - for brand constants in metadata

## Files

```
packages/seo/
├── package.json
├── tsconfig.json
├── README.md
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
    "next": "16.2.2",
    "react": "19.2.4",
    "react-dom": "19.2.4",
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

## Consumer Apps

- `apps/agency-website` - Primary marketing site
- `apps/client-sites/*` - Client landing pages
- Any future marketing microsites

## Verification Steps

```bash
# Verify package exports
pnpm --filter @agency/seo typecheck

# Test metadata generation
pnpm --filter @agency/seo test

# Check in consuming app
pnpm --filter @agency/agency-website typecheck
```

## Success Criteria

- Metadata generates correctly in consuming apps
- Structured data validates with Google's Rich Results Test
- Sitemap.xml and robots.ts generate without errors
- Type-safe exports for all SEO utilities
- No Next.js app code in this package (pure utilities/components)
