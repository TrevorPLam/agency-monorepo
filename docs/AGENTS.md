# docs/AGENTS.md

> **Purpose of this document**  
> This is the operating contract for AI coding tools working in this repository.
>
> These rules are not suggestions. They are **hard constraints**.
>
> The goal of this file is to prevent:
> - architectural drift
> - premature package creation
> - dependency drift
> - package-boundary violations
> - target-state docs being mistaken for build approval
> - structurally plausible but repo-invalid code changes

---

## 1) Read this first

Before making any change, follow this document order:

1. `REPO-STATE.md`
2. `DECISION-STATUS.md`
3. `DEPENDENCY.md`
4. package-level `01-config-biome-migration-50-ref-quickstart.md`
5. package-level `CHANGELOG.md` if shared package work is involved
6. package-level `package.json` `exports`
7. `ARCHITECTURE.md`

### Why this order exists
- `REPO-STATE.md` decides what is approved to build now.
- `DECISION-STATUS.md` decides what is locked vs open.
- `DEPENDENCY.md` decides what may be installed and where.
- package docs and `exports` decide the local contract.
- `ARCHITECTURE.md` is target-state reference only.

### Non-negotiable rule
Do **not** infer implementation approval from `ARCHITECTURE.md`.

If `ARCHITECTURE.md` suggests something that is not approved in `REPO-STATE.md`, it is **not approved**.

---

## 2) Operating mode

### Default posture
- prefer the smallest correct change
- prefer app-local code over shared-package extraction
- prefer existing approved patterns over new abstractions
- prefer stopping and escalating over guessing

### When uncertain
Do less.

A missing abstraction is easier to add later than a wrong abstraction is to remove.

---

## 3) Stop and escalate

Stop immediately and request a decision/state update when any of these are true:

### Approval ambiguity
- a package exists in `ARCHITECTURE.md` but is not approved in `REPO-STATE.md`
- a package is conditional in `DEPENDENCY.md` and its trigger is not explicitly satisfied
- a decision relevant to the change is marked **Open** in `DECISION-STATUS.md`

### Dependency ambiguity
- a required dependency is not listed in `DEPENDENCY.md`
- exact version references disagree across docs
- a root `overrides` or `packageExtensions` entry seems necessary
- a dependency row still uses an unresolved placeholder that is not safe for implementation

### Package boundary ambiguity
- a change requires importing from another package’s internal `src/`
- a change requires a cross-domain import that seems to violate repo flow
- a new shared package seems useful but the second consumer is uncertain
- the abstraction only works by introducing app-specific flags, brand forks, or provider-specific branching

### Architecture ambiguity
- a change seems to require `apps/api`
- a change seems to require Nx
- a change seems to require repo-specific MCP tooling
- a change seems to require turning app-local logic into a shared package without formal approval
- a change seems to require a separate backend framework or worker/service lane that is not explicitly approved

---

## 4) Launch-slice rules

The repository is currently governed by a **two-step launch-slice strategy**.

### Milestone 1 — Public website slice
The first validating app is:

- `apps/agency-website/`

### In Milestone 1, AI tools may build
- root scaffolding
- approved governance files
- approved config packages
- only the `@agency/core-*` packages actually consumed
- only the `@agency/ui-*` packages actually consumed
- the agency website

### In Milestone 1, AI tools must not build
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

### Milestone 1 implementation rule
If the first website needs SEO, analytics, or monitoring before shared-package triggers are met:
- keep that logic app-local
- do not create the shared package early

### Milestone 2 — First authenticated internal slice
The second validating app is expected to be:

- `apps/internal-tools/crm/`

Only when Milestone 2 begins may AI tools activate:
- `@agency/data-db`
- `@agency/auth-internal`
- other dependencies explicitly approved for that milestone

---

## 5) Package extraction rules

### Default rule
Keep new logic inside the app unless a shared-package approval exists.

### A new shared package may be created only when all are true
1. it has two real consumers
2. both consumers can use the same API without distortion
3. it has a clear domain home
4. its dependencies fit allowed repo flow
5. its public API can be defined through explicit `exports`
6. it has an owner
7. it has a README
8. it has tests
9. it is approved in `REPO-STATE.md`

### Two real consumers means
- two approved apps/packages already need the same capability, or
- one implemented consumer plus one second approved consumer in the current milestone

### Two real consumers does **not** mean
- hypothetical future reuse
- multiple files inside one app
- one app plus its stories/tests
- one consumer with multiple variants
- reuse preserved only by consumer-specific switches

### Distortion test
If the proposed shared package requires:
- app-specific flags
- brand-specific forks
- workflow-specific branches
- provider-specific conditionals
- consumer-specific exceptions

…then the code should remain app-local.

### Never do this
- create a shared package because the folder exists in `ARCHITECTURE.md`
- extract code because it “might be useful later”
- turn one app’s private logic into a package for convenience
- use a shared package as a dumping ground

---

## 6) Package boundary rules

### Public API only
For any shared package:
- import only from paths listed in its `exports`
- never import from its internal `src/`
- never bypass the intended package API surface

### New exports are public API
Do not add exports casually.

Every new export is a public API decision and may require:
- docs
- tests
- changeset consideration
- decision review

### Dependency flow must not be violated
Follow the repository dependency flow exactly.

At a minimum:
- no package may import from an app
- no lower-level domain may import from a higher-level domain
- do not introduce circular dependencies

If you need a forbidden import to make the design work, stop and escalate. That is a design problem, not a coding task.

---

## 7) Dependency rules

### Dependency authority
`DEPENDENCY.md` is the only authoritative human source for exact dependency versions.

Do not use exact version tables in `ARCHITECTURE.md` as install authority.

### Before adding or upgrading a dependency
1. update `DEPENDENCY.md`
2. update the owning manifest or workspace config
3. update the root lockfile
4. run the relevant tests
5. update any affected docs if version references changed

### Never do this
- add a dependency not listed in `DEPENDENCY.md`
- install a dependency in the wrong internal package
- use `latest` in repo manifests
- use relative paths or hardcoded versions for internal package dependencies
- add a second auth provider to an app without explicit approval
- hard-code provider names in app logic when abstraction is required

### Internal dependency rule
Use `workspace:*` for all internal dependencies.

Never use:
- relative path imports across package boundaries
- hardcoded internal package versions
- registry-style version specs for internal workspace packages

### Conditional dependency rule
Do not activate a 🔒 or conditional package unless:
- its trigger is satisfied, and
- it is approved in `REPO-STATE.md`

### Story environment rule
Do not install Storybook and Ladle in the same repo.

---

## 8) Config and toolchain rules

### Turborepo rule
Use the `tasks` key in `turbo.json`, never `pipeline`.

### ESLint rule
Use direct ESLint invocation.
Do not rely on `next lint`.

### Root version consistency rule
Keep these aligned:
- `.nvmrc`
- `engines.node`
- `packageManager`
- CI Node version
- CI pnpm version

If they drift, stop and escalate.

---

## 9) Shared-package change rules

When changing a shared package:

### You must read first
- package `01-config-biome-migration-50-ref-quickstart.md`
- package `CHANGELOG.md`
- package `exports`
- `DEPENDENCY.md`
- `DECISION-STATUS.md` if the change touches a locked topic

### You must do
- add or update tests
- preserve package boundaries
- preserve explicit exports discipline
- update docs if usage or API changes
- evaluate whether a changeset is required

### You must not
- rename, remove, or change the signature of an exported item silently
- change shared-package behavior in a way that breaks consumers without corresponding version intent
- bypass the package’s own public API from inside another package

### Changeset rule
Any meaningful public API change to a shared package requires explicit versioning intent through Changesets.

If unsure whether the change is public API, treat it as public API and escalate.

---

## 10) Data and tenant-safety rules

### Current posture
Topic 6 is locked.

For any client-owned operational data:
- row-level tenant scoping is the default repository standard
- explicit tenant scope is mandatory in client-owned query helpers
- RLS is required as defense-in-depth for client-owned tables once `@agency/data-db` is active
- cross-tenant access is exceptional and must use an explicit approved path

### Required schema rule
Every client-owned table must include:
- `client_id` (non-nullable)

### Required query rule
Do not create tenant-optional helpers for client-owned entities.

Allowed pattern:
- `getById(scope, id)`
- `listForClient(scope, filters)`
- `createForClient(scope, input)`

Disallowed pattern:
- `getById(id)` for client-owned data
- `listAll()` for client-owned data
- hidden cross-tenant fallback behavior

### RLS rule
When implementing or modifying `@agency/data-db`:
- apply RLS to client-owned tables
- keep application-level `client_id` filtering in place
- do not rely on RLS alone for authorization
- treat policy changes as high risk

### Exception-path rule
Cross-tenant operations are allowed only for explicitly approved paths such as:
- administrative actions
- approved aggregated reporting
- migration workflows
- incident response

These paths must be:
- explicit
- narrow
- reviewable
- tested separately

### Branching rule
Do not treat Neon branching as tenant isolation.
Branches are for development, preview, and migration testing only.

### Cache and search rule
If a feature caches or searches client-owned data:
- cache keys must include tenant scope
- search filtering must preserve tenant scope
- no shared cache/search path may return cross-tenant data by default

### Testing rule
For client-owned data paths, include:
- query-level isolation tests
- at least one dual-tenant leakage scenario
- separate tests for approved exception paths

### Stop and escalate
Stop immediately if:
- a client-owned query would exist without explicit tenant scope
- a cross-tenant feature is being added without an approved exception path
- schema-per-tenant or database-per-tenant is being introduced without decision review
- a migration weakens tenant boundaries

---

## 11) Public-site and marketing-domain rules

### Current posture
Topic 7 is locked.

For public-facing sites:
- each site is a separate app
- config/core/UI are the default shared layers
- branded, page-specific, and campaign-specific logic stays app-local by default

### Agency website rule
Treat `apps/agency-website/` as the first proving ground for public-site architecture.

Do not turn it into a generalized platform for hypothetical future client sites.

### App-local default for public sites
Keep these inside the app unless formal extraction approval exists:
- hero sections
- landing-page compositions
- campaign pages
- testimonial layouts
- one-off embeds
- per-site metadata decisions
- per-site analytics events
- client-specific content rendering
- client-specific design tokens

### Shared marketing-package rule
Do not scaffold a marketing package just because:
- it exists in `ARCHITECTURE.md`
- the agency website could use it
- future client sites might use it later

A marketing package still requires:
- real reuse evidence
- no-distortion API
- valid domain placement
- explicit approval in `REPO-STATE.md`

### UI package boundary rule
Do not move branded or marketing-only sections into `@agency/ui-design-system`.

That package is for generic reusable UI primitives, not site-specific composition.

### CMS and content-block rule
Do not create:
- `@agency/data-cms`
- `@agency/content-blocks`

until their triggers are explicitly satisfied.

A single site using one CMS is not enough to justify cross-site content abstractions by itself.

### Future client-sites rule
Do not invent a full client-sites family standard before a real client site is approved.
That later standard belongs to the deferred client-sites family topic, not Topic 7.

### Stop and escalate
Stop immediately if:
- a branded section is being extracted because it “might be reused”
- a marketing package is being proposed from one app only
- a client-specific token set is being moved into a shared theme package
- the agency website is being reshaped around hypothetical client-site reuse

---

## 12) Application-platform rules

### Current posture
Topic 8 is locked.

For approved app surfaces:
- use Next.js 16 App Router by default
- use Route Handlers inside `app/` for early server behavior
- do not create `apps/api` unless explicit extraction approval exists

### Route Handler rule
If an approved app needs:
- form submission endpoints
- webhook handlers
- lightweight server-side endpoints
- app-owned server logic

use Route Handlers first.

Do not treat a few endpoints as justification for a dedicated API app.

### Dedicated API rule
Do not scaffold `apps/api` because:
- the architecture includes it
- it feels cleaner
- a future mobile or external client might exist
- “serious” systems often have a separate backend

A dedicated API app requires an explicit reviewed trigger.

### Framework-sprawl rule
Do not introduce a second backend framework by default.
Do not add Express, Nest, Fastify, or similar server frameworks unless a later decision explicitly approves that lane.

### Portability rule
Avoid hard platform coupling in app code where practical, but do not build adapter/platform abstraction layers before a real approved non-Vercel deployment need exists.

### Worker/service rule
Do not assume that all future background jobs or persistent processes belong inside Next.js.
But also do not introduce separate workers/services without explicit workload-driven approval.

### Stop and escalate
Stop immediately if:
- `apps/api` is being proposed without a reviewed extraction trigger
- a second backend framework is being introduced by default
- portability infrastructure is being added without an approved non-Vercel deployment need
- a worker/service lane is being introduced just because it might be useful later

---

## 13) React Compiler rules

### Current posture
Topic 9 is locked.

The repository is compiler-ready, but React Compiler remains off by default.

### Config-lane rule
`@agency/config-react-compiler` is the shared config lane.

Do not invent per-app compiler policy outside that lane unless explicitly approved.

### Default enablement rule
Do not turn on React Compiler broadly just because:
- Next.js supports it
- React docs document it
- the repo already has a compiler config package

Support is not the same as enablement approval.

### First enablement rule
If React Compiler is enabled in an approved app during early phases:
- use annotation mode first
- keep the pilot intentionally small
- verify critical flows with normal tests
- keep rollback simple

### Memoization rule
Do not remove `useMemo` / `useCallback` broadly because the compiler exists.

Preserve existing manual memoization unless there is real evidence and explicit review for cleanup.

### Shared-package rule
Do not use compiler adoption as a reason to:
- refactor shared-package APIs casually
- widen exports
- move code across package boundaries
- change public behavior without normal package-governance review

### Escape-hatch rule
`"use no memo"` is allowed when a component or hook should not be compiled.

Use it intentionally, not as a blanket workaround.

### Lint rule
Surface compiler-related diagnostics through the repo ESLint workflow before broad compiler enablement.

Use the standard React hooks lint path as the default lint surface for compiler diagnostics.

### Dependency/tooling rule
Do not assume compiler support means “no compiler package is needed.”

If compiler integration dependencies change, they must be normalized in `DEPENDENCY.md` first.

### Stop and escalate
Stop immediately if:
- repo-wide compiler enablement is being proposed in Milestone 1
- `compilationMode: 'all'` is being introduced
- a compiler experiment is spreading across shared packages without approval
- large memoization cleanup is being justified only by compiler availability

---

## 14) Tailwind and design-system rules

### Current posture
Topic 10 is locked.

The repo uses:
- Tailwind v4 CSS-first architecture
- source-owned shared component code
- explicit UI package ownership

### UI ownership rule
Treat the approved UI packages as distinct responsibilities:

- `@agency/config-tailwind` = Tailwind setup conventions
- `@agency/ui-theme` = semantic tokens/theme layer
- `@agency/ui-icons` = icon lane
- `@agency/ui-design-system` = shared primitive/component lane

Do not blur these boundaries casually.

### Token rule
Do not place semantic token ownership in multiple packages.

If a token/theme concern is cross-app and brand-agnostic, it belongs in `@agency/ui-theme`.

### Design-system rule
Do not move these into `@agency/ui-design-system` by default:
- hero sections
- landing-page layouts
- testimonial blocks
- marketing compositions
- app shells
- client-branded sections
- one-off campaign components

That package is for shared primitives and low-level reusable UI only.

### Tailwind rule
Do not reintroduce a JS preset-first Tailwind architecture as the repo default.

Follow the CSS-first Tailwind v4 model already approved in the dependency contract.

### Source-detection rule
When a consuming app uses classes from shared UI workspaces:
- ensure the app stylesheet registers the necessary sources explicitly when needed
- do not assume automatic scanning will always catch shared workspace files

### shadcn monorepo rule
Follow the monorepo-aware shadcn workflow.

That means:
- keep the shared design-system workspace as the default shared component target
- keep workspace `components.json` settings aligned where required
- do not let apps drift on shared base style, icon library, or base color choices
- do not treat shadcn-managed code as exempt from normal repo governance

### App-local component rule
App-local components are allowed, but do not use app-local installs as a way to bypass shared-package governance.

### Stop and escalate
Stop immediately if:
- token ownership is drifting between config-tailwind and ui-theme
- a branded/page-specific component is being moved into the design system
- a new UI package is being proposed without real second-consumer evidence
- a Tailwind v3-style preset architecture is being reintroduced

---

## 15) Auth, analytics, monitoring, and provider rules

### Auth
- never mix auth providers within the same app
- do not activate auth packages before the approved milestone
- do not speculate on enterprise auth escalation

### Analytics
- do not create `@agency/analytics` in Milestone 1 unless explicitly approved
- keep early single-app analytics app-local if needed
- do not initialize analytics before the correct consent architecture exists when compliance requirements apply

### Monitoring
- do not add monitoring, RUM, or observability packages until their trigger is explicitly confirmed
- if lightweight first-slice visibility is needed, prefer approved app-local or platform-native minimums rather than a shared package

### Email
- do not activate `@agency/email-templates` or `@agency/email-service` until a real transactional email flow exists

### Providers
- use approved provider lanes from `DEPENDENCY.md`
- do not invent a new provider without updating the dependency contract first

---

## 16) Commands and execution discipline

### Prefer filtered commands
When working on a package or app, prefer filtered commands such as:
- `pnpm turbo build --filter=@agency/[changed-package]...`
- `pnpm turbo lint --filter=@agency/[changed-package]...`
- `pnpm turbo test --filter=@agency/[changed-package]...`

### Do not widen scope casually
Do not run broad repo-wide changes when a filtered change is sufficient.

### Generator rule
When approved generators exist for a repeated scaffolding workflow, use them.

Until then:
- manual scaffolding is allowed only for items already approved in `REPO-STATE.md`
- manual scaffolding does not authorize creating new repo patterns

---

## 17) High-risk areas

Treat changes in these areas as high risk and do not proceed casually:
- `packages/config/`
- `packages/data/`
- `packages/auth/`
- `.github/workflows/`
- `DEPENDENCY.md`
- `REPO-STATE.md`
- `DECISION-STATUS.md`
- package `exports`
- shared-package public APIs

### What high risk means
For high-risk areas:
- read the relevant docs first
- minimize the change
- preserve existing boundaries
- escalate on ambiguity
- do not mix unrelated changes into the same edit

---

## 18) Security and secret rules

Never:
- commit secrets
- commit API keys
- commit environment variable values
- paste credentials into test data, docs, or examples

Use placeholders and documented environment variables only.

---

## 19) Common anti-drift reminders

### Do not confuse these things
- target architecture ≠ implementation approval
- package taxonomy ≠ package creation approval
- possible reuse ≠ real shared-package justification
- docs being silent ≠ permission
- convenience ≠ architectural validity
- support for a feature ≠ approval to enable it broadly

### When in doubt
- keep it local
- keep it smaller
- keep it inside the approved milestone
- stop instead of inferring

---

## 20) Done conditions for a valid AI-generated change

A change is only considered repo-valid when:
- it is approved by `REPO-STATE.md`
- it does not conflict with `DECISION-STATUS.md`
- its dependencies conform to `DEPENDENCY.md`
- it respects package `exports`
- it respects domain boundaries
- it preserves milestone scope
- it updates tests/docs when required
- it does not introduce new architecture by inference

---

## 21) Maintenance rule for this file

Update this file whenever:
- a new AI failure mode is observed
- a new milestone changes what AI tools may scaffold
- a new locked topic changes repo operating policy
- a governance conflict is resolved
- a new exception path is approved

If this file becomes vague, stale, or aspirational, AI drift will increase.