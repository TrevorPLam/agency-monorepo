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
    "@agency/core-types": "workspace:*",
    "zod": "^4.0.0",
    "@js-temporal/polyfill": "^1.0.0"
  },
  "devDependencies": {
    "@agency/config-typescript": "workspace:*"
  },
  "publishConfig": { "access": "restricted" }
}
```

### `src/date.ts`
```ts
// Modern date formatting using Intl API with fallbacks for older browsers
export function formatDate(date: Date, format: "short" | "long" = "short", locale: string = "en-US"): string {
  try {
    const options: Intl.DateTimeFormatOptions = format === "short" 
      ? { dateStyle: "medium" as const }
      : { dateStyle: "long" as const };
    
    return new Intl.DateTimeFormat(locale, options).format(date);
  } catch (error) {
    // Fallback for older browsers or invalid locales
    return date.toLocaleDateString(locale, { 
      month: format === "short" ? "short" : "long",
      day: "numeric", 
      year: "numeric" 
    });
  }
}

export function formatRelative(date: Date, locale: string = "en-US"): string {
  try {
    const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });
    return rtf.format(date, { 
      style: "narrow",
      unit: "day"
    });
  } catch (error) {
    // Fallback for older browsers
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days} days ago`;
    if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
    return formatDate(date, "short");
  }
}

export function isValidDate(date: unknown): date is Date {
  return date instanceof Date && !isNaN(date.getTime());
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

// New: Locale-aware string utilities
export function truncate(str: string, length: number, suffix: string = "..."): string {
  return str.length <= length ? str : str.slice(0, length - suffix.length) + suffix;
}

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}
```

### `src/currency.ts`
```ts
// Modern currency formatting using Intl API with comprehensive options
export interface CurrencyOptions {
  locale?: string;
  currency?: string;
  minimumFractionDigits?: number;
}

export function formatCurrency(
  amount: number, 
  options: CurrencyOptions = {}
): string {
  const { locale = "en-US", currency = "USD", minimumFractionDigits = 2 } = options;
  
  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      minimumFractionDigits
    }).format(amount);
  } catch (error) {
    // Fallback for older browsers
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD"
    }).format(amount);
  }
}

export function parseCurrency(value: string, locale: string = "en-US"): number {
  try {
    const parts = new Intl.NumberFormat(locale, { 
      style: "currency" 
    }).formatToParts(value);
    
    const numberPart = parts.find(part => part.type === "currency" || part.type === "integer");
    return numberPart ? parseFloat(numberPart.value) : 0;
  } catch (error) {
    // Simple fallback parsing
    const cleanValue = value.replace(/[^\d.-]/g, '');
    return parseFloat(cleanValue) || 0;
  }
}
```

### `src/validation.ts`
```ts
// Type-safe validation utilities using Zod schemas
import { z } from "zod";

export const emailSchema = z.string().email("Invalid email address");
export const urlSchema = z.string().url("Invalid URL");
export const slugSchema = z.string()
  .min(1, "Must be at least 1 character")
  .max(50, "Must be 50 characters or less")
  .regex(/^[a-z0-9-]+$/, "Must contain only lowercase letters, numbers, and hyphens");

export type Email = z.infer<typeof emailSchema>;
export type Url = z.infer<typeof urlSchema>;
export type Slug = z.infer<typeof slugSchema>;

export function validateEmail(email: unknown): email is Email {
  return emailSchema.parse(email);
}

export function validateUrl(url: unknown): url is Url {
  return urlSchema.parse(url);
}

export function validateSlug(slug: unknown): slug is Slug {
  return slugSchema.parse(slug);
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
