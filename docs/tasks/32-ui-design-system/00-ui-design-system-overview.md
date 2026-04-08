# 32-ui-design-system: UI Primitives

## Purpose
Shared reusable UI primitives built with CVA, Radix UI, and Tailwind v4. Consumes `@agency/ui-theme` and `@agency/ui-icons` for consistent styling and accessibility.

## What This Package Provides
- **Button**: 6 variants (default, secondary, destructive, outline, ghost, link), 4 sizes (sm, default, lg, icon)
- **Card**: Container component for content grouping
- **Input**: Form input with focus states and accessibility
- **Label**: Accessible form label with Radix UI
- **EmptyState**: Consistent empty state pattern
- **Skeleton**: Loading placeholder with animation

## Key Features
- **CVA 2026 Patterns**: Compound variants, full TypeScript inference
- **shadcn/ui v4 Integration**: CLI v4 with monorepo support
- **Component Testing**: Vitest Browser Mode with real browser rendering
- **Accessibility First**: WCAG 2.2 AA compliance, APCA preparation
- **Bundle Optimized**: 35-50KB total for all 6 components

## Dependencies
- `@agency/ui-theme` — Design tokens (semantic colors, spacing)
- `@agency/ui-icons` — Icon components
- `@agency/core-types` — Shared TypeScript types
- `@radix-ui/react-slot` — Polymorphic component support
- `@radix-ui/react-label` — Accessible label primitive
- `class-variance-authority` — Type-safe variant management
- `clsx` + `tailwind-merge` — Class name utilities

## Build Order
Builds after theme and icons packages.
- Depends on: `@agency/ui-theme`, `@agency/ui-icons`, `@agency/core-types`
- Must complete before: Apps can consume components

## Files Overview
| File | Purpose |
|------|---------|
| `01-ui-design-system-spec.md` | Implementation with CVA patterns and testing |
| `02-ui-design-system-constraints.md` | Package boundaries and component rules |

## Quick Reference
```tsx
// Button with variants
<Button variant="destructive" size="lg">
  <TrashIcon decorative size={16} />
  Delete
</Button>

// Icon-only button (requires aria-label)
<Button size="icon" aria-label="Add item">
  <PlusIcon decorative size={16} />
</Button>

// As link (polymorphic)
<Button asChild variant="link">
  <a href="/dashboard">Go to dashboard</a>
</Button>
```

## shadcn/ui v4 Setup
```bash
# Initialize in monorepo
pnpm dlx shadcn@latest init -t next --monorepo

# Add components
pnpm dlx shadcn@latest add button card input label

# Preview changes before applying
pnpm dlx shadcn@latest add button --dry-run
```

## Component Requirements
All components must have:
- Full TypeScript types with `VariantProps`
- `forwardRef` for ref forwarding
- `displayName` for debugging
- `asChild` support (polymorphic pattern)
- ARIA attributes for accessibility
- Keyboard interaction support
- Focus visible states
- Co-located tests (`.test.tsx`)

## Testing Strategy
- **Unit Tests**: Vitest Browser Mode with Chromium
- **Coverage**: Rendering, interactions, accessibility, keyboard nav
- **CI**: Automated with `pnpm test` in CI pipeline

## Next Steps
1. Initialize shadcn/ui v4 with `--monorepo` flag
2. Configure `components.json` for Tailwind v4
3. Install Button, Card, Input, Label components
4. Update to CVA 2026 patterns (compound variants)
5. Add co-located component tests
6. Verify bundle size budgets
7. Document accessibility patterns

