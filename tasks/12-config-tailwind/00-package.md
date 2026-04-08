# 12-config-tailwind/00-package: Tailwind CSS v4 Configuration

## Purpose
Export shared design tokens as CSS custom properties using Tailwind v4's CSS-first `@theme` directive.

## Files
```
packages/config/tailwind-config/
├── package.json
├── theme.css
└── README.md
```

### `package.json`
```json
{
  "name": "@agency/config-tailwind",
  "version": "0.1.0",
  "private": true,
  "exports": {
    ".": "./theme.css",
    "./theme.css": "./theme.css"
  },
  "files": ["theme.css", "README.md"],
  "publishConfig": { "access": "restricted" }
}
```
Tailwind v4 eliminates the old JavaScript config approach (`tailwind.config.js`) and replaces it with CSS-native configuration using `@theme`. Shared tokens belong here; client-specific colors stay in individual apps.

### `theme.css`
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
  --color-muted: #6b7280;
  --color-border: #e5e7eb;
  --color-surface: #f9fafb;
  --color-primary: #111827;
  --color-primary-foreground: #ffffff;
}
```
All tokens defined inside `@theme` become CSS custom properties on `:root`; Tailwind automatically generates corresponding utility classes. Namespace prefixes (`--color-`, `--font-`, `--spacing-`) tell Tailwind which utility types to create.

### README
```md
# @agency/config-tailwind
Shared Tailwind v4 theme tokens for the monorepo.
## Usage
```css
@import "tailwindcss";
@import "@agency/config-tailwind/theme.css";

@source "../../../packages/ui/**/*.{ts,tsx}";
@source "../**/*.{ts,tsx}";
```
## Notes
- Do not create a JavaScript Tailwind preset.
- Do not place client-specific brand colors here.
```
