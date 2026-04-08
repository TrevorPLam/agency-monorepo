# 12-config-tailwind: Implementation Specification

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
    "./theme.css": "./theme.css"
  },
  "files": ["theme.css", "README.md"],
  "publishConfig": { "access": "restricted" }
}
```

### `theme.css`
```css
@import "tailwindcss";

@theme {
  /* Colors */
  --color-primary: oklch(0.55 0.2 250);
  --color-primary-foreground: oklch(0.98 0 0);
  --color-surface: oklch(0.97 0 0);
  --color-background: oklch(1 0 0);
  --color-foreground: oklch(0.2 0 0);
  --color-border: oklch(0.9 0 0);
  --color-muted: oklch(0.95 0 0);
  --color-muted-foreground: oklch(0.5 0 0);
  --color-accent: oklch(0.65 0.15 280);
  --color-destructive: oklch(0.55 0.2 25);
  
  /* Spacing */
  --spacing-xs: 0.25rem;
  --spacing-sm: 0.5rem;
  --spacing-md: 1rem;
  --spacing-lg: 1.5rem;
  --spacing-xl: 2rem;
  --spacing-2xl: 3rem;
  
  /* Typography */
  --font-sans: system-ui, -apple-system, sans-serif;
  --font-mono: ui-monospace, monospace;
  --text-xs: 0.75rem;
  --text-sm: 0.875rem;
  --text-base: 1rem;
  --text-lg: 1.125rem;
  --text-xl: 1.25rem;
  --text-2xl: 1.5rem;
  
  /* Radius */
  --radius-sm: 0.25rem;
  --radius-md: 0.5rem;
  --radius-lg: 0.75rem;
  --radius-xl: 1rem;
  
  /* Shadows */
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1);
}
```

## Usage in Apps

**In `app/globals.css`:**
```css
@import "@agency/config-tailwind/theme.css";

@source "../../packages/ui/**/*.tsx";
```

**Note:** Tailwind v4 uses `@source` to scan for class names, not the `content` key in a config file.

## Verification

```bash
# Build app to verify Tailwind compiles
pnpm --filter @agency/agency-website build
```
