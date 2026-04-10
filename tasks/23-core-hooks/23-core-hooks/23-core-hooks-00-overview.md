# 23-core-hooks: Reusable React Hooks

## Purpose
Reusable React hooks with no app-specific state. Safe to use in any internal tool or client-facing portal. Tree-shakable, SSR-compatible, and follows 2026 best practices.

## Dependencies
- `@agency/config-typescript` — TypeScript configuration
- React 19+ — For React Compiler compatibility

## Scope
This package provides:
- Generic behavior utilities (debounce, throttle, media query)
- Browser API wrappers (clipboard, keyboard shortcuts, outside click)
- SSR-safe hooks with proper fallbacks
- Individual hook exports for optimal tree-shaking

## Critical Rules
- No app-specific state or business logic
- No imports from other `@agency/*` packages
- Every hook must be individually tree-shakable
- SSR-safe with proper fallbacks
- TypeScript-first with comprehensive type safety

## Position in Dependency Flow
Foundation layer that can be imported by any UI or app package, but has no dependencies on other shared packages.

## Next Steps
1. Implement core hooks with SSR safety
2. Add tree-shaking configuration  
3. Create comprehensive testing strategy
4. Document individual export patterns

