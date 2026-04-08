# E3 Apps Agency Website Specification

## Files

```
apps/agency-website/
├── package.json
├── next.config.mjs
├── tsconfig.json
├── tailwind.config.ts
├── postcss.config.mjs
├── .env.example
├── .env.local
├── README.md
├── public/
│   ├── images/
│   │   ├── logo.svg
│   │   ├── hero/
│   │   ├── team/
│   │   └── portfolio/
│   ├── fonts/
│   └── favicon.ico
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── globals.css
│   │   ├── services/
│   │   │   └── page.tsx
│   │   ├── work/
│   │   │   ├── page.tsx
│   │   │   └── [slug]/
│   │   │       └── page.tsx
│   │   ├── about/
│   │   │   └── page.tsx
│   │   ├── blog/
│   │   │   ├── page.tsx
│   │   │   └── [slug]/
│   │   │       └── page.tsx
│   │   ├── contact/
│   │   │   └── page.tsx
│   │   ├── case-studies/
│   │   │   └── page.tsx
│   │   ├── opengraph-image.tsx
│   │   ├── twitter-image.tsx
│   │   ├── robots.ts
│   │   ├── sitemap.ts
│   │   └── api/
│   │       └── contact/
│   │           └── route.ts
│   ├── components/
│   │   ├── sections/
│   │   │   ├── hero.tsx
│   │   │   ├── services-grid.tsx
│   │   │   ├── portfolio-showcase.tsx
│   │   │   ├── testimonial-carousel.tsx
│   │   │   ├── team-spotlight.tsx
│   │   │   ├── cta-banner.tsx
│   │   │   └── blog-preview.tsx
│   │   ├── navigation/
│   │   │   ├── header.tsx
│   │   │   ├── footer.tsx
│   │   │   └── mobile-menu.tsx
│   │   ├── ui/
│   │   │   ├── logo.tsx
│   │   │   └── contact-form.tsx
│   │   └── analytics/
│   │       └── page-view-tracker.tsx
│   ├── lib/
│   │   ├── utils.ts
│   │   ├── metadata.ts
│   │   └── cms.ts
│   └── types/
│       └── index.ts
```

### `package.json`
```json
{
  "name": "@agency/agency-website",
  "version": "0.1.0",
  "private": true,
  "description": "Agency marketing website",
  "scripts": {
    "dev": "next dev --port 3000",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "typecheck": "tsc --noEmit",
    "clean": "rm -rf .next"
  },
  "dependencies": {
    "next": "16.2.2",
    "react": "19.2.4",
    "react-dom": "19.2.4",
    "@agency/config-tailwind": "workspace:*",
    "@agency/config-typescript": "workspace:*",
    "@agency/core-types": "workspace:*",
    "@agency/core-utils": "workspace:*",
    "@agency/core-constants": "workspace:*",
    "@agency/ui-theme": "workspace:*",
    "@agency/ui-icons": "workspace:*",
    "@agency/ui-design-system": "workspace:*",
    "@agency/analytics": "workspace:*",
    "@vercel/speed-insights": "latest",
    "@vercel/analytics": "latest"
  },
  "devDependencies": {
    "@agency/config-eslint": "workspace:*",
    "@agency/config-prettier": "workspace:*",
    "@types/node": "latest",
    "@types/react": "latest",
    "@types/react-dom": "latest",
    "typescript": "6.0.0"
  },
  "prettier": "@agency/config-prettier"
}
```

### `next.config.mjs`
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: [
    "@agency/ui-design-system",
    "@agency/ui-icons",
    "@agency/ui-theme",
    "@agency/core-utils",
    "@agency/core-types",
    "@agency/analytics",
  ],
  experimental: {
    typedRoutes: true,
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.cdn.sanity.io',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
  async redirects() {
    return [
      {
        source: '/home',
        destination: '/',
        permanent: true,
      },
    ];
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
```

### `src/app/layout.tsx`
```typescript
import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/react";
import { Header } from "@/components/navigation/header";
import { Footer } from "@/components/navigation/footer";
import { PageViewTracker } from "@/components/analytics/page-view-tracker";
import { siteMetadata } from "@/lib/metadata";
import "@agency/ui-theme/theme.css";
import "@agency/ui-design-system/styles.css";
import "./globals.css";

const inter = Inter({ 
  subsets: ["latin"],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = siteMetadata;

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#000000',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen bg-background font-sans antialiased">
        <Header />
        <main>{children}</main>
        <Footer />
        <PageViewTracker />
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  );
}
```

### `src/app/page.tsx`
```typescript
import type { Metadata } from "next";
import { Hero } from "@/components/sections/hero";
import { ServicesGrid } from "@/components/sections/services-grid";
import { PortfolioShowcase } from "@/components/sections/portfolio-showcase";
import { TestimonialCarousel } from "@/components/sections/testimonial-carousel";
import { CTABanner } from "@/components/sections/cta-banner";
import { generatePageMetadata } from "@/lib/metadata";

export const metadata: Metadata = generatePageMetadata({
  title: "Digital Agency | Strategy, Design & Development",
  description: "Award-winning digital agency specializing in brand strategy, web design, and development. We help ambitious brands grow through exceptional digital experiences.",
  openGraph: {
    images: ['/images/og-home.jpg'],
  },
});

export default function HomePage() {
  return (
    <>
      <Hero />
      <ServicesGrid />
      <PortfolioShowcase />
      <TestimonialCarousel />
      <CTABanner />
    </>
  );
}
```

### `src/app/env.ts`

```typescript
// Per-app environment composition (next-forge pattern)
// Self-contained apps compose their own environment from package dependencies

import { createEnv } from '@agency/core-env';
import { z } from 'zod';

export const env = createEnv({
  server: {
    // Database (if needed for forms/CMS)
    DATABASE_URL: z.string().url().optional(),
    
    // CRM integrations
    HUBSPOT_API_KEY: z.string().optional(),
    SALESFORCE_CLIENT_ID: z.string().optional(),
    
    // Email
    RESEND_API_KEY: z.string().optional(),
    
    // Rate limiting
    UPSTASH_REDIS_REST_URL: z.string().url().optional(),
    UPSTASH_REDIS_REST_TOKEN: z.string().optional(),
  },
  client: {
    // Site config
    NEXT_PUBLIC_SITE_URL: z.string().url().default('https://agency.com'),
    NEXT_PUBLIC_SITE_NAME: z.string().default('Digital Agency'),
    
    // Analytics (per docs/marketing/analytics)
    NEXT_PUBLIC_PLAUSIBLE_DOMAIN: z.string().optional(),
    NEXT_PUBLIC_POSTHOG_KEY: z.string().optional(),
    NEXT_PUBLIC_POSTHOG_HOST: z.string().url().optional(),
    NEXT_PUBLIC_GA4_MEASUREMENT_ID: z.string().optional(),
    
    // CMS
    NEXT_PUBLIC_SANITY_PROJECT_ID: z.string().optional(),
    NEXT_PUBLIC_SANITY_DATASET: z.string().default('production'),
    
    // Spam protection
    NEXT_PUBLIC_TURNSTILE_SITE_KEY: z.string().optional(),
    
    // Consent mode
    NEXT_PUBLIC_CONSENT_MODE: z.enum(['gdpr-ccpa', 'none']).default('gdpr-ccpa'),
  },
});

// Type exports for use throughout app
export type ServerEnv = typeof env.server;
export type ClientEnv = typeof env.client;
```

### Self-Contained App Rules

Per 2026 marketing monorepo standards:

1. **No App-to-App Imports** - This app must not import from `apps/*`
   ```typescript
   // ❌ Forbidden
   import { something } from '../../client-portal/src/lib/utils';
   
   // ✅ Correct
   import { something } from '@agency/core-utils';
   ```

2. **Package Consumption Only** - All shared code via `workspace:*` packages
   ```typescript
   // ✅ All from packages/
   import { Button } from '@agency/ui-design-system';
   import { track } from '@agency/analytics';
   import { LeadForm } from '@agency/lead-capture';
   ```

3. **Public Exports Only** - Never import from package internals
   ```typescript
   // ❌ Forbidden
   import { internalHelper } from '@agency/seo/src/internal/helpers';
   
   // ✅ Correct
   import { generateMetadata } from '@agency/seo';
   ```

4. **Own Environment** - Every env var defined in `src/app/env.ts`
5. **No Shared State** - Each app is independently deployable

### `src/lib/metadata.ts`
```typescript
import type { Metadata } from "next";

export const siteMetadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://agency.com"),
  title: {
    default: "Digital Agency | Strategy, Design & Development",
    template: "%s | Digital Agency",
  },
  description: "Award-winning digital agency specializing in brand strategy, web design, and development.",
  keywords: ["digital agency", "web design", "branding", "development", "marketing"],
  authors: [{ name: "Digital Agency" }],
  creator: "Digital Agency",
  publisher: "Digital Agency",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: "Digital Agency",
    images: [
      {
        url: "/images/og-default.jpg",
        width: 1200,
        height: 630,
        alt: "Digital Agency",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Digital Agency",
    description: "Award-winning digital agency specializing in brand strategy, web design, and development.",
    images: ["/images/twitter-default.jpg"],
    creator: "@agency",
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
  },
  alternates: {
    canonical: "/",
  },
};

interface PageMetadataOptions {
  title: string;
  description: string;
  openGraph?: {
    images?: string[];
  };
  noIndex?: boolean;
}

export function generatePageMetadata(options: PageMetadataOptions): Metadata {
  return {
    title: options.title,
    description: options.description,
    openGraph: {
      ...siteMetadata.openGraph,
      title: options.title,
      description: options.description,
      images: options.openGraph?.images || siteMetadata.openGraph?.images,
    },
    twitter: {
      ...siteMetadata.twitter,
      title: options.title,
      description: options.description,
      images: options.openGraph?.images || siteMetadata.twitter?.images,
    },
    robots: options.noIndex ? { index: false, follow: false } : siteMetadata.robots,
  };
}
```


## Feature Requirements

### Phase 1: Core Pages
- [ ] Homepage with hero, services, portfolio, testimonials, CTA
- [ ] Services page with detailed service offerings
- [ ] Work/Portfolio showcase with case studies
- [ ] About page with team and company story
- [ ] Contact page with form and location info

### Phase 2: Content Marketing
- [ ] Blog listing page
- [ ] Individual blog post pages with rich content
- [ ] Case study detail pages
- [ ] Category/tag filtering

### Phase 3: Lead Generation
- [ ] Contact form with validation
- [ ] Newsletter signup
- [ ] Lead magnet downloads
- [ ] Calendly/meeting scheduler integration

### Phase 4: Advanced Features
- [ ] Dark mode support
- [ ] Multi-language support (i18n)
- [ ] Search functionality
- [ ] RSS feed


## Technical Specifications

### Performance Targets
- **Lighthouse Score**: 95+ across all categories
- **First Contentful Paint**: < 1.5s
- **Largest Contentful Paint**: < 2.5s
- **Time to Interactive**: < 3.5s

### SEO Requirements
- Dynamic metadata per page
- Auto-generated sitemap.xml
- robots.txt with crawl rules
- OpenGraph/Twitter card images
- Canonical URLs
- Structured data (JSON-LD)

### Accessibility Requirements
- WCAG 2.1 AA compliance
- Semantic HTML structure
- Keyboard navigation
- Screen reader support
- Color contrast ratios


## Environment Variables

```bash
# Site Configuration
NEXT_PUBLIC_SITE_URL=https://agency.com
NEXT_PUBLIC_SITE_NAME="Digital Agency"

# Analytics (TASK_44)
NEXT_PUBLIC_PLAUSIBLE_DOMAIN=agency.com
NEXT_PUBLIC_POSTHOG_KEY=phc_...

# CMS (TASK_47 - optional)
NEXT_PUBLIC_SANITY_PROJECT_ID=...
NEXT_PUBLIC_SANITY_DATASET=production
NEXT_PUBLIC_SANITY_API_VERSION=2024-01-01

# Contact Form
CONTACT_FORM_WEBHOOK_URL=...
CONTACT_FORM_API_KEY=...

# Search (optional)
NEXT_PUBLIC_ALGOLIA_APP_ID=...
NEXT_PUBLIC_ALGOLIA_SEARCH_KEY=...
```


## Verification Checklist

- [ ] All pages have unique metadata
- [ ] OpenGraph images render correctly (1200x630)
- [ ] Sitemap.xml generated and accessible
- [ ] robots.txt properly configured
- [ ] Core Web Vitals pass in production
- [ ] Analytics events fire correctly
- [ ] Contact form submissions work
- [ ] Mobile responsive on all pages
- [ ] Accessibility audit passes (axe-core)
- [ ] Cross-browser testing (Chrome, Safari, Firefox)


## Deployment

1. Create Vercel project
2. Set environment variables in Vercel dashboard
3. Connect custom domain
4. Enable Vercel Speed Insights
5. Enable Vercel Analytics
6. Run Lighthouse CI on PRs
