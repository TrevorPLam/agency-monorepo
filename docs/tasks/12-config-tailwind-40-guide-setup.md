# 12-config-tailwind: Setup Guide

## Prerequisites

1. Tailwind CSS v4 installed via pnpm catalog
2. PostCSS configured for CSS-first processing
3. Understanding of CSS custom properties and `@theme` directive

## Step-by-Step Setup

### 1. Install Dependencies

Add to `pnpm-workspace.yaml` catalog:
```yaml
catalog:
  tailwindcss: ^4.2.2
```

Install in config package:
```bash
cd packages/config/tailwind-config
pnpm add -D tailwindcss@catalog: postcss @tailwindcss/postcss
```

### 2. Create theme.css

```css
/* packages/config/tailwind-config/theme.css */
@import "tailwindcss";

@theme {
  /* Colors using OKLCH for perceptual uniformity */
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
  
  /* Spacing using 0.25rem base unit */
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

### 3. Configure PostCSS

```javascript
// apps/my-app/postcss.config.mjs
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default {
  plugins: {
    '@tailwindcss/postcss': {
      // Set base to monorepo root to scan all packages
      base: path.resolve(__dirname, '../../'),
    },
  },
};
```

### 4. Create globals.css

```css
/* apps/my-app/app/globals.css */
@import "tailwindcss";
@import "@agency/config-tailwind/theme.css";

/* Scan UI packages for class usage */
@source "../../packages/ui/**/*.tsx";
@source "../../packages/ui/**/*.css";

/* App-specific customizations */
:root {
  --app-accent: oklch(0.6 0.18 200);
}
```

### 5. Configure VS Code

```json
// .vscode/settings.json
{
  "tailwindCSS.experimental.configFile": "../../packages/config/tailwind-config/theme.css"
}
```

### 6. Add package.json exports

```json
{
  "name": "@agency/config-tailwind",
  "version": "0.1.0",
  "private": true,
  "exports": {
    "./theme.css": "./theme.css"
  },
  "files": ["theme.css", "01-config-biome-migration-50-ref-quickstart.md"]
}
```

## Usage Examples

### Using Design Tokens
```tsx
// Component using Tailwind classes
function Button({ children }) {
  return (
    <button className="bg-primary text-primary-foreground px-md py-sm rounded-md">
      {children}
    </button>
  );
}
```

### Custom Properties in CSS
```css
/* Custom component styles */
.my-component {
  background-color: var(--color-surface);
  padding: var(--spacing-md);
  border-radius: var(--radius-lg);
}
```

### Responsive Design
```tsx
// Responsive card
function Card() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-md">
      {/* Cards */}
    </div>
  );
}
```

## Troubleshooting

### Classes Not Working

**Symptom**: Utility classes don't apply styles

**Solution**:
1. Check `@source` directive points to correct path
2. Verify PostCSS base path is set to monorepo root
3. Ensure files are not in `.gitignore`
4. Run `pnpm dev` to trigger CSS rebuild

### VS Code Extension Not Working

**Symptom**: No IntelliSense for Tailwind classes

**Solution**:
1. Set `tailwindCSS.experimental.configFile` to theme.css path
2. Reload VS Code window
3. Ensure Tailwind CSS extension is installed at workspace level

### Build Errors

**Symptom**: `Cannot find module '@tailwindcss/postcss'`

**Solution**:
```bash
pnpm install
# Or specifically:
pnpm add -D @tailwindcss/postcss
```

## Verification Steps

```bash
# Build app to verify Tailwind compiles
pnpm --filter @agency/agency-website build

# Check CSS output contains expected classes
pnpm --filter @agency/agency-website exec grep -o "text-primary" .next/static/css/*.css

# Verify @source is working - build should scan UI packages
DEBUG=tailwindcss pnpm --filter @agency/agency-website build 2>&1 | grep -i "scan"
```

## Best Practices

1. **Always use CSS custom properties** for design tokens
2. **Use OKLCH color format** for perceptually uniform colors
3. **Test color contrast** — ensure WCAG 2.1 AA compliance
4. **Document custom properties** — add comments explaining purpose
5. **Use semantic naming** — prefer `--color-surface` over `--color-gray-100`

## Next Steps

After setup is complete:
1. Create `@agency/ui-theme` package that imports this base
2. Add design system components using these tokens
3. Set up visual regression testing
4. Document the design token system for designers
