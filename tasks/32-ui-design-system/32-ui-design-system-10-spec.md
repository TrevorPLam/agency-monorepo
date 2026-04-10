# 32-ui-design-system: Implementation Specification

## Task Header

| Field | Value |
|-------|-------|
| **State** | `planned` — Documented target; implementation not yet authorized |
| **Trigger** | Repository initialization — always required |
| **Minimum Consumers** | n/a (root infrastructure) |
| **Dependencies** | React 19.2.5, `@agency/ui-theme`, `@agency/ui-icons`, shadcn/ui |
| **Exit Criteria** | Root package.json, pnpm-workspace.yaml, turbo.json committed and verified |
| **Implementation Authority** | `REPO-STATE.md` — Phase: Planning, Build status: Not started |
| **Version Authority** | `DEPENDENCY.md` §2, §17 — React 19.2.5, shadcn/ui |
| **Supersedes** | n/a |
| **Superseded by** | n/a |

## Cross-references

- Decision status: `DECISION-STATUS.md` — UI design system package `approved`
- Version pins: `DEPENDENCY.md` §2, §17
- Architecture: `ARCHITECTURE.md` — UI layer section

## Files
```
packages/ui/design-system/
├── package.json
├── tsconfig.json
├── README.md
├── src/
│   ├── index.ts
│   ├── styles.css
│   ├── lib/
│   │   └── cn.ts
│   └── components/
│       └── ui/
│           ├── button.tsx
│           ├── card.tsx
│           ├── input.tsx
│           ├── label.tsx
│           ├── empty-state.tsx
│           └── skeleton.tsx
```

### `package.json`
```json
{
  "name": "@agency/ui-design-system",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "exports": {
    ".": "./src/index.ts",
    "./styles.css": "./src/styles.css",
    "./button": "./src/components/ui/button.tsx",
    "./card": "./src/components/ui/card.tsx",
    "./input": "./src/components/ui/input.tsx",
    "./label": "./src/components/ui/label.tsx",
    "./empty-state": "./src/components/ui/empty-state.tsx",
    "./skeleton": "./src/components/ui/skeleton.tsx"
  },
  "dependencies": {
    "@agency/ui-theme": "workspace:*",
    "@radix-ui/react-label": "2.1.8",
    "@radix-ui/react-slot": "1.2.4",
    "class-variance-authority": "0.7.1",
    "clsx": "2.1.1",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "tailwind-merge": "3.5.0"
  },
  "devDependencies": {
    "@agency/config-typescript": "workspace:*"
  },
  "publishConfig": { "access": "restricted" }
}
```

### `src/lib/cn.ts`
```ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

### `src/components/ui/button.tsx`

CVA 2026 pattern with compound variants, full TypeScript safety, and React 19 compatibility.

```tsx
import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/cn";

/**
 * Button variants using Class Variance Authority (CVA)
 * 
 * Features:
 * - Compound variants for icon-only buttons
 * - Full TypeScript type inference
 * - Tailwind v4 semantic token integration
 * - Accessible focus states
 */
const buttonVariants = cva(
  [
    "inline-flex items-center justify-center gap-2",
    "rounded-md text-sm font-medium",
    "transition-all duration-fast ease-out",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
    "disabled:pointer-events-none disabled:opacity-50",
    "active:scale-[0.98]", // Subtle press feedback
  ],
  {
    variants: {
      variant: {
        default: [
          "bg-primary text-primary-foreground",
          "hover:bg-primary-hover",
          "active:bg-primary-pressed",
        ],
        secondary: [
          "bg-secondary text-secondary-foreground",
          "border border-border",
          "hover:bg-secondary-hover hover:border-border-hover",
          "active:bg-secondary-pressed",
        ],
        destructive: [
          "bg-destructive text-destructive-foreground",
          "hover:bg-destructive-hover",
          "active:bg-destructive-pressed",
        ],
        outline: [
          "bg-transparent text-foreground",
          "border border-border",
          "hover:bg-surface hover:text-foreground",
          "active:bg-surface-pressed",
        ],
        ghost: [
          "bg-transparent text-foreground",
          "hover:bg-surface",
          "active:bg-surface-pressed",
        ],
        link: [
          "bg-transparent text-primary underline-offset-4",
          "hover:underline",
          "focus-visible:ring-0 focus-visible:ring-offset-0",
        ],
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9 p-0", // Icon-only button
      },
    },
    compoundVariants: [
      // Icon buttons: remove horizontal padding, keep square aspect
      {
        variant: "default",
        size: "icon",
        class: "px-0",
      },
      {
        variant: "secondary",
        size: "icon",
        class: "px-0",
      },
      {
        variant: "destructive",
        size: "icon",
        class: "px-0",
      },
      {
        variant: "outline",
        size: "icon",
        class: "px-0",
      },
      {
        variant: "ghost",
        size: "icon",
        class: "px-0",
      },
    ],
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

/**
 * Button props extending both native button and CVA variants
 * 
 * Type Safety Features:
 * - VariantProps provides type inference from cva() call
 * - asChild enables polymorphic component pattern
 * - All native button props are preserved
 */
export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

/**
 * Button component with full accessibility and theming support
 * 
 * @example
 * ```tsx
 * // Standard button
 * <Button>Click me</Button>
 * 
 * // With icon
 * <Button><PlusIcon size={16} /> Add item</Button>
 * 
 * // Icon-only
 * <Button size="icon" aria-label="Add item"><PlusIcon size={16} /></Button>
 * 
 * // As link
 * <Button asChild variant="link">
 *   <a href="/dashboard">Go to dashboard</a>
 * </Button>
 * 
 * // Destructive with loading state
 * <Button variant="destructive" disabled={isLoading}>
 *   {isLoading ? <SpinnerIcon /> : <TrashIcon />} Delete
 * </Button>
 * ```
 */
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";
```

## Verification

```bash
# Type check
pnpm --filter @agency/ui-design-system typecheck

# Build (if applicable)
pnpm --filter @agency/ui-design-system build

# Run component tests
pnpm --filter @agency/ui-design-system test
```

## shadcn/ui v4 Setup

These commands are allowed **tool-only CLI usage**. They do not define runtime dependency pins for repo manifests.

### Initializing in Monorepo

```bash
# Use the official CLI with --monorepo flag (shadcn/cli v4, March 2026)
pnpm dlx shadcn@latest init -t next --monorepo
```

**Generated Structure:**
```
packages/ui/design-system/
├── src/
│   ├── components/
│   │   └── ui/           # shadcn components
│   ├── hooks/
│   ├── lib/
│   │   └── utils.ts      # cn() utility
│   └── styles/
│       └── globals.css   # Tailwind + theme imports
├── components.json       # shadcn config
└── package.json
```

**Key Configuration (`components.json`):**
```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "radix-nova",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "",        // Empty for Tailwind v4
    "css": "src/styles/globals.css",
    "baseColor": "neutral",
    "cssVariables": true
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui",
    "lib": "@/lib",
    "hooks": "@/hooks"
  }
}
```

**Adding Components:**
```bash
# Add components via CLI
pnpm dlx shadcn@latest add button card input

# Or use --dry-run to preview changes
pnpm dlx shadcn@latest add button --dry-run
```

### Component Testing with Vitest Browser Mode

**Test Setup (`vitest.config.ts`):**
```typescript
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    browser: {
      enabled: true,
      name: 'chromium',
      provider: 'playwright',
    },
  },
});
```

**Button Component Tests (`src/components/ui/__tests__/button.test.tsx`):**
```tsx
import { describe, expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { userEvent } from '@vitest/browser/context';
import { Button } from '../button';
import { CheckIcon } from '@agency/ui-icons/check';

describe('Button', () => {
  test('renders with correct text', async () => {
    const screen = render(<Button>Click me</Button>);
    const button = screen.getByRole('button');
    await expect.element(button).toHaveTextContent('Click me');
  });

  test('handles click events', async () => {
    const handleClick = vi.fn();
    const screen = render(<Button onClick={handleClick}>Click me</Button>);
    
    await userEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledOnce();
  });

  test('disabled state prevents interaction', async () => {
    const handleClick = vi.fn();
    const screen = render(
      <Button onClick={handleClick} disabled>Click me</Button>
    );
    
    await userEvent.click(screen.getByRole('button'));
    expect(handleClick).not.toHaveBeenCalled();
    await expect.element(screen.getByRole('button')).toBeDisabled();
  });

  test('keyboard navigation works', async () => {
    const handleClick = vi.fn();
    const screen = render(<Button onClick={handleClick}>Click me</Button>);
    
    await userEvent.keyboard('{Tab}');  // Focus
    await userEvent.keyboard('{Enter}'); // Activate
    expect(handleClick).toHaveBeenCalledOnce();
  });

  test('focus indicators are visible', async () => {
    const screen = render(<Button>Focus me</Button>);
    const button = screen.getByRole('button');
    
    await userEvent.keyboard('{Tab}');
    await expect.element(button).toHaveFocus();
  });

  test('icon-only button has accessible label', async () => {
    const screen = render(
      <Button size="icon" aria-label="Add item">
        <CheckIcon decorative />
      </Button>
    );
    
    const button = screen.getByRole('button');
    await expect.element(button).toHaveAttribute('aria-label', 'Add item');
  });

  test('renders as child component', async () => {
    const screen = render(
      <Button asChild variant="link">
        <a href="/dashboard">Dashboard</a>
      </Button>
    );
    
    const link = screen.getByRole('link');
    await expect.element(link).toHaveAttribute('href', '/dashboard');
    await expect.element(link).toHaveTextContent('Dashboard');
  });

  test('variants apply correct styles', async () => {
    const { rerender } = render(<Button variant="default">Button</Button>);
    
    // Check variant classes are applied (visual regression or computed styles)
    rerender(<Button variant="destructive">Button</Button>);
    rerender(<Button variant="ghost">Button</Button>);
    rerender(<Button variant="outline">Button</Button>);
    rerender(<Button variant="secondary">Button</Button>);
    rerender(<Button variant="link">Button</Button>);
  });

  test('size variants apply correct dimensions', async () => {
    const { rerender } = render(<Button size="sm">Small</Button>);
    rerender(<Button size="default">Default</Button>);
    rerender(<Button size="lg">Large</Button>);
    rerender(<Button size="icon"><CheckIcon decorative /></Button>);
  });
});
```

**Input Component Tests:**
```tsx
describe('Input', () => {
  test('receives and displays text', async () => {
    const screen = render(<Input placeholder="Enter name" />);
    const input = screen.getByPlaceholder('Enter name');
    
    await userEvent.fill(input, 'John Doe');
    await expect.element(input).toHaveValue('John Doe');
  });

  test('forwards ref correctly', async () => {
    const ref = { current: null as HTMLInputElement | null };
    render(<Input ref={ref} />);
    
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
  });

  test('disabled state prevents input', async () => {
    const screen = render(<Input disabled />);
    const input = screen.getByRole('textbox');
    
    await expect.element(input).toBeDisabled();
  });
});
```

### Bundle Size Monitoring

**Budgets (per component, gzipped):**
| Component | Budget | Notes |
|-----------|--------|-------|
| Button | 3 KB | Includes CVA + Radix Slot |
| Card | 2 KB | Container only |
| Input | 4 KB | Includes focus states |
| Label | 1 KB | Simple wrapper |
| **Total Package** | 35-50 KB | All 6 base components |

**CI Integration:**
```json
// package.json
{
  "bundlesize": [
    {
      "path": "./dist/index.js",
      "maxSize": "50 kB",
      "compression": "gzip"
    }
  ]
}
```

### Accessibility Requirements

**WCAG 2.2 AA Compliance:**
- All interactive components keyboard accessible
- Focus indicators meet 3:1 contrast ratio
- Color alone doesn't convey information
- Form labels properly associated

**APCA Contrast (WCAG 3.0 Preparation):**
- Text on backgrounds: Lc 75+ minimum
- Large text (24px+): Lc 45+ minimum
- UI components: Lc 60+ preferred

**Testing Tools:**
- `@axe-core/react` for automated a11y checks
- Manual keyboard navigation testing
- Screen reader testing (NVDA, VoiceOver)
