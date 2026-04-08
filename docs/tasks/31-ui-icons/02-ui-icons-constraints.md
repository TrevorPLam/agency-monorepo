# UI Icons Constraints

## Package Boundaries

### What Belongs Here
- Lucide React wrapper components
- Custom SVG icon components
- Icon type definitions (`IconProps`)
- Icon accessibility utilities
- Individual icon exports (tree-shakable)

### What Does NOT Belong Here
- Non-icon UI components (belongs in `@agency/ui-design-system`)
- Icon button components (composition belongs in design system)
- Icon animation logic (belongs in consuming components)
- Complex interactive elements (belongs in `@agency/ui-design-system`)
- Brand logos with complex interactivity (may belong in apps)

## Technical Constraints

### React 19 Compatibility
- Must use React 19.2.0+
- Must use `forwardRef` for ref forwarding
- Must support both decorative and informative modes
- Must handle `aria-label` and `aria-hidden` properly

### Bundle Size Requirements
- `sideEffects: false` required in package.json
- Individual icon imports must be supported
- Budget per icon: 0.5-1 KB gzipped
- Total package budget: <15 KB for 20 icons

### Icon Component Pattern
```tsx
export function IconName({ 
  size = 16, 
  decorative = true, 
  "aria-label": ariaLabel,
  ...props 
}: IconProps) {
  return (
    <LucideIconOrSVG
      size={size}
      strokeWidth={1.75}
      aria-hidden={decorative ? true : undefined}
      aria-label={decorative ? undefined : ariaLabel}
      {...props}
    />
  );
}
```

## Dependency Rules

### Allowed Dependencies
- `lucide-react` (0.487.0 pinned)
- `react` (19.2.0)
- `react-dom` (19.2.0)
- `@agency/config-eslint`
- `@agency/config-typescript`
- `@agency/test-setup` (dev)

### Forbidden Dependencies
- No `@agency/ui-theme` (icons are color-agnostic via `currentColor`)
- No `@agency/ui-design-system` (prevents circular deps)
- No animation libraries (icons are static)
- No state management libraries

## Export Pattern

### Required Export Structure
```json
{
  "exports": {
    ".": {
      "types": "./src/index.ts",
      "default": "./src/index.ts"
    },
    "./{icon-name}": {
      "types": "./src/icons/{icon-name}.tsx",
      "default": "./src/icons/{icon-name}.tsx"
    }
  }
}
```

### Import Patterns
```tsx
// Recommended: Individual import (tree-shakable)
import { CheckIcon } from "@agency/ui-icons/check";

// Alternative: Barrel import
import { CheckIcon, SearchIcon } from "@agency/ui-icons";
```

## Accessibility Requirements

### Decorative Icons (Default)
- `decorative={true}` (default)
- Renders with `aria-hidden="true"`
- No `aria-label` required
- Used for: button icons, visual enhancements

### Informative Icons
- `decorative={false}`
- Requires `aria-label` prop
- No `aria-hidden` attribute
- Used for: status indicators, standalone actions

### Custom SVG Requirements
- Must include `role="img"`
- Must respect `decorative` prop for ARIA
- Must use `currentColor` for theming
- Must have explicit `aria-label` when informative

## Testing Requirements

### Required Test Coverage
- Rendering with default props
- Custom size application
- Decorative mode (aria-hidden)
- Informative mode (aria-label)
- Custom ARIA label override

### Test Pattern
```tsx
describe("IconName", () => {
  test("renders as decorative", async () => {
    const screen = render(<IconName decorative />);
    await expect.element(screen.getByRole("img"))
      .toHaveAttribute("aria-hidden", "true");
  });

  test("renders with accessible label", async () => {
    const screen = render(
      <IconName decorative={false} aria-label="Description" />
    );
    await expect.element(screen.getByRole("img"))
      .toHaveAttribute("aria-label", "Description");
  });
});
```

## Icon Addition Process

1. **Choose Source**
   - Prefer Lucide icons when available
   - Custom SVG only when Lucide doesn't have equivalent

2. **Create Component**
   - Follow `IconProps` interface
   - Implement accessibility pattern
   - Set appropriate default size

3. **Add Export**
   - Update `src/index.ts` barrel export
   - Add individual export to `package.json` exports

4. **Add Tests**
   - Create `src/icons/__tests__/{name}.test.tsx`
   - Verify accessibility patterns

5. **Document**
   - Add to README usage examples
   - Note any special accessibility considerations

## Performance Budgets

| Metric | Budget | Measurement |
|--------|--------|-------------|
| Per Icon (gzipped) | 0.5-1 KB | bundlesize |
| Package Total (20 icons) | <15 KB | bundlesize |
| Import Cost (1 icon) | ~100ms | import-cost |
| Test Execution | <1s | vitest |

## Version Policy
- Patch: Icon updates, accessibility fixes
- Minor: New icon additions
- Major: Breaking changes to IconProps interface
