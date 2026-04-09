# Decision Status

## Purpose

This document tracks the status of major architectural and operational decisions in the repository.

It exists to separate:
- decisions that are fully locked,
- decisions that are directionally preferred but still revisable,
- decisions that are still open,
- decisions that have been deferred,
- decisions that have been explicitly rejected.

This document is not an ADR index.
ADRs capture final decisions with rationale.
This file captures the decision pipeline before, during, and after ADR creation.

## Status definitions

Use these labels exactly:

- `locked` — approved decision; treat as authoritative unless replaced by a newer ADR
- `leaning` — preferred direction, but still open to revision
- `open` — not decided yet
- `deferred` — intentionally postponed until a later phase or trigger
- `rejected` — considered and intentionally not chosen

## Decision rules

1. If a decision is marked `locked`, AI agents must follow it.
2. If a decision is marked `leaning`, AI agents may discuss alternatives but must not silently switch direction.
3. If a decision is marked `open`, AI agents must not assume implementation details.
4. If a decision is marked `deferred`, AI agents must not scaffold related work without explicit approval.
5. If a decision is marked `rejected`, AI agents must not propose it as the default path again unless the human explicitly reopens it.

## Current decisions

| Area | Decision | Status | Notes |
|---|---|---|---|
| Monorepo tooling | pnpm workspaces + Turborepo | locked | Default monorepo foundation |
| Future scaling path | Nx at larger scale | leaning | Upgrade path, not launch requirement |
| Package topology | Domain-grouped packages | locked | Structural naming and ownership rule |
| Dependency boundaries | Strict low-to-high package flow | locked | No package may import from apps |
| Internal package linking | `workspace:*` only | locked | Never cross-package relative imports |
| Public package API | Explicit `exports` required | locked | Public API is the contract |
| Core framework | Next.js 16 App Router | locked | No Pages Router planning path |
| React version lane | React 19 with Next 16 pairing | locked | Must stay version-aligned |
| React Compiler usage | Supported, but opt-in and package-controlled | leaning | Do not treat as globally enabled by default |
| Lint/format lane | ESLint canonical, Biome complementary | locked | ESLint remains primary; Biome handles formatting and performance linting |
| Styling system | Tailwind CSS v4 CSS-first approach | locked | No old preset-style Tailwind setup |
| UI ownership model | shadcn-style source ownership | locked | Prefer owned component source over black-box UI package |
| Design system scope | Minimal shared UI only | locked | No speculative giant component library |
| Database host default | Neon | leaning | Preferred default lane |
| ORM | Drizzle | locked | Required abstraction layer |
| Database access pattern | All DB access through shared package | locked | Apps do not talk directly to DB providers |
| Client data isolation default | Row-level `clientId` scoping | locked | Baseline multi-tenant rule |
| Tenant-isolation governance owner | `a5` + `docs/standards/tenant-isolation-data-governance.md` | locked | Control-plane source for tenant-boundary rules |
| Stronger isolation option | Schema-per-client | leaning | Reserved for stronger isolation cases |
| Internal auth default | Clerk | leaning | Preferred lane for internal tools |
| Portal auth default | Better Auth | leaning | Preferred lane for client portals |
| Client-sites family owner | `e10-apps-client-sites-foundation` | locked | Governs `apps/client-sites/` topology |
| Client portal default topology | `apps/client-sites/[client]-portal/` | locked | Default for client-owned portals |
| Shared multi-tenant portal product | Separate `apps/client-portal/` lane | deferred | Only if later evidence justifies a shared portal platform |
| Enterprise auth escalation | WorkOS | deferred | Only for real enterprise SSO need |
| CMS default | Sanity | leaning | Preferred for structured content sites |
| Studio deployment default | Separate Studio, embedded by exception | leaning | Separate by default once Studio is activated |
| Self-hosted CMS lane | Strapi / Payload / Directus | leaning | Only when self-hosting or residency matters |
| Email rendering | React Email | locked | Rendering only, no provider logic |
| Email transport default | Resend | leaning | Default provider lane |
| Premium email alternative | Postmark | leaning | High-deliverability alternative |
| Marketing analytics | Plausible | leaning | Preferred public-site analytics lane |
| Product analytics | PostHog | leaning | Preferred authenticated-app analytics lane |
| Analytics documentation owner | `a7` + `docs/analytics/` | locked | Repository-level analytics governance layer |
| Analytics abstraction | Shared package owns providers | locked | Apps should not import providers directly |
| Decision-log middle layer | `a8` + `docs/decisions/` | locked | Lightweight layer between status register and ADRs |
| Consent-to-analytics bridge | Separate bridge package | leaning | Only if multi-provider consent complexity appears |
| Experimentation default | PostHog for product; Edge Config for edge marketing | leaning | Depends on actual use case |
| Monitoring default | Vercel built-ins first | leaning | Extra monitoring only when justified |
| Browser E2E lane | Dedicated Playwright workspace app when activated | leaning | Browser-context isolation and explicit CI policy |
| Dedicated API extraction rule | Route handlers first; dedicated API only at threshold | locked | API lane stays conditional |
| Client brand-foundation threshold | Two real surfaces before extraction | locked | Keep brand logic app-local until reuse is real |
| Changesets | Required for shared-package versioning | locked | Version intent must be explicit |
| Dependency-truth governance owner | `a6` + `docs/standards/dependency-truth.md` | locked | Policy layer above operational pin tables |
| CODEOWNERS | Start early | locked | Governance begins before scale |
| MCP server | Build later when repo complexity justifies it | deferred | Not a planning-phase implementation item |

## Open decisions

These items are not fully decided yet and must not be silently settled by implementation:

- Exact first build milestone
- Exact initial package count
- Whether `agencyseo` should be part of the very first build slice or only immediately before the agency website
- Whether early CI should exist before any package code is written, or only after root scaffolding is approved
- Whether React Compiler is enabled in the first production app
- Whether the first real app is the internal CRM or the agency website
- Whether marketing standards docs should be written before any app package is built
- Whether package guides should be broad templates first or package-by-package after implementation approval

## Rejected defaults

These are not the preferred default path for this repo:

- npm workspaces as the primary monorepo strategy
- Yarn as the primary monorepo strategy
- Nx at launch as the default starting point
- Flat package organization with no domain grouping
- Technical-role grouping as the primary package taxonomy
- Direct provider SDK usage inside apps when a shared package should own the abstraction
- Cross-package relative imports
- Importing from `src` instead of public exports
- Using `latest` for core dependency versions
- Treating conditional packages as launch-day packages
- Building a giant speculative design system before real consumers exist

## Decision promotion flow

Use this progression:

1. `open`
2. `leaning`
3. `locked`
4. ADR created if the decision is durable, high-impact, or hard to reverse

Not every locked decision needs an ADR immediately.
But every high-cost, high-blast-radius, or easy-to-forget decision should eventually get one.

## When to update this file

Update this document when:
- a major decision becomes locked,
- a leaning direction changes,
- a previously open issue is resolved,
- an ADR is created,
- a deferred item becomes active,
- a rejected option is reopened for reconsideration.

## Relationship to other docs

- `docs/AGENTS.md` tells AI agents how to behave
- `docs/REPO-STATE.md` tells them what currently exists and what is **approved for implementation**
- `docs/DECISION-STATUS.md` tells them which choices are settled and which are still in motion
- `docs/DEPENDENCY.md` is the authoritative source for all dependency versions
- `docs/architecture/` ADRs explain finalized high-impact decisions in depth

## Implementation authority

A decision marked `locked` in this document does **not** automatically grant implementation authority. Before implementing:

1. Check `REPO-STATE.md` — is the package/app marked as `approved` or `active`?
2. Check this document — is the relevant decision `locked`?
3. Check `DEPENDENCY.md` — are you using the exact pinned versions?

**Document hierarchy for implementation:**
- `REPO-STATE.md` — what is approved to implement now
- `DECISION-STATUS.md` — which decisions are locked vs still open  
- `DEPENDENCY.md` — exact version authority for all dependencies
- `ARCHITECTURE.md` — target state design (reference only)

## Change log

### 2026-04-08
- Established repository-level decision register
- Marked monorepo tooling, package boundaries, exports discipline, and Changesets as locked
- Marked several provider choices as leaning rather than fully locked
- Marked MCP server and enterprise auth escalation as deferred
- Preserved unresolved first-build decisions as open

### 2026-04-09
- Added decision ownership entries for `a5`, `a6`, `a7`, and `a8`
- Locked the default client-portal topology at `apps/client-sites/[client]-portal/`
- Locked the route-handler-first API extraction rule and the client brand-foundation threshold
- Recorded the Playwright lane and Studio deployment defaults as planning decisions