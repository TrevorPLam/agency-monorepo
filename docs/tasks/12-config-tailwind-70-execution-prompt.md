# 12-config-tailwind: Handoff Prompt

## Context
You are continuing the Tailwind CSS v4 configuration for the agency monorepo. The base configuration is established in `@agency/config-tailwind`.

## Current State
- ✅ Tailwind CSS v4.2.2 installed via catalog
- ✅ CSS-first configuration with `@theme` directive
- ✅ Design tokens defined as CSS custom properties
- ✅ PostCSS configured with `@tailwindcss/postcss`
- ✅ OKLCH color format for perceptual uniformity

## Your Task

### Immediate Next Steps

1. **Create `@agency/ui-theme` Package**
   - Import `@agency/config-tailwind/theme.css`
   - Add agency-specific brand tokens (if needed)
   - Export for consumption by UI components

2. **Integrate with Design System**
   - Update `@agency/ui-design-system` to use theme tokens
   - Replace hard-coded values with CSS custom properties
   - Test all components render correctly

3. **Configure First App**
   - Set up `globals.css` in `apps/agency-website`
   - Add `@source` directives for UI package scanning
   - Configure PostCSS with monorepo root base path

### Implementation Guide

#### Creating ui-theme Package
```
packages/ui/theme/
├── package.json
├── src/
│   ├── theme.css (imports config-tailwind, adds brand tokens)
│   └── index.ts (optional TypeScript exports)
└── 01-config-biome-migration-50-ref-quickstart.md
```

#### Theme CSS Structure
```css
/* packages/ui/theme/src/theme.css */
@import "@agency/config-tailwind/theme.css";

/* Agency brand extensions (if different from base) */
@theme {
  --color-brand: oklch(0.6 0.2 200);
  --font-display: 'Inter', system-ui, sans-serif;
}
```

#### App globals.css Template
```css
/* apps/agency-website/app/globals.css */
@import "tailwindcss";
@import "@agency/ui-theme/theme.css";

/* Scan UI components */
@source "../../packages/ui/**/*.tsx";

/* App-specific custom properties */
:root {
  /* Override or extend as needed */
}
```

### Constraints & Rules

**MUST Follow:**
- Use CSS custom properties for all design tokens
- Use OKLCH color format (not hex, not HSL)
- Set PostCSS base path to monorepo root
- Never use `tailwind.config.js` (v4 is CSS-only)

**MUST NOT:**
- Hard-code values in component files
- Use inline styles for design tokens
- Create multiple theme files per app
- Use v3 `presets` or `content` configuration

### Testing Requirements

Before marking complete:
1. Verify CSS compiles without errors
2. Check all design tokens work in components
3. Test HMR updates within 500ms
4. Validate color contrast meets WCAG AA
5. Run visual regression tests

### Common Pitfalls

⚠️ **PostCSS base path**: Must be absolute path to monorepo root, not relative
⚠️ **@source directive**: Path is relative to the CSS file location
⚠️ **CSS import order**: `@import "tailwindcss"` must be first
⚠️ **VS Code extension**: May need explicit configFile setting in monorepos

### Deliverables

- [ ] `@agency/ui-theme` package created and exported
- [ ] First app (agency-website) using theme tokens
- [ ] Visual regression tests passing
- [ ] Documentation updated with usage examples
- [ ] CI build includes CSS compilation check

### Questions?

If you encounter:
- **Classes not found**: Check `@source` paths are correct
- **Build slow**: Verify PostCSS base path points to root
- **Tokens not working**: Ensure CSS import order is correct
- **VS Code issues**: Set experimental.configFile in settings

### References

- `@/docs/tasks/12-config-tailwind-10-spec.md` — Technical specification
- `@/docs/tasks/12-config-tailwind-40-guide-setup.md` — Setup guide
- `@/docs/tasks/12-config-tailwind-60-qa-checklist.md` — QA checklist
- `@/docs/ARCHITECTURE.md` — Monorepo architecture rules

---

**Ready to proceed**: Start with `ui-theme` package creation, then app integration.


