```md id="4m8qtf"
# DECISION-STATUS.md

> **Purpose of this document**  
> This file records which planning topics are **Locked**, which remain **Open**, which are **Deferred**, and which are **Conditional**.
>
> This is the repository’s decision-status reference.
>
> **Non-negotiable rule:**  
> A topic being documented in architecture or package maps does **not** mean the decision is implemented or approved to build now.

---

## 1) Status meanings

### Locked
The planning decision is made and should be treated as repository policy unless explicitly superseded.

### Conditional
The direction is decided, but activation depends on an explicit trigger, milestone, or approved consumer.

### Deferred
The topic is intentionally postponed and must not be implemented by inference.

### Open
The topic is still unresolved and requires a decision before implementation.

### Rejected
A previously considered direction is not approved.

---

## 2) Locked topics

## Topic 1 — Monorepo foundation strategy
**Status:** Locked

### Decision
- pnpm workspaces + Turborepo is the approved monorepo foundation
- Nx is a later escalation path, not a day-one requirement

### Normalized interpretation
- do not migrate to Nx before repo-scale, boundary-governance, or graph-governance complexity clearly justifies it
- Turborepo remains sufficient until explicit triggers are met

---

## Topic 2 — AI-governed planning and anti-drift controls
**Status:** Locked

### Decision
- AI governance must be structural, not advisory
- repo control-plane documents are required before broad AI-assisted implementation
- AI tools must obey repo state, dependency policy, package exports, and milestone scope

### Normalized interpretation
- ambiguous docs increase implementation drift
- repo-validity depends on document order and explicit approval, not plausible code generation

---

## Topic 3 — Domain-grouped package boundaries and extraction rules
**Status:** Locked

### Decision
- app-local-first extraction is the default rule
- shared packages require real reuse, low distortion, clear ownership, explicit exports, docs, tests, and approval

### Normalized interpretation
- target-state package presence does not justify package creation
- hypothetical future reuse does not count as a second consumer

---

## Topic 4 — Launch-slice strategy
**Status:** Locked

### Decision
- the first validating app is the public agency website
- architecture should be validated through a real app before broad shared-package activation

### Normalized interpretation
- Milestone 1 favors smallest-correct delivery over platform buildout
- app-local implementation is preferred over premature abstraction

---

## Topic 5 — Dependency-truth and version-governance
**Status:** Locked

### Decision
- `DEPENDENCY.md` is the authoritative human dependency policy document
- exact implementation truth lives in manifests, workspace config, lockfile, and CI
- unapproved installs and `latest` are not allowed

### Normalized interpretation
- planning docs may describe lanes without granting install approval
- exact installs still require dependency-authority alignment

---

## Topic 6 — Tenant isolation and client-data safety
**Status:** Locked

### Decision
- pooled row-level tenant isolation is the default posture
- stronger isolation is escalation-only by trigger
- auth is not the tenant-isolation boundary

### Normalized interpretation
- tenant safety must be enforced in the data layer
- stronger isolation requires explicit escalation, not assumption

---

## Topic 7 — Marketing-site architecture inside a shared monorepo
**Status:** Locked

### Decision
- public-facing sites are separate apps
- marketing concerns must not become an overbuilt shared platform at launch

### Normalized interpretation
- public sites can coexist in the monorepo without forcing early shared extraction
- marketing-site structure must stay consistent with app-local-first rules

---

## Topic 8 — Next.js as the repo-wide application platform
**Status:** Locked

### Decision
- Next.js App Router is the default repo-wide application platform
- Route Handlers come first
- `apps/api` is deferred until justified

### Normalized interpretation
- persistence or server logic alone does not justify a dedicated API app
- Route Handlers remain the default first server surface

---

## Topic 9 — React 19 and React Compiler adoption policy
**Status:** Locked

### Decision
- React Compiler is conservative and opt-in
- it must not be enabled blindly across the repository

### Normalized interpretation
- compiler usage requires explicit adoption policy
- shared-package coding conventions must not assume universal compiler rollout

---

## Topic 10 — Tailwind v4 and source-owned design system strategy
**Status:** Locked

### Decision
- Tailwind v4 CSS-first posture is approved
- the design system remains source-owned and primitive-first
- do not overbuild a design-system platform early

### Normalized interpretation
- token, primitive, and component ownership must remain disciplined
- UI packages must justify themselves through real reuse

---

## Topic 11 — SEO architecture and reusable public-site infrastructure
**Status:** Locked

### Decision
- SEO remains app-local by default in Milestone 1
- `@agency/seo` is conditional, not launch-default
- if activated later, it must remain thin and infrastructure-only

### Approved
- app-local metadata
- app-local `generateMetadata`
- app-local `robots.ts`
- app-local `sitemap.ts`
- app-local JSON-LD
- app-local canonical / index / noindex policy

### Conditional
- `@agency/seo`
- shared metadata helpers
- shared JSON-LD builders
- shared sitemap helpers
- shared robots helpers
- shared OG helpers

### Deferred
- cross-site SEO standardization
- CMS-coupled SEO abstraction
- broad client-site SEO platform rules

### Rejected
- creating `@agency/seo` from target-state presence alone
- moving page-specific or brand-specific SEO logic into shared infrastructure

### Normalized note
If `@agency/seo` activates later, it must stay infrastructure-only and must not absorb site-specific composition concerns.

---

## Topic 12 — Analytics architecture for marketing vs product contexts
**Status:** Locked

### Decision
- marketing analytics and product analytics are separate lanes
- app-local analytics is allowed in Milestone 1
- Plausible is the default marketing lane
- PostHog is the default product lane
- `@agency/analytics` is conditional

### Approved
- app-local analytics in Milestone 1
- lane-specific analytics thinking
- repo-wide event taxonomy planning

### Conditional
- `@agency/analytics`
- shared marketing analytics helpers
- shared product analytics helpers
- shared taxonomy helpers

### Deferred
- `@agency/analytics-attribution`
- `@agency/analytics-consent-bridge`
- multi-touch attribution
- cross-provider consent orchestration

### Rejected
- a fake generic analytics runtime API
- activating attribution or consent-bridge because they may be useful later
- requiring a shared analytics package in Milestone 1

### Normalized note
If `@agency/analytics` activates later, it must support lane-specific exports rather than forcing one universal runtime abstraction.

---

## Topic 13 — Monitoring and observability scope
**Status:** Locked

### Decision
- built-ins-first, app-local-first monitoring posture is approved
- platform-native monitoring minimums come first for Vercel-hosted apps
- `@agency/monitoring` and `@agency/monitoring-rum` are escalation packages, not launch-default packages

### Approved
- platform-native monitoring minimums
- app-local web-vitals reporting
- app-local lightweight instrumentation

### Conditional
- `@agency/monitoring`
- `@agency/monitoring-rum`
- shared error/performance helpers
- shared browser telemetry helpers

### Deferred
- external observability as launch-default
- repo-wide RUM package in Milestone 1
- full APM/logging/tracing as a default repo concern

### Rejected
- shared monitoring package in Milestone 1
- collapsing monitoring, analytics, experimentation, and replay into one default package

### Normalized note
`@agency/monitoring-rum` means browser-side field telemetry / RUM helpers and must not be described as CrUX-specific infrastructure.

---

## Topic 14 — Auth strategy split: internal tools vs client portals
**Status:** Locked

### Decision
- internal tools default to Clerk
- client portals default to Better Auth
- one provider per app
- auth is not the tenant-isolation boundary
- `@agency/auth-internal` and `@agency/auth-portal` are provider-boundary packages
- WorkOS is escalation-only

### Approved
- Clerk as internal auth default
- Better Auth as portal auth default
- Auth.js as fallback when full OSS control is explicitly required
- Supabase Auth only when intentionally in the Supabase lane
- WorkOS only for real enterprise escalation

### Conditional
- `@agency/auth-internal` once Milestone 2 and internal auth are real
- `@agency/auth-portal` once a real portal is approved
- Better Auth plugins only when justified by real portal requirements
- WorkOS only when enterprise SSO / SCIM needs are real

### Deferred
- portal auth packages in Milestone 1
- enterprise auth complexity as default infrastructure
- multi-provider auth inside one app

### Rejected
- one universal auth provider for all app types
- mixing providers in one app
- using auth/session as tenant isolation
- WorkOS as the default lane

### Normalized note
Auth boundary packages are one of the few package types that may activate at the first real consumer because they exist to isolate provider choice and migration risk, not to speculate on broad reuse.

---

## Topic 15 — Database and operational data architecture
**Status:** Locked

### Decision
- PostgreSQL + Neon + Drizzle is the default operational-data lane
- `@agency/data-db` is the required DB boundary
- apps do not install DB drivers directly
- Route Handlers / approved server-only app code are the first data surface
- preview/staging DB branching is for testing and migration validation, not tenant security

### Approved
- PostgreSQL as the operational data model
- Neon as the default provider lane
- Drizzle as the required schema/query/migration abstraction
- strict query scoping
- reviewable SQL migrations

### Conditional
- `@agency/data-db`
- Supabase lane
- Aurora lane
- `pg` for long-running/non-edge worker cases
- automated preview DB provisioning
- stronger isolation lanes if Topic 6 escalation triggers are met

### Deferred
- `@agency/data-db` in Milestone 1
- automatic preview DB orchestration
- `apps/api`
- stronger isolation as default posture

### Rejected
- DB drivers in apps
- auth/session as data isolation
- Neon branching as tenant security
- unscoped client-owned data helpers
- early `apps/api` just because persistence exists

### Normalized note
Expected first activator is the internal CRM / Milestone 2, but the true architectural trigger is the first approved operational-data consumer requiring persistent DB-backed state.

---

## Topic 16 — CMS strategy for client sites
**Status:** Locked

### Decision
- Sanity is the default CMS lane for CMS-backed client sites
- this does not mean every public site should adopt CMS
- code / MDX / static content remains valid when structured editorial workflow is not yet real
- CMS integration remains app-local by default in the owning site
- `@agency/data-cms` is conditional
- self-hosted CMS is exception-only

### Approved
- app-local CMS integration
- app-local schemas
- app-local preview / Draft Mode wiring
- app-local revalidation wiring
- embedded Studio when a real editorial workflow justifies it

### Conditional
- `@agency/data-cms`
- shared CMS client helpers
- shared webhook / revalidation helpers
- shared typed-query helpers
- shared schema fragments with real reuse and low distortion

### Deferred
- repo-wide CMS platform code
- cross-client schema standardization
- shared page-builder infrastructure
- provider-neutral CMS abstraction
- self-hosted CMS as a default lane

### Rejected
- creating `@agency/data-cms` from target-state presence alone
- extracting one site’s content model into shared code for convenience
- moving page composition or editorial workflow rules into shared CMS infrastructure
- assuming future client-site reuse is enough to justify extraction

### Normalized note
If `@agency/data-cms` activates later, it must remain thin and infrastructure-oriented. It must not become a dumping ground for schemas, page builders, or site-specific editorial logic.

---

## Topic 17 — Email and notifications architecture
**Status:** Locked

### Decision
- React Email is the default rendering lane
- Resend is the default transactional email delivery lane
- this topic governs transactional/app email first, not broad marketing/broadcast tooling
- the first real transactional email flow stays app-local by default
- `@agency/email-templates` and `@agency/email-service` are conditional
- `@agency/notifications` is deferred and trigger-based
- Postmark-like provider escalation is later-only

### Approved
- app-local email templates
- app-local send helpers
- app-local provider wiring
- app-local webhook/event handling
- React Email + Resend as the default lane

### Conditional
- `@agency/email-templates`
- `@agency/email-service`
- shared template primitives with real reuse
- shared provider send helpers with real reuse
- normalized delivery-event helpers with real reuse

### Deferred
- `@agency/notifications`
- multi-channel orchestration
- notification preferences center
- queue / digest / fan-out infrastructure
- provider-neutral runtime abstraction
- deliverability escalation as a default lane
- broad marketing/broadcast tooling as part of this topic

### Rejected
- shared email packages in Milestone 1 by default
- notifications package for email-only needs
- extracting one app’s workflow emails into shared code for convenience
- building a broad abstraction because provider changes are theoretically possible

### Normalized note
Transactional email delivery, shared template rendering, and broader notifications are distinct concerns and must not be collapsed into one vague package boundary.

---

## 3) Topics not yet locked

## Topic 18 — Client-sites family architecture
**Status:** Deferred

### Current posture
- do not define a full family standard before the first real client site is in scope
- do not infer package creation or deployment rules from hypothetical future clients

---

## Topic 19 — Client portal architecture
**Status:** Deferred

### Current posture
- do not define a portal standard before a real logged-in client experience is approved
- do not activate portal-specific packages by inference

---

## Topic 20 — Dedicated API app threshold
**Status:** Deferred

### Current posture
- Route Handlers remain the default server surface
- `apps/api` requires a later extraction trigger and is not approved by default

---

## Topic 21 — Playwright E2E workspace strategy
**Status:** Deferred

### Current posture
- define Playwright workspace rules only when there is at least one critical browser journey worth protecting

---

## Topic 22 — Client brand-foundation extraction rules
**Status:** Deferred

### Current posture
- keep client brand logic local until real extraction triggers are met
- do not create brand packages from hypothetical future reuse

---

## Topic 23 — Attribution / experimentation / consent-bridge thresholds
**Status:** Deferred

### Current posture
- do not activate advanced analytics/experimentation lanes before real complexity appears
- package-map presence is not approval

---

## Topic 24 — AI enrichment / content federation thresholds
**Status:** Deferred

### Current posture
- keep these lanes deferred until measurable workflow or content complexity justifies them
- do not build them because AI tooling exists in the ecosystem

---

## Topic 25 — MCP server / advanced AI tooling threshold
**Status:** Deferred

### Current posture
- better docs, guardrails, and generators come before repo-specific MCP tooling
- do not build repo-specific AI tooling without concrete failure modes and clear trigger conditions

---

## 4) Cross-topic normalization reminders

The following interpretations apply across Topics 1–17:

- target-state architecture does not grant implementation approval
- shared package presence in docs does not equal activation approval
- provider-lane policy does not equal install approval
- app-local implementation is preferred whenever reuse is not yet real
- milestone scope overrides aspirational package maps
- deferred topics must not be implemented by inference

---

## 5) When to update this file

Update this file when:

- a currently open or deferred topic becomes locked
- a locked topic is superseded by a newer decision
- a milestone changes what is approved to activate
- a normalization issue is discovered that could cause AI drift
- a previously rejected direction is reconsidered explicitly

---

## 6) Final reminder

If a topic is not marked **Locked**, it is not safe to treat it as settled repository policy.

If a package depends on a deferred or open topic, stop and escalate before implementation.
```
