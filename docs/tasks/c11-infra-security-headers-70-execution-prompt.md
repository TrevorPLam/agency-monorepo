# c11-infra-security-headers: Handoff Prompt

Implement the shared security-headers policy described in `c11-infra-security-headers-10-spec.md`.

## Goal

Create a reusable shared security-headers policy that production apps can integrate without each app inventing its own CSP and header defaults.

## Required Outcomes

- Shared header policy lives in one package or config surface.
- At least one target app demonstrates integration.
- The policy documents environment-specific origins and any temporary exceptions.
- Validation steps for header presence and CSP correctness are documented.

## Constraints

- Do not weaken the baseline policy for convenience.
- Do not silently replace the shared policy in consuming apps.
- Do not add speculative third-party origins.
- Keep compliance-package variants separate from the shared infra baseline.

## Validation

- Verify headers locally and in preview.
- Run CSP evaluation.
- Report any blocked legitimate flows and the minimum exception needed.