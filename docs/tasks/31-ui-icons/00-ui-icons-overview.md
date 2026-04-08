# 31-ui-icons: Icon Library

## Purpose
Lucide-based icon wrappers with custom SVG support. Provides tree-shakable, accessible icon components with standardized `size`, `strokeWidth`, and accessibility props.

## What This Package Provides
- **Lucide Icon Wrappers**: Pre-configured Lucide React components
- **Custom SVG Icons**: Support for brand-specific custom icons
- **Tree-Shaking**: Individual icon imports for minimal bundle impact
- **Accessibility**: Decorative vs. informative icon patterns
- **Type Safety**: Full TypeScript support with IconProps interface
- **Bundle Optimization**: ~0.5-1KB per icon (gzipped)

## Key Features
- **React 19 Compatible**: Uses latest React patterns with forwardRef
- **Tree-Shakeable**: `sideEffects: false` for dead code elimination
- **Accessible**: Built-in ARIA support for decorative and informative icons
- **Customizable**: Size, stroke width, and className overrides
- **Custom SVG Support**: Add agency-specific icons alongside Lucide

## Dependencies
- `lucide-react` (0.487.0) - Icon library
- `react` (19.2.0) - React framework
- `@agency/config-typescript` - TypeScript configuration
- `@agency/test-setup` (dev) - Testing utilities

## Build Order
Builds after core packages, alongside or before design system.
- Must complete before: `@agency/ui-design-system` (uses icons)
- No dependencies on other UI packages

## Files Overview
| File | Purpose |
|------|---------|
| `01-ui-icons-spec.md` | Implementation specification with component patterns |
| `02-ui-icons-constraints.md` | Package boundaries and constraints |

## Quick Reference
```tsx
// Individual import (recommended)
import { CheckIcon } from "@agency/ui-icons/check";
<CheckIcon decorative size={16} />

// Informative icon (requires aria-label)
<CheckIcon decorative={false} aria-label="Task completed" />

// Custom SVG icon
import { LogoMarkIcon } from "@agency/ui-icons/logo-mark";
<LogoMarkIcon size={48} decorative={false} aria-label="Company logo" />
```

## Icon Types

### Decorative Icons (Default)
- Hidden from screen readers: `aria-hidden="true"`
- Used for: button icons, visual enhancements
- Default prop: `decorative={true}`

### Informative Icons
- Visible to screen readers with `aria-label`
- Used for: status indicators, standalone actions
- Requires: `decorative={false}` + `aria-label` prop

## Next Steps
1. Set up tree-shaking configuration (`sideEffects: false`)
2. Create base `IconProps` type definition
3. Implement wrapper components for Lucide icons
4. Add custom SVG icon (LogoMark)
5. Add Vitest Browser Mode tests
6. Document accessibility patterns

