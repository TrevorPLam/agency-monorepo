# 23-core-hooks: Reusable React Hooks

## Purpose

Provide reusable React hooks for common UI patterns. No app-specific state. Compatible with React 19.2 and React Compiler.

## Dependencies

- **Required**: React 19.2.x
- **Required**: `20-core-types`
- **Required**: `21-core-utils`
- **Followed by**: UI packages

## Scope

This package contains:
- React 19.2 hooks: useEffectEvent, useActionState
- React 19 hooks: useOptimistic
- Classic hooks: useDebounce, useThrottle, useMediaQuery
- DOM interaction: useOutsideClick, useClipboard, useKeyboardShortcut
- React Compiler compatible patterns (no manual memoization)

## Constraints

- **No app-specific state**: Generic patterns only
- **React Compiler compatible**: Trust compiler for memoization
- **SSR-safe**: All hooks work in server components where appropriate
- **Server Components**: Some hooks client-only with proper guards

## Success Criteria

- [ ] React 19.2 hooks implemented
- [ ] React Compiler compatibility verified
- [ ] SSR safety confirmed
- [ ] <1ms overhead for useEffectEvent
- [ ] <5ms for state transitions

## Exit Criteria

Package published to workspace with:
- All hooks tested
- React 19.2 compatibility verified
- React Compiler benchmarks met
- README documentation complete

## Next Steps

1. Implement `30-ui-theme` — Design tokens
2. Implement `31-ui-icons` — Icon set
3. Implement `32-ui-design-system` — shadcn/ui components
