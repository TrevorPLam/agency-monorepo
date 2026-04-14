> **Non-Authoritative Warning**
>
> This is a task specification, not implementation authority.
>
> **Read first:**
> 1. `REPO-STATE.md` — what is approved to build now
> 2. `DECISION-STATUS.md` — which decisions are locked vs open
> 3. `DEPENDENCY.md` — exact versions and provider lanes
>
> **Before implementation:** Verify this package is approved in `REPO-STATE.md` and all dependencies are allowed.

---

# 22-core-constants: Implementation Specification

## Files
```
packages/core/constants/
├── package.json
├── tsconfig.json
├── src/
│   ├── index.ts
│   ├── routes.ts
│   ├── errors.ts
│   ├── invoice.ts
│   └── validation.ts
├── tests/
│   ├── routes.test.ts
│   ├── errors.test.ts
│   └── validation.test.ts
└── README.md
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
    "./invoice": "./src/invoice.ts",
    "./validation": "./src/validation.ts"
  },
  "dependencies": {
    "@agency/core-types": "workspace:*"
  },
  "devDependencies": {
    "@agency/config-eslint": "workspace:*",
    "@agency/config-typescript": "workspace:*"
  },
  "publishConfig": { "access": "restricted" }
}
```

### `src/routes.ts`
```ts
// Route constants with const assertion for type safety
export const INTERNAL_ROUTES = {
  dashboard: "/dashboard",
  crm: "/crm",
  projects: "/projects",
  invoices: "/invoices",
  reporting: "/reporting",
  settings: "/settings"
} as const;

// Type inference from const assertion
export type InternalRoute = keyof typeof INTERNAL_ROUTES;
export type RoutePath = typeof INTERNAL_ROUTES[InternalRoute];

// Performance-optimized route validation using Set for O(1) lookup
export const isValidRoute = (() => {
  const routeSet = new Set(Object.values(INTERNAL_ROUTES));
  
  return (route: string): route is RoutePath => {
    return routeSet.has(route);
  };
})();

// Get route by key with type safety
export const getRoute = (key: InternalRoute): RoutePath => {
  return INTERNAL_ROUTES[key];
};
```

### `src/errors.ts`
```ts
// Error codes with const assertion
export const ERROR_CODES = {
  // Client errors (4xx)
  BAD_REQUEST: "BAD_REQUEST",
  UNAUTHORIZED: "UNAUTHORIZED",
  FORBIDDEN: "FORBIDDEN",
  NOT_FOUND: "NOT_FOUND",
  CONFLICT: "CONFLICT",
  VALIDATION_ERROR: "VALIDATION_ERROR",
  
  // Server errors (5xx)
  INTERNAL_ERROR: "INTERNAL_ERROR",
  SERVICE_UNAVAILABLE: "SERVICE_UNAVAILABLE",
  TIMEOUT: "TIMEOUT"
} as const;

export type ErrorCode = typeof ERROR_CODES[keyof typeof ERROR_CODES];

// Error details with type safety
export interface ErrorDetail {
  code: ErrorCode;
  message: string;
  statusCode: number;
}

export const ERROR_DETAILS: Record<ErrorCode, ErrorDetail> = {
  [ERROR_CODES.BAD_REQUEST]: { code: ERROR_CODES.BAD_REQUEST, message: "Bad request", statusCode: 400 },
  [ERROR_CODES.UNAUTHORIZED]: { code: ERROR_CODES.UNAUTHORIZED, message: "Unauthorized", statusCode: 401 },
  [ERROR_CODES.FORBIDDEN]: { code: ERROR_CODES.FORBIDDEN, message: "Forbidden", statusCode: 403 },
  [ERROR_CODES.NOT_FOUND]: { code: ERROR_CODES.NOT_FOUND, message: "Not found", statusCode: 404 },
  [ERROR_CODES.CONFLICT]: { code: ERROR_CODES.CONFLICT, message: "Conflict", statusCode: 409 },
  [ERROR_CODES.VALIDATION_ERROR]: { code: ERROR_CODES.VALIDATION_ERROR, message: "Validation error", statusCode: 422 },
  [ERROR_CODES.INTERNAL_ERROR]: { code: ERROR_CODES.INTERNAL_ERROR, message: "Internal server error", statusCode: 500 },
  [ERROR_CODES.SERVICE_UNAVAILABLE]: { code: ERROR_CODES.SERVICE_UNAVAILABLE, message: "Service unavailable", statusCode: 503 },
  [ERROR_CODES.TIMEOUT]: { code: ERROR_CODES.TIMEOUT, message: "Request timeout", statusCode: 504 }
};

// Performance-optimized error code validation
export const isValidErrorCode = (() => {
  const errorCodeSet = new Set(Object.values(ERROR_CODES));
  
  return (code: string): code is ErrorCode => {
    return errorCodeSet.has(code as ErrorCode);
  };
})();

// Get error details by code
export const getErrorDetail = (code: ErrorCode): ErrorDetail => {
  return ERROR_DETAILS[code];
};
```

### `src/invoice.ts`
```ts
// Invoice states with const assertion (never use regular enums)
export const INVOICE_STATUSES = {
  DRAFT: "draft",
  SENT: "sent",
  VIEWED: "viewed",
  PAID: "paid",
  OVERDUE: "overdue",
  CANCELLED: "cancelled"
} as const;

export type InvoiceStatus = typeof INVOICE_STATUSES[keyof typeof INVOICE_STATUSES];

// Invoice state transitions (type-safe state machine)
export const VALID_STATE_TRANSITIONS: Record<InvoiceStatus, InvoiceStatus[]> = {
  [INVOICE_STATUSES.DRAFT]: [INVOICE_STATUSES.SENT, INVOICE_STATUSES.CANCELLED],
  [INVOICE_STATUSES.SENT]: [INVOICE_STATUSES.VIEWED, INVOICE_STATUSES.PAID, INVOICE_STATUSES.OVERDUE, INVOICE_STATUSES.CANCELLED],
  [INVOICE_STATUSES.VIEWED]: [INVOICE_STATUSES.PAID, INVOICE_STATUSES.OVERDUE],
  [INVOICE_STATUSES.PAID]: [],
  [INVOICE_STATUSES.OVERDUE]: [INVOICE_STATUSES.PAID, INVOICE_STATUSES.CANCELLED],
  [INVOICE_STATUSES.CANCELLED]: []
};

// Performance-optimized status validation
export const isValidInvoiceStatus = (() => {
  const statusSet = new Set(Object.values(INVOICE_STATUSES));
  
  return (status: string): status is InvoiceStatus => {
    return statusSet.has(status as InvoiceStatus);
  };
})();

// Check if state transition is valid
export const isValidTransition = (
  currentStatus: InvoiceStatus, 
  newStatus: InvoiceStatus
): boolean => {
  return VALID_STATE_TRANSITIONS[currentStatus].includes(newStatus);
};
```

### `src/validation.ts`
```ts
// Performance-optimized constant validation utilities
// Uses Set for O(1) lookup instead of array.includes()

export function createConstantValidator<T extends string>(
  constants: readonly T[]
): {
  isValid: (value: string) => value is T;
  validate: (value: string) => T;
  getAll: () => readonly T[];
} {
  const constantSet = new Set(constants);
  
  return {
    isValid: (value: string): value is T => {
      return constantSet.has(value as T);
    },
    
    validate: (value: string): T => {
      if (!constantSet.has(value as T)) {
        throw new Error(
          `Invalid value: ${value}. Must be one of: ${constants.join(', ')}`
        );
      }
      return value as T;
    },
    
    getAll: () => constants
  };
}

// Type-safe constant accessor with error handling
export function createConstantAccessor<T extends string>(
  constants: Record<string, T>
): {
  get: (key: string) => T | undefined;
  getOrThrow: (key: string) => T;
  has: (key: string) => boolean;
} {
  const constantMap = new Map(Object.entries(constants));
  
  return {
    get: (key: string): T | undefined => {
      return constantMap.get(key);
    },
    
    getOrThrow: (key: string): T => {
      const value = constantMap.get(key);
      if (value === undefined) {
        throw new Error(`Constant not found: ${key}`);
      }
      return value;
    },
    
    has: (key: string): boolean => {
      return constantMap.has(key);
    }
  };
}
```

### `src/index.ts`
```ts
export { INTERNAL_ROUTES, type InternalRoute, type RoutePath, isValidRoute, getRoute } from "./routes";
export { ERROR_CODES, type ErrorCode, type ErrorDetail, ERROR_DETAILS, isValidErrorCode, getErrorDetail } from "./errors";
export { INVOICE_STATUSES, type InvoiceStatus, VALID_STATE_TRANSITIONS, isValidInvoiceStatus, isValidTransition } from "./invoice";
export { createConstantValidator, createConstantAccessor } from "./validation";
```

## Performance Benchmarks

### Constant Validation Performance Targets
- **Validation lookup**: <1ms for constant validation (O(1) with Set)
- **Memory overhead**: <1KB for constant sets
- **Bundle size impact**: Minimal with tree-shaking
- **Type inference**: Compile-time type safety

### Migration Checklist: Regular Enums → Const Assertions

#### Breaking Changes
- [ ] Replace all `enum` declarations with `as const` objects
- [ ] Update type references from `EnumName` to `typeof CONST_NAME[keyof typeof CONST_NAME]`
- [ ] Add performance-optimized validation functions using Set
- [ ] Update import statements and exports

#### New Features to Adopt
- [ ] Implement Set-based O(1) validation lookups
- [ ] Add type-safe constant accessors
- [ ] Create validation utilities for dynamic constant checks
- [ ] Add state transition validation for state machines

## Verification

```bash
# Performance test (constant validation)
pnpm --filter @agency/core-constants test:performance

# Type check
pnpm --filter @agency/core-constants typecheck

# Verify exports and tree-shaking
pnpm --filter @agency/core-constants build
```

## Usage Examples

```ts
import { 
  INTERNAL_ROUTES, 
  isValidRoute, 
  ERROR_CODES, 
  isValidErrorCode,
  INVOICE_STATUSES,
  isValidTransition,
  createConstantValidator 
} from "@agency/core-constants";

// Route validation
const isRouteValid = isValidRoute("/dashboard"); // true
const route = INTERNAL_ROUTES.dashboard; // "/dashboard"

// Error code validation  
const isErrorValid = isValidErrorCode("BAD_REQUEST"); // true

// Invoice state transitions
const canTransition = isValidTransition("draft", "sent"); // true

// Custom constant validator
const priorities = ["low", "medium", "high"] as const;
const priorityValidator = createConstantValidator(priorities);
const isValidPriority = priorityValidator.isValid("high"); // true
```
