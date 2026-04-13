# Agency Monorepo — Dependency Governance

> **Purpose of this document**  
> This is the repository’s dependency governance contract.
>
> It controls:
> - which dependencies are allowed
> - where they belong
> - when conditional packages may be activated
> - which provider lanes are approved by default
> - how exact versions, approved ranges, and validation-pending rows should be interpreted
>
> This is **not** a technology wishlist.
>
> AI coding tools must read this file before installing anything.
> If a dependency is not allowed here, it is not allowed in the repo.

---

## How to use this document

1. **Before installing a package** — check which internal package owns it.
2. **Before activating a conditional package** — verify the trigger in §14 and check `REPO-STATE.md`.
3. **Before choosing a provider** — use the approved provider lane for that domain.
4. **Before upgrading a dependency** — update this document first, then manifests, lockfile, and CI as needed.
5. **When a later-stage package is still inactive** — treat `Validation pending at activation` as a stop/escalate marker, not as permission to guess.

---

## Dependency truth policy

This repository uses four dependency-authority classes.

| Classification | Meaning | Example |
| --- | --- | --- |
| **Verified exact pin** | Safe to use as implementation authority now | `pnpm@10.15.1` |
| **Approved range** | Semver range intentionally allowed | `eslint@^9.0.0` |
| **Validation pending at activation** | Do not install until the package/domain is actually activated and the pin is re-confirmed | `better-auth` in an inactive portal lane |
| **Tool-only latest** | Allowed only in one-off CLI commands, never in repo manifests | `npx create-next-app@latest` |

### Non-negotiable rules
- `latest` is never allowed in repo manifests.
- Exact version authority belongs here, not in `ARCHITECTURE.md`.
- If a later-stage row is marked **Validation pending at activation**, do not treat it as implementation authority yet.
- Human authority lives here; machine truth lives in manifests, lockfile, workspace config, and CI.

### Normalization note
This final corrected version intentionally removes or softens time-sensitive commercial details that are likely to drift, especially:
- free-tier counts
- pricing specifics
- provider quotas
- inactive-lane exact pins not needed yet

Those details should be validated **at activation time**, not treated as stable planning truth.

---

## §1 · Runtime, package manager, and compiler baseline

Global baseline. These are the highest-priority dependency truths in the repository.

| Tool | Policy | Source of truth |
| --- | --- | --- |
| **Node.js** | **24.x LTS** | `.nvmrc` + root `package.json` `engines.node` |
| **pnpm** | **10.15.1** | root `package.json` `packageManager` |
| **TypeScript** | **5.8.3** | `@agency/config-typescript` |

### Baseline rules
- Node must stay on an LTS line for production use.
- Root version references must stay aligned across `.nvmrc`, `engines.node`, `packageManager`, and CI.
- TypeScript 5.8.3 is the corrected baseline. Do not use older draft references to TypeScript 6.x as current implementation authority.

### Root `package.json` required fields
```json
{
  "packageManager": "pnpm@10.15.1",
  "engines": {
    "node": ">=20.9.0"
  }
}
````

### `pnpm-workspace.yaml` minimum

```yaml
packages:
  - "apps/*"
  - "packages/*"
  - "tools/*"
```

---

## §2 · Core framework and styling baseline

These packages define the repo-wide frontend platform baseline.

| Package        | Policy      | Notes                            |
| -------------- | ----------- | -------------------------------- |
| `next`         | **16.2.0**  | App Router default               |
| `react`        | **19.2.0**  | Must pair with React DOM exactly |
| `react-dom`    | **19.2.0**  | Must match `react` exactly       |
| `tailwindcss`  | **4.1.12**  | CSS-first Tailwind v4 baseline   |
| `postcss`      | **8.5.6**   | PostCSS pipeline dependency      |
| `autoprefixer` | **10.4.21** | Standard PostCSS companion       |

### Core framework rules

* Next.js App Router is the default application model.
* Route Handlers remain the default early server model.
* `apps/api` is not approved by default.
* Next.js 16.2 is the baseline framework family for this repo.
* React 19.2 is the baseline React family for this repo.

### Tailwind v4 rules

* Tailwind is CSS-first.
* `@agency/config-tailwind` must export CSS, not a JS preset.
* Use `@theme` for tokens.
* Use `@source` when shared workspace UI sources must be registered explicitly.
* Do not rely on older preset-first Tailwind patterns from pre-v4 workflows.

### Example consuming pattern

```css
@import "@agency/config-tailwind/theme.css";
@source "../../packages/ui/design-system/src";
```

---

## §3 · Shared UI / shadcn stack

These are the core shared UI dependencies used by the approved UI packages.

| Package                    | Policy                                | Owned by                   |
| -------------------------- | ------------------------------------- | -------------------------- |
| `lucide-react`             | **0.473.0**                           | `@agency/ui-icons`         |
| `clsx`                     | **2.1.1**                             | `@agency/ui-design-system` |
| `tailwind-merge`           | **3.3.1**                             | `@agency/ui-design-system` |
| `class-variance-authority` | **0.7.1**                             | `@agency/ui-design-system` |
| `@radix-ui/react-*`        | **Exact pin per installed component** | `@agency/ui-design-system` |

### shadcn/ui rules

* shadcn/ui is not installed as a runtime package.
* Use the CLI into the shared design-system lane when appropriate.
* For Tailwind v4, keep Tailwind config path blank in `components.json`.
* Keep workspace/path settings aligned across workspaces.
* Do not treat shadcn as permission to widen the design system into branded page composition.

---

## §4 · Monorepo tooling baseline

These are the repo-governance and workspace-tooling dependencies.

| Package                            | Policy                               | Purpose                                                         |
| ---------------------------------- | ------------------------------------ | --------------------------------------------------------------- |
| `turbo`                            | **2.5.6**                            | Task orchestration                                              |
| `@changesets/cli`                  | **2.29.6**                           | Versioning/changelog intent                                     |
| `eslint`                           | **Approved range: ^9.0.0**           | Lint baseline                                                   |
| `@typescript-eslint/parser`        | **Approved range: ^8.0.0**           | TS parser                                                       |
| `@typescript-eslint/eslint-plugin` | **Approved range: ^8.0.0**           | TS lint rules                                                   |
| `prettier`                         | **3.6.2**                            | Formatting                                                      |
| `eslint-config-next`               | **Validation pending at activation** | Reconfirm exact pin against chosen Next 16.2 install before use |
| `@types/node`                      | **Validation pending at activation** | Reconfirm against active Node 24 lane before use                |

### Tooling rules

* `turbo.json` must use `tasks`, not `pipeline`.
* Use direct ESLint invocation, not `next lint`.
* Keep parser/plugin majors aligned for `@typescript-eslint/*`.
* Do not widen lint/build tooling by convenience.

---

## §5 · React Compiler config lane

| Package                        | Policy                               | Owned by                        |
| ------------------------------ | ------------------------------------ | ------------------------------- |
| `babel-plugin-react-compiler`  | **Validation pending at activation** | `@agency/config-react-compiler` |
| `eslint-plugin-react-compiler` | **Validation pending at activation** | `@agency/config-react-compiler` |

### React Compiler rules

* Compiler support is allowed.
* Compiler rollout is off by default.
* Use lint-first preparation.
* First enablement should be an annotation-first pilot.
* Do not mass-remove manual memoization by assumption.

---

## §6 · Operational data lane

This domain is not approved in Milestone 1, but its default future lane is already locked.

### Default provider lane

* **PostgreSQL**
* **Neon** as the default provider
* **Drizzle** as the mandatory schema/query/migration abstraction

### Allowed runtime packages for `@agency/data-db`

| Package                    | Policy                               | Notes                                    |
| -------------------------- | ------------------------------------ | ---------------------------------------- |
| `drizzle-orm`              | **Validation pending at activation** | Mandatory ORM layer                      |
| `drizzle-kit`              | **Validation pending at activation** | Migration tooling                        |
| `@neondatabase/serverless` | **Validation pending at activation** | Default Neon driver lane                 |
| `@supabase/supabase-js`    | **Validation pending at activation** | Integrated fallback lane only            |
| `pg`                       | **Validation pending at activation** | Non-edge / long-running worker lane only |

### Data-lane rules

* Apps must not install DB drivers directly.
* All DB access must flow through `@agency/data-db`.
* Preview branches/environments are for QA, testing, and migration validation.
* Preview branching is **not** a tenant-security boundary.
* Route Handlers remain the early data-access surface.
* `@agency/data-db` expected first activator = internal CRM / Milestone 2.
* True architectural trigger = first approved operational-data consumer requiring persistent DB-backed state.

---

## §7 · Auth provider lanes

Auth is split by app category.

### Internal tools — default lane

| Package         | Policy                               | Owned by                |
| --------------- | ------------------------------------ | ----------------------- |
| `@clerk/nextjs` | **Validation pending at activation** | `@agency/auth-internal` |

### Client portals — default lane

| Package                        | Policy                               | Owned by              |
| ------------------------------ | ------------------------------------ | --------------------- |
| `better-auth`                  | **Validation pending at activation** | `@agency/auth-portal` |
| `@better-auth/drizzle-adapter` | **Validation pending at activation** | `@agency/auth-portal` |

### Fallback / escalation lanes

| Package / Provider    | Policy                               | Notes                                        |
| --------------------- | ------------------------------------ | -------------------------------------------- |
| `next-auth` / Auth.js | **Validation pending at activation** | Full OSS control fallback                    |
| Supabase Auth         | **Validation pending at activation** | Use only when intentionally in Supabase lane |
| WorkOS                | **Validation pending at activation** | Enterprise SSO / SCIM escalation only        |

### Auth rules

* Internal tools default to Clerk.
* Client portals default to Better Auth.
* One provider per app.
* Auth is not the tenant-isolation boundary.
* WorkOS is escalation-only, not a default lane.

---

## §8 · SEO lane

SEO is app-local by default in Milestone 1.

### Package status

| Package       | Policy                             |
| ------------- | ---------------------------------- |
| `@agency/seo` | **Conditional — not approved now** |

### SEO rules

* Use native Next.js metadata / sitemap / robots / OG primitives first.
* If `@agency/seo` is activated later, it must remain thin and infrastructure-only.
* Do not centralize page-specific metadata content, campaign logic, canonical strategy, or branded OG composition into shared SEO prematurely.

---

## §9 · Analytics lane

Analytics is split between marketing and product contexts.

### Default provider lanes

| Lane                | Provider  | Package policy                       |
| ------------------- | --------- | ------------------------------------ |
| Marketing analytics | Plausible | **Validation pending at activation** |
| Product analytics   | PostHog   | **Validation pending at activation** |

### Package status

| Package                            | Policy                             |
| ---------------------------------- | ---------------------------------- |
| `@agency/analytics`                | **Conditional — not approved now** |
| `@agency/analytics-attribution`    | **Deferred**                       |
| `@agency/analytics-consent-bridge` | **Deferred**                       |

### Analytics rules

* Milestone 1 analytics may remain app-local.
* `@agency/analytics` is not approved in Milestone 1.
* If `@agency/analytics` is activated later, it must expose **lane-specific exports**.
* Do not design one fake universal runtime abstraction for Plausible + PostHog.
* Attribution and consent-bridge remain trigger-based later-stage packages.

---

## §10 · Monitoring and observability lane

Monitoring is built-ins first, app-local first.

### Package status

| Package                  | Policy                               |
| ------------------------ | ------------------------------------ |
| `@agency/monitoring`     | **Conditional — not approved now**   |
| `@agency/monitoring-rum` | **Conditional — not approved now**   |
| `@sentry/nextjs`         | **Validation pending at activation** |
| `newrelic`               | **Validation pending at activation** |
| `@grafana/faro-web-sdk`  | **Validation pending at activation** |

### Monitoring rules

* Use platform-native monitoring minimums first.
* Milestone 1 monitoring may remain platform-native or app-local.
* `@agency/monitoring-rum` refers to browser-side field telemetry / RUM helpers.
* Do not tie `@agency/monitoring-rum` narrowly to CrUX-specific wording.
* Do not add external observability vendors until the built-in baseline is insufficient and the package is approved.

---

## §11 · CMS lane

Not yet locked as an active implementation lane, but current default planning direction remains:

| Lane                     | Provider                    | Package policy                       |
| ------------------------ | --------------------------- | ------------------------------------ |
| Default conceptual lane  | Sanity                      | **Validation pending at activation** |
| Self-hosted alternatives | Strapi / Payload / Directus | **Validation pending at activation** |

### Package status

| Package            | Policy                             |
| ------------------ | ---------------------------------- |
| `@agency/data-cms` | **Conditional — not approved now** |

### CMS rule

Do not activate CMS dependencies by inference before Topic 16 is locked and `REPO-STATE.md` approves the package.

---

## §12 · Email and notifications lane

Not yet locked as an active implementation lane.

### Conceptual package split

* `@agency/email-templates` = rendering only
* `@agency/email-service` = delivery only

### Default conceptual provider lane

| Lane                      | Provider                         | Package policy                       |
| ------------------------- | -------------------------------- | ------------------------------------ |
| Email delivery            | Resend                           | **Validation pending at activation** |
| Transactional premium alt | Postmark                         | **Validation pending at activation** |
| Backup / budget lanes     | Brevo / SES / SendGrid / SMTP2GO | **Validation pending at activation** |

### Package status

| Package                   | Policy                             |
| ------------------------- | ---------------------------------- |
| `@agency/email-templates` | **Conditional — not approved now** |
| `@agency/email-service`   | **Conditional — not approved now** |
| `@agency/notifications`   | **Conditional — not approved now** |

### Email rule

Do not activate email or notification packages until Topic 17 is locked and a real workflow exists.

---

## §13 · Testing and workbench lane

These packages remain condition-gated.

| Package                          | Policy                               |
| -------------------------------- | ------------------------------------ |
| `vitest`                         | **Validation pending at activation** |
| `@testing-library/react`         | **Validation pending at activation** |
| `@testing-library/jest-dom`      | **Validation pending at activation** |
| `@testing-library/user-event`    | **Validation pending at activation** |
| `jsdom`                          | **Validation pending at activation** |
| `@playwright/test`               | **Validation pending at activation** |
| `storybook` / `@storybook/react` | **Validation pending at activation** |
| `@ladle/react`                   | **Validation pending at activation** |
| `@faker-js/faker`                | **Validation pending at activation** |

### Testing rules

* `@agency/test-setup` is conditional.
* `@agency/test-fixtures` is conditional.
* Do not install Storybook and Ladle in the same repo.

---

## §14 · Internal package dependency matrix

This is the canonical ownership map for where dependencies belong.

| Package                         | Allowed external deps                                                                           | Allowed internal deps                                        |
| ------------------------------- | ----------------------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| `@agency/config-eslint`         | `eslint`, `@typescript-eslint/*`, `eslint-config-next`                                          | —                                                            |
| `@agency/config-typescript`     | `typescript`                                                                                    | —                                                            |
| `@agency/config-tailwind`       | `tailwindcss`, `postcss`, `autoprefixer`                                                        | —                                                            |
| `@agency/config-prettier`       | `prettier`                                                                                      | —                                                            |
| `@agency/config-react-compiler` | compiler/lint companion packages                                                                | —                                                            |
| `@agency/core-types`            | minimal type/runtime validation libs only                                                       | —                                                            |
| `@agency/core-utils`            | utility libs only when approved                                                                 | `@agency/core-types`                                         |
| `@agency/core-constants`        | none or minimal runtime-safe deps                                                               | `@agency/core-types`                                         |
| `@agency/core-hooks`            | `react`                                                                                         | `@agency/core-types`, `@agency/core-utils`                   |
| `@agency/ui-theme`              | `tailwindcss`                                                                                   | `@agency/config-tailwind`                                    |
| `@agency/ui-icons`              | `lucide-react`, `react`                                                                         | —                                                            |
| `@agency/ui-design-system`      | `react`, `react-dom`, `@radix-ui/react-*`, `clsx`, `tailwind-merge`, `class-variance-authority` | `@agency/ui-theme`, `@agency/ui-icons`, `@agency/core-types` |
| `@agency/seo`                   | Next/React SEO-safe helpers only                                                                | `@agency/core-types`, `@agency/core-utils`                   |
| `@agency/analytics`             | analytics providers for active lanes only                                                       | `@agency/core-types`                                         |
| `@agency/monitoring`            | approved monitoring providers only                                                              | `@agency/core-types`                                         |
| `@agency/monitoring-rum`        | approved browser telemetry providers only                                                       | `@agency/monitoring`                                         |
| `@agency/data-db`               | Drizzle + approved DB drivers only                                                              | `@agency/core-types`                                         |
| `@agency/auth-internal`         | Clerk lane only                                                                                 | `@agency/core-types`                                         |
| `@agency/auth-portal`           | Better Auth lane + approved adapter                                                             | `@agency/core-types`, `@agency/data-db`                      |
| `@agency/data-cms`              | active CMS provider SDKs only                                                                   | `@agency/core-types`                                         |
| `@agency/email-templates`       | React Email rendering packages only                                                             | `@agency/core-types`                                         |
| `@agency/email-service`         | active email transport provider only                                                            | `@agency/email-templates`, `@agency/core-types`              |
| `@agency/notifications`         | active notification provider only                                                               | `@agency/core-types`, `@agency/email-service`                |

### Matrix rule

Installing a dependency into the wrong internal package is a governance violation.

---

## §15 · Conditional package activation

🟢 = allowed now
🟡 = conceptually valid but not approved now
🔒 = later-stage / stricter trigger

| Package                            | Status now | Trigger summary                                                     | Min consumers |
| ---------------------------------- | ---------- | ------------------------------------------------------------------- | ------------- |
| `@agency/config-*`                 | 🟢         | Always required                                                     | —             |
| `@agency/core-*`                   | 🟢         | Only as consumed                                                    | —             |
| `@agency/ui-*`                     | 🟢         | Only as consumed                                                    | —             |
| `@agency/seo`                      | 🟡         | 2+ public-facing apps need the same narrow SEO infrastructure       | 2             |
| `@agency/analytics`                | 🟡         | 2+ approved apps need shared analytics infrastructure               | 2             |
| `@agency/analytics-attribution`    | 🔒         | Real cross-channel attribution need                                 | 1             |
| `@agency/analytics-consent-bridge` | 🔒         | 2+ analytics providers need unified consent                         | 2             |
| `@agency/monitoring`               | 🔒         | Platform-native/app-local monitoring no longer sufficient           | 1             |
| `@agency/monitoring-rum`           | 🔒         | Shared browser-side field telemetry need beyond platform baseline   | 1             |
| `@agency/data-db`                  | 🟡         | First approved operational-data consumer requiring persistent state | 1             |
| `@agency/auth-internal`            | 🟡         | First internal tool requiring auth, Milestone 2 active              | 1             |
| `@agency/auth-portal`              | 🟡         | First approved client portal requiring login                        | 1             |
| `@agency/data-cms`                 | 🟡         | First real CMS-backed site after Topic 16 lock                      | 1             |
| `@agency/email-templates`          | 🟡         | First real transactional email flow after Topic 17 lock             | 1             |
| `@agency/email-service`            | 🟡         | With email templates activation                                     | 1             |
| `@agency/notifications`            | 🔒         | Multi-workflow notification need                                    | 2             |
| `@agency/experimentation`          | 🔒         | First real flags / AB testing need                                  | 1             |
| `@agency/experimentation-edge`     | 🔒         | Real edge experimentation need                                      | 1             |
| `@agency/test-setup`               | 🟡         | Repeated test-config duplication                                    | 2             |
| `@agency/test-fixtures`            | 🔒         | Shared factory duplication across suites                            | 2             |
| `apps/api`                         | 🔒         | Separate API extraction threshold formally met                      | —             |

---

## §16 · Client-profile routing (planning default only)

This is a planning aid, not implementation approval.

| Profile                        | Default lane summary                                                |
| ------------------------------ | ------------------------------------------------------------------- |
| Brochure / marketing site      | No auth, no DB by default, app-local SEO/analytics/monitoring first |
| Internal tool                  | Clerk + later Neon/Drizzle if persistent data is required           |
| Client portal / SaaS starter   | Better Auth + Neon/Drizzle + tenant-scoped data                     |
| Privacy-sensitive / EU client  | Self-host / stricter provider lane may be justified                 |
| Enterprise / procurement-bound | Aurora / WorkOS / enterprise provider escalation only when required |

### Important rule

This section helps choose a lane once the relevant domain is approved.
It does **not** activate packages by itself.

---

## §17 · CI/CD and hosting dependency rules

### Default hosting posture

* Vercel-first for approved Next.js apps
* portability-aware, but portability infrastructure is not launch-default scope

### CI baseline rules

* use frozen lockfile installs
* keep Node/pnpm versions aligned
* fail CI on internal dependency specifiers that are not `workspace:*`
* fail CI on `latest` in manifests
* fail CI when dependency truth drifts from this document

---

## §18 · AI agent dependency rules

AI coding tools must follow these rules:

1. Do not install any package not listed in this document.
2. Do not install a package in the wrong internal package.
3. Do not activate a conditional package unless the trigger is satisfied **and** `REPO-STATE.md` approves it.
4. Do not hard-code provider names in app logic when a domain boundary package is required.
5. Do not add a second auth provider to an app without an explicit decision.
6. Do not install DB drivers in apps.
7. Do not create `@agency/analytics` in Milestone 1.
8. Do not create `@agency/monitoring` or `@agency/monitoring-rum` in Milestone 1.
9. Do not create `@agency/seo` in Milestone 1.
10. Use `workspace:*` for all internal dependencies.

---

## §19 · Dependency change workflow

Before adding or upgrading any dependency:

1. Update `DEPENDENCY.md`
2. Update the owning manifest/workspace config
3. Update the root lockfile
4. Run the relevant checks
5. Update any affected docs if dependency references changed

### Important rule

Dependency changes must not begin in `package.json` files.

---

## §20 · Final corrected normalization notes

This final corrected version incorporates the QA-driven corrections from Topics 11–15:

* `@agency/analytics` wording now supports **Milestone 1 app-local analytics** and **later lane-specific exports**
* `@agency/monitoring-rum` is defined as **browser-side field telemetry / RUM**, not CrUX-specific infrastructure
* WorkOS is normalized as **escalation-only**
* `@agency/data-db` activation wording is normalized to **first approved operational-data consumer**, while still expecting internal CRM to be the first likely activator
* many later-stage provider exact pins are intentionally marked **Validation pending at activation** so inactive domains do not accumulate stale implementation authority