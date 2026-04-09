# 23-core-hooks: Implementation Specification

## Task Header

| Field | Value |
|-------|-------|
| **State** | `planned` — Documented target; implementation not yet authorized |
| **Trigger** | Repository initialization — always required |
| **Minimum Consumers** | n/a (root infrastructure) |
| **Dependencies** | React 19.2.5, TypeScript 6.0, `@agency/config-typescript` |
| **Exit Criteria** | Root package.json, pnpm-workspace.yaml, turbo.json committed and verified |
| **Implementation Authority** | `REPO-STATE.md` — Phase: Planning, Build status: Not started |
| **Version Authority** | `DEPENDENCY.md` §1, §2 — React 19.2.5, TypeScript 6.0 |
| **Supersedes** | n/a |
| **Superseded by** | n/a |

## Cross-references

- Decision status: `DECISION-STATUS.md` — Core hooks package `approved`
- Version pins: `DEPENDENCY.md` §1, §2
- Architecture: `ARCHITECTURE.md` — Core layer section

## Files
```
packages/core/hooks/
├── package.json
├── tsconfig.json
├── src/
│   ├── index.ts
│   ├── use-debounce.ts
│   ├── use-throttle.ts
│   ├── use-media-query.ts
│   ├── use-outside-click.ts
│   ├── use-clipboard.ts
│   ├── use-keyboard-shortcut.ts
│   └── types.ts
├── tests/
│   ├── use-debounce.test.ts
│   ├── use-media-query.test.ts
│   └── use-outside-click.test.ts
└── README.md
```

### `package.json`
```json
{
  "name": "@agency/core-hooks",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "sideEffects": false,
  "exports": {
    ".": "./src/index.ts",
    "./use-debounce": "./src/use-debounce.ts",
    "./use-throttle": "./src/use-throttle.ts",
    "./use-media-query": "./src/use-media-query.ts",
    "./use-outside-click": "./src/use-outside-click.ts",
    "./use-clipboard": "./src/use-clipboard.ts",
    "./use-keyboard-shortcut": "./src/use-keyboard-shortcut.ts"
  },
  "dependencies": {
    "react": "^19.0.0"
  },
  "devDependencies": {
    "@agency/config-typescript": "workspace:*",
    "@types/react": "^19.0.0",
    "vitest": "^2.0.0"
  },
  "publishConfig": { "access": "restricted" }
}
```

### Hook Implementations

#### `src/use-debounce.ts`
```ts
import { useEffect, useState, useRef } from "react";

export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    timeoutRef.current = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [value, delay]);

  return debouncedValue;
}
```

#### `src/use-media-query.ts`
```ts
import { useState, useEffect } from "react";

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return; // SSR safety

    const mediaQuery = window.matchMedia(query);
    setMatches(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => setMatches(e.matches);
    mediaQuery.addEventListener("change", handleChange);

    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [query]);

  return matches;
}
```

#### `src/use-outside-click.ts`
```ts
import { useEffect, useRef } from "react";

export function useOutsideClick<T extends HTMLElement>(
  ref: React.RefObject<T>,
  handler: (event: MouseEvent | TouchEvent) => void
) {
  useEffect(() => {
    const handleClick = (event: MouseEvent | TouchEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        handler(event);
      }
    };

    document.addEventListener("mousedown", handleClick);
    document.addEventListener("touchstart", handleClick);

    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("touchstart", handleClick);
    };
  }, [ref, handler]);
}
```

#### `src/use-clipboard.ts`
```ts
import { useState, useCallback } from "react";

export function useClipboard(resetDelay: number = 2000) {
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const copy = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setError(null);
      
      setTimeout(() => setCopied(false), resetDelay);
    } catch (err) {
      setError(err as Error);
    }
  }, [resetDelay]);

  return { copied, copy, error };
}
```

#### `src/use-keyboard-shortcut.ts`
```ts
import { useEffect } from "react";

interface KeyboardShortcutOptions {
  modifiers?: ("ctrl" | "meta" | "shift" | "alt")[];
  enabled?: boolean;
}

export function useKeyboardShortcut(
  key: string,
  handler: () => void,
  options: KeyboardShortcutOptions = {}
) {
  const { modifiers = [], enabled = true } = options;

  useEffect(() => {
    if (!enabled || typeof window === "undefined") return;

    const handleKeyDown = (event: KeyboardEvent) => {
      const keyMatches = event.key.toLowerCase() === key.toLowerCase();
      const modifiersMatch = modifiers.every(modifier => 
        event.getModifierState(modifier === "meta" ? "meta" : modifier)
      );

      if (keyMatches && modifiersMatch) {
        event.preventDefault();
        handler();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [key, handler, modifiers, enabled]);
}
```

#### `src/index.ts`
```ts
export { useDebounce } from "./use-debounce";
export { useThrottle } from "./use-throttle";
export { useMediaQuery } from "./use-media-query";
export { useOutsideClick } from "./use-outside-click";
export { useClipboard } from "./use-clipboard";
export { useKeyboardShortcut } from "./use-keyboard-shortcut";
```

## Usage Examples

```tsx
import { useDebounce } from "@agency/core-hooks/use-debounce";
import { useMediaQuery } from "@agency/core-hooks/use-media-query";
import { useOutsideClick } from "@agency/core-hooks/use-outside-click";
import { useClipboard } from "@agency/core-hooks/use-clipboard";
import { useKeyboardShortcut } from "@agency/core-hooks/use-keyboard-shortcut";

// Debounce a search input
const debouncedQuery = useDebounce(query, 400);

// Responsive layout
const isDesktop = useMediaQuery("(min-width: 1024px)");

// Close dropdown when clicking outside
const menuRef = useRef<HTMLDivElement>(null);
useOutsideClick(menuRef, () => setOpen(false));

// Copy to clipboard with feedback
const { copied, copy } = useClipboard();
<button onClick={() => copy(invoiceUrl)}>
  {copied ? "Copied!" : "Share"}
</button>

// Register Cmd+K shortcut
useKeyboardShortcut("k", openCommandPalette, { modifiers: ["meta"] });
```

## Verification

```bash
# Type check
pnpm --filter @agency/core-hooks typecheck

# Run tests
pnpm --filter @agency/core-hooks test

# Verify tree-shaking works
pnpm --filter @agency/core-hooks build
```

## Critical Implementation Rules

1. **SSR Safety**: Every hook must handle `typeof window === "undefined"` for server-side rendering
2. **Tree Shaking**: Individual exports via `exports` field with `sideEffects: false`
3. **No External Dependencies**: Only React and types - no other `@agency/*` imports
4. **TypeScript First**: Full type safety with proper interfaces and generics
5. **Cleanup Functions**: Every `useEffect` must return proper cleanup function