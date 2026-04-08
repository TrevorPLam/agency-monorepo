# 20-core-types/00-package: Core Types Package

## Purpose
Define canonical TypeScript types and Zod validation schemas for shared domain entities.

## Files
```
packages/core/shared-types/
├── package.json
├── tsconfig.json
├── README.md
└── src/
    ├── index.ts
    ├── client.ts
    ├── project.ts
    ├── invoice.ts
    ├── user-role.ts
    └── common.ts
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
    "./user-role": "./src/user-role.ts",
    "./common": "./src/common.ts"
  },
  "dependencies": { "zod": "^4.0.0" },
  "devDependencies": {
    "@agency/config-eslint": "workspace:*",
    "@agency/config-typescript": "workspace:*"
  },
  "publishConfig": { "access": "restricted" }
}
```
Zod 4.0 is a ground-up rewrite: 14x faster string parsing, 7x faster array parsing, and up to 10x faster TypeScript compilation. Breaking changes include a unified `error` parameter replacing `required_error`, `invalid_type_error`, and `errorMap`, as well as top-level functions like `z.email()` and `z.iso.datetime()`.

### Schemas (`src/common.ts`, `client.ts`, `project.ts`, `invoice.ts`, `user-role.ts`)
```ts
// common.ts
import { z } from "zod";
export const idSchema = z.string().uuid();
export const isoDateSchema = z.iso.datetime();  // Zod 4 syntax
export type Id = z.infer<typeof idSchema>;
export type IsoDate = z.infer<typeof isoDateSchema>;

// client.ts
import { z } from "zod";
import { idSchema, isoDateSchema } from "./common";

export const clientSchema = z.object({
  id: idSchema,
  name: z.string().min(1),
  slug: z.string().min(1),
  createdAt: isoDateSchema,
  updatedAt: isoDateSchema
});
export type Client = z.infer<typeof clientSchema>;

// project.ts
export const projectStatusSchema = z.enum(["lead", "scoping", "active", "on-hold", "completed", "archived"]);
export const projectSchema = z.object({
  id: idSchema,
  clientId: idSchema,
  name: z.string().min(1),
  status: projectStatusSchema,
  createdAt: isoDateSchema,
  updatedAt: isoDateSchema
});
export type ProjectStatus = z.infer<typeof projectStatusSchema>;
export type Project = z.infer<typeof projectSchema>;

// invoice.ts
export const invoiceStateSchema = z.enum(["draft", "sent", "paid", "overdue", "void"]);
export const invoiceSchema = z.object({
  id: idSchema,
  clientId: idSchema,
  projectId: idSchema.optional(),
  state: invoiceStateSchema,
  amountCents: z.number().int().nonnegative(),
  currency: z.string().length(3),
  issuedAt: isoDateSchema,
  dueAt: isoDateSchema
});
export type InvoiceState = z.infer<typeof invoiceStateSchema>;
export type Invoice = z.infer<typeof invoiceSchema>;

// user-role.ts
export const userRoleSchema = z.enum(["owner", "admin", "operator", "account-manager", "client"]);
export type UserRole = z.infer<typeof userRoleSchema>;
```

### README
```md
# @agency/core-types
Canonical domain types and Zod schemas.
## Exports
- `@agency/core-types/client`, `./project`, `./invoice`, `./user-role`, `./common`
## Usage
```ts
import { clientSchema, type Client } from "@agency/core-types/client";
import { projectStatusSchema, type ProjectStatus } from "@agency/core-types/project";
```
```
