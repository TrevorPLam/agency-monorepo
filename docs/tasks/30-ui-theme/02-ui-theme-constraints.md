# UI Theme Constraints

## Package Boundaries

### What Belongs Here
- CSS custom property definitions using `@theme` directive
- Primitive color tokens (OKLCH color scales)
- Semantic color tokens (purpose-driven colors)
- Typography scale definitions
- Spacing scale definitions
- Border radius definitions
- Shadow definitions
- Motion/animation tokens
- Dark mode media query overrides

### What Does NOT Belong Here
- Client-specific brand colors (belongs in app directories)
- Component-specific styles (belongs in `@agency/ui-design-system`)
- CSS utilities or classes (Tailwind generates these automatically)
- JavaScript/TypeScript code (this is a CSS-only package)
- Icon definitions (belongs in `@agency/ui-icons`)
- Animation keyframes (use motion tokens, define animations in components)

## Technical Constraints

### Tailwind v4 Requirements
- Must use `@theme` directive for all token definitions
- Must use OKLCH color format for all color tokens
- Must NOT include `tailwind.config.js` (v4 is CSS-first)
- Must import `tailwindcss` at top of CSS file
- Must use semantic token references (e.g., `--color-primary: var(--color-blue-600)`)

### Color System Rules
- Primitive tokens use OKLCH format: `oklch(L C H)`
- Semantic tokens MUST reference primitives
- No hardcoded hex/RGB values in semantic tokens
- All colors must meet APCA contrast thresholds:
  - Body text: Lc 75+
  - Large text: Lc 45+
  - UI components: Lc 60+

### Token Naming Convention
```
--color-{primitive}-{shade}     /* Primitives: gray-50 through gray-950 */
--color-{semantic}               /* Semantic: background, foreground, primary */
--color-{semantic}-{state}       /* States: hover, pressed, subtle */
--spacing-{scale}              /* Spacing: 1, 2, 3, 4, 5... */
--radius-{size}                  /* Radius: sm, md, lg, full */
--shadow-{elevation}             /* Shadows: xs, sm, md, lg */
--ease-{curve}                  /* Easing: out, in-out, elastic */
--duration-{speed}              /* Duration: fast, normal, slow */
```

## Dependency Rules

### Allowed Dependencies
- `@agency/config-tailwind` - Tailwind v4 base configuration

### Forbidden Dependencies
- No React/JS dependencies (CSS-only package)
- No other UI packages (theme is foundational)
- No icon libraries
- No animation libraries

## File Organization

```
src/
├── tokens/
│   ├── primitives.css    /* OKLCH color scales */
│   ├── semantic.css        /* Purpose-driven tokens */
│   └── motion.css          /* Animation tokens */
├── theme.css               /* Main entry point, imports all tokens */
└── index.ts                /* Empty, satisfies TypeScript */
```

## Consumption Patterns

### Apps Import Theme
```css
@import "@agency/ui-theme/theme.css";
```

### Components Use Tokens
```css
.my-component {
  background: var(--color-surface);
  color: var(--color-foreground);
  padding: var(--spacing-4);
}
```

## Migration Safety

When updating this package:
1. Changes to primitive tokens affect ALL consumers
2. New semantic tokens are additive (safe)
3. Removing tokens is a BREAKING CHANGE
4. Always verify APCA contrast after color changes

## Version Policy
- Patch: Token value adjustments (same contrast levels)
- Minor: New semantic tokens added
- Major: Token removal, primitive renames, or contrast-breaking changes
