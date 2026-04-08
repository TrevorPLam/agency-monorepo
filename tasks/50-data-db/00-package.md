# 50-data-db/00-package: Database Package

## Purpose
Centralized database schema, client factory, and typed query modules using Drizzle ORM. Supports **dual-provider strategy**: Neon (primary) and Supabase (fallback). Enforces strict client data isolation regardless of provider.

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
    │   ├── clients.ts
    │   ├── projects.ts
    │   └── invoices.ts
    └── queries/
        ├── index.ts
        ├── clients.ts
        ├── projects.ts
        └── invoices.ts
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
    "@agency/config-eslint": "workspace:*",
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

// Neon client (primary - serverless Postgres)
export function createNeonClient(connectionString: string) {
  const sql = neon(connectionString);
  return drizzle(sql, { schema });
}

// Supabase client (fallback - bundled backend)
export function createSupabaseClient(url: string, key: string) {
  return createClient(url, key);
}

// Unified client factory - provider determined by env vars
export function createDbClient(config: {
  provider?: DatabaseProvider;
  connectionString?: string; // For Neon
  supabaseUrl?: string;        // For Supabase
  supabaseKey?: string;        // For Supabase
}): DatabaseClient {
  const provider = config.provider ?? (process.env.DATABASE_PROVIDER as DatabaseProvider) ?? "neon";
  
  if (provider === "supabase") {
    if (!config.supabaseUrl || !config.supabaseKey) {
      throw new Error("Supabase requires supabaseUrl and supabaseKey");
    }
    return createSupabaseClient(config.supabaseUrl, config.supabaseKey) as unknown as DatabaseClient;
  }
  
  // Default to Neon
  const connectionString = config.connectionString ?? process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("Neon requires connectionString (DATABASE_URL)");
  }
  return createNeonClient(connectionString);
}

export type DatabaseClient = ReturnType<typeof createNeonClient> | SupabaseClient;

// Provider detection helper
export function getProvider(client: DatabaseClient): DatabaseProvider {
  // Neon client is a Drizzle instance; Supabase has specific methods
  if ("from" in client && typeof client.from === "function") {
    return "supabase";
  }
  return "neon";
}
```

### `src/schema/common.ts`
```ts
import { pgTable, uuid, timestamp, varchar, text, integer, pgEnum } from "drizzle-orm/pg-core";

export const idField = () => uuid("id").primaryKey().defaultRandom();
export const timestamps = () => ({
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull()
});
export const clientIdField = () => uuid("client_id").notNull();
```

### `src/schema/clients.ts`
```ts
import { pgTable, varchar, text } from "drizzle-orm/pg-core";
import { idField, timestamps } from "./common";

export const clients = pgTable("clients", {
  id: idField(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  ...timestamps()
});

export type Client = typeof clients.$inferSelect;
export type NewClient = typeof clients.$inferInsert;
```

### `src/schema/projects.ts`
```ts
import { pgTable, varchar, text, uuid, pgEnum } from "drizzle-orm/pg-core";
import { idField, timestamps, clientIdField } from "./common";

export const projectStatusEnum = pgEnum("project_status", ["lead", "scoping", "active", "on-hold", "completed", "archived"]);

export const projects = pgTable("projects", {
  id: idField(),
  clientId: clientIdField(),
  name: varchar("name", { length: 255 }).notNull(),
  status: projectStatusEnum("status").notNull().default("lead"),
  ...timestamps()
});

export type Project = typeof projects.$inferSelect;
export type NewProject = typeof projects.$inferInsert;
```

### `src/schema/invoices.ts`
```ts
import { pgTable, varchar, integer, uuid, pgEnum, timestamp } from "drizzle-orm/pg-core";
import { idField, timestamps, clientIdField } from "./common";

export const invoiceStateEnum = pgEnum("invoice_state", ["draft", "sent", "paid", "overdue", "void"]);

export const invoices = pgTable("invoices", {
  id: idField(),
  clientId: clientIdField(),
  projectId: uuid("project_id"),
  state: invoiceStateEnum("state").notNull().default("draft"),
  amountCents: integer("amount_cents").notNull(),
  currency: varchar("currency", { length: 3 }).notNull().default("USD"),
  issuedAt: timestamp("issued_at", { withTimezone: true }),
  dueAt: timestamp("due_at", { withTimezone: true }),
  ...timestamps()
});

export type Invoice = typeof invoices.$inferSelect;
export type NewInvoice = typeof invoices.$inferInsert;
```

### `src/schema/index.ts`
```ts
export * from "./clients";
export * from "./projects";
export * from "./invoices";
export * from "./common";
```

### `src/queries/clients.ts`
```ts
import { eq } from "drizzle-orm";
import type { DatabaseClient } from "../client";
import { clients } from "../schema";

export function clientQueries(db: DatabaseClient) {
  return {
    async getAll() {
      return db.select().from(clients);
    },
    async getById(id: string) {
      const [client] = await db.select().from(clients).where(eq(clients.id, id));
      return client ?? null;
    },
    async getBySlug(slug: string) {
      const [client] = await db.select().from(clients).where(eq(clients.slug, slug));
      return client ?? null;
    }
  };
}
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

### `src/queries/index.ts`
```ts
export * from "./clients";
export * from "./projects";
```

### `src/index.ts`
```ts
export { createDbClient, type DatabaseClient } from "./client";
export * from "./schema";
export * from "./queries";
```

### `src/providers/index.ts`
```ts
export { 
  createNeonClient, 
  createSupabaseClient, 
  createDbClient, 
  getProvider,
  type DatabaseProvider,
  type DatabaseClient 
} from "../client";
```

### README
```md
# @agency/data-db
Database schema and query modules with dual-provider support.

## Provider Strategy
- **Primary (Default)**: Neon - Serverless Postgres with excellent branching
- **Fallback**: Supabase - All-in-one backend with larger free tier

## Usage - Neon (Default)
```ts
import { createDbClient, clientQueries } from "@agency/data-db";
const db = createDbClient({ connectionString: process.env.DATABASE_URL });
const clients = await clientQueries(db).getAll();
```

## Usage - Supabase (Explicit)
```ts
import { createDbClient, clientQueries } from "@agency/data-db";
const db = createDbClient({ 
  provider: "supabase",
  supabaseUrl: process.env.SUPABASE_URL,
  supabaseKey: process.env.SUPABASE_SERVICE_KEY 
});
const clients = await clientQueries(db).getAll();
```

## Environment Variables

### Neon Mode (Default)
- `DATABASE_PROVIDER=neon` (optional, this is default)
- `DATABASE_URL` - Neon connection string

### Supabase Mode
- `DATABASE_PROVIDER=supabase`
- `SUPABASE_URL` - Project URL
- `SUPABASE_SERVICE_KEY` - Service role key (server-side only)

## When to Use Each Provider

| Scenario | Recommended Provider | Why |
|----------|---------------------|-----|
| Default agency projects | Neon | Best branching workflow, serverless scaling |
| Large free tier needed | Supabase | 500MB vs Neon's 0.5GB (check current limits) |
| Already using Supabase Auth/Storage | Supabase | Reduced complexity, unified billing |
| Heavy branching/PR preview workflows | Neon | Superior database branching |
| Client wants data in specific region | Either | Both support multiple regions |

## Migration Between Providers

Schema migrations work identically (both use Drizzle ORM). To migrate:
1. Export data from current provider
2. Import to new provider
3. Update environment variables
4. Deploy with new `DATABASE_PROVIDER` value

## Critical Rule
Every query accepting `clientId` enforces it in the WHERE clause. Data isolation is non-negotiable regardless of provider.
```
