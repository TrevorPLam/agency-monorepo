```md id="b8n4xp"
# ADR-016 — CMS strategy for client sites

## Status
Locked

---

## 1) Context

The repository needs a default CMS policy for client sites.

This is no longer a viability question.

Current official guidance confirms that Sanity is a viable and well-supported path with Next.js App Router, Draft Mode preview workflows, embedded Studio patterns, typed querying, and visual editing support. The repository therefore does not need to answer “can we use a CMS?” first. It needs to answer:

- what the default CMS lane is,
- when CMS should remain app-local,
- when shared CMS infrastructure is justified,
- and when self-hosted CMS should be treated as an exception.

This ADR must also remain consistent with the repository’s already-locked posture:

- app-local-first extraction
- website-first launch slice
- Route Handlers first
- no early `apps/api`
- target-state architecture is not implementation approval
- shared packages require real reuse, low distortion, and explicit approval
- `@agency/data-cms` is not a Milestone 1 package

---

## 2) Decision

### Default CMS lane
Sanity is the default CMS lane for **CMS-backed client sites**.

### Important scope clarification
This does **not** mean every public site should adopt CMS.

Code-based content, MDX, and static content remain valid when a site does not yet have a real structured editorial workflow requirement.

### Default implementation posture
CMS integration remains app-local by default in the owning site.

That includes, when needed:

- CMS client setup
- schema definitions
- queries
- content mapping
- preview wiring
- Draft Mode integration
- Route Handler preview/revalidation endpoints
- embedded Studio route configuration
- site-specific editorial rules
- site-specific page composition

### Shared package posture
`@agency/data-cms` is conditional.

It must not be activated from target-state package presence alone.

It may activate only when all are true:

1. there is a real approved CMS-backed consumer,
2. extraction passes the normal shared-package acceptance rules,
3. the package scope stays infrastructure-oriented,
4. the API remains low-distortion,
5. the package is explicitly approved in `REPO-STATE.md`.

### Self-hosted exception posture
Self-hosted CMS lanes are exception-only, not defaults.

They require explicit justification such as:

- contractual self-hosting requirements
- infrastructure ownership requirements
- tighter coupling between CMS, admin surface, database, and backend behavior
- client-specific control/compliance constraints that make the default managed lane inappropriate

---

## 3) What is approved

The following are approved as the default CMS posture:

- Sanity as the default CMS lane for CMS-backed client sites
- app-local CMS integration
- app-local schemas
- app-local preview / Draft Mode wiring
- app-local revalidation wiring
- embedded Studio when a real editorial workflow justifies it
- Route Handlers as the first server surface for preview/revalidation workflows

---

## 4) What is conditional

The following remain conditional:

- `@agency/data-cms`
- shared CMS client helpers
- shared webhook / revalidation helpers
- shared typed-query helpers
- shared schema fragments with real reuse and low distortion
- shared config/validation helpers for the approved CMS lane

### Conditional package rule
If `@agency/data-cms` is activated later, it must remain thin and infrastructure-oriented.

It may contain things like:

- CMS client/config helpers
- typed-query helpers
- revalidation/webhook helpers
- shared schema fragments that are genuinely reused
- environment/config validation helpers for the approved CMS lane

---

## 5) What is deferred

The following remain deferred:

- repo-wide CMS platform code
- cross-client schema standardization
- shared page-builder infrastructure
- provider-neutral CMS abstraction
- self-hosted CMS as a default lane
- CMS-driven content federation or automation beyond a real near-term need

---

## 6) What is rejected

The following are rejected:

- creating `@agency/data-cms` because it appears in target architecture
- extracting one site’s content model into shared code for convenience
- moving page composition into shared CMS infrastructure
- moving editorial workflow rules unique to one site into shared CMS infrastructure
- building a provider-neutral CMS abstraction “for future flexibility”
- assuming future client-site reuse is enough to justify extraction

---

## 7) Boundary rules for future activation

If `@agency/data-cms` activates later, it must **not** become a dumping ground.

It must not absorb:

- site-specific schemas without real reuse
- page-builder ownership
- branded section definitions
- campaign-specific content logic
- editorial workflow rules unique to one site
- content composition concerns that belong in an app
- provider-neutral abstraction layers with no real switching pressure

### Distortion test
If the proposed shared CMS package requires:

- client-specific flags
- brand forks
- editorial-workflow exceptions
- page-composition branches
- provider-specific conditionals leaking into consumers

…then the logic should remain app-local.

---

## 8) Consequences

### Positive consequences
- preserves app-local-first extraction
- keeps Milestone 1 lean
- gives a clear default lane without forcing early package creation
- keeps Route Handlers first
- avoids premature CMS platform buildout
- keeps site-specific content concerns where they belong

### Tradeoffs
- the first CMS-backed site may duplicate some setup locally
- schemas may remain local longer than a platform-minded team would prefer
- later extraction requires deliberate review rather than automatic promotion into shared code

These tradeoffs are acceptable because the repository optimizes for right-sized architecture and AI-safe implementation, not premature platform abstraction.

---

## 9) Implementation interpretation

This ADR locks the **policy**, not automatic implementation approval.

It does **not** authorize:

- building `@agency/data-cms` now
- installing CMS dependencies by default
- converting the agency website to CMS
- moving site-specific CMS logic into shared packages early

Exact dependency approval still belongs in `DEPENDENCY.md`, and implementation approval still belongs in `REPO-STATE.md`.

---

## 10) Final normalized rule

Use Sanity as the default CMS lane for real CMS-backed client sites.

Until shared-package triggers are explicitly met:

- keep CMS integration app-local,
- keep schemas app-local,
- keep preview/revalidation logic app-local,
- keep editorial composition local,
- and do not activate `@agency/data-cms` by inference.
```
