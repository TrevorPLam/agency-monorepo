# 12-config-tailwind: Implementation Constraints

## Purpose
Define hard boundaries and constraints for Tailwind CSS v4 configuration to prevent configuration drift and ensure consistency across the monorepo.

## Hard Constraints

### Version Management
- **Tailwind CSS Version Lock**: All packages must use exact Tailwind CSS 4.2.2 from workspace catalog
- **No Manual Version Overrides**: Individual packages cannot override Tailwind version in their own package.json
- **Catalog-Only Dependencies**: Use `catalog:tailwindcss` reference instead of direct version specifiers

### CSS-First Configuration
- **No JavaScript Config**: Tailwind v4 uses CSS-first configuration only. The `tailwind.config.js` file is **deprecated**.
- **CSS Theme Export**: `@agency/config-tailwind` must export a `theme.css` file with `@theme` directive
- **No Presets API**: The `presets` API was removed in v4 — use `@import` and `@source` directives instead

### Configuration Extensibility
- **Base Configuration Only**: Packages must import from `theme.css`, never configure Tailwind from scratch
- **No Extending Extends Chains**: Apps add their own CSS custom properties, but must import base theme
- **Shared CSS File**: All apps must use `@import "@agency/config-tailwind/theme.css"`

### PostCSS Requirements
- **@tailwindcss/postcss Plugin**: Required for Next.js integration
- **Base Path Configuration**: PostCSS must be configured to scan from monorepo root
- **CSS Import Order**: `@import "tailwindcss"` must come before custom imports

### Design Token Constraints
- **CSS Custom Properties Only**: All design tokens must be CSS custom properties using `--` prefix
- **OKLCH Color Format**: Colors should use OKLCH for perceptual uniformity
- **System Font Stack**: Default to system fonts, custom fonts require explicit opt-in
- **Consistent Spacing Scale**: Use 0.25rem base unit (4px) for all spacing values

## Forbidden Patterns

### ❌ Never Use These
```javascript
// tailwind.config.js — DO NOT USE IN V4
module.exports = {
  theme: { /* ... */ },
  presets: [require('@agency/config-tailwind')], // presets API removed
}
```

```css
/* Don't configure Tailwind inline */
@theme {
  /* Don't override base theme here */
  --color-primary: red; /* Use CSS custom properties instead */
}
```

### ❌ Avoid These Anti-Patterns
- **Multiple CSS theme files**: Don't create `theme.dev.css`, `theme.prod.css` — use single `theme.css`
- **Inline @apply usage**: Don't use `@apply` with utility classes that could conflict
- **Hard-coded values**: Never hard-code colors/sizes in components — use CSS custom properties
- **Ignoring PurgeCSS**: Don't add `@source` for files outside the monorepo

## Compliance Requirements

### Performance Constraints
- **Build Time**: Tailwind CSS build must complete in <5 seconds for typical apps
- **Bundle Size**: CSS output should be <50KB gzipped for base theme
- **HMR**: Hot module replacement must work for CSS changes in <500ms

### Accessibility Requirements
- **Color Contrast**: All color pairs must meet WCAG 2.1 AA standards (4.5:1 for text)
- **Motion Preferences**: Respect `prefers-reduced-motion` for all animations
- **Focus Indicators**: All interactive elements must have visible focus states

### Testing Requirements
- **Visual Regression**: All design system changes require visual regression testing
- **Cross-Browser**: Test on Chrome, Firefox, Safari, Edge (last 2 versions)
- **Responsive**: Verify all breakpoints (sm, md, lg, xl, 2xl) work correctly

## Exit Criteria

A Tailwind CSS configuration is complete when:
1. All packages import from catalog-based base configuration
2. CSS-first configuration is used exclusively (no JS config)
3. PostCSS is configured with correct base path
4. Design tokens use CSS custom properties with OKLCH colors
5. No forbidden patterns exist in codebase
6. Build performance meets <5 second target
7. Accessibility requirements are met (contrast, motion, focus)

## Review Process

1. **Architecture Review**: Verify CSS follows ARCHITECTURE.md dependency flow rules
2. **Version Audit**: Confirm all packages use catalog Tailwind 4.2.2
3. **Performance Testing**: Validate build time and HMR performance
4. **Accessibility Audit**: Test color contrast and motion preferences
5. **Cross-Browser Testing**: Verify rendering consistency

## Consequences

This decision enables modern CSS-first configuration while maintaining strict consistency and performance standards. The migration from v3 to v4 provides significant build performance improvements and eliminates JavaScript configuration overhead.
