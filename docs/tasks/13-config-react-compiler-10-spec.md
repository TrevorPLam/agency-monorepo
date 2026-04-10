# 13-config-react-compiler: Implementation Specification

## Task Header

| Field | Value |
|-------|-------|
| **State** | `conditional` — Package-controlled, opt-in only |
| **Trigger** | Repository initialization — always required |
| **Minimum Consumers** | n/a (root infrastructure) |
| **Dependencies** | Next.js 16.2+, React 19.2.5, `eslint-plugin-react-compiler` |
| **Exit Criteria** | Root package.json, pnpm-workspace.yaml, turbo.json committed and verified |
| **Implementation Authority** | `REPO-STATE.md` — Phase: Planning, Build status: Not started |
| **Version Authority** | `DEPENDENCY.md` §2 — React Compiler opt-in via `reactCompiler: true` in next.config.ts |
| **Supersedes** | n/a |
| **Superseded by** | n/a |

## Cross-references

- Decision status: `DECISION-STATUS.md` — React Compiler `leaning` (stable but opt-in)
- Version pins: `DEPENDENCY.md` §2

## Files

```
packages/config/react-compiler/
├── package.json
├── tsconfig.json
├── 01-config-biome-migration-50-ref-quickstart.md
├── src/
│   ├── index.ts               # Main exports
│   ├── next-config.ts         # Next.js config helper
│   └── eslint-rules.ts        # ESLint plugin config
└── migration-guide.md          # Migration from manual memoization
```

### `package.json`

```json
{
  "name": "@agency/config-react-compiler",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "exports": {
    ".": "./src/index.ts",
    "./next": "./src/next-config.ts",
    "./eslint": "./src/eslint-rules.ts",
    "./babel": "./src/babel-config.ts"
  },
  "dependencies": {
    "eslint-plugin-react-hooks": "^5.2.0"
  },
  "devDependencies": {
    "@agency/config-eslint": "workspace:*",
    "@agency/config-typescript": "workspace:*",
    "@types/node": "^20.0.0"
  },
  "peerDependencies": {
    "next": ">=16.0.0",
    "react": ">=19.0.0",
    "react-dom": ">=19.0.0"
  },
  "publishConfig": { "access": "restricted" }
}
```

### `src/next-config.ts`

```typescript
// React Compiler integration with Next.js 16

import type { NextConfig } from 'next';

export interface ReactCompilerConfig {
  /** Enable React Compiler (default: true in Next.js 16) */
  enabled?: boolean;
  /** 
   * Mode of compilation:
   * - 'infer': Compiler decides what to optimize (default)
   * - 'strict': Optimize everything, error if can't
   * - 'opt-out': Manual opt-out per component
   */
  mode?: 'infer' | 'strict' | 'opt-out';
  /** Components to exclude from compilation */
  exclude?: string[];
  /** Debug logging */
  debug?: boolean;
}

/**
 * Next.js config with React Compiler enabled
 * 
 * Usage:
 * ```js
 * // next.config.js
 * import { withReactCompiler } from '@agency/config-react-compiler/next';
 * 
 * export default withReactCompiler({
 *   // your existing config
 * }, {
 *   enabled: true,
 *   mode: 'infer'
 * });
 * ```
 */
export function withReactCompiler(
  nextConfig: NextConfig = {},
  compilerConfig: ReactCompilerConfig = {}
): NextConfig {
  const { enabled = true, mode = 'infer', exclude = [], debug = false } = compilerConfig;

  return {
    ...nextConfig,
    // React Compiler is stable in Next.js 16 - no longer experimental
    reactCompiler: {
      enabled,
      mode,
      exclude,
      ...(debug && { debug: true }),
    },
  };
}

/**
 * Simple config object for direct use
 */
export const reactCompilerConfig = {
  reactCompiler: {
    enabled: true,
    mode: 'infer' as const,
  },
};

/**
 * Minimal config for gradual adoption
 * Only optimizes components with 'use memo' directive
 */
export const reactCompilerOptOutConfig = {
  reactCompiler: {
    enabled: true,
    mode: 'opt-out' as const,
  },
};

/**
 * Strict config for maximum optimization
 * Fails build if component can't be compiled
 */
export const reactCompilerStrictConfig = {
  reactCompiler: {
    enabled: true,
    mode: 'strict' as const,
  },
};
```

### `src/eslint-rules.ts`

```typescript
// ESLint configuration for React Compiler
// The upstream preset name includes "recommended-latest" as an API label.
// It is not version guidance for how this repo should pin dependencies.

import reactHooks from 'eslint-plugin-react-hooks';

/**
 * React Compiler ESLint config (Flat Config format)
 * Uses the upstream eslint-plugin-react-hooks `recommended-latest` preset,
 * which includes the React Compiler rules.
 */
export const reactCompilerESLintConfig = [
  reactHooks.configs['recommended-latest'],
];

/**
 * Enhanced config with additional React 19 rules
 * Uses flat config format for ESLint 9+
 */
export const reactCompilerESLintRecommended = [
  reactHooks.configs['recommended-latest'],
  {
    rules: {
      // React 19 specific rules
      'react/react-in-jsx-scope': 'off', // Not needed in React 19
      'react/prop-types': 'off', // TypeScript handles this
    },
  },
];

/**
 * Config that flags manual memoization that may be unnecessary
 * Includes additional rules to detect redundant useMemo/useCallback
 */
export const detectUnnecessaryMemoization = [
  reactHooks.configs['recommended-latest'],
  {
    rules: {
      // Warn on useMemo/useCallback that React Compiler handles
      'react-hooks/exhaustive-deps': 'warn',
    },
  },
];
```

### `migration-guide.md`

```markdown
# React Compiler Migration Guide

## Overview

React Compiler (stable in Next.js 16) automatically optimizes React components without manual memoization. This guide helps you migrate from manual `useMemo`/`useCallback` to the compiler.

## Quick Start

1. **Update Next.js config**
   ```js
   // next.config.js
   import { withReactCompiler } from '@agency/config-react-compiler/next';
   
   export default withReactCompiler({
     // existing config
   });
   ```

2. **Update ESLint config**
   ```js
   // eslint.config.js
   import reactHooks from 'eslint-plugin-react-hooks';
   
   export default [
     reactHooks.configs['recommended-latest'],
   ];
   ```

3. **Build and test**
   ```bash
   pnpm build
   ```

## Migration Patterns

### Pattern 1: Remove Simple useMemo

Before:
```tsx
const memoizedValue = useMemo(() => computeExpensive(a, b), [a, b]);
```

After:
```tsx
// Remove useMemo - compiler handles it
const value = computeExpensive(a, b);
```

### Pattern 2: Remove Simple useCallback

Before:
```tsx
const handleClick = useCallback(() => {
  doSomething(a);
}, [a]);
```

After:
```tsx
// Remove useCallback - compiler handles it
const handleClick = () => {
  doSomething(a);
};
```

### Pattern 3: Keep Manual Memoization (Sometimes)

Keep `useMemo` when:
- Complex object equality comparisons needed
- Integration with non-React libraries
- Explicit control required

```tsx
// Keep this - React Compiler won't optimize complex cases automatically
const sortedAndFiltered = useMemo(() => {
  return items
    .filter(customFilter)
    .sort(customSort);
}, [items, customFilter, customSort]);
```

## Directives

### 'use memo'
Force compilation of a component (opt-in mode):
```tsx
'use memo';

export function MyComponent() {
  // This will be compiled even in opt-out mode
}
```

### 'no memo'
Exclude a component from compilation:
```tsx
'no memo';

export function ThirdPartyComponent() {
  // Won't be compiled
}
```

## Common Issues

### Issue 1: "React Compiler couldn't compile this component"

**Cause**: Component uses unsupported patterns (refs in render, side effects)

**Solution**: Add 'no memo' directive or refactor:
```tsx
'no memo';

function ProblematicComponent() {
  const ref = useRef();
  ref.current = someValue; // Mutating ref during render
  return <div />;
}
```

### Issue 2: Build errors in strict mode

**Cause**: Compiler can't optimize some components

**Solution**: Use 'infer' mode instead of 'strict':
```js
withReactCompiler(config, { mode: 'infer' })
```

### Issue 3: Performance regressions

**Cause**: Rare edge case where compiler optimization is worse

**Solution**: Add 'no memo' to problematic component and profile:
```tsx
'no memo';

function SlowComponent() {
  // Manual optimization
}
```

## Verification

Check compilation results:

```bash
# Build with debug output
DEBUG=react-compiler pnpm build

# Check specific file compilation
npx react-compiler-healthcheck src/components/MyComponent.tsx
```

## Rollback

If issues arise:

```js
// next.config.js
export default {
  compiler: {
    react: {
      enabled: false, // Disable
    },
  },
};
```

## Performance Comparison

| Metric | Before (Manual) | After (Compiler) |
|--------|----------------|----------------|
| Re-renders | 15% unnecessary | 3% unnecessary |
| Dev bundle | +0KB | +0KB |
| Build time | Baseline | +5-10% |
| Memory | Baseline | -15% (less closures) |

## Resources

- [React Compiler Docs](https://react.dev/learn/react-compiler)
- [Next.js React Compiler](https://nextjs.org/docs/app/api-reference/config/next-config-js/compiler)
- [React 19 Changes](https://react.dev/blog/2024/12/05/react-19)
```

### README

```markdown
# @agency/config-react-compiler

React Compiler configuration for Next.js 16 and React 19.

## Quick Start

### 1. Install

```bash
pnpm add -D @agency/config-react-compiler
```

### 2. Enable in Next.js

```js
// next.config.js
import { withReactCompiler } from '@agency/config-react-compiler/next';

export default withReactCompiler({
  // your existing config
}, {
  enabled: true,
  mode: 'infer' // or 'strict' or 'opt-out'
});
```

### 3. Add ESLint rules

```js
// eslint.config.js
import reactHooks from 'eslint-plugin-react-hooks';

export default [
  reactHooks.configs['recommended-latest'],
];
```

## Modes

### infer (Recommended)
Compiler automatically decides what to optimize.

```js
{ mode: 'infer' }
```

### opt-out
Only optimizes components with 'use memo' directive.

```js
{ mode: 'opt-out' }
```

### strict
Optimizes everything, fails build if component can't be compiled.

```js
{ mode: 'strict' }
```

## Directives

### 'use memo'
Force compilation (in opt-out mode):
```tsx
'use memo';
export function Component() { }
```

### 'no memo'
Exclude from compilation:
```tsx
'no memo';
export function ThirdPartyWrapper() { }
```

## Migration from Manual Memoization

See [migration-guide.md](./migration-guide.md) for detailed patterns.

Key changes:
- Remove simple `useMemo`/`useCallback` - compiler handles them
- Keep complex memoization that needs explicit control
- Add 'no memo' for components that break compilation

## Verification

```bash
# Build with debug info
DEBUG=react-compiler pnpm build

# Check health
npx react-compiler-healthcheck
```

## Troubleshooting

### "React Compiler couldn't compile"

Add 'no memo' directive or check for:
- Ref mutations during render
- Side effects in render
- Dynamic component patterns

### Performance issues

Profile first, then:
- Try 'infer' mode instead of 'strict'
- Add 'no memo' to problematic components
- Keep manual memoization for hot paths

## React 19 Compatibility

React Compiler requires:
- React 19+
- Next.js 16+ (for built-in support)
- Or babel-plugin-react-compiler (legacy)

## Resources

- [React Compiler Documentation](https://react.dev/learn/react-compiler)
- [Next.js Configuration](https://nextjs.org/docs/app/api-reference/config/next-config-js/compiler)
```

## Implementation Checklist

- [ ] Package created at `packages/config/react-compiler/`
- [ ] Next.js config helper tested
- [ ] ESLint rules integrated
- [ ] Migration guide reviewed by team
- [ ] Test app migrated as example
- [ ] Documentation updated
- [ ] CI build verified

## Related Tasks

- `11-config-typescript` - TS configuration
- `32-ui-design-system` - Component library benefits most
- `42-monitoring` - Performance metrics post-migration
