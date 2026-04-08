# Agency Monorepo Architecture
*A strategic, fully elaborated reference for building, scaling, and governing a production-grade agency monorepo — written for a non-developer owner working through AI coding tools like Cursor and Windsurf.*

> **Governance Note:** This document describes the **target architecture**. The current implementation state — what is approved to build, what is planned, and what is deferred — is tracked in `REPO-STATE.md`. Consult REPO-STATE.md before beginning any implementation work to confirm a package or app has been approved for scaffolding.

*Last revised: April 2026. Synchronized with TASKS.md (85 tasks, generated April 7, 2026).*

***

## What a monorepo is and why it matters for an agency

A monorepo is a single Git repository that houses every application, shared library, configuration file, and internal tool your agency owns. It is not a monolithic application — each app inside still deploys independently and can fail without affecting the others. The distinction matters because it means you get the organizational benefits of everything being in one place without surrendering the isolation that keeps one client's project from ever touching another's.

The practical agency case for this architecture is strong. When you manage a design system, a CRM, invoicing tooling, a client portal framework, and a dozen client websites simultaneously, keeping them in separate repositories means that a shared button component, a utility function, or a database schema change must be coordinated across many codebases. In a monorepo, that same change is a single pull request that updates every consumer at once and cannot be merged until every automated check passes. Companies at vastly different scales — Google, Meta, Airbnb, Stripe, and Dropbox — have invested in monorepos for exactly this reason: shared code, atomic changes, and unified tooling compound in value with every project you add.

***

## Final stack

The recommended default stack is: **pnpm workspaces** (10.x), **Turborepo 2.x** for task orchestration and caching, **Next.js 16 App Router** for all apps, **React 19** with the stable **React Compiler**, **Tailwind CSS v4 + shadcn/ui** for UI, **Sanity** for CMS-backed sites, **Neon + PostgreSQL + Drizzle ORM** for application data, **Clerk** for internal tools, **Better Auth** as the strongest self-hosted authentication option for client-facing portals, **React Email + Resend** for default transactional email with **Postmark** as the premium deliverability alternative, **Plausible** for marketing analytics, **PostHog** for product analytics and feature flags, **GitHub Actions** for CI/CD with Turborepo remote caching, and **Vercel** as the primary hosting target, with **Railway** or **Render** reserved for workloads that need long-running jobs or persistent server processes that serverless cannot handle.

### Why each choice was made

**pnpm** is the right workspace package manager because it uses a content-addressable store with symlinks rather than duplicating packages in each node_modules folder, which means disk usage stays low even as the repo grows to dozens of apps. Its strict resolution algorithm also prevents phantom dependencies — situations where your code accidentally relies on a package that was never explicitly listed as a dependency, which creates silent, hard-to-debug failures in production.

**Turborepo 2.x** is the right task runner for the seed and growth stages because it has minimal operational overhead, is built and maintained by Vercel (meaning it integrates without friction with the deployment target), and delivers up to 96% improvement in Time to First Task for large repos through intelligent caching and parallelization. **Important:** Turborepo 2.x replaced the `pipeline` key in `turbo.json` with `tasks`. All `turbo.json` configurations in this repo must use the `tasks` key, not the legacy `pipeline` key. Turborepo understands which packages have changed and runs only the affected tasks. Its remote caching feature means saved artifacts are shared across every developer's machine and every CI run rather than being discarded after each session.

**Nx** is not recommended at launch but is the correct upgrade path once the repo reaches 30 or more apps or multiple active development teams. The domain-grouped folder structure recommended below is intentionally compatible with Nx tag-based boundaries so the migration, when it arrives, requires no restructuring.

**Next.js 16 App Router** is the right framework for every app because it supports server components, server actions, streaming, and static generation from a single unified mental model. Using one framework across the entire repo means every developer can contribute to every app, shared packages never need separate builds for different framework targets, and deployment to Vercel is zero-configuration.

**React Compiler** (stable as of 2025, opt-in via `reactCompiler: true` in Next.js 16.2+) eliminates manual `useMemo` and `useCallback` in most cases by automatically analyzing component dependencies at build time using SWC. The `@agency/config-react-compiler` package manages compiler configuration and the migration guide from manual memoization patterns. There are still narrow cases where manual memoization remains correct — complex object equality, external library integration, and performance-critical paths requiring explicit control — and the package documents exactly those cases.

**shadcn/ui** is the correct UI library choice over a pre-compiled component library because it copies component source directly into your repository rather than importing a black-box dependency. You own and can modify every component without forking a third-party package. shadcn/ui CLI v4 (March 2026) provides native monorepo support via the `--monorepo` flag, scaffolding components into `packages/ui` while block components install directly to consuming apps. The CLI now supports `--preset` for design system configuration codes, `--dry-run` and `--diff` for change inspection, and `shadcn/skills` for AI agent context. This makes the design system package setup straightforward rather than requiring manual workarounds.

**Neon** is the right database host because it provides true serverless PostgreSQL with connection pooling, branching for development, and pay-per-compute pricing that suits both low-traffic client portals and high-traffic internal tools. Neon's database branching feature is particularly valuable in an agency context: developers and AI coding agents can create isolated database branches for feature work without polluting shared staging environments, and those branches are destroyed automatically when the branch is merged.

**Neon Branch Naming Conventions:**
- `dev/<developer-name>` — Long-lived developer branches (e.g., `dev/alice`)
- `dev/<feature-name>` — Feature collaboration branches (e.g., `dev/new-onboarding`)
- `preview/pr-<number>-<branch>` — PR preview databases (e.g., `preview/pr-123-feat/login`)
- `test/<branch>-<run>-<sha>-<timestamp>` — Ephemeral test run branches

**Drizzle ORM** pairs naturally with Neon because it is lightweight, TypeScript-first, and generates typed query results without a code generation step at runtime. Schema definitions, migration files, and query modules all live in the shared `@agency/data-db` package.

**Clerk** is the right choice for internal tools because those apps have predictable, low user counts, the per-MAU pricing stays manageable, and Clerk's pre-built UI components and managed backend eliminate authentication maintenance entirely.

**Better Auth** is the right choice for client-facing portals because it is fully self-hosted and framework-agnostic, meaning your users' data and session logic never leave your own database. Better Auth has a native Drizzle adapter, a shadcn-compatible component library, and a plugin system covering 2FA, passkeys, RBAC, impersonation, and organizations. It reached its v1.0 stable release in 2025 and is the correct Clerk alternative for teams that need data ownership. If a client portal ever requires enterprise SSO or SCIM directory sync, WorkOS is the correct escalation path from Better Auth.

**React Email + Resend** is the right email stack because React Email lets you build transactional templates as React components with full TypeScript safety and a local preview server, and Resend's API integrates directly with that toolchain. Postmark is the premium swap when deliverability to enterprise inboxes is contractually required. The `@agency/email-service` abstraction package makes this provider swap a configuration change rather than a code change.

**Plausible + PostHog** gives you a clean two-analytics architecture: Plausible handles marketing site analytics with no cookie consent requirement and GDPR compliance by default; PostHog handles product analytics, session replay, and feature flags inside authenticated applications. These are implemented as two separate packages — `@agency/analytics` contains the Plausible integration for public sites, and PostHog integration lives alongside it — rather than a single unified analytics package.

***

## Exact version constraints

All version locks are maintained in `DEPENDENCY.md`. The values below are the pinned targets as of April 2026:

| Tool | Pinned version | Notes |
|---|---|---|
| Node.js | 24.x (min 20.9.0) | `.nvmrc` set to `24.0.0` |
| pnpm | 10.33.0 | Locked via `packageManager` field in root `package.json` |
| Turborepo | 2.9.4 | Uses `tasks` key (not `pipeline`) in `turbo.json` |
| Next.js | 16.2.2 | Minimum for stable React Compiler support |
| React | 19.2.4 | Required for React Compiler |
| TypeScript | 6.0.0 | Used in all packages and apps |
| Tailwind CSS | 4.x | CSS-first configuration via `@theme` directives, no JS preset |
| Drizzle ORM | latest stable | Paired with `drizzle-kit` for migrations |

> **AI agent note:** When scaffolding any new package or app, always read `DEPENDENCY.md` and use these exact versions. Do not use `latest` as a version specifier for core dependencies. Never upgrade major versions without a corresponding ADR in `docs/architecture/`.

***

## Repository shape

Use one repository with **apps**, **packages**, **tools**, **docs**, and **GitHub workflow** folders, organized so that `packages/` is grouped by domain rather than by technical role. Domain grouping means every folder name communicates business intent rather than implementation detail, and it maps cleanly to the Nx boundary constraints that will be applied when the repo reaches scale.

```text
agency-monorepo/
├── apps/
│   ├── agency-website/                # @agency/agency-website — public marketing site
│   ├── client-sites/
│   │   ├── [client]-landing/
│   │   ├── [client]-website/
│   │   └── [client]-portal/           # only when a client requires a logged-in experience
│   └── internal-tools/
│       ├── crm/                       # first internal tool; validates package APIs
│       ├── project-tracker/
│       ├── invoicing/
│       ├── reporting/
│       └── operations-dashboard/
│
├── packages/
│   ├── config/
│   │   ├── eslint-config/             # @agency/config-eslint
│   │   ├── typescript-config/         # @agency/config-typescript
│   │   ├── tailwind-config/           # @agency/config-tailwind
│   │   ├── prettier-config/           # @agency/config-prettier
│   │   └── react-compiler/            # @agency/config-react-compiler
│   ├── core/
│   │   ├── shared-types/              # @agency/core-types
│   │   ├── shared-utils/              # @agency/core-utils
│   │   ├── constants/                 # @agency/core-constants
│   │   └── hooks/                     # @agency/core-hooks
│   ├── ui/
│   │   ├── theme/                     # @agency/ui-theme
│   │   ├── icons/                     # @agency/ui-icons
│   │   └── design-system/             # @agency/ui-design-system
│   ├── marketing/
│   │   ├── seo/                       # @agency/seo
│   │   ├── compliance/                # @agency/compliance
│   │   ├── compliance-security-headers/ # @agency/compliance-security-headers
│   │   ├── monitoring/                # @agency/monitoring
│   │   └── monitoring-rum/            # @agency/monitoring-rum
│   ├── data/
│   │   ├── database/                  # @agency/data-db
│   │   ├── cms-schemas/               # @agency/data-cms
│   │   ├── content-federation/        # @agency/data-content-federation
│   │   ├── ai-enrichment/             # @agency/data-ai-enrichment
│   │   └── api-client/                # @agency/data-api-client
│   ├── auth/
│   │   ├── internal/                  # @agency/auth-internal (Clerk)
│   │   └── portal/                    # @agency/auth-portal (Better Auth)
│   ├── communication/
│   │   ├── email-templates/           # @agency/email-templates
│   │   ├── email-service/             # @agency/email-service
│   │   └── notifications/             # @agency/notifications
│   ├── analytics/
│   │   ├── analytics/                 # @agency/analytics (Plausible + PostHog wrappers)
│   │   ├── analytics-attribution/     # @agency/analytics-attribution
│   │   └── analytics-consent-bridge/  # @agency/analytics-consent-bridge
│   ├── experimentation/
│   │   ├── experimentation/           # @agency/experimentation (A/B testing, feature flags)
│   │   └── experimentation-edge/      # @agency/experimentation-edge (Edge Config)
│   ├── lead-capture/
│   │   ├── lead-capture/              # @agency/lead-capture
│   │   ├── lead-capture-progressive/  # @agency/lead-capture-progressive
│   │   └── lead-capture-enrichment/   # @agency/lead-capture-enrichment
│   └── testing/
│       ├── setup/                     # @agency/test-setup
│       └── fixtures/                  # @agency/test-fixtures
│
├── tools/
│   ├── generators/                    # b0: app generator, b1: package generator
│   ├── codemods/                      # b3: automated migration scripts
│   ├── scripts/                       # b2: db seed, b4: AI content pipeline
│   └── mcp-server/                    # g0: @agency/tools-mcp-server
│
├── docs/
│   ├── AGENTS.md                      # rules for AI coding agents (read this first)
│   ├── architecture/                  # ADRs (Architecture Decision Records)
│   ├── onboarding/                    # new contributor setup guides
│   ├── package-guides/                # per-package usage documentation
│   ├── analytics/                     # Plausible + PostHog setup guides
│   ├── marketing/                     # marketing standards documentation
│   └── decisions/                     # rationale log for non-obvious technical choices
│
├── .changeset/
├── .github/
│   ├── workflows/
│   │   ├── ci.yml
│   │   ├── release.yml
│   ├── └── preview.yml
│   └── CODEOWNERS
├── ARCHITECTURE.md                    # this file
├── DEPENDENCY.md                      # version locks and upgrade strategy
├── TASKS.md                           # consolidated 85-task implementation guide
├── package.json
├── pnpm-workspace.yaml
├── turbo.json
└── README.md
```

### Conditional apps (add only when the need is confirmed)

| App | Task | Condition |
|---|---|---|
| `apps/client-portal/` | e4 | First client requiring a logged-in experience |
| `apps/docs-site/` | e6 | When internal documentation needs a publishable surface |
| `apps/email-preview/` | e7 | When React Email template volume justifies a live preview environment |
| `apps/studio/` | e8 | First Sanity-backed client site |
| `apps/api/` | e9 | First use case requiring a dedicated API server |

### Conditional packages (add only when the need is confirmed)

| Package | Task | Condition |
|---|---|---|
| `@agency/observability` | f0 | When monitoring needs exceed what `@agency/monitoring` covers |
| `@agency/content-blocks` | f1 | First multi-client site sharing CMS content block schemas |
| `@agency/i18n` | f2 | First app requiring internationalization |
| `[client]-brand-foundation` | f3 | When a client site's brand tokens are complex enough to merit a dedicated package |

***

## Package taxonomy

### The governing principle

A package exists only when two or more consumers truly share the same code without distortion. Distortion means one consumer needs a slightly different version of the logic and the package has been twisted to accommodate both use cases in a single export, making it harder to understand and maintain for everyone. When that happens, the code belongs in the apps that use it, not in a shared package.

Treat every shared package as its own product with consumers, documentation, tests, a public API surface, and a version history. This mindset prevents the "shared folder of random things" sprawl that kills long-term maintainability. A package that cannot answer the question "who consumes this and what exact problem does it solve for them?" should not exist.

### Full package reference

#### Config domain

| Package | Task | Purpose |
|---|---|---|
| `@agency/config-eslint` | 10 | Shared ESLint flat config enforcing one-way dependency flow, TypeScript linting, and import boundary rules. |
| `@agency/config-typescript` | 11 | Base tsconfig files: `base.json`, `nextjs.json`, and `library.json`. All packages and apps extend one of these. |
| `@agency/config-tailwind` | 12 | Shared Tailwind v4 theme CSS using `@theme` directives. Apps `@import` this file rather than extending a JS preset. |
| `@agency/config-prettier` | 13 | Shared Prettier configuration. Root `format` and `format:check` scripts reference this package. |
| `@agency/config-react-compiler` | 13a | React Compiler configuration for Next.js 16, ESLint plugin for compiler rules, and migration guide from manual memoization. |

#### Core domain

| Package | Task | Purpose |
|---|---|---|
| `@agency/core-types` | 20 | Shared TypeScript types and Zod schemas for all domain models — client, project, invoice, user role. Sits at the base of the entire dependency graph; must stay dependency-light. |
| `@agency/core-utils` | 21 | Pure utility functions only: date formatting, string helpers, currency formatting, input validation, slug generation. Zero dependencies outside `@agency/core-types`. No React, no database, no network. |
| `@agency/core-constants` | 22 | Enums, error codes, route key maps, and fixed configuration values. Anything that would otherwise be a "magic string" scattered across multiple apps. |
| `@agency/core-hooks` | 23 | Reusable React hooks: debounce, media query detection, outside-click detection, clipboard access, keyboard shortcut registration. No app-specific state. |

#### UI domain

| Package | Task | Purpose |
|---|---|---|
| `@agency/ui-theme` | 30 | Design tokens expressed as CSS custom properties using Tailwind v4 `@theme` directives. Never contains client-specific brand colors — those live in individual app directories. |
| `@agency/ui-icons` | 31 | Lucide wrappers plus any custom SVG icon exports. Keeps icon dependencies isolated from the rest of the design system. |
| `@agency/ui-design-system` | 32 | shadcn/ui-based components, layout primitives, accessibility-safe form and navigation shells, data tables, empty states, and skeleton loaders. A component belongs here only if it can appear in both an internal tool and a client-facing portal without modification. |

#### Marketing domain

The marketing domain packages are new relative to a baseline monorepo. They represent the agency's website-design focus and must be built after the core and UI domains are stable.

| Package | Task | Purpose |
|---|---|---|
| `@agency/seo` | 40 | SEO utilities: metadata generation helpers, structured data (JSON-LD) builders, sitemap generation, robots.txt helpers, and Open Graph image utilities. Consumed by every public-facing app. |
| `@agency/compliance` | 41 | GDPR/CCPA compliance: consent management, cookie banner primitives, privacy policy utilities, and consent-aware analytics initialization. |
| `@agency/compliance-security-headers` | 41a | Security header configurations for Next.js `headers()` function — CSP, HSTS, X-Frame-Options, Permissions-Policy. Separate from `@agency/compliance` because security headers have a different risk and review profile. |
| `@agency/monitoring` | 42 | Performance monitoring: Core Web Vitals instrumentation, custom performance marks, and Vercel Speed Insights integration. |
| `@agency/monitoring-rum` | 42a | Real User Monitoring (RUM) using Chrome User Experience Report (CrUX) data. Separate from `@agency/monitoring` because CrUX access and field data instrumentation are distinct from lab-based performance marks. |

#### Data domain

| Package | Task | Purpose |
|---|---|---|
| `@agency/data-db` | 50 | Drizzle schema definitions, the Neon database client factory, typed query modules, migration files, and seed scripts. The single source of truth for the operational data model. Every table holding client-specific data must include a non-nullable `client_id` column. |
| `@agency/data-cms` | 51 | Reusable Sanity schema fragments and shared content models — blog post structure, SEO fields, image gallery schema — used across multiple Sanity-backed client sites. |
| `@agency/data-content-federation` | 51a | Multi-source content federation layer for aggregating content from Sanity, external APIs, and other CMS sources into a unified query interface. Add only when two or more apps need to query multiple content sources through a single abstraction. |
| `@agency/data-ai-enrichment` | 51b | AI-powered content processing: automated tagging, summarization, SEO suggestions, and content quality scoring via LLM APIs. Add only when the AI content pipeline (tool `b4`) is active. |
| `@agency/data-api-client` | 52 | Typed fetch wrappers and API client helpers for internal service-to-service calls. Only warranted once two or more apps genuinely call the same internal API. |

#### Auth domain

| Package | Task | Purpose |
|---|---|---|
| `@agency/auth-internal` | 60 | Clerk configuration, middleware helpers, and typed session utilities for internal tools. If Clerk's API changes or pricing makes migration necessary, this is the only package that needs to be rewritten. |
| `@agency/auth-portal` | 61 | Better Auth configuration, Drizzle adapter setup, session helpers, and organization management utilities for client-facing portals. Plugin configuration for 2FA, RBAC, and organization management lives here. |

#### Communication domain

| Package | Task | Purpose |
|---|---|---|
| `@agency/email-templates` | 70 | React Email templates and reusable email layout components: transactional receipts, notification digests, password reset flows. |
| `@agency/email-service` | 71 | Send-layer abstraction over Resend and Postmark. App code calls `sendEmail()` and the provider is determined by environment configuration — Resend by default, Postmark when `POSTMARK_API_KEY` is present. |
| `@agency/notifications` | 72 | Slack, Discord, and webhook helpers plus in-app notification plumbing when that requirement emerges. |

#### Analytics domain

The analytics domain has a two-package split that reflects the two-analytics architecture described in the stack rationale: Plausible for public marketing sites, PostHog for authenticated product contexts.

| Package | Task | Purpose |
|---|---|---|
| `@agency/analytics` | 80 | Plausible and PostHog integration wrappers. Exports `PlausibleProvider`, `PostHogProvider`, `usePlausible`, `usePostHog`, and `useFeatureFlag`. Public sites use the Plausible half; authenticated apps use the PostHog half. |
| `@agency/analytics-attribution` | 80a | Multi-touch attribution: UTM parameter capture, referrer tracking, session stitching across devices, and first/last-touch attribution models. Add when the agency needs to track the full lead journey from first click to conversion. |
| `@agency/analytics-consent-bridge` | 80b | Bridge between `@agency/compliance` consent state and analytics initialization. Ensures PostHog and Plausible are not activated until the correct consent level is granted. Depends on both `@agency/compliance` and `@agency/analytics`. |

#### Experimentation domain

| Package | Task | Purpose |
|---|---|---|
| `@agency/experimentation` | 81 | A/B testing framework and feature flag management using PostHog as the backend. Provides `useExperiment`, `useFeatureFlag`, and server-side variant resolution. |
| `@agency/experimentation-edge` | 81a | Edge Config-powered experimentation for zero-latency variant assignment at the CDN edge before the Next.js server renders anything. Separate from `@agency/experimentation` because edge execution has different constraints and deployment requirements. |

#### Lead capture domain

| Package | Task | Purpose |
|---|---|---|
| `@agency/lead-capture` | 82 | Lead capture form components, validation schemas, and submission handlers. Integrates with the email service and CRM. |
| `@agency/lead-capture-progressive` | 82a | Progressive form orchestration: multi-step forms, conditional branching, partial submission saving, and re-engagement flows for abandoned forms. |
| `@agency/lead-capture-enrichment` | 82b | Lead data enrichment: company lookup, contact scoring, and CRM field augmentation using third-party enrichment APIs. |

#### Testing domain

| Package | Task | Purpose |
|---|---|---|
| `@agency/test-setup` | 90 | Vitest, Testing Library, and Playwright shared setup and configuration files. |
| `@agency/test-fixtures` | 91 | Shared mock factories, seed builders, and test data generators used across multiple package and app test suites. |

***

## Internal dependency flow — the rules that must never be broken

Enforce a strict low-to-high dependency flow. The diagram below reflects the full package set:

```
config
  ↓
core  (no deps except config)
  ↓
ui, data, auth, communication, marketing
  (may import from core; may NOT import from each other except where explicitly noted)
  ↓
analytics, experimentation, lead-capture
  (may import from marketing, core, ui; analytics-consent-bridge may import from compliance)
  ↓
apps
  (may import from any package domain; never import from another app)

No package may ever import from an app.
No package may import from a domain higher in this diagram unless explicitly listed above.
```

In plain terms:
- `core/` packages may not import from `ui/`, `data/`, `auth/`, `communication/`, `marketing/`, `analytics/`, `experimentation/`, or `lead-capture/`.
- `data/` packages may import from `core/` but not from `ui/`, `auth/`, or `communication/`.
- `auth/` packages may import from `core/` and `data/` (for the Drizzle adapter) but not from `ui/` or `communication/`.
- `marketing/` packages may import from `core/` and `ui/` but not from `data/`, `auth/`, or `communication/`.
- `analytics/` and `experimentation/` may import from `core/`, `ui/`, and `marketing/`.
- `analytics-consent-bridge` is the only package authorized to import from both `@agency/compliance` (marketing domain) and `@agency/analytics`.
- Apps may import from any package domain.

The ESLint configuration in `@agency/config-eslint` includes `no-restricted-paths` zone rules that enforce this flow automatically on every PR. Violations are caught at lint time, not in code review.

***

## What to build first — exact launch order

Build in this sequence. Do not skip ahead.

1. Root scaffolding: `pnpm-workspace.yaml`, `turbo.json` (using `tasks` key), root `package.json` (pnpm 10.33.0, Node 24.x engine), `.gitignore`, `.nvmrc` (24.0.0), README.md.
2. `@agency/config-eslint` — boundary rules must exist before any other package is created.
3. `@agency/config-typescript` — all subsequent packages extend from this.
4. `@agency/config-tailwind` — Tailwind v4 CSS-first theme.
5. `@agency/config-prettier` — formatting consistency.
6. `@agency/config-react-compiler` — React Compiler configuration for Next.js 16.
7. `.github/workflows/ci.yml` with Turborepo remote caching enabled from the first run.
8. `docs/AGENTS.md` and `.github/CODEOWNERS` — before any shared packages exist.
9. `@agency/core-types` — foundational domain models.
10. `@agency/core-utils` — pure utility functions.
11. `@agency/core-constants` — enums, route keys, error codes.
12. `@agency/core-hooks` — reusable React hooks.
13. `@agency/ui-theme` — design tokens and Tailwind extension.
14. `@agency/ui-icons` — icon set.
15. `@agency/ui-design-system` — only the components needed by the first real app. Not a speculative full library.
16. `@agency/seo` — before the agency website, since it is the primary consumer.
17. `@agency/monitoring` and `@agency/monitoring-rum` — Core Web Vitals instrumentation.
18. `@agency/compliance` and `@agency/compliance-security-headers` — before any public-facing app.
19. `@agency/analytics` — Plausible + PostHog wrappers.
20. `@agency/data-db` — Drizzle schema, Neon client, migrations, seed. Add when the first internal tool needs persistent storage.
21. First internal tool app (`apps/internal-tools/crm/`) — validates all package APIs in a real consumer context before adding more consumers.
22. `@agency/auth-internal` with Clerk configuration.
23. `@agency/email-templates` and `@agency/email-service` when the first transactional email flow exists.
24. `apps/agency-website/` — the public marketing site.
25. `@agency/data-cms` when the first Sanity-backed client site arrives.
26. `@agency/auth-portal` with Better Auth when the first client portal requires a logged-in experience.
27. `@agency/lead-capture` when lead generation forms are needed across two or more apps.
28. `@agency/analytics-attribution`, `@agency/analytics-consent-bridge`, `@agency/experimentation`, and lead-capture sub-packages only when duplication actually appears across multiple consumers.
29. `@agency/data-api-client`, `@agency/notifications`, `@agency/data-content-federation`, and `@agency/data-ai-enrichment` only when real duplication appears.
30. Testing packages (`@agency/test-setup`, `@agency/test-fixtures`), tools (`tools/generators/`, `tools/codemods/`), and the MCP server (`@agency/tools-mcp-server`) as the repo reaches growth stage.

***

## What belongs where — detailed rules

`@agency/ui-design-system` contains generic components only: buttons, cards, form inputs and labels, navigation shells, modals, drawers, data tables, empty states, skeletons, toasts, and accessibility-safe primitives built from shadcn/ui and its Radix UI foundations. A component belongs here if and only if it can appear in both an internal tool and a client-facing portal without modification. Client-specific layout sections, branded hero components, and one-off marketing elements never belong in this package.

`@agency/ui-theme` contains design tokens — spacing scale, typographic scale, radius values, shadow levels, and the base color palette — expressed as CSS custom properties in a `theme.css` file using Tailwind v4's `@theme` directives. It does not contain client-specific brand colors. Those live inside individual client app directories so that one client's palette can never accidentally bleed into another client's site.

`@agency/core-utils` contains pure functions with zero side effects and zero dependencies outside of `@agency/core-types`. Pure means no React, no database access, no network calls, no environment variable reads. If the function needs external state or produces a side effect, it belongs somewhere else.

`@agency/core-types` sits at the base of the entire dependency graph. Its Zod schemas define the canonical shape of domain entities — what a "project" looks like, what valid invoice states exist — and every other package that imports these types gets automatic TypeScript inference from a single authoritative source.

`@agency/seo` centralizes all SEO concerns so that no app reimplements metadata generation, structured data schemas, or sitemap logic independently. Every public-facing app — the agency website and every client site — consumes this package. Never put SEO logic directly in `app/layout.tsx` or individual page files.

`@agency/compliance` manages consent state as the single source of truth. No analytics package, no tracking script, and no third-party embed should initialize without checking consent state from this package first. `@agency/analytics-consent-bridge` is the enforced integration point between compliance and analytics.

`@agency/data-db` centralizes the Drizzle schema, migration files, and typed query modules. This package must enforce strict client data isolation. Every table that holds client-specific data must include a `client_id` column, and every query module must accept and enforce a `client_id` filter so that one client's data cannot ever be returned in a query belonging to another client. This scoping is non-negotiable and must be code-reviewed on every PR that touches this package.

`@agency/auth-internal` encapsulates all Clerk configuration so that the Clerk SDK import and middleware pattern exist in exactly one place. If Clerk's API changes or pricing makes migration necessary, this is the only package that needs to be rewritten.

`@agency/auth-portal` encapsulates Better Auth configuration and the Drizzle adapter connection so that every client portal gets the same auth session behavior. Plugin configuration for 2FA, RBAC, and organization management lives here.

`@agency/email-service` must abstract provider differences so app code calls `sendTransactionalEmail()` without knowing which provider handles delivery. Provider selection logic lives entirely inside this package.

`@agency/analytics` must not initialize any tracker until consent state is resolved. In EU contexts, this means the Plausible script and PostHog SDK are loaded conditionally after `@agency/compliance` signals the appropriate consent level, coordinated through `@agency/analytics-consent-bridge`.

`@agency/lead-capture` owns the full lead lifecycle on the front end: form rendering, validation, submission, spam protection (Cloudflare Turnstile), and handoff to the CRM. It must not embed business logic about what happens to the lead after submission — that belongs in the app or in a dedicated service.

***

## Public API and exports — why this is architecturally critical

Every shared package needs an explicit public API defined through the `exports` field in `package.json`. Without it, apps and AI coding agents can import any file inside `src/` directly using path-based imports that bypass the intended API surface. When you later refactor that file, rename a utility, or reorganize the internal package structure, those direct path imports break silently across every app that used them.

A well-formed package standard:

```json
{
  "name": "@agency/ui-design-system",
  "version": "0.1.0",
  "private": true,
  "exports": {
    ".": "./src/index.ts",
    "./button": "./src/components/ui/button.tsx",
    "./card": "./src/components/ui/card.tsx",
    "./form": "./src/components/ui/form.tsx",
    "./table": "./src/components/ui/table.tsx",
    "./styles.css": "./src/styles.css"
  },
  "dependencies": {
    "@agency/core-types": "workspace:*",
    "@agency/ui-theme": "workspace:*"
  },
  "devDependencies": {
    "@agency/config-eslint": "workspace:*",
    "@agency/config-typescript": "workspace:*",
    "@agency/test-setup": "workspace:*"
  },
  "publishConfig": {
    "access": "restricted"
  }
}
```

The `publishConfig.access: "restricted"` setting means if these packages ever move to a private npm registry, they will not accidentally be published publicly.

***

## MCP server for AI tooling

`@agency/tools-mcp-server` (task `g0`) is a custom Model Context Protocol server that exposes repo-specific tools to AI coding agents operating in Cursor, Windsurf, and other MCP-compatible clients. Its purpose is to give agents structured access to project context — package manifests, ADRs, task statuses, and dependency graphs — without requiring them to read and reason over raw files independently.

This package lives in `tools/mcp-server/` rather than `packages/` because it is development infrastructure, not a shared library consumed by applications. It is not deployed to production. Build this package after the repo has at least 15–20 packages and the friction of agents misreading package boundaries becomes measurable.

***

## Governance and operations

### Why governance must start on day one

The monorepo should be governed as if it will reach enterprise scale, even if the initial team is small. Code ownership, versioning, documentation, testing, and agent rules are not "later cleanup" — they are structural decisions that become dramatically harder to retrofit once the repo is large and many apps depend on patterns that were never formalized.

### Versioning and releases with Changesets

Use **Changesets** for all internal package versioning even if nothing is being published to a registry. Version numbers communicate breaking change intent to every developer and every AI agent.

The workflow: every PR that changes a shared package must include a changeset file generated by `pnpm changeset`. The CI pipeline validates that changeset files exist for qualifying PRs. When changes merge to main, the Changesets GitHub Action opens a "Version Packages" PR that bumps version numbers, updates changelogs, and replaces `workspace:*` specifiers with real version ranges.

Versioning guidance by change type:

- **Patch**: Bug fix, performance improvement, or internal refactor that does not change the public API.
- **Minor**: New export, new component, new utility, or new configuration option that is fully backward-compatible.
- **Major**: Any change to the public API — renamed export, removed utility, changed function signature, changed required prop, changed database schema shape.

### CI/CD pipeline

```yaml
# .github/workflows/ci.yml
name: CI
on:
  push:
    branches: [main]
  pull_request:
    types: [opened, synchronize]

jobs:
  build:
    name: Build, Lint, and Test
    runs-on: ubuntu-latest
    timeout-minutes: 20
    env:
      TURBO_TOKEN: ${{ secrets.TURBO_TOKEN }}
      TURBO_TEAM: ${{ vars.TURBO_TEAM }}
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0          # required for Turborepo affected detection
      - uses: pnpm/action-setup@v3
        with:
          version: 10.33.0        # match packageManager field exactly
      - uses: actions/setup-node@v4
        with:
          node-version: 24        # match .nvmrc
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      - run: pnpm turbo build lint test typecheck
```

The `fetch-depth: 0` checkout is required because Turborepo needs full git history to determine which packages changed relative to the base branch. The pnpm version in this file must match the `packageManager` field in root `package.json` exactly (10.33.0). The Node version must match `.nvmrc` (24.x).

**Turborepo remote caching** is the single highest-leverage performance investment in the pipeline. Enable it with `TURBO_TOKEN` and `TURBO_TEAM` environment variables in GitHub Actions. This is free on all Vercel plans.

### Testing strategy

The testing pyramid for shared packages must cover three levels: isolated unit tests, at least one integration test in a real consumer context, and targeted smoke tests through an actual app when package changes could affect runtime behavior.

Use **Vitest** for unit tests across all packages. Use **Testing Library** for integration tests on UI components. Use **Playwright** for end-to-end tests on complete app flows (task `e5` creates the dedicated Playwright E2E app).

For UI component development, **Ladle** is recommended as the lighter, faster story environment. **Storybook** is the upgrade path if formal component documentation or client-facing design handoff is required.

### Documentation standard

Every shared package requires:
- `README.md` explaining the package's purpose, consumers, installation, and at least one usage example
- `CHANGELOG.md` generated and maintained by Changesets
- `package.json` with a complete `exports` field
- Local test scripts runnable with a single pnpm command
- At least one usage example showing the expected import pattern

This documentation serves two audiences simultaneously: human developers and AI coding agents. A well-documented package dramatically reduces the rate at which agents import incorrect paths or generate code that uses the package incorrectly.

### Ownership and CODEOWNERS

| Area | Owner | Review responsibility |
|---|---|---|
| `packages/config/` | Platform owner | ESLint correctness, TypeScript base config, import boundary rules |
| `packages/core/` | Senior full-stack lead | Utility purity, type quality, preventing business-logic leakage |
| `packages/ui/` | Frontend lead / design engineer | Accessibility, visual consistency, component API stability |
| `packages/marketing/` | Frontend lead | SEO correctness, compliance rules, Core Web Vitals targets |
| `packages/data/` | Backend or data owner | Schema changes, migrations, `client_id` scoping |
| `packages/auth/` | Security-aware senior developer | Session security, RBAC correctness, auth flow coverage |
| `packages/communication/` | Project or product owner | Email template correctness, notification reliability |
| `packages/analytics/` | Frontend lead | Analytics event contracts, consent integration |
| `packages/experimentation/` | Product owner | Feature flag governance, experiment validity |
| `packages/lead-capture/` | Marketing lead | Form UX, validation rules, CRM integration correctness |
| `packages/testing/` | Platform or QA owner | Fixture quality, mock factory correctness |
| `apps/internal-tools/` | Internal tools lead | CRM, invoicing, project tracker business logic |
| `apps/client-sites/` | Per-client project lead | Client data isolation, brand compliance, deployment config |
| `apps/agency-website/` | Marketing lead + frontend lead | SEO correctness, performance budgets, conversion tracking |
| `.github/workflows/` | Platform owner | CI correctness, deployment safety, secret management |
| `ARCHITECTURE.md`, `DEPENDENCY.md` | Tech lead | Version decisions, structural changes |

***

## AI agent rules (docs/AGENTS.md)

The `docs/AGENTS.md` file must be explicit, unambiguous, and treated as a hard constraint. AI agents (Cursor, Windsurf, Claude) operating in this monorepo without these rules will make structurally correct-looking but architecturally incorrect changes that compound into technical debt silently. Maintain this file as a living document — update it every time a new failure mode is observed.

The file must contain at minimum:

**Reading requirements before touching any shared package:**
- Read the package's `README.md` and `CHANGELOG.md` before generating any code.
- Read the package's `package.json` `exports` field. Never import from a path not listed in `exports`.
- Read `ARCHITECTURE.md` for the full dependency flow before adding any import.
- Read `DEPENDENCY.md` for pinned versions before installing any package.

**Change rules:**
- Never rename, remove, or change the signature of an exported function, component, type, or constant without a `major` changeset entry.
- Never add an import from a higher-level package domain. The dependency flow is `config/core → marketing/data/auth/communication/ui → analytics/experimentation/lead-capture → apps`.
- Never introduce a circular dependency. If you find yourself needing package A inside package B and B is already imported by A, stop and explain the design problem.
- Always add or update tests when modifying a shared package.
- Always use `workspace:*` for internal dependencies. Never use relative path imports to cross package boundaries.
- Never use `latest` as a version specifier. Check `DEPENDENCY.md` for the pinned version.
- Use the `tasks` key in `turbo.json`, not `pipeline`. Turborepo 2.x removed `pipeline`.

**Scope discipline:**
- Use filtered commands: `pnpm turbo build --filter=@agency/[changed-package]...`
- When scaffolding a new client site or internal tool, use the generator in `tools/generators/`.
- Never commit environment variables, API keys, or secrets.
- Treat any change to `packages/config/`, `packages/data/database/`, or `packages/auth/` as high risk. These packages have broad blast radius.

***

## Data architecture and client isolation

### The three isolation patterns

**Pattern 1 — Row-level client scoping (recommended default)**: Every table that holds client-specific data includes a non-nullable `client_id` UUID column. Every query module in `@agency/data-db` accepts a `client_id` parameter and includes it in every `WHERE` clause. The TypeScript type system enforces this by requiring `client_id` as a parameter in every query function that operates on client data.

**Pattern 2 — Schema-level tenant isolation (for client portals)**: Each client portal stores user-generated data in a PostgreSQL schema named after the client, with Drizzle's schema functions wrapping the client-specific tables. Migrations run independently per schema. This is appropriate when regulatory requirements demand stronger isolation than row-level scoping provides.

**Pattern 3 — Database branching per environment (Neon-specific)**: Use Neon's database branching feature to create isolated branches for each developer and each pull request. Branches are created automatically at PR open and destroyed at PR merge. This is a development workflow pattern, not a security isolation pattern.

### Migration discipline

All schema migrations must be generated by Drizzle Kit from the TypeScript schema definition — never written by hand unless the migration requires a data transformation that Drizzle cannot express. A migration that drops a column, renames a table, or changes a foreign key constraint requires a major changeset entry and a documented rollback plan. Destructive schema changes must be deployed in two phases: first add the new structure alongside the old, then remove the old structure after all consumers have migrated.

***

## Scaling plan

### Seed stage (1–10 apps, 1–3 developers)

Priority: clarity and velocity over comprehensive governance.

- Keep packages few. Start with only `config`, `core-types`, `core-utils`, `ui-design-system`, and `seo`. Add others when actual duplication appears.
- Use Turborepo with pnpm and affected-only CI from day one.
- Enable remote caching immediately — zero-configuration with Vercel.
- Write `README.md` and `package.json` exports for every package before the first consumer imports it.
- Start `AGENTS.md` and `CODEOWNERS` on the first day.

### Growth stage (10–30 apps, 3–8 developers)

Priority: formalize what is working, automate what is manual.

- Introduce Changesets and require changeset entries for all shared package PRs.
- Add package generators in `tools/generators/` so new client sites and internal tools arrive pre-configured.
- Begin writing ADRs in `docs/architecture/` for every non-obvious technical decision.
- Add the `auth/` packages as the first client portals appear.
- Build `@agency/tools-mcp-server` when agent boundary violations become a recurring issue.

### Scale stage (30–50 apps, 8–20 developers)

Priority: enforce what cannot be reviewed manually.

- Move to Nx for strict domain tag enforcement. Turborepo has served well but at this package count, import violations are too numerous to catch in code review.
- Implement Nx's project graph visualization as a shared artifact.
- Add per-package consumer smoke tests that run against a real app on every package change.
- Consider a private npm registry for compiled package distribution.

### Enterprise stage (50+ apps or 3+ active independent teams)

Priority: governance, compliance, and distributed execution.

- Nx distributed task execution (DTE) distributes CI tasks across multiple agents.
- Strict module boundary policies through Nx tags.
- Private registry publishing with semantic version ranges rather than `workspace:*`.
- Formal audit logging for schema changes, auth configuration changes, and client data access patterns.

***

## Common failure modes and how to avoid them

**The shared package becomes a dumping ground.** Symptom: `@agency/core-utils` starts containing database query helpers, React components, and API fetch wrappers. Solution: enforce the domain taxonomy at code review. If a utility does not fit cleanly into an existing domain, it belongs in the app that uses it.

**Breaking changes ship silently.** Symptom: a developer renames an exported utility and apps that used the old name break unexpectedly. Solution: enforce changeset requirements in CI — PRs that modify shared packages without a changeset file should not be mergeable.

**CI becomes too slow to be useful.** Symptom: the pipeline takes 30+ minutes and developers start bypassing it. Solution: verify that Turborepo remote caching is correctly configured and achieving high cache hit rates. A hit rate below 50% means environment variable hashing is incorrect or cache invalidation is too aggressive.

**AI agents break package boundaries.** Symptom: a Cursor or Windsurf session imports directly from `packages/data/database/src/internal/client.ts` rather than from the package's public `exports` field. Solution: keep `docs/AGENTS.md` current, ensure `@agency/config-eslint` import restriction rules are checked automatically, and include import correctness as an explicit review criterion in the CODEOWNERS process.

**Client data bleeds across clients.** Symptom: a query in the CRM returns records belonging to a different client because a developer forgot to pass `client_id`. Solution: enforce `client_id` as a required TypeScript parameter in every query function that operates on client-owned data. Include a CI test that mocks two clients and asserts that querying as client A never returns data seeded for client B.

**Version drift between tooling configs.** Symptom: the Node version in `.nvmrc`, the CI yaml, and `engines` in `package.json` differ; the pnpm version in `packageManager` and the CI `pnpm/action-setup` step differ. Solution: `DEPENDENCY.md` is the single source of truth. Every reference to a version anywhere in the repo must match `DEPENDENCY.md`. Run a version audit as part of the CI pipeline.

**Turborepo `pipeline` key used in new configs.** Symptom: agents scaffold `turbo.json` using the `pipeline` key from outdated documentation or training data. Turborepo 2.x requires the `tasks` key. Solution: the `@agency/config-eslint` package should include a custom rule or the `docs/AGENTS.md` must explicitly call out this breaking change.

***

## Final recommendation

Start with a **domain-grouped pnpm/Turborepo monorepo** that uses **explicit package scopes, public `exports` fields, `workspace:*` internal dependencies, Turborepo remote caching from day one, Changesets, CODEOWNERS, and strong AI agent rules baked into `docs/AGENTS.md`**. Keep the package system small and strictly disciplined at launch — six to eight packages to begin — but shape every structural decision so that Nx boundary enforcement, private-registry publishing, per-package consumer smoke tests, stronger ownership, codemods, and multi-team governance can be added later without restructuring.

The agency's long-term competitive advantage is not any individual client project — it is the accumulated shared infrastructure that makes each new project faster, more consistent, and more maintainable than the last. That infrastructure compounds only if the monorepo's architecture prevents it from degrading into a collection of poorly-connected apps that happen to share a Git root. The discipline described in this document — dependency flow rules, explicit exports, versioning discipline, CI rigor, and agent guardrails — is what keeps the infrastructure compounding rather than corroding.