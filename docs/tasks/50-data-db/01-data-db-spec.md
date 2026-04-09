# 50-data-db: Implementation Specification

## Task Header

| Field | Value |
|-------|-------|
| **State** | `planned` — Documented target; implementation not yet authorized |
| **Trigger** | Repository initialization — always required |
| **Minimum Consumers** | n/a (root infrastructure) |
| **Dependencies** | `drizzle-orm@0.45.2`, `@neondatabase/serverless@1.0.2`, Neon database |
| **Exit Criteria** | Root package.json, pnpm-workspace.yaml, turbo.json committed and verified |
| **Implementation Authority** | `REPO-STATE.md` — Phase: Planning, Build status: Not started |
| **Version Authority** | `DEPENDENCY.md` §4 — `drizzle-orm@0.45.2`, `@neondatabase/serverless@1.0.2` |
| **Supersedes** | n/a |
| **Superseded by** | n/a |

**Cross-references:**
- Decision status: `DECISION-STATUS.md` — Drizzle ORM `locked`, Neon `locked`
- Version pins: `DEPENDENCY.md` §5, §6
- Architecture: `ARCHITECTURE.md` — Data layer section
- Scope boundary: shared query helpers target the Drizzle + Neon lane; Supabase support remains an explicit companion helper, not a drop-in provider switch for shared query modules

## Files
```
packages/data/database/
├── package.json
├── tsconfig.json
├── README.md
├── drizzle.config.ts
└── src/
    ├── index.ts
    ├── client.ts
    ├── schema/
    │   ├── index.ts
    │   ├── common.ts
    │   ├── clients.ts
    │   ├── projects.ts
    │   └── invoices.ts
    └── queries/
        ├── index.ts
        ├── clients.ts
        └── projects.ts
```

### `package.json`
```json
{
  "name": "@agency/data-db",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "exports": {
    ".": "./src/index.ts",
    "./client": "./src/client.ts",
    "./schema": "./src/schema/index.ts",
    "./queries": "./src/queries/index.ts"
  },
  "dependencies": {
    "@agency/core-types": "workspace:*",
    "drizzle-orm": "0.45.2",
    "@neondatabase/serverless": "1.0.2",
    "@supabase/supabase-js": "2.103.0"
  },
  "devDependencies": {
    "@agency/config-typescript": "workspace:*",
    "drizzle-kit": "0.31.10"
  },
  "publishConfig": { "access": "restricted" }
}
```

### `drizzle.config.ts`
```ts
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/schema/index.ts",
  out: "./migrations",
  dialect: "postgresql",
  dbCredentials: { url: process.env.DATABASE_URL ?? "" }
});
```

### `src/client.ts`
```ts
import { drizzle } from "drizzle-orm/neon-serverless";
import { neon } from "@neondatabase/serverless";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import * as schema from "./schema";

export function createDbClient(connectionString: string) {
  const sql = neon(connectionString);
  return drizzle(sql, { schema });
}

export function createSupabaseAdminClient(url: string, key: string): SupabaseClient {
  return createClient(url, key);
}

export type DatabaseClient = ReturnType<typeof createDbClient>;
```

Shared query modules accept `DatabaseClient` only. Supabase helpers are reserved for explicit storage or managed-platform features and do not promise query-layer parity with the Drizzle + Neon lane.

### `src/schema/common.ts`
```ts
import { pgTable, uuid, timestamp, varchar } from "drizzle-orm/pg-core";

export const idField = () => uuid("id").primaryKey().defaultRandom();
export const timestamps = () => ({
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull()
});
export const clientIdField = () => uuid("client_id").notNull();
```

### `src/queries/projects.ts`
```ts
import { eq, and } from "drizzle-orm";
import type { DatabaseClient } from "../client";
import { projects } from "../schema";

export function projectQueries(db: DatabaseClient) {
  return {
    async getAllForClient(clientId: string) {
      return db.select().from(projects).where(eq(projects.clientId, clientId));
    },
    async getById(clientId: string, id: string) {
      const [project] = await db
        .select()
        .from(projects)
        .where(and(eq(projects.id, id), eq(projects.clientId, clientId)));
      return project ?? null;
    }
  };
}
```

## Verification

```bash
# Generate migrations
pnpm --filter @agency/data-db drizzle:generate

# Run migrations
pnpm --filter @agency/data-db drizzle:migrate

# Type check
pnpm --filter @agency/data-db typecheck
```
