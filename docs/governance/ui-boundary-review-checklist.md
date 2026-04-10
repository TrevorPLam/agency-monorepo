# docs/governance/ui-boundary-review-checklist.md

> **Purpose of this document**
> This checklist is the review gate for changes involving:
> - `@agency/config-tailwind`
> - `@agency/ui-theme`
> - `@agency/ui-icons`
> - `@agency/ui-design-system`
> - proposed extraction of UI code from apps into shared packages
>
> Topic 10 is locked. This checklist operationalizes that lock.

---

## How to use this checklist

Use this checklist when:
- adding or changing shared UI package boundaries
- moving app-local UI into shared packages
- deciding whether a token/theme concern belongs in config or theme
- reviewing shared component creation or updates in the design-system workflow

If the change fails this checklist, keep the code smaller and more local.

---

# UI Boundary Review Checklist

## Section 1 — Ownership fit

- [ ] Is the change clearly in one package’s responsibility?
- [ ] Is token logic staying in `@agency/ui-theme`?
- [ ] Is Tailwind setup logic staying in `@agency/config-tailwind`?
- [ ] Is component source staying in `@agency/ui-design-system`?
- [ ] Is icon logic staying in `@agency/ui-icons`?

### Reviewer notes
- Package reviewed:
- Issues found:

---

## Section 2 — Primitive vs composition test

- [ ] Is this a reusable primitive rather than a page-level composition?
- [ ] Is this free from branding assumptions?
- [ ] Is this free from campaign/page/layout assumptions?
- [ ] Would this remain valid across multiple apps without flags or forks?

### Reviewer notes
- UI surface reviewed:
- Issues found:

---

## Section 3 — App-local alternative

- [ ] Has the app-local option been considered honestly?
- [ ] Is there a real second consumer if this is shared UI?
- [ ] Is this more than visual deduplication optics?

### Reviewer notes
- Why app-local is insufficient:
- Issues found:

---

## Section 4 — Tailwind compatibility

- [ ] Does this follow the Tailwind v4 CSS-first model?
- [ ] Does it avoid introducing a JS preset-first design-system pattern?
- [ ] If shared UI classes are used, is source detection handled correctly?

### Reviewer notes
- Tailwind review:
- Issues found:

---

## Section 5 — shadcn/source-owned code review

- [ ] Is the shared component code still governed as normal repo code?
- [ ] Is the monorepo-aware shadcn workflow being used consistently?
- [ ] Are workspace-level style/base choices staying aligned where required?
- [ ] Are exports still narrow and intentional?
- [ ] Are package boundaries preserved?
- [ ] Are docs/tests updated if the public surface changed?

### Reviewer notes
- Shared component review:
- Issues found:

---

## Section 6 — Milestone and approval fit

- [ ] Is this UI/package change allowed in the current milestone?
- [ ] Is the package already approved in `REPO-STATE.md`?
- [ ] Is the relevant decision already locked in `DECISION-STATUS.md`?
- [ ] Is this avoiding target-state inference from `ARCHITECTURE.md`?

### Reviewer notes
- Approval-state review:
- Issues found:

---

## Section 7 — Final result

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

- token ownership is drifting between `@agency/config-tailwind` and `@agency/ui-theme`
- a branded/page-specific/campaign-specific component is being moved into `@agency/ui-design-system`
- there is only one real consumer and the UI is being extracted anyway
- a JS preset-first Tailwind pattern is being introduced as the default
- source detection is being ignored for shared UI usage
- the change widens the design-system package without preserving primitive-focused boundaries
- the milestone does not approve the change

---

# Reviewer reminder

Topic 10 is not about building the broadest possible design system.

It is about:
- keeping Tailwind setup, tokens, icons, and primitives in the right homes
- preserving a source-owned but disciplined shared UI layer
- leaving branded and page-specific composition inside apps until reuse is real

A UI boundary review passes only when:
- ownership is clear
- the component is primitive-level rather than composition-level
- Tailwind v4 conventions are preserved
- the design-system boundary stays narrow and intentional

When in doubt, keep the UI concern local to the app.