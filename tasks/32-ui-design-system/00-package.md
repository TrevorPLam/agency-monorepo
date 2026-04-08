# 32-ui-design-system/00-package: UI Design System Packages

## Purpose
Shared reusable UI primitives (Button, Card, Input, Label, EmptyState, Skeleton). Consumes `@agency/ui-theme` and `@agency/ui-icons`.

## Files
packages/ui/design-system/
├── package.json
├── tsconfig.json
├── README.md
└── src/
    ├── index.ts
    ├── styles.css
    ├── lib/
    │   └── cn.ts
    └── components/
        └── ui/
            ├── button.tsx
            ├── card.tsx
            ├── input.tsx
            ├── label.tsx
            ├── empty-state.tsx
            └── skeleton.tsx
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
    "@radix-ui/react-label": "latest",
    "@radix-ui/react-slot": "latest",
    "class-variance-authority": "latest",
    "clsx": "latest",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "tailwind-merge": "latest"
  },
  "devDependencies": {
    "@agency/config-eslint": "workspace:*",
    "@agency/config-typescript": "workspace:*"
  },
  "publishConfig": { "access": "restricted" }
}
```
shadcn/ui components are fully compatible with Tailwind v4. The `new-york` style now uses a unified `radix-ui` package instead of multiple `@radix-ui/react-*` packages. RTL support is first-class with logical class conversion at install time.

### `src/styles.css`
```css
@import "@agency/ui-theme/theme.css";
```

### `src/lib/cn.ts`
```ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
export function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)); }
```

### Button Component (`src/components/ui/button.tsx`)
```tsx
import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/cn";

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-[var(--color-primary)] text-[var(--color-primary-foreground)] hover:opacity-90",
        secondary: "bg-[var(--color-surface)] text-[var(--color-foreground)] border border-[var(--color-border)]",
        ghost: "bg-transparent text-[var(--color-foreground)] hover:bg-[var(--color-surface)]"
      },
      size: { sm: "h-8 px-3", md: "h-10 px-4", lg: "h-11 px-6" }
    },
    defaultVariants: { variant: "default", size: "md" }
  }
);

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export function Button({ className, variant, size, asChild = false, ...props }: ButtonProps) {
  const Comp = asChild ? Slot : "button";
  return <Comp className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}
```

### Other Components (Card, Input, Label, EmptyState, Skeleton)
```tsx
// card.tsx
export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-sm", className)} {...props} />;
}

// input.tsx
export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(({ className, ...props }, ref) => (
  <input ref={ref} className={cn("flex h-10 w-full rounded-md border border-[var(--color-border)] bg-white px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]", className)} {...props} />
));

// label.tsx
export const Label = React.forwardRef<React.ElementRef<typeof LabelPrimitive.Root>, React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root>>(
  ({ className, ...props }, ref) => <LabelPrimitive.Root ref={ref} className={cn("text-sm font-medium text-[var(--color-foreground)]", className)} {...props} />
);

// empty-state.tsx
export function EmptyState({ title, description, className }: { title: string; description?: string; className?: string }) {
  return <div className={cn("rounded-lg border border-dashed border-[var(--color-border)] p-8 text-center", className)}>
    <h3 className="text-base font-semibold text-[var(--color-foreground)]">{title}</h3>
    {description ? <p className="mt-2 text-sm text-[var(--color-muted)]">{description}</p> : null}
  </div>;
}

// skeleton.tsx
export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-md bg-[var(--color-border)]", className)} />;
}
```

### README
```md
# @agency/ui-design-system
Shared UI primitives for all apps. Consumes `@agency/ui-theme`.
## Exports
- `@agency/ui-design-system/button`, `./card`, `./input`, `./label`, `./empty-state`, `./skeleton`
## Usage
```tsx
import { Button, Card, Input } from "@agency/ui-design-system";
```
