# Auth Lane Review Checklist

> Use this checklist before activating `@agency/auth-internal`, `@agency/auth-portal`, or any enterprise auth escalation.

---

## 1) App category check

- [ ] Is this app clearly an internal tool?
- [ ] Is this app clearly a client-facing portal?
- [ ] Is this actually a brochure/marketing site that does not need auth?
- [ ] Is the app category explicit in `REPO-STATE.md`?

If the app category is unclear, stop and resolve that first.

---

## 2) Milestone and approval check

### For `@agency/auth-internal`
- [ ] Has Milestone 2 begun?
- [ ] Is the first internal tool actually requiring auth?
- [ ] Is `@agency/auth-internal` explicitly approved in `REPO-STATE.md`?

### For `@agency/auth-portal`
- [ ] Is there a real approved client portal requiring login?
- [ ] Is `@agency/auth-portal` explicitly approved in `REPO-STATE.md`?
- [ ] Is `@agency/data-db` active or approved as part of the same portal lane?

If any answer is no, do not activate the package.

---

## 3) Provider-lane check

- [ ] Is Clerk being used only for an internal tool?
- [ ] Is Better Auth being used only for a client portal?
- [ ] Is Auth.js being proposed for a specific full-control reason rather than preference drift?
- [ ] Is Supabase Auth being proposed because the project is intentionally in the Supabase lane?
- [ ] Is WorkOS being proposed only because enterprise SSO / SCIM is a real requirement?

If any answer is no, stop and escalate.

---

## 4) One-provider-per-app check

- [ ] Does the app use exactly one primary auth provider?
- [ ] Is anyone proposing to mix Clerk and Better Auth in one app?
- [ ] Is anyone proposing a second auth provider without an explicit decision?

If mixing is proposed, reject the design unless a new explicit decision is recorded.

---

## 5) Tenant-safety check

### For client portals
- [ ] Is tenant isolation handled separately from auth?
- [ ] Does the portal’s data layer still enforce `client_id` scoping?
- [ ] Is anyone treating session identity as sufficient tenant protection?
- [ ] Are cross-tenant leakage risks reviewed separately from login mechanics?

If tenant safety depends only on auth, reject the design.

---

## 6) Better Auth capability check

### For `@agency/auth-portal`
- [ ] Does the portal actually need organizations?
- [ ] Does the portal actually need RBAC?
- [ ] Does the portal actually need passkeys?
- [ ] Does the portal actually need 2FA?
- [ ] Are plugins being enabled only for real requirements?

If plugins are speculative, leave them off.

---

## 7) Enterprise escalation check

### For WorkOS or similar escalation
- [ ] Is enterprise SSO / SCIM a real current requirement?
- [ ] Is the owning app category explicit?
- [ ] Is WorkOS being treated as an escalation layer rather than a new default?
- [ ] Has the app-specific auth composition been reviewed explicitly?

If any answer is no, do not activate enterprise auth escalation.

---

## 8) Package boundary check

- [ ] Will provider SDK imports stay inside the auth package boundary?
- [ ] Will apps consume auth through `@agency/auth-internal` or `@agency/auth-portal` rather than wiring providers directly everywhere?
- [ ] Will the package avoid taking on business authorization logic that belongs elsewhere?
- [ ] Can exports stay narrow and explicit?

If any answer is no, redesign the package boundary.

---

## 9) Final reviewer decision

- [ ] Approve `@agency/auth-internal`
- [ ] Approve `@agency/auth-portal`
- [ ] Approve enterprise auth escalation
- [ ] Reject
- [ ] Needs clarification

### Reason
Explain the decision in 3–5 sentences.