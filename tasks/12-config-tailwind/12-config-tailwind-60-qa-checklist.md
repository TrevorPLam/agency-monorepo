# 12-config-tailwind: QA Checklist

## Pre-Merge Verification

### Configuration Files

- [ ] `theme.css` created with `@import "tailwindcss"` and `@theme` directive
- [ ] `package.json` has correct exports: `"./theme.css": "./theme.css"`
- [ ] PostCSS configured with `@tailwindcss/postcss` plugin
- [ ] PostCSS base path set to monorepo root
- [ ] No `tailwind.config.js` files exist (v4 uses CSS-only config)

### Design Tokens

- [ ] Colors use OKLCH format (e.g., `oklch(0.55 0.2 250)`)
- [ ] Spacing uses 0.25rem base unit (consistent scale)
- [ ] Typography includes system font stack and size scale
- [ ] Border radius has consistent scale (sm, md, lg, xl)
- [ ] Shadows use consistent RGBA values

### Color Accessibility

- [ ] Primary color + foreground meet 4.5:1 contrast ratio (WCAG AA)
- [ ] Text colors on surface backgrounds meet contrast requirements
- [ ] Muted text meets 3:1 contrast ratio for large text
- [ ] Destructive/error colors have sufficient contrast

### Integration Tests

#### CSS Compilation Test
```bash
pnpm --filter @agency/config-tailwind exec tailwindcss --input theme.css --output test.css
# Should complete without errors
```

#### App Integration Test
```bash
cd apps/test-app
pnpm build
# Should generate CSS with design tokens
```

#### HMR Test
1. Run `pnpm dev`
2. Modify `theme.css`
3. Changes should reflect in browser within 500ms

### Cross-Browser Verification

- [ ] Chrome (latest): Design tokens render correctly
- [ ] Firefox (latest): Design tokens render correctly
- [ ] Safari (latest): Design tokens render correctly
- [ ] Edge (latest): Design tokens render correctly

### Responsive Breakpoints

- [ ] `sm` (640px) breakpoint works
- [ ] `md` (768px) breakpoint works
- [ ] `lg` (1024px) breakpoint works
- [ ] `xl` (1280px) breakpoint works
- [ ] `2xl` (1536px) breakpoint works

## Visual Regression Testing

### Component Screenshots

Capture screenshots of key components:
- [ ] Button variants (primary, secondary, destructive)
- [ ] Form inputs (default, focus, error states)
- [ ] Card component with shadow and border
- [ ] Typography scale (all text sizes)
- [ ] Color swatches (all design tokens)

### Comparison

- [ ] Screenshots match baseline (or intentional changes documented)
- [ ] No unexpected visual shifts
- [ ] Colors render consistently across browsers

## Performance Testing

### Build Time
```bash
time pnpm --filter @agency/agency-website build
# Should complete CSS compilation in <5 seconds
```

### Bundle Size
```bash
ls -lh apps/agency-website/.next/static/css/*.css
# Total CSS should be <50KB gzipped
```

### HMR Performance
```bash
# Measure time from CSS edit to browser refresh
# Should be <500ms
```

## Accessibility Audit

### Automated Testing
```bash
# Run axe-core or similar
npm run test:a11y
# Should pass WCAG 2.1 AA
```

### Manual Testing
- [ ] Keyboard navigation works
- [ ] Focus indicators visible
- [ ] Color alone doesn't convey information
- [ ] Text resizes correctly (200% zoom)

## Code Review Checklist

- [ ] No hard-coded values in components (use CSS custom properties)
- [ ] No `@apply` with conflicting utility classes
- [ ] No inline styles that should be design tokens
- [ ] Comments explain non-obvious design decisions
- [ ] Documentation updated with any token changes

## Sign-Off

- [ ] QA Engineer verified visual consistency
- [ ] Accessibility review passed
- [ ] Performance benchmarks met
- [ ] Documentation reviewed
- [ ] Platform Lead approved

## Notes

- Any changes to design tokens require visual regression testing
- Color contrast is non-negotiable — must meet WCAG AA
- Build performance is critical — investigate if >5 seconds
- Document any deviations from standard Tailwind practices
