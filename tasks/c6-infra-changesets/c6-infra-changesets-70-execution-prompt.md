# c6-infra-changesets: Handoff Prompt

Implement the root Changesets configuration described in `01-infra-changesets-spec.md`.

## Goal

Add a single canonical `.changeset/` configuration and contributor guide so shared package changes can be versioned consistently across the monorepo.

## Required Outcomes

- `.changeset/config.json` exists and matches repository versioning policy.
- `.changeset/README.md` explains how to create, review, and skip changesets.
- The setup works locally with `pnpm changeset` without any publishing step.

## Constraints

- Do not add package-local versioning systems.
- Do not publish packages as part of this task.
- Do not force changesets for app-only or docs-only changes.
- Keep semver guidance explicit for patch, minor, and major changes.

## Validation

- Run a sample changeset creation flow locally.
- Confirm the config parses and the README instructions are accurate.
- Report any follow-on dependency on release workflows or branch protections.
