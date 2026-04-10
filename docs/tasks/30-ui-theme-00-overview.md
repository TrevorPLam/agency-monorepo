# 30-ui-theme: Design Tokens

## Purpose
Centralizes design tokens as CSS custom properties using Tailwind v4's `@theme` directive. Brand-neutral foundation; client-specific brand colors belong in individual app directories.

## What This Package Provides
- **Primitive Tokens**: OKLCH color scales (gray, blue, red, green, amber)
- **Semantic Tokens**: Purpose-driven colors (background, primary, destructive, etc.)
- **Typography Scale**: Font families, sizes, weights, line heights
- **Spacing System**: Comprehensive spacing scale (0.25rem to 24rem)
- **Border Radius**: Consistent rounding scale
- **Shadow Elevation**: Box shadow definitions
- **Motion Tokens**: Easing curves and duration values
- **Dark Mode**: Media query-based automatic theming

## Key Features
- **OKLCH Color Space**: Perceptually uniform colors for consistent contrast
- **APCA Compliance**: WCAG 3.0 contrast algorithm preparation
- **CSS-First**: Tailwind v4 `@theme` directive, no JS configuration
- **Token Hierarchy**: Primitive → Semantic → Component cascade
- **Tree-Shakeable**: Unused CSS variables are automatically removed

## Dependencies
- `@agency/config-tailwind` - Tailwind v4 base configuration
- No JavaScript dependencies (CSS-only package)

## Build Order
Builds after config packages, before other UI packages.
- Must complete before: `@agency/ui-icons`, `@agency/ui-design-system`
- No dependencies on other packages (foundational layer)

## Files Overview
| File | Purpose |
|------|---------|
| `30-ui-theme-10-spec.md` | Implementation specification with OKLCH values |
| `30-ui-theme-20-constraints.md` | Package boundaries and constraints |

## Quick Reference
```css
/* Import in apps */
@import "@agency/ui-theme/theme.css";

/* Use tokens */
.my-component {
  background: var(--color-surface);
  color: var(--color-foreground);
  padding: var(--spacing-4);
  border-radius: var(--radius-md);
}
```

## Next Steps
1. Define primitive color scales (OKLCH format)
2. Map semantic tokens to primitives
3. Add motion/animation tokens
4. Implement dark mode overrides
5. Verify APCA contrast compliance

