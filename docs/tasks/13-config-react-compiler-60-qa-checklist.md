# 13-config-react-compiler: QA Checklist

## Pre-Merge Verification

### Configuration Files

- [ ] `@agency/config-react-compiler` package created
- [ ] `next-config.ts` with `withReactCompiler` helper
- [ ] `eslint-rules.ts` with React Compiler rules
- [ ] `package.json` exports both configs

### Compiler Configuration

- [ ] `compilationMode` set to "annotation" (initial) or "all" (full)
- [ ] `panicThreshold` set to "NONE" (don't crash on errors)
- [ ] `target` set to "19" (matching React version)
- [ ] Error handling configured gracefully

### ESLint Integration

- [ ] `eslint-plugin-react-compiler` installed
- [ ] ESLint config includes compiler rules
- [ ] Rules set to "error" (not "warn")
- [ ] CI includes ESLint check

## Migration Verification

### Component Testing

- [ ] Pilot components have `"use memo"` directive
- [ ] Components render correctly with compiler
- [ ] No console warnings or errors
- [ ] Visual regression tests pass

### Performance Testing

```bash
# Measure render performance
# Before migration
# React DevTools Profiler > Record > Interact > Stop

# After migration  
# React DevTools Profiler > Record > Interact > Stop
# Compare: Should be same or better
```

### Build Testing

```bash
# Test build with compiler
pnpm build
# Should complete without compiler errors
```

### Edge Case Testing

Test these patterns:
- [ ] Components with complex prop types
- [ ] Components with context usage
- [ ] Components with refs
- [ ] Components with effects
- [ ] Components with memoized children
- [ ] Higher-order components

## ESLint Validation

### Compiler Rules

- [ ] `react-compiler/react-compiler` rule enabled
- [ ] No compiler-related ESLint errors
- [ ] Any escape hatches documented

### Code Quality

- [ ] No manual `useMemo` in compiler-enabled files
- [ ] No manual `useCallback` in compiler-enabled files
- [ ] Directives used correctly (`"use memo"`, `"use no memo"`)

## Performance Benchmarks

### Metrics to Measure

| Metric | Before | After | Target |
|--------|--------|-------|--------|
| Avg Render Time | ?ms | ?ms | ≤ Before |
| Wasted Renders | ?% | ?% | ≤ Before |
| Memory Usage | ?MB | ?MB | ≤ Before + 10% |

### Profiling Checklist

- [ ] Profile key user flows
- [ ] Compare before/after flame graphs
- [ ] Check for memory leaks
- [ ] Verify no infinite re-render loops

## CI/CD Integration

- [ ] CI includes compiler build step
- [ ] CI includes ESLint with compiler rules
- [ ] Build fails on compiler errors (configurable)
- [ ] Performance regression tests included

### Sample CI Configuration

```yaml
- name: Build with React Compiler
  run: |
    pnpm build
    # Compiler runs as part of Next.js build

- name: Lint with Compiler Rules
  run: |
    pnpm eslint --rule 'react-compiler/react-compiler: error'
```

## Documentation

- [ ] Migration guide updated with learnings
- [ ] Escape hatch patterns documented
- [ ] Team training materials created
- [ ] Troubleshooting guide includes common issues

## Sign-Off

- [ ] QA Engineer verified component correctness
- [ ] Performance meets or exceeds baseline
- [ ] No visual regressions
- [ ] ESLint rules passing
- [ ] Documentation complete
- [ ] Platform Lead approved

## Notes

- Monitor error rates after production deployment
- Keep escape hatch usage under 5% of components
- Track compiler version updates from React team
- Document any patterns that compiler doesn't optimize well
