# 13-config-react-compiler: Implementation Constraints

## Purpose
Define hard boundaries and constraints for React Compiler configuration to ensure safe and effective automatic memoization.

## Hard Constraints

### Version Management
- **React Compiler Version**: Must match React version (19.2.4)
- **Babel Plugin**: Use `babel-plugin-react-compiler` from workspace catalog
- **No Manual Overrides**: Never override compiler defaults without ADR approval

### Configuration Modes
- **Development Mode**: `compilationMode: "annotation"` — only compile functions with `"use memo"`
- **Production Mode**: `compilationMode: "all"` — compile all eligible functions
- **Panic Threshold**: `panicThreshold: "NONE"` — never crash on compiler errors

### Compilation Boundaries
- **Opt-In First**: New projects start with annotation mode
- **Gradual Migration**: Teams can enable full compilation after testing
- **Escape Hatches**: `// @no-memo` directive available for problematic functions

### ESLint Integration
- **Required Plugin**: Must use `eslint-plugin-react-compiler`
- **Error Severity**: React Compiler ESLint rules set to "error"
- **No Suppression**: Never disable compiler ESLint rules without code review

## Forbidden Patterns

### ❌ Never Use These
```javascript
// Don't disable compiler for entire files unnecessarily
'use no memo';

// Don't use runtime checks that defeat memoization
function Component({ items }) {
  const processed = items.map(x => expensive(x)); // Not memoized manually
  // React Compiler should handle this
}
```

### ❌ Avoid These Anti-Patterns
- **Manual memo with Compiler**: Don't use `useMemo`/`useCallback` in compiler-enabled files
- **Disabling for convenience**: Only use escape hatches for actual compiler bugs
- **Mixing patterns**: Don't partially enable compiler — use consistent approach per file

## Compliance Requirements

### Performance Monitoring
- **Baseline Metrics**: Measure render performance before enabling compiler
- **Regression Detection**: Automated tests catch performance degradation
- **Over-Optimization Detection**: Flag suspicious memoization patterns

### Testing Requirements
- **Compiler Validation**: Tests verify compiled output correctness
- **Edge Case Coverage**: Test components with complex prop patterns
- **Memory Profiling**: Ensure no memory leaks from memoization

### Build Requirements
- **Babel Integration**: Compiler runs as part of build pipeline
- **Source Maps**: Preserve debugging experience with accurate source maps
- **Error Reporting**: Clear errors when compilation fails

## Exit Criteria

A React Compiler configuration is complete when:
1. Babel plugin configured with correct compilation mode
2. ESLint rules enabled and passing
3. Performance baseline established
4. Team trained on escape hatches and migration
5. CI includes compiler validation
6. No manual memoization in compiler-enabled files

## Review Process

1. **Configuration Review**: Verify mode settings and error handling
2. **Performance Audit**: Compare before/after render metrics
3. **Edge Case Testing**: Validate complex component patterns
4. **Team Training**: Ensure developers understand compiler behavior

## Consequences

This decision enables automatic optimization while maintaining safety through opt-in modes and escape hatches. The compiler eliminates manual memoization burden but requires discipline in migration approach.
