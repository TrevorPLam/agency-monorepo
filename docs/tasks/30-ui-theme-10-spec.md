# 30-ui-theme: Implementation Specification

## Task Header

| Field | Value |
|-------|-------|
| **State** | `planned` — Documented target; implementation not yet authorized |
| **Trigger** | Repository initialization — always required |
| **Minimum Consumers** | n/a (root infrastructure) |
| **Dependencies** | TypeScript 6.0, `@agency/config-typescript`, `@agency/config-tailwind` |
| **Exit Criteria** | Root package.json, pnpm-workspace.yaml, turbo.json committed and verified |
| **Implementation Authority** | `REPO-STATE.md` — Phase: Planning, Build status: Not started |
| **Version Authority** | `DEPENDENCY.md` §1, §2 — TypeScript 6.0, Tailwind CSS 4.2.2 |
| **Supersedes** | n/a |
| **Superseded by** | n/a |

## Cross-references

- Decision status: `DECISION-STATUS.md` — UI theme package `approved`
- Version pins: `DEPENDENCY.md` §1, §2
- Architecture: `ARCHITECTURE.md` — UI layer section

## Files
```
packages/ui/theme/
├── package.json
├── tsconfig.json
├── 01-config-biome-migration-50-ref-quickstart.md
└── src/
    ├── index.ts
    └── theme.css
```

### `package.json`
```json
{
  "name": "@agency/ui-theme",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "exports": {
    ".": "./src/index.ts",
    "./theme.css": "./src/theme.css"
  },
  "devDependencies": {
    "@agency/config-eslint": "workspace:*",
    "@agency/config-typescript": "workspace:*"
  },
  "publishConfig": { "access": "restricted" }
}
```

### `src/theme.css`

Tailwind v4 uses CSS-first configuration with the `@theme` directive. All design tokens are defined as CSS custom properties using the OKLCH color space for perceptual uniformity.

```css
@import "tailwindcss";

@theme {
  /* ========================================
     PRIMITIVE TOKENS - Base Color Palette
     ======================================== */
  
  /* Gray Scale - OKLCH for perceptual uniformity */
  --color-gray-50: oklch(0.985 0 0);
  --color-gray-100: oklch(0.967 0.001 286.375);
  --color-gray-200: oklch(0.92 0.004 286.32);
  --color-gray-300: oklch(0.871 0.006 286.286);
  --color-gray-400: oklch(0.705 0.015 286.067);
  --color-gray-500: oklch(0.552 0.016 285.938);
  --color-gray-600: oklch(0.442 0.017 285.786);
  --color-gray-700: oklch(0.34 0.016 285.683);
  --color-gray-800: oklch(0.232 0.013 285.623);
  --color-gray-900: oklch(0.13 0.01 285.63);
  --color-gray-950: oklch(0.08 0.008 285.67);
  
  /* Blue Scale - Primary Brand Color */
  --color-blue-50: oklch(0.97 0.014 252.8);
  --color-blue-100: oklch(0.94 0.03 253.2);
  --color-blue-200: oklch(0.885 0.062 253.5);
  --color-blue-300: oklch(0.81 0.11 253.8);
  --color-blue-400: oklch(0.72 0.17 254.1);
  --color-blue-500: oklch(0.623 0.214 254.2);
  --color-blue-600: oklch(0.528 0.21 254.1);
  --color-blue-700: oklch(0.43 0.18 253.8);
  --color-blue-800: oklch(0.35 0.145 253.5);
  --color-blue-900: oklch(0.26 0.11 253.2);
  --color-blue-950: oklch(0.18 0.08 252.9);
  
  /* Red Scale - Destructive/Error */
  --color-red-50: oklch(0.971 0.013 17.38);
  --color-red-100: oklch(0.936 0.032 17.717);
  --color-red-200: oklch(0.885 0.062 18.334);
  --color-red-300: oklch(0.808 0.114 19.571);
  --color-red-400: oklch(0.704 0.191 22.724);
  --color-red-500: oklch(0.637 0.237 25.331);
  --color-red-600: oklch(0.577 0.245 27.325);
  --color-red-700: oklch(0.505 0.213 27.237);
  --color-red-800: oklch(0.41 0.177 26.924);
  --color-red-900: oklch(0.306 0.133 26.462);
  --color-red-950: oklch(0.211 0.092 25.338);
  
  /* Green Scale - Success */
  --color-green-50: oklch(0.982 0.018 145.6);
  --color-green-100: oklch(0.962 0.042 145.8);
  --color-green-200: oklch(0.925 0.083 146.1);
  --color-green-300: oklch(0.871 0.15 146.4);
  --color-green-400: oklch(0.792 0.209 146.7);
  --color-green-500: oklch(0.72 0.25 147.0);
  --color-green-600: oklch(0.62 0.22 146.8);
  --color-green-700: oklch(0.51 0.18 146.5);
  --color-green-800: oklch(0.41 0.15 146.2);
  --color-green-900: oklch(0.31 0.11 145.9);
  --color-green-950: oklch(0.22 0.08 145.6);
  
  /* Amber Scale - Warning */
  --color-amber-50: oklch(0.987 0.022 95.3);
  --color-amber-100: oklch(0.962 0.05 95.6);
  --color-amber-200: oklch(0.924 0.09 95.9);
  --color-amber-300: oklch(0.879 0.159 96.2);
  --color-amber-400: oklch(0.828 0.189 82.8);
  --color-amber-500: oklch(0.769 0.188 70.8);
  --color-amber-600: oklch(0.666 0.167 56.8);
  --color-amber-700: oklch(0.555 0.14 50.1);
  --color-amber-800: oklch(0.43 0.11 46.5);
  --color-amber-900: oklch(0.32 0.083 43.5);
  --color-amber-950: oklch(0.22 0.058 40.2);

  /* ========================================
     SEMANTIC TOKENS - Purpose-Driven Colors
     ======================================== */
  
  /* Base Colors */
  --color-background: var(--color-gray-50);
  --color-foreground: var(--color-gray-900);
  --color-muted-foreground: var(--color-gray-500);
  
  /* Surface Colors */
  --color-surface: var(--color-gray-100);
  --color-surface-elevated: var(--color-gray-50);
  --color-surface-pressed: var(--color-gray-200);
  
  /* Border & Divider */
  --color-border: var(--color-gray-200);
  --color-border-hover: var(--color-gray-300);
  --color-divider: var(--color-gray-200);
  
  /* Primary Action (Blue) */
  --color-primary: var(--color-blue-600);
  --color-primary-hover: var(--color-blue-700);
  --color-primary-pressed: var(--color-blue-800);
  --color-primary-foreground: var(--color-gray-50);
  
  /* Secondary Action (Gray) */
  --color-secondary: var(--color-gray-200);
  --color-secondary-hover: var(--color-gray-300);
  --color-secondary-pressed: var(--color-gray-400);
  --color-secondary-foreground: var(--color-gray-800);
  
  /* Destructive Action (Red) */
  --color-destructive: var(--color-red-600);
  --color-destructive-hover: var(--color-red-700);
  --color-destructive-pressed: var(--color-red-800);
  --color-destructive-foreground: var(--color-gray-50);
  
  /* Status Colors */
  --color-success: var(--color-green-600);
  --color-success-subtle: var(--color-green-100);
  --color-warning: var(--color-amber-500);
  --color-warning-subtle: var(--color-amber-100);
  --color-error: var(--color-red-600);
  --color-error-subtle: var(--color-red-100);
  
  /* Focus & Ring */
  --color-ring: var(--color-blue-500);
  --color-ring-offset: var(--color-gray-50);

  /* ========================================
     TYPOGRAPHY
     ======================================== */
  --font-sans: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif;
  --font-mono: "SF Mono", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
  
  --text-xs: 0.75rem;
  --text-xs--line-height: calc(1 / 0.75);
  --text-sm: 0.875rem;
  --text-sm--line-height: calc(1.25 / 0.875);
  --text-base: 1rem;
  --text-base--line-height: calc(1.5 / 1);
  --text-lg: 1.125rem;
  --text-lg--line-height: calc(1.75 / 1.125);
  --text-xl: 1.25rem;
  --text-xl--line-height: calc(1.75 / 1.25);
  --text-2xl: 1.5rem;
  --text-2xl--line-height: calc(2 / 1.5);
  
  --font-weight-normal: 400;
  --font-weight-medium: 500;
  --font-weight-semibold: 600;
  --font-weight-bold: 700;

  /* ========================================
     SPACING SCALE
     ======================================== */
  --spacing-px: 1px;
  --spacing-0: 0px;
  --spacing-0_5: 0.125rem;
  --spacing-1: 0.25rem;
  --spacing-1_5: 0.375rem;
  --spacing-2: 0.5rem;
  --spacing-2_5: 0.625rem;
  --spacing-3: 0.75rem;
  --spacing-3_5: 0.875rem;
  --spacing-4: 1rem;
  --spacing-5: 1.25rem;
  --spacing-6: 1.5rem;
  --spacing-7: 1.75rem;
  --spacing-8: 2rem;
  --spacing-9: 2.25rem;
  --spacing-10: 2.5rem;
  --spacing-11: 2.75rem;
  --spacing-12: 3rem;
  --spacing-14: 3.5rem;
  --spacing-16: 4rem;
  --spacing-20: 5rem;
  --spacing-24: 6rem;
  --spacing-28: 7rem;
  --spacing-32: 8rem;
  --spacing-36: 9rem;
  --spacing-40: 10rem;
  --spacing-44: 11rem;
  --spacing-48: 12rem;
  --spacing-52: 13rem;
  --spacing-56: 14rem;
  --spacing-60: 15rem;
  --spacing-64: 16rem;
  --spacing-72: 18rem;
  --spacing-80: 20rem;
  --spacing-96: 24rem;

  /* ========================================
     BORDER RADIUS
     ======================================== */
  --radius-none: 0px;
  --radius-sm: 0.125rem;
  --radius-base: 0.25rem;
  --radius-md: 0.375rem;
  --radius-lg: 0.5rem;
  --radius-xl: 0.75rem;
  --radius-2xl: 1rem;
  --radius-3xl: 1.5rem;
  --radius-full: 9999px;

  /* ========================================
     SHADOWS
     ======================================== */
  --shadow-2xs: 0 1px rgb(0 0 0 / 0.05);
  --shadow-xs: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-sm: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
  --shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
  --shadow-2xl: 0 25px 50px -12px rgb(0 0 0 / 0.25);
  
  --shadow-inner: inset 0 2px 4px 0 rgb(0 0 0 / 0.05);
  --shadow-outline: 0 0 0 3px rgb(59 130 246 / 0.5);

  /* ========================================
     MOTION - Animation & Transitions
     ======================================== */
  --ease-linear: linear;
  --ease-in: cubic-bezier(0.4, 0, 1, 1);
  --ease-out: cubic-bezier(0, 0, 0.2, 1);
  --ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
  --ease-elastic: cubic-bezier(0.68, -0.55, 0.265, 1.55);
  --ease-bounce: cubic-bezier(0.34, 1.56, 0.64, 1);
  
  --duration-instant: 0ms;
  --duration-fast: 100ms;
  --duration-normal: 150ms;
  --duration-moderate: 200ms;
  --duration-slow: 300ms;
  --duration-slower: 500ms;
}

/* ========================================
   DARK MODE OVERRIDES
   ======================================== */
@media (prefers-color-scheme: dark) {
  :root {
    --color-background: var(--color-gray-950);
    --color-foreground: var(--color-gray-100);
    --color-muted-foreground: var(--color-gray-400);
    --color-surface: var(--color-gray-900);
    --color-surface-elevated: var(--color-gray-800);
    --color-surface-pressed: var(--color-gray-700);
    --color-border: var(--color-gray-800);
    --color-border-hover: var(--color-gray-700);
    --color-divider: var(--color-gray-800);
    --color-secondary: var(--color-gray-800);
    --color-secondary-hover: var(--color-gray-700);
    --color-secondary-pressed: var(--color-gray-600);
    --color-secondary-foreground: var(--color-gray-200);
  }
}
```

### OKLCH Color System & APCA Contrast

This theme uses the OKLCH color space for perceptual uniformity. All colors are designed to meet APCA (Accessible Perceptual Contrast Algorithm) thresholds for WCAG 3.0 compliance:

| Use Case | APCA Lc Minimum | Our Tokens |
|----------|-----------------|------------|
| Body text (14px/400) | Lc 75 | `--color-foreground` on `--color-background` |
| Large text (24px+) | Lc 45 | `--color-muted-foreground` on `--color-background` |
| Primary actions | Lc 60 | `--color-primary` on `--color-primary-foreground` |
| UI components | Lc 15+ | `--color-border`, dividers |

**APCA Tools:**
- https://apcacontrast.com - Official calculator
- https://colorcontrast.app/ - Side-by-side WCAG 2.2 + APCA

### Token Hierarchy

1. **Primitive Tokens** (`--color-gray-*`, `--color-blue-*`): Raw color values with no semantic meaning
2. **Semantic Tokens** (`--color-background`, `--color-primary`): Purpose-driven colors referencing primitives
3. **Component Tokens** (defined in `@agency/ui-design-system`): Component-specific overrides

**Best Practices:**
- Use semantic tokens in components, never primitives directly
- Primitives can be overridden for brand theming
- Semantic tokens ensure consistent meaning across the design system

### README
```md
# @agency/ui-theme
Shared design tokens as CSS custom properties for Tailwind v4.
## Usage
```css
@import "@agency/ui-theme/theme.css";
```
