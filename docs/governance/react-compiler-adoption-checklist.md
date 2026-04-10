# docs/governance/react-compiler-adoption-checklist.md

> **Purpose of this document**
> This checklist is the review gate for any proposal to:
> - enable React Compiler in an app
> - move from annotation mode to infer mode
> - perform compiler-related cleanup in shared packages
>
> Topic 9 is locked. This checklist operationalizes that lock.

---

## How to use this checklist

Use this checklist when:
- enabling React Compiler in any app
- widening compiler scope
- proposing memoization cleanup justified by compiler adoption
- proposing shared-package changes tied to compiler enablement

If this checklist fails, keep the compiler disabled or keep the change smaller and more local.

---

# React Compiler Adoption Checklist

## Section 1 — Approval and scope

- [ ] Is the app/package already approved in `REPO-STATE.md`?
- [ ] Is Topic 9 already locked in `DECISION-STATUS.md`?
- [ ] Is the rollout limited to one approved scope rather than broad repo enablement?

### Reviewer notes
- Scope reviewed:
- Issues found:

---

## Section 2 — Lint readiness

- [ ] Are compiler-related diagnostics already surfaced through the repo ESLint workflow?
- [ ] Are critical unresolved lint issues understood?
- [ ] Is the team avoiding “enable first, debug later” rollout behavior?

### Reviewer notes
- Lint state:
- Issues found:

---

## Section 3 — Enablement mode

- [ ] Is the proposal using annotation mode for the first early-phase rollout?
- [ ] If infer mode is proposed, is there prior successful pilot experience?
- [ ] Is `compilationMode: 'all'` avoided?

### Reviewer notes
- Mode reviewed:
- Issues found:

---

## Section 4 — App stability

- [ ] Do normal tests pass?
- [ ] Are critical user journeys smoke-tested?
- [ ] Is rollback simple?

### Reviewer notes
- Stability review:
- Issues found:

---

## Section 5 — Memoization and refactors

- [ ] Are existing `useMemo` / `useCallback` usages being preserved unless explicitly reviewed?
- [ ] Is this avoiding speculative cleanup?
- [ ] Are performance claims based on evidence rather than assumption?

### Reviewer notes
- Cleanup review:
- Issues found:

---

## Section 6 — Shared-package impact

- [ ] Is the rollout avoiding shared-package API churn?
- [ ] If shared packages are affected, are normal package-governance rules being followed?
- [ ] Are exports unchanged unless intentionally reviewed?

### Reviewer notes
- Shared-package review:
- Issues found:

---

## Section 7 — Dependency and config fit

- [ ] Is the compiler integration/config change going through the shared config lane rather than ad hoc app-specific setup?
- [ ] If compiler-related dependencies changed, were they normalized in `DEPENDENCY.md` first?
- [ ] Is this avoiding per-app compiler policy drift outside the approved config lane?

### Reviewer notes
- Dependency/config review:
- Issues found:

---

## Section 8 — Final result

- [ ] Pass
- [ ] Pass with follow-up required
- [ ] Fail

### Summary
- Change reviewed:
- Reviewer:
- Date:
- Final result:
- Follow-up actions:

---

# Fast-fail conditions

Fail the review immediately if any of the following are true:

- the app/package is not approved in `REPO-STATE.md`
- compiler rollout is being proposed repo-wide in Milestone 1
- annotation mode was not honestly considered first
- `compilationMode: 'all'` is proposed
- large memoization cleanup is being justified only by compiler availability
- shared-package API churn is being introduced casually
- compiler-related dependency/config changes skipped `DEPENDENCY.md`

---

# Reviewer reminder

Topic 9 is not anti-compiler.

It is anti-uncontrolled rollout.

A React Compiler adoption review passes only when:
- the scope is approved and intentionally limited
- lint readiness exists first
- annotation mode is used before broader rollout
- memoization cleanup is evidence-based
- shared-package boundaries remain stable

When in doubt, keep the compiler disabled and keep the change smaller.