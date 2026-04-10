# docs/governance/tenant-isolation-review-checklist.md

> **Purpose of this document**
> This checklist is the review gate for any change that touches:
> - client-owned data
> - `@agency/data-db`
> - tenant-aware auth/session mapping
> - cross-tenant reporting/admin workflows
> - migrations that affect tenant boundaries
>
> Topic 6 is locked. This checklist operationalizes that lock.

---

## How to use this checklist

Use this checklist when:
- adding or changing a client-owned table
- adding or changing a query helper for client-owned data
- modifying RLS policies
- adding cache/search behavior for client-owned data
- introducing any cross-tenant operation
- reviewing migration safety for tenant-owned data

If a change fails this checklist, it is not tenant-safe.

---

# Tenant Isolation Review Checklist

## Section 1 — Data classification

- [ ] Is the data clearly classified as either:
  - client-owned operational data
  - shared reference data
  - approved cross-tenant aggregate data
- [ ] If the data is client-owned, is that classification documented clearly?
- [ ] If the data is shared, is it truly shared and not just temporarily unscoped?

### Reviewer notes
- Data type reviewed:
- Classification:
- Issues found:

---

## Section 2 — Schema isolation

- [ ] Does every client-owned table include non-nullable `client_id`?
- [ ] Do foreign key relationships preserve tenant boundaries appropriately?
- [ ] Are there no new client-owned tables without tenant scope?

### Reviewer notes
- Tables reviewed:
- Issues found:

---

## Section 3 — Query isolation

- [ ] Do all client-owned query helpers require explicit tenant scope?
- [ ] Are all read paths scoped?
- [ ] Are all write paths scoped?
- [ ] Are tenant-optional helpers avoided for client-owned entities?
- [ ] Are there no hidden fallback paths that widen scope?

### Reviewer notes
- Query modules reviewed:
- Issues found:

---

## Section 4 — Auth/session to tenant mapping

- [ ] Does trusted server-side context map the caller to allowed tenant scope?
- [ ] Is tenant scope derived from trusted session/context rather than raw client input?
- [ ] Are cross-tenant overrides rejected by default?

### Reviewer notes
- Auth/session path reviewed:
- Issues found:

---

## Section 5 — RLS defense layer

- [ ] Are RLS policies present for client-owned tables?
- [ ] Do policies protect read paths?
- [ ] Do policies protect write paths?
- [ ] Are policy changes reviewed as high risk?
- [ ] Are admin/override exceptions explicit rather than hidden?

### Reviewer notes
- Policies reviewed:
- Issues found:

---

## Section 6 — Cache, search, and exports

- [ ] Do cache keys include tenant scope for client-owned data?
- [ ] Do search paths preserve tenant scope?
- [ ] Do export/reporting paths avoid cross-tenant leakage by default?

### Reviewer notes
- Surface reviewed:
- Issues found:

---

## Section 7 — Cross-tenant exceptions

- [ ] Is any cross-tenant access explicitly justified?
- [ ] Is the exception path narrow and reviewable?
- [ ] Is the exception limited to approved categories such as:
  - admin operations
  - approved aggregated reporting
  - migration workflows
  - incident response
- [ ] Is the exception separately tested?

### Reviewer notes
- Exception reviewed:
- Issues found:

---

## Section 8 — Migration safety

- [ ] Does the migration preserve tenant boundaries?
- [ ] Does it avoid weakening `client_id` requirements?
- [ ] Does it avoid destructive tenant-boundary changes without rollback planning?
- [ ] Was a staging or preview validation plan defined?

### Reviewer notes
- Migration reviewed:
- Issues found:

---

## Section 9 — Testing

- [ ] Are unit tests present for tenant-scoped query behavior?
- [ ] Is there at least one dual-tenant leakage test?
- [ ] Are approved exception paths tested separately?
- [ ] Are test fixtures tenant-scoped?

### Reviewer notes
- Tests reviewed:
- Issues found:

---

## Section 10 — Final result

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

- a client-owned table lacks `client_id`
- a client-owned query helper does not require tenant scope
- a change introduces hidden cross-tenant fallback behavior
- RLS is being removed or weakened without explicit decision review
- tenant scope is taken from untrusted client input
- a migration weakens tenant boundaries without rollback planning
- a cross-tenant path exists without an explicit approved exception category
- client-owned cache/search paths are not tenant-scoped

---

# Reviewer reminder

Topic 6 is not just about adding `client_id`.

It is about keeping tenant boundaries explicit, reviewable, and mechanically hard to violate.

A tenant-safety review passes only when:
- the data is classified correctly
- schema and queries enforce tenant scope
- RLS exists as defense-in-depth
- exceptions are explicit and narrow
- testing proves leakage resistance

When in doubt, fail the review and keep the boundary stricter.