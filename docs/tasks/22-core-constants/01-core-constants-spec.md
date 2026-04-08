# 22-core-constants: Implementation Specification

## Files
```
packages/core/constants/
├── package.json
├── tsconfig.json
├── README.md
└── src/
    ├── index.ts
    ├── routes.ts
    ├── errors.ts
    ├── invoice.ts
    └── types.ts
```

### `package.json`
```json
{
  "name": "@agency/core-constants",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "sideEffects": false,
  "exports": {
    ".": "./src/index.ts",
    "./routes": "./src/routes.ts",
    "./errors": "./src/errors.ts",
    "./invoice": "./src/invoice.ts"
  },
  "devDependencies": {
    "@agency/config-eslint": "workspace:*",
    "@agency/config-typescript": "workspace:*"
  },
  "publishConfig": { "access": "restricted" }
}
```

### Constants with Modern TypeScript Patterns

#### `src/routes.ts`
```ts
export const INTERNAL_ROUTES = {
  dashboard: "/dashboard",
  crm: "/crm",
  projects: "/projects",
  invoices: "/invoices",
  reporting: "/reporting",
  settings: "/settings"
} as const;

export type InternalRoute = keyof typeof INTERNAL_ROUTES;
export type RoutePath = typeof INTERNAL_ROUTES[InternalRoute];
```

#### `src/errors.ts`
```ts
export const ERROR_CODES = {
  UNAUTHORIZED: "UNAUTHORIZED",
  FORBIDDEN: "FORBIDDEN",
  NOT_FOUND: "NOT_FOUND",
  VALIDATION_ERROR: "VALIDATION_ERROR",
  CONFLICT: "CONFLICT",
  INTERNAL_ERROR: "INTERNAL_ERROR"
} as const;

export type ErrorCode = typeof ERROR_CODES[keyof typeof ERROR_CODES];
export type ErrorDetails = {
  code: ErrorCode;
  message: string;
  statusCode: number;
};

export const ERROR_DETAILS: Record<ErrorCode, Omit<ErrorDetails, 'code'>> = {
  UNAUTHORIZED: {
    code: "UNAUTHORIZED",
    message: "Authentication required",
    statusCode: 401
  },
  FORBIDDEN: {
    code: "FORBIDDEN", 
    message: "Access denied",
    statusCode: 403
  },
  NOT_FOUND: {
    code: "NOT_FOUND",
    message: "Resource not found",
    statusCode: 404
  },
  VALIDATION_ERROR: {
    code: "VALIDATION_ERROR",
    message: "Invalid input data",
    statusCode: 400
  },
  CONFLICT: {
    code: "CONFLICT",
    message: "Resource conflict",
    statusCode: 409
  },
  INTERNAL_ERROR: {
    code: "INTERNAL_ERROR",
    message: "Server error",
    statusCode: 500
  }
} as const;
```

#### `src/invoice.ts`
```ts
// Const enum for better tree-shaking and runtime performance
export const INVOICE_STATES = {
  DRAFT: "draft",
  SENT: "sent", 
  PAID: "paid",
  OVERDUE: "overdue",
  VOID: "void"
} as const;

export type InvoiceState = typeof INVOICE_STATES[keyof typeof INVOICE_STATES];

// Alternative: Union type for string literals (when values are never computed)
export type InvoiceStatus = "draft" | "sent" | "paid" | "overdue" | "void";

// Helper for exhaustive checking
export function isValidInvoiceState(state: string): state is InvoiceState {
  return Object.values(INVOICE_STATES).includes(state as InvoiceState);
}
```

#### `src/types.ts`
```ts
// Generic utility types for constants
export type DeepReadonly<T> = readonly {
  readonly [P in keyof T]: T[P];
};

export type ValueOf<T> = T[keyof T];
```

#### `src/index.ts`
```ts
export * from "./routes";
export * from "./errors";
export * from "./invoice";
export * from "./types";
```

### README
```md
# @agency/core-constants

Shared constants, enums, and types with modern TypeScript patterns.

## Features

- **Route Constants**: Type-safe internal route definitions
- **Error Codes**: Structured error handling with type safety
- **Invoice States**: Const enums with union type alternatives
- **Zero Dependencies**: Pure constants with no external imports

## Usage

```ts
import { INTERNAL_ROUTES, type InternalRoute } from "@agency/core-constants/routes";
import { ERROR_CODES, ERROR_DETAILS, type ErrorCode } from "@agency/core-constants/errors";
import { INVOICE_STATES, type InvoiceState } from "@agency/core-constants/invoice";

// Type-safe route usage
const route: InternalRoute = "dashboard";
const path: string = INTERNAL_ROUTES[route]; // TypeScript infers string type

// Type-safe error handling
const errorCode: ErrorCode = "NOT_FOUND";
const errorDetails = ERROR_DETAILS[errorCode]; // Full error details with type safety

// Const enum usage
const state = INVOICE_STATES.DRAFT; // Better tree-shaking than regular enum
```

## Migration Guide

### From Regular Enums to Const Enums

**Before:**
```ts
enum InvoiceState {
  DRAFT = "draft",
  SENT = "sent",
  PAID = "paid"
}
```

**After:**
```ts
const INVOICE_STATES = {
  DRAFT: "draft",
  SENT: "sent", 
  PAID: "paid"
} as const;
```

**Benefits:**
- Better tree-shaking (unused values are eliminated)
- No runtime JavaScript object generation
- Better performance (no reverse mapping needed)
- More predictable behavior

### When to Use Union Types vs Const Enums

**Use Union Types When:**
- Values are fixed and known at compile time
- You need exhaustiveness checking with `never` type
- Performance is critical and you want zero runtime overhead

**Use Const Enums When:**
- Values might be computed or need runtime iteration
- You need both the values and reverse mapping
- Backward compatibility with existing code is required

## Verification

```bash
# Type check
pnpm --filter @agency/core-constants typecheck

# Build to verify tree-shaking
pnpm --filter @agency/core-constants build
```

## Implementation Rules

1. **Const Enums**: Use `as const` for better tree-shaking
2. **Type Safety**: Provide both value types and helper types
3. **No Regular Enums**: Avoid enum-to-JS compilation
4. **Tree Shaking**: Structure for individual import elimination
5. **Documentation**: Include migration guidance and alternatives
