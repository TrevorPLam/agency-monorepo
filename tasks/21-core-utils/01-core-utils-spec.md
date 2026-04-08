# 21-core-utils: Implementation Specification

## Files
```
packages/core/shared-utils/
├── package.json
├── tsconfig.json
├── src/
│   ├── index.ts
│   ├── date.ts
│   ├── string.ts
│   ├── currency.ts
│   └── validation.ts
└── README.md
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
    "./validation": "./src/validation.ts"
  },
  "dependencies": {
    "@agency/core-types": "workspace:*"
  },
  "devDependencies": {
    "@agency/config-typescript": "workspace:*"
  },
  "publishConfig": { "access": "restricted" }
}
```

### `src/date.ts`
```ts
export function formatDate(date: Date, format: "short" | "long" = "short"): string {
  return format === "short"
    ? date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    : date.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

export function formatRelative(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
  return formatDate(date, "short");
}
```

### `src/string.ts`
```ts
export function slugify(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}
```

### `src/currency.ts`
```ts
export function formatCurrency(cents: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency
  }).format(cents / 100);
}
```

## Verification

```bash
# Run tests
pnpm --filter @agency/core-utils test

# Type check
pnpm --filter @agency/core-utils typecheck
```
