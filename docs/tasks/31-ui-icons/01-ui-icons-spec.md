# 31-ui-icons: Implementation Specification

## Task Header

| Field | Value |
|-------|-------|
| **State** | `planned` — Documented target; implementation not yet authorized |
| **Trigger** | Repository initialization — always required |
| **Minimum Consumers** | n/a (root infrastructure) |
| **Dependencies** | TypeScript 6.0, `@agency/config-typescript`, Lucide React |
| **Exit Criteria** | Root package.json, pnpm-workspace.yaml, turbo.json committed and verified |
| **Implementation Authority** | `REPO-STATE.md` — Phase: Planning, Build status: Not started |
| **Version Authority** | `DEPENDENCY.md` §1, §17 — TypeScript 6.0, Lucide React |
| **Supersedes** | n/a |
| **Superseded by** | n/a |

**Cross-references:**
- Decision status: `DECISION-STATUS.md` — UI icons package `approved`
- Version pins: `DEPENDENCY.md` §1, §17
- Architecture: `ARCHITECTURE.md` — UI layer section
- Note: Lucide React is the default icon library

## Files
packages/ui/icons/
├── package.json
├── tsconfig.json
├── README.md
└── src/
    ├── index.ts
    ├── types.ts
    └── icons/
        ├── check.tsx
        ├── close.tsx
        ├── search.tsx
        └── logo-mark.tsx
```

### `package.json`
```json
{
  "name": "@agency/ui-icons",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "sideEffects": false,
  "exports": {
    ".": {
      "types": "./src/index.ts",
      "default": "./src/index.ts"
    },
    "./check": {
      "types": "./src/icons/check.tsx",
      "default": "./src/icons/check.tsx"
    },
    "./close": {
      "types": "./src/icons/close.tsx",
      "default": "./src/icons/close.tsx"
    },
    "./search": {
      "types": "./src/icons/search.tsx",
      "default": "./src/icons/search.tsx"
    },
    "./logo-mark": {
      "types": "./src/icons/logo-mark.tsx",
      "default": "./src/icons/logo-mark.tsx"
    }
  },
  "dependencies": {
    "lucide-react": "1.8.0",
    "react": "^19.2.5",
    "react-dom": "^19.2.5"
  },
  "devDependencies": {
    "@agency/config-eslint": "workspace:*",
    "@agency/config-typescript": "workspace:*",
    "@agency/test-setup": "workspace:*"
  },
  "publishConfig": { "access": "restricted" }
}
```

**Bundle Optimization:**
- `sideEffects: false` enables proper tree-shaking
- Individual exports allow importing single icons: `import { CheckIcon } from "@agency/ui-icons/check"`
- Estimated bundle impact: ~0.5-1KB per icon (gzipped)

### Icon Components (`src/types.ts`, `check.tsx`, `logo-mark.tsx`)
```tsx
// types.ts
import type { SVGProps } from "react";
export type IconProps = SVGProps<SVGSVGElement> & { size?: number; decorative?: boolean };

// check.tsx
import { Check } from "lucide-react";
import type { IconProps } from "../types";

export function CheckIcon({ size = 16, decorative = true, "aria-label": ariaLabel, ...props }: IconProps) {
  return <Check size={size} strokeWidth={1.75} aria-hidden={decorative ? true : undefined} aria-label={decorative ? undefined : ariaLabel} {...props} />;
}

// close.tsx, search.tsx follow same pattern

// logo-mark.tsx
export function LogoMarkIcon({ size = 24, decorative = false, "aria-label": ariaLabel = "Agency logo", ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden={decorative ? true : undefined} aria-label={decorative ? undefined : ariaLabel} role="img" {...props}>
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
      <path d="M8 15l4-7 4 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
```

### Icon Testing (`src/icons/__tests__/check.test.tsx`)

```tsx
import { describe, expect, test } from "vitest";
import { render } from "vitest-browser-react";
import { CheckIcon } from "../check";

describe("CheckIcon", () => {
  test("renders with default size", async () => {
    const screen = render(<CheckIcon />);
    const svg = screen.getByRole("img");
    await expect.element(svg).toBeVisible();
  });

  test("renders as decorative (aria-hidden)", async () => {
    const screen = render(<CheckIcon decorative />);
    const svg = screen.getByRole("img");
    await expect.element(svg).toHaveAttribute("aria-hidden", "true");
  });

  test("renders with custom aria-label", async () => {
    const screen = render(<CheckIcon decorative={false} aria-label="Task completed" />);
    const svg = screen.getByRole("img");
    await expect.element(svg).toHaveAttribute("aria-label", "Task completed");
    await expect.element(svg).not.toHaveAttribute("aria-hidden");
  });

  test("applies custom size", async () => {
    const screen = render(<CheckIcon size={32} />);
    const svg = screen.getByRole("img");
    await expect.element(svg).toHaveAttribute("width", "32");
    await expect.element(svg).toHaveAttribute("height", "32");
  });
});
```

### Accessibility Guidelines

**Decorative vs. Informative Icons:**

| Icon Type | `decorative` Prop | ARIA Behavior | Example |
|-----------|-------------------|---------------|---------|
| Decorative | `true` (default) | `aria-hidden="true"` | Button icons, visual flourishes |
| Informative | `false` | `aria-label` required | Status indicators, standalone actions |

**WCAG 2.2 Compliance:**
- All icons meet minimum contrast requirements (3:1 for UI components)
- Stroke width optimized for visibility at small sizes (1.75px)
- Custom SVGs must include `role="img"` and appropriate ARIA labels

**APCA Contrast (WCAG 3.0 Preparation):**
- Icons on default backgrounds: Lc 45+ recommended
- Interactive icons: Lc 60+ preferred
- Use `color-foreground` or `color-primary` tokens for consistent contrast

### Bundle Size Monitoring

**Budgets (per icon, gzipped):**
- Lucide wrapper: ~0.5-1 KB
- Custom SVG: ~0.3-0.8 KB (varies by complexity)
- Total package budget: <15 KB for 20 icons

**Monitoring:**
```bash
# Analyze bundle size
pnpm --filter @agency/ui-icons exec bundlesize

# Check individual icon imports
pnpm --filter @agency/ui-icons exec import-cost src/icons/*.tsx
```

### README
```md
# @agency/ui-icons
Standardized icon wrappers (Lucide + custom SVGs) with tree-shaking and accessibility.

## Installation
```bash
pnpm add @agency/ui-icons
```

## Usage

### Single Icon Import (Recommended)
```tsx
import { CheckIcon } from "@agency/ui-icons/check";

<CheckIcon decorative />
```

### Multiple Icons
```tsx
import { CheckIcon, SearchIcon } from "@agency/ui-icons";

<SearchIcon decorative />
<CheckIcon aria-label="Completed" decorative={false} />
```

### Custom SVG Icons
```tsx
import { LogoMarkIcon } from "@agency/ui-icons/logo-mark";

<LogoMarkIcon size={48} decorative={false} aria-label="Company logo" />
```

## Accessibility

- **Decorative icons** (`decorative={true}`): Hidden from screen readers
- **Informative icons** (`decorative={false}`): Require `aria-label` prop
- All icons meet WCAG 2.2 contrast requirements
- Optimized for APCA compliance (WCAG 3.0 preparation)
```
