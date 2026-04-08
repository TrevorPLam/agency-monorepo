# 03-ui/01-icons: Shared UI Icons

## Purpose
Lucide-based icon wrappers with custom SVG support. Standardizes `size`, `strokeWidth`, and accessibility props.

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
  "exports": {
    ".": "./src/index.ts",
    "./check": "./src/icons/check.tsx",
    "./close": "./src/icons/close.tsx",
    "./search": "./src/icons/search.tsx",
    "./logo-mark": "./src/icons/logo-mark.tsx"
  },
  "dependencies": {
    "lucide-react": "latest",
    "react": "^19.0.0",
    "react-dom": "^19.0.0"
  },
  "devDependencies": {
    "@agency/config-eslint": "workspace:*",
    "@agency/config-typescript": "workspace:*"
  },
  "publishConfig": { "access": "restricted" }
}
```

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

### README
```md
# @agency/ui-icons
Standardized icon wrappers (Lucide + custom SVGs).
## Usage
```tsx
import { CheckIcon, SearchIcon } from "@agency/ui-icons";

<SearchIcon decorative />
<CheckIcon aria-label="Completed" decorative={false} />
```
