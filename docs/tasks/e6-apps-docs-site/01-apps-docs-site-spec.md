# e6-apps-docs-site: Implementation Specification

## Task Header

| Field | Value |
|-------|-------|
| **State** | `conditional` — Package-controlled, opt-in only |
| **Trigger** | Team requires internal documentation site |
| **Minimum Consumers** | 1 (docs site) |
| **Dependencies** | Next.js 16.2.3, React 19.2.5, `@agency/ui-design-system` |
| **Exit Criteria** | Docs site deployed and accessible |
| **Implementation Authority** | `REPO-STATE.md` — Conditional; requires explicit need |
| **Version Authority** | `DEPENDENCY.md` §2 — Next.js 16.2.3 |
| **Superseded by** | n/a |

**Cross-references:**
- Decision status: `DECISION-STATUS.md` — Docs site `open`
- Version pins: `DEPENDENCY.md` §2
- Note: Conditional; alternative to static README docs

## Application Structure

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

## Key Features

### MDX Content Rendering
- Render markdown from `tasks/` docs as published pages
- Code syntax highlighting
- Custom components for callouts, diagrams

### Full-Text Search
- Index all documentation content
- API endpoint for search queries
- Client-side search UI

### Navigation Structure
- Auto-generated from content directory
- Section-based sidebar
- Breadcrumbs

### Self-Contained App
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
