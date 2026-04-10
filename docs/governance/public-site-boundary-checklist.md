# docs/governance/public-site-boundary-checklist.md

> **Purpose of this document**
> This checklist is the review gate for changes involving:
> - `apps/agency-website/`
> - future public-facing client sites
> - proposed marketing-domain package extraction
> - branded sections, content blocks, SEO helpers, consent UI, or public-site analytics abstractions
>
> Topic 7 is locked. This checklist operationalizes that lock.

---

## How to use this checklist

Use this checklist when:
- proposing a new public-site package
- moving public-site code from an app into `packages/marketing/`
- deciding whether a branded/public-site concern stays local or becomes shared
- reviewing whether a second public-facing app justifies extraction

If the change fails this checklist, keep the code inside the app.

---

# Public-Site Boundary Checklist

## Section 1 — Public-site scope

- [ ] Is this change about stable public-site infrastructure rather than page composition?
- [ ] Is it more than one app’s branding or campaign logic?
- [ ] Is the second public-facing consumer real and approved?

### Reviewer notes
- Surface reviewed:
- Consumers:
- Issues found:

---

## Section 2 — App-local alternative

- [ ] Has the app-local option been considered honestly?
- [ ] Would keeping this logic inside the app still be acceptable right now?
- [ ] Is this more than deduplication optics?

### Reviewer notes
- Why app-local is insufficient:
- Issues found:

---

## Section 3 — Brand and composition test

- [ ] Is this free from client-specific brand assumptions?
- [ ] Is this free from campaign-specific layout assumptions?
- [ ] Is this free from site-specific copy structure?
- [ ] Would this remain valid across multiple public-facing sites without flags or forks?

### Reviewer notes
- Brand/composition review:
- Issues found:

---

## Section 4 — Package trigger test

- [ ] If this is `@agency/seo`, do 2+ surfaces need shared SEO helpers?
- [ ] If this is `@agency/compliance`, is real consent/privacy UI required?
- [ ] If this is `@agency/monitoring` or `@agency/monitoring-rum`, are the performance/RUM triggers actually met?
- [ ] If this is `@agency/data-cms`, is the first Sanity-backed site actually approved?
- [ ] If this is `@agency/content-blocks`, do multiple sites truly share content block schemas?
- [ ] If this is a client-specific brand package, is the design-token complexity real enough to justify it?

### Reviewer notes
- Trigger status:
- Issues found:

---

## Section 5 — Dependency and domain fit

- [ ] Does this belong in the marketing domain rather than app code, UI, data, or analytics?
- [ ] Does it fit the allowed dependency flow?
- [ ] Can it avoid illegal imports from higher-level domains or apps?

### Reviewer notes
- Domain fit:
- Issues found:

---

## Section 6 — UI boundary fit

- [ ] Is this staying out of `@agency/ui-design-system` if it is branded, page-level, or campaign-specific?
- [ ] If it uses shared primitives, is the logic still correctly owned by the app or marketing domain rather than the design system?
- [ ] Is this avoiding design-system sprawl caused by public-site composition logic?

### Reviewer notes
- UI boundary review:
- Issues found:

---

## Section 7 — Milestone and approval fit

- [ ] Is this change allowed in the current milestone?
- [ ] Is the relevant package/app explicitly approved in `REPO-STATE.md`?
- [ ] Is the decision already locked in `DECISION-STATUS.md`?
- [ ] Is this avoiding target-state inference from `ARCHITECTURE.md`?

### Reviewer notes
- Approval state:
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

- there is only one real public-facing consumer
- the second consumer is hypothetical
- the code is branded, page-specific, or campaign-specific but is being extracted anyway
- the package is being justified by target-state architecture alone
- the change would move public-site composition logic into `@agency/ui-design-system`
- the package trigger is not satisfied
- the milestone does not approve the change

---

# Reviewer reminder

Topic 7 is not about building a generalized website platform early.

It is about:
- keeping public-facing apps separate
- sharing only stable infrastructure
- leaving branded and campaign-specific logic inside the app until reuse is real

A public-site boundary review passes only when:
- the second consumer is real
- the abstraction is infrastructure, not composition
- the design-system boundary is preserved
- the milestone and trigger rules are satisfied

When in doubt, keep the logic local to the app.