# a5-docs-tenant-isolation-data-governance: Constraints

## Hard constraints

- Do not weaken tenant scoping to make shared-package reuse easier.
- Do not make `clientId` optional for client-owned data paths.
- Do not describe cross-client access as normal behavior for internal tools.
- Do not let analytics, monitoring, or logging become tenant-bypass back doors.
- Do not treat schema-per-client as the baseline unless a later decision explicitly promotes it.

## Documentation constraints

- Keep one default model throughout the repo.
- Use the same vocabulary everywhere: `clientId`, row-level isolation, schema-per-client escalation, admin bypass, audit trail.
- Push tenant-isolation rationale into this family or the owned standard, not into unrelated package specs.

## Implementation constraints for future work

- Any future code change that touches tenant boundaries must read this family first.
- Tenant-related implementation remains blocked until the relevant package or app is approved in `docs/REPO-STATE.md`.
- If a future task needs a different default isolation model, it must stop and create a decision record instead of drifting silently.