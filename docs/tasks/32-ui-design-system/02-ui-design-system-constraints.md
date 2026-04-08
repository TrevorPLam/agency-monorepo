# UI Design System Constraints

## Package Boundaries

### What Belongs Here
- Reusable UI primitives (Button, Card, Input, Label)
- Layout components (EmptyState, Skeleton)
- Form primitives (Input, Label, with accessibility)
- CVA variant definitions
- Component-specific styles (not tokens)
- Component tests (Vitest Browser Mode)

### What Does NOT Belong Here
- App-specific components (belongs in apps)
- Page layouts (belongs in apps)
- Business logic (belongs in apps or core)
- Data fetching (belongs in apps)
- Complex compound components with app logic
- Client-specific branded components

## Technical Constraints

### CVA Pattern Requirements
All styled components MUST use CVA with:
- Compound variants for complex states
- Full TypeScript type inference via `VariantProps`
- Semantic token references (not primitives)
- Consistent variant naming (`variant`, `size`)

### Button Component Pattern
```tsx
const buttonVariants = cva(
  "base-classes",
  {
    variants: {
      variant: { /* 6 variants minimum */ },
      size: { sm, default, lg, icon }
    },
    compoundVariants: [ /* icon button overrides */ ],
    defaultVariants: { variant: "default", size: "default" }
  }
);
```

### Required Component Set
| Component | Variants | Priority |
|-----------|----------|----------|
| Button | default, secondary, destructive, outline, ghost, link | Required |
| Card | N/A | Required |
| Input | N/A | Required |
| Label | N/A | Required |
| EmptyState | N/A | Required |
| Skeleton | N/A | Required |

## Dependency Rules

### Allowed Dependencies
- `@agency/ui-theme` - Design tokens
- `@agency/ui-icons` - Icon components
- `@agency/core-types` - Shared types
- `@agency/config-typescript`
- `@agency/config-eslint`
- `@agency/test-setup` (dev)
- Radix UI primitives (as needed)
- CVA, clsx, tailwind-merge

### Forbidden Dependencies
- No app-specific imports
- No other UI packages (prevents circular deps)
- No data fetching libraries
- No state management (Zustand, Redux, etc.)
- No router dependencies

## shadcn/ui Integration

### CLI Usage Rules
- Use `--monorepo` flag for initialization
- Leave `tailwind.config` empty in `components.json`
- Use CSS variables for theming (`cssVariables: true`)
- Components installed to `src/components/ui/`

### Post-Installation Modifications
After `shadcn add`, you MUST:
1. Replace hardcoded colors with semantic tokens
2. Update to CVA 2026 pattern with compound variants
3. Add comprehensive JSDoc comments
4. Add component tests
5. Verify bundle size budget

## Component Requirements

### All Components Must Have
- Full TypeScript types
- `forwardRef` implementation
- `displayName` set
- `asChild` support (when applicable)
- Accessibility attributes (ARIA, roles)
- Focus visible states
- Disabled states (when applicable)
- Keyboard interaction support

### Accessibility Standards
- WCAG 2.2 AA compliance minimum
- APCA contrast preparation (Lc thresholds)
- Keyboard navigation support
- Focus indicator visibility
- Screen reader announcements
- Reduced motion support (`prefers-reduced-motion`)

### CVA Variant Requirements
```tsx
// Required variant names
variant: "default" | "secondary" | "destructive" | "outline" | "ghost" | "link"
size: "sm" | "default" | "lg" | "icon"

// Required for interactive components
compoundVariants: [
  // Handle icon-only button sizing
  { variant: "*", size: "icon", class: "px-0" }
]
```

## Testing Requirements

### Test Coverage
Every component MUST have tests for:
- Rendering with default props
- All variant combinations
- Size variations
- Click/interaction handling
- Keyboard navigation
- Focus management
- Accessibility attributes
- asChild polymorphism

### Test Pattern
```tsx
describe("Component", () => {
  test("renders correctly", async () => {
    const screen = render(<Component>Content</Component>);
    await expect.element(screen.getByRole("...")).toBeVisible();
  });

  test("handles interactions", async () => {
    const handler = vi.fn();
    const screen = render(<Component onClick={handler} />);
    await userEvent.click(screen.getByRole("..."));
    expect(handler).toHaveBeenCalled();
  });

  test("keyboard accessible", async () => {
    const screen = render(<Component />);
    await userEvent.keyboard("{Tab}");
    await expect.element(screen.getByRole("...")).toHaveFocus();
  });
});
```

### Browser Mode Configuration
```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    browser: {
      enabled: true,
      name: "chromium",
      provider: "playwright",
    },
  },
});
```

## Bundle Size Budgets

| Component | Budget | Notes |
|-----------|--------|-------|
| Button | 3 KB | Includes CVA + Radix Slot |
| Card | 2 KB | Container only |
| Input | 4 KB | Includes focus states |
| Label | 1 KB | Simple wrapper |
| EmptyState | 2 KB | Layout + icon slot |
| Skeleton | 1 KB | Animation keyframes |
| **Total** | 35-50 KB | All 6 components |

## File Organization

```
src/
├── components/
│   └── ui/
│       ├── button.tsx
│       ├── button.test.tsx        # Co-located tests
│       ├── card.tsx
│       ├── card.test.tsx
│       ├── input.tsx
│       ├── input.test.tsx
│       ├── label.tsx
│       ├── label.test.tsx
│       ├── empty-state.tsx
│       ├── empty-state.test.tsx
│       ├── skeleton.tsx
│       └── skeleton.test.tsx
├── lib/
│   └── cn.ts                      # Utility function
├── styles.css                     # Component styles if needed
├── index.ts                       # Barrel exports
└── vitest.config.ts               # Component test config
```

## Export Pattern

```typescript
// index.ts - Explicit exports only
export { Button, type ButtonProps } from "./components/ui/button";
export { Card, type CardProps } from "./components/ui/card";
// ... etc
```

## Version Policy
- Patch: Style fixes, accessibility improvements
- Minor: New components (within constraints)
- Major: Breaking changes to component APIs

## Component Approval Process

Before adding a new component:
1. Does it appear in 2+ apps? (Shared requirement)
2. Is it truly primitive? (No business logic)
3. Does it fit existing patterns? (CVA, Radix)
4. Is it accessible? (WCAG 2.2 AA)
5. Are tests included?
6. Is bundle budget maintained?

If all yes: approve for addition.
