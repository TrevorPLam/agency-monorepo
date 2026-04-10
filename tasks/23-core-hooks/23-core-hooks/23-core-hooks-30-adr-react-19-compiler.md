# ADR: React 19 Compiler Compatibility Strategy

## Status
**Accepted** - Adopt React 19 Compiler-aware patterns for `@agency/core-hooks` while maintaining backward compatibility and SSR safety.

## Context
React 19 introduces the React Compiler which automatically optimizes components by analyzing dependencies at build time. This changes how hooks should be implemented to work effectively with the compiler while maintaining SSR safety and tree-shaking.

## Decision
We will implement React 19 Compiler-compatible patterns for hooks with automatic memoization awareness, async-safe context patterns, and proper effect cleanup.

## Consequences
- **Positive**: Better performance through automatic optimization
- **Positive**: Reduced need for manual memoization
- **Positive**: Future-proof hook patterns for React 19+
- **Negative**: More complex mental model for hook optimization
- **Negative**: Need to understand compiler heuristics for edge cases

## Implementation

### Compiler-Aware Hook Patterns
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

### Async-Safe Context Patterns
Implement hooks that work with React 19's async context:

```ts
// Before (Legacy context)
export function useAsyncValue<T>(context: React.Context<T>): T {
  const value = useContext(context);
  
  if (value === undefined) {
    throw new Error('Context value is undefined');
  }
  
  return value;
}

// After (React 19 ready)
export function useAsyncValue<T>(context: React.Context<T>): T {
  const value = use(context); // React 19's use() hook for async contexts
  
  return value;
}

// Async context provider
export function AsyncProvider<T>({ children, value }: { children: React.ReactNode; value: T }) {
  return (
    <context.Provider value={Promise.resolve(value)}>
      {children}
    </context.Provider>
  );
}
```

### SSR-Safe Effect Patterns
Enhanced SSR safety with proper effect cleanup:

```ts
// Before (Basic SSR safety)
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia(query);
      setMatches(mediaQuery.matches);
      
      return () => {
        mediaQuery.removeEventListener('change', handler);
      };
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

### Event Handler Optimization
Optimize event handlers for compiler efficiency:

```ts
// Before (Stable callback refs)
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

// After (Compiler-optimized callbacks)
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

## Migration Strategy
1. Remove manual `useMemo` and `useCallback` where compiler can handle optimization
2. Update event handlers to use stable callback patterns
3. Implement async-safe context patterns with `use()` hook
4. Enhance SSR safety with proper effect cleanup
5. Add compiler-specific testing strategies

## Testing Strategy

### Compiler Testing
Test hooks with React Compiler enabled:

```ts
describe('React Compiler compatibility', () => {
  it('should work with React Compiler enabled', () => {
    // Test that hooks don't break when compiler is active
    const { result } = renderHook(() => useDebounce('test', 100));
    
    act(() => {
      result.current('test2');
    });
    
    expect(result.current).toBe('test2');
  });
});
```

### Performance Testing
Benchmark hook performance with and without compiler:

```ts
describe('hook performance', () => {
  it('should be performant with compiler', () => {
    const iterations = 10000;
    
    // Test with compiler optimizations
    const start = performance.now();
    for (let i = 0; i < iterations; i++) {
      renderHook(() => useDebounce('test', 100)).unmount();
    }
    const compilerTime = performance.now() - start;
    
    // Test without optimizations for comparison
    const start2 = performance.now();
    for (let i = 0; i < iterations; i++) {
      renderHook(() => useDebounceLegacy('test', 100)).unmount();
    }
    const manualTime = performance.now() - start2;
    
    expect(compilerTime).toBeLessThan(manualTime * 0.8); // Should be faster
  });
});
```

## Best Practices

1. **Trust the Compiler**: Remove manual memoization when compiler can handle it
2. **Stable Dependencies**: Use `useCallback` for event handlers passed to effects
3. **Async Context**: Use `use()` hook for async contexts in React 19
4. **SSR First**: Always check for browser APIs before use
5. **Effect Cleanup**: Return cleanup functions from effects for proper memory management
6. **Testing**: Test with both compiler enabled and disabled

## References
- [React Compiler Documentation](https://react.dev/learn/react-compiler)
- [React 19 Hooks Reference](https://react.dev/reference/react)
- [React 19 Async Context](https://react.dev/reference/react/use#reading-context-from-a-provider-with-an-async-way)
