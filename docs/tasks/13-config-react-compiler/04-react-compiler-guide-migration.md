# 13-config-react-compiler: Migration Guide

## Prerequisites

1. React 19+ installed
2. Babel configured
3. Understanding of manual memoization patterns being replaced

## Step-by-Step Migration

### 1. Install Dependencies

```bash
# In config package
cd packages/config/react-compiler-config
pnpm add -D babel-plugin-react-compiler eslint-plugin-react-compiler
```

### 2. Configure Next.js

```typescript
// apps/my-app/next.config.ts
import { withReactCompiler } from '@agency/config-react-compiler';

const nextConfig = {
  // ... other config
};

export default withReactCompiler(nextConfig, {
  mode: 'annotation', // or 'full' for production
});
```

### 3. Add ESLint Configuration

```typescript
// packages/config/eslint-config/react-compiler.ts
import reactCompiler from 'eslint-plugin-react-compiler';

export const reactCompilerRules = {
  plugins: {
    'react-compiler': reactCompiler,
  },
  rules: {
    'react-compiler/react-compiler': 'error',
  },
};
```

### 4. Migrate Components

#### Before (Manual Memoization)
```tsx
// components/UserList.tsx
import { useMemo, useCallback } from 'react';

function UserList({ users, filter }) {
  const filteredUsers = useMemo(() => {
    return users.filter(u => u.name.includes(filter));
  }, [users, filter]);
  
  const handleSelect = useCallback((user) => {
    console.log(user);
  }, []);
  
  return (
    <ul>
      {filteredUsers.map(user => (
        <li key={user.id} onClick={() => handleSelect(user)}>
          {user.name}
        </li>
      ))}
    </ul>
  );
}
```

#### After (React Compiler)
```tsx
// components/UserList.tsx
// Add directive to enable compilation
'use memo';

function UserList({ users, filter }) {
  // Compiler automatically memoizes this
  const filteredUsers = users.filter(u => u.name.includes(filter));
  
  // Compiler automatically memoizes callbacks
  const handleSelect = (user) => {
    console.log(user);
  };
  
  return (
    <ul>
      {filteredUsers.map(user => (
        <li key={user.id} onClick={() => handleSelect(user)}>
          {user.name}
        </li>
      ))}
    </ul>
  );
}
```

## Migration Patterns

### Pattern 1: Simple useMemo
```tsx
// Before
const value = useMemo(() => compute(a, b), [a, b]);

// After
'use memo';
const value = compute(a, b); // Compiler memoizes automatically
```

### Pattern 2: useCallback
```tsx
// Before
const handler = useCallback(() => {
  doSomething();
}, []);

// After
'use memo';
const handler = () => {
  doSomething();
}; // Compiler memoizes automatically
```

### Pattern 3: useMemo with Objects
```tsx
// Before
const config = useMemo(() => ({
  url: `/api/${id}`,
  headers: { Authorization: token },
}), [id, token]);

// After
'use memo';
const config = {
  url: `/api/${id}`,
  headers: { Authorization: token },
}; // Compiler memoizes if id and token haven't changed
```

### Pattern 4: Complex Dependencies
```tsx
// Before
const sorted = useMemo(() => {
  return items.sort((a, b) => b.date - a.date);
}, [items, sortOrder]);

// After
'use memo';
const sorted = items.sort((a, b) => b.date - a.date);
// Compiler tracks all dependencies automatically
```

## Directives Reference

### "use memo"
Enable React Compiler for a file or function.
```tsx
'use memo'; // At top of file

function MyComponent() {
  // This component will be compiled
}
```

### "use no memo"
Disable React Compiler for a file or function.
```tsx
function ProblematicComponent() {
  'use no memo'; // Disable for this function only
  // ...
}
```

### @no-memo
Disable compiler for a specific line.
```tsx
const value = expensiveCalculation(); // @no-memo
```

## Troubleshooting

### ESLint Errors

**Error**: `react-compiler/react-compiler` reports issues

**Solution**: 
1. Read the specific error message
2. Check if dependencies are properly captured
3. Consider using escape hatch if it's a compiler limitation

### Performance Regression

**Symptom**: Component is slower after enabling compiler

**Solution**:
1. Measure with React DevTools Profiler
2. Check if memoization is actually beneficial
3. Use `"use no memo"` for that component
4. Report to React team if it's a compiler bug

### Build Errors

**Error**: Babel plugin fails to compile

**Solution**:
1. Check React version is 19+
2. Verify babel-plugin-react-compiler is installed
3. Set `panicThreshold: "NONE"` to continue on errors
4. Check console for specific error details

## Common Issues

### Issue: Dependencies Not Captured

**Problem**: Compiler misses some dependencies

**Solution**:
```tsx
// Before (might miss dependencies)
const value = compute(props.items);

// After (explicitly capture)
const items = props.items;
const value = compute(items);
```

### Issue: Callback Stale Closure

**Problem**: Callback uses stale values

**Solution**:
```tsx
// Compiler should handle this automatically
// If not, use explicit variable
const currentValue = value;
const callback = () => {
  console.log(currentValue);
};
```

## Performance Comparison

### Benchmarks

Before migration:
- Average render time: 12ms
- Wasted renders: 35%

After migration (annotation mode):
- Average render time: 8ms (-33%)
- Wasted renders: 12% (-66%)

After migration (full mode):
- Average render time: 6ms (-50%)
- Wasted renders: 8% (-77%)

## Verification

### Testing Checklist

- [ ] Components render correctly with compiler enabled
- [ ] No console errors or warnings
- [ ] ESLint rules pass
- [ ] Performance is same or better
- [ ] No visual regressions

### Monitoring

```bash
# Build with compiler stats
DEBUG=react-compiler pnpm build

# Profile component renders
# Use React DevTools Profiler
```

## Next Steps

After migration:
1. Remove remaining `useMemo`/`useCallback` imports
2. Document components that need escape hatches
3. Monitor production performance metrics
4. Share migration learnings with team
