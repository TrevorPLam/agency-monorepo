```md
# REPO-STATE.md

> **Purpose of this document**  
> This file defines what is approved to build **now**, what is locked as planning policy, and what remains conditional or deferred.
>
> This is the repository’s implementation-approval reference.
>
> **Non-negotiable rule:**  
> Target-state architecture is **not** implementation approval.

---

## 1) Current repository posture

The repository is currently planning-locked through **Topic 17**.

That means the strategic decisions for Topics 1–17 are considered **locked planning policy**, but the repository must still obey milestone scope, conditional activation rules, and dependency governance before anything is built.

---

## 2) Launch-slice posture

The repository is governed by a **two-step launch-slice strategy**.

### Milestone 1 — Public website slice

The first validating app is:

- `apps/agency-website/`

### Milestone 1 approved build scope

In Milestone 1, AI tools may build:

- root scaffolding
- approved governance files
- approved workspace/tooling config
- approved config packages
- only the `@agency/core-*` packages actually consumed
- only the `@agency/ui-*` packages actually consumed
- `apps/agency-website/`

### Milestone 1 prohibited build scope

In Milestone 1, AI tools must **not** build:

- `apps/internal-tools/crm/`
- `apps/api`
- `@agency/data-db`
- `@agency/auth-internal`
- `@agency/auth-portal`
- `@agency/email-templates`
- `@agency/email-service`
- `@agency/analytics`
- `@agency/monitoring`
- `@agency/monitoring-rum`
- `@agency/data-cms`
- `@agency/notifications`
- `@agency/experimentation`
- `@agency/experimentation-edge`
- `@agency/analytics-attribution`
- `@agency/analytics-consent-bridge`
- `@agency/data-api-client`
- `@agency/data-content-federation`
- `@agency/data-ai-enrichment`
- `@agency/lead-capture`
- `@agency/test-setup`
- `@agency/test-fixtures`

### Milestone 1 implementation rule

If the first website needs SEO, analytics, monitoring, or CMS-backed content before shared-package triggers are met:

- keep that logic app-local
- do not create the shared package early

If the first website needs a transactional email flow before shared-package triggers are met:

- keep templates app-local
- keep sending logic app-local
- keep provider wiring app-local
- do not create shared email packages early
- do not create `@agency/notifications` for email-only needs

---

## 3) Milestone 2 posture

### Milestone 2 — First authenticated internal slice

The second validating app is expected to be:

- `apps/internal-tools/crm/`

Only when Milestone 2 begins may AI tools activate:

- `@agency/data-db`
- `@agency/auth-internal`
- other dependencies and packages explicitly approved for that milestone

---

## 4) Locked planning posture by topic

## Topics 1–5

### Topic 1 — Monorepo foundation strategy
- **Locked**
- pnpm workspaces + Turborepo now
- Nx later only by explicit trigger
- do not migrate to Nx before repo-scale or governance complexity justifies it

### Topic 2 — AI-governed planning and anti-drift controls
- **Locked**
- AI governance must be structural, not advisory
- control-plane docs are required
- AI tools must obey repo state, dependency policy, exports, and milestone limits

### Topic 3 — Domain-grouped package boundaries and extraction rules
- **Locked**
- app-local-first extraction
- shared packages require real reuse, low-distortion API shape, explicit ownership, docs, tests, and approval

### Topic 4 — Launch-slice strategy
- **Locked**
- website-first launch slice
- validate architecture through a real app before broad package activation

### Topic 5 — Dependency-truth and version-governance
- **Locked**
- `DEPENDENCY.md` is the authoritative human dependency policy document
- machine truth lives in manifests, workspace config, lockfile, and CI
- do not use `latest`
- do not install unapproved dependencies

## Topics 6–10

### Topic 6 — Tenant isolation and client-data safety
- **Locked**
- pooled row-level tenant isolation is the default posture
- stronger isolation is escalation-only by trigger
- auth is not the tenant-isolation boundary

### Topic 7 — Marketing-site architecture inside a shared monorepo
- **Locked**
- public-facing sites are separate apps
- do not overbuild a shared marketing platform early

### Topic 8 — Next.js as the repo-wide application platform
- **Locked**
- Next.js App Router is the default application platform
- Route Handlers first
- no early `apps/api`

### Topic 9 — React 19 and React Compiler adoption policy
- **Locked**
- React Compiler is conservative/opt-in
- do not enable blindly across the repo

### Topic 10 — Tailwind v4 and source-owned design system strategy
- **Locked**
- Tailwind v4 CSS-first posture
- source-owned, primitive-first design system
- do not overbuild a design-system platform early

## Topics 11–15

### Topic 11 — SEO architecture and reusable public-site infrastructure
- **Locked**
- SEO is app-local by default in Milestone 1
- `@agency/seo` is conditional, not launch-default
- if activated later, `@agency/seo` must remain thin and infrastructure-only

### Topic 12 — Analytics architecture for marketing vs product contexts
- **Locked**
- marketing analytics and product analytics are separate lanes
- app-local analytics is allowed in Milestone 1
- Plausible is the default marketing lane
- PostHog is the default product lane
- `@agency/analytics` is conditional
- if activated later, `@agency/analytics` must support lane-specific exports

### Topic 13 — Monitoring and observability scope
- **Locked**
- built-ins-first, app-local-first monitoring posture
- platform-native monitoring minimums first for Vercel-hosted apps
- `@agency/monitoring` and `@agency/monitoring-rum` are escalation packages, not launch-default packages
- `@agency/monitoring-rum` refers to browser-side field telemetry / RUM helpers, not CrUX-specific infrastructure

### Topic 14 — Auth strategy split: internal tools vs client portals
- **Locked**
- internal tools default to Clerk
- client portals default to Better Auth
- one provider per app
- auth is not the tenant-isolation boundary
- `@agency/auth-internal` and `@agency/auth-portal` are provider-boundary packages
- WorkOS is escalation-only, not the default enterprise auth lane

### Topic 15 — Database and operational data architecture
- **Locked**
- PostgreSQL + Neon + Drizzle is the default operational-data lane
- `@agency/data-db` is the required database boundary
- apps do not install database drivers directly
- Route Handlers / approved server-only app code remain the early data surface
- preview/staging DB branching is for testing and migration validation, not tenant security
- expected first activator is the internal CRM / Milestone 2
- true architectural trigger is the first approved operational-data consumer requiring persistent DB-backed state

## Topics 16–17

### Topic 16 — CMS strategy for client sites
- **Locked**
- Sanity is the default CMS lane for **CMS-backed client sites**
- this does **not** mean every public site should adopt CMS
- app-local content remains valid when a site does not yet need real structured editorial workflow
- default implementation posture is app-local in the owning site
- `@agency/data-cms` is conditional, not launch-default
- self-hosted CMS is exception-only and requires explicit justification

### Topic 17 — Email and notifications architecture
- **Locked**
- React Email is the default email rendering lane
- Resend is the default transactional email delivery lane
- this topic governs **transactional/app email first**, not broad marketing/broadcast tooling
- the first real transactional email flow stays app-local by default
- `@agency/email-templates` and `@agency/email-service` are conditional
- `@agency/notifications` is deferred and trigger-based
- Postmark-like provider escalation is later-only and requires real operational justification

---

## 5) Operating rules derived from locked posture

### Shared-package rule
Do not create a shared package unless all normal shared-package acceptance rules are satisfied, including:

1. real reuse
2. same API without distortion
3. clear domain ownership
4. explicit `exports`
5. docs
6. tests
7. owner
8. approval in this file

### Conditional package rule
A package may exist in target-state architecture and still be **not approved**.

No conditional package may be activated unless:

- its trigger is satisfied
- it is approved in this file
- it complies with `DEPENDENCY.md`
- it complies with `DECISION-STATUS.md`

### Provider-lane rule
Provider-lane decisions in locked topics are **policy**, not automatic install approval.

Exact installs still require:

- dependency approval in `DEPENDENCY.md`
- milestone approval
- consumer reality
- normal package-boundary compliance

---

## 6) Current approved exceptions for app-local implementation

The following are explicitly allowed to remain app-local in Milestone 1 if needed before shared-package triggers are met:

- SEO logic
- analytics logic
- monitoring logic
- CMS integration
- transactional email logic

This allowance exists to preserve launch-slice discipline and prevent fake shared-package extraction.

---

## 7) Deferred / trigger-based topics not yet locked

The following topics remain deferred, open, or trigger-based beyond Topic 17:

- Topic 18 — Client-sites family architecture
- Topic 19 — Client portal architecture
- Topic 20 — Dedicated API app threshold
- Topic 21 — Playwright E2E workspace strategy
- Topic 22 — Client brand-foundation extraction rules
- Topic 23 — Attribution / experimentation / consent-bridge thresholds
- Topic 24 — AI enrichment / content federation thresholds
- Topic 25 — MCP server / advanced AI tooling threshold

These topics are **not approved for implementation by inference**.

---

## 8) Final implementation reminder

A package being named in architecture, planning summaries, or ADRs does **not** mean it is approved to build.

When there is any conflict:

1. `REPO-STATE.md` decides what is approved now
2. `DECISION-STATUS.md` decides what is locked vs open
3. `DEPENDENCY.md` decides what may be installed and where
4. package-level docs and `exports` decide the local contract
5. `ARCHITECTURE.md` remains target-state reference only
```
