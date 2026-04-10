# Guide: Constants Usage Patterns

## Purpose
Practical patterns for consuming `@agency/core-constants` across the monorepo with type safety and tree-shaking optimization.

## Installation

```ts
// Package.json dependency
{
  "dependencies": {
    "@agency/core-constants": "workspace:*"
  }
}
```

## Usage Patterns

### 1. Route Constants with Type Safety

```ts
import { INTERNAL_ROUTES, type InternalRoute } from "@agency/core-constants/routes";

// Type-safe route access
const currentRoute: InternalRoute = "dashboard";
const path = INTERNAL_ROUTES[currentRoute]; // "/dashboard"

// Exhaustive route handling
function handleRoute(route: InternalRoute): string {
  switch (route) {
    case "dashboard":
      return INTERNAL_ROUTES.dashboard;
    case "crm":
      return INTERNAL_ROUTES.crm;
    // TypeScript ensures exhaustive handling
    default:
      const _exhaustive: never = route;
      return _exhaustive;
  }
}
```

### 2. Error Code Handling

```ts
import { ERROR_CODES, ERROR_DETAILS, type ErrorCode } from "@agency/core-constants/errors";

// Type-safe error creation
function createError(code: ErrorCode, customMessage?: string): Error {
  const details = ERROR_DETAILS[code];
  return new Error(customMessage || details.message);
}

// Error response builder
function buildErrorResponse(code: ErrorCode): { code: ErrorCode; message: string; status: number } {
  const details = ERROR_DETAILS[code];
  return {
    code,
    message: details.message,
    status: details.statusCode
  };
}
```

### 3. Invoice State Management

```ts
import { INVOICE_STATES, type InvoiceState } from "@agency/core-constants/invoice";

// State validation
function isValidInvoiceState(state: string): state is InvoiceState {
  return Object.values(INVOICE_STATES).includes(state as InvoiceState);
}

// State transitions (business logic in app layer)
function canTransitionTo(current: InvoiceState, next: InvoiceState): boolean {
  const allowedTransitions: Record<InvoiceState, InvoiceState[]> = {
    [INVOICE_STATES.DRAFT]: [INVOICE_STATES.SENT],
    [INVOICE_STATES.SENT]: [INVOICE_STATES.PAID, INVOICE_STATES.OVERDUE],
    [INVOICE_STATES.PAID]: [],
    [INVOICE_STATES.OVERDUE]: [INVOICE_STATES.PAID, INVOICE_STATES.VOID],
    [INVOICE_STATES.VOID]: []
  };
  
  return allowedTransitions[current]?.includes(next) ?? false;
}
```

### 4. Runtime Validation Patterns

```ts
import { 
  INTERNAL_ROUTES, 
  ERROR_CODES, 
  INVOICE_STATES,
  type InternalRoute,
  type ErrorCode,
  type InvoiceState 
} from "@agency/core-constants";

// Performance-optimized validation sets
const ROUTE_SET = new Set(Object.values(INTERNAL_ROUTES));
const ERROR_CODE_SET = new Set(Object.values(ERROR_CODES));
const INVOICE_STATE_SET = new Set(Object.values(INVOICE_STATES));

// O(1) validation functions
export function validateRoute(route: string): InternalRoute {
  if (!ROUTE_SET.has(route)) {
    throw new Error(`Invalid route: ${route}`);
  }
  return route as InternalRoute;
}

export function validateErrorCode(code: string): ErrorCode {
  if (!ERROR_CODE_SET.has(code)) {
    throw new Error(`Invalid error code: ${code}`);
  }
  return code as ErrorCode;
}

export function validateInvoiceState(state: string): InvoiceState {
  if (!INVOICE_STATE_SET.has(state)) {
    throw new Error(`Invalid invoice state: ${state}`);
  }
  return state as InvoiceState;
}
```

### 5. Const Assertion Exports

```ts
// When defining new constants, always use as const
export const PROJECT_STATUSES = {
  LEAD: "lead",
  SCOPING: "scoping",
  ACTIVE: "active",
  ON_HOLD: "on-hold",
  COMPLETED: "completed",
  ARCHIVED: "archived"
} as const;

// Derive types from const assertion
export type ProjectStatus = typeof PROJECT_STATUSES[keyof typeof PROJECT_STATUSES];

// Helper for type-safe iteration
export const PROJECT_STATUS_VALUES = Object.values(PROJECT_STATUSES);
```

## Tree-Shaking Best Practices

### Individual Imports
```ts
// Good: Tree-shakeable individual imports
import { INTERNAL_ROUTES } from "@agency/core-constants/routes";
import { ERROR_CODES } from "@agency/core-constants/errors";

// Avoid: Wildcard imports (harder to tree-shake)
import * as constants from "@agency/core-constants";
```

### Barrel File Exports
```ts
// In package index.ts - re-export for convenience
export * from "./routes";
export * from "./errors";
export * from "./invoice";

// Consumers can still tree-shake when importing from index
import { INTERNAL_ROUTES, ERROR_CODES } from "@agency/core-constants";
```

## Type Narrowing Patterns

### Exhaustive Switch Handling
```ts
function getInvoiceStateLabel(state: InvoiceState): string {
  switch (state) {
    case INVOICE_STATES.DRAFT:
      return "Draft";
    case INVOICE_STATES.SENT:
      return "Sent";
    case INVOICE_STATES.PAID:
      return "Paid";
    case INVOICE_STATES.OVERDUE:
      return "Overdue";
    case INVOICE_STATES.VOID:
      return "Void";
    default:
      // Compile-time exhaustive check
      const _exhaustive: never = state;
      return _exhaustive;
  }
}
```

### Type Guards
```ts
function isInternalRoute(value: unknown): value is InternalRoute {
  return typeof value === "string" && value in INTERNAL_ROUTES;
}

function isErrorCode(value: unknown): value is ErrorCode {
  return typeof value === "string" && ERROR_CODE_SET.has(value);
}
```

## Migration from Enums

### Before (Enum Pattern)
```ts
enum InvoiceState {
  DRAFT = "draft",
  SENT = "sent",
  PAID = "paid"
}

// Problems:
// - Runtime object generation
// - Reverse mapping overhead
// - Poor tree-shaking
```

### After (Const Assertion Pattern)
```ts
const INVOICE_STATES = {
  DRAFT: "draft",
  SENT: "sent",
  PAID: "paid"
} as const;

type InvoiceState = typeof INVOICE_STATES[keyof typeof INVOICE_STATES];

// Benefits:
// - Zero runtime overhead
// - Better tree-shaking
// - Type inference from values
```

## Testing Constants

```ts
import { describe, it, expect } from "vitest";
import { INTERNAL_ROUTES, isValidInvoiceState } from "@agency/core-constants";

describe("constants", () => {
  it("should have valid route structure", () => {
    expect(INTERNAL_ROUTES.dashboard).toBe("/dashboard");
    expect(INTERNAL_ROUTES.crm).toBe("/crm");
  });
  
  it("should validate invoice states", () => {
    expect(isValidInvoiceState("draft")).toBe(true);
    expect(isValidInvoiceState("invalid")).toBe(false);
  });
});
```

## Performance Considerations

- **Bundle Size**: Const assertions compile to nothing extra (just the values)
- **Runtime**: No enum object creation, direct value access
- **Tree-Shaking**: Unused constants are eliminated by bundler
- **Memory**: No reverse mapping dictionaries

## References

- [TypeScript Const Assertions](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-4.html#const-assertions)
- [Tree-Shaking Guide](https://webpack.js.org/guides/tree-shaking/)
