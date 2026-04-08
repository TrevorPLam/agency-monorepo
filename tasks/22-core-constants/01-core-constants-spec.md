# Core Constants Specification

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
    └── invoice.ts
```

### `package.json`
```json
{
  "name": "@agency/core-constants",
  "version": "0.1.0",
  "private": true,
  "type": "module",
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

### Constants
```ts
// routes.ts
export const INTERNAL_ROUTES = {
  dashboard: "/dashboard",
  crm: "/crm",
  projects: "/projects",
  invoices: "/invoices",
  reporting: "/reporting",
  settings: "/settings"
} as const;

// errors.ts
export const ERROR_CODES = {
  UNAUTHORIZED: "UNAUTHORIZED",
  FORBIDDEN: "FORBIDDEN",
  NOT_FOUND: "NOT_FOUND",
  VALIDATION_ERROR: "VALIDATION_ERROR",
  CONFLICT: "CONFLICT",
  INTERNAL_ERROR: "INTERNAL_ERROR"
} as const;

// invoice.ts
export const INVOICE_STATES = ["draft", "sent", "paid", "overdue", "void"] as const;
```

### README
```md
# @agency/core-constants
Shared constants: route keys, error codes, fixed enums.
```
