# docs/governance/dedicated-api-extraction-checklist.md

> **Purpose of this document**
> This checklist is the review gate for any proposal to create:
> - `apps/api`
> - a separate backend runtime
> - a shared internal API boundary that no longer cleanly fits app-local Route Handlers
>
> Topic 8 is locked. This checklist operationalizes that lock.

---

## How to use this checklist

Use this checklist when:
- proposing `apps/api`
- arguing that Route Handlers are no longer sufficient
- introducing a second backend framework
- introducing a shared API surface consumed by multiple apps or non-UI consumers

If this checklist fails, keep the API logic inside the owning app.

---

# Dedicated API Extraction Checklist

## Section 1 — Real boundary test

- [ ] Do 2+ real consumers need the same server API surface?
- [ ] Are the consumers real and approved, not hypothetical?
- [ ] Would keeping the logic in app-local Route Handlers now create real duplication or drift?

### Reviewer notes
- Consumers:
- Why the boundary is real:
- Issues found:

---

## Section 2 — Route Handler sufficiency test

- [ ] Has the app-local Route Handler option been evaluated honestly?
- [ ] Is there a concrete reason Route Handlers are no longer a clean fit?
- [ ] Is this more than “it feels cleaner”?

### Reviewer notes
- Why Route Handlers are insufficient:
- Issues found:

---

## Section 3 — Operational trigger test

- [ ] Does the API need independent deployment?
- [ ] Does it need independent scaling?
- [ ] Does it need a different security boundary?
- [ ] Does it serve non-UI consumers?
- [ ] Does it require runtime/protocol behavior that does not fit cleanly inside app Route Handlers?

### Reviewer notes
- Operational trigger:
- Issues found:

---

## Section 4 — Framework and runtime test

- [ ] Can this remain within the approved Next.js platform lane?
- [ ] If not, is there an explicit decision to introduce a different runtime/framework?
- [ ] Are long-running/background concerns the real issue instead of API extraction?

### Reviewer notes
- Runtime implications:
- Issues found:

---

## Section 5 — Repo-governance fit

- [ ] Is the proposal approved in `REPO-STATE.md`?
- [ ] Is the relevant decision locked in `DECISION-STATUS.md`?
- [ ] Does this avoid violating launch-slice discipline?
- [ ] Does it avoid anticipatory architecture?

### Reviewer notes
- Approval status:
- Issues found:

---

## Section 6 — Portability and platform-fit test

- [ ] Is this avoiding portability work that is unrelated to the actual extraction need?
- [ ] If a non-Vercel deployment target is part of the rationale, is that target already approved for a real app?
- [ ] Is this avoiding the assumption that adapter capability means adapter infrastructure is now required?

### Reviewer notes
- Platform fit:
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

- there is only one real consumer
- the second consumer is hypothetical
- the rationale is mainly “cleaner architecture”
- Route Handlers were not honestly evaluated first
- the proposal is driven by target-state `apps/api` presence alone
- the change violates the active milestone scope
- a second backend framework is being introduced without explicit approval
- the real problem is background jobs/workers rather than API extraction

---

# Reviewer reminder

Topic 8 is not anti-API.

It is anti-premature API extraction.

A dedicated API extraction review passes only when:
- the server boundary is real
- Route Handlers are no longer sufficient
- the operational reason is concrete
- the milestone and approval state allow it
- the repo is not being widened just to look more platform-complete

When in doubt, keep the server logic inside the owning app.