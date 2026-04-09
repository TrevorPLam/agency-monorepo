# ADR-004 — Launch Slice Strategy

## Status
Accepted

## Date
2026-04-09

## Decision owners
Repository architecture owner

---

## Context

This repository is designed for phased implementation.

That means the first build slice should not try to prove every future architecture lane at once. It should prove the repository through a **real app** while activating the fewest possible packages and dependencies.

The repository already has:
- conditional package activation rules
- app-local-first extraction rules
- strict dependency governance
- target-state package listings that are broader than current implementation approval
- milestone-based implementation authority through `REPO-STATE.md`

The Topic 4 problem is therefore:

> What is the smallest correct first implementation slice, and what sequence validates the repository without forcing conditional packages too early?

---

## Decision

The repository adopts a **two-step launch-slice strategy**.

### Milestone 1
**First validating app:** `apps/agency-website/`

Milestone 1 is the public website slice.

It exists to validate:
- root scaffolding
- governance spine
- config packages
- minimal core packages
- minimal UI packages
- Next.js App Router execution
- build/lint/typecheck flow
- deployment and preview flow
- disciplined app-local implementation where shared-package triggers are not yet met

### Milestone 2
**Second validating app:** first internal authenticated/persistent shell, expected `apps/internal-tools/crm/`

Milestone 2 exists to validate:
- first authenticated app lane
- first persistent data lane
- activation of `@agency/data-db`
- activation of `@agency/auth-internal`
- the repo’s first real internal-tool workflow

### Dedicated API policy
`apps/api` is **deferred** from the launch slice.

If Milestone 1 needs server endpoints, use Route Handlers inside App Router.

---

## Why this decision was made

### 1) The first slice should validate the repo, not maximize surface area
A good launch slice proves:
- the foundation is sound
- packages can be consumed by real apps
- governance works
- boundaries hold
- deployment works

It should not force:
- every future platform lane
- every future shared package
- every future backend concern

### 2) Internal-tool-first would activate too much too early
Starting with the internal CRM shell would force early activation of:
- database
- internal auth
- likely email
- client/data isolation concerns
- a larger operational surface

That is too much to require before the repo has proven its smallest real application lane.

### 3) Website-first is the smallest real milestone
Starting with the agency website validates:
- real app consumption of shared packages
- real deployment
- real routing/rendering
- real UI usage
- real repository workflow

…without requiring the data/auth stack on day one.

### 4) Launch order must follow activation rules, not target-state ambition
The target architecture contains many packages because it describes the end-state system.

The launch slice must instead follow:
- package activation rules
- app-local-first policy
- milestone approval
- smallest-correct-slice discipline

---

## Approved now

The following are approved as launch-slice strategy:

- agency website as the first validating app
- internal CRM shell as the second validating app
- milestone-based implementation sequencing
- Route Handlers first
- app-local-first treatment of first-slice SEO, analytics, and monitoring if shared-package triggers are not met
- smallest-correct-slice implementation logic

---

## Deferred

The following are intentionally deferred from the launch slice:

- `apps/api`
- shared analytics package in Milestone 1
- shared monitoring packages in Milestone 1
- shared CMS package in Milestone 1 unless the first site is explicitly Sanity-backed from day one
- auth/data/email stack activation in Milestone 1 by default
- broader cross-app shared packages that do not yet have real consumers

---

## Rejected

The following are explicitly rejected at this phase:

- internal-tool-first as the initial validation slice
- activating data/auth stack in Milestone 1 by default
- activating shared SEO/analytics/monitoring packages in Milestone 1 merely because they appear in target-state architecture
- creating `apps/api` in the first launch slice
- treating target-state build order as implementation approval

---

## Milestone 1 definition

### First validating app
`apps/agency-website/`

### Milestone 1 purpose
Milestone 1 proves that the repository can successfully support:
- a real public app
- the governance spine
- the approved foundation stack
- package consumption by a real app
- disciplined boundaries and milestone scope

### Approved in Milestone 1
- root scaffolding
- `REPO-STATE.md`
- `DECISION-STATUS.md`
- `docs/AGENTS.md`
- `.github/CODEOWNERS`
- CI baseline
- `@agency/config-*`
- only the `@agency/core-*` packages actually needed by the website
- only the `@agency/ui-*` packages actually needed by the website
- `apps/agency-website/`

### Allowed Milestone 1 implementation style
If needed, Milestone 1 may use:
- app-local SEO
- app-local analytics
- app-local monitoring
- Route Handlers inside App Router

These are allowed only when they prevent premature shared-package activation.

### Not approved in Milestone 1
Unless explicitly approved in `REPO-STATE.md`, Milestone 1 must not activate:
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

### Milestone 1 rule
If the website can work without activating a shared package, keep the implementation inside the app.

---

## Milestone 2 definition

### Second validating app
Expected: `apps/internal-tools/crm/`

### Milestone 2 purpose
Milestone 2 proves the repository’s first authenticated and persistent application lane.

### Approved when Milestone 2 begins
- `apps/internal-tools/crm/`
- `@agency/data-db`
- `@agency/auth-internal`

### Conditionally approvable within Milestone 2
Only if a real app need exists and the relevant triggers are satisfied:
- `@agency/email-templates`
- `@agency/email-service`
- `@agency/compliance`
- `@agency/seo`
- `@agency/analytics`

### Still deferred by default in Milestone 2
Unless separately approved:
- `apps/api`
- `@agency/monitoring`
- `@agency/monitoring-rum`
- `@agency/data-cms`
- `@agency/auth-portal`
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

---

## Shared-package handling in the launch slice

### SEO rule
Do not create `@agency/seo` in Milestone 1 unless:
- a second public surface is already approved in the same milestone, and
- the package trigger is satisfied, and
- `REPO-STATE.md` explicitly approves it

Until then, keep SEO logic app-local.

### Analytics rule
Do not create `@agency/analytics` in Milestone 1 unless:
- a second app makes the abstraction real, and
- the package trigger is satisfied, and
- `REPO-STATE.md` explicitly approves it

Until then, keep analytics app-local if needed.

### Monitoring rule
Do not create `@agency/monitoring` or `@agency/monitoring-rum` in Milestone 1.

If first-slice visibility is needed, use the smallest approved app-local approach instead of creating a shared monitoring package.

### CMS rule
Do not create `@agency/data-cms` in Milestone 1 unless the first site is explicitly Sanity-backed from day one and that package has been approved.

### Email rule
Do not activate `@agency/email-templates` or `@agency/email-service` until a real transactional email flow exists.

---

## Dedicated API rule

### Default early-server model
Use Route Handlers inside App Router for early server needs.

### Why
A dedicated API app adds:
- a second app lane
- separate routing/deployment concerns
- more surface area
- more boundary questions

That complexity is not justified in the launch slice.

### Approval rule
`apps/api` remains deferred until a later decision explicitly defines the extraction threshold.

---

## Implementation rule

If there is a conflict between:
- target-state build order in `ARCHITECTURE.md`, and
- conditional package activation in `DEPENDENCY.md`, and
- milestone approval in `REPO-STATE.md`

…implementation must follow:
1. `REPO-STATE.md`
2. `DECISION-STATUS.md`
3. `DEPENDENCY.md`

Target-state sequencing does **not** override activation discipline.

---

## AI operating impact

AI tools must:

- treat `apps/agency-website/` as the first validating app
- stay inside Milestone 1 scope unless Milestone 2 is explicitly opened
- avoid activating data/auth/email/CMS/shared analytics/monitoring packages in Milestone 1
- keep first-slice SEO/analytics/monitoring app-local when needed
- avoid creating `apps/api` in the launch slice

AI tools must not:

- scaffold the internal CRM shell before Milestone 2
- infer approval for shared packages from architecture build order
- widen the launch slice because a later package seems “close enough”
- create cross-app abstractions just to make the first website look more platform-like

---

## Consequences

### Positive consequences
- smaller first milestone
- lower implementation risk
- less premature package activation
- better fit with condition-gated architecture
- clearer AI implementation scope
- stronger validation of the repo through real consumers

### Negative consequences
- some cross-app abstractions will come later than they might in an overbuilt launch
- the first slice will intentionally leave some future shared-package opportunities unrealized
- some first-slice logic will remain app-local longer

### Accepted tradeoff
This repository prefers:
- a smaller real milestone now
over
- a more “complete” but structurally premature first implementation

That is the correct tradeoff for this phase.

---

## Implementation impact

This ADR authorizes:
- Milestone 1 website-first sequencing
- Milestone 2 internal-tool sequencing
- Route Handlers as the early-server default
- app-local handling for first-slice needs that have not yet earned shared packages

This ADR does **not** by itself approve:
- any specific conditional package
- Milestone 2 activation before it is entered in `REPO-STATE.md`
- dependency additions
- CMS adoption
- API extraction

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

- the first validating website slice proves insufficient to validate the foundation
- Milestone 1 requires more shared infrastructure than expected
- launch-slice sequencing conflicts with a later locked decision
- the dedicated API threshold is formally decided and changes the early-server model
- a future decision changes package activation criteria in a way that affects milestone order