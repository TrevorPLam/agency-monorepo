# ADR 005: Data CMS - Visual Editing Architecture (Draft Mode + Stega)

## Status

Accepted

## Date

2026-04-08

## Context

The `@agency/data-cms` package provides Sanity integration for content-managed sites. Content editors need a seamless preview experience where they can see draft content and edit directly from the rendered page.

Historically, Next.js provided "Preview Mode" for this purpose. However, Next.js 16 introduced **Draft Mode** as the successor, and Sanity introduced **Visual Editing** with **Stega** (steganography) for click-to-edit functionality.

We needed to decide on the canonical preview architecture for Sanity-backed sites in the monorepo.

## Decision

Implement **Visual Editing with Draft Mode** as the standard preview architecture:

```
┌─────────────────────────────────────────────────────────────┐
│                     SANITY STUDIO                           │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  Presentation Tool (iframe)                        │    │
│  │  - Renders preview URL in embedded frame           │    │
│  │  - Provides document navigator sidebar             │    │
│  └──────────────────────┬────────────────────────────────┘    │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        │ Draft Mode Token + Stega Links
                        ▼
┌─────────────────────────────────────────────────────────────┐
│                  NEXT.JS APP (Draft Mode)                   │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  /api/draft (Draft Mode API Route)                  │    │
│  │  - Validates secret token from Sanity               │    │
│  │  - Enables Next.js Draft Mode                     │    │
│  │  - Sets preview cookie                            │    │
│  └──────────────────────┬────────────────────────────────┘    │
│                         │                                   │
│  ┌──────────────────────▼────────────────────────────────┐   │
│  │  Page Components (with Stega)                        │   │
│  │  - Renders draft content when in Draft Mode        │   │
│  │  - Stega-encoded links enable click-to-edit        │   │
│  │  - Visual Editing overlay from @sanity/overlays    │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## Key Technologies

| Technology | Purpose | Package |
|------------|---------|---------|
| **Draft Mode** | Next.js 16 preview state | `next` built-in |
| **Stega** | Invisible edit markers in text | `@sanity/client` (via `stega` option) |
| **Presentation Tool** | Studio plugin for preview iframe | `sanity/presentation` |
| **Visual Editing** | Click-to-edit overlay | `@sanity/overlays` |
| **next-sanity** | Integration helpers | `next-sanity` |

## Implementation Pattern

### 1. Sanity Config (sanity.config.ts)

```typescript
import { defineConfig } from 'sanity';
import { presentationTool } from 'sanity/presentation';

export default defineConfig({
  // ... other config
  plugins: [
    presentationTool({
      previewUrl: {
        origin: process.env.NEXT_PUBLIC_SITE_URL,
        previewMode: {
          enable: '/api/draft',
          disable: '/api/disable-draft',
        },
      },
    }),
  ],
});
```

### 2. Draft Mode API Route (/app/api/draft/route.ts)

```typescript
import { draftMode } from 'next/headers';
import { redirect } from 'next/navigation';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get('secret');
  const slug = searchParams.get('slug');

  // Validate secret against SANITY_PREVIEW_SECRET
  if (secret !== process.env.SANITY_PREVIEW_SECRET) {
    return new Response('Invalid token', { status: 401 });
  }

  // Enable Draft Mode
  const draft = await draftMode();
  draft.enable();

  // Redirect to the requested path
  redirect(slug || '/');
}
```

### 3. Client with Stega (/lib/sanity.client.ts)

```typescript
import { createClient } from 'next-sanity';

export const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: '2025-08-06',
  useCdn: false, // Always fresh for preview
  stega: {
    enabled: true,
    studioUrl: process.env.NEXT_PUBLIC_SANITY_STUDIO_URL,
  },
});
```

### 4. Visual Editing Overlay (layout.tsx or page.tsx)

```typescript
import { VisualEditing } from '@sanity/overlays/app';
import { draftMode } from 'next/headers';

export default async function RootLayout({ children }) {
  const draft = await draftMode();

  return (
    <html>
      <body>
        {children}
        {draft.isEnabled && <VisualEditing />}
      </body>
    </html>
  );
}
```

## Decision Rationale

### Why Draft Mode over Preview Mode?

1. **Next.js 16 Native**: Draft Mode is the built-in successor to Preview Mode
2. **Simpler API**: `draftMode()` from `next/headers` vs manual cookie handling
3. **Better Integration**: Works seamlessly with App Router and Server Components
4. **Future-Proof**: Preview Mode is deprecated in Next.js 16+

### Why Stega for click-to-edit?

1. **Invisible**: Encoded links don't affect rendered appearance
2. **Contextual**: Click any text to jump to that exact field in Studio
3. **No Configuration**: Automatic encoding via `stega` client option
4. **Performance**: Minimal overhead (~20 bytes per link)

### Why Presentation Tool?

1. **Integrated**: Native Studio plugin, no external tools needed
2. **Navigation**: Sidebar document navigator for quick content switching
3. **Iframe Security**: Sandboxed preview with secure token exchange
4. **Mobile Preview**: Built-in viewport switching for responsive testing

## Consequences

### Positive

- Content editors get true WYSIWYG editing experience
- No separate preview URLs to manage
- Draft Mode is standard Next.js, well-documented
- Stega works with any text content, no component changes needed

### Negative

- Stega adds small payload overhead (~20 bytes per encoded string)
- Visual Editing overlay requires client-side JavaScript
- Draft Mode requires careful secret management
- Presentation Tool requires Studio configuration per site

### Neutral

- Both Draft Mode and Stega are optional (can use either independently)
- Preview vs production rendering paths must be tested separately
- CDN caching must respect Draft Mode cookies

## Migration from Preview Mode

Sites using the old Preview Mode should migrate:

```diff
// Before: Preview Mode
- import { previewData } from 'next/headers';
- if (previewData()) { /* render preview */ }

// After: Draft Mode
+ import { draftMode } from 'next/headers';
+ const draft = await draftMode();
+ if (draft.isEnabled) { /* render preview */ }
```

## Environment Variables

```bash
# Required for Visual Editing
NEXT_PUBLIC_SANITY_PROJECT_ID=xxx
NEXT_PUBLIC_SANITY_DATASET=production
NEXT_PUBLIC_SANITY_STUDIO_URL=https://studio.example.com
SANITY_PREVIEW_SECRET=random-secret-for-draft-mode
SANITY_API_TOKEN=token-for-draft-content-fetching
```

## When to Enable Visual Editing

| Site Type | Draft Mode | Stega | Presentation Tool |
|-----------|------------|-------|-------------------|
| Marketing site (CMS-backed) | ✅ Yes | ✅ Yes | ✅ Yes |
| Client portal (dynamic) | ✅ Yes | ❌ No | ❌ No |
| Static brochure site | ⚠️ Optional | ⚠️ Optional | ❌ No |
| Multi-site shared CMS | ✅ Yes | ✅ Yes | ✅ Yes |

## Security Considerations

1. **Secret Rotation**: `SANITY_PREVIEW_SECRET` should rotate periodically
2. **Token Expiration**: Draft Mode cookies should have reasonable TTL (e.g., 8 hours)
3. **HTTPS Only**: Never enable Draft Mode over HTTP in production
4. **Access Control**: Consider IP allowlisting for preview environments

## Alternatives Considered

### Alternative: External Preview Deployment

**Why rejected**: Requires separate infrastructure, doesn't provide click-to-edit, more complex content sync.

### Alternative: Live Preview Webhooks

**Why rejected**: Webhooks have latency, don't support real-time collaborative editing like Presentation Tool.

### Alternative: Custom Preview Overlay

**Why rejected**: Sanity's Visual Editing overlay is well-maintained, feature-rich, and officially supported.

## References

- `docs/tasks/51-data-cms/02-data-cms-guide-preview.md`
- `docs/DEPENDENCY.md` §7 CMS Layer
- [Sanity Visual Editing Docs](https://www.sanity.io/docs/visual-editing)
- [Next.js Draft Mode](https://nextjs.org/docs/app/building-your-configuring/draft-mode)
- [Stega Documentation](https://www.sanity.io/docs/stega)

## Verification Checklist

- [ ] Draft Mode API route implemented and tested
- [ ] Stega enabled in Sanity client configuration
- [ ] Presentation Tool configured in sanity.config.ts
- [ ] Visual Editing overlay conditionally rendered
- [ ] Secret validation working correctly
- [ ] Preview cookie TTL configured
- [ ] CDN/cache respects Draft Mode
- [ ] Content editors trained on new workflow
