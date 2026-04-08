# 32-ui-design-system: Implementation Specification

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
    "@radix-ui/react-label": "latest",
    "@radix-ui/react-slot": "latest",
    "class-variance-authority": "latest",
    "clsx": "latest",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "tailwind-merge": "latest"
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
  return (
    <Comp
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}
```

## Verification

```bash
# Type check
pnpm --filter @agency/ui-design-system typecheck

# Build (if applicable)
pnpm --filter @agency/ui-design-system build
```
