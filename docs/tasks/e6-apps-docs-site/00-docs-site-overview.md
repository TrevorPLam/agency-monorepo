# e6-apps-docs-site: Documentation Site Application

## Purpose
Create a dedicated documentation app (`apps/docs` or `apps/docs-site`) as part of the 2026 marketing-first monorepo standard. This gives package guides, onboarding docs, ADRs, and standards a publishable internal reference surface rather than leaving them only as markdown files.

## Dependencies
- `00-foundation` - Root scaffolding
- `10-13-config` - ESLint, TypeScript, Tailwind, Prettier configs
- `20-23-core` - Types, utils, constants, hooks
- `30-32-ui` - Theme, icons, design system
- `a0-a3` - Documentation content (AGENTS.md, ADRs, package guides)
- `c2-infra-ci-workflow` - CI with deployment capability

## Scope

### Application Structure
```
apps/docs/
├── app/
│   ├── layout.tsx
│   ├── page.tsx              # Landing/index
│   ├── [section]/
│   │   ├── page.tsx          # Section landing
│   │   └── [doc]/
│   │       └── page.tsx      # Individual doc pages
│   ├── api/
│   │   └── search/
│   │       └── route.ts      # Full-text search endpoint
│   ├── env.ts                # Environment composition (per next-forge pattern)
│   └── globals.css
├── content/
│   ├── agents/               # AI agent rules (from a0)
│   ├── adrs/                 # Architecture decisions (from a2)
│   ├── guides/               # Package guides (from a3)
│   ├── onboarding/           # Onboarding docs (from a1)
│   └── marketing/            # Marketing standards (from a4)
├── lib/
│   ├── mdx.ts                # MDX processing
│   ├── search.ts             # Search indexing
│   └── navigation.ts         # Nav structure
├── components/
│   ├── docs-layout.tsx
│   ├── sidebar.tsx
│   ├── toc.tsx               # Table of contents
│   └── code-block.tsx
├── public/
│   └── assets/
├── next.config.js
├── package.json
├── tsconfig.json
└── tailwind.config.ts
```

### Key Features

1. **MDX Content Rendering**
   - Render markdown from `tasks/` docs as published pages
   - Code syntax highlighting
   - Custom components for callouts, diagrams

2. **Full-Text Search**
   - Index all documentation content
   - API endpoint for search queries
   - Client-side search UI

3. **Navigation Structure**
   - Auto-generated from content directory
   - Section-based sidebar
   - Breadcrumbs

4. **Self-Contained App**
   - Own `env.ts` composing required environment
   - No imports from other apps
   - Consumes shared packages via public exports only

## Critical Requirements

### Per-App Environment Standard (next-forge pattern)
```typescript
// apps/docs/app/env.ts
import { createEnv } from "@agency/core-env";
import { z } from "zod";

export const env = createEnv({
  server: {
    DOCS_SEARCH_API_KEY: z.string(),
  },
  client: {
    NEXT_PUBLIC_DOCS_VERSION: z.string().default("latest"),
  },
});
```

### Content Synchronization
- Docs app reads from `tasks/` markdown files
- Build-time content ingestion (static generation)
- Optional: Git-based content refresh

### No App-to-App Dependencies
- Docs app must not import from `apps/*`
- Only shared packages via `workspace:*`
- Self-contained routing and layout

## Build Condition

**Build immediately** - Documentation site is part of the 2026 production monorepo benchmark and provides immediate value for internal reference.

## Verification Steps

```bash
# Build docs app
pnpm --filter docs build

# Dev server
pnpm --filter docs dev

# Verify no app imports
pnpm check-imports --filter docs
```

## References

- [next-forge docs setup](https://www.next-forge.com/docs/setup/quickstart)
- [Vercel production monorepo patterns](https://vercel.com/docs/monorepos)
