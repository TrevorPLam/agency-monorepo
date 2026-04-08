# AGENTS.md

## Purpose

This file defines the operating rules for AI coding agents working in this repository.

These rules are not suggestions.
They are hard constraints.

If a request conflicts with this file, this file wins unless the repository owner explicitly overrides it.

This monorepo is designed for long-term control, low drift, and safe reuse across agency apps, shared packages, internal tools, and client deployments.
Your job is not only to make code work.
Your job is to preserve architecture.

---

## Mission

When working in this repository, optimize for:

1. Architectural stability
2. Explicit package boundaries
3. Safe shared-package evolution
4. Minimal blast radius
5. Clear documentation
6. Deterministic implementation
7. Low AI drift

Do not optimize for speed at the expense of structure.

---

## Repository model

This is a domain-grouped monorepo.

Top-level areas:

- `apps/`
- `packages/`
- `tools/`
- `docs/`
- `.github/`

Primary package domains:

- `packages/config/*`
- `packages/core/*`
- `packages/data/*`
- `packages/auth/*`
- `packages/communication/*`
- `packages/ui/*`
- `packages/testing/*`

Typical examples include:

- `agencyconfig-eslint`
- `agencyconfig-typescript`
- `agencyconfig-tailwind`
- `agencycore-types`
- `agencycore-utils`
- `agencycore-constants`
- `agencycore-hooks`
- `agencydata-db`
- `agencydata-cms`
- `agencydata-api-client`
- `agencyauth-internal`
- `agencyauth-portal`
- `agencyemail-templates`
- `agencyemail-service`
- `agencynotifications`
- `agencyui-theme`
- `agencyui-icons`
- `agencyui-design-system`
- `agencytest-setup`
- `agencytest-fixtures`

Apps may consume packages.
Packages must never consume apps.

---

## Authority order

When deciding what to do, use this order of authority:

1. Direct owner instruction in the current session
2. `docs/AGENTS.md`
3. Relevant task folder docs
4. Package-local `README.md`
5. Package `CHANGELOG.md`
6. Package `package.json`
7. Existing code patterns already used in the repo

If sources conflict, stop and explain the conflict before changing code.

---

## Required reading before any change

Before modifying any shared package, you must read:

1. The relevant task folder documents, if they exist
2. The target package `README.md`
3. The target package `CHANGELOG.md`
4. The target package `package.json`
5. The package `exports` field
6. Relevant `CODEOWNERS` entries
7. Any directly related ADRs in `docs/architecture/` or `docs/decisions/`

Do not start coding until you understand:

- What the package is for
- Who consumes it
- What is public API
- What is internal implementation detail
- Whether the requested change affects other consumers

If the package has no README, no exports, or unclear ownership, stop and report that gap first.

---

## Task document reading order

If a task folder exists, read its documents in this order:

1. `00-*-overview.md`
2. `01-*-spec.md`
3. `02-*-constraints.md`
4. `03-*-adr-*.md`
5. `04-*-guide-*.md`
6. `05-*-qa-checklist.md`
7. `06-*-handoff-prompt.md`

Treat the task folder as the implementation contract.

Do not skip from the overview directly into coding.

---

## Dependency flow

The repository follows a strict low-to-high dependency model.

Allowed direction:

`config -> core -> data/auth/communication/ui -> apps`

Interpretation:

- `config` packages sit at the bottom
- `core` may depend only on `config` and other allowed low-level internals
- `data`, `auth`, `communication`, and `ui` may depend on `config` and `core`
- apps may depend on any package domain
- no package may import from any app

### Hard rules

- Never import from a higher-level domain into a lower-level domain
- Never create circular dependencies
- Never move business logic into `core` just because multiple apps need it
- Never place app-specific code into shared packages
- Never use shared packages as dumping grounds

### Examples

Allowed:

- `packages/ui/*` importing from `packages/core/*`
- `packages/data/*` importing from `packages/core/*`
- `apps/*` importing from `packages/ui/*`

Forbidden:

- `packages/core/*` importing from `packages/ui/*`
- `packages/core/*` importing from `packages/data/*`
- `packages/data/*` importing from `packages/auth/*`
- any package importing from `apps/*`

If you think a forbidden import is necessary, stop and explain the design problem instead of implementing it.

---

## Public API rules

Every shared package is treated like a product.

That means:

- It must have a clear purpose
- It must have consumers
- It must expose a deliberate public API
- It must hide internal implementation details

### Exports rules

- Only import from paths listed in the package `exports` field
- Never import from `src/` across package boundaries
- Never create new deep imports into internal files
- Never bypass the public API to “make it work”

Examples of forbidden imports:

- `packages/data/database/src/internal/client`
- `agencycore-utils/src/formatters/currency`
- relative imports that cross package boundaries

Only package authors control the public surface.

If an export you need does not exist, add it intentionally or stop and ask for approval.

---

## Internal dependency rules

For internal package dependencies:

- Use `workspace:*`
- Never use relative filesystem paths across package boundaries
- Never copy code from one package into another to avoid proper dependency wiring
- Never add an internal dependency casually; justify it

Before adding a new internal dependency, ask:

1. Is this truly shared?
2. Is the dependency direction legal?
3. Does this widen the package blast radius?
4. Would this be better kept inside the app?

If reuse is speculative, do not create the dependency.

---

## Shared package discipline

A shared package exists only when two or more consumers genuinely share the same logic without distortion.

### Do not create a package when:

- Only one app needs the code
- The code is still evolving rapidly and has no stable API
- The second consumer is hypothetical
- The two consumers need materially different behavior

### Do create or extend a package when:

- Two or more consumers need the same behavior
- The shared surface can remain clean and generic
- The package has a clear owner and documentation path

If shared code starts bending around conflicting consumer needs, move consumer-specific behavior back into the app layer.

---

## Condition-gated packages

This repository uses condition-gated implementation.

Do not scaffold or build optional packages just because they sound useful.

Only build condition-gated packages when their documented trigger is met in the task system.

Examples of condition-gated areas include:

- SEO package
- compliance package
- RUM
- CMS package
- content federation
- AI content enrichment
- API client
- internal auth
- portal auth
- email stack
- notifications
- analytics abstraction
- attribution
- consent bridge
- edge experimentation
- progressive forms
- lead enrichment
- shared testing packages
- observability package
- content blocks
- i18n
- AI content pipeline
- MCP server

If the trigger is not clearly met, do not build it.

---

## Generator-first rule

When creating a new app, package, task scaffold, or other repeated structure:

- Use the generator in `tools/generators` if one exists
- If no generator exists, check whether creating one is more appropriate than manual scaffolding
- Never copy an existing app or package directory manually as the default approach

Manual copy-paste scaffolding causes structural drift.
Generator-first scaffolding preserves consistency.

---

## Change management rules

### For any shared package change

You must determine whether the change is:

- Patch
- Minor
- Major

### Patch

Use for:

- bug fixes
- internal refactors
- performance improvements
- test additions
- documentation improvements
- non-breaking implementation cleanup

### Minor

Use for:

- new exports
- new optional configuration
- new backward-compatible components
- additive utility behavior

### Major

Use for:

- renamed exports
- removed exports
- changed function signatures
- changed required props
- changed return shapes
- changed schema contracts
- changed auth/session expectations
- anything that forces consumers to update code

### Major-change rule

Never rename, remove, or change an exported API without:

1. A changeset
2. A migration note
3. A clear statement of consumer impact
4. Owner awareness

Preferred pattern:

1. Add new API alongside old API
2. Mark old API deprecated
3. Give consumers one release cycle
4. Remove old API later in a major change

---

## Testing rules

Any behavior change in a shared package requires test updates.

Minimum expectations:

- unit tests for the changed behavior
- integration coverage when package behavior affects consumers
- smoke coverage in a real app when blast radius is high

Do not claim a change is complete if tests were not updated where needed.

At minimum, report:

- what tests were added or updated
- what commands were run
- what was not tested yet

Use filtered commands when possible.
Do not run the entire monorepo unless necessary.

Examples:

- `pnpm --filter agencycore-utils test`
- `pnpm --filter agencyui-design-system typecheck`
- `pnpm turbo build --filter=agencydata-db...`

---

## Documentation rules

Every shared package should have:

- `README.md`
- `CHANGELOG.md`
- `package.json`
- explicit `exports`
- at least one usage example
- local runnable scripts

When you modify a package, update documentation if behavior, usage, or exports changed.

AI agents must not leave package docs stale after changing the package interface.

---

## High-risk areas

Treat these as high-risk and stop to think before changing them:

- `packages/config/*`
- `packages/data/database/*` or equivalent DB packages
- `packages/auth/*`
- root workspace config
- CI workflows
- release workflows
- security headers
- environment management
- workspace boundary enforcement

Why these are high-risk:

- config changes can affect every package
- DB changes can affect every data consumer
- auth changes can break session behavior across apps
- CI changes can hide failures or block delivery
- environment mistakes can cause production instability

For high-risk changes, do this before coding:

1. Restate the requested scope
2. Identify all likely downstream consumers
3. State the blast radius
4. Propose the smallest safe change
5. Then implement

---

## Data isolation rules

Client isolation is non-negotiable.

When working in shared data access code:

- every client-owned table must include client scoping as designed by the data package
- every query that operates on client-owned data must require and enforce client scope
- never make client scoping optional for convenience
- never return cross-client data in a shared query helper

If a query function can be called without client scoping where scoping is required, treat that as a structural bug.

When changing database schema or query modules:

- prefer generated migrations
- do not hand-write destructive migrations unless explicitly required
- flag destructive changes clearly
- require a rollback or phased migration plan for destructive work

---

## Secrets and environment rules

Never commit:

- API keys
- tokens
- passwords
- client secrets
- `.env` values
- copied production credentials
- example secrets that look real

Use environment variable names only.
If a value is needed for local development, request the variable name and expected format, not the secret itself.

---

## Session operating protocol

At the start of a coding task, respond with:

1. Scope summary
2. Files likely to change
3. Packages or apps affected
4. Risk level: low / medium / high
5. Whether a changeset is likely required
6. Whether tests/docs will need updates

Before making high-risk changes, pause for confirmation unless the owner explicitly asked for immediate execution.

For medium- and low-risk changes, proceed, but stay within the requested scope.

---

## Scope-control rules

Do not widen scope without permission.

That means:

- do not refactor neighboring packages “while you are there”
- do not rename files for style reasons
- do not upgrade dependencies opportunistically
- do not introduce new abstractions unless the current task requires them
- do not build future packages early
- do not convert app code into shared code without proving reuse

Finish the requested task first.
Then separately recommend follow-up improvements if needed.

---

## App vs package rules

### Code belongs in an app when:

- it is client-specific
- it is brand-specific
- it is one-off marketing UI
- it is tied to one workflow
- it depends on one app’s internal state or routes

### Code belongs in a shared package when:

- two or more consumers need it now
- it has a stable API shape
- it can be documented clearly
- it can be tested independently
- it fits an existing domain cleanly

When in doubt, keep code closer to the app.

---

## UI package rules

For `agencyui-theme`, `agencyui-icons`, and `agencyui-design-system`:

- keep them generic
- keep them accessible
- do not insert client branding
- do not place one-off marketing sections in the design system
- do not add components that only one app can use
- prefer composition over overly-specific components

A hero section for one client website does not belong in the design system.
A generic button, input, modal, table, or empty state may belong there.

---

## Core package rules

For `agencycore-*` packages:

- keep them dependency-light
- keep them pure where intended
- avoid side effects
- avoid app assumptions
- avoid UI imports
- avoid database access
- avoid environment reads unless the package purpose explicitly permits it

`agencycore-utils` is not a miscellaneous bucket.
If logic is not truly generic and pure, it likely belongs elsewhere.

---

## Auth package rules

Internal auth and portal auth are separate on purpose.

Do not merge their logic casually.

- internal auth is for agency-operated internal tools
- portal auth is for client-facing logged-in experiences

Never leak assumptions from one auth context into the other.

Changes in auth packages require special caution around:

- session shape
- RBAC
- middleware
- organization membership
- impersonation
- 2FA or passkeys
- redirects
- provider configuration

---

## Communication package rules

Email and notifications must remain provider-abstracted where the architecture says they should.

Do not let app code depend directly on a provider SDK if the package abstraction already exists.

Apps should call stable internal interfaces.
Provider selection belongs inside the package.

---

## CODEOWNERS awareness

Before changing a shared area, identify the responsible review owner from `CODEOWNERS`.

In your final handoff, mention which ownership area was affected.

Do not make broad shared-package changes as though they are local-only edits.

---

## Output contract for implementation work

When you finish a task, report using this structure:

### Result
- What was changed

### Files changed
- List of files touched

### Boundary check
- Confirm dependency direction remained valid
- Confirm no app imported a package internals path
- Confirm no package imported from an app

### API impact
- Patch / Minor / Major
- Whether a changeset was added or is required
- Whether migration notes are required

### Validation
- Tests run
- Typecheck run
- Lint run
- Anything not yet validated

### Documentation
- README updated or not needed
- CHANGELOG updated or not needed
- Task docs updated or not needed

### Risks
- Any remaining risks, assumptions, or follow-ups

---

## Stop conditions

Stop immediately and ask for clarification if:

- the requested change conflicts with package boundaries
- the correct domain for new code is unclear
- the change appears to require a new package
- a major public API break seems necessary
- data isolation rules may be weakened
- auth behavior may change across apps
- the task docs and the codebase disagree
- the repo is missing required documentation needed to proceed safely

Do not guess through structural uncertainty.

---

## Default philosophy

This repository is intentionally designed to scale from a small founder-led build process into a governed multi-app platform.

Your job is to preserve that trajectory.

Prefer:

- small scoped changes
- explicit APIs
- generators over duplication
- package discipline over convenience
- documentation over tribal knowledge
- stability over cleverness

Build only what is needed now.
Shape it so future growth is easy.
Do not invent the future early.