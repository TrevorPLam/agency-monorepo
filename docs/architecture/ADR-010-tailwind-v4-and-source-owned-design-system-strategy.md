# ADR-010 — Tailwind v4 and Source-Owned Design System Strategy

## Status
Accepted

## Date
2026-04-09

## Decision owners
Repository architecture owner

---

## Context

This repository already establishes that:
- Tailwind v4 is part of the approved core stack
- shadcn/ui is used with a source-owned design system approach
- `@agency/config-tailwind`, `@agency/ui-theme`, `@agency/ui-icons`, and `@agency/ui-design-system` are approved foundational packages
- Milestone 1 validates the repo through `apps/agency-website/`
- package extraction must remain app-local-first unless shared-package criteria are met

The Topic 10 problem is therefore not whether Tailwind v4 or shadcn/ui can work in the monorepo.

It is:

> What exact ownership model should govern tokens, shared UI primitives, and Tailwind setup so the UI layer stays maintainable, source-owned, and compatible with Tailwind v4’s CSS-first model?

---

## Decision

The repository adopts a **CSS-first Tailwind v4 UI architecture** with a **source-owned shared design system**.

### Tailwind model
Tailwind v4’s CSS-first model is the repo standard.

The repo does not use a JS preset-first design-system strategy as its default.

### Package ownership model

#### `@agency/config-tailwind`
Owns:
- Tailwind setup conventions
- shared CSS import conventions
- source-detection guidance for shared workspaces
- low-level Tailwind configuration support for apps

Does not own:
- long-term semantic token definitions for the design system
- shadcn component source
- branded page sections

#### `@agency/ui-theme`
Owns:
- semantic theme tokens
- light/dark theme mappings
- brand-agnostic theme variables
- shared token-level CSS contract

Does not own:
- component implementation
- app/page composition
- client-specific branded sections by default

#### `@agency/ui-icons`
Owns:
- icon exports
- icon wrappers/adapters if needed
- icon-level normalization

Does not own:
- general component styling
- app-specific icon compositions

#### `@agency/ui-design-system`
Owns:
- source-owned shadcn/Radix component source
- low-level reusable primitives
- shared UI utilities such as `cn`
- primitive wrappers and low-level compositions that are truly cross-app

Does not own:
- marketing sections
- app shells
- page composition
- branded story blocks
- campaign components

### Source-detection rule
Apps must explicitly register shared UI workspace sources when needed so Tailwind detects class usage in shared packages.

### shadcn workflow rule
The shared design-system workspace is the default shared target for reusable components.

Use the monorepo-aware shadcn workflow so:
- shared reusable components land in the shared design-system workspace
- app-local components may remain in the app when they are truly app-specific
- workspace settings that affect shared component output stay aligned

---

## Why this decision was made

### 1) Tailwind v4 is CSS-first, so token ownership must be explicit
With `@theme` and `@source`, the repo needs a clear answer to where:
- theme variables live
- shared component source lives
- shared workspace scanning is configured

### 2) Source-owned components are a repo asset only when boundaries stay clean
The value of shadcn/ui is that the component source is owned directly in the repo.

That value is lost if the design-system package becomes a dumping ground for branded or page-specific code.

### 3) Token ownership and Tailwind setup should not be conflated
Tailwind setup conventions and semantic design tokens are related, but they are not the same responsibility.

Splitting them improves clarity:
- config package = framework/setup contract
- theme package = token contract

### 4) Primitive reuse is real earlier than page-composition reuse
Buttons, inputs, dialogs, icons, and utility helpers can justify early shared ownership.
Branded sections and public-site compositions usually cannot.

### 5) Topic 10 must align with launch-slice discipline
The first validating app should use the shared UI foundation without forcing the repo into a premature public-site platform or component sprawl.

---

## Approved now

The following are approved as Topic 10 policy:

- Tailwind v4 CSS-first architecture
- `@agency/config-tailwind` as the Tailwind setup lane
- `@agency/ui-theme` as the semantic token lane
- `@agency/ui-icons` as the icon lane
- `@agency/ui-design-system` as the source-owned primitive/component lane
- explicit source-detection handling for shared UI workspaces
- shadcn-managed source ownership in the shared design-system workflow by default

---

## Conditional

The following are conditional and require explicit trigger review:

- shared content blocks
- shared public-site compositions
- client-specific brand-foundation packages
- Storybook or Ladle activation
- additional UI subpackages beyond the current approved split

---

## Deferred

The following are intentionally deferred:

- client-brand token packages before a real client requires them
- extracting page-level or marketing-level compositions into shared UI packages
- broader content-block architecture before multiple real surfaces need the same blocks
- UI package splits beyond the approved foundational packages

---

## Rejected

The following are explicitly rejected:

- JS preset-first Tailwind architecture as the repo default
- putting semantic token ownership in multiple packages simultaneously
- treating `@agency/ui-design-system` as a dumping ground for branded or page-specific code
- extracting hero sections, landing-page layouts, or campaign compositions into the design system by default
- allowing each app to invent its own token model
- adding new UI packages because they “might be useful later”

---

## Core rules

### Rule 1 — CSS-first Tailwind is the standard
Use Tailwind v4’s CSS-first model with explicit theme variables where appropriate.

### Rule 2 — Token ownership belongs to `@agency/ui-theme`
Do not let token ownership drift between config and UI packages.

### Rule 3 — Tailwind setup belongs to `@agency/config-tailwind`
Do not overload the config package with all design-system responsibility.

### Rule 4 — Design system means primitives, not page composition
Shared primitive components belong in `@agency/ui-design-system`.
Branded sections and page composition stay local unless later extraction is justified.

### Rule 5 — Source detection must be explicit when needed
If shared workspace classes are not detected automatically, apps must register those sources explicitly.

### Rule 6 — shadcn source remains governed source code
Components created or updated through the shadcn workflow are still repository code and must follow:
- README rules
- exports discipline
- tests where appropriate
- package-boundary rules

---

## What belongs where

### `@agency/config-tailwind`
- Tailwind import/setup contract
- shared low-level CSS conventions
- monorepo scanning/source-registration guidance

### `@agency/ui-theme`
- token CSS
- semantic theme variables
- dark/light theme mappings
- non-branded, cross-app theme layer

### `@agency/ui-icons`
- icon exports
- icon wrappers
- icon normalization

### `@agency/ui-design-system`
- button/input/dialog primitives
- form control primitives
- layout-neutral component primitives
- shared UI helper utilities

### App-local
- public-site sections
- app shells
- campaign pages
- branded compositions
- client-specific theme overrides until separately approved
- one-off blocks and page assemblies

---

## Consequences

### Positive consequences
- clearer UI package ownership
- better fit with Tailwind v4’s CSS-first model
- reduced token/config confusion
- lower risk of turning the design system into a dumping ground
- cleaner future extraction when second consumers are real

### Negative consequences
- more app-local UI composition remains outside shared packages longer
- token and config responsibilities require slightly more documentation discipline
- some reusable-looking components will intentionally wait for real second consumers

### Accepted tradeoff
This repository prefers:
- clear primitive-focused UI sharing now
over
- a broader but weaker “design system platform” now

That is the correct tradeoff for this phase.

---

## Implementation impact

This ADR authorizes:
- the current approved UI package split
- CSS-first Tailwind architecture
- explicit source-detection handling
- shadcn-managed source ownership in the shared design-system workflow

This ADR does **not** by itself approve:
- Storybook/Ladle activation
- client-specific theme packages
- shared marketing composition packages
- content-block architecture
- additional UI subpackages

Those remain governed by:
- `REPO-STATE.md`
- `DECISION-STATUS.md`
- `DEPENDENCY.md`

---

## Related documents

- `REPO-STATE.md`
- `DECISION-STATUS.md`
- `DEPENDENCY.md`
- `docs/AGENTS.md`
- `ARCHITECTURE.md`

---

## Change conditions

Reopen this ADR only if one of the following occurs:
- the current UI package split proves unclear in real implementation
- token ownership drifts between packages
- a second real app reveals a missing shared UI layer
- branded/page-level code begins to leak into the design system
- Tailwind or shadcn guidance changes materially