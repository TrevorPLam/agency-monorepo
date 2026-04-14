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
import { Temporal } from "@js-temporal/polyfill";

// Modern date formatting using Temporal API with Intl fallbacks
export function formatDate(
  date: Date | Temporal.PlainDate, 
  format: "short" | "long" = "short", 
  locale: string = "en-US"
): string {
  try {
    // Convert to Temporal.PlainDate for modern API
    const temporalDate = date instanceof Date 
      ? Temporal.PlainDate.from(date.toISOString().slice(0, 10))
      : date;
    
    const options: Intl.DateTimeFormatOptions = format === "short" 
      ? { dateStyle: "medium" as const }
      : { dateStyle: "long" as const };
    
    return new Intl.DateTimeFormat(locale, options).format(
      new Date(temporalDate.toString())
    );
  } catch (error) {
    // Fallback for older browsers
    if (date instanceof Date) {
      return date.toLocaleDateString(locale, { 
        month: format === "short" ? "short" : "long",
        day: "numeric", 
        year: "numeric" 
      });
    }
    throw error;
  }
}

// Temporal API utilities for modern date handling
export function addDays(date: Date | Temporal.PlainDate, days: number): Temporal.PlainDate {
  const temporalDate = date instanceof Date 
    ? Temporal.PlainDate.from(date.toISOString().slice(0, 10))
    : date;
  
  return temporalDate.add({ days });
}

export function subtractDays(date: Date | Temporal.PlainDate, days: number): Temporal.PlainDate {
  const temporalDate = date instanceof Date 
    ? Temporal.PlainDate.from(date.toISOString().slice(0, 10))
    : date;
  
  return temporalDate.subtract({ days });
}

// Performance-optimized relative time formatting using Temporal API
export function getRelativeTime(
  from: Date | Temporal.PlainDate, 
  to: Date | Temporal.PlainDate
): string {
  try {
    const fromDate = from instanceof Date 
      ? Temporal.PlainDate.from(from.toISOString().slice(0, 10)) 
      : from;
    const toDate = to instanceof Date 
      ? Temporal.PlainDate.from(to.toISOString().slice(0, 10)) 
      : to;
    
    const difference = fromDate.until(toDate, { largestUnit: 'days' });
    const days = difference.days;
    
    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days} days ago`;
    if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
    
    return `Over ${days} days`;
  } catch (error) {
    // Fallback for older browsers
    if (from instanceof Date && to instanceof Date) {
      const diff = to.getTime() - from.getTime();
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      
      if (days === 0) return "Today";
      if (days === 1) return "Yesterday";
      if (days < 7) return `${days} days ago`;
      if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
    }
    throw error;
  }
}

export function isValidDate(date: unknown): date is Date | Temporal.PlainDate {
  if (date instanceof Date) {
    return !isNaN(date.getTime());
  }
  try {
    return Temporal.PlainDate.isPlainDate(date);
  } catch {
    return false;
  }
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

// New: Locale-aware string utilities with Unicode support using Intl.Segmenter
export function truncate(str: string, length: number, suffix: string = "..."): string {
  return str.length <= length ? str : str.slice(0, length - suffix.length) + suffix;
}

// Unicode-aware string truncation using Intl.Segmenter (2026 modern API)
export function truncateWithGrapheme(
  str: string, 
  length: number, 
  suffix: string = "..."
): string {
  try {
    // Check for Intl.Segmenter support (modern browsers)
    if (typeof Intl.Segmenter === 'undefined') {
      return truncate(str, length, suffix);
    }
    
    const segmenter = new Intl.Segmenter();
    const segments = Array.from(segmenter.segment(str));
    
    if (segments.length <= length) {
      return str;
    }
    
    return segments.slice(0, length).map(s => s.segment).join('') + suffix;
  } catch {
    // Fallback for browsers without Intl.Segmenter support
    return truncate(str, length, suffix);
  }
}

// Performance-optimized email validation
export function isValidEmail(email: string): boolean {
  // Fast path: basic structure check
  const at = email.indexOf('@');
  const dot = email.lastIndexOf('.');
  
  if (at <= 0 || dot <= at + 1 || dot >= email.length - 1) {
    return false;
  }
  
  // Full regex validation for accuracy
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
// Modern currency formatting using Intl API
export function formatCurrency(
  amount: number, 
  currency: string = "USD", 
  locale: string = "en-US"
): string {
  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency
    }).format(amount);
  } catch (error) {
    // Fallback for unsupported locales
    return `$${amount.toFixed(2)}`;
  }
}

// Exchange rate calculation with precision handling
export function convertCurrency(
  amount: number, 
  fromRate: number, 
  toRate: number
): number {
  const rate = toRate / fromRate;
  return Math.round(amount * rate * 100) / 100; // Round to 2 decimal places
}
```

### `src/validation.ts`
```ts
import { z } from "zod";

// Zod v4: Enhanced validation schemas with strict mode
export const emailSchema = z.string().email().strict();
export const urlSchema = z.string().url().strict();
export const slugSchema = z.string().regex(/^[a-z0-9-]+$/).strict();

// Performance-optimized validation helpers
export function validateEmail(email: string): boolean {
  return emailSchema.safeParse(email).success;
}

export function validateUrl(url: string): boolean {
  return urlSchema.safeParse(url).success;
}

export function validateSlug(slug: string): boolean {
  return slugSchema.safeParse(slug).success;
}
```

### `src/index.ts`
```ts
export { formatDate, addDays, subtractDays, getRelativeTime, isValidDate } from "./date";
export { slugify, capitalize, truncate, truncateWithGrapheme, isValidEmail, isValidUrl } from "./string";
export { formatCurrency, convertCurrency } from "./currency";
export { validateEmail, validateUrl, validateSlug, emailSchema, urlSchema, slugSchema } from "./validation";
```

## Performance Benchmarks

### Temporal API Performance Targets
- **Date operations**: <5ms (10x improvement from legacy Date)
- **String operations**: <50ms for 10k operations  
- **Intl.Segmenter support**: Unicode-aware string handling
- **Bundle impact**: +15KB for @js-temporal/polyfill

### Migration Checklist: Date API → Temporal API

#### Breaking Changes
- [ ] Add @js-temporal/polyfill dependency
- [ ] Update date manipulation functions to use Temporal.PlainDate
- [ ] Add Intl.Segmenter for Unicode-aware string operations
- [ ] Test performance benchmarks meet targets

#### New Features to Adopt
- [ ] Implement Temporal.PlainDate for date-only operations
- [ ] Add Temporal.ZonedDateTime for timezone-aware operations when needed
- [ ] Use Intl.Segmenter for grapheme-aware string operations
- [ ] Performance-optimized validation functions

## Verification

```bash
# Performance test (Temporal API)
pnpm --filter @agency/core-utils test:performance

# Type check
pnpm --filter @agency/core-utils typecheck

# Verify exports
pnpm --filter @agency/core-utils build
```
