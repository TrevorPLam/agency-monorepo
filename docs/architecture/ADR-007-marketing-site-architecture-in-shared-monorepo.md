# ADR-007 — Marketing-Site Architecture in a Shared Monorepo

## Status
Accepted

## Date
2026-04-09

## Decision owners
Repository architecture owner

---

## Context

This repository is designed to support:
- the agency website
- future client-facing public sites
- future client portals
- shared design-system and core packages
- phased package activation
- AI-assisted implementation

The repository already establishes that:
- `apps/agency-website/` is the first validating app
- future client-facing sites live as separate apps in the same monorepo
- marketing-domain packages exist in the target architecture
- app-local-first extraction is the default
- the first website may keep SEO, analytics, and monitoring app-local in Milestone 1
- several marketing-related packages are conditional in `DEPENDENCY.md`

The Topic 7 problem is therefore not whether marketing sites belong in the monorepo.

It is:

> What public-site architecture should this repository use so that shared infrastructure stays real and stable, while branded and campaign-specific logic stays local to each app?

---

## Decision

The repository adopts an **app-per-public-site** model inside the shared monorepo.

### Default public-site model
Each public-facing site is a separate app.

Examples:
- `apps/agency-website/`
- future client-facing sites under `apps/client-sites/`

### Default sharing model
Public-site apps share only the stable lower layers by default:
- config
- core
- UI

Marketing-specific logic remains app-local unless a shared package has genuinely earned extraction.

### Shared marketing-package policy
Marketing-domain packages are allowed, but they must remain thin, domain-valid, and trigger-based.

They are not approved merely because they appear in target-state architecture.

### App-local-by-default rule for public sites
Keep these inside the app unless formal extraction criteria are satisfied:
- page composition
- branded sections
- landing-page variants
- hero sections
- marketing copy
- campaign routing
- client-specific content models
- client-specific analytics events
- client-specific design tokens
- one-off embeds and scripts
- app-specific metadata declarations

### Shared-by-trigger rule for marketing packages
Shared marketing packages may be approved only when they satisfy:
- real consumer evidence
- no-distortion extraction
- valid dependency flow
- explicit approval in `REPO-STATE.md`

---

## Why this decision was made

### 1) Public-facing apps are real products, not skins on one platform shell
The agency website and future client sites will differ in:
- branding
- layouts
- content models
- campaign needs
- embeds
- analytics details
- compliance posture

Trying to centralize those differences too early creates distortion.

### 2) The first website should validate the monorepo, not force premature marketing packages
Milestone 1 already allows the first site to keep SEO, analytics, and monitoring app-local when package triggers are not met.

Topic 7 makes that the explicit public-site architecture rule.

### 3) Shared marketing infrastructure should be thin and stable
The right shared marketing packages are the ones that stay stable across multiple public-facing apps:
- SEO helpers
- consent primitives
- security-header configs
- performance instrumentation
- shared CMS schema fragments when true reuse appears

They should not become a dumping ground for branded page sections or campaign logic.

### 4) Topic 7 should not pre-solve the future client-sites family standard
This topic governs public-site architecture principles inside the monorepo.

It does not fully standardize the future client-sites family, naming, deployment, or per-client conventions before a real client site is approved.

---

## Approved now

The following are approved as Topic 7 policy:

- public-facing sites live as separate apps in the monorepo
- `apps/agency-website/` remains the first public-site validating app
- public-site apps share config/core/UI first
- branded and page-specific logic stays app-local by default
- marketing-domain packages are thin infrastructure packages, not a generalized site platform
- agency website is the proving ground for later public-site abstractions

---

## Conditional

The following are conditional and require trigger review:

### `@agency/seo`
Approve only when:
- 2+ public-facing surfaces need consistent metadata/OG/schema helpers

### `@agency/compliance`
Approve when:
- real consent/privacy UI is required

### `@agency/compliance-security-headers`
Approve when:
- standard platform defaults are insufficient or an audit requires stricter control

### `@agency/monitoring`
Approve when:
- ranking-critical performance instrumentation is truly needed

### `@agency/monitoring-rum`
Approve when:
- real-user performance data is needed beyond lab metrics

### `@agency/data-cms`
Approve when:
- the first Sanity-backed site is confirmed

### `@agency/content-blocks`
Approve only when:
- multiple client-facing sites truly share content block schemas

### Client-specific brand-foundation packages
Approve only when:
- one client’s design tokens are complex enough to justify a dedicated package

---

## Deferred

The following are intentionally deferred:

- detailed client-sites family standards
- per-client deployment conventions
- a generalized multi-client website platform
- early extraction of shared content blocks
- analytics-consent bridge before 2+ analytics providers require it
- experimentation and lead-capture infrastructure before real cross-app need exists

---

## Rejected

The following are explicitly rejected:

- turning the agency website into a generalized platform before a second real public-site consumer exists
- moving branded sections into shared packages early
- creating public-site packages from target-state folder presence alone
- centralizing client-specific design tokens in shared theme packages
- centralizing campaign-specific routing or page composition into shared packages
- using future client sites as hypothetical evidence for current extraction

---

## Core rules

### Rule 1 — Public site = separate app
Every public-facing site is a first-class app, not a theme mounted on top of a shared site shell.

### Rule 2 — Stable layers shared first
Share config, core, and UI before introducing marketing-specific packages.

### Rule 3 — Marketing packages stay narrow
A marketing-domain package must solve a narrow, reusable infrastructure problem.
It must not absorb branded composition logic.

### Rule 4 — Brand stays local by default
Client-specific tokens, visual sections, layout variants, and campaign components stay inside the app unless separately approved.

### Rule 5 — Agency website is the first proving ground
The agency website validates:
- the public-site app model
- lower-layer package consumption
- which marketing abstractions are actually reusable later

### Rule 6 — Future client-sites family standards remain separate
Do not use Topic 7 to fully standardize client-site family architecture before a real client site exists.

---

## What belongs where

### App-local public-site code
Keep these inside the app:
- page composition
- route structure
- campaign pages
- branded hero sections
- testimonial blocks
- conversion-specific page variants
- one-off content sections
- per-site metadata decisions
- per-site analytics events
- per-site embed integrations
- client-specific token overrides

### Shared public-site infrastructure
Only extract these when justified:
- metadata helper utilities
- JSON-LD builders
- sitemap helpers
- robots helpers
- consent primitives
- security-header helpers
- performance instrumentation helpers
- reusable CMS schema fragments used by multiple sites

### Never put these in `@agency/ui-design-system`
- client-branded sections
- marketing-only compositions
- page-level campaign components
- one-off storytelling layouts

---

## Consequences

### Positive consequences
- lower risk of overbuilding the marketing layer
- clearer separation between stable infrastructure and per-site branding
- cleaner future extraction when second consumers are real
- better alignment with launch-slice policy

### Negative consequences
- more public-site code stays app-local longer
- some reusable-looking utilities will intentionally wait for a second consumer
- future client-site standardization remains partially deferred

### Accepted tradeoff
This repository prefers:
- separate public-site apps with disciplined local code now
over
- a premature shared website platform now

That is the correct tradeoff for this phase.

---

## Implementation impact

This ADR authorizes:
- public-facing apps as separate apps in the shared monorepo
- agency-website-first validation of the public-site lane
- app-local-first handling of branded and page-specific logic
- trigger-based activation of marketing packages

This ADR does **not** by itself approve:
- `@agency/seo`
- `@agency/compliance`
- `@agency/monitoring`
- `@agency/data-cms`
- future client-site family conventions
- client portals
- experimentation or lead-capture infrastructure

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

---

## Change conditions

Reopen this ADR only if one of the following occurs:
- the agency website proves insufficient as the first public-site validation lane
- a second real public-facing app reveals a stable shared marketing abstraction
- client-site volume creates pressure for stronger family-level standards
- the client-sites family topic is activated and formalizes client-sites architecture
- marketing package boundaries begin to distort or sprawl