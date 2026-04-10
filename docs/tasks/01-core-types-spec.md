# 20-core-types: Implementation Specification

## Files
```
packages/core/shared-types/
├── package.json
├── tsconfig.json
├── src/
│   ├── index.ts
│   ├── client.ts
│   ├── project.ts
│   ├── invoice.ts
│   └── user.ts
└── README.md
```

### `package.json`
```json
{
  "name": "@agency/core-types",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "exports": {
    ".": "./src/index.ts",
    "./client": "./src/client.ts",
    "./project": "./src/project.ts",
    "./invoice": "./src/invoice.ts",
    "./user": "./src/user.ts"
  },
  "dependencies": {
    "zod": "^4.0.0"
  },
  "devDependencies": {
    "@agency/config-typescript": "workspace:*"
  },
  "publishConfig": { "access": "restricted" }
}
```

### `src/client.ts`
```ts
import { z } from "zod";

// Zod v4: Use .strict() for enhanced validation and better performance
export const clientSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(255),
  slug: z.string().regex(/^[a-z0-9-]+$/),
  createdAt: z.date(),
  updatedAt: z.date()
}).strict(); // Zod v4: Strict mode prevents unexpected properties

export type Client = z.infer<typeof clientSchema>;
export type NewClient = Omit<Client, "id" | "createdAt" | "updatedAt">;
```

### `src/project.ts`
```ts
import { z } from "zod";

// Zod v4: Enhanced enum with strict validation
export const projectStatusEnum = z.enum([
  "lead",
  "scoping", 
  "active",
  "on-hold",
  "completed",
  "archived"
]);

// Zod v4: Discriminated union for type-safe state handling
const baseProjectSchema = z.object({
  id: z.string().uuid(),
  clientId: z.string().uuid(),
  name: z.string().min(1).max(255),
  createdAt: z.date(),
  updatedAt: z.date()
}).strict();

export const projectSchema = z.discriminatedUnion("status", [
  baseProjectSchema.extend({
    status: z.literal("lead"),
    budget: z.number().optional(),
    expectedCloseDate: z.date().optional()
  }),
  baseProjectSchema.extend({
    status: z.literal("active"),
    teamAssignee: z.string().uuid().optional(),
    progress: z.number().min(0).max(100).optional()
  }),
  baseProjectSchema.extend({
    status: z.literal("completed"),
    actualHours: z.number().min(0),
    invoiceId: z.string().uuid().optional()
  })
]);

export type Project = z.infer<typeof projectSchema>;
export type NewProject = Omit<Project, "id" | "createdAt" | "updatedAt">;
```

### `src/index.ts`
```ts
export * from "./client";
export * from "./project";
export * from "./invoice";
export * from "./user";
```

## Performance Benchmarks

### Zod v4 Performance Targets
- **Complex object validation**: <7ms (14x improvement from v3)
- **Bundle size**: -57% from v3 to v4 core
- **Schema parsing**: 10x faster for typical objects

### Migration Checklist: Zod v3 → v4

#### Breaking Changes
- [ ] Update import statements for new API patterns
- [ ] Replace deprecated methods with v4 equivalents
- [ ] Update error handling for new error types
- [ ] Test performance benchmarks meet targets

#### New Features to Adopt
- [ ] Implement `.strict()` mode for enhanced validation
- [ ] Add `.passthrough()` for flexible schema composition
- [ ] Use new branded type patterns
- [ ] Adopt new error formatting options

## Verification

```bash
# Performance test (Zod v4)
pnpm --filter @agency/core-types test:performance

# Type check
pnpm --filter @agency/core-types typecheck

# Verify exports
pnpm --filter @agency/core-types build
```
