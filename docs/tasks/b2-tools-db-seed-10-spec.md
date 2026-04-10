# b2-tools-db-seed: Implementation Specification

## Task Header

| Field | Value |
|-------|-------|
| **State** | `conditional` — Package-controlled, opt-in only |
| **Trigger** | Database seeding scripts needed for development/testing |
| **Minimum Consumers** | 1+ apps using database |
| **Dependencies** | TypeScript 6.0, `@agency/data-db` |
| **Exit Criteria** | Seed script working and documented |
| **Implementation Authority** | `REPO-STATE.md` — Conditional; requires explicit need |
| **Version Authority** | `DEPENDENCY.md` §1 — TypeScript 6.0 |
| **Supersedes** | n/a |
| **Superseded by** | n/a |

**Cross-references:**
- Decision status: `DECISION-STATUS.md` — DB seed tool `open`
- Version pins: `DEPENDENCY.md` §1
- Tenant isolation: `docs/standards/tenant-isolation-data-governance.md`
- Dependency truth: `docs/standards/dependency-truth.md`
- Note: Optional; useful for development but not required

## Seeding policy

- Seed scripts must keep client-owned records scoped by `clientId`.
- Seed tooling must not normalize cross-client data mixing as a convenience pattern for runtime code.
- If seed scripts need exceptions for admin or reference data, the exception should be documented explicitly rather than implied.
- Tooling and install guidance for this lane must defer to `docs/DEPENDENCY.md` and `docs/standards/dependency-truth.md`.

## Files
```
tools/
└── scripts/
    └── db-seed.ts
```

### `tools/scripts/db-seed.ts`
```typescript
#!/usr/bin/env tsx

/**
 * Database Seed Script
 * 
 * Usage:
 *   pnpm db:seed          # Seed with defaults
 *   pnpm db:seed --clean  # Clean existing data first
 *   pnpm db:seed --prod   # Use production-like volumes (caution!)
 */

import { createDbClient } from "@agency/data-db";
import { clientQueries } from "@agency/data-db/queries";
import { createMockClient, createMockProjectsForClient, createMockInvoice } from "@agency/test-fixtures";

// Parse CLI arguments
const args = process.argv.slice(2);
const shouldClean = args.includes("--clean");
const isProdLike = args.includes("--prod");

// Configuration
const CLIENT_COUNT = isProdLike ? 50 : 5;
const PROJECTS_PER_CLIENT = isProdLike ? 20 : 3;
const INVOICES_PER_CLIENT = isProdLike ? 100 : 5;

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error("Error: DATABASE_URL environment variable required");
  process.exit(1);
}

if (DATABASE_URL.includes("production") || DATABASE_URL.includes("prod")) {
  if (!args.includes("--force")) {
    console.error("Error: Refusing to seed production database. Use --force to override.");
    process.exit(1);
  }
  console.warn("WARNING: Seeding production database!");
}

async function seed() {
  console.log("Connecting to database...");
  const db = createDbClient(DATABASE_URL!);

  if (shouldClean) {
    console.log("Cleaning existing data...");
    // Order matters due to foreign keys
    await db.delete(schema.invoices);
    await db.delete(schema.projects);
    await db.delete(schema.clients);
    console.log("Database cleaned.");
  }

  console.log(`Seeding ${CLIENT_COUNT} clients...`);
  const clients = [];

  for (let i = 0; i < CLIENT_COUNT; i++) {
    const client = createMockClient();
    
    const [inserted] = await db
      .insert(schema.clients)
      .values({
        name: client.name,
        slug: `${client.slug}-${i}`, // Ensure uniqueness
      })
      .returning();
    
    clients.push(inserted);
    process.stdout.write(".");
  }
  console.log("\nClients created.");

  console.log(`Seeding projects (${PROJECTS_PER_CLIENT} per client)...`);
  for (const client of clients) {
    const projects = createMockProjectsForClient(client.id, PROJECTS_PER_CLIENT);
    
    for (const project of projects) {
      await db.insert(schema.projects).values({
        clientId: client.id,
        name: project.name,
        status: project.status,
      });
    }
    process.stdout.write(".");
  }
  console.log("\nProjects created.");

  console.log(`Seeding invoices (${INVOICES_PER_CLIENT} per client)...`);
  for (const client of clients) {
    for (let i = 0; i < INVOICES_PER_CLIENT; i++) {
      const invoice = createMockInvoice({ clientId: client.id });
      
      await db.insert(schema.invoices).values({
        clientId: client.id,
        projectId: invoice.projectId,
        state: invoice.state,
        amountCents: invoice.amountCents,
        currency: invoice.currency,
        issuedAt: invoice.issuedAt,
        dueAt: invoice.dueAt,
      });
    }
    process.stdout.write(".");
  }
  console.log("\nInvoices created.");

  // Print summary
  const queries = clientQueries(db);
  const allClients = await queries.getAll();
  
  console.log("\n" + "=".repeat(40));
  console.log("Seed complete!");
  console.log("=".repeat(40));
  console.log(`Clients: ${allClients.length}`);
  
  const projects = await db.select().from(schema.projects);
  console.log(`Projects: ${projects.length}`);
  
  const invoices = await db.select().from(schema.invoices);
  console.log(`Invoices: ${invoices.length}`);
  
  console.log("\nSample clients:");
  allClients.slice(0, 3).forEach(c => {
    console.log(`  - ${c.name} (${c.slug})`);
  });

  process.exit(0);
}

seed().catch(err => {
  console.error("Seed failed:", err);
  process.exit(1);
});
```


## Usage

Add to root `package.json` scripts:

```json
{
  "scripts": {
    "db:seed": "tsx tools/scripts/db-seed.ts",
    "db:seed:clean": "tsx tools/scripts/db-seed.ts --clean",
    "db:reset": "tsx tools/scripts/db-seed.ts --clean"
  }
}
```


## Safety Features

1. **Production Protection**: Refuses to run on URLs containing "production" or "prod"
2. **Clean Flag**: Optional data clearing before seeding
3. **Force Override**: `--force` flag for production seeding (emergency only)


## Implementation Checklist

- [ ] File placed at `tools/scripts/db-seed.ts`
- [ ] Made executable: `chmod +x tools/scripts/db-seed.ts`
- [ ] Script added to root `package.json`
- [ ] `@agency/data-db` and `@agency/test-fixtures` packages exist
- [ ] Tested in development environment
