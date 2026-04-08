# 32-ui-design-system: UI Primitives

## Purpose
Shared reusable UI primitives (Button, Card, Input, Label, EmptyState, Skeleton). Consumes `@agency/ui-theme` and `@agency/ui-icons`.

## Dependencies
- `@agency/ui-theme` — Design tokens
- `@agency/config-typescript` — TypeScript configuration

## Scope
This package provides:
- Button component with variants
- Card component
- Form inputs (Input, Label)
- Empty state component
- Skeleton loader
- shadcn/ui-based primitives

## Condition Block
Build when multiple surfaces need consistent UI primitives.

## Next Steps
1. Initialize shadcn/ui components
2. Export theme-aware components
3. Add accessibility attributes
4. Document usage patterns
