# 23-core-hooks: Implementation Specification

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
│   ├── use-effect-event.ts      # React 19.2: useEffectEvent
│   ├── use-action-state.ts      # React 19.2: useActionState
│   └── use-optimistic.ts        # React 19: useOptimistic
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
    "./use-keyboard-shortcut": "./src/use-keyboard-shortcut.ts",
    "./use-effect-event": "./src/use-effect-event.ts",
    "./use-action-state": "./src/use-action-state.ts",
    "./use-optimistic": "./src/use-optimistic.ts"
  },
  "dependencies": {
    "react": "^19.2.4"
  },
  "devDependencies": {
    "@agency/config-typescript": "workspace:*",
    "@types/react": "^19.0.0",
    "vitest": "^2.0.0"
  },
  "publishConfig": { "access": "restricted" }
}
```

### React 19.2 Hook Implementations

#### `src/use-effect-event.ts` (React 19.2)
```ts
import { useCallback, useRef, useEffect } from "react";

// React 19.2: useEffectEvent for stable event handlers in effects
export function useEffectEvent<T extends (...args: any[]) => any>(
  handler: T
): T {
  const handlerRef = useRef(handler);
  
  // Keep the handler reference current
  useEffect(() => {
    handlerRef.current = handler;
  });
  
  // Return a stable callback that calls the current handler
  return useCallback((...args: Parameters<T>): ReturnType<T> => {
    return handlerRef.current(...args);
  }, []) as T;
}
```

#### `src/use-action-state.ts` (React 19.2)
```ts
import { useState, useCallback, useTransition } from "react";

// React 19.2: useActionState for form actions and state management
export interface ActionState<T, E = Error> {
  data: T | null;
  error: E | null;
  isPending: boolean;
}

export function useActionState<T, E = Error>(
  action: (data: FormData) => Promise<T>
): [ActionState<T, E>, (formData: FormData) => void] {
  const [state, setState] = useState<ActionState<T, E>>({
    data: null,
    error: null,
    isPending: false
  });
  
  const [isPending, startTransition] = useTransition();
  
  const submitAction = useCallback((formData: FormData) => {
    startTransition(async () => {
      setState(prev => ({ ...prev, isPending: true, error: null }));
      
      try {
        const result = await action(formData);
        setState({
          data: result,
          error: null,
          isPending: false
        });
      } catch (error) {
        setState({
          data: null,
          error: error as E,
          isPending: false
        });
      }
    });
  }, [action]);
  
  return [state, submitAction];
}
```

#### `src/use-optimistic.ts` (React 19)
```ts
import { useState, useCallback } from "react";

// React 19: useOptimistic for optimistic UI updates
export function useOptimistic<T>(
  initialValue: T,
  updateFn: (current: T, optimisticValue: T) => T
): [T, (optimisticValue: T) => void, () => void] {
  const [state, setState] = useState<T>(initialValue);
  
  const addOptimistic = useCallback((optimisticValue: T) => {
    setState(current => updateFn(current, optimisticValue));
  }, [updateFn]);
  
  const resetOptimistic = useCallback(() => {
    setState(initialValue);
  }, [initialValue]);
  
  return [state, addOptimistic, resetOptimistic];
}
```

### Enhanced Classic Hooks

#### `src/use-debounce.ts` (React 19 Compiler Compatible)
```ts
import { useEffect, useState } from "react";

// React 19 Compiler: No manual memoization needed
export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    
    return () => clearTimeout(timeoutId);
  }, [value, delay]); // Compiler handles memoization
  
  return debouncedValue;
}
```

#### `src/use-media-query.ts` (SSR-Safe)
```ts
import { useState, useEffect } from "react";

// SSR-safe media query hook with enhanced React 19 patterns
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);
  
  useEffect(() => {
    // Check for window availability (SSR safety)
    if (typeof window === "undefined") return;
    
    const mediaQuery = window.matchMedia(query);
    setMatches(mediaQuery.matches);
    
    const handleChange = (e: MediaQueryListEvent) => {
      setMatches(e.matches);
    };
    
    mediaQuery.addEventListener("change", handleChange);
    
    return () => {
      mediaQuery.removeEventListener("change", handleChange);
    };
  }, [query]);
  
  return matches;
}
```

### `src/index.ts`
```ts
// React 19.2 hooks
export { useEffectEvent } from "./use-effect-event";
export { useActionState } from "./use-action-state";

// React 19 hooks
export { useOptimistic } from "./use-optimistic";

// Classic hooks (React 19 Compiler compatible)
export { useDebounce } from "./use-debounce";
export { useThrottle } from "./use-throttle";
export { useMediaQuery } from "./use-media-query";
export { useOutsideClick } from "./use-outside-click";
export { useClipboard } from "./use-clipboard";
export { useKeyboardShortcut } from "./use-keyboard-shortcut";

// Re-export types
export type { ActionState } from "./use-action-state";
```

## React 19.2 Performance Benchmarks

### Hook Performance Targets
- **useEffectEvent**: <1ms overhead for event wrapping
- **useActionState**: <5ms for state transitions
- **useOptimistic**: <2ms for optimistic updates
- **Re-render prevention**: 50% reduction with React Compiler

### Migration Checklist: React 18 → 19.2

#### Breaking Changes
- [ ] Update React to ^19.2.4
- [ ] Replace manual useMemo/useCallback where compiler handles it
- [ ] Update useEffect patterns for useEffectEvent
- [ ] Test React Compiler compatibility

#### New Features to Adopt
- [ ] Implement useEffectEvent for stable event handlers
- [ ] Add useActionState for form actions
- [ ] Use useOptimistic for optimistic UI updates
- [ ] Server Components compatible patterns

#### React Compiler Optimization
- [ ] Remove unnecessary useMemo/useCallback
- [ ] Trust compiler for dependency optimization
- [ ] Use stable callback patterns where needed
- [ ] Test with and without compiler enabled

## Verification

```bash
# React 19.2 compatibility tests
pnpm --filter @agency/core-hooks test:react19

# React Compiler tests
pnpm --filter @agency/core-hooks test:compiler

# Type check
pnpm --filter @agency/core-hooks typecheck

# Verify exports
pnpm --filter @agency/core-hooks build
```

## Usage Examples

```tsx
import { 
  useEffectEvent, 
  useActionState, 
  useOptimistic,
  useDebounce,
  useMediaQuery 
} from "@agency/core-hooks";

// React 19.2: useEffectEvent for stable event handlers
function useScrollPosition() {
  const [position, setPosition] = useState(0);
  
  const handleScroll = useEffectEvent(() => {
    setPosition(window.scrollY);
  });
  
  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []); // No dependency needed thanks to useEffectEvent
}

// React 19.2: useActionState for form handling
function FormComponent() {
  const [state, submitAction] = useActionState(async (formData) => {
    const result = await submitForm(formData);
    return result;
  });
  
  return (
    <form action={submitAction}>
      {state.isPending && <p>Submitting...</p>}
      {state.error && <p>Error: {state.error.message}</p>}
      {state.data && <p>Success!</p>}
    </form>
  );
}

// React 19: useOptimistic for optimistic updates
function LikeButton({ postId, initialLikes }) {
  const [optimisticLikes, addOptimisticLike, reset] = useOptimistic(
    initialLikes,
    (current) => current + 1
  );
  
  return (
    <button onClick={() => {
      addOptimisticLike(optimisticLikes + 1);
      // API call here
    }}>
      {optimisticLikes} likes
    </button>
  );
}
```
