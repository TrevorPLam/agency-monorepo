# 23-core-hooks: Constraints & Boundaries

## Purpose
Technical constraints and architectural boundaries for the hooks package to ensure SSR safety, tree-shaking, and prevent scope creep.

## Critical Constraints

### SSR Safety Rules
- **Window Check**: Every hook must handle `typeof window === "undefined"` for server-side rendering
- **Fallback Values**: All hooks must provide sensible defaults for SSR environments
- **No Browser APIs**: Never use browser-only APIs without proper feature detection
- **Event Cleanup**: Every `useEffect` must return proper cleanup function

### Tree Shaking Rules
- **Individual Exports**: Every hook must be individually exportable via named exports
- **Side Effects**: Package must have `sideEffects: false` in package.json
- **No Internal State**: Hooks cannot store state between renders or share global state

### React Compatibility
- **React 19+**: All hooks must be compatible with React Compiler expectations
- **Forward Ref**: Hooks must properly forward refs to child components
- **No Direct DOM**: Never directly manipulate DOM elements, only through React patterns

### Dependency Constraints
- **Zero External Dependencies**: Only depends on React and TypeScript configuration
- **No Circular Dependencies**: Cannot create hooks that depend on other packages that import this package
- **Import Direction**: Only UI, data, auth, and communication packages may import core-hooks

## Functional Boundaries

### Hook Categories
Core hooks package should only contain these hook categories:

| Category | Belongs | Notes |
|-----------|----------|-------|
| State Management | ❌ Core | Belongs in state management package |
| Data Fetching | ❌ Data | Belongs in data-api-client package |
| Browser APIs | ✅ Core | Window, clipboard, media queries, local storage |
| Event Handling | ✅ Core | Click outside, keyboard shortcuts, form events |
| UI Interaction | ✅ Core | Hover states, focus management, drag/drop |
| Animation | ✅ Core | Transitions, spring animations, scroll behavior |
| Performance | ✅ Core | Debounce, throttle, memoization patterns |

## Forbidden Patterns

### ❌ Business Logic in Hooks
```ts
// WRONG: Business logic in hooks
export function useUserRole(user: User): "admin" | "user" {
  return user.role; // Business rule, not a pure hook
}

// WRONG: Data fetching in hooks
export function useUserData(userId: string): User | null {
  const [user, setUser] = useState<User | null>(null);
  
  useEffect(() => {
    fetch(`/api/users/${userId}`).then(setUser); // Network access in hook
  }, [userId]);
  
  return user;
}
```

### ✅ Pure Hook Patterns
```ts
// CORRECT: Pure behavior utility
export function useDebounce<T>(value: T, delay: number): T {
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

## Architectural Boundaries

### React Version Compatibility
- **React 18**: Hooks can use `useLayoutEffect` for DOM measurements
- **React 19**: React Compiler may optimize automatic memoization - hooks should not fight against this

### Performance Considerations
- **Bundle Size**: Individual hook exports should not increase bundle size significantly
- **Runtime Overhead**: Minimize re-renders and effect cleanup overhead
- **Memory Usage**: Avoid memory leaks in custom hooks

## Compliance Requirements

- **React 19**: Use latest React patterns and TypeScript types
- **TypeScript**: Strict mode with all type checks enabled
- **ESLint**: Import boundary enforcement via `@agency/config-eslint`
- **Testing**: All hooks must have comprehensive test coverage
- **Documentation**: Every hook must have JSDoc comments

## Enforcement Mechanisms

### ESLint Rules
- Import boundary enforcement via `@agency/config-eslint`
- React hooks rules of hooks plugin
- No side effects or state mutations in lint rules

### Build Verification
```bash
# Verify SSR safety
pnpm --filter @agency/core-hooks lint --rule="react-hooks-ssr"

# Check dependency compliance
pnpm --filter @agency/core-hooks build --dry-run

# Validate exports
pnpm --filter @agency/core-hooks build --report=exports
```

## Review Checklist

- [ ] All hooks handle `typeof window === "undefined"` properly
- [ ] Every hook has proper cleanup functions
- [ ] Individual exports work for tree-shaking
- [ ] No business logic embedded in hooks
- [ ] React 19 compatibility maintained
- [ ] All changes documented in README
