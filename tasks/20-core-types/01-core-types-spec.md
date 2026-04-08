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
    "zod": "^3.23.0"
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

export const clientSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(255),
  slug: z.string().regex(/^[a-z0-9-]+$/),
  createdAt: z.date(),
  updatedAt: z.date()
});

export type Client = z.infer<typeof clientSchema>;
export type NewClient = Omit<Client, "id" | "createdAt" | "updatedAt">;
```

### `src/project.ts`
```ts
import { z } from "zod";

export const projectStatusEnum = z.enum([
  "lead",
  "scoping",
  "active",
  "on-hold",
  "completed",
  "archived"
]);

export const projectSchema = z.object({
  id: z.string().uuid(),
  clientId: z.string().uuid(),
  name: z.string().min(1).max(255),
  status: projectStatusEnum,
  createdAt: z.date(),
  updatedAt: z.date()
});

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

## Verification

```bash
# Type check
pnpm --filter @agency/core-types typecheck

# Verify exports
pnpm --filter @agency/core-types build
```
