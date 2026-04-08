# 50-data-db: Implementation Specification

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
    "@supabase/supabase-js": "2.49.0"
  },
  "devDependencies": {
    "@agency/config-typescript": "workspace:*",
    "drizzle-kit": "0.31.0"
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

export type DatabaseProvider = "neon" | "supabase";

export function createNeonClient(connectionString: string) {
  const sql = neon(connectionString);
  return drizzle(sql, { schema });
}

export function createSupabaseClient(url: string, key: string) {
  return createClient(url, key);
}

export function createDbClient(config: {
  provider?: DatabaseProvider;
  connectionString?: string;
  supabaseUrl?: string;
  supabaseKey?: string;
}): DatabaseClient {
  const provider = config.provider ?? 
    (process.env.DATABASE_PROVIDER as DatabaseProvider) ?? "neon";
  
  if (provider === "supabase") {
    if (!config.supabaseUrl || !config.supabaseKey) {
      throw new Error("Supabase requires supabaseUrl and supabaseKey");
    }
    return createSupabaseClient(config.supabaseUrl, config.supabaseKey) as unknown as DatabaseClient;
  }
  
  const connectionString = config.connectionString ?? process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("Neon requires connectionString (DATABASE_URL)");
  }
  return createNeonClient(connectionString);
}

export type DatabaseClient = ReturnType<typeof createNeonClient> | SupabaseClient;
```

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
