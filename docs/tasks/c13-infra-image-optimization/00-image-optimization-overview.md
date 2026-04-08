# c13-infra-image-optimization: Image Optimization Policy and Performance Budgets

## Purpose
Establish image optimization standards and performance budgets as part of 2026 production monorepo requirements. Marketing repositories are unusually sensitive to asset bloat, CLS (Cumulative Layout Shift), and LCP (Largest Contentful Paint) regressions.

## Dependencies
- `00-foundation` - Root scaffolding
- `30-ui-theme` - Design tokens for image aspect ratios
- `e3-apps-agency-website` - First app to enforce standards

## Scope

### Image Standards

1. **Format Requirements**
   - WebP as default format
   - AVIF for hero/large images (when supported)
   - JPEG fallback for older browsers
   - SVG for icons/logos

2. **Size Constraints**
   - Max 200KB for above-fold images
   - Max 100KB for thumbnails
   - Max 500KB for hero images
   - Lazy load below-fold images

3. **Dimensions**
   - Provide responsive srcset
   - Define aspect ratios in theme
   - Never exceed 2x DPR for most images

### Next.js Image Configuration

```javascript
// apps/agency-website/next.config.js
module.exports = {
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.sanity.io',
      },
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
    ],
  },
};
```

### Shared Image Components

```typescript
// packages/ui/design-system/src/components/image.tsx
import NextImage from 'next/image';

interface OptimizedImageProps {
  src: string;
  alt: string;
  priority?: boolean;
  size: 'thumbnail' | 'content' | 'hero';
  aspectRatio?: '16:9' | '4:3' | '1:1' | '3:2';
}

const sizeConstraints = {
  thumbnail: { maxWidth: 400, quality: 75 },
  content: { maxWidth: 800, quality: 80 },
  hero: { maxWidth: 1920, quality: 85 },
};

export function OptimizedImage({
  src,
  alt,
  priority = false,
  size,
  aspectRatio = '16:9',
}: OptimizedImageProps) {
  const constraints = sizeConstraints[size];
  
  return (
    <NextImage
      src={src}
      alt={alt}
      width={constraints.maxWidth}
      height={calculateHeight(constraints.maxWidth, aspectRatio)}
      quality={constraints.quality}
      priority={priority}
      sizes={getSizes(size)}
    />
  );
}
```

### Performance Budgets

```javascript
// performance-budgets.config.js
module.exports = {
  images: {
    '/**': {
      maxLighthouseScore: 90,
      maxLCP: 2500, // ms
      maxCLS: 0.1,
      maxImageWeight: 200 * 1024, // 200KB
    },
    '/blog/**': {
      maxImageWeight: 100 * 1024, // 100KB for thumbnails
    },
  },
};
```

### CI Integration

```yaml
# .github/workflows/ci.yml
jobs:
  image-audit:
    name: Image Optimization Audit
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: pnpm install
      - run: pnpm run build
      
      - name: Check image sizes
        run: pnpm image-audit
        
      - name: Lighthouse CI
        run: pnpm lhci autorun
```

## Critical Requirements

1. **Explicit Dimensions**
   - Always provide width/height
   - Use aspect-ratio CSS
   - Prevent layout shift

2. **Priority Loading**
   - Above-fold images: `priority={true}`
   - LCP candidates: Preload
   - Below-fold: Lazy loading

3. **CMS Integration**
   - Sanity image URL builder with params
   - Dynamic sizing from CMS
   - Responsive image variants

## Build Condition

**Add immediately** - Image optimization is explicitly required in 2026 production references for marketing repositories.

## Verification

```bash
# Check image sizes
pnpm image-audit

# Lighthouse CI
pnpm lhci autorun
```
