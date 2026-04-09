# a6-docs-dependency-truth-version-authority: Guide

## When to use this task family

Use this family whenever you:

- Add a dependency claim to a task family
- Correct a stale version pin
- Update a provider lane or installation rule
- Review prompts or examples for version drift

## Update workflow

1. Verify the version claim against an official source.
2. Decide which dependency-truth classification applies.
3. Update `docs/DEPENDENCY.md` if the operational pin changes.
4. Update the affected task families or prompts that reference the old value.
5. Update `docs/DECISION-STATUS.md` or an ADR if the lane itself changed.

## Review questions

- Is this an exact pin, an approved range, tool-only latest, or validation pending?
- Is the claim backed by an official source?
- Is `docs/DEPENDENCY.md` already current?
- Is a lower-priority document trying to overrule a higher-priority source?