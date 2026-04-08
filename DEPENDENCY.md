# Agency Monorepo Dependencies

## 1. Runtime, package manager, and compiler

Use these as the global baseline in the monorepo (Node version in `.nvmrc`/Volta, `packageManager` in root `package.json`, TS in devDependencies).

| Thing | Recommended | Why / compatibility |
| --- | --- | --- |
| **Node.js** | **24.x LTS** (min **20.9.0**) | Next 16 requires Node 20.9+; Node 24 is current Active LTS and satisfies Next, Vitest, Storybook, Neon serverless driver, and PostHog Node. [nextjs](https://nextjs.org/blog/next-16) |
| **pnpm** | **10.33.0** (latest 10.x) | Current stable pnpm, with docs and `pnpm update` behavior targeting 10.x; works fine with Node 20+ and monorepo workspaces. [pnpm](https://pnpm.io/cli/update) |
| **TypeScript** | **6.0** | Latest TS (6.0) and meets Next 16's "TypeScript 5+" requirement. **⚠️ Breaking Changes:** TS 6.0 removes `--moduleResolution node`, deprecates ES5 target, AMD/UMD/SystemJS formats, and makes `strict: true` the default. Update `@agency/config-typescript` to use `moduleResolution: "bundler"` or `"nodenext"`. [nextjs](https://nextjs.org/blog/next-16) [devblogs.microsoft](https://devblogs.microsoft.com/typescript/announcing-typescript-6-0/) |

**Key configs**

- Root `package.json`: set `"packageManager": "pnpm@10.33.0"` and engines `"node": ">=20.9.0"`. [nextjs](https://nextjs.org/blog/next-16)
- `pnpm-workspace.yaml`: include at minimum `apps/*` and `packages/*` so shadcn/ui CLI and internal packages resolve correctly in the monorepo. [ui.shadcn](https://ui.shadcn.com/docs/monorepo)

***

## 2. Core framework and styling (Next.js, React, Tailwind, shadcn/ui)

### Framework versions

| Package | Version | Notes |
| --- | --- | --- |
| `next` | **16.2.2** | Latest stable Next.js 16.x; App Router-first, supports React 19, requires Node 20.9+ and TS 5+. [npmjs](https://www.npmjs.com/package/next) |
| `react` | **19.2.4** | Latest stable React 19; recommended pairing for Next 16 (React 19.2 support is a selling point of 16). [react](https://react.dev/blog/2025/10/01/react-19-2) |
| `react-dom` | **19.2.4** | Match React core. [npmjs](https://www.npmjs.com/package/react?activeTab=versions) |

### Tailwind + shadcn/ui

| Package | Version | Notes |
| --- | --- | --- |
| `tailwindcss` | **4.2.2** | Latest v4.x with **CSS-first configuration**; `@theme` directives replace `tailwind.config.js`; `presets` API removed. [tailwindcss](https://tailwindcss.com/blog/tailwindcss-v4) |
| `postcss` | **latest 8.x** | Still required for Next's CSS pipeline; Tailwind v4 includes built-in import support. [tailwindcss](https://tailwindcss.com/docs/upgrading-to-v2) |
| `autoprefixer` | **latest 10.x** | Standard PostCSS peer for Tailwind builds. [tailwindcss](https://tailwindcss.com/docs/upgrading-to-v2) |
| `clsx` | **latest** | Used by shadcn/ui patterns for class composition. [ui.shadcn](https://ui.shadcn.com/docs/monorepo) |
| `tailwind-merge` | **latest** | Common in shadcn-based design systems to de-duplicate classes. [ui.shadcn](https://ui.shadcn.com/docs/monorepo) |
| `class-variance-authority` | **latest** | For variant-driven components in shadcn-style design systems. [ui.shadcn](https://ui.shadcn.com/docs/monorepo) |

shadcn/ui now has explicit monorepo support in its CLI; it expects a workspace-aware layout and Tailwind present in the UI workspace(s). [ui.shadcn](https://ui.shadcn.com/docs/changelog/2024-12-monorepo)

You **don’t** install a compiled `shadcn` package: you run the shadcn CLI into `packages/ui/design-system` (and app-level entrypoints as needed), so the dependency surface is the Tailwind + Radix + Lucide stack:

| Package | Version | Notes |
| --- | --- | --- |
| `@radix-ui/react-*` | **latest** | Installed per-component via shadcn CLI for primitives. [ui.shadcn](https://ui.shadcn.com/docs/monorepo) |
| `lucide-react` | **latest** | Backing icon set for `@agency/ui-icons`. [ui.shadcn](https://ui.shadcn.com/docs/monorepo) |

***

## 3. Monorepo tooling: pnpm workspaces, Turborepo, Changesets, linting

### Turborepo and workspace tooling

| Package | Version | Notes |
| --- | --- | --- |
| `turbo` | **2.9.4** | Latest stable Turborepo; v2.9 series focuses on performance and introspection, works well with pnpm. [turborepo](https://turborepo.dev/blog/2-9) |
| `@changesets/cli` | **2.30.0** | Current CLI for versioning and changelogs in monorepos. [npmjs](https://www.npmjs.com/package/@changesets/cli) |

Turborepo 2.9 runs fine on Node 20+ and is used as your orchestration layer (`turbo.json`) above pnpm workspaces. [pnpm](https://pnpm.io/cli/update)

### ESLint, TypeScript config, Tailwind config

For `packages/config/*` and repo-wide behavior:

| Package | Version | Purpose |
| --- | --- | --- |
| `eslint` | **latest 9.x/8.x compatible with Next 16** | Base linter. |
| `eslint-config-next` | **16.2.2** | Pairs with Next 16.2.2; provides React/Next-specific rules. [nextjs](https://nextjs.org/docs/app/api-reference/config/eslint) |
| `@typescript-eslint/parser` | **latest** | TypeScript-aware ESLint parser. |
| `@typescript-eslint/eslint-plugin` | **latest** | TS ESLint rules. |
| `typescript` | **6.0** | Shared TS compiler in `@agency/config-typescript`. [en.wikipedia](https://en.wikipedia.org/wiki/TypeScript) |
| `@types/node` | **latest** | Node typings for apps and tools. |

Tailwind config package:

- `@agency/config-tailwind` should export a **CSS file with `@theme` directives** for v4 compatibility, not a JavaScript preset. The `presets` API was removed in Tailwind v4. Instead:
  - Export `theme.css` with shared design tokens in an `@theme {}` block using CSS custom properties
  - Consuming apps use `@import "@agency/config-tailwind/theme.css"` and `@source` directives
  - Use `@source "../../packages/ui/**/*.tsx"` to tell Tailwind to scan component packages
  - See [Tailwind v4 CSS-first configuration](https://tailwindcss.com/blog/tailwindcss-v4) for details [tailwindcss](https://tailwindcss.com/blog/tailwindcss-v4)

***

## 4. Database layer: Neon (primary) + Supabase (fallback) + Drizzle ORM

### Multi-Provider Strategy

| Provider | Role | Best For |
| --- | --- | --- |
| **Neon** | Primary default | Serverless Postgres, excellent branching workflow, preview DBs |
| **Supabase** | Fallback option | Larger free tier, unified backend (DB + Auth + Storage), all-in-one convenience |

### Runtime packages

| Package | Version | Notes |
| --- | --- | --- |
| `drizzle-orm` | **0.45.2** | Latest stable; supports Neon and Postgres. [npmjs](https://www.npmjs.com/package/drizzle-orm) |
| `drizzle-kit` | **latest 0.3x (e.g. 0.31.x)** | CLI for migrations. [tessl](https://tessl.io/registry/tessl/npm-drizzle-kit) |
| `@neondatabase/serverless` | **1.0.2** | Neon’s serverless driver; primary for most projects. [orm.drizzle](https://orm.drizzle.team/docs/get-started/neon-new) |
| `@supabase/supabase-js` | **2.49.0** | Supabase client for fallback/Supabase-hosted projects. [supabase](https://supabase.com/docs/reference/javascript) |
| `pg` (optional) | If needed for non-edge | Classic TCP Postgres connections. [neon](https://neon.com/docs/serverless/serverless-driver) |

### Provider Selection Guide

**Use Neon when:**
- Best database branching workflow is critical
- Heavy PR preview database needs
- Already managing auth separately (Clerk/Better Auth)
- Prefer focused database-only vendor

**Use Supabase when:**
- Need larger free tier (check current limits)
- Want unified backend (DB + Auth + Storage)
- Simpler vendor management preferred
- Client specifically requests Supabase

### Tooling / config for `@agency/data-db`

- Use `drizzle-orm` as the ORM layer (works with both Neon and Supabase)
- Use `@neondatabase/serverless` for Neon connections
- Use `@supabase/supabase-js` for Supabase connections
- Use `drizzle-kit` for migrations (works with both providers)
- Switch providers via `DATABASE_PROVIDER` environment variable

***

## 5. Auth: Multi-Provider Strategy

### Auth Provider Matrix

| Provider | Best For | Cost Model | Data Ownership |
| --- | --- | --- | --- |
| **Clerk** | Internal tools (primary) | Per-MAU | Managed (vendor) |
| **Better Auth** | Client portals (primary) | Zero per-MAU | Self-hosted (you control data) |
| **Supabase Auth** | Both internal & portals (fallback) | Bundled with Supabase | Managed by Supabase |
| **WorkOS** | Enterprise SSO escalation | Per-feature | Managed |

### Clerk for internal tools (Primary)

| Package | Version | Notes |
| --- | --- | --- |
| `@clerk/nextjs` | **7.0.8** | Latest SDK; best Next.js DX. [dev](https://dev.to/clerk/clerk-update-november-12-2024-3h6b) |

Clerk provides the fastest path to production for internal tools with pre-built UI components and excellent Next.js integration.

### Better Auth for client portals (Primary)

| Package | Version | Notes |
| --- | --- | --- |
| `better-auth` | **1.5.0** | Self-hosted auth framework. New: MCP auth, Electron support, Cloudflare D1 adapter. [better-auth](https://www.npmjs.com/package/better-auth) |
| `better-auth/react` | **1.5.0** | React client bindings. [better-auth](https://www.better-auth.com/docs/installation) |
| Plugins (optional) | e.g. `better-auth-plugins` | For 2FA, passkeys, RBAC. [better-auth](https://www.better-auth.com/docs/plugins) |

Better Auth provides zero per-MAU cost and full data ownership — ideal for client portals that may scale to thousands of users.

### Supabase Auth (Fallback for both)

| Package | Version | Notes |
| --- | --- | --- |
| `@supabase/supabase-js` | **2.49.0** | Supabase client with Auth. [supabase](https://supabase.com/docs/reference/javascript) |

Use Supabase Auth as the fallback when:
- Already using Supabase as the database (unified backend)
- Client prefers managed auth over self-hosted
- Budget-conscious scenario where bundled auth is advantageous

### Provider Selection Summary

**Internal Tools:**
- Default: Clerk (fastest DX)
- Fallback: Supabase Auth (if using Supabase DB)

**Client Portals:**
- Default: Better Auth (zero per-MAU cost)
- Fallback: Supabase Auth (managed convenience)

**Enterprise SSO:**
- Escalation: WorkOS (from either primary or fallback)

***

## 6. Email stack: React Email + Resend + Postmark

### Email providers

| Package | Version | Notes |
| --- | --- | --- |
| `resend` | **latest 3.x** (Node SDK) | Official Resend Node SDK; examples show usage in Next.js route handlers. [npmjs](https://www.npmjs.com/package/resend) |
| `postmark` | **4.0.7** | Official Postmark Node client for premium deliverability. [postmarkapp](https://postmarkapp.com/send-email/node) |

### Templates (`@agency/email-templates`) and service (`@agency/email-service`)

For React Email in a monorepo:

| Package | Version | Notes |
| --- | --- | --- |
| `@react-email/components` | **1.0.10** | Component primitives for React Email templates. [npmjs](https://www.npmjs.com/package/@react-email/components) |
| `react-email` / `@react-email/preview-server` | **latest** | Optional dev server for previewing email templates in isolation. [react](https://react.email/docs/getting-started/manual-setup) |

React Email’s docs include explicit monorepo + pnpm workspace guides, which match your `packages/communication/email-templates` pattern. [reactemailtemplates](https://reactemailtemplates.com/blog/setting-up-react-email-in-a-monorepo-complete-guide-2025)

`@agency/email-service` should depend on `resend`, `postmark`, and your templates package, providing a unified send API so apps can switch providers without touching app code. [npmjs](https://www.npmjs.com/package/resend)

***

## 7. CMS: Sanity + Next

### Studio and client libraries

| Package | Version | Notes |
| --- | --- | --- |
| `sanity` | **5.19.0** | Latest Sanity Studio 5.x release. [npmjs](https://www.npmjs.com/package/sanity) |
| `next-sanity` | **12.1.5** | Next.js toolkit for Sanity: client, embedded Studio, visual editing. [npmjs](https://www.npmjs.com/package/next-sanity?activeTab=dependents) |
| `@sanity/client` | **7.20.0** | Stand‑alone Sanity client; often unnecessary if you only use `next-sanity`. [npmjs](https://www.npmjs.com/package/@sanity/client) |

Sanity v5 and `next-sanity` are explicitly designed to work with modern Next.js (App Router, embedded Studio), and there are public starters using Turborepo + Next + Sanity, which align with your monorepo structure. [github](https://github.com/Aerolab/next-sanity-starter)

***

## 8. Analytics and feature flags: Plausible + PostHog

### Plausible (marketing analytics)

| Package | Version | Notes |
| --- | --- | --- |
| `@plausible-analytics/tracker` | **0.4.4** | Official Plausible tracker for SPAs/Next; supports custom events and revenue tracking. [npmjs](https://www.npmjs.com/package/@plausible-analytics/tracker) |

This is browser‑only, so you use it in client components or via an analytics wrapper in your apps. [npmjs](https://www.npmjs.com/package/@plausible-analytics/tracker)

### PostHog (product analytics + feature flags)

| Package | Version | Notes |
| --- | --- | --- |
| `posthog-js` | **1.364.7** | Browser SDK for analytics and feature flags; compatible with Next 15/16 App Router guides. [npmjs](https://www.npmjs.com/package/posthog-js) |
| `posthog-node` | **5.28.8** | Node SDK for server‑side events and feature flags; requires Node ≥20. [posthog](https://posthog.com/docs/libraries/node) |

Official PostHog guides show how to initialize `posthog-js` via `instrumentation-client.ts` in Next 15+ and use `posthog-node` for server‑side flags, confirming compatibility with your target Next 16 App Router architecture. [posthog](https://posthog.com/tutorials/nextjs-analytics)

***

## 9. Testing and UI workbench

### Unit & integration tests

| Package | Version | Notes |
| --- | --- | --- |
| `vitest` | **4.1.3** | Latest Vitest; requires Node ≥20 and Vite ≥6. [npmjs](https://www.npmjs.com/package/vitest) |
| `@testing-library/react` | **16.3.2** | Latest RTL version; supports modern React (≥18, including 19). [security.snyk](https://security.snyk.io/package/npm/@testing-library%2Freact) |
| `@testing-library/jest-dom` | **latest** | Jest/Vitest DOM matchers. |
| `@testing-library/user-event` | **latest** | User interaction helpers. |

Vitest’s Node ≥20 requirement matches your Node 24 baseline and plays nicely with Vite-based tooling if you add Vite later for libraries. [vitest](https://vitest.dev/guide/)

### E2E tests

| Package | Version | Notes |
| --- | --- | --- |
| `@playwright/test` | **1.59.1** | Latest Playwright Test; documented with `@playwright/test@latest` for Node 16+, fully fine on Node 24. [npmjs](https://www.npmjs.com/package/@playwright/test) |

### Component workbench (Storybook or Ladle)

You can pick one per your preference; your doc suggests Storybook as the mature option and Ladle as the lighter alternative. [storybook.js](https://storybook.js.org/releases)

| Package | Version | Notes |
| --- | --- | --- |
| `storybook` | **10.3.4** | New core CLI package; docs recommend Node 20+, pnpm 9+ and Next.js 14+; works with Next 16. [npmjs](https://www.npmjs.com/package/storybook) |
| `@storybook/react` | **10.3.x** | React renderer. |
| `@ladle/react` | **5.1.1** | Lightweight Storybook alternative; integrates fine with React 19. [tessl](https://tessl.io/registry/tessl/npm-ladle--react) |

Storybook’s install docs list Node 20+ and pnpm 9+ as supported, which matches your baseline Node 24 + pnpm 10. [npmjs](https://www.npmjs.com/package/pnpm)

***

## 10. Root apps and internal packages: dependency layering

Your internal packages should follow the low‑to‑high dependency flow you specified (**config/core → data/communication/ui → apps**), and most of them only need **internal** deps plus a small set of external ones:

- `@agency/core-types`, `@agency/core-utils`, `@agency/core-constants`, `@agency/core-hooks`  
  - External deps: `typescript`, maybe `zod`/validation library if you standardize on one, and React for hooks.  
- `@agency/ui-design-system`, `@agency/ui-theme`, `@agency/ui-icons`  
  - External deps: `react`, `react-dom`, `tailwindcss`, `@radix-ui/react-*`, `lucide-react`, `clsx`, `tailwind-merge`, `class-variance-authority`. [stackoverflow](https://stackoverflow.com/questions/79720668/shared-package-in-nextjs-monorepo-shadcn-ui)
- `@agency/data-db`  
  - External deps: `drizzle-orm@0.45.2`, `drizzle-kit`, `@neondatabase/serverless`, `@supabase/supabase-js@2.49.0`, `pg` only if you need non‑edge connections. [neon](https://neon.com/docs/serverless/serverless-driver) [supabase](https://supabase.com/docs/reference/javascript)
- `@agency/data-cms`  
  - External deps: `sanity@5.19.0`, `next-sanity@12.1.5`. [npmjs](https://www.npmjs.com/package/sanity)
- `@agency/email-templates`  
  - External deps: `@react-email/components@1.0.10`, `react`, `react-dom`. [npmjs](https://www.npmjs.com/package/@react-email/components)
- `@agency/email-service`  
  - External deps: `resend`, `postmark`.  
- `@agency/notifications`  
  - External deps: Slack/Discord/webhook libraries if you standardize on them, plus `posthog-node` if you route notification events into analytics. [posthog](https://posthog.com/docs/libraries/node)
- `@agency/config-*`  
  - External deps: `eslint`, `eslint-config-next@16.2.2`, TS tooling, Tailwind, PostCSS, autoprefixer. [nextjs](https://nextjs.org/docs/app/api-reference/config/eslint)
- `@agency/test-*`  
  - External deps: `vitest@4.1.3`, `@testing-library/react@16.3.2`, `@playwright/test@1.59.1`. [npmjs](https://www.npmjs.com/package/vitest)

Use `workspace:*` ranges for all internal dependencies so pnpm resolves local packages and Changesets can bump them correctly. [npmjs](https://www.npmjs.com/package/@changesets/cli)

***

## 11. CI/CD and hosting: Multi-Platform Strategy

### Deployment Platform Matrix

| Platform | Role | Best For |
| --- | --- | --- |
| **Vercel** | Primary default | Next.js apps, preview deployments, Turborepo integration |
| **Cloudflare Pages** | Fallback option | Cost optimization, 300+ edge locations, reduced lock-in |
| **Railway/Render** | Long-running workloads | Background jobs, >60s execution, stateful processes |

### GitHub Actions

- Use `actions/checkout@v4` and `actions/setup-node@v4` targeting Node **24.x** (or at least 20.x), since Node 16 actions are deprecated. [endoflife](https://endoflife.date/nodejs)
- CI steps per job: `pnpm install --frozen-lockfile`, `pnpm lint`, `pnpm test`, `pnpm build` (internally running `turbo run ...`). [turborepo](https://turborepo.dev/blog/2-9)

### Vercel (Primary)

- Deploy Next apps to Vercel with env vars pointing to database connection string (`DATABASE_URL` for Neon, or `SUPABASE_URL` + `SUPABASE_SERVICE_KEY`).  
- Neon’s docs show using `@neondatabase/serverless` with Vercel envs. [npmjs](https://www.npmjs.com/package/@neondatabase/serverless?activeTab=code)
- Best for: teams wanting fastest DX, preview deployments, full Next.js feature support.

### Cloudflare Pages (Fallback)

- Deploy static or lightly dynamic Next.js apps to Cloudflare for cost optimization.
- Use Wrangler CLI or GitHub Actions (`cloudflare/wrangler-action@v3`).
- Best for: high-traffic sites where bandwidth costs matter, maximum global edge coverage.
- Note: API routes may need separate Workers deployment; use Supabase REST API instead of direct Postgres.

### Railway/Render (Long-running)

- Deploy background workers and services needing >60s execution.
- Extract from main Next.js app; call via HTTP or queue.
- Best for: report generation, email batching, data imports.

### Platform Selection Guide

**Choose Vercel when:**
- Fastest time to production is critical
- Preview deployment workflow needed
- Full Next.js feature set required (API routes, Image Optimization, etc.)
- Turborepo remote cache integration valued

**Choose Cloudflare when:**
- Cost optimization at scale is priority
- Maximum global edge coverage needed (300+ locations)
- Reducing vendor lock-in from Vercel
- Site is primarily static or lightly dynamic

**Choose Railway/Render when:**
- Workload exceeds 60 seconds
- Background processing required
- Stateful processes needed

### Provider Compatibility

All tools (Plausible, PostHog, Resend, Postmark, Clerk, Better Auth, Sanity) operate via HTTP APIs and work across all deployment platforms. [npmjs](https://www.npmjs.com/package/@clerk/nextjs)