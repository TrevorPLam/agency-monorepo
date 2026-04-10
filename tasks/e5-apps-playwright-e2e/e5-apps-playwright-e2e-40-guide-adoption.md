# e5-apps-playwright-e2e: Guide

## When to use this task family

Use this family when an approved app now has browser-level workflows that cannot be covered well by unit or integration tests alone.

## Adoption workflow

1. Identify the first three critical journeys.
2. Decide whether PR-only Chromium coverage is enough initially.
3. Define the target environment and test data isolation strategy.
4. Add cross-browser smoke coverage only where it provides decision value.

## Review questions

- Is this a true browser-level journey?
- Would the same assurance be cheaper at the integration-test level?
- Does the app need Firefox/WebKit immediately, or only later?
- Is the environment and secret strategy stable enough for CI?