# Agency Monorepo Architecture
*A strategic, fully elaborated reference for building, scaling, and governing a production-grade agency monorepo — written for a non-developer owner working through AI coding tools like Cursor and Windsurf.*

---

## What a monorepo is and why it matters for an agency

A monorepo is a single Git repository that houses every application, shared library, configuration file, and internal tool your agency owns. It is not a monolithic application — each app inside still deploys independently and can fail without affecting the others. The distinction matters because it means you get the organizational benefits of everything being in one place without surrendering the isolation that keeps one client's project from ever touching another's.

The practical agency case for this architecture is strong. When you manage a design system, a CRM, invoicing tooling, a client portal framework, and a dozen client websites simultaneously, keeping them in separate repositories means that a shared button component, a utility function, or a database schema change must be coordiously coordinated across many codebases. In a monorepo, that same change is a single pull request that updates every consumer at once and cannot be merged until every automated check passes. Companies at vastly different scales — Google, Meta, Airbnb, Stripe, and Dropbox — have invested in monorepos for exactly this reason: shared code, atomic changes, and unified tooling compound in value with every project you add.

---

## Final stack

The recommended default stack is: **pnpm workspaces**, **Turborepo** for task orchestration and caching, **Next.js App Router** for all apps, **Tailwind CSS + shadcn/ui** for UI, **Sanity** for CMS-backed sites, **Neon + PostgreSQL + Drizzle ORM** for application data, **Clerk** for internal tools, **Better Auth** as the strongest self-hosted authentication option for client-facing portals, **React Email + Resend** for default transactional email with **Postmark** as the premium deliverability alternative, **Plausible** for marketing analytics, **PostHog** for product analytics and feature flags, **GitHub Actions** for CI/CD with Turborepo remote caching, and **Vercel** as the primary hosting target, with **Railway** or **Render** reserved for workloads that need long-running jobs or persistent server processes that serverless cannot handle.

### Why each choice was made

**pnpm** is the right workspace package manager because it uses a content-addressable store with symlinks rather than duplicating packages in each node_modules folder, which means disk usage stays low even as the repo grows to dozens of apps. Its strict resolution algorithm also prevents phantom dependencies — situations where your code accidentally relies on a package that was never explicitly listed as a dependency, which creates silent, hard-to-debug failures in production.

**Turborepo** is the right task runner for the seed and growth stages because it has minimal operational overhead, is built and maintained by Vercel (meaning it integrates without friction with the deployment target), and delivers up to 96% improvement in Time to First Task for large repos through intelligent caching and parallelization compared to running tasks serially. Turborepo understands which packages have changed and runs only the affected tasks — so modifying the CRM never triggers a rebuild of a client landing page that shares nothing with it. Its remote caching feature, described in detail in the CI/CD section, means these saved artifacts are shared across every developer's machine and every CI run rather than being discarded after each session.

**Nx** is not recommended at launch but is the correct upgrade path once the repo reaches 30 or more apps or multiple active development teams. Where Turborepo prioritizes speed and simplicity, Nx adds architectural governance: explicit module boundary enforcement through tags and constraints, a project graph that visualizes every dependency relationship in the repo, distributed task execution across many CI agents, and a plugin system for generating new apps and packages from templates. Teams managing large enterprise JavaScript monorepos with many applications benefit from Nx's architectural tooling; teams focused on performance and build speed prefer Turborepo's lightweight pipeline model. The domain-grouped folder structure recommended below is intentionally compatible with Nx tag-based boundaries so the migration, when it arrives, requires no restructuring.

**Next.js App Router** is the right framework for every app because it supports server components, server actions, streaming, and static generation from a single unified mental model. Using one framework across the entire repo means every developer can contribute to every app, shared packages never need separate builds for different framework targets, and deployment to Vercel is zero-configuration.

**shadcn/ui** is the correct UI library choice over a pre-compiled component library because it copies component source directly into your repository rather than importing a black-box dependency. You own and can modify every component without forking a third-party package. shadcn now supports monorepo workflows directly, making the design system package setup straightforward rather than requiring manual workarounds.

**Neon** is the right database host because it provides true serverless PostgreSQL — connection pooling, branching for development, and pay-per-compute pricing that suits both low-traffic client portals and high-traffic internal tools from a single platform. Neon's database branching feature is particularly valuable in an agency context: developers and AI coding agents can create isolated database branches for feature work without polluting shared staging environments, and those branches are destroyed automatically when the branch is merged.

**Drizzle ORM** pairs naturally with Neon because it is lightweight, TypeScript-first, and generates typed query results without a code generation step at runtime. Schema definitions, migration files, and query modules can all live in the shared `@agency/data-db` package, meaning every internal tool works from a single operational data model.

**Clerk** is the right choice for internal tools because those apps have predictable, low user counts, the per-MAU pricing stays manageable, and Clerk's pre-built UI components and managed backend eliminate authentication maintenance entirely in the apps where developer productivity is the highest priority.

**Better Auth** is the right choice for client-facing portals because it is fully self-hosted and framework-agnostic, meaning your users' data and session logic never leave your own database. Better Auth has a native Drizzle adapter, a shadcn-compatible component library, and a plugin system covering 2FA, passkeys, RBAC, impersonation, and organizations — matching Clerk's feature breadth at zero per-MAU cost and without vendor lock-in. Better Auth reached its v1.0 stable release in 2025 and is gaining fast adoption in production SaaS starters as a genuine Clerk alternative for teams that need data ownership. The key practical difference: if a client portal grows to tens of thousands of monthly active users, Clerk's pricing compounds significantly; Better Auth's cost is a fixed infrastructure line. If a client portal ever requires enterprise SSO, SCIM directory sync, or custom identity provider federation, WorkOS is the correct escalation path from Better Auth rather than from Clerk.

**React Email + Resend** is the right email stack because React Email lets you build transactional templates as React components with full TypeScript safety and a local preview server, and Resend's API integrates directly with that toolchain. Postmark is the premium swap when deliverability to enterprise inboxes is contractually required by a client, because Postmark has historically led the industry on inbox placement rates. The `@agency/email-service` abstraction package makes this provider swap a configuration change rather than a code change.

**Plausible + PostHog** gives you a clean two-analytics architecture: Plausible handles marketing site analytics with no cookie consent requirement and GDPR compliance by default; PostHog handles product analytics, session replay, and feature flags inside authenticated applications where understanding user behavior at depth is worth the additional instrumentation.

---

## Repository shape

Use one repository with **apps**, **packages**, **tools**, **docs**, and **GitHub workflow** folders, organized so that `packages/` is grouped by domain rather than by technical role. Domain grouping means every folder name communicates business intent rather than implementation detail, and it maps cleanly to the Nx boundary constraints that will be applied when the repo reaches scale.

```text
agency-monorepo/
├── apps/
│   ├── agency-website/
│   ├── client-sites/
│   │   ├── [client]-landing/
│   │   ├── [client]-website/
│   │   └── [client]-portal/           # only when a client requires a logged-in experience
│   └── internal-tools/
│       ├── crm/
│       ├── project-tracker/
│       ├── invoicing/
│       ├── reporting/
│       └── operations-dashboard/
│
├── packages/
│   ├── ui/
│   │   ├── design-system/             # @agency/ui-design-system
│   │   ├── icons/                     # @agency/ui-icons
│   │   └── theme/                     # @agency/ui-theme
│   ├── core/
│   │   ├── shared-utils/              # @agency/core-utils
│   │   ├── shared-types/              # @agency/core-types
│   │   ├── constants/                 # @agency/core-constants
│   │   └── hooks/                     # @agency/core-hooks
│   ├── data/
│   │   ├── database/                  # @agency/data-db
│   │   ├── cms-schemas/               # @agency/data-cms
│   │   └── api-client/                # @agency/data-api-client
│   ├── communication/
│   │   ├── email-templates/           # @agency/email-templates
│   │   ├── email-service/             # @agency/email-service
│   │   └── notifications/             # @agency/notifications
│   ├── auth/
│   │   ├── internal/                  # @agency/auth-internal  (Clerk config + helpers)
│   │   └── portal/                    # @agency/auth-portal    (Better Auth config + helpers)
│   ├── config/
│   │   ├── eslint-config/             # @agency/config-eslint
│   │   ├── typescript-config/         # @agency/config-typescript
│   │   └── tailwind-config/           # @agency/config-tailwind
│   └── testing/
│       ├── fixtures/                  # @agency/test-fixtures
│       └── setup/                     # @agency/test-setup
│
├── tools/
│   ├── generators/                    # pnpm scripts to scaffold new apps and packages
│   ├── codemods/                      # automated migration scripts for breaking changes
│   └── scripts/                       # one-off operational scripts (db seed, bulk deploy, etc.)
│
├── docs/
│   ├── AGENTS.md                      # rules for AI coding agents
│   ├── architecture/                  # ADRs (Architecture Decision Records)
│   ├── onboarding/                    # new contributor and new client setup guides
│   ├── package-guides/                # per-package usage documentation
│   └── decisions/                     # rationale log for non-obvious technical choices
│
├── .changeset/
├── .github/
│   ├── workflows/
│   │   ├── ci.yml
│   │   ├── release.yml
│   │   └── preview.yml
│   └── CODEOWNERS
├── package.json
├── pnpm-workspace.yaml
├── turbo.json
└── README.md
```

### Why the structure is shaped this way

The `apps/` layer stays intentionally simple: the agency website is your public brand property, client sites are isolated deployable units, and internal tools are where shared operational logic compounds most aggressively over time. Each client-facing app must remain a separate deployment target with separate environment variable storage so one client's failure, secret configuration, or data never affects another's project. This isolation is not just a security concern — it also means a single misbehaving Vercel deployment cannot trigger a cascade that takes down other sites.

The `packages/auth/` domain was added as a separate top-level domain rather than folding authentication helpers into `core/`. This is because authentication configuration, middleware patterns, and session handling are large enough that mixing them with pure utility functions would make the `core/` domain structurally incoherent. Having a dedicated `auth/` domain also makes it obvious at a glance which package governs which app surface and prevents internal tools and client portals from accidentally sharing authentication code that was written for only one context.

The `tools/` directory houses generators and codemods — automated scripts that create new packages and apps from templates, and that migrate existing code when a shared API changes. Investing in generators early prevents structural drift: when a developer scaffolds a new client site with a generator, it arrives with the correct package.json shape, tsconfig, Tailwind configuration, and exports field rather than being copy-pasted from a neighboring app and missing half the standard wiring.

The `docs/AGENTS.md` file is a first-class architectural artifact, not an afterthought. Its purpose is to give AI coding agents explicit, project-specific rules that override their default behavior. Without it, agents working inside a shared package will import internal paths, change public APIs without updating changelogs, introduce circular dependencies, and generate code that works locally but breaks other consumers. The rules in that file are detailed in the governance section.

---

## Shared packages

### The governing principle

A package exists only when two or more consumers truly share the same code without distortion. Distortion means one consumer needs a slightly different version of the logic and the package has been twisted to accommodate both use cases in a single export, making it harder to understand and maintain for everyone. When that happens, the code belongs in the apps that use it, not in a shared package.

Treat every shared package as its own product with consumers, documentation, tests, a public API surface, and a version history. This mindset prevents the "shared folder of random things" sprawl that kills long-term maintainability in monorepos. A package that cannot answer the question "who consumes this and what exact problem does it solve for them?" should not exist.

### Package taxonomy

| Domain | Folder | Package name | Purpose |
|---|---|---|---|
| UI | `packages/ui/design-system` | `@agency/ui-design-system` | shadcn/ui-based components, layout primitives, accessibility-safe form and navigation shells, data tables, empty states, and skeleton loaders. |
| UI | `packages/ui/icons` | `@agency/ui-icons` | Lucide wrappers plus any custom SVG icon exports. Keeps icon dependencies isolated from the rest of the design system. |
| UI | `packages/ui/theme` | `@agency/ui-theme` | Shared design tokens, CSS custom properties, and Tailwind theme extensions. Never contains client-specific brand colors. |
| Core | `packages/core/shared-utils` | `@agency/core-utils` | Pure functions only: date formatting, string helpers, currency formatting, input validation, slug generation. No React, no database, no environment access. |
| Core | `packages/core/shared-types` | `@agency/core-types` | Shared TypeScript types and Zod schemas for domain models used across apps — client records, project statuses, invoice states, user roles. |
| Core | `packages/core/constants` | `@agency/core-constants` | Enums, error codes, route key maps, and fixed configuration values. Anything that would otherwise be a "magic string" scattered across multiple apps. |
| Core | `packages/core/hooks` | `@agency/core-hooks` | Reusable React hooks: debounce, media query detection, outside-click detection, clipboard access, keyboard shortcut registration. No app-specific state. |
| Data | `packages/data/database` | `@agency/data-db` | Drizzle schema definitions, the database client factory, typed query modules, migration files, and seed scripts. The single source of truth for the operational data model. |
| Data | `packages/data/cms-schemas` | `@agency/data-cms` | Reusable Sanity schema fragments and shared content models — blog post structure, SEO fields, image gallery schema — used across multiple Sanity-backed client sites. |
| Data | `packages/data/api-client` | `@agency/data-api-client` | Typed fetch wrappers and API client helpers for internal service-to-service calls. Only warranted once two or more apps genuinely call the same internal API. |
| Communication | `packages/communication/email-templates` | `@agency/email-templates` | React Email templates and reusable email layout components: transactional receipts, notification digests, password reset flows. |
| Communication | `packages/communication/email-service` | `@agency/email-service` | Send-layer abstraction over Resend and Postmark. App code calls `sendEmail()` and the provider is determined by environment configuration, not by the calling app. |
| Communication | `packages/communication/notifications` | `@agency/notifications` | Slack, Discord, and webhook helpers plus in-app notification plumbing when that requirement emerges. |
| Auth | `packages/auth/internal` | `@agency/auth-internal` | Clerk configuration, middleware helpers, and typed session utilities for internal tools. |
| Auth | `packages/auth/portal` | `@agency/auth-portal` | Better Auth configuration, Drizzle adapter setup, session helpers, and organization management utilities for client-facing portals. |
| Config | `packages/config/eslint-config` | `@agency/config-eslint` | Shared ESLint rules including architectural import restrictions that enforce the dependency flow. |
| Config | `packages/config/typescript-config` | `@agency/config-typescript` | Base tsconfig files for apps and internal packages. Includes a strict base, a Next.js app variant, and a library-only variant. |
| Config | `packages/config/tailwind-config` | `@agency/config-tailwind` | Shared Tailwind preset and token mapping. All apps extend this rather than maintaining separate Tailwind configurations. |
| Testing | `packages/testing/fixtures` | `@agency/test-fixtures` | Shared mock factories, seed builders, and test data generators used across multiple package and app test suites. |
| Testing | `packages/testing/setup` | `@agency/test-setup` | Vitest, Testing Library, and Playwright shared setup and configuration files. |

### What to build first

Build the **config**, **core types**, **core utils**, and **UI design system** packages first because every later package and application depends on those foundations being stable. Add the **database** package as soon as the first internal tool needs persistent storage. Add **email templates** and **email service** when the first transactional flows exist. Add **CMS schemas** when the first Sanity-backed client site arrives. Add **API client**, **notifications**, and **testing** packages only when duplication actually appears in two or more consumers. Package count should grow from observed reuse, not from speculation about what might be needed later.

### What belongs where — detailed rules

`@agency/ui-design-system` contains generic components only: buttons, cards, form inputs and labels, navigation shells, modals, drawers, data tables, empty states, skeletons, toasts, and accessibility-safe primitives built from shadcn/ui and its Radix UI foundations. A component belongs here if and only if it can appear in both an internal tool and a client-facing portal without modification. Client-specific layout sections, branded hero components, and one-off marketing elements never belong in this package.

`@agency/ui-theme` contains design tokens — spacing scale, typographic scale, radius values, shadow levels, and the base color palette — expressed as CSS custom properties in a `theme.css` file using Tailwind v4's `@theme` directives. This CSS file is imported by consuming apps rather than extending a JavaScript preset. It does not contain client-specific brand colors. Those live inside individual client app directories so that one client's purple palette can never accidentally bleed into another client's site.

`@agency/core-utils` contains pure functions with zero side effects and zero dependencies outside of `@agency/core-types`. Pure means no React, no database access, no network calls, no environment variable reads. A function is pure if calling it with the same arguments always returns the same result. If the function needs external state or produces a side effect, it belongs somewhere else.

`@agency/core-types` sits at the base of the entire dependency graph and should be kept dependency-light. Its Zod schemas define the canonical shape of domain entities — what a "project" looks like, what valid invoice states exist — and every other package that imports these types gets automatic TypeScript inference from a single authoritative source. When a domain model changes, the type change propagates to every consumer, and TypeScript's compiler surfaces every place that needs updating before a single line ships to production.

`@agency/data-db` centralizes the Drizzle schema, migration files, and typed query modules so all internal tools share one operational data model. This package must enforce strict client data isolation. Every table that holds client-specific data must include a `client_id` column, and every query module must accept and enforce a `client_id` filter so that one client's data cannot ever be returned in a query belonging to another client. This scoping is non-negotiable and must be code-reviewed on every PR that touches this package. The database client factory in this package should accept a connection string at instantiation time so apps can use separate connection strings per environment without modifying package internals.

`@agency/auth-internal` encapsulates all Clerk configuration so that the Clerk SDK import and middleware pattern exist in exactly one place. If Clerk's API changes or Clerk's pricing makes migration necessary, this is the only package that needs to be rewritten rather than every internal tool.

`@agency/auth-portal` encapsulates Better Auth configuration and the Drizzle adapter connection so that every client portal gets the same auth session behavior. Plugin configuration for 2FA, RBAC, and organization management lives here so portal apps stay thin and the authentication logic can be audited and updated from a single location.

`@agency/email-service` must abstract provider differences so app code calls `sendTransactionalEmail({ template, recipient, data })` without knowing which provider handles delivery. The provider selection logic — Resend by default, Postmark when a `POSTMARK_API_KEY` environment variable is present — lives entirely inside this package. This prevents the day when you want to improve deliverability for a specific client from requiring changes to application code.

### Internal dependency flow — the rules that must never be broken

Enforce a strict low-to-high dependency flow: **config and core → data, communication, auth, and UI → apps**. In plain terms: packages in `core/` may not import from packages in `ui/`, `data/`, `auth/`, or `communication/`. Packages in `data/` may import from `core/` but not from `ui/` or `auth/`. Apps may import from any package domain. No package may ever import from an app.

This flow matters because circular dependencies — where package A depends on package B which depends on package A — cause build failures, unexpected module evaluation ordering, and extremely confusing runtime errors that are hard to trace back to their source. The ESLint configuration in `@agency/config-eslint` should include import restriction rules that enforce this flow automatically on every PR rather than relying on code reviewers to catch violations manually.

In every package's `package.json`, internal dependencies must use `workspace:*` as the version specifier. This tells pnpm to resolve internal packages from the local filesystem during development and lets Changesets replace those specifiers with correct version numbers during the publishing flow.

### Public API and exports — why this is architecturally critical

Every shared package needs an explicit public API defined through the `exports` field in `package.json`. Without it, apps and AI coding agents can import any file inside `src/` directly using path-based imports that bypass the intended API surface. When you later refactor that file, rename a utility, or reorganize the internal package structure, those direct path imports break silently across every app that used them. With explicit exports, the package author controls what is public and what is internal implementation detail.

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

The `publishConfig.access: "restricted"` setting means if these packages ever move to a private npm registry for external distribution, they will not accidentally be published publicly. This is a safeguard that costs nothing to add now.

### What happens when a package needs to change its public API

A changed public API is a major version bump, a changeset entry with a `major` classification, and a migration note for consumers. The process is: write the new API alongside the old one, mark the old export as deprecated with a TypeScript `@deprecated` JSDoc comment, give consumers one release cycle to migrate (documented in the changelog), then remove the old export in the following major bump. This process sounds formal for a small team, but it is what prevents a package change from silently breaking a client site that was not in scope for that week's work.

---

## Governance and operations

### Why governance must start on day one

The monorepo should be governed as if it will reach enterprise scale, even if the initial team is small. Code ownership, versioning, documentation, testing, and agent rules are not "later cleanup" — they are structural decisions that become dramatically harder to retrofit once the repo is large and many apps depend on patterns that were never formalized. A repo that defers governance typically develops inconsistent package shapes, undocumented APIs, no automated change history, and packages that only one person understands. Those properties are expensive when team members change and catastrophic when AI coding agents are primary contributors.

### Versioning and releases with Changesets

Use **Changesets** for all internal package versioning even if nothing is being published to a registry. Version numbers communicate breaking change intent to every developer and every AI agent working in the repo. They create an auditable changelog that makes it possible to understand, months later, why a particular app broke after a dependency update.

The workflow is: every PR that changes a shared package must include a changeset file — a small markdown file generated by running `pnpm changeset` that describes what changed and classifies it as patch, minor, or major. The CI pipeline validates that changeset files exist for qualifying PRs. When changes merge to main, the Changesets GitHub Action opens a "Version Packages" PR that bumps version numbers, updates changelogs, and replaces `workspace:*` specifiers with real version ranges in the affected packages. Merging that PR finalizes the release.

Versioning guidance by change type:

- **Patch**: Bug fix, performance improvement, or internal refactor that does not change the public API or behavior visible to consumers.
- **Minor**: New export, new component, new utility function, or new configuration option that is fully backward-compatible.
- **Major**: Any change to the public API — renamed export, removed utility, changed function signature, changed required prop, changed database schema shape, or anything that requires a consumer to update their code.

### CI/CD pipeline with Turborepo remote caching

The GitHub Actions CI pipeline is the quality gate for the entire monorepo. Its design must balance thoroughness with speed — a pipeline that takes 45 minutes to run trains developers to skip it.

**Turborepo remote caching** is the single highest-leverage performance investment in the pipeline. When Turborepo runs a task — building a package, running tests, type-checking — it stores the task output as an artifact keyed to a hash of all the inputs (source files, dependencies, environment variables). On the next run, if nothing has changed, it replays the cached output instead of re-executing the task. Remote caching extends this to the cloud so that cache hits are shared across every developer's local machine and every CI runner. In practice, this means a CI run that rebuilds only the packages actually affected by a PR, and replays cached results for everything else, completing in seconds rather than minutes. Remote caching is free for all Vercel plans subject to fair use guidelines. Enabling it requires two environment variables in the GitHub Actions configuration: `TURBO_TOKEN` (a scoped access token from the Vercel dashboard) and `TURBO_TEAM` (your Vercel team slug).

The pipeline shape should be:

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
          version: 9
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      - run: pnpm turbo build lint test typecheck
        # Turborepo parallelizes these and skips unchanged packages
```

The `fetch-depth: 0` checkout is required because Turborepo needs full git history to determine which packages changed relative to the base branch. Omitting this results in every task running on every PR rather than only the affected tasks, eliminating the benefit of affected-only execution.

For teams not yet on Vercel or preferring not to use Vercel's remote cache, a self-hosted cache server is achievable using open-source implementations (`turbo-remote-cache` for Node.js or `turborepo-remote-cache` for Go), both of which support S3-compatible storage. This is relevant for compliance environments where build artifacts cannot leave company-controlled infrastructure.

### Testing strategy

The testing pyramid for shared packages must cover three levels: isolated unit tests, at least one integration test in a real consumer context, and targeted smoke tests through an actual app when package changes could affect runtime behavior across many consumers.

Use **Vitest** for unit tests across all packages because it is fast, TypeScript-native, and does not require a separate configuration layer per package. Use **Testing Library** for integration tests on UI components. Use **Playwright** for end-to-end tests on complete app flows.

For UI component development and review, **Ladle** is recommended as the lighter, faster story environment for a growing agency repo. Ladle is a React-first alternative to Storybook that starts faster and has less configuration overhead for teams that want visual review without Storybook's full documentation platform weight. If the agency's design process requires formal component documentation, client-facing design handoff, or a component library that non-developers browse, **Storybook** is the mature, more comprehensive option.

Every shared package must have test scripts runnable in isolation with `pnpm --filter @agency/[package-name] test`. The CI pipeline must run every package's tests in parallel, using Turborepo's task graph to ensure dependencies complete before dependents are tested.

### Documentation standard

Every shared package requires:

- `README.md` explaining the package's purpose, who its consumers are, how to install it, and at least one usage example
- `CHANGELOG.md` generated and maintained by Changesets
- `package.json` with a complete `exports` field
- Local test scripts that can be run with a single pnpm command
- At least one usage example that shows the expected import pattern

This documentation serves two audiences simultaneously: human developers onboarding to the repo, and AI coding agents (Cursor, Windsurf, Claude) that read package-level context before generating code. A well-documented package with clear export paths and usage examples dramatically reduces the rate at which agents import incorrect paths, hallucinate non-existent utilities, or generate code that compiles but uses the package incorrectly.

### Ownership and CODEOWNERS

Use `CODEOWNERS` to ensure that changes to shared areas automatically request review from the correct person. GitHub automatically requests CODEOWNERS for review when matching files change in a PR. The CODEOWNERS file enforces accountability without requiring manual reviewer selection on every PR.

A practical ownership map:

| Area | Owner | Review responsibility |
|---|---|---|
| `packages/ui/` | Frontend lead or design engineer | Accessibility compliance, visual consistency, component API stability, shadcn upgrade management. |
| `packages/core/` | Senior full-stack lead | Utility function purity, TypeScript type quality, preventing business-logic leakage into shared utils. |
| `packages/data/` | Backend or data owner | Schema changes, migration correctness, query safety, client_id scoping enforcement on every query. |
| `packages/auth/` | Security-aware senior developer | Session security, token handling, RBAC correctness, authentication flow coverage in tests. |
| `packages/config/` | Platform owner | ESLint rule correctness, TypeScript base config correctness, import boundary rules. |
| `packages/communication/` | Project or product owner | Email template correctness, client-facing copy, notification reliability. |
| `packages/testing/` | Platform or QA owner | Fixture quality, mock factory correctness, cross-app test consistency. |
| `apps/internal-tools/` | Internal tools lead | CRM, invoicing, and project tracker business logic integrity. |
| `apps/client-sites/` | Per-client project lead | Client data isolation, brand compliance, deployment configuration. |
| `.github/workflows/` | Platform owner | CI correctness, deployment safety, secret management. |

### AI agent rules (docs/AGENTS.md)

The `docs/AGENTS.md` file must be explicit, unambiguous, and treated as a hard constraint rather than a soft suggestion. AI agents operating in this monorepo without these rules will make structurally correct-looking but architecturally incorrect changes that compound into technical debt silently. The file should contain at minimum:

**Reading requirements before touching any shared package:**
- Read the package's `README.md` and `CHANGELOG.md` before generating any code changes.
- Read the package's `package.json` exports field to understand what is public. Never import from a path not listed in `exports`.
- Read the `CODEOWNERS` entry for the package and tag that owner for review on the PR.

**Change rules:**
- Never rename, remove, or change the signature of an existing exported function, component, type, or constant without creating a changeset entry classified as `major` and documenting the migration path in the changeset description.
- Never add a new import from a higher-level package domain (for example: never import from a `ui/` package inside a `core/` package). The dependency flow is config/core → data/auth/communication/ui → apps and must never be reversed.
- Never introduce a circular dependency between packages. If you find yourself needing to import from package A inside package B, and package B is already imported by package A, stop and explain the design problem rather than proceeding.
- Always add or update tests when modifying a shared package. A PR that changes behavior without updating tests should not be merged.
- Always use `workspace:*` for internal dependencies in `package.json`. Never use a relative path import to cross package boundaries.

**Scope discipline:**
- Use filtered commands to avoid running unnecessary tasks: `pnpm turbo build --filter=@agency/[changed-package]...` rather than building the entire repo to test a single package change.
- When scaffolding a new client site or internal tool, use the generator in `tools/generators/` rather than copying an existing app directory manually.
- Never commit environment variables, API keys, or secrets to any file in the repository.
- Treat any change to `packages/config/`, `packages/data/database/`, or `packages/auth/` as high risk. These packages have broad blast radius — a broken lint rule, a malformed migration, or a broken session helper can affect every app simultaneously.

---

## Data architecture and client isolation

Because the `@agency/data-db` package is shared across internal tools that may access data belonging to multiple clients, the isolation strategy must be explicit and enforced at the data layer — not just at the application layer.

### The three isolation patterns

**Pattern 1 — Row-level client scoping (recommended default)**: Every table that holds client-specific data includes a non-nullable `client_id` UUID column. Every query module in `@agency/data-db` accepts a `client_id` parameter and includes it in every `WHERE` clause. The TypeScript type system enforces this by requiring `client_id` as a parameter in every query function that operates on client data. This pattern is appropriate for internal tools where the agency's own developers are the users and the isolation is for organizational data hygiene rather than adversarial security.

**Pattern 2 — Schema-level tenant isolation (for client portals)**: Each client portal that stores user-generated data in a PostgreSQL schema named after the client, with Drizzle's schema functions wrapping the client-specific tables. Migrations for each schema run independently. This pattern is appropriate when portal data is sensitive enough that row-level scoping feels insufficient, or when regulatory requirements demand stronger isolation.

**Pattern 3 — Database branching per environment (Neon-specific)**: Use Neon's database branching feature to create isolated database branches for each developer and each pull request. This means a developer working on a CRM feature operates against a branch that started from a production snapshot but cannot affect production data. Branches are created automatically at PR open and destroyed at PR merge. This is not a security isolation pattern — it is a development workflow pattern that prevents staging data corruption and eliminates the "I broke the shared dev database" problem.

### Migration discipline

All schema migrations must be generated by Drizzle Kit from the TypeScript schema definition — never written by hand unless the migration requires a data transformation that Drizzle cannot express. Generated migrations must be reviewed by the `packages/data/` owner before merge. A migration that drops a column, renames a table, or changes a foreign key constraint requires a major changeset entry and a documented rollback plan. Migrations that cannot be rolled back automatically (destructive schema changes) must be deployed in two phases: first add the new structure alongside the old, verify all consumers have migrated, then remove the old structure in a follow-up deployment.

---

## Scaling plan

The monorepo must be designed around staged evolution rather than a one-time perfect architecture. Premature complexity is as damaging as deferred complexity — the goal is to add structural discipline exactly when the cost of not having it becomes real.

### Seed stage (1–10 apps, 1–3 developers)

Priority: clarity and velocity over comprehensive governance.

- Keep packages few. Start with only `config`, `core-types`, `core-utils`, and `ui-design-system`. Add others when actual duplication appears.
- Use Turborepo with pnpm and affected-only CI from day one — this pays for itself on the first week.
- Enable remote caching immediately. It is zero-configuration with Vercel and the benefit is immediate.
- Write `README.md` and `package.json` exports for every package before the first consumer app imports it.
- Start `AGENTS.md` on the first day. It is much easier to build these rules into the initial repo culture than to retrofit them after agents have already established bad patterns.

### Growth stage (10–30 apps, 3–8 developers)

Priority: formalize what is working, automate what is manual.

- Introduce Changesets and require changeset entries for all shared package PRs.
- Set up `CODEOWNERS` for every package domain.
- Make remote caching and smoke-test workflows standard on every CI run.
- Add the `auth/` package domain as the first client portals appear.
- Add package generators in `tools/generators/` so new client sites and internal tools arrive pre-configured rather than hand-assembled.
- Begin writing Architecture Decision Records (ADRs) in `docs/architecture/` for every non-obvious technical decision so future team members — human and AI — understand why the structure is what it is.

### Scale stage (30–50 apps, 8–20 developers)

Priority: enforce what cannot be reviewed manually.

- Move to Nx for strict domain tag enforcement and module boundary constraints. Turborepo has served well but at this package count, import violations are too numerous to catch in code review.
- Implement Nx's project graph visualization as a shared artifact — make the dependency graph visible so developers can see the downstream impact of a change before opening a PR.
- Add per-package consumer smoke tests that run against a real app on every package change. A change to `@agency/data-db` should trigger a test run in the CRM, the invoicing tool, and the project tracker before it merges.
- Consider a private npm registry for compiled package distribution if the team size makes `workspace:*` linking complex to manage.

### Enterprise stage (50+ apps or 3+ active independent teams)

Priority: governance, compliance, and distributed execution.

- Nx distributed task execution (DTE) distributes CI tasks across multiple agents, reducing pipeline time even for large affected scopes.
- Strict module boundary policies through Nx tags prevent teams from taking implicit cross-domain dependencies that were never reviewed or approved.
- Private registry publishing with semantic version ranges rather than `workspace:*` for cross-team packages, enabling teams to pin major versions and migrate on their own schedule.
- Formal audit logging for all schema changes, auth configuration changes, and client data access patterns.
- Dedicated platform engineering ownership for the monorepo toolchain itself.

### Launch order — the exact sequence for a new repository

1. Create the repository root with `pnpm-workspace.yaml`, `turbo.json`, root `package.json`, `.gitignore`, and `README.md`.
2. Set up `packages/config/eslint-config`, `packages/config/typescript-config`, and `packages/config/tailwind-config` with shared base configurations.
3. Set up `.github/workflows/ci.yml` with Turborepo remote caching enabled from the first CI run.
4. Add `CODEOWNERS` and `docs/AGENTS.md` before any shared packages exist. These files shape behavior from the first contributor and the first agent session.
5. Build `@agency/core-types` with the foundational domain types (client, project, invoice, user role).
6. Build `@agency/core-utils` with the formatting and validation functions those types require.
7. Build `@agency/core-constants` with enums, route keys, and error codes.
8. Stand up `@agency/ui-theme` and `@agency/ui-design-system` with only the components needed by the first real app, not a speculative full component library.
9. Add `@agency/data-db` with Drizzle schema, the Neon client factory, migration scripts, and strict `client_id` scoping rules documented in the package README.
10. Build the first internal tool app against these packages, using the experience to validate and refine the package APIs before adding more consumers.
11. Add `@agency/auth-internal` with Clerk configuration when the first internal tool needs authentication.
12. Add `@agency/email-templates` and `@agency/email-service` when the first transactional email flow exists.
13. Add `@agency/data-cms` when the first Sanity-backed client site arrives.
14. Add `@agency/auth-portal` with Better Auth configuration when the first client portal requires a logged-in experience.
15. Add `@agency/data-api-client`, `@agency/notifications`, and the testing packages as real duplication appears in multiple consumers.

---

## Common failure modes and how to avoid them

### The shared package becomes a dumping ground

Symptom: `@agency/core-utils` starts containing database query helpers, React components, and API fetch wrappers. Solution: enforce the domain taxonomy at code review. If a utility does not fit cleanly into an existing domain, either it belongs in an app or it warrants a new domain package with a clear purpose statement.

### Breaking changes ship silently

Symptom: a developer renames an exported utility in `@agency/core-utils`, the apps that used the old name break, and nobody knows why until a deployment fails. Solution: enforce changeset requirements in CI — PRs that modify shared packages without a changeset file should not be mergeable. The changeset process surfaces the breaking change intent before merge.

### CI becomes too slow to be useful

Symptom: the pipeline takes 30+ minutes and developers start bypassing it. Solution: verify that Turborepo remote caching is correctly configured and achieving high cache hit rates. A hit rate below 50% means environment variable hashing is incorrect or cache invalidation is too aggressive. Run `pnpm turbo build --dry-run` to see what Turborepo thinks needs rebuilding and compare it against what actually changed.

### AI agents break package boundaries

Symptom: a Cursor or Windsurf session imports directly from `packages/data/database/src/internal/client.ts` rather than from the package's public `exports` field, or imports from a higher-level domain inside a lower-level package. Solution: keep `docs/AGENTS.md` current, add import restriction lint rules to `@agency/config-eslint` that are checked automatically, and include import correctness as an explicit review criterion in the CODEOWNERS review process.

### Client data bleeds across clients

Symptom: a query in the CRM returns records belonging to a different client because a developer forgot to pass `client_id` to a query module. Solution: enforce `client_id` as a required TypeScript parameter in every query function that operates on client-owned data. Make it structurally impossible to call the function without specifying a client. Include a CI test that mocks two clients and asserts that querying as client A never returns data seeded for client B.

---

## Final recommendation

Start with a **domain-grouped pnpm/Turborepo monorepo** that uses **explicit package scopes, public `exports` fields, `workspace:*` internal dependencies, Turborepo remote caching from day one, Changesets, CODEOWNERS, and strong AI agent rules baked into `docs/AGENTS.md`**. Keep the package system small and strictly disciplined at launch — five to seven packages to begin — but shape every structural decision so that Nx boundary enforcement, private-registry publishing, per-package consumer smoke tests, stronger ownership, codemods, and multi-team governance can be added later without restructuring.

The agency's long-term competitive advantage is not any individual client project — it is the accumulated shared infrastructure that makes each new project faster, more consistent, and more maintainable than the last. That infrastructure compounds only if the monorepo's architecture prevents it from degrading into a collection of poorly-connected apps that happen to share a Git root. The discipline described in this document — dependency flow rules, explicit exports, versioning discipline, CI rigor, and agent guardrails — is what keeps the infrastructure compounding rather than corroding.