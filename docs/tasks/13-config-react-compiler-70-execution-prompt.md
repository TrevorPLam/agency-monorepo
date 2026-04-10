# 13-config-react-compiler: Handoff Prompt

## Context
You are continuing the React Compiler configuration for the agency monorepo. The base configuration is established in `@agency/config-react-compiler`.

## Current State
- ✅ React Compiler config package created
- ✅ Next.js integration configured
- ✅ ESLint rules set up
- ✅ Migration guide documented

## Your Task

### Immediate Next Steps

1. **Enable in Pilot App**
   - Choose one app for initial testing (e.g., `apps/agency-website`)
   - Configure with `mode: 'annotation'`
   - Add `"use memo"` to 3-5 high-value components
   - Measure performance impact

2. **Pilot Component Selection**
   Select components with:
   - Expensive calculations
   - Large lists or tables
   - Frequent re-renders
   - Complex child components

3. **Performance Measurement**
   - Establish baseline with React DevTools Profiler
   - Measure after adding compiler directives
   - Document improvements or issues

### Implementation Guide

#### Enable in App
```typescript
// apps/my-app/next.config.ts
import { withReactCompiler } from '@agency/config-react-compiler';

export default withReactCompiler({
  // ... other config
}, {
  mode: 'annotation', // Safe for testing
});
```

#### Add to Component
```tsx
// components/ExpensiveList.tsx
'use memo'; // Enable compiler for this file

export function ExpensiveList({ items }) {
  // This expensive calculation is now auto-memoized
  const processed = items.map(transform);
  
  return (
    <ul>
      {processed.map(item => (
        <ListItem key={item.id} item={item} />
      ))}
    </ul>
  );
}
```

### Constraints & Rules

**MUST Follow:**
- Start with `mode: 'annotation'` (opt-in)
- Use `"use memo"` directive explicitly
- Measure performance before and after
- Keep ESLint rules enabled

**MUST NOT:**
- Jump to `mode: 'full'` without testing
- Disable ESLint rules to bypass errors
- Remove manual memoization without verifying compiler handles it

### Testing Requirements

Before marking complete:
1. Test app builds without compiler errors
2. Verify components render correctly
3. Measure performance improvement
4. Document any escape hatches needed

### Common Pitfalls

⚠️ **Build Failures**: Check React version is 19+, set `panicThreshold: "NONE"`
⚠️ **Performance Worse**: Some components may not benefit — use `"use no memo"`
⚠️ **ESLint Errors**: Read carefully — may indicate real issues
⚠️ **Testing**: Always test in browser, not just build success

### Deliverables

- [ ] Pilot app enabled with compiler
- [ ] 3-5 components using `"use memo"`
- [ ] Performance measurements documented
- [ ] Escape hatches documented (if any)
- [ ] Rollout plan for more apps

### Migration Decision Tree

```
Component has expensive calculations?
├── YES → Add 'use memo', measure performance
│         ├── Better → Keep enabled
│         └── Worse → Try 'use no memo' or optimize differently
└── NO → Don't add directive (not worth compiler overhead)

ESLint reports compiler error?
├── Fixable → Fix the code issue
└── Compiler bug → Use 'use no memo', report to React team
```

### Questions?

If you encounter:
- **Compiler not optimizing**: Check React DevTools Profiler to see memoization
- **Build slow**: Compiler adds ~10-20% to build time (acceptable tradeoff)
- **Confusing ESLint errors**: Check React Compiler documentation

### References

- `@/docs/tasks/13-config-react-compiler-10-spec.md` — Technical spec
- `@/docs/tasks/13-config-react-compiler-40-guide-migration.md` — Migration guide
- `@/docs/tasks/13-config-react-compiler-60-qa-checklist.md` — QA checklist
- [React Compiler Docs](https://react.dev/learn/react-compiler)

---

**Ready to proceed**: Start with pilot app, measure performance, expand gradually.


