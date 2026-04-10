# 51a-data-content-federation: Implementation Specification

## Task Header

| Field | Value |
|-------|-------|
| **State** | `conditional` — Package-controlled, opt-in only |
| **Trigger** | App requires content from multiple CMS sources |
| **Minimum Consumers** | 1+ apps with federated content needs |
| **Dependencies** | CMS SDKs, TypeScript 6.0, `@agency/data-cms` |
| **Exit Criteria** | Content federation working and documented |
| **Implementation Authority** | `REPO-STATE.md` — Conditional; requires explicit CMS need |
| **Version Authority** | `DEPENDENCY.md` §1 — TypeScript 6.0 |
| **Supersedes** | n/a |
| **Superseded by** | n/a |

**Cross-references:**
- Decision status: `DECISION-STATUS.md` — Content federation `open`
- Version pins: `DEPENDENCY.md` §1
- Note: Sub-task of 51-data-cms; advanced CMS integration

## Files

```
packages/data/content-federation/
├── package.json
├── tsconfig.json
├── 01-config-biome-migration-50-ref-quickstart.md
├── src/
│   ├── index.ts
│   ├── gateway.ts
│   ├── schema.ts
│   ├── sources/
│   │   ├── index.ts
│   │   ├── sanity.ts
│   │   ├── shopify.ts
│   │   └── strapi.ts
│   ├── resolvers/
│   │   ├── index.ts
│   │   ├── content.ts
│   │   └── products.ts
│   └── cache/
│       ├── index.ts
│       └── redis.ts
└── graphql/
    └── schema.graphql
```

### `package.json`

```json
{
  "name": "@agency/data-content-federation",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "exports": {
    ".": "./src/index.ts",
    "./gateway": "./src/gateway.ts",
    "./schema": "./src/schema.ts",
    "./sources": "./src/sources/index.ts"
  },
  "dependencies": {
    "@agency/core-types": "workspace:*",
    "@apollo/gateway": "2.13.3",
    "@apollo/subgraph": "2.13.3",
    "graphql": "16.13.2",
    "ioredis": "5.10.1"
  },
  "devDependencies": {
    "@agency/config-eslint": "workspace:*",
    "@agency/config-typescript": "workspace:*"
  },
  "publishConfig": { "access": "restricted" }
}
```

### `src/gateway.ts`

```typescript
import { ApolloGateway, IntrospectAndCompose } from '@apollo/gateway';
import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import { createSanitySource } from './sources/sanity';
import { createShopifySource } from './sources/shopify';

export interface FederationConfig {
  sources: {
    sanity?: { projectId: string; dataset: string; token: string };
    shopify?: { storeDomain: string; storefrontToken: string };
    strapi?: { url: string; token: string };
  };
  cache?: { redis?: { url: string; ttl: number } };
}

export async function createFederationGateway(config: FederationConfig) {
  const subgraphs = [];
  
  if (config.sources.sanity) {
    subgraphs.push(await createSanitySource(config.sources.sanity));
  }
  if (config.sources.shopify) {
    subgraphs.push(await createShopifySource(config.sources.shopify));
  }
  // ... additional sources

  const gateway = new ApolloGateway({
    supergraphSdl: new IntrospectAndCompose({
      subgraphs: subgraphs.map(s => ({ name: s.name, url: s.url }))
    })
  });

  return new ApolloServer({ gateway, introspection: true });
}
```

### `src/sources/sanity.ts`

```typescript
import { defineSubgraph } from '@apollo/subgraph';
import { createClient } from '@sanity/client';

export async function createSanitySource(config: {
  projectId: string;
  dataset: string;
  token: string;
}) {
  const client = createClient({ ...config, apiVersion: 'v1' });

  return {
    name: 'sanity',
    url: 'http://localhost:4001', // Subgraph endpoint
    schema: `
      type Content @key(fields: "id") {
        id: ID!
        title: String!
        slug: String!
        body: String
        publishedAt: String
      }
      
      type Query {
        contentBySlug(slug: String!): Content
        allContent: [Content!]!
      }
    `,
    resolvers: {
      Query: {
        contentBySlug: async (_, { slug }) => {
          return await client.fetch(
            `*[_type == "post" && slug.current == $slug][0]`,
            { slug }
          );
        },
        allContent: async () => {
          return await client.fetch(`*[_type == "post"]`);
        }
      }
    }
  };
}
```

### `src/cache/redis.ts`

```typescript
import Redis from 'ioredis';

export class FederationCache {
  private redis: Redis;
  private defaultTtl: number;

  constructor(redisUrl: string, defaultTtl = 300) {
    this.redis = new Redis(redisUrl);
    this.defaultTtl = defaultTtl;
  }

  async get<T>(key: string): Promise<T | null> {
    const cached = await this.redis.get(key);
    return cached ? JSON.parse(cached) : null;
  }

  async set(key: string, value: unknown, ttl?: number): Promise<void> {
    await this.redis.setex(
      key,
      ttl ?? this.defaultTtl,
      JSON.stringify(value)
    );
  }

  async invalidate(pattern: string): Promise<void> {
    const keys = await this.redis.keys(pattern);
    if (keys.length > 0) {
      await this.redis.del(...keys);
    }
  }
}
```

### `src/index.ts`

```typescript
export { createFederationGateway, type FederationConfig } from './gateway';
export { FederationCache } from './cache/redis';
```

### README

```markdown
# @agency/data-content-federation

Unified content API for multi-source content architecture.

## When to Use

- Client site pulls content from Sanity + Shopify
- Marketing site combines CMS content with product catalog
- Documentation site merges multiple Strapi instances

## Configuration

```typescript
import { createFederationGateway } from '@agency/data-content-federation';

const gateway = await createFederationGateway({
  sources: {
    sanity: {
      projectId: process.env.SANITY_PROJECT_ID!,
      dataset: 'production',
      token: process.env.SANITY_TOKEN!
    },
    shopify: {
      storeDomain: process.env.SHOPIFY_STORE!,
      storefrontToken: process.env.SHOPIFY_TOKEN!
    }
  },
  cache: {
    redis: {
      url: process.env.REDIS_URL!,
      ttl: 300 // 5 minutes
    }
  }
});
```

## GraphQL Query Example

```graphql
query GetProductPage($slug: String!) {
  contentBySlug(slug: $slug) {  # From Sanity
    title
    body
  }
  productByHandle(handle: $slug) {  # From Shopify
    title
    price
    images
  }
}
```

## Architecture

- **Apollo Federation**: Combines multiple GraphQL services
- **Redis Caching**: Per-source TTL, automatic invalidation
- **Graceful Degradation**: Partial failures don't break entire query
```


## Related Tasks

- `51-data-cms` - Single CMS source (use when only one CMS needed)
- `52-data-api-client` - REST API wrappers (use for non-GraphQL sources)
