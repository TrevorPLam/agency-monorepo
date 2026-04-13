# ADR-013 — Monitoring and Observability Scope

## Status
Accepted

## Date
2026-04-09

## Decision owners
Repository architecture owner

---

## Context

This repository already has a locked launch-slice and platform posture:

- Milestone 1 is the agency website
- app-local-first extraction remains the default
- shared monitoring packages are not approved by default in Milestone 1
- the platform posture is Vercel-first
- the dependency contract already defines monitoring and RUM as condition-gated
- built-ins and app-local implementation are explicitly allowed when they prevent premature shared-package activation

The Topic 13 problem is therefore not whether monitoring is technically possible.

That is already settled.

The real decision is:

> What level of monitoring should be used by default, when are platform-native tools sufficient, and what exact threshold should control activation of `@agency/monitoring` and `@agency/monitoring-rum`?

---

## Decision

The repository adopts a **built-ins-first, app-local-first monitoring policy**.

### Core rule
Use platform-native monitoring minimums first.

### Milestone 1 rule
If the first validating app needs monitoring, keep it app-local or platform-native.

Do not create `@agency/monitoring` or `@agency/monitoring-rum` in Milestone 1 unless:
1. the relevant trigger is genuinely satisfied
2. `REPO-STATE.md` explicitly approves activation
3. the need cannot be handled cleanly with platform-native or app-local implementation

### Platform-native default
For Vercel-hosted apps, the default monitoring baseline is:
- Vercel Speed Insights
- framework-native web-vitals reporting when needed
- framework-native client instrumentation when needed

### Shared package rule
`@agency/monitoring` and `@agency/monitoring-rum` are escalation packages, not launch-default packages.

They exist only when platform-native/app-local monitoring is no longer enough.

---

## Why this decision was made

### 1) The launch slice already allows app-local monitoring
The launch-slice rules explicitly allow app-local monitoring to avoid premature shared-package activation.

Topic 13 should reinforce that rule rather than widen Milestone 1.

### 2) The current platform already provides a credible monitoring baseline
The Vercel + Next.js platform already gives the repo:
- Core Web Vitals visibility
- real-user performance data
- custom web-vitals reporting hooks
- client instrumentation entry points

That is enough for a correct initial posture.

### 3) Monitoring is not the same as analytics
Monitoring answers operational and performance questions.
Analytics answers behavior and acquisition questions.

Topic 13 should preserve that split.

### 4) Shared monitoring packages should be earned
A shared monitoring package should not exist because the target architecture contains one.

It should exist only when:
- repeated real needs appear
- platform-native minimums are no longer sufficient
- the package boundary is stable and justified

### 5) External observability should follow operational pain, not ambition
Full APM, logs, tracing, and external RUM add cost, setup complexity, review surface, and vendor commitment.

Those costs should be paid only when the repo actually needs them.

---

## Approved now

The following are approved as Topic 13 policy:

- platform-native monitoring minimums for Vercel-hosted apps
- app-local monitoring in Milestone 1 when needed
- framework-native web-vitals reporting
- framework-native client instrumentation for lightweight app-local monitoring setup
- built-ins-first monitoring posture

---

## Conditional

The following are conditional and require trigger review:

### `@agency/monitoring`
Approve only when:
- platform-native visibility is no longer sufficient, and
- performance instrumentation or error/performance integration needs become durable enough to justify a shared package

### `@agency/monitoring-rum`
Approve only when:
- real-user browser telemetry needs exceed the platform-native baseline, and
- the need is stable enough to justify a dedicated shared package boundary

### Shared performance instrumentation helpers
Approve only when:
- multiple approved apps need the same instrumentation or integration pattern without distortion

### Shared error/performance wrappers
Approve only when:
- repeated external monitoring integration patterns exist across approved apps

---

## Deferred

The following are intentionally deferred:

- external observability stack at launch
- repo-wide RUM package in Milestone 1
- full APM/logging/tracing platform by default
- broad cross-app observability conventions before repeated need exists
- enterprise observability escalation before a real operational requirement exists

---

## Rejected

The following are explicitly rejected:

- creating `@agency/monitoring` in Milestone 1 from target-state package presence alone
- creating `@agency/monitoring-rum` in Milestone 1 from hypothetical future need
- treating external monitoring as launch-default when built-ins are sufficient
- collapsing monitoring, analytics, experimentation, and replay into one default package
- widening Milestone 1 because observability tooling seems prudent in theory

---

## Monitoring scope model

### Platform-native minimums
Use these first:
- Vercel Speed Insights
- app-local web-vitals reporting
- app-local client instrumentation when needed

### App-local monitoring
Keep these inside the app by default:
- first-site performance visibility
- route-specific performance reporting
- app-specific web-vitals wiring
- app-specific lightweight instrumentation setup

### Shared monitoring package
`@agency/monitoring` may later own:
- stable performance instrumentation helpers
- custom performance marks/reporting helpers
- shared integration boundaries for approved monitoring providers

### Shared RUM package
`@agency/monitoring-rum` may later own:
- browser-side field telemetry helpers
- shared RUM initialization logic
- route/user-segment-aware field monitoring helpers

---

## Boundary rules

### Monitoring is not analytics
Do not move visitor analytics, funnel tracking, or attribution logic into monitoring packages.

### Monitoring is not experimentation
Do not move flags or experiment logic into monitoring packages.

### Monitoring is not compliance
Do not use monitoring packages to solve consent architecture.

### Monitoring is not launch-default infrastructure
If the first site can be monitored correctly without activating a shared package, keep it local.

---

## Consequences

### Positive consequences
- smaller Milestone 1
- lower launch complexity
- better fit with Vercel-first hosting
- less premature vendor commitment
- cleaner separation between monitoring and analytics

### Negative consequences
- the first app may keep some monitoring setup locally longer
- cross-app observability conventions will mature later
- external observability standardization is delayed until real need appears

### Accepted tradeoff
This repository prefers:
- platform-native and app-local monitoring first
over
- early observability platform abstraction

That is the correct tradeoff for this phase.

---

## Implementation impact

This ADR authorizes:
- platform-native monitoring minimums
- app-local monitoring in Milestone 1 when needed
- later activation of `@agency/monitoring` and `@agency/monitoring-rum` only when justified

This ADR does **not** by itself approve:
- `@agency/monitoring` in Milestone 1
- `@agency/monitoring-rum` in Milestone 1
- external observability stack at launch
- broad logging/APM/tracing infrastructure by default

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
- `docs/architecture/ADR-004-launch-slice-strategy.md`
- `docs/architecture/ADR-007-marketing-site-architecture-in-shared-monorepo.md`
- `docs/architecture/ADR-008-nextjs-16-repo-wide-application-platform.md`

---

## Change conditions

Reopen this ADR only if one of the following occurs:

- the first site becomes operationally important enough that platform-native monitoring is insufficient
- a second real app reveals a stable shared monitoring integration need
- repeated RUM/browser telemetry needs appear across approved apps
- a real operational requirement justifies external observability tooling
- later platform or hosting decisions materially change the monitoring baseline