# 02-core/01-utils: Core Utilities Package

## Purpose
Pure utility functions (date formatting, slug generation, currency, string helpers). No side effects, React, DB, or I/O.

## Files
```
packages/core/shared-utils/
├── package.json
├── tsconfig.json
├── README.md
└── src/
    ├── index.ts
    ├── date.ts
    ├── string.ts
    ├── currency.ts
    └── slug.ts
```

### `package.json`
```json
{
  "name": "@agency/core-utils",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "exports": {
    ".": "./src/index.ts",
    "./date": "./src/date.ts",
    "./string": "./src/string.ts",
    "./currency": "./src/currency.ts",
    "./slug": "./src/slug.ts"
  },
  "dependencies": { "@agency/core-types": "workspace:*" },
  "devDependencies": {
    "@agency/config-eslint": "workspace:*",
    "@agency/config-typescript": "workspace:*"
  },
  "publishConfig": { "access": "restricted" }
}
```

### Utilities (`src/date.ts`, `string.ts`, `currency.ts`, `slug.ts`)
```ts
// date.ts
export function formatDate(value: string | Date, locale = "en-US", options: Intl.DateTimeFormatOptions = { dateStyle: "medium" }) {
  const date = value instanceof Date ? value : new Date(value);
  return new Intl.DateTimeFormat(locale, options).format(date);
}

// string.ts
export function toTitleCase(value: string) {
  return value.trim().split(/\s+/).map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(" ");
}

// currency.ts
export function formatCurrency(amount: number, currency = "USD", locale = "en-US") {
  return new Intl.NumberFormat(locale, { style: "currency", currency }).format(amount);
}

// slug.ts
export function slugify(value: string) {
  return value.toLowerCase().trim().replace(/['']/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}
```

### README
```md
# @agency/core-utils
Pure utility functions. No React, no DB, no I/O, no environment variables.
```
