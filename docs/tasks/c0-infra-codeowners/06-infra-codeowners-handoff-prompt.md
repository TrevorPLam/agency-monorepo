# c0-infra-codeowners: Handoff Prompt

Implement the repository CODEOWNERS baseline described in `01-infra-codeowners-spec.md`.

## Goal

Create a root `.github/CODEOWNERS` file that assigns clear ownership for shared package domains, apps, workflows, docs, and security-sensitive paths.

## Required Outcomes

- A valid `.github/CODEOWNERS` file exists.
- Shared package domains and infrastructure roots are covered.
- Security-sensitive paths include security-aware reviewers.
- Placeholder team handles are replaced with real GitHub teams or clearly called out for owner follow-up.

## Constraints

- Use GitHub CODEOWNERS syntax only.
- Prefer team handles over individuals.
- Do not broaden scope into workflow/ruleset automation beyond documenting dependencies on branch protection.
- Do not add speculative client-app ownership patterns for apps that do not exist.

## Validation

- Verify the file path and syntax.
- Check sample changed paths against expected owners.
- Report any areas that still need real team mapping or branch protection setup.
