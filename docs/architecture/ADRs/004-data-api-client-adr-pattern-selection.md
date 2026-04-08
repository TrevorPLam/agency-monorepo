# ADR 004: Data API Client - Pattern Selection (tRPC vs REST vs GraphQL)

## Status

Accepted

## Date

2026-04-08

## Context

The `@agency/data-api-client` package provides typed API clients for internal service-to-service communication. We needed to select the appropriate API pattern for internal calls between apps in the monorepo.

The 2026 landscape offers several mature options:
- **tRPC**: End-to-end TypeScript type safety, zero runtime overhead
- **REST + OpenAPI**: Universal, cacheable, well-understood
- **GraphQL**: Flexible queries, client-driven data fetching
- **Server Actions**: Next.js native, simplest for mutations

The choice affects developer experience, type safety, performance, and the ability to scale to multiple client types.

## Decision

Implement a **hybrid API architecture** with pattern selection based on consumer:

```
┌─────────────────────────────────────────────────────────┐
│  INTERNAL APPS (TypeScript Monorepo)                    │
│  ┌─────────────────────────────────────────────────┐   │
│  │  tRPC (Primary)                                  │   │
│  │  - End-to-end type safety                        │   │
│  │  - Zod validation                                │   │
│  │  - No API documentation overhead                 │   │
│  │  - TanStack Query integration                    │   │
│  └─────────────────────────────────────────────────┘   │
│                                                          │
│  Server Actions (Mutations)                            │
│  - Simple form submissions                             │
│  - Direct Next.js integration                          │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  PUBLIC / EXTERNAL APIs                                 │
│  ┌─────────────────────────────────────────────────┐   │
│  │  REST + OpenAPI 3.1 (Primary)                    │   │
│  │  - Universal client support                        │   │
│  │  - HTTP caching + CDN friendly                     │   │
│  │  - Generated SDKs for any language               │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  MULTI-SOURCE CONTENT (Federation)                      │
│  ┌─────────────────────────────────────────────────┐   │
│  │  GraphQL (When Needed)                           │   │
│  │  - Multiple CMS sources                          │   │
│  │  - Client-driven queries                         │   │
│  │  - Complex nested relationships                  │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

## Implementation Guidance

### Internal Apps: tRPC

```typescript
// packages/data/api-client/src/trpc/client.ts
import { createTRPCReact } from '@trpc/react-query';
import type { AppRouter } from './router';

export const trpc = createTRPCReact<AppRouter>();

// Usage in consuming app
function ProjectList() {
  const { data } = trpc.projects.list.useQuery({ clientId });
  return <ul>{data?.map(p => <li key={p.id}>{p.name}</li>)}</ul>;
}
```

### Public APIs: REST + OpenAPI

```typescript
// packages/data/api-client/src/rest/client.ts
import { createApiClient } from './client';
import type { paths } from './openapi-types';

export const api = createApiClient<paths>({
  baseUrl: process.env.API_URL,
});

// Usage with full type safety
const response = await api.get('/projects/{id}', {
  params: { path: { id: '123' } }
});
```

### Multi-Source Content: GraphQL (Conditional)

Only implement when `@agency/data-content-federation` is activated (2+ CMS sources).

## Decision Rationale

### Why tRPC for internal?

1. **Type Safety**: Change a database column → type error at UI layer instantly
2. **Zero Documentation**: TypeScript IS the API contract
3. **Performance**: No runtime overhead, no schema serialization
4. **DX**: Autocomplete, inline errors, refactor-safe
5. **Ecosystem**: Mature TanStack Query integration

### Why REST for external?

1. **Universality**: Any language/platform can consume
2. **Caching**: HTTP caching + CDN = free scaling
3. **Tooling**: OpenAPI generates SDKs for all languages
4. **Familiarity**: Every developer understands REST

### Why conditional GraphQL?

GraphQL adds complexity that is only justified when:
- Multiple content sources need unified querying
- Different clients need different data shapes
- Complex nested relationships are common

For single-CMS sites, REST or direct SDK is simpler.

## Consequences

### Positive

- Internal apps get maximum type safety with minimal overhead
- External integrations have stable, documented APIs
- Each pattern serves its specific use case optimally
- Migration path exists (can add REST layer on top of tRPC)

### Negative

- Two patterns to maintain (tRPC for internal, REST for external)
- Learning curve for developers new to tRPC
- GraphQL adds significant complexity when activated

### Neutral

- Both patterns can coexist in the same app
- Provider selection is environment-driven
- Testing strategy differs by pattern

## Package Structure

```
packages/data/api-client/
├── src/
│   ├── index.ts                 # Main exports
│   ├── trpc/                    # Internal pattern
│   │   ├── client.ts
│   │   ├── router.ts
│   │   └── procedures/
│   ├── rest/                    # External pattern
│   │   ├── client.ts
│   │   ├── openapi-types.ts
│   │   └── interceptors/
│   └── graphql/                 # Federation pattern (conditional)
│       ├── client.ts
│       └── fragments/
├── package.json
└── README.md
```

## When to Use Each Pattern

| Scenario | Pattern | Package Export |
|----------|---------|----------------|
| Internal tool → Internal API | tRPC | `@agency/data-api-client/trpc` |
| Client portal → Internal API | tRPC | `@agency/data-api-client/trpc` |
| Third-party integration | REST | `@agency/data-api-client/rest` |
| Mobile app → API | REST or GraphQL | `@agency/data-api-client/rest` |
| Multi-CMS content query | GraphQL | `@agency/data-api-client/graphql` |
| Simple form submission | Server Actions | Next.js built-in |

## Selection Flowchart

```
Who consumes the API?
│
├── External developers / public API
│   └── REST + OpenAPI 3.1
│       (universal, cacheable, documented)
│
├── Your own frontend (TypeScript monorepo)
│   ├── Simple data needs?
│   │   └── tRPC
│   │       (zero overhead, max type safety)
│   └── Complex nested data / multiple clients?
│       └── GraphQL
│           (flexible queries, client-driven)
│
└── Service-to-service (internal microservices)
    ├── Need streaming / high throughput?
    │   └── gRPC
    │       (binary protocol, native streaming)
    └── Simple CRUD between few services?
        └── tRPC or REST
            (keep it simple)
```

## Alternatives Considered

### Alternative: GraphQL for Everything

**Why rejected**: Adds unnecessary complexity for internal TypeScript apps where tRPC provides better DX. GraphQL's flexibility is only valuable with multiple client types.

### Alternative: REST for Everything

**Why rejected**: Loses end-to-end type safety for internal apps. Manual API documentation and SDK maintenance overhead.

### Alternative: Server Actions for Everything

**Why rejected**: Server Actions are Next.js-specific and couple frontend to backend. Not suitable for service-to-service calls or external APIs.

## References

- `docs/tasks/52-data-api-client/`
- `docs/DEPENDENCY.md` §13 Internal Package Dependencies
- `docs/ARCHITECTURE.md` Data Domain
- [tRPC Documentation](https://trpc.io)
- [OpenAPI 3.1 Specification](https://spec.openapis.org/oas/v3.1.0)

## Migration Path

Existing REST internal APIs can be gradually migrated:

1. Add tRPC router alongside existing REST endpoints
2. Update internal consumers to use tRPC client
3. Deprecate internal REST endpoints
4. Remove after all consumers migrated

External REST APIs remain stable throughout migration.

## Verification Checklist

- [ ] tRPC client exports correctly typed for all procedures
- [ ] REST client has OpenAPI type generation configured
- [ ] GraphQL client only loads when federation package is active
- [ ] Both patterns tested in CI
- [ ] Documentation includes pattern selection guide
