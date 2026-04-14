# e3-apps-agency-website: Local Development Guide

## Prerequisites

- Node.js 24.x LTS (see `.nvmrc`)
- pnpm 10.15.1 (see `packageManager` in root `package.json`)
- Git

## Quick Start

### 1. Install Dependencies

```bash
# From repository root
pnpm install
```

### 2. Environment Setup

```bash
# Copy environment template
cp apps/agency-website/.env.example apps/agency-website/.env.local

# Edit with your values
nano apps/agency-website/.env.local
```

Required environment variables:
```bash
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_SITE_NAME="Digital Agency"
```

### 3. Start Development Server

```bash
# Run only the agency website app
pnpm --filter @agency/agency-website dev

# Or from the app directory
cd apps/agency-website && pnpm dev
```

The app will be available at `http://localhost:3000`

## Development Workflow

### Adding Pages

```bash
# Create a new page at /services
apps/agency-website/src/app/services/page.tsx
```

```tsx
// services/page.tsx
export default function ServicesPage() {
  return (
    <div>
      <h1>Our Services</h1>
      {/* Content */}
    </div>
  );
}
```

### Adding Components

```bash
# Local components
apps/agency-website/src/components/sections/
apps/agency-website/src/components/ui/
apps/agency-website/src/components/navigation/
```

### Using Shared UI Components

```tsx
import { Button } from '@agency/ui-design-system';
import { Icons } from '@agency/ui-icons';

export function Hero() {
  return (
    <div>
      <Button>Get Started</Button>
      <Icons.arrowRight />
    </div>
  );
}
```

### Adding API Routes

```bash
# Create API route
apps/agency-website/src/app/api/contact/route.ts
```

```typescript
// api/contact/route.ts
export async function POST(request: Request) {
  const data = await request.json();
  // Handle form submission
  return Response.json({ success: true });
}
```

## shadcn/ui v4 Setup

### Initialize in App

```bash
cd apps/agency-website

# Create components.json if it doesn't exist
```

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "radix-nova",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "",
    "css": "../../packages/ui/design-system/src/styles/globals.css",
    "baseColor": "neutral",
    "cssVariables": true
  },
  "iconLibrary": "lucide",
  "aliases": {
    "components": "@/components",
    "utils": "@agency/ui-design-system/lib/utils",
    "hooks": "@/hooks",
    "lib": "@/lib",
    "ui": "@agency/ui-design-system/components"
  }
}
```

### Add Components

```bash
# From app directory
pnpm dlx shadcn@latest add button
```

This installs to `packages/ui/design-system/` and updates imports automatically.

## Testing

### Run Tests

```bash
# Unit tests
pnpm --filter @agency/agency-website test

# Type check
pnpm --filter @agency/agency-website typecheck

# Lint
pnpm --filter @agency/agency-website lint
```

### Manual Testing Checklist

- [ ] Homepage loads without errors
- [ ] Navigation links work
- [ ] Contact form validates and submits
- [ ] Mobile responsive (test in dev tools)
- [ ] No console errors
- [ ] Images load correctly

## Build

### Production Build

```bash
# Build the app
pnpm --filter @agency/agency-website build

# Output in .next/ directory
```

### Static Export (Optional)

```javascript
// next.config.mjs
const nextConfig = {
  output: 'export',
  distDir: 'dist',
}
```

## Troubleshooting

### Port Already in Use

```bash
# Use different port
pnpm dev --port 3001
```

### Workspace Dependencies Not Found

```bash
# Rebuild workspace packages
pnpm turbo build --filter=@agency/ui-design-system
```

### shadcn/ui Components Not Found

```bash
# Verify components.json exists and has correct paths
# Check that tailwind.config is empty string for v4
```

## Deployment

### Vercel (Recommended)

1. Connect GitHub repo to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy on push to main

### Environment Variables for Production

```bash
NEXT_PUBLIC_SITE_URL=https://agency.com
NEXT_PUBLIC_SITE_NAME="Digital Agency"
NEXT_PUBLIC_PLAUSIBLE_DOMAIN=agency.com
CONTACT_FORM_WEBHOOK_URL=...
```
