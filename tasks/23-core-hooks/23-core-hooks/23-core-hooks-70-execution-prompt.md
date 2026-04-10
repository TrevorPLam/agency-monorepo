# Core Hooks Implementation Prompt

## Package Context
You are implementing `@agency/core-hooks`, providing reusable React hooks for the entire agency monorepo. This package must be SSR-safe, tree-shakable, and compatible with React 19's automatic optimizations.

## Critical Constraints
- **SSR Safety First**: All hooks must work in server and client environments
- **Pure Hooks Only**: No app-specific state, no business logic, no direct data fetching
- **Tree Shakable**: Individual exports with `sideEffects: false`
- **React 19 Ready**: Compatible with React Compiler optimizations and new patterns
- **Zero External Dependencies**: Only React and workspace configs

## Implementation Requirements

### 1. SSR Safety Implementation
All hooks must be SSR-safe with proper fallbacks:

```ts
// Before (Basic SSR safety)
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia(query);
      setMatches(mediaQuery.matches);
    }
  }, [query]);
  
  return matches;
}

// After (Enhanced SSR safety)
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);
  
  useEffect(() => {
    // Check for window availability
    if (typeof window === 'undefined') return;
    
    const mediaQuery = window.matchMedia(query);
    setMatches(mediaQuery.matches);
    
    const handleChange = (e: MediaQueryListEvent) => {
      setMatches(e.matches);
    };
    
    mediaQuery.addEventListener('change', handleChange);
    
    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, [query]);
  
  return matches;
}
```

### 2. React 19 Compiler Compatibility
Design hooks that work optimally with React Compiler:

```ts
// Before (Manual memoization)
export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  
  const debouncedCallback = useMemo(() => {
    let timeoutId: NodeJS.Timeout;
    
    return () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setDebouncedValue(value);
      }, delay);
    };
  }, [value, delay]); // Manual memoization
  
  useEffect(() => {
    const cleanup = debouncedCallback();
    return cleanup;
  }, [debouncedCallback]);
  
  return debouncedValue;
}

// After (Compiler-aware)
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

### 3. Modern Hook Patterns
Implement React 19+ patterns where appropriate:

```ts
// useTransition for non-urgent state updates
export function useDeferredValue<T>(value: T): [T, (value: T) => void] {
  const [isPending, startTransition] = useTransition();
  
  const setValue = (newValue: T) => {
    startTransition(() => {
      setDeferredValue(newValue);
    });
  };
  
  return [deferredValue, setValue, isPending];
}

// useOptimistic for UI updates
export function useOptimisticValue<T>(
  initialValue: T,
  updateFn: (current: T, newValue: T) => Promise<T>
): [T, (newValue: T) => Promise<void>] {
  const [value, setValue] = useState<T>(initialValue);
  
  const updateValue = async (newValue: T) => {
    setValue(newValue);
    return updateFn(value, newValue);
  };
  
  return [value, updateValue];
}
```

### 4. Event Handler Optimization
Use stable callback patterns for compiler efficiency:

```ts
// Before (Unstable callbacks)
export function useClickOutside<T extends HTMLElement>(
  ref: React.RefObject<T>,
  handler: (event: MouseEvent) => void
): void {
  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        handler(event);
      }
    };
    
    document.addEventListener('click', handleClick);
    
    return () => {
      document.removeEventListener('click', handleClick);
    };
  }, [ref, handler]);
}

// After (Stable callbacks)
export function useClickOutside<T extends HTMLElement>(
  ref: React.RefObject<T>,
  handler: (event: MouseEvent) => void
): void {
  const stableHandler = useCallback(handler, [handler]); // Stabilize for compiler
  
  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        stableHandler(event);
      }
    };
    
    document.addEventListener('click', handleClick);
    
    return () => {
      document.removeEventListener('click', handleClick);
    };
  }, [ref, stableHandler]); // Compiler optimizes dependency array
}
```

### 5. Export Structure
Follow individual export pattern for tree-shaking:

```json
{
  "exports": {
    ".": "./src/index.ts",
    "./use-debounce": "./src/use-debounce.ts",
    "./use-media-query": "./src/use-media-query.ts",
    "./use-outside-click": "./src/use-outside-click.ts",
    "./use-clipboard": "./src/use-clipboard.ts",
    "./use-keyboard-shortcut": "./src/use-keyboard-shortcut.ts"
  },
  "sideEffects": false
}
```

### 6. Dependencies
Only depend on:
- `react` (pinned to version in DEPENDENCY.md)
- `@agency/config-typescript` (workspace:*)

### 7. Testing Requirements
- Unit tests for all hook scenarios
- Integration tests verify SSR safety
- Performance tests for hook re-renders
- React 19 Compiler compatibility tests
- Browser API compatibility tests

## Quality Standards
- All hooks must be SSR-safe with proper fallbacks
- All hooks must be tree-shakable (individual exports)
- All hooks must use stable callback patterns
- All hooks must have proper effect cleanup
- All hooks must work with React Compiler optimizations

## Common Pitfalls to Avoid
- Do not create app-specific state or business logic
- Do not fetch data directly in hooks
- Do not use unstable APIs without proper fallbacks
- Do not skip effect cleanup
- Do not bypass SSR safety checks
- Do not import from other `@agency/*` packages

## Success Criteria
- [ ] All hooks are SSR-safe with proper fallbacks
- [ ] All hooks are tree-shakable with individual exports
- [ ] All hooks use stable callback patterns
- [ ] All hooks work with React Compiler optimizations
- [ ] All hooks have proper effect cleanup
- [ ] 100% test coverage for hook scenarios
- [ ] Comprehensive JSDoc documentation
- [ ] Zero circular dependencies
- [ ] Bundle size impact documented

Implement this package as the foundation for all React component behavior across the monorepo. SSR safety and React 19 compatibility are critical for modern web development.
