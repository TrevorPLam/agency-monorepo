# 51-data-cms/01-cms-preview: CMS Preview Workflow

## Purpose

Extend the `@agency/data-cms` package with live preview capabilities for Sanity CMS. Enables content editors to preview drafts before publishing, with real-time visual editing support.

## Rationale (Extends Existing Package)

This extends `packages/data/cms-schemas` rather than creating a new package because:
- Preview is inherently tied to CMS data fetching and schema
- Sanity's preview mode requires the same client configuration
- Content models and queries are shared between production and preview
- Keeping preview in data-cms ensures preview and production stay in sync

## Dependencies

- `51-data-cms` - base Sanity integration
- `40-seo` - for preview metadata handling

## Files

Add to `packages/data/cms-schemas/`:

```
packages/data/cms-schemas/
├── src/
│   ├── preview/
│   │   ├── index.ts
│   │   ├── client.ts
│   │   ├── store.ts
│   │   ├── loader.tsx
│   │   └── token.ts
│   ├── visual-editing/
│   │   ├── index.ts
│   │   ├── overlay.tsx
│   │   └── studio.tsx
│   └── index.ts (updated exports)
```

### `src/preview/client.ts`

```typescript
import { createClient } from "next-sanity";
import { sanityConfig } from "../config";

/**
 * Client for fetching draft content in preview mode
 */
export const previewClient = createClient({
  ...sanityConfig,
  useCdn: false,
  token: process.env.SANITY_API_READ_TOKEN,
  perspective: "previewDrafts",
});

/**
 * Check if preview mode is active
 */
export function isPreviewMode(): boolean {
  return process.env.SANITY_PREVIEW_SECRET !== undefined;
}
```

### `src/preview/store.ts`

```typescript
import { create } from "zustand";
import type { SanityDocument } from "next-sanity";

interface PreviewState {
  isEnabled: boolean;
  token: string | null;
  draft: SanityDocument | null;
  published: SanityDocument | null;
  setPreviewData: (token: string, draft: SanityDocument) => void;
  disablePreview: () => void;
}

export const usePreviewStore = create<PreviewState>((set) => ({
  isEnabled: false,
  token: null,
  draft: null,
  published: null,
  setPreviewData: (token, draft) =>
    set({ isEnabled: true, token, draft }),
  disablePreview: () =>
    set({ isEnabled: false, token: null, draft: null }),
}));
```

### `src/preview/loader.tsx`

```typescript
"use client";

import { useEffect } from "react";
import { usePreviewStore } from "./store";
import type { SanityDocument } from "next-sanity";

interface PreviewLoaderProps {
  draft: SanityDocument;
  token: string;
  children: React.ReactNode;
}

export function PreviewLoader({ draft, token, children }: PreviewLoaderProps) {
  const setPreviewData = usePreviewStore((state) => state.setPreviewData);

  useEffect(() => {
    setPreviewData(token, draft);
  }, [draft, token, setPreviewData]);

  return (
    <>
      <PreviewBanner />
      {children}
    </>
  );
}

function PreviewBanner() {
  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-yellow-500 text-black px-4 py-2 text-center text-sm font-medium">
      Preview Mode -{" "}
      <a
        href="/api/exit-preview"
        className="underline hover:no-underline"
        prefetch={false}
      >
        Exit Preview
      </a>
    </div>
  );
}
```

### `src/visual-editing/overlay.tsx`

```typescript
"use client";

import { useEffect } from "react";
import { enableVisualEditing } from "@sanity/overlays";

interface VisualEditingOverlayProps {
  studioUrl: string;
}

export function VisualEditingOverlay({ studioUrl }: VisualEditingOverlayProps) {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") {
      enableVisualEditing({
        studioUrl,
        zIndex: 999999,
      });
    }
  }, [studioUrl]);

  return null;
}
```

### Updated `src/index.ts` exports

```typescript
// ... existing exports

// Preview mode
export { previewClient, isPreviewMode } from "./preview/client";
export { usePreviewStore } from "./preview/store";
export { PreviewLoader } from "./preview/loader";

// Visual editing
export { VisualEditingOverlay } from "./visual-editing/overlay";
```

## App-Level Implementation

Apps using CMS preview need these additional files:

### `app/api/preview/route.ts`

```typescript
import { draftMode } from "next/headers";
import { redirect } from "next/navigation";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get("secret");
  const slug = searchParams.get("slug");

  if (secret !== process.env.SANITY_PREVIEW_SECRET) {
    return new Response("Invalid token", { status: 401 });
  }

  draftMode().enable();
  redirect(slug || "/");
}
```

### `app/api/exit-preview/route.ts`

```typescript
import { draftMode } from "next/headers";
import { redirect } from "next/navigation";

export async function GET() {
  draftMode().disable();
  redirect("/");
}
```

### Page with Preview Support

```typescript
// app/blog/[slug]/page.tsx
import { draftMode } from "next/headers";
import { previewClient, sanityClient } from "@agency/data-cms";
import { PreviewLoader } from "@agency/data-cms/preview";
import { VisualEditingOverlay } from "@agency/data-cms/visual-editing";
import { BlogPost } from "./BlogPost";

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  const { isEnabled } = draftMode();
  const client = isEnabled ? previewClient : sanityClient;
  
  const post = await client.fetch(blogPostQuery, { slug: params.slug });
  
  if (!post) {
    return <div>Post not found</div>;
  }

  return (
    <>
      {isEnabled && (
        <>
          <PreviewLoader draft={post} token={process.env.SANITY_PREVIEW_SECRET!}>
            <BlogPost post={post} />
          </PreviewLoader>
          <VisualEditingOverlay studioUrl="https://agency.sanity.studio" />
        </>
      )}
      {!isEnabled && <BlogPost post={post} />}
    </>
  );
}
```

## Dependencies to Add

```json
{
  "dependencies": {
    "@sanity/overlays": "^2.0.0",
    "zustand": "^4.5.0"
  }
}
```

## Environment Variables

```bash
# .env.local
SANITY_PREVIEW_SECRET=your-preview-secret
SANITY_API_READ_TOKEN=your-read-token-with-draft-access
```

## Verification Steps

1. Enable preview mode by visiting `/api/preview?secret=YOUR_SECRET&slug=/blog/hello-world`
2. Verify yellow preview banner appears
3. Edit content in Sanity Studio and see it update in real-time
4. Click "Exit Preview" to return to published content
5. Verify draft content doesn't appear in production build

## Security Considerations

- Preview secret should be strong and rotated regularly
- Preview mode should only work in non-production for public sites
- Consider IP restrictions for preview endpoints
- Draft content is still public if someone has the preview URL

## Success Criteria

- [ ] Preview banner displays when in draft mode
- [ ] Draft content fetches correctly
- [ ] Exit preview link works
- [ ] Visual editing overlay loads (if using Sanity Studio)
- [ ] Published builds never include draft content
- [ ] Preview token validates correctly
- [ ] Preview state managed in Zustand store
