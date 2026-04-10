# ADR: React Compiler for Automatic Memoization

## Status
**Accepted** — Adopt React Compiler for automatic memoization, eliminating manual `useMemo`/`useCallback` usage.

## Context
React 19 (April 2026) stabilized the React Compiler, which automatically memoizes components and hooks without manual intervention. We need to decide:

1. Whether to adopt React Compiler in the monorepo
2. How to handle migration from manual memoization
3. What compilation mode to use for different scenarios

## Decision
Adopt React Compiler in **annotation mode** for gradual migration, with path to full compilation.

## Rationale

### Why React Compiler

1. **Eliminates Manual Memoization**: No more `useMemo`/`useCallback` ceremony
2. **Better Performance**: Automatically finds optimization opportunities humans miss
3. **Simpler Code**: Developers focus on logic, not optimization
4. **Official Support**: Now stable in React 19, production-ready
5. **Automatic Updates**: Compiler improves over time without code changes

### Compilation Modes

**Annotation Mode (Default)**:
- Only compiles functions with `"use memo"` directive
- Safe for existing codebases
- Gradual adoption path

**Full Mode (Production Goal)**:
- Compiles all eligible functions
- Maximum optimization
- Requires thorough testing

### Why Not Manual Memoization

- **Error-Prone**: Easy to miss dependencies or create stale closures
- **Code Noise**: 30-50% of React code is memoization boilerplate
- **Maintenance Burden**: Every change requires updating dependency arrays
- **Incomplete**: Developers often forget to memoize expensive calculations

## Implementation Details

### Configuration
```javascript
// packages/config/react-compiler-config/next-config.ts
export function withReactCompiler(config, options = {}) {
  const { mode = 'annotation' } = options;
  
  return {
    ...config,
    reactCompiler: {
      compilationMode: mode === 'full' ? 'all' : 'annotation',
      panicThreshold: 'NONE',
    },
  };
}
```

### Babel Configuration
```javascript
// babel.config.js
module.exports = {
  plugins: [
    ['babel-plugin-react-compiler', {
      target: '19',
    }],
  ],
};
```

### ESLint Rules
```javascript
// eslint.config.js
import reactCompiler from 'eslint-plugin-react-compiler';

export default [
  {
    plugins: {
      'react-compiler': reactCompiler,
    },
    rules: {
      'react-compiler/react-compiler': 'error',
    },
  },
];
```

## Migration Strategy

### Phase 1: Foundation (Week 1-2)
- Install compiler dependencies
- Configure in annotation mode
- Add ESLint rules
- Document escape hatches

### Phase 2: Pilot Components (Week 3-4)
- Select high-value components for optimization
- Add `"use memo"` directives
- Measure performance impact
- Gather feedback

### Phase 3: Gradual Rollout (Week 5-8)
- Add directives to more components
- Monitor production metrics
- Fix edge cases
- Train team on patterns

### Phase 4: Full Compilation (Week 9+)
- Switch to full mode for stable components
- Remove manual memoization
- Audit remaining `useMemo`/`useCallback` usage
- Document learnings

## Escape Hatches

### When to Disable Compiler

1. **Compiler Bugs**: Rare, but use `"use no memo"` if found
2. **Complex Patterns**: Some edge cases may not optimize correctly
3. **Performance Regression**: If compiled code is slower (measure first)

### Escape Hatch Syntax
```javascript
// Disable for entire file
'use no memo';

// Disable for single function
function ExpensiveComponent() {
  'use no memo';
  // ...
}
```

## Consequences

### Positive

- **Less Boilerplate**: No more `useMemo`/`useCallback` dependency arrays
- **Better Optimization**: Compiler finds optimizations humans miss
- **Easier Maintenance**: Changes don't break memoization
- **Progressive Enhancement**: Works alongside existing code

### Negative

- **Learning Curve**: Team must understand compiler behavior
- **Edge Cases**: Some patterns may not optimize correctly
- **Build Time**: Adds compilation step to build process
- **Debugging**: May need to understand compiled output occasionally

## References

- [React Compiler Documentation](https://react.dev/learn/react-compiler)
- [React 19 Release Notes](https://react.dev/blog/2024/12/05/react-19)
- [babel-plugin-react-compiler](https://www.npmjs.com/package/babel-plugin-react-compiler)
