# 20-core-types: Implementation Specification

## Task Header

| Field | Value |
|-------|-------|
| **State** | `planned` — Documented target; implementation not yet authorized |
| **Trigger** | Repository initialization — always required |
| **Minimum Consumers** | n/a (root infrastructure) |
| **Dependencies** | TypeScript 6.0, `@agency/config-typescript` |
| **Exit Criteria** | Root package.json, pnpm-workspace.yaml, turbo.json committed and verified |
| **Implementation Authority** | `REPO-STATE.md` — Phase: Planning, Build status: Not started |
| **Version Authority** | `DEPENDENCY.md` §1 — TypeScript 6.0 |
| **Supersedes** | n/a |
| **Superseded by** | n/a |

## Cross-references

- Decision status: `DECISION-STATUS.md` — Core types package `approved`
- Version pins: `DEPENDENCY.md` §1
- Architecture: `ARCHITECTURE.md` — Core layer section

**Cross-references:**
- Decision status: `DECISION-STATUS.md` — Core types package `approved`
- Version pins: `DEPENDENCY.md` §1
- Architecture: `ARCHITECTURE.md` — Core layer section

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

// Zod v4: Use .strict() for enhanced validation
export const clientSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(255),
  slug: z.string().regex(/^[a-z0-9-]+$/),
  createdAt: z.date(),
  updatedAt: z.date()
}).strict();

export type Client = z.infer<typeof clientSchema>;
export type NewClient = Omit<Client, "id" | "createdAt" | "updatedAt">;
```

### `src/project.ts`
```ts
import { z } from "zod";

// Zod v4: Discriminated union for state-like objects
const baseProjectSchema = z.object({
  id: z.string().uuid(),
  clientId: z.string().uuid(),
  name: z.string().min(1).max(255),
  createdAt: z.date(),
  updatedAt: z.date()
}).strict();

const leadProjectSchema = baseProjectSchema.extend({
  status: z.literal("lead"),
  budget: z.number().optional(),
  expectedCloseDate: z.date().optional()
});

const activeProjectSchema = baseProjectSchema.extend({
  status: z.literal("active"),
  teamAssignee: z.string().uuid().optional(),
  progress: z.number().min(0).max(100).optional()
});

const completedProjectSchema = baseProjectSchema.extend({
  status: z.literal("completed"),
  actualHours: z.number().min(0),
  invoiceId: z.string().uuid().optional()
});

// Zod v4: Upgraded discriminatedUnion with better performance
export const projectSchema = z.discriminatedUnion("status", [
  leadProjectSchema,
  activeProjectSchema,
  completedProjectSchema
]);

export type Project = z.infer<typeof projectSchema>;
// Use discriminated union for type narrowing
export function isLeadProject(project: Project): project is z.infer<typeof leadProjectSchema> {
  return project.status === "lead";
}
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

```bash
# Performance test (Zod v4)
pnpm --filter @agency/core-types test:performance

# Type check
pnpm --filter @agency/core-types typecheck

# Verify exports
pnpm --filter @agency/core-types build
```

## Verification

```bash
# Type check
pnpm --filter @agency/core-types typecheck

# Verify exports
pnpm --filter @agency/core-types build
```
