# c11-infra-security-headers: Constraints

## Hard Constraints

- Start from a deny-by-default posture for CSP and other security headers.
- Apps may extend the shared policy, but they must not silently replace it wholesale.
- `unsafe-inline` and `unsafe-eval` require documented exceptions with concrete justification.
- Dev, preview, and production origin differences must be explicit and reviewable.
- Header policy changes must be evaluated with downstream consumers in mind, especially public apps and auth flows.

## Scope Boundaries

- This task defines shared header policy and app integration guidance.
- App-specific third-party origins must only be added when a real app needs them.
- Compliance-specific template variants belong to `41a-compliance-security-headers`.
- Broader WAF, rate limiting, or bot-mitigation behavior belongs to other infra tasks.

## Implementation Rules

- Prefer `Content-Security-Policy-Report-Only` during rollout before hard enforcement when practical.
- Keep header generation deterministic and centralized.
- Make origin allowlists explicit by provider and environment.
- Document all temporary exceptions and review them regularly.

## Validation Expectations

- Headers must be testable locally and in preview.
- Core app flows must continue working with the header policy enabled.
- CSP validation must show no unexplained high-risk allowances.
