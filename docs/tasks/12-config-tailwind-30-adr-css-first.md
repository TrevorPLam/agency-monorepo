# ADR: CSS-First Tailwind Configuration (v4)

## Status
**Accepted** — Adopt Tailwind CSS v4 with CSS-first configuration using `@theme` directives.

## Context
Tailwind CSS v4 (released January 2025) introduced a fundamental architectural shift from JavaScript-based configuration (`tailwind.config.js`) to CSS-first configuration using `@theme` directives. We need to decide:

1. Whether to adopt Tailwind v4 or stay on v3
2. How to handle the migration from JS config to CSS config
3. Whether to support both configuration methods during transition

## Decision
Use Tailwind CSS v4 with CSS-first configuration exclusively. No support for legacy `tailwind.config.js` format.

## Rationale

### Why Tailwind v4 CSS-First

1. **Performance**: v4 is significantly faster — Lightning CSS integration provides 5-10x faster build times
2. **Native CSS**: Uses standard CSS syntax (`@theme`, `@import`) rather than JavaScript configuration
3. **Simpler Mental Model**: Designers can read and modify theme.css without JavaScript knowledge
4. **No Build Step for Config**: Theme changes don't require restarting dev server
5. **Future-Proof**: v4 is the future of Tailwind; v3 will eventually be deprecated

### Why Not Support JS Config

- **Maintenance Burden**: Supporting both doubles testing and documentation
- **Consistency**: Single configuration method across entire monorepo
- **Performance**: JS config has overhead; CSS config is parsed natively
- **Tooling**: Newer tools expect CSS-first configuration

## Implementation Details

### Configuration Structure
```css
/* packages/config/tailwind-config/theme.css */
@import "tailwindcss";

@theme {
  /* Design tokens as CSS custom properties */
  --color-primary: oklch(0.55 0.2 250);
  --spacing-md: 1rem;
  --font-sans: system-ui, sans-serif;
}
```

### App Usage
```css
/* apps/my-app/app/globals.css */
@import "tailwindcss";
@import "@agency/config-tailwind/theme.css";

@source "../../packages/ui/**/*.tsx";
```

### PostCSS Configuration
```javascript
// postcss.config.mjs
export default {
  plugins: {
    '@tailwindcss/postcss': {
      base: path.resolve(__dirname, '../../'),
    },
  },
};
```

## Breaking Changes from v3

1. **No `tailwind.config.js`**: Must migrate all JS config to CSS
2. **No `presets` API**: Use `@import` instead
3. **`content` key removed**: Use `@source` directive in CSS
4. **Plugin system changed**: v3 plugins need migration or replacement
5. **Theme extension**: Use CSS custom properties instead of `extend`

## Migration Strategy

### Phase 1: Core Package (Week 1)
- Create `@agency/config-tailwind` with CSS theme
- Set up PostCSS configuration template
- Document migration guide

### Phase 2: UI Package Migration (Week 2)
- Migrate `@agency/ui-theme` to CSS-first
- Update `@agency/ui-design-system` component styles
- Test visual regression

### Phase 3: App Migration (Week 3)
- Migrate agency website
- Migrate internal tools
- Remove legacy `tailwind.config.js` files

## Consequences

### Positive

- **Build Performance**: 5-10x faster compilation
- **Developer Experience**: Native CSS syntax, no JS config to learn
- **Tooling**: Better IDE support for CSS custom properties
- **Maintainability**: Single source of truth in CSS

### Negative

- **Learning Curve**: Team must learn `@theme` and `@source` syntax
- **Migration Effort**: Existing v3 configs must be migrated
- **Plugin Compatibility**: Some v3 plugins may not work with v4
- **Documentation**: Extensive docs exist for v3; v4 docs are newer

## References

- [Tailwind CSS v4 Documentation](https://tailwindcss.com/docs/v4-beta)
- [Tailwind CSS v4 Announcement](https://tailwindcss.com/blog/tailwindcss-v4)
- [Lightning CSS](https://lightningcss.dev/)
