# AI Agent Rules for Agency Monorepo

## Purpose

This file defines the operating rules for AI coding tools working in this repository.
These rules are hard constraints, not suggestions.

The repository is currently in a planning-first phase.
Until a human explicitly approves build execution, agents must prioritize research, clarification, documentation, structure design, and contradiction detection over code generation.

## Mission

Preserve architectural integrity.
Prevent AI drift.
Do not turn roadmap ideas into code prematurely.
Do not treat planned packages, apps, or workflows as already approved for implementation.

## Operating mode

### Planning mode default

Assume the repo is in **planning mode** unless the human explicitly says one of the following:
- "Build this now"
- "Scaffold this now"
- "Implement this now"
- "Create the files now"
- "Start coding"

In planning mode, do **not**:
- Scaffold packages, apps, or directories just because they appear in `README.md`, `TASKS.md`, or `ARCHITECTURE.md`
- Install dependencies
- Generate boilerplate code
- Create `package.json` files for future packages
- Add CI workflows, infra files, or environment files
- Convert conditional packages into active work without trigger confirmation

In planning mode, do:
- Clarify structure
- Identify contradictions
- Propose documentation
- Tighten package boundaries
- Improve task definitions
- Ask for approval before implementation

### Build mode

Only enter build mode after explicit human approval.
In build mode, still follow all dependency, version, export, and package-boundary rules below.

## Source-of-truth order

When documents disagree, use this precedence order:

1. `docs/AGENTS.md`
2. `DEPENDENCY.md`
3. `ARCHITECTURE.md`
4. The specific task folder files for the item being worked on
5. `TASKS.md`
6. `README.md`

If conflict remains, stop and surface the conflict instead of guessing.

## Required reading order

Before taking any meaningful action, read in this order:

1. `docs/AGENTS.md`
2. `DEPENDENCY.md`
3. `ARCHITECTURE.md`
4. The relevant task folder docs, if they exist
5. `TASKS.md` for dependency order and cross-links
6. `README.md` for phase navigation
7. If touching an existing package: that package's `README.md`, `CHANGELOG.md`, and `package.json` `exports`

## Non-negotiable rules

### Versions and installs

- Never use `latest` for core dependencies
- Never invent versions
- Use the exact pinned versions and provider rules in `DEPENDENCY.md`
- Never install a dependency in an app if an internal package is supposed to own it
- Never add a provider outside the approved provider lanes without updating governance docs first

### Turborepo rule

- Use the `tasks` key in `turbo.json`, not `pipeline`
- If an older task spec or scaffold example shows `pipeline`, treat it as outdated and do not copy it forward

### Internal dependency rules

- Always use `workspace:*` for internal package dependencies
- Never import from one app into another app
- Never import from an app into a package
- Never use cross-package relative imports
- Never import from `src` or any internal path that is not publicly exported
- Read the `exports` field before importing from a shared package

### Package creation discipline

- A package exists only when two or more consumers truly share the same code without distortion
- Do not create a shared package just because it sounds architecturally neat
- Do not create a conditional package until its trigger condition is satisfied and the human approves activation
- Treat premature package creation as a governance violation

### Planning discipline

- Planned architecture is not the same as approved implementation
- Conditional packages are not real until activated
- Reserved apps are not real until approved
- Future tooling is not real until approved
- When uncertain whether something is approved, assume it is **not**

## Dependency flow

Follow this dependency direction unless an explicit exception is documented:

- `config` and `core` sit at the base
- `marketing`, `data`, `auth`, `communication`, and `ui` may depend on lower layers as documented
- `analytics`, `experimentation`, and `lead-capture` sit above those shared domains
- `apps` may consume packages
- No package may import from an app

Additional rules:
- `core` must stay dependency-light
- `data` must not import from `ui` or `auth`
- `auth` may use `data` where required for adapters, but must not depend on `ui` or `communication`
- `marketing` may use `core` and `ui`, but not `data`, `auth`, or `communication`
- `analytics-consent-bridge` is the only package allowed to bridge analytics and compliance explicitly

## Condition-gated packages

Many packages in this repo are intentionally conditional.
Their presence in plans or task indexes does **not** mean they should be built now.

Before activating any condition-gated package:
1. Verify the trigger condition in `DEPENDENCY.md`
2. Verify the package is actually needed by the current approved scope
3. Confirm human approval
4. Then and only then begin scaffolding

Examples of condition-gated work include:
- database packages before persistent data is truly needed
- CMS packages before a real CMS-backed site is approved
- auth packages before login is required
- analytics abstraction before multiple apps need it
- experimentation, attribution, enrichment, and federation packages before real duplication appears

## What belongs where

Use these placement rules:

- Put pure types and schemas in `core-types`
- Put pure side-effect-free helpers in `core-utils`
- Put shared design tokens in `ui-theme`
- Put generic reusable UI primitives in `ui-design-system`
- Put SEO logic in `seo`, not directly in app pages/layouts
- Put database schema, migrations, and query modules in `data-db`
- Put auth provider configuration inside the appropriate auth package
- Put email rendering in `email-templates`
- Put email transport/provider logic in `email-service`

Do not place app-specific code into shared packages.
Do not place client-specific branding into shared UI packages.
Do not place provider SDK logic directly into apps when an internal package is supposed to own it.

## High-risk areas

Treat changes in these areas as high-risk and high-blast-radius:

- `packages/config`
- `packages/data/database`
- `packages/auth`
- root dependency/version config
- CI and workflow files
- import boundary enforcement
- any public package API

For high-risk changes:
- move slowly
- explain rationale
- minimize surface area
- do not combine unrelated changes
- prefer documentation and review notes before implementation

## Public API protection

Every shared package must have an explicit public API.
Assume the `exports` field is the contract.

Never:
- rename exports casually
- remove exports casually
- change function signatures casually
- expose internal files as shortcuts

If a public API must change:
- document the reason
- mark the blast radius
- specify migration expectations
- note whether the change is patch, minor, or major

## Client data isolation

If touching `@agency/data-db` or any future equivalent data layer:

- Every client-owned table must include a non-nullable `clientId`
- Every query operating on client-owned data must require `clientId`
- Every query must scope by `clientId`
- It must be structurally difficult to accidentally query across clients

If a query could possibly return another client's data, stop immediately and redesign it.

## Documentation behavior

When changing plans or structure:
- update the relevant docs first or alongside the change
- do not leave architecture decisions only in chat history
- keep terminology consistent with the repository naming system
- prefer explicit filenames and controlled vocabulary: `overview`, `spec`, `constraints`, `adr`, `guide`, `ref`, `checklist`, `prompt`, `plan`

When a new AI failure mode is discovered, update this file.

## Contradiction handling

This repository already contains planning-era inconsistencies.
Do not smooth them over silently.

When you find contradictions:
1. Quote the conflicting sources
2. State the practical risk
3. Recommend which source should win
4. Wait for approval before implementing the disputed area

## Commands and scope control

When running commands:
- use filtered commands whenever possible
- keep changes scoped to the smallest valid unit
- avoid repo-wide edits unless the task explicitly requires them

When proposing work:
- state affected packages
- state dependency impact
- state whether the work is planning-only or implementation

## Forbidden behaviors

Never:
- guess
- improvise new providers
- create speculative packages
- bypass exports
- bypass dependency boundaries
- hardcode secrets
- commit API keys
- treat placeholders as real implementation
- use outdated examples when a newer governance doc contradicts them

## Expected response behavior for AI agents

When asked to work in this repo:
1. Identify whether the request is planning or build mode
2. Read the authoritative docs in order
3. State assumptions clearly
4. Surface contradictions early
5. Keep package boundaries strict
6. Ask before crossing a control boundary
7. Prefer small, reversible changes

## Final rule

Today's shortcuts become tomorrow's structural debt.
When uncertain, stop and ask instead of guessing.