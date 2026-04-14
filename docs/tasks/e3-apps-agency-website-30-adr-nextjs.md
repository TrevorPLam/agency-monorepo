# e3-apps-agency-website: ADR - Next.js App Router Selection

## Context

The agency website requires a modern, performant, SEO-friendly architecture that can be maintained by AI coding tools and support future growth.

## Decision

Use Next.js 16.2 App Router as the exclusive routing and rendering framework.

## Consequences

### Positive

- Server Components for static content = smaller bundles
- Streaming SSR for improved performance
- Built-in SEO with metadata API
- Route Handlers for API endpoints
- Image optimization built-in
- Static generation at build time

### Negative

- Learning curve for Pages Router developers
- Some third-party libraries not yet compatible
- Client/Server boundary awareness required

## Alternatives Considered

### Pages Router

**Rejected**: App Router is the future of Next.js. Pages Router is in maintenance mode.

### Remix

**Rejected**: Excellent framework but different mental model. Next.js provides better deployment integration with Vercel.

### Astro

**Rejected**: Great for content sites but less ecosystem support for complex interactions. Next.js provides better React ecosystem compatibility.

## Implementation

```typescript
// app/layout.tsx - Root layout with metadata
export const metadata = {
  title: 'Digital Agency | Strategy, Design & Development',
  description: 'Award-winning digital agency specializing in brand strategy.',
};
```

## References

- Next.js 16.2 Release Notes: https://nextjs.org/blog/next-16-2
- App Router Documentation: https://nextjs.org/docs/app
