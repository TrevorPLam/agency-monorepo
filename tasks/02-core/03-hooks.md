# 02-core/03-hooks: Core Hooks Package

Reusable React hooks with no app-specific state. Safe to use in any internal tool or client-facing portal.

## Hooks

| Hook | Purpose |
|---|---|
| `useDebounce(value, delay?)` | Returns a debounced copy of `value`, updated after `delay` ms of inactivity (default 300ms) |
| `useThrottle(value, interval?)` | Returns a throttled copy of `value`, updated at most once per `interval` ms (default 300ms) |
| `useMediaQuery(query)` | Returns `true` when the CSS media query matches. SSR-safe (returns `false` on server) |
| `useOutsideClick(ref, handler)` | Fires `handler` on `mousedown`/`touchstart` outside the given `ref` element |
| `useClipboard(resetDelay?)` | Returns `{ copied, copy, error }`. `copy(text)` writes to clipboard and resets `copied` after `resetDelay` ms |
| `useKeyboardShortcut(key, handler, options?)` | Registers a `keydown` listener; supports `modifiers` (`ctrl`, `meta`, `shift`, `alt`) and `enabled` toggle |

## Usage

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

// Close a dropdown when clicking outside
const menuRef = useRef<HTMLDivElement>(null);
useOutsideClick(menuRef, () => setOpen(false));

// Copy to clipboard with feedback
const { copied, copy } = useClipboard();
<button onClick={() => copy(invoiceUrl)}>{copied ? "Copied!" : "Share"}</button>

// Register Cmd+K shortcut
useKeyboardShortcut("k", openCommandPalette, { modifiers: ["meta"] });
```

## Rules
- No app-specific state — these hooks are purely generic behaviour utilities
- No imports from any other `@agency/*` package
- Every hook must be safe to tree-shake individually via the named path exports