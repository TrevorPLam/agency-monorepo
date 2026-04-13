```md id="7c1mrd"
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
4. package-level `README.md`
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
- a decision relevant to the change is marked **Open** or **Deferred** in `DECISION-STATUS.md`

### Dependency ambiguity
- a required dependency is not listed in `DEPENDENCY.md`
- exact version references disagree across docs
- a root `overrides` or `packageExtensions` entry seems necessary
- a dependency row still uses an unresolved placeholder that is not safe for implementation

### Package boundary ambiguity
- a change requires importing from another package’s internal `src/`
- a change requires a cross-domain import that seems to violate repo flow
- a new shared package seems useful but the second consumer is uncertain
- the abstraction only works by introducing app-specific flags, brand forks, workflow forks, or provider-specific branching
- a CMS extraction would move site-specific schemas, page composition, or editorial workflow rules into shared code
- an email extraction would move app-specific workflow orchestration into shared code

### Architecture ambiguity
- a change seems to require `apps/api`
- a change seems to require Nx
- a change seems to require repo-specific MCP tooling
- a change seems to require turning app-local logic into a shared package without formal approval
- a change seems to require activating `@agency/data-cms`
- a change seems to require activating `@agency/email-templates`
- a change seems to require activating `@agency/email-service`
- a change seems to require activating `@agency/notifications`

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
- `@agency/notifications`
- `@agency/experimentation`
- `@agency/experimentation-edge`
- `@agency/analytics-attribution`
- `@agency/analytics-consent-bridge`
- `@agency/data-api-client`
- `@agency/data-content-federation`
- `@agency/data-ai-enrichment`
- `@agency/lead-capture`
- `@agency/test-setup`
- `@agency/test-fixtures`

### Milestone 1 implementation rule
If the first website needs SEO, analytics, monitoring, CMS-backed content, or transactional email before shared-package triggers are met:
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
Do not activate a conditional package unless:
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
- package `README.md`
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
Do not make architectural assumptions beyond the currently locked topics.

Topic 6 is locked, but stronger isolation lanes remain escalation-only.
Do not invent a stronger isolation model by default.

### Still required right now
If touching `@agency/data-db` or preparing for it:
- preserve `client_id` scoping as a first-class requirement
- do not allow client-owned queries without explicit client scoping
- treat schema and migration changes as high risk
- do not write migrations casually or destructively without review

### Database package rule
Never install a database driver directly in an app.
All DB access must flow through `@agency/data-db` once that package is active.

---

## 11) Auth, analytics, monitoring, CMS, email, notifications, and provider rules

### Auth
- never mix auth providers within the same app
- do not activate auth packages before the approved milestone
- do not speculate on enterprise auth escalation
- default internal-tools auth lane is Clerk
- default client-portal auth lane is Better Auth
- WorkOS is escalation-only, not the default enterprise lane

### Analytics
- do not create `@agency/analytics` in Milestone 1 unless explicitly approved
- keep early single-app analytics app-local if needed
- do not initialize analytics before the correct consent architecture exists when compliance requirements apply
- marketing analytics and product analytics are separate lanes
- do not force one fake generic analytics runtime API

### Monitoring
- do not add monitoring, RUM, or observability packages until their trigger is explicitly confirmed
- if lightweight first-slice visibility is needed, prefer approved app-local or platform-native minimums rather than a shared package
- `@agency/monitoring-rum` refers to browser-side field telemetry / RUM helpers, not CrUX-specific infrastructure

### CMS
- do not activate `@agency/data-cms` from target-state package presence alone
- default CMS lane is Sanity for CMS-backed client sites
- this does not mean every public site should adopt CMS
- code / MDX / static content remains valid when structured editorial workflow is not yet real
- keep early CMS integration app-local until shared-package triggers are explicitly met
- do not create provider-neutral CMS abstractions “for future flexibility”
- do not move site-specific schemas, page composition, or editorial workflow logic into shared infrastructure
- treat self-hosted CMS lanes as explicit exceptions, not defaults

### Email
- do not activate `@agency/email-templates` or `@agency/email-service` until a real transactional email flow exists
- default rendering lane is React Email
- default sending lane is Resend
- this topic governs transactional/app email first, not broad marketing/broadcast tooling
- keep early email logic app-local until shared-package triggers are explicitly met
- do not move app-specific workflow orchestration into shared email packages
- treat Postmark-like providers as escalation lanes, not defaults

### Notifications
- do not activate `@agency/notifications` from target-state package presence alone
- do not create `@agency/notifications` for email-only use cases
- do not create a notifications layer just to wrap one email provider
- only consider `@agency/notifications` when there is real multi-channel or cross-app orchestration need

### Providers
- use approved provider lanes from `DEPENDENCY.md`
- do not invent a new provider without updating the dependency contract first
- provider-lane policy does not equal automatic install approval

---

## 12) Commands and execution discipline

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

## 13) High-risk areas

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

## 14) Security and secret rules

Never:
- commit secrets
- commit API keys
- commit environment variable values
- paste credentials into test data, docs, or examples

Use placeholders and documented environment variables only.

---

## 15) Common anti-drift reminders

### Do not confuse these things
- target architecture ≠ implementation approval
- package taxonomy ≠ package creation approval
- possible reuse ≠ real shared-package justification
- docs being silent ≠ permission
- convenience ≠ architectural validity
- provider-lane policy ≠ automatic install approval

### When in doubt
- keep it local
- keep it smaller
- keep it inside the approved milestone
- stop instead of inferring

---

## 16) Done conditions for a valid AI-generated change

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

## 17) Maintenance rule for this file

Update this file whenever:
- a new AI failure mode is observed
- a new milestone changes what AI tools may scaffold
- a new locked topic changes repo operating policy
- a governance conflict is resolved
- a new exception path is approved

If this file becomes vague, stale, or aspirational, AI drift will increase.
```
