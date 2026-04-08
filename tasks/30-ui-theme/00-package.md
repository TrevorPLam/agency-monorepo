# 30-ui-theme/00-package: UI Theme Packaged UI Theme

## Purpose
Centralize design tokens as CSS custom properties. Brand-neutral; client colors belong in apps.

## Files
```
packages/ui/theme/
├── package.json
├── tsconfig.json
├── README.md
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
```css
@theme {
  --font-sans: Inter, ui-sans-serif, system-ui, sans-serif;
  --font-mono: "SF Mono", ui-monospace, monospace;

  --radius-xs: 0.125rem;
  --radius-sm: 0.25rem;
  --radius-md: 0.375rem;
  --radius-lg: 0.5rem;
  --radius-xl: 0.75rem;
  --radius-2xl: 1rem;

  --spacing-1: 0.25rem;
  --spacing-2: 0.5rem;
  --spacing-3: 0.75rem;
  --spacing-4: 1rem;
  --spacing-5: 1.25rem;
  --spacing-6: 1.5rem;
  --spacing-8: 2rem;
  --spacing-10: 2.5rem;
  --spacing-12: 3rem;
  --spacing-16: 4rem;

  --shadow-xs: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-sm: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);

  --color-background: #ffffff;
  --color-foreground: #111827;
  --color-surface: #f9fafb;
  --color-border: #e5e7eb;
  --color-muted: #6b7280;
  --color-primary: #111827;
  --color-primary-foreground: #ffffff;
}
```

### README
```md
# @agency/ui-theme
Shared design tokens as CSS custom properties for Tailwind v4.
## Usage
```css
@import "@agency/ui-theme/theme.css";
```
