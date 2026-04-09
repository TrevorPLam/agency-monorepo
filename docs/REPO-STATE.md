# Repository State

## Purpose

This file records the current approved state of the repository.
It exists to prevent AI agents and human contributors from confusing planned architecture with approved implementation.

This is a living status document.
Update it whenever the repository changes phase, when a package moves from planned to approved, or when a roadmap item is intentionally deferred.

## Current phase

**Phase:** Planning  
**Build status:** Not started  
**Default mode for AI agents:** Planning mode  
**Implementation authority:** Human approval required before scaffolding, coding, installation, or file generation

## Core operating principle

Planned architecture is not the same as approved implementation.

A package, app, workflow, or provider is considered real only when all of the following are true:
1. The human has approved it for implementation
2. Its trigger condition has been met, if conditional
3. The work is reflected in the relevant task scope
4. The repository state below has been updated

If any of those are missing, treat the item as not approved.

## Approved now

The following items are approved at the documentation and planning level:

### Governance documents
- `README.md`
- `ARCHITECTURE.md`
- `DEPENDENCY.md`
- `docs/tasks/README.md`
- `docs/tasks/1.md`
- `docs/AGENTS.md`
- `docs/REPO-STATE.md`
- `docs/standards/tenant-isolation-data-governance.md`
- `docs/standards/dependency-truth.md`
- `docs/analytics/README.md`
- `docs/decisions/README.md`

### Approved planning work
- Repository structure planning
- Package boundary planning
- Dependency governance
- ADR planning
- Documentation design
- Task decomposition
- Naming system refinement
- Condition-trigger definitions
- Risk identification
- contradiction detection
- Cross-cutting standards ownership
- Analytics documentation ownership
- Decision-log ownership
- Client-sites family planning
- Client-portal topology planning
- Conditional E2E, Studio, API, and brand-foundation lane planning

### Approved implementation work
None yet.

## Not yet approved for implementation

The following are **not** yet approved for scaffolding or coding unless a human explicitly says so:

### Root implementation
- root `package.json`
- `pnpm-workspace.yaml`
- `turbo.json`
- `.nvmrc`
- `.gitignore`
- `.github/`
- CI workflows
- Changesets configuration
- CODEOWNERS file
- environment files
- generators
- codemods
- MCP server

### Shared packages
- all `agencyconfig-*`
- all `agencycore-*`
- all `agencyui-*`
- all marketing packages
- all data packages
- all auth packages
- all communication packages
- all analytics / experimentation / lead-capture packages
- all testing packages
- all conditional packages

### Applications
- all `apps/*`
- internal tools
- agency website
- client portal
- docs site
- email preview app
- Sanity Studio app
- API app

## Package state model

Use these exact state labels:

- `planned` — exists in architecture or tasks, but not approved to build
- `approved` — approved to build, but not yet scaffolded
- `active` — scaffolded or implemented in repository
- `conditional` — may exist in plans, but blocked until trigger is met
- `deferred` — intentionally postponed
- `cancelled` — intentionally removed from future scope

## Current package states

### Always-foundational packages
| Package | State | Notes |
|---|---|---|
| `agencyconfig-eslint` | planned | Foundational, but not approved to scaffold yet |
| `agencyconfig-typescript` | planned | Foundational, but not approved to scaffold yet |
| `agencyconfig-tailwind` | planned | Foundational, but not approved to scaffold yet |
| `agencyconfig-prettier` | planned | Foundational, but not approved to scaffold yet |
| `agencyconfig-react-compiler` | planned | Optional / opt-in behavior must stay explicit |

### Core packages
| Package | State | Notes |
|---|---|---|
| `agencycore-types` | planned | Foundational after config |
| `agencycore-utils` | planned | Foundational after core-types |
| `agencycore-constants` | planned | Foundational after core-types |
| `agencycore-hooks` | planned | Planned, not approved yet |

### UI packages
| Package | State | Notes |
|---|---|---|
| `agencyui-theme` | planned | Shared design tokens only |
| `agencyui-icons` | planned | Shared icon exports only |
| `agencyui-design-system` | planned | Build minimally, only for real consumers |

### Marketing packages
| Package | State | Notes |
|---|---|---|
| `agencyseo` | conditional | Build when multiple surfaces need consistent SEO |
| `agencycompliance` | conditional | Build when real consent UI is needed |
| `agencycompliance-security-headers` | conditional | Build only for compliance or audit need |
| `agencymonitoring` | conditional | Build when real user data is needed |
| `agencymonitoring-rum` | conditional | Build when ranking-critical traffic justifies it |

### Data packages
| Package | State | Notes |
|---|---|---|
| `agencydata-db` | conditional | Build when first internal tool truly needs persistence |
| `agencydata-cms` | conditional | Build when first real CMS-backed client site is confirmed |
| `agencydata-content-federation` | conditional | Build only for genuine multi-source content |
| `agencydata-ai-enrichment` | conditional | Build only when content scale justifies it |
| `agencydata-api-client` | conditional | Build only when 2 apps share the same internal API |

### Auth packages
| Package | State | Notes |
|---|---|---|
| `agencyauth-internal` | conditional | Build when first internal tool requires auth |
| `agencyauth-portal` | conditional | Build when first client portal requires login |

### Communication packages
| Package | State | Notes |
|---|---|---|
| `agencyemail-templates` | conditional | Build with first transactional email flow |
| `agencyemail-service` | conditional | Build with first transactional email flow |
| `agencynotifications` | conditional | Build when 2 workflows need shared notifications |

### Analytics / experimentation / lead capture
| Package | State | Notes |
|---|---|---|
| `agencyanalytics` | conditional | Build when multiple apps need shared analytics abstraction |
| `agencyanalytics-attribution` | conditional | Build only when cross-channel attribution matters |
| `agencyanalytics-consent-bridge` | conditional | Build only when 2 analytics systems need shared consent logic |
| `agencyexperimentation` | conditional | Build when experimentation is actually planned |
| `agencyexperimentation-edge` | conditional | Build only for edge-assigned marketing tests |
| `agencylead-capture` | conditional | Build when lead forms are truly needed |
| `agencylead-capture-progressive` | conditional | Build when form complexity or abandonment justifies it |
| `agencylead-capture-enrichment` | conditional | Build when sales workflow requires enrichment |

### Testing and tooling
| Package / Tool | State | Notes |
|---|---|---|
| `agencytest-setup` | conditional | Build when repeated test setup duplication appears |
| `agencytest-fixtures` | conditional | Build when repeated fixture duplication appears |
| app generator | planned | Documentation may exist before implementation |
| package generator | planned | Documentation may exist before implementation |
| db seed tooling | planned | Not approved to build yet |
| codemods | planned | Not approved to build yet |
| content pipeline | conditional | Build when AI-assisted content operations are real |
| MCP server | deferred | Growth-stage tool, not a planning-phase build item |

### Documentation task families
| Task family | State | Notes |
|---|---|---|
| `a5-docs-tenant-isolation-data-governance` | approved | Documentation-authorized now; owns the tenant-isolation planning source |
| `a6-docs-dependency-truth-version-authority` | approved | Documentation-authorized now; owns dependency-truth governance |
| `a7-docs-analytics-guides` | approved | Documentation-authorized now; owns `docs/analytics/` |
| `a8-docs-decisions-log` | approved | Documentation-authorized now; owns `docs/decisions/` |

### Apps
| App | State | Notes |
|---|---|---|
| root repo shell | planned | Not scaffolded |
| internal CRM / tools app | planned | First likely real app later |
| agency website | planned | Important, but still not approved to build |
| client sites family | conditional | Family owner exists; activate per approved client build |
| client portal | conditional | Build when a real login-enabled portal is required; default path is `apps/client-sites/[client]-portal/` |
| docs site | deferred | Nice-to-have, not current priority |
| email preview app | deferred | Build only when email work becomes active |
| Sanity Studio app | conditional | Build only with CMS activation |
| API app | conditional | Build only if shared API surface becomes real |

### App and package planning lanes added by gap fill
| Task family | State | Notes |
|---|---|---|
| `e4-apps-client-portal` | conditional | Planning lane exists; implementation still gated |
| `e5-apps-playwright-e2e` | conditional | Planning lane exists; implementation still gated |
| `e8-apps-studio` | conditional | Planning lane exists; implementation still gated |
| `e9-apps-api` | conditional | Planning lane exists; implementation still gated |
| `e10-apps-client-sites-foundation` | conditional | Planning lane exists; implementation still gated |
| `f3-apps-client-sites-brand-foundation` | conditional | Planning lane exists; implementation still gated |

## Locked decisions

The following decisions should be treated as approved unless a future ADR explicitly changes them:

- pnpm workspace monorepo
- Turborepo for orchestration
- `tasks` key in `turbo.json`, never `pipeline`
- internal dependencies use `workspace:*`
- explicit package `exports`
- no package may import from an app
- provider choices must follow `DEPENDENCY.md`
- conditional packages stay unbuilt until triggered
- self-discipline over speculative package creation
- package taxonomy remains domain-grouped, not flattened

## Known tensions and unresolved items

The repository contains planning-era tensions.
These are known and should not be “fixed” implicitly by an AI agent.

### Open items
- Final initial package count is not locked
- Exact first implementation milestone is not locked
- Whether React Compiler is enabled in the first shipped app is not locked
- Which planned infra items should exist before the first app is not fully locked
- Some task inventory totals and planning references differ across documents
- Some older examples may still show legacy structures or outdated naming

### Rule for unresolved items
When an item is unresolved:
1. Do not guess
2. Do not scaffold
3. Do not silently normalize docs
4. Surface the ambiguity
5. Ask for a ruling or create an ADR candidate

## Activation rule

A conditional item may move from `conditional` to `approved` only when:
1. its trigger condition is met,
2. the human explicitly approves activation,
3. dependent prerequisites are already approved,
4. this file is updated.

## Change log for state

Use this section for human-readable state transitions.

### 2026-04-08
- Repository marked as planning-only
- Default AI mode set to planning mode
- No packages approved for implementation yet
- `docs/AGENTS.md` established as behavioral control file
- `docs/REPO-STATE.md` established as current-state control file

### 2026-04-09
- Added documentation-authorized task families `a5` through `a8`
- Added conditional planning lanes `e4`, `e5`, `e8`, `e9`, `e10`, and `f3`
- Established `docs/tasks/README.md` as the canonical task index and marked top-level `tasks/` as legacy
- Resolved the default client-portal topology to `apps/client-sites/[client]-portal/`