# REPO-STATE.md

> **Purpose of this document**  
> This is the implementation-state authority for the repository.  
> It answers one question: **what is approved to build now?**
>
> If a package, app, tool, or workflow is described elsewhere but is not approved here, it is **not approved for scaffolding or implementation**.
>
> **Implementation precedence**
> 1. `REPO-STATE.md`
> 2. `DECISION-STATUS.md`
> 3. `DEPENDENCY.md`
> 4. package-level 01-config-biome-migration-50-ref-quickstart.md + `package.json` `exports`
> 5. `ARCHITECTURE.md` (target-state reference only)

---

## Status summary

### Current implementation phase
**Planning / pre-implementation governance phase**

### What this means
The repository is still in planning mode.  
Implementation should be limited to:
- the approved launch slice
- the governance spine
- the foundational packages explicitly approved here

### Not allowed
- broad repo-wide scaffolding based only on target-state architecture
- activating conditional packages before their trigger is satisfied
- creating new shared packages without explicit approval here
- widening milestone scope because a future package/app seems “close enough”
- adding tooling or infrastructure because it is “future useful”

---

## Governing rules

### Rule 1 — Approval is explicit
If something is not marked **Approved now** in this file, it is not approved.

### Rule 2 — Conditional packages stay conditional
A package listed in `ARCHITECTURE.md` or `DEPENDENCY.md` is still **not approved** unless:
- its trigger is satisfied, and
- this file says it is approved

### Rule 3 — Smallest correct milestone wins
Implementation follows the smallest real milestone that respects:
- dependency activation rules
- package extraction rules
- launch-slice rules
- current locked topic decisions

### Rule 4 — App-local first
If a capability can stay inside an app for the current milestone, keep it app-local unless a shared-package approval exists here.

### Rule 5 — Stop on ambiguity
If there is any conflict between target-state architecture and this file, follow this file and stop for decision review if needed.

---

## Topic lock summary

| Topic | Status | Implementation effect |
|---|---|---|
| 1. Monorepo foundation strategy | Locked | Use pnpm + Turborepo now; Nx deferred |
| 2. AI-governed planning and anti-drift controls | Locked | Governance spine required before broad implementation |
| 3. Domain-grouped package boundaries and extraction rules | Locked | App-local first; new shared packages need approval |
| 4. Launch-slice strategy | Locked | Agency website is the first validating app |
| 5. Dependency-truth and version-governance | Locked | `DEPENDENCY.md` is version authority; machine drift checks required |
| 6. Tenant isolation and client-data safety | Locked | Future data/auth work must use row-level tenant scoping + RLS defense-in-depth |
| 7. Marketing-site architecture in shared monorepo | Locked | Public-site apps stay separate; branded/campaign logic stays app-local by default |
| 8. Next.js 16 as the repo-wide application platform | Locked | Next.js App Router is the default app framework; Route Handlers first; `apps/api` remains deferred |
| 9. React 19 and React Compiler adoption policy | Locked | Compiler-ready but off by default; lint first; annotation-mode pilot before broader enablement |
| 10. Tailwind v4 and source-owned design system strategy | Locked | CSS-first Tailwind; token/setup/component ownership split across approved UI packages |

---

## Approved now — governance spine

These items are approved immediately because they are required to make later implementation safe.

### Governance documents
- `REPO-STATE.md`
- `DECISION-STATUS.md`
- `DEPENDENCY.md`
- `docs/AGENTS.md`
- ADRs for Topics 1–10

### Repo governance and enforcement
- `.github/CODEOWNERS`
- CI baseline
- ESLint boundary enforcement
- explicit package `exports`
- Changesets for shared-package version intent
- `workspace:*` for internal dependencies
- root lockfile governance
- dependency drift-check job

### Governance review documents
- `docs/governance/shared-package-acceptance-checklist.md`
- `docs/governance/new-package-proposal-template.md`
- `docs/governance/version-authority-audit-checklist.md`
- `docs/governance/tenant-isolation-review-checklist.md`
- `docs/governance/public-site-boundary-checklist.md`
- `docs/governance/dedicated-api-extraction-checklist.md`
- `docs/governance/react-compiler-adoption-checklist.md`
- `docs/governance/ui-boundary-review-checklist.md`

---

## Approved now — monorepo foundation

### Root repository scaffolding
- root `package.json`
- `pnpm-workspace.yaml`
- `turbo.json` using `tasks`
- `.gitignore`
- `.nvmrc`
- `01-config-biome-migration-50-ref-quickstart.md`

### Approved core stack direction
- pnpm workspaces
- Turborepo
- Next.js App Router
- React 19
- Tailwind v4
- shadcn/ui source-owned design system approach

### Explicitly not approved now
- Nx
- repo-specific MCP server
- private package registry
- dedicated API app
- separate backend framework by default
- worker/service infrastructure by default
- enterprise-scale CI/distribution features
- platform-portability infrastructure beyond approved app needs

---

## Approved now — launch slice strategy

The repository uses a **two-step launch-slice strategy**.

### Milestone 1 — Public website slice
**First validating app:** `apps/agency-website/`

#### Approved now in Milestone 1

##### Config packages
- `@agency/config-eslint`
- `@agency/config-typescript`
- `@agency/config-tailwind`
- `@agency/config-prettier`
- `@agency/config-react-compiler`

##### Core packages
Only the packages actually needed by the first app:
- `@agency/core-types`
- `@agency/core-utils`
- `@agency/core-constants`
- `@agency/core-hooks`

##### UI packages
Only the packages actually needed by the first app:
- `@agency/ui-theme`
- `@agency/ui-icons`
- `@agency/ui-design-system`

##### App
- `apps/agency-website/`

#### Approved implementation style in Milestone 1
- Next.js App Router is the default app framework
- Route Handlers inside App Router if server endpoints are needed
- app-local SEO if only one public surface exists
- app-local analytics if only one app exists
- app-local monitoring if package triggers are not met
- branded sections and page/campaign composition remain app-local
- React Compiler config package may exist, but compiler rollout remains off by default
- Tailwind v4 CSS-first setup with approved shared UI package boundaries

#### Not approved in Milestone 1
- `apps/internal-tools/crm/`
- `apps/api`
- `@agency/data-db`
- `@agency/auth-internal`
- `@agency/auth-portal`
- `@agency/email-templates`
- `@agency/email-service`
- `@agency/analytics`
- `@agency/monitoring`
- `@agency/monitoring-rum`
- `@agency/data-cms`
- `@agency/data-content-federation`
- `@agency/data-ai-enrichment`
- `@agency/data-api-client`
- `@agency/notifications`
- `@agency/experimentation`
- `@agency/experimentation-edge`
- `@agency/analytics-attribution`
- `@agency/analytics-consent-bridge`
- `@agency/lead-capture`
- `@agency/lead-capture-progressive`
- `@agency/lead-capture-enrichment`
- `@agency/test-setup`
- `@agency/test-fixtures`
- `@agency/content-blocks`
- client-specific brand-foundation packages
- Storybook or Ladle activation unless separately approved
- separate backend frameworks
- worker/service infrastructure

#### Milestone 1 rule
Do not activate a shared package in Milestone 1 if the need can be satisfied app-locally and the package trigger is not yet met.

---

### Milestone 2 — First authenticated internal slice
**Second validating app:** expected `apps/internal-tools/crm/`

#### Approved when Milestone 2 begins
- `apps/internal-tools/crm/`
- `@agency/data-db`
- `@agency/auth-internal`

#### Conditionally approvable within Milestone 2
Only if the app actually requires them and the relevant trigger is satisfied:
- `@agency/email-templates`
- `@agency/email-service`
- `@agency/compliance`
- `@agency/seo`
- `@agency/analytics`

#### Still not approved by default in Milestone 2
Unless separately approved after trigger review:
- `apps/api`
- `@agency/monitoring`
- `@agency/monitoring-rum`
- `@agency/data-cms`
- `@agency/auth-portal`
- `@agency/notifications`
- `@agency/experimentation`
- `@agency/experimentation-edge`
- `@agency/analytics-attribution`
- `@agency/analytics-consent-bridge`
- `@agency/data-api-client`
- `@agency/data-content-federation`
- `@agency/data-ai-enrichment`
- `@agency/lead-capture`
- `@agency/lead-capture-progressive`
- `@agency/lead-capture-enrichment`
- `@agency/test-setup`
- `@agency/test-fixtures`
- `@agency/content-blocks`
- client-specific brand-foundation packages
- repo-specific MCP server
- Nx
- separate backend framework by default
- worker/service infrastructure by default

---

## Shared package approval state

### Always approved
These are foundational and may be created now:
- `@agency/config-*`
- `@agency/core-*`
- `@agency/ui-*`

### Not automatically approved
Even if listed in architecture, these require explicit trigger satisfaction plus approval here:
- `@agency/seo`
- `@agency/compliance`
- `@agency/compliance-security-headers`
- `@agency/monitoring`
- `@agency/monitoring-rum`
- `@agency/data-db`
- `@agency/data-cms`
- `@agency/data-content-federation`
- `@agency/data-ai-enrichment`
- `@agency/data-api-client`
- `@agency/auth-internal`
- `@agency/auth-portal`
- `@agency/email-templates`
- `@agency/email-service`
- `@agency/notifications`
- `@agency/analytics`
- `@agency/analytics-attribution`
- `@agency/analytics-consent-bridge`
- `@agency/experimentation`
- `@agency/experimentation-edge`
- `@agency/lead-capture`
- `@agency/lead-capture-progressive`
- `@agency/lead-capture-enrichment`
- `@agency/test-setup`
- `@agency/test-fixtures`
- `@agency/content-blocks`
- client-specific brand-foundation packages

---

## Shared package extraction rule

A new shared package may be approved only when all are true:
1. it has two real consumers
2. both consumers can use the same API without distortion
3. it has a clear domain home
4. its dependencies fit the allowed repo dependency flow
5. its public API can be defined via explicit `exports`
6. it has an owner, README, and tests
7. it is approved in this file

If any of these are false, the code stays app-local.

---

## Tooling approval state

### Approved now
- Changesets
- root lockfile workflow
- CI drift checks
- filtered Turborepo commands
- package boundary linting
- generator planning/specification work

### Deferred
- package generators as required implementation path
- codemods
- MCP server
- Nx migration work
- distributed task execution
- private registry publishing
- repo-wide Storybook/Ladle adoption
- repo-wide portability infrastructure
- worker/service platform scaffolding

---

## Dependency governance state

### Approved now
- `DEPENDENCY.md` as human dependency authority
- machine truth in root manifests, lockfile, workspace config, and CI
- `workspace:*` for internal dependencies
- no `latest` in repo manifests
- dependency changes must begin with `DEPENDENCY.md`

### Required cleanup before broad implementation
- normalize exact version references in `DEPENDENCY.md`
- remove or de-authorize duplicated exact pin tables outside `DEPENDENCY.md`
- normalize React Compiler integration/lint wording in `DEPENDENCY.md`
- normalize Tailwind/shadcn ownership wording in `DEPENDENCY.md`
- add dependency drift checks to CI

---

## Tenant-isolation implementation state

### Current approval effect
Topic 6 is locked as repository policy, but it does not activate new Milestone 1 packages.

### Milestone 1
Still not approved:
- `@agency/data-db`
- `@agency/auth-internal`
- `@agency/auth-portal`

### Milestone 2 rule
When Milestone 2 begins and `@agency/data-db` is activated:
- every client-owned table must include `client_id`
- client-owned query helpers must require explicit tenant scope
- RLS must be applied to client-owned tables as defense-in-depth
- dual-tenant leakage tests are required before the package is considered stable

### Escalation rule
Do not move to schema-per-tenant or database-per-tenant by default.  
Use stronger isolation only when an approved tenant/app requirement justifies it.

---

## Public-site implementation state

### Current approval effect
Topic 7 is locked as repository policy, but it does not widen Milestone 1 package approval.

### Milestone 1 public-site rule
For the agency website:
- keep branded sections app-local
- keep campaign/page composition app-local
- keep SEO/analytics/monitoring app-local unless package triggers are explicitly satisfied and approved

### Future client-site rule
Do not define detailed client-sites family standards yet.  
Handle that later when the client-sites family topic is activated by a real approved client site.

---

## Application-platform implementation state

### Current approval effect
Topic 8 is locked as repository policy, but it does not widen Milestone 1 approval.

### Approved now
- Next.js 16 App Router is the default app framework for approved app surfaces
- Route Handlers are the default early server model

### Still not approved
- `apps/api`
- separate backend framework adoption by default
- worker/service infrastructure
- portability infrastructure beyond approved app needs

### Dedicated API rule
Do not create `apps/api` unless a later explicit review confirms the extraction trigger.

---

## React Compiler implementation state

### Current approval effect
Topic 9 is locked as repository policy.

### Approved now
- `@agency/config-react-compiler` may exist in Milestone 1
- compiler-related lint preparation is allowed

### Not approved by default
- enabling React Compiler in all apps
- app-wide infer-mode enablement in Milestone 1
- compiler-driven shared-package refactors
- mass memoization cleanup

### Pilot rule
If React Compiler is enabled in an approved app during early phases:
- use annotation mode first
- keep scope intentionally limited
- preserve rollback simplicity

---

## UI implementation state

### Current approval effect
Topic 10 is locked as repository policy.

### Approved now
- `@agency/config-tailwind`
- `@agency/ui-theme`
- `@agency/ui-icons`
- `@agency/ui-design-system`

### UI ownership rule
Use the approved split:
- config-tailwind = Tailwind setup
- ui-theme = semantic tokens
- ui-icons = icons
- ui-design-system = shared primitives

### Milestone 1 UI rule
For `apps/agency-website/`:
- shared primitives may be consumed from the approved UI packages
- branded sections and page composition stay app-local
- do not widen the design-system package with one-app marketing components

### Not approved by default
- extra UI subpackages
- client-brand token packages
- shared content-block packages
- Storybook/Ladle activation unless separately approved

---

## AI implementation operating state

### AI tools may
- scaffold only items marked approved here
- build only within the current approved milestone
- keep logic app-local by default
- use Route Handlers instead of creating `apps/api` in early phases
- use Next.js App Router as the default approved app framework
- prepare compiler lint/config support without broadly enabling React Compiler
- use the approved UI package split for primitives/tokens/setup/icons
- propose, but not scaffold, deferred packages

### AI tools must not
- infer approval from `ARCHITECTURE.md`
- scaffold conditional packages early
- create shared packages without approval here
- add Nx
- add MCP infrastructure
- create `apps/api` in Milestone 1
- activate data/auth/email/CMS packages in Milestone 1 unless explicitly approved here
- treat future reuse as current justification
- enable React Compiler broadly by assumption
- move branded/page-specific UI into `@agency/ui-design-system`
- introduce schema-per-tenant or database-per-tenant as a default repo model
- introduce separate backend frameworks or worker/service lanes without explicit approval

---

## Exit criteria for moving beyond Milestone 1

Milestone 1 is considered complete when:
- governance spine exists
- first app builds, lints, typechecks, and deploys
- approved config/core/ui packages are consumed successfully
- no non-approved packages were activated
- package extraction stayed app-local where required
- branded/public-site composition remained app-local where required
- no premature React Compiler rollout occurred
- no premature data/auth/backend lane was activated

Milestone 2 may begin only when:
- Milestone 1 is stable
- first internal-tool need is approved
- `@agency/data-db` and `@agency/auth-internal` are explicitly entered into active implementation

---

## Change control for this document

Any update to this file must answer:
1. what is being newly approved or deferred
2. which topic decision authorizes the change
3. what milestone the change belongs to
4. whether any dependency trigger or package extraction rule is being activated
5. what AI tools are now allowed to do that they could not do before