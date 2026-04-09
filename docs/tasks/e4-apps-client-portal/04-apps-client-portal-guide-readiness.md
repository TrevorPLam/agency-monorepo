# e4-apps-client-portal: Guide

## When to use this task family

Use this family when a client asks for a logged-in experience and you need to determine whether the repository should activate the portal lane.

## Readiness workflow

1. Confirm the request is a real client-owned authenticated experience.
2. Confirm tenant-scoped data and auth are genuinely required.
3. Place the portal under `apps/client-sites/[client]-portal/` unless a later shared-product decision exists.
4. Keep client-specific business logic local.
5. Activate shared packages only when their triggers are met.

## Review questions

- Is this a portal or just a public website with gated content?
- Does the session model resolve cleanly to one tenant boundary?
- Are any proposed shared abstractions genuinely shared now?
- Is a dedicated API app actually required, or would route handlers be enough?