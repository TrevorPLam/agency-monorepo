# docs/governance/shared-package-acceptance-checklist.md

> **Purpose of this document**  
> This checklist is the approval gate for any proposed new shared package.
>
> It exists to enforce the repository’s app-local-first policy and prevent:
> - premature extraction
> - fake shared packages
> - dumping-ground packages
> - boundary-violating abstractions
> - AI tools creating packages from target-state architecture alone
>
> **Rule:** A new shared package may be approved only if every required section below is satisfied.

---

## How to use this checklist

Use this checklist **before**:
- scaffolding a new shared package
- moving app-local code into `packages/`
- splitting one package into multiple shared packages
- approving a package listed in target-state architecture for real implementation

Do **not** use this checklist for:
- normal edits inside an already approved package
- app-local modules that remain inside an app
- conditional packages whose activation trigger has not yet been satisfied

---

## Approval rule

A proposed shared package is approved only when all of these are true:

1. it has **two real consumers**
2. both consumers can use the **same API without distortion**
3. it has a **clear domain home**
4. its dependencies fit the **allowed repository dependency flow**
5. its public API can be defined through explicit **`exports`**
6. it has a named **owner**
7. it has a **README**
8. it has **tests**
9. it is approved in **`REPO-STATE.md`**

If any item is not satisfied, the code stays app-local.

---

# Section 1 — Consumer test

## 1.1 Real-consumer evidence
- [ ] Does the proposed package have **two real consumers**?
- [ ] Is the second consumer already real and approved, not hypothetical?
- [ ] Are the consumers separate apps/packages, not just multiple files in one app?

## 1.2 Current-milestone evidence
- [ ] If one consumer is not yet implemented, is it at least approved in the **current milestone**?
- [ ] Can both consumers be named specifically?

### Required notes
- Consumer 1:
- Consumer 2:
- Current milestone:
- Why both are real now:

### Auto-fail examples
Fail this section if the evidence is:
- “we will probably reuse this later”
- “this is a common pattern”
- “another client may need this eventually”
- “the architecture already has a folder for it”
- “this helper is used in many files inside one app”

---

# Section 2 — Distortion test

## 2.1 API cleanliness
- [ ] Can both consumers use the **same API** cleanly?
- [ ] Can both consumers use the package without app-specific flags?
- [ ] Can both consumers use the package without client-brand forks?
- [ ] Can both consumers use the package without provider-specific branching?
- [ ] Can both consumers use the package without workflow-specific conditionals that mostly exist to preserve the abstraction?

### Required notes
- Proposed API shape:
- Why both consumers fit this API:
- What would make the abstraction distort:

### Auto-fail examples
Fail this section if the proposed package would require:
- `isMarketingSite`
- `isInternalTool`
- `clientBrand`
- `provider="..."` branches that mainly preserve sharing
- custom per-consumer rendering hooks just to keep one package

If the abstraction only works by introducing consumer-specific switches, keep the code app-local.

---

# Section 3 — Domain-home test

## 3.1 Domain placement
- [ ] Does the proposed package have one clear domain home?
- [ ] Does that domain match the responsibility of the package?
- [ ] Would another domain placement be clearly worse?

### Required notes
- Proposed package name:
- Proposed domain:
- Why it belongs there:
- Why it does not belong elsewhere:

### Auto-fail examples
Fail this section if:
- the package spans multiple domains with no clear owner
- the package only exists because code was easier to move than classify
- the package is trying to collect “all shared logic” of a vague type

---

# Section 4 — Dependency-flow test

## 4.1 Allowed dependency profile
- [ ] Do the proposed external dependencies belong in this package according to `DEPENDENCY.md`?
- [ ] Do the proposed internal dependencies fit the allowed repo dependency flow?
- [ ] Can the package avoid importing from higher-level domains?
- [ ] Can the package avoid importing from an app?
- [ ] Can the package avoid creating a circular dependency?

### Required notes
- Proposed external dependencies:
- Proposed internal dependencies:
- Why this dependency profile is valid:

### Auto-fail examples
Fail this section if:
- the package needs to import from an app
- the package only works by violating domain flow
- the package creates a cycle
- the package depends on a conditional package that is not yet approved

---

# Section 5 — Public API and exports test

## 5.1 Exports discipline
- [ ] Can the package define a narrow public API through explicit `exports`?
- [ ] Are all proposed exports intentional and supportable?
- [ ] Can internal implementation remain private?
- [ ] Will consumers be able to use the package without importing from internal `src/` paths?

### Required notes
- Proposed root export:
- Proposed subpath exports:
- What stays private:
- Why the export surface is narrow:

### Auto-fail examples
Fail this section if:
- exports are being added “just in case”
- internal folders need to be exposed broadly
- wildcard exports are being used for convenience
- consumers need deep imports to make the package usable

---

# Section 6 — Ownership and maintenance test

## 6.1 Package stewardship
- [ ] Is there a named owner for this package?
- [ ] Is there a README plan for this package?
- [ ] Is there a test plan for this package?
- [ ] Is there a reason this package will remain maintainable over time?

### Required notes
- Owner:
- README plan:
- Test plan:
- Why this package will stay healthy:

### Auto-fail examples
Fail this section if:
- no one clearly owns the package
- there is no test plan
- the package would be “temporary” but has no cleanup plan
- the package is being created faster than it can be documented

---

# Section 7 — App-local alternative test

## 7.1 Why app-local is insufficient
- [ ] Has the app-local alternative been considered honestly?
- [ ] Is there a concrete reason the code should not stay local for now?
- [ ] Is the package providing more than deduplication optics or folder neatness?

### Required notes
- Why app-local is insufficient:
- What goes wrong if it stays local:
- Why this is not just a convenience extraction:

### Auto-fail examples
Fail this section if the answer is mostly:
- “to keep things organized”
- “to reduce duplication” without real shared stability
- “because it belongs in packages/ eventually”
- “because the repo is supposed to have this package later”

---

# Section 8 — Approval-state test

## 8.1 Repo approval
- [ ] Is the package approved in `REPO-STATE.md`?
- [ ] Is the relevant decision already locked in `DECISION-STATUS.md`?
- [ ] If the package is conditional in `DEPENDENCY.md`, is its trigger satisfied?
- [ ] If the package is listed in `ARCHITECTURE.md`, has approval still been confirmed independently?

### Required notes
- `REPO-STATE.md` status:
- `DECISION-STATUS.md` status:
- `DEPENDENCY.md` trigger status:
- Related ADR / decision:

### Auto-fail examples
Fail this section if:
- the package is only justified by its presence in target-state architecture
- the trigger is only “close enough”
- the decision is still open
- the milestone does not approve the package yet

---

# Section 9 — Final approval outcome

## Final result
- [ ] **Approved**
- [ ] **Not approved**

### Approval note
A package may be marked **Approved** only if every required section above passed.

### Final reviewer summary
- Package name:
- Decision:
- Reason:
- Conditions:
- Follow-up required:

---

# Fast rejection rules

Reject immediately if any of the following are true:

- there is only one real consumer
- the second consumer is hypothetical
- the abstraction needs consumer-specific switches to survive
- the domain home is unclear
- the dependency flow would be violated
- the public API would be broad or unstable
- the package is not approved in `REPO-STATE.md`
- the package is conditional but its trigger is not satisfied

---

# Reviewer reminder

A little duplication is acceptable.

A bad shared package is expensive:
- it distorts boundaries
- it creates future migration pain
- it teaches AI tools the wrong pattern
- it widens public API unnecessarily
- it becomes harder to remove than app-local code ever would have been

When in doubt, **do not approve**.