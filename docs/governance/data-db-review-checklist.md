# Data DB Review Checklist

> Use this checklist before activating `@agency/data-db`, adding a new DB provider lane, or approving schema/query changes with meaningful tenant or migration impact.

---

## 1) Activation and milestone check

- [ ] Is `@agency/data-db` explicitly approved in `REPO-STATE.md`?
- [ ] Is the repo beyond Milestone 1?
- [ ] Is there a real approved operational-data consumer that needs persistent state now?
- [ ] Is someone proposing activation only because target architecture already contains the package?

If activation is still hypothetical, do not activate the package.

---

## 2) App-surface check

- [ ] Can this data need stay inside the approved Next.js app surface?
- [ ] Are Route Handlers or other approved server-only app paths sufficient?
- [ ] Is someone using persistence as a reason to create `apps/api` early?

If `apps/api` is being pulled in without the separate extraction trigger, reject the design.

---

## 3) Provider-lane check

- [ ] Is Neon being used as the default lane?
- [ ] If Supabase is proposed, is the project intentionally choosing the integrated Supabase lane?
- [ ] If Aurora is proposed, is there a real enterprise/cloud constraint?
- [ ] If `pg` is proposed, is there a real non-edge or long-running worker need?
- [ ] Is the provider lane already allowed in `DEPENDENCY.md`?

If provider choice is drifting by convenience, stop and escalate.

---

## 4) Package-boundary check

- [ ] Will all DB access flow through `@agency/data-db`?
- [ ] Will apps avoid direct driver/provider imports?
- [ ] Will schema, migrations, and query modules live inside the package boundary?
- [ ] Can exports remain narrow and explicit?

If any answer is no, redesign the boundary.

---

## 5) Tenant-safety check

### For client-owned operational data
- [ ] Does every client-owned table include `client_id`?
- [ ] Do query helpers require explicit tenant scope?
- [ ] Are there any tenant-optional `getAll()` / `getById()` helpers?
- [ ] Are cross-tenant exceptions explicit rather than hidden?
- [ ] Is shared reference data clearly separated from client-owned operational data?

If any answer is no, reject or redesign the model.

---

## 6) RLS and policy check

- [ ] Are client-owned tables protected by RLS once the package is active?
- [ ] Do policies cover both read and write behavior?
- [ ] Are policy changes treated as high-risk review items?
- [ ] Are tests included for leakage prevention?

If any answer is no, stop and fix the policy posture.

---

## 7) Preview database check

- [ ] Is the preview/staging database clearly separate from production?
- [ ] Is branching being used for QA/testing/migration validation rather than tenant security?
- [ ] Are environment-specific DB credentials separated cleanly?
- [ ] Is preview DB automation being proposed only because repeated operational need exists?

If any answer is no, redesign the preview policy.

---

## 8) Migration discipline check

- [ ] Is the schema change represented in code under version control?
- [ ] Is there a reviewable SQL migration artifact?
- [ ] Will the migration be validated on a non-production branch/environment first?
- [ ] Is rollback planning present for destructive changes?
- [ ] Are tenant-boundary or RLS-affecting migrations called out as high risk?

If any answer is no, stop and escalate.

---

## 9) Final reviewer decision

- [ ] Approve `@agency/data-db`
- [ ] Approve provider-lane exception
- [ ] Approve schema/query change
- [ ] Reject
- [ ] Needs clarification

### Reason
Explain the decision in 3–5 sentences.