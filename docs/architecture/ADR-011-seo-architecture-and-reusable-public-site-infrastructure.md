# ADR-011 — SEO Architecture and Reusable Public-Site Infrastructure

## Status
Accepted

## Date
2026-04-09

## Decision owners
Repository architecture owner

---

## Context

This repository already has a locked public-site posture:

- public-facing sites are separate apps
- `apps/agency-website/` is the first validating app
- app-local-first extraction is the default
- branded and page-specific logic stays app-local by default
- shared marketing infrastructure must remain thin and trigger-based
- Milestone 1 may keep SEO app-local when shared-package triggers are not yet met

The Topic 11 problem is therefore not whether SEO is viable in the current stack.

That is already settled.

The real decision is:

> What SEO responsibilities should remain app-local, what should qualify for shared extraction later, and what exact threshold should control creation of `@agency/seo`?

---

## Decision

The repository adopts an **app-local-first SEO policy**.

### Core rule
SEO stays inside the app by default.

### Milestone 1 rule
The first validating app, `apps/agency-website/`, should implement SEO directly using native Next.js App Router primitives unless a shared SEO package has already earned extraction.

### Shared SEO package rule
`@agency/seo` is conditional.

It may be approved only when all are true:
1. at least 2 approved public-facing apps need the same SEO infrastructure
2. both consumers can use the same API without distortion
3. the package solves a narrow infrastructure problem rather than site-specific SEO composition
4. its dependency flow is valid
5. its API can remain narrow and explicit
6. `REPO-STATE.md` explicitly approves it

---

## Why this decision was made

### 1) The current platform already provides strong native SEO primitives
Next.js App Router already supports:
- route metadata
- generated metadata
- sitemap generation
- robots generation
- Open Graph image handling
- Twitter image handling

This means the repository does not need a shared package merely to support baseline SEO.

### 2) SEO has both infrastructure concerns and site-specific concerns
Some SEO concerns can become stable infrastructure later:
- metadata helpers
- JSON-LD builders
- sitemap helpers
- robots helpers
- OG utility helpers

But many SEO concerns are inherently site-local:
- page messaging
- campaign metadata
- canonical decisions tied to route strategy
- branded OG composition
- page-specific schema content
- site-specific indexing decisions

Those should not be forced into a shared package early.

### 3) Topic 11 must respect the existing public-site and extraction rules
The repository already locks:
- app-local-first extraction
- public-site logic staying local by default
- Milestone 1 scope minimization
- conditional activation for `@agency/seo`

Topic 11 should reinforce those rules, not weaken them.

### 4) Premature SEO abstraction would create a fake platform
If `@agency/seo` is created from one website plus hypothetical future reuse, it will likely become:
- too broad
- too brand-aware
- too page-aware
- too coupled to one app’s route/content structure

That is exactly the kind of premature abstraction the repository is designed to prevent.

---

## Approved now

The following are approved as Topic 11 policy:

- app-local SEO in `apps/agency-website/`
- native Next.js metadata primitives as the default implementation lane
- app-local sitemap handling
- app-local robots handling
- app-local JSON-LD generation
- app-local OG/Twitter image handling
- keeping page-level and route-level SEO decisions inside the owning app

---

## Conditional

The following are conditional and require trigger review:

### `@agency/seo`
Approve only when:
- 2+ approved public-facing apps need the same reusable SEO infrastructure API

### Shared metadata helpers
Approve only when:
- metadata composition is repeated across 2+ public-facing apps without distortion

### Shared JSON-LD builders
Approve only when:
- the same schema-building patterns are repeated across 2+ public-facing apps

### Shared sitemap helpers
Approve only when:
- multiple public-facing apps need the same sitemap generation patterns

### Shared robots helpers
Approve only when:
- multiple public-facing apps need the same crawl-control patterns

### Shared OG image utilities
Approve only when:
- multiple public-facing apps need the same OG generation mechanics without brand-specific branching

---

## Deferred

The following are intentionally deferred:

- full client-sites SEO standardization
- CMS-coupled SEO abstractions before `@agency/data-cms` is active
- content-federated SEO infrastructure
- advanced SEO automation tied to future content pipelines
- broad public-site SEO platform conventions before a second real public-facing app exists

---

## Rejected

The following are explicitly rejected:

- creating `@agency/seo` from target-state folder presence alone
- centralizing page-specific metadata decisions early
- centralizing campaign-specific or brand-specific SEO logic into a shared package
- using one website plus future intent as evidence of two real consumers
- turning `@agency/seo` into a generalized marketing-platform package

---

## Core rules

### Rule 1 — SEO stays local first
If SEO can be implemented safely inside the app for the current milestone, keep it there.

### Rule 2 — Shared SEO must be infrastructure-only
A shared SEO package may contain narrow reusable infrastructure.
It must not absorb page composition, route strategy, or branding logic.

### Rule 3 — Brand and route decisions stay app-local
Canonical policy, page titles, social copy, campaign metadata, and route-specific indexing decisions remain inside the app unless a later decision explicitly changes that.

### Rule 4 — Native Next.js primitives are the default lane
Use framework-native metadata, sitemap, robots, and social-image primitives before inventing abstraction.

### Rule 5 — Topic 11 does not approve cross-site SEO standardization by itself
Future client-sites family standards remain a separate concern and should not be pre-solved here.

---

## What belongs where

### App-local SEO code
Keep these inside the app:
- page titles and descriptions
- per-route metadata declarations
- canonical decisions
- campaign-specific metadata
- page-level JSON-LD payload composition
- site-specific robots logic
- site-specific sitemap rules
- branded OG image composition
- page/social copy variations
- noindex/index policy tied to a specific app’s route model

### Shared SEO infrastructure
Only extract these when justified:
- metadata helper utilities
- JSON-LD builders
- sitemap helpers
- robots helpers
- OG image utility helpers
- stable validation utilities for SEO data shapes

### Never put these in `@agency/ui-design-system`
- SEO content rules
- campaign metadata composition
- page-level schema composition
- canonical logic
- sitemap logic
- robots logic

---

## Consequences

### Positive consequences
- lower risk of overbuilding a marketing-platform layer
- cleaner Milestone 1 execution
- clearer separation between SEO infrastructure and SEO content decisions
- better alignment with public-site app-local-first rules
- easier future extraction when second consumers are real

### Negative consequences
- some reusable-looking SEO utilities will stay app-local longer
- the first site may carry a small amount of local duplication
- cross-site SEO conventions will mature later rather than immediately

### Accepted tradeoff
This repository prefers:
- app-local SEO now
over
- premature shared SEO infrastructure now

That is the correct tradeoff for this phase.

---

## Implementation impact

This ADR authorizes:
- app-local SEO for `apps/agency-website/`
- native Next.js metadata file/function conventions as the default implementation lane
- future extraction of thin SEO helpers only when real multi-app reuse exists

This ADR does **not** by itself approve:
- `@agency/seo`
- client-sites family SEO standards
- CMS-coupled SEO infrastructure
- SEO automation tied to future data/content packages

Those remain governed by:
- `REPO-STATE.md`
- `DECISION-STATUS.md`
- `DEPENDENCY.md`

---

## Related documents

- `REPO-STATE.md`
- `DECISION-STATUS.md`
- `DEPENDENCY.md`
- `docs/AGENTS.md`
- `ARCHITECTURE.md`
- `docs/architecture/ADR-007-marketing-site-architecture-in-shared-monorepo.md`

---

## Change conditions

Reopen this ADR only if one of the following occurs:

- a second real public-facing app reveals a stable shared SEO abstraction
- `@agency/data-cms` activation changes where SEO data should be composed
- the agency website proves a shared SEO helper is already unavoidable without distortion
- public-site SEO code begins to duplicate across approved apps in a stable way
- a future client-sites topic formalizes broader cross-site SEO standards