# a7-docs-analytics-guides: Guide

## When to use this task family

Use this family when you need to:

- Add analytics documentation under `docs/analytics/`
- Define or update shared event-taxonomy rules
- Clarify provider boundaries between public and authenticated surfaces

## Authoring workflow

1. Read `docs/analytics/README.md`.
2. Confirm whether the guidance belongs in docs, a package task family, or an ADR.
3. Document the provider boundary before documenting the event shape.
4. Keep advanced analytics lanes conditional unless their triggers are met.

## Review questions

- Is this guidance about docs governance or package implementation?
- Is the event or dashboard shared enough to document centrally?
- Does the change affect public sites, authenticated apps, or both?
- Would the change widen scope beyond minimal analytics first?