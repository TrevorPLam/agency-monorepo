# 51-data-cms: Constraints & Critical Rules

## Purpose

This document defines the hard constraints, performance boundaries, and critical rules that govern the `@agency/data-cms` package. These constraints ensure consistent, performant, and secure content management across all Sanity-backed sites.

## Schema Design Constraints

### Fragment Reusability Rule

Schema fragments must be generic enough for multiple clients:

```typescript
// CORRECT - Generic SEO fields reusable across clients
export const seoFields = defineField({
  name: 'seo',
  type: 'object',
  fields: [
    { name: 'metaTitle', type: 'string' },
    { name: 'metaDescription', type: 'text' },
  ],
});

// INCORRECT - Client-specific branding in shared fragment
export const seoFields = defineField({
  name: 'seo',
  type: 'object',
  fields: [
    { name: 'clientLogo', type: 'image' },  // Too specific
    { name: 'brandColor', type: 'string' }, // Belongs in app
  ],
});
```

### Type Definition Consistency

All schema fragments must have corresponding TypeScript types:

```typescript
// schema/fragments/seo-fields.ts
export const seoFields = { ... };

// types/seo.ts
export interface SEOFields {
  metaTitle?: string;
  metaDescription?: string;
}

// Schema and types must stay in sync
```

### Field Naming Conventions

| Pattern | Use | Example |
|---------|-----|---------|
| camelCase | Field names | `heroImage`, `ctaButton` |
| snake_case | Sanity internal | `_type`, `_id` |
| PascalCase | Type names | `BlogPost`, `Author` |
| kebab-case | Slugs | `my-blog-post` |

## Preview Mode Constraints

### Draft Mode Requirements

All Sanity-backed sites must implement Draft Mode (not Preview Mode):

```typescript
// CORRECT - Next.js 16 Draft Mode
import { draftMode } from 'next/headers';

export async function GET(request: Request) {
  const draft = await draftMode();
  draft.enable();
  // ...
}

// INCORRECT - Deprecated Preview Mode
import { previewData } from 'next/headers';  // Don't use
```

### Preview Security

| Requirement | Implementation |
|-------------|----------------|
| Secret validation | Compare against SANITY_PREVIEW_SECRET |
| HTTPS only | Never enable over HTTP |
| Token expiration | 8-hour cookie TTL |
| Access logging | Log all preview enable/disable |
| IP allowlist | Optional for enterprise |

### Stega Configuration

```typescript
// CORRECT - Stega enabled for visual editing
export const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  stega: {
    enabled: true,
    studioUrl: process.env.NEXT_PUBLIC_SANITY_STUDIO_URL,
  },
});

// INCORRECT - Missing Stega
export const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  // No stega config = no click-to-edit
});
```

## Performance Constraints

### Query Limits

| Constraint | Limit | Notes |
|------------|-------|-------|
| Max documents per query | 100 | Pagination required beyond |
| Max query complexity | Level 3 | Sanity GROQ complexity |
| Cache TTL (production) | 60 seconds | ISR revalidation |
| Cache TTL (preview) | 0 | Always fresh |
| API timeout | 10 seconds | Fail fast |

### GROQ Query Optimization

```groq
// CORRECT - Select only needed fields
*[_type == "post"][0...20] {
  _id,
  title,
  slug,
  publishedAt,
  "author": author->name  // Single dereference
}

// INCORRECT - Selecting everything
*[_type == "post"] {  // No limit
  ...,  // All fields including heavy content
  author-> { ... }  // Deep dereference
}
```

### Image Optimization

```typescript
// CORRECT - Use Sanity image URL builder
import imageUrlBuilder from '@sanity/image-url';

const builder = imageUrlBuilder(client);
const url = builder.image(imageSource)
  .width(800)
  .format('webp')
  .quality(80)
  .url();

// INCORRECT - Raw image URL
const url = imageSource.asset.url;  // Full resolution, no optimization
```

## Content Modeling Constraints

### Document Types

| Type | Use For | Avoid For |
|------|---------|-----------|
| `document` | Top-level content | Reusable components |
| `object` | Reusable fragments | Standalone content |
| `array` | Lists of items | Single values |
| `reference` | Relationships | Embedded content |
| `slug` | URL paths | Non-URL identifiers |

### Reference Patterns

```typescript
// CORRECT - Use references for relationships
export const post = defineType({
  name: 'post',
  type: 'document',
  fields: [
    {
      name: 'author',
      type: 'reference',
      to: [{ type: 'author' }],  // Separate document
    },
  ],
});

// INCORRECT - Embedding related data
export const post = defineType({
  name: 'post',
  type: 'document',
  fields: [
    {
      name: 'author',
      type: 'object',  // Don't embed
      fields: [/* author fields */],
    },
  ],
});
```

## Security Constraints

### API Token Storage

| Token | Storage | Scope |
|-------|---------|-------|
| SANITY_API_READ_TOKEN | Server env only | Server Components |
| SANITY_API_WRITE_TOKEN | Server env only | API routes only |
| NEXT_PUBLIC_SANITY_PROJECT_ID | Public env | Client + Server |
| NEXT_PUBLIC_SANITY_DATASET | Public env | Client + Server |
| SANITY_PREVIEW_SECRET | Server env only | Draft mode API |

### Content Security Policy

```typescript
// next.config.js
const cspHeader = `
  default-src 'self';
  script-src 'self' 'unsafe-eval' 'unsafe-inline';
  style-src 'self' 'unsafe-inline';
  img-src 'self' https://cdn.sanity.io data: blob:;
  connect-src 'self' https://*.sanity.io;
`;
```

## Studio Configuration Constraints

### Required Plugins

Every Studio must include:

```typescript
// sanity.config.ts minimum viable config
export default defineConfig({
  plugins: [
    structureTool(),           // Document navigation
    visionTool(),              // GROQ playground (dev only)
    presentationTool({         // Visual Editing
      previewUrl: { ... },
    }),
  ],
});
```

### Desk Structure Organization

```typescript
// Standard structure for all clients
export const structure = (S) =>
  S.list()
    .title('Content')
    .items([
      S.documentTypeListItem('page').title('Pages'),
      S.documentTypeListItem('post').title('Blog Posts'),
      S.documentTypeListItem('author').title('Authors'),
      S.divider(),
      S.documentTypeListItem('settings').title('Site Settings'),
    ]);
```

## Version Control Constraints

### Schema Changes

| Change | Migration Required | Client Impact |
|--------|-------------------|---------------|
| Add field | No | None if optional |
| Rename field | Yes | Studio will show old data as orphaned |
| Remove field | Yes | Data loss if not migrated |
| Change type | Yes | Potential data loss |
| Add document type | No | New content type available |
| Remove document type | Yes | Existing documents become orphaned |

### Schema Versioning

```typescript
// Include version in schema definition
export const post = defineType({
  name: 'post',
  type: 'document',
  fields: [
    // Schema version tracking
    defineField({
      name: '_schemaVersion',
      type: 'string',
      initialValue: '2.0',
      readOnly: true,
    }),
    // ... other fields
  ],
});
```

## Error Handling Constraints

### API Error Categories

| Error | Status Code | Retry Strategy |
|-------|-------------|----------------|
| Rate limit (429) | 429 | Exponential backoff |
| Query error (400) | 400 | Don't retry, fix query |
| Auth error (401) | 401 | Check token, don't retry |
| Not found (404) | 404 | Don't retry |
| Server error (500) | 500 | Retry 3x with backoff |
| Timeout | 504 | Retry once, then fail |

### Fallback Content

```typescript
// Provide fallback for missing content
export async function getPost(slug: string) {
  const post = await client.fetch(POST_QUERY, { slug });
  
  if (!post) {
    // Return fallback instead of null
    return {
      title: 'Post Not Found',
      content: 'This post is no longer available.',
      _id: 'fallback',
    };
  }
  
  return post;
}
```

## Testing Constraints

### Required Test Coverage

| Component | Coverage | Test Types |
|-----------|----------|------------|
| Schema fragments | 100% | Unit (compile check) |
| GROQ queries | 100% | Integration |
| Type generation | 100% | Unit |
| Preview mode | 80% | E2E |
| Visual Editing | 60% | Manual |

### Mock Data Requirements

```typescript
// Use realistic mock data
export const mockPost = {
  _id: 'post-123',
  _type: 'post',
  title: 'Test Post Title',
  slug: { current: 'test-post' },
  publishedAt: '2026-04-08T12:00:00Z',
  content: [/* Portable Text */],
  author: {
    _type: 'reference',
    _ref: 'author-456',
  },
};
```

## Compliance Constraints

### Content Retention

| Content Type | Retention | Notes |
|--------------|-----------|-------|
| Published content | Indefinite | Keep for SEO |
| Draft content | 90 days | Purge abandoned drafts |
| Revision history | 30 days | Sanity keeps versions |
| Asset files | Indefinite | Linked to documents |

### Accessibility Requirements

All content models must support:
- Alt text for images
- Captions for media
- Transcripts for audio/video
- Semantic heading hierarchy
- Color contrast metadata

## Multi-Site Constraints

### Project Isolation

Each client site must have:
- Separate Sanity project OR
- Separate dataset within shared project
- Never share documents between clients

### Shared Fragments

Only generic fragments in `@agency/data-cms`:
- SEO fields
- Image galleries
- Author bios
- Navigation structures

Client-specific schemas belong in app directories.

## Violation Response

Schema violations must be:
1. Caught by CI type-checking
2. Blocked in code review
3. Documented with migration plan
4. Escalated if security-related

## References

- `docs/architecture/ADRs/005-data-cms-adr-visual-editing.md`
- `docs/AGENTS.md` Package Boundaries
- `docs/DEPENDENCY.md` §7 CMS Layer
- [Sanity Schema Docs](https://www.sanity.io/docs/schema-types)
- [GROQ Reference](https://www.sanity.io/docs/groq-reference)
