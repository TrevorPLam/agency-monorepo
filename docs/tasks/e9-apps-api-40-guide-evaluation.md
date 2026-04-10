# e9-apps-api: Guide

## When to use this task family

Use this family when someone proposes a dedicated API service and you need to determine whether the repo should activate that lane.

## Evaluation workflow

1. Confirm whether route handlers still fit the use case.
2. Identify the actual consumers and whether they are internal or external.
3. State the runtime, security, or deployment need that forces extraction.
4. Document auth, rate-limit, and tenant-boundary requirements before approval.

## Review questions

- Is there more than one real consumer?
- Is there a public versioned API requirement?
- Is the problem truly architectural, or only organizational preference?
- Would a dedicated API app reduce or widen blast radius?