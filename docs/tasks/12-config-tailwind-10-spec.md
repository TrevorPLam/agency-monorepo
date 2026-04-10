# 12-config-tailwind: Implementation Specification

## Task Header

| Field | Value |
|-------|-------|
| **State** | `planned` — Documented target; implementation not yet authorized |
| **Trigger** | Repository initialization — always required |
| **Minimum Consumers** | n/a (root infrastructure) |
| **Dependencies** | Tailwind CSS 4.2.2, PostCSS, autoprefixer |
| **Exit Criteria** | Root package.json, pnpm-workspace.yaml, turbo.json committed and verified |
| **Implementation Authority** | `REPO-STATE.md` — Phase: Planning, Build status: Not started |
| **Version Authority** | `DEPENDENCY.md` §2 — Tailwind CSS 4.2.2 |
| **Supersedes** | n/a |
| **Superseded by** | n/a |

## Cross-references

- Decision status: `DECISION-STATUS.md` — Tailwind CSS v4 `locked`
- Version pins: `DEPENDENCY.md` §2
- Architecture: `ARCHITECTURE.md` — Final stack section

## Files
```
packages/config/tailwind-config/
├── package.json
├── theme.css
└── 01-config-biome-migration-50-ref-quickstart.md
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
  "files": ["theme.css", "01-config-biome-migration-50-ref-quickstart.md"],
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

### Option A: PostCSS Base Path (Recommended)

Configure PostCSS to scan from monorepo root. This is the cleanest approach for monorepos.

**`postcss.config.mjs`:**
```javascript
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

**`app/globals.css`:**
```css
@import "tailwindcss";
@import "@agency/config-tailwind/theme.css";
```

### Option B: @source Directive (Explicit)

Add `@source` directives directly in your CSS to scan specific package directories.

**`app/globals.css`:**
```css
@import "tailwindcss";
@import "@agency/config-tailwind/theme.css";

/* Scan UI packages for class usage */
@source "../../packages/ui/**/*.tsx";
@source "../../packages/ui/**/*.css";

/* Scan other shared packages as needed */
@source "../../packages/core-components/**/*.tsx";
```

**Note:** Tailwind v4 uses `@source` to scan for class names, not the `content` key in a config file. The `@source` directive uses the same heuristics as automatic content detection, excluding binary files and gitignored paths.

## VS Code Configuration

The Tailwind CSS extension may need help finding the configuration in monorepos.

**`.vscode/settings.json` in app directory:**
```json
{
  "tailwindCSS.experimental.configFile": "../../packages/config/tailwind-config/theme.css"
}
```

Or use a workspace-level setting that points to the config package.

## Verification

```bash
# Build app to verify Tailwind compiles
pnpm --filter @agency/agency-website build

# Check CSS output contains expected classes
pnpm --filter @agency/agency-website exec grep -o "text-primary" .next/static/css/*.css

# Verify @source is working - build should scan UI packages
DEBUG=tailwindcss pnpm --filter @agency/agency-website build 2>&1 | grep -i "scan"
```

## Troubleshooting

### Classes from UI packages not working

1. Ensure `@source` directive points to correct relative path from app's CSS file
2. Verify PostCSS base path is set to monorepo root
3. Check that UI package files are not in `.gitignore`

### Tailwind extension not working in VS Code

1. Set `tailwindCSS.experimental.configFile` to the theme.css path
2. Reload VS Code window after configuration changes
3. Ensure Tailwind CSS extension is installed at workspace level
