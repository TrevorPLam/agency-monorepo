# docs/governance/new-package-proposal-template.md

> **Purpose of this document**  
> Use this template before proposing any new shared package.
>
> This template exists to force clarity before code moves into `packages/`.
> It is the intake document that pairs with:
>
> - `docs/governance/shared-package-acceptance-checklist.md`
> - `REPO-STATE.md`
> - `DECISION-STATUS.md`
> - `DEPENDENCY.md`
>
> **Rule:** Filling out this template does **not** approve a package.  
> It creates the proposal that must then pass the shared-package acceptance checklist.

---

# New Package Proposal

## 1) Package identity

### Proposed package name
`@agency/...`

### Proposed folder path
`packages/...`

### Proposed domain
Choose one:
- config
- core
- ui
- marketing
- data
- auth
- communication
- analytics
- experimentation
- lead-capture
- testing

### Proposed package type
Choose one:
- library
- config package
- data-access package
- service wrapper
- design-system package
- utility package
- other

### Proposed owner
Name the person/role responsible for long-term maintenance.

---

## 2) Problem statement

### What problem does this package solve?
Describe the repeated problem in plain English.

### Why is this a package problem instead of an app-local problem?
Explain why the code should not remain inside the app(s).

### What would happen if this package were not created now?
Be specific:
- duplication
- drift
- boundary violations
- hard-to-maintain app-local copies
- shared API need

**Do not answer with:**  
“because it belongs in packages”  
“because we will probably reuse it later”  
“because the architecture already lists it”

---

## 3) Consumer evidence

### Current consumer
Name the first real consumer:
- app/package name:
- current milestone:
- actual use case:

### Second real consumer
Name the second real consumer:
- app/package name:
- current milestone:
- actual use case:

### Consumer proof
Explain why both consumers are real **now**.

### Why these count as real consumers
Confirm that the proposal is **not** based on:
- hypothetical future reuse
- multiple files in one app
- one app plus tests/stories
- one consumer with multiple variants

---

## 4) App-local alternative

### What is the app-local option?
Describe how this problem would be handled if the package is not approved.

### Why is app-local insufficient?
Explain why app-local is no longer the right choice.

### What makes this more than a convenience extraction?
State the reason clearly.

---

## 5) Distortion test

### Proposed public API
Describe the API shape the package would expose.

### Why can both consumers use the same API cleanly?
Explain how the same package API works for both consumers.

### What distortion risks were checked?
Confirm whether the abstraction would require any of the following:
- app-specific flags
- client-brand forks
- provider-specific branches
- workflow-specific conditionals
- consumer-specific exceptions

### Distortion assessment
Choose one:
- [ ] No distortion risk identified
- [ ] Distortion risk exists — package should remain app-local

---

## 6) Domain placement

### Why does this package belong in the proposed domain?
Explain why this is the right home.

### Why does it not belong in another domain?
Explain the alternatives you ruled out.

### Why should it be a package instead of staying inside one app?
Tie the answer back to the repo’s package taxonomy rules.

---

## 7) Dependency profile

### Proposed external dependencies
List every planned external dependency.

### Proposed internal dependencies
List every planned internal dependency.

### Dependency-flow validation
Explain why this dependency profile fits the repository dependency flow.

### Conditional dependency check
List any dependencies or package relationships that are conditional or locked in `DEPENDENCY.md`.

### Risk note
State whether this package would require:
- imports from a higher-level domain
- imports from an app
- circular dependencies
- root-level dependency exceptions

If yes to any of these, the package should normally be rejected.

---

## 8) Public API and exports plan

### Proposed root export
List the intended root export.

### Proposed subpath exports
List any intentional subpath exports.

### What stays private?
Describe the internal implementation paths that should remain hidden.

### Why is the export surface narrow and supportable?
Explain how this package avoids becoming too broad.

### Public API impact
State whether the package would immediately create:
- a reusable stable API
- a temporary unstable API
- a broad convenience surface

If the answer is “temporary unstable API” or “broad convenience surface,” the package should usually not be approved.

---

## 9) Documentation and maintenance plan

### README plan
What must the README cover?
- purpose
- consumers
- usage examples
- export guidance
- dependency rules
- non-goals

### Test plan
What tests will exist?
- unit
- integration
- consumer smoke tests
- other

### Change management
Will this package require Changesets when its public API changes?
- [ ] Yes
- [ ] No
- Explain why:

### Maintenance risk
What could make this package turn into a dumping ground?
How will that be prevented?

---

## 10) Approval-state validation

### `REPO-STATE.md`
Is this package approved there?
- [ ] Yes
- [ ] No

### `DECISION-STATUS.md`
Is the relevant topic/decision already locked?
- [ ] Yes
- [ ] No

### `DEPENDENCY.md`
Is the package allowed and is its trigger satisfied?
- [ ] Yes
- [ ] No

### `ARCHITECTURE.md`
If the package appears there, confirm that architecture presence is **not** being used as the approval reason.
- [ ] Confirmed

---

## 11) Alternatives considered

List the alternatives and why they were rejected.

### Alternative 1 — Keep code app-local
Why was this rejected?

### Alternative 2 — Put the logic in a different existing package
Why was this rejected?

### Alternative 3 — Delay package creation
Why was this rejected?

### Alternative 4 — Use a simpler app-level wrapper instead of a shared package
Why was this rejected?

---

## 12) Final proposal summary

### One-paragraph summary
Summarize:
- the problem
- the two real consumers
- why app-local is no longer sufficient
- why the package fits the repo structure
- why the API can stay narrow

---

## 13) Reviewer outcome

### Reviewer decision
- [ ] Approved for checklist review
- [ ] Rejected before checklist review
- [ ] Needs clarification

### Reviewer notes
Explain the outcome.

### If rejected, why?
Choose all that apply:
- [ ] only one real consumer
- [ ] second consumer is hypothetical
- [ ] abstraction is distorted
- [ ] domain home is unclear
- [ ] dependency flow is invalid
- [ ] exports would be too broad
- [ ] package is not approved in repo state
- [ ] package trigger is not satisfied
- [ ] app-local remains the better choice
- [ ] other:

---

## Reminder

A good package proposal proves:
- real shared need
- clean API
- correct domain ownership
- valid dependency flow
- maintainable scope

A bad proposal usually sounds like:
- “this feels reusable”
- “this will probably be needed later”
- “this keeps things organized”
- “the architecture already expects it”

When in doubt, keep the code local and do not approve the package.