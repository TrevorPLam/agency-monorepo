# Agency Monorepo — Dependency Governance

> **Purpose of this document**  
> This is not a technology wishlist. It is a *governance contract* — the authoritative reference that controls which dependencies exist, where they live, when they are allowed to be installed, and what conditions must be met before any conditional package is activated.
>
> AI coding tools must read this document before installing anything.
>
> No dependency outside this contract may be added without updating this document first.

***

## How to use this document

1. **Before installing any package** — look up which internal package owns that dependency. Install it there, not in an app.
2. **Before creating a new package** — verify its trigger condition is met (see §14).
3. **Before choosing a provider** — consult the provider lane table for that category. Do not invent a new provider.
4. **When a client has unusual needs** — consult §15 Client-Profile Routing to select the right lane.
5. **"Do not build yet" items** — packages marked 🔒 in §14 must not be scaffolded until their trigger is satisfied.

***

## Dependency Truth Policy

This section defines the classification system for dependency versions in this repository. Every dependency entry must fall into one of these four categories:

| Classification | Meaning | Example |
|---|---|---|
| **Verified exact pin** | Version confirmed from official source (registry, changelog, or docs) | `pnpm@10.33.0`, `react@19.2.5` |
| **Approved range** | Semver range approved for non-runtime or lower-risk dependencies | `^9.0.0` for ESLint 9.x |
| **Tool-only latest** | Acceptable for CLI tools invoked by generators, not runtime dependencies | `pnpm dlx shadcn@latest` |
| **Validation pending** | Placeholder requiring verification before active implementation | Marked with ⚠️ in tables |

**Normalization note:** In the tables below, non-exact values are labeled explicitly as either `Approved range:` or `⚠️ Validation pending` so ambiguous placeholders like `latest` are not used as implementation authority.

### When `latest` is allowed

- **Never** for runtime dependencies in `package.json` files
- **Never** for internal package version pins
- **Only** for:
  - generator/tool commands explicitly labeled as tool commands
  - research placeholders that are not implementation authority
  - documented CLI setup flows where the repo is not pinning the CLI itself

### Stale pin correction process

When a version pin is found to be outdated:
1. Verify the new version from official source
2. Update this document (`DEPENDENCY.md`) first
3. Update all referencing documents
4. Run `pnpm install` to update the lockfile
5. Test in at least one consuming app before merging

***

## §1 · Runtime, Package Manager & Compiler Baseline

Global baseline. These values are authoritative. Do not override per-package.

| Tool | Pin | Minimum | Source of truth |
| --- | --- | --- | --- |
| **Node.js** | 24.x LTS | 20.9.0 | `.nvmrc` + `engines` in root `package.json` |
| **pnpm** | 10.33.0 | 10.x | `packageManager` field in root `package.json` |
| **TypeScript** | 6.0.2 | 5.x | `devDependencies` in `@agency/config-typescript` |

**TS 6.0 note** — `--moduleResolution node` has been removed; `@agency/config-typescript` must use `moduleResolution: "bundler"` or `"nodenext"`.

**Root `package.json` required fields:**
```json
{
  "packageManager": "pnpm@10.33.0",
  "engines": { "node": ">=20.9.0" }
}
````

**`pnpm-workspace.yaml` minimum:**

```yaml
packages:
  - "apps/*"
  - "packages/*"
  - "tools/*"
```

---

## §2 · Core Framework & Styling

These three must always be installed as a coordinated trio. Never install one without pinning all three.

| Package     | Pin        | Notes                         |
| ----------- | ---------- | ----------------------------- |
| `next`      | **16.2.3** | App Router-first.             |
| `react`     | **19.2.5** | Required pairing for Next 16. |
| `react-dom` | **19.2.5** | Must match `react` exactly.   |

### Tailwind CSS v4

| Package        | Pin         | Notes                                                                 |
| -------------- | ----------- | --------------------------------------------------------------------- |
| `tailwindcss`  | **4.2.2**   | CSS-first. `@theme` and `@source` replace the old preset-heavy model. |
| `postcss`      | **8.5.9**   | Required for the Next CSS pipeline.                                   |
| `autoprefixer` | **10.4.27** | Standard PostCSS peer.                                                |

### Tailwind ownership rule

**`@agency/config-tailwind` owns the Tailwind setup contract.**
It does **not** own the long-term semantic token contract.

**`@agency/ui-theme` owns semantic tokens and theme CSS.**

#### `@agency/config-tailwind`

Exports:

* shared Tailwind setup/import contract
* low-level CSS conventions
* source-detection guidance for shared workspaces

Does **not** own:

* semantic theme tokens
* branded token sets
* component source

#### `@agency/ui-theme`

Exports:

* semantic token/theme CSS
* light/dark theme mappings
* shared brand-agnostic theme variables

### Consuming-app pattern

Apps should follow the split:

```css
@import "tailwindcss";
@import "@agency/config-tailwind/setup.css";
@import "@agency/ui-theme/theme.css";

/* Register shared workspace sources when needed */
@source "../../packages/ui/design-system/src";
```

### shadcn/ui monorepo workflow

shadcn/ui is **not** an installable package.

Use the monorepo-aware CLI workflow:

* run the `add` command from the app path
* let the CLI install shared reusable components into the shared UI workspace
* keep app-specific compositions in the app when they are truly app-local

#### Required shadcn monorepo rules

* every relevant workspace has a `components.json`
* `tailwind.config` stays empty in `components.json` for Tailwind v4
* shared workspaces keep the same `style`, `iconLibrary`, and `baseColor`
* shared reusable components belong in `@agency/ui-design-system`
* app-local one-offs remain app-local

### shadcn/Radix/UI support packages

| Package                    | Pin                               | Owned by                   |
| -------------------------- | --------------------------------- | -------------------------- |
| `@radix-ui/react-*`        | exact pin per installed component | `@agency/ui-design-system` |
| `lucide-react`             | ⚠️ Validation pending             | `@agency/ui-icons`         |
| `clsx`                     | **2.1.1**                         | `@agency/ui-design-system` |
| `tailwind-merge`           | **3.5.0**                         | `@agency/ui-design-system` |
| `class-variance-authority` | **0.7.1**                         | `@agency/ui-design-system` |

### React Compiler (`@agency/config-react-compiler`)

React Compiler is **supported but not enabled by default**.

#### Repo policy

* compiler-off by default
* lint first
* annotation-mode pilot first
* no repo-wide rollout in Milestone 1

#### When the first approved pilot happens

* install `babel-plugin-react-compiler`
* enable `reactCompiler` in `next.config.ts`
* start with annotation mode
* surface compiler diagnostics through `eslint-plugin-react-hooks`

#### Important rule

`eslint-plugin-react-hooks` is the default lint surface for compiler diagnostics.

Do **not** treat `eslint-plugin-react-compiler` as the default repo lint lane.

Apps consume compiler policy from `@agency/config-react-compiler`; they do not invent their own compiler policy.

---

## §3 · Monorepo Tooling

> **Next.js 16 breaking change:** `next lint` is removed. Configure ESLint directly.

| Package                            | Pin                      | Purpose                                                   |
| ---------------------------------- | ------------------------ | --------------------------------------------------------- |
| `turbo`                            | **2.9.5**                | Task orchestration above pnpm workspaces                  |
| `@changesets/cli`                  | **2.30.0**               | Versioning and changelogs                                 |
| `eslint`                           | Approved range: `^9.0.0` | Base linter                                               |
| `eslint-config-next`               | **16.2.3**               | Must match the Next pin                                   |
| `@typescript-eslint/parser`        | Approved range: `^8.0.0` | TS-aware ESLint parser                                    |
| `@typescript-eslint/eslint-plugin` | Approved range: `^8.0.0` | TS ESLint rules                                           |
| `eslint-plugin-react-hooks`        | ⚠️ Validation pending    | Standard hooks lint path and compiler diagnostics surface |
| `@types/node`                      | **25.5.2**               | Node typings for apps and tools                           |

**All internal dependencies use `workspace:*`** so pnpm resolves locally and Changesets can bump versions correctly.

---

## §4 · Database Layer

### Provider Strategy

| Lane                            | Provider                  | Role                                    | Free Tier (verify before use) | Best Fit                                  |
| ------------------------------- | ------------------------- | --------------------------------------- | ----------------------------- | ----------------------------------------- |
| **Primary**                     | **Neon**                  | Serverless Postgres, branching workflow | verify before use             | Branch-heavy dev, PR preview DBs          |
| **Fallback / Integrated**       | **Supabase**              | Postgres + Auth + Storage bundle        | verify before use             | All-in-one clients                        |
| **Enterprise / Cloud-standard** | **AWS Aurora PostgreSQL** | Managed Postgres                        | verify before use             | AWS-procurement clients                   |
| **Alternative managed**         | **Aiven**                 | Managed Postgres                        | verify before use             | Managed ops without Neon/Supabase lock-in |

**Drizzle ORM is the mandatory abstraction layer.**
Apps never talk directly to a provider. All queries go through `@agency/data-db`.

### Runtime Packages (`@agency/data-db`)

| Package                    | Pin                   | Role                               |
| -------------------------- | --------------------- | ---------------------------------- |
| `drizzle-orm`              | **0.45.2**            | ORM layer                          |
| `drizzle-kit`              | **0.31.10**           | Migrations CLI                     |
| `@neondatabase/serverless` | **1.0.2**             | Neon driver                        |
| `@supabase/supabase-js`    | **2.103.0**           | Supabase client                    |
| `pg`                       | ⚠️ Validation pending | Optional classic TCP Postgres lane |

### Tooling Rules

* switch providers via environment variables
* use one migration workflow
* never install a database driver directly in an app

---

## §5 · Auth Layer

### Provider Matrix

| Lane                          | Provider          | Package                 | Cost Model  | Data Ownership | Best Fit                        |
| ----------------------------- | ----------------- | ----------------------- | ----------- | -------------- | ------------------------------- |
| **Internal tools — Primary**  | **Clerk**         | `@clerk/nextjs`         | Managed     | Vendor-managed | Internal dashboards, team tools |
| **Client portals — Primary**  | **Better Auth**   | `better-auth`           | Self-hosted | You own data   | Client portals that may scale   |
| **OSS / full control**        | **Auth.js**       | `next-auth`             | Self-hosted | You own data   | OSS / full control              |
| **Integrated fallback**       | **Supabase Auth** | `@supabase/supabase-js` | Bundled     | Managed        | When already using Supabase     |
| **Enterprise SSO escalation** | **WorkOS**        | REST / SDK              | Managed     | Vendor-managed | Enterprise SAML / SCIM          |

### Package Pins

**`@agency/auth-internal`**

| Package         | Pin        |
| --------------- | ---------- |
| `@clerk/nextjs` | **7.0.12** |

**`@agency/auth-portal`**

| Package                        | Pin       |
| ------------------------------ | --------- |
| `better-auth`                  | **1.6.2** |
| `@better-auth/drizzle-adapter` | **1.6.2** |

### Selection Rules

* never mix auth providers within the same app
* Better Auth integrates with `@agency/data-db`
* WorkOS is escalation only

---

## §6 · Email Stack

### Architecture Rule

`@agency/email-templates` handles rendering only.
`@agency/email-service` handles delivery only.
Apps call `@agency/email-service` and never touch provider SDKs directly.

### Template Package (`@agency/email-templates`)

| Package                       | Pin        | Notes                   |
| ----------------------------- | ---------- | ----------------------- |
| `@react-email/components`     | **1.0.12** | Component primitives    |
| `@react-email/preview-server` | **5.2.10** | Dev preview server only |

### Transport Providers (`@agency/email-service`)

| Provider     | Package                         | Free Tier         | Best Fit                     | Lane    |
| ------------ | ------------------------------- | ----------------- | ---------------------------- | ------- |
| **Resend**   | `resend@6.10.0`                 | verify before use | Developer DX                 | Primary |
| **Postmark** | `postmark@4.0.7`                | verify before use | Transactional deliverability | Alt     |
| **Brevo**    | `@getbrevo/brevo@5.0.3` or REST | verify before use | Budget clients               | Backup  |
| **SendGrid** | `@sendgrid/mail`                | verify before use | Enterprise contracts         | Backup  |
| **AWS SES**  | `@aws-sdk/client-ses`           | verify before use | High-volume AWS setups       | Backup  |

**Repo rule:** only one transport provider is active per deployment.

---

## §7 · CMS Layer

### Provider Matrix

| Provider        | Package(s)              | Self-hostable | Best Fit                   | Lane           |
| --------------- | ----------------------- | ------------- | -------------------------- | -------------- |
| **Sanity**      | `sanity`, `next-sanity` | No            | Rich content modeling      | Primary        |
| **Hygraph**     | GraphQL / SDK           | No            | GraphQL-native teams       | Backup         |
| **Contentful**  | `contentful`            | No            | Enterprise-familiar CMS    | Backup         |
| **Prismic**     | `@prismicio/client`     | No            | Slice-based page building  | Backup         |
| **Strapi**      | `@strapi/strapi`        | Yes           | Self-hosted control        | Self-host lane |
| **Payload CMS** | `payload`               | Yes           | TypeScript-native CMS      | Self-host alt  |
| **Directus**    | `@directus/sdk`         | Yes           | DB-first CMS/data platform | Self-host alt  |

**`@agency/data-cms` owns all CMS dependencies.**
Apps consume `@agency/data-cms` exports — they do not install CMS SDKs directly.

### Default Sanity lane pins

| Package          | Pin        |
| ---------------- | ---------- |
| `sanity`         | **5.20.0** |
| `next-sanity`    | **12.2.2** |
| `@sanity/client` | **7.20.0** |

---

## §8 · Analytics Stack

### Architecture Rule

`@agency/analytics` provides a provider-abstracted interface.
Apps call the abstraction — they do not import trackers directly.

### Default providers

| Provider                     | Package                                     | Best Fit                  | Lane                |
| ---------------------------- | ------------------------------------------- | ------------------------- | ------------------- |
| **Plausible**                | `@plausible-analytics/tracker@0.4.4`        | Public marketing sites    | Primary — marketing |
| **PostHog**                  | `posthog-js@1.366.0`, `posthog-node@5.29.2` | Product analytics / flags | Primary — product   |
| **Cloudflare Web Analytics** | Script only                                 | Static/edge sites         | Backup              |
| **Microsoft Clarity**        | Script / REST                               | Heatmaps / session review | Backup              |

### Escalation packages

| Package                            | Trigger                                     |
| ---------------------------------- | ------------------------------------------- |
| `@agency/analytics-attribution`    | Multi-touch attribution needed              |
| `@agency/analytics-consent-bridge` | 2+ analytics providers need unified consent |

---

## §9 · Feature Flags & Experimentation

| Provider               | Type                | Best Fit                        | Lane                     |
| ---------------------- | ------------------- | ------------------------------- | ------------------------ |
| **PostHog**            | Cloud managed       | Product-side flags              | Primary — product        |
| **Vercel Edge Config** | Edge infrastructure | Zero-latency marketing AB tests | Primary — edge marketing |
| **GrowthBook**         | OSS/cloud           | Stats-rigorous experimentation  | Backup                   |
| **Flagsmith**          | OSS/cloud           | Flags + remote config           | Backup                   |
| **LaunchDarkly**       | Enterprise managed  | Enterprise SDK breadth          | Enterprise escalation    |

### Package Ownership

| Package                 | Internal pkg                   | Condition                       |
| ----------------------- | ------------------------------ | ------------------------------- |
| PostHog flags           | `@agency/analytics`            | Active when PostHog is provider |
| Edge Config experiments | `@agency/experimentation-edge` | 🔒 Trigger-gated                |
| General experimentation | `@agency/experimentation`      | 🔒 Trigger-gated                |

### `@agency/experimentation-edge`

| Package               | Pin       |
| --------------------- | --------- |
| `@vercel/edge-config` | **1.4.3** |

---

## §10 · Monitoring, RUM & Observability

> Entire category is condition-gated. Do not install until the trigger in §14 is met.

| Provider                  | Type                | Best Fit                      | Lane       |
| ------------------------- | ------------------- | ----------------------------- | ---------- |
| **Vercel Speed Insights** | Built-in            | Core Web Vitals on Vercel     | Default    |
| **Vercel Analytics**      | Built-in            | Lightweight traffic analytics | Default    |
| **New Relic**             | Full-stack          | Full-stack APM + RUM          | Primary    |
| **Sentry**                | Error + performance | Error monitoring              | Error lane |
| **Grafana Faro**          | OSS RUM             | OSS-focused teams             | Backup     |

---

## §11 · Communication & Notifications

### `@agency/notifications`

Install only the minimum provider SDK required for the approved workflow.

| Provider            | Package                      | Best Fit                        |
| ------------------- | ---------------------------- | ------------------------------- |
| **Slack**           | `@slack/web-api`             | Internal ops notifications      |
| **Discord**         | `discord.js` or webhook-only | Dev team notifications          |
| **Generic webhook** | native `fetch`               | Simple outbound push            |
| **Knock**           | `@knocklabs/node`            | Multi-channel orchestration     |
| **Novu**            | `@novu/node`                 | OSS notification infrastructure |

---

## §12 · Testing & Component Workbench

> Centralize only when repetition is observed.

### Unit & Integration (`@agency/test-setup`)

| Package                       | Pin        |
| ----------------------------- | ---------- |
| `vitest`                      | **4.1.3**  |
| `@testing-library/react`      | **16.3.2** |
| `@testing-library/jest-dom`   | **6.9.1**  |
| `@testing-library/user-event` | **14.6.1** |
| `jsdom`                       | **29.0.2** |

### E2E (`@agency/test-setup`)

| Package            | Pin        |
| ------------------ | ---------- |
| `@playwright/test` | **1.59.1** |

### Component Workbench (pick one)

| Option        | Package                         | Pin                      |
| ------------- | ------------------------------- | ------------------------ |
| **Storybook** | `storybook`, `@storybook/react` | Approved range: `^8.6.0` |
| **Ladle**     | `@ladle/react`                  | **5.1.1**                |

### Test Fixtures (`@agency/test-fixtures`)

| Package           | Pin        |
| ----------------- | ---------- |
| `@faker-js/faker` | **10.4.0** |

---

## §13 · Internal Package Dependency Matrix

This table is the canonical record of what each internal package is allowed to depend on.

| Package                               | Allowed external deps                                                                                                                                                | Allowed internal deps                                                                       |
| ------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| `@agency/config-eslint`               | `eslint (approved range: ^9.0.0)`, `eslint-config-next@16.2.3`, `@typescript-eslint/* (approved range: ^8.0.0)`, `eslint-plugin-react-hooks (⚠️ validation pending)` | —                                                                                           |
| `@agency/config-typescript`           | `typescript@6.0.2`                                                                                                                                                   | —                                                                                           |
| `@agency/config-tailwind`             | `tailwindcss@4.2.2`, `postcss@8.5.9`, `autoprefixer@10.4.27`                                                                                                         | —                                                                                           |
| `@agency/config-prettier`             | `prettier@3.5.0`                                                                                                                                                     | —                                                                                           |
| `@agency/config-react-compiler`       | `babel-plugin-react-compiler (⚠️ validation pending; install only when pilot is approved)`                                                                           | —                                                                                           |
| `@agency/core-types`                  | `zod`, `typescript`                                                                                                                                                  | —                                                                                           |
| `@agency/core-utils`                  | `typescript`                                                                                                                                                         | `@agency/core-types`                                                                        |
| `@agency/core-constants`              | `typescript`                                                                                                                                                         | `@agency/core-types`                                                                        |
| `@agency/core-hooks`                  | `react`, `typescript`                                                                                                                                                | `@agency/core-types`, `@agency/core-utils`                                                  |
| `@agency/ui-theme`                    | —                                                                                                                                                                    | `@agency/config-tailwind`                                                                   |
| `@agency/ui-icons`                    | `lucide-react (⚠️ validation pending)`                                                                                                                               | —                                                                                           |
| `@agency/ui-design-system`            | `react`, `react-dom`, `@radix-ui/react-*`, `clsx@2.1.1`, `tailwind-merge@3.5.0`, `class-variance-authority@0.7.1`                                                    | `@agency/ui-theme`, `@agency/ui-icons`, `@agency/core-types`                                |
| `@agency/seo`                         | `next`, `react`                                                                                                                                                      | `@agency/core-types`, `@agency/core-utils`                                                  |
| `@agency/compliance`                  | `react`, `zod`                                                                                                                                                       | `@agency/core-types`, `@agency/ui-design-system`                                            |
| `@agency/compliance-security-headers` | —                                                                                                                                                                    | `@agency/compliance`                                                                        |
| `@agency/monitoring`                  | provider SDKs                                                                                                                                                        | `@agency/core-types`                                                                        |
| `@agency/monitoring-rum`              | provider SDKs                                                                                                                                                        | `@agency/monitoring`                                                                        |
| `@agency/data-db`                     | `drizzle-orm@0.45.2`, `drizzle-kit@0.31.10`, `@neondatabase/serverless@1.0.2`, `@supabase/supabase-js@2.103.0`, `pg (⚠️ validation pending)`                         | `@agency/core-types`                                                                        |
| `@agency/data-cms`                    | `sanity@5.20.0`, `next-sanity@12.2.2`, `@sanity/client@7.20.0`                                                                                                       | `@agency/core-types`                                                                        |
| `@agency/data-content-federation`     | federation provider SDKs                                                                                                                                             | `@agency/data-cms`, `@agency/data-db`, `@agency/core-types`                                 |
| `@agency/data-ai-enrichment`          | `ai (approved range: ^6.0.0)`, provider adapters (⚠️ validation pending)`                                                                                            | `@agency/data-cms`, `@agency/core-types`                                                    |
| `@agency/data-api-client`             | `zod`                                                                                                                                                                | `@agency/core-types`, `@agency/core-utils`                                                  |
| `@agency/auth-internal`               | `@clerk/nextjs@7.0.12`                                                                                                                                               | `@agency/core-types`                                                                        |
| `@agency/auth-portal`                 | `better-auth@1.6.2`, `@better-auth/drizzle-adapter@1.6.2`                                                                                                            | `@agency/core-types`, `@agency/data-db`                                                     |
| `@agency/email-templates`             | `@react-email/components@1.0.12`, `react`, `react-dom`                                                                                                               | `@agency/core-types`                                                                        |
| `@agency/email-service`               | transport provider SDKs                                                                                                                                              | `@agency/email-templates`, `@agency/core-types`                                             |
| `@agency/notifications`               | provider SDKs                                                                                                                                                        | `@agency/core-types`, `@agency/email-service`                                               |
| `@agency/analytics`                   | `@plausible-analytics/tracker@0.4.4`, `posthog-js@1.366.0`, `posthog-node@5.29.2`                                                                                    | `@agency/core-types`                                                                        |
| `@agency/analytics-attribution`       | attribution provider SDKs                                                                                                                                            | `@agency/analytics`, `@agency/compliance`                                                   |
| `@agency/analytics-consent-bridge`    | —                                                                                                                                                                    | `@agency/analytics`, `@agency/compliance`                                                   |
| `@agency/experimentation`             | provider SDKs                                                                                                                                                        | `@agency/analytics`, `@agency/core-types`                                                   |
| `@agency/experimentation-edge`        | `@vercel/edge-config@1.4.3`                                                                                                                                          | `@agency/analytics`, `@agency/core-types`                                                   |
| `@agency/lead-capture`                | `react-hook-form@7.51.0`, `@hookform/resolvers@3.3.0`, `zod@3.23.0`                                                                                                  | `@agency/ui-design-system`, `@agency/analytics`, `@agency/compliance`, `@agency/core-types` |
| `@agency/lead-capture-progressive`    | —                                                                                                                                                                    | `@agency/lead-capture`                                                                      |
| `@agency/lead-capture-enrichment`     | enrichment provider SDKs                                                                                                                                             | `@agency/lead-capture`, `@agency/data-db`                                                   |
| `@agency/test-setup`                  | `vitest@4.1.3`, `@testing-library/react@16.3.2`, `@playwright/test@1.59.1`, `jsdom@29.0.2`                                                                           | —                                                                                           |
| `@agency/test-fixtures`               | `@faker-js/faker@10.4.0`                                                                                                                                             | `@agency/core-types`                                                                        |

---

## §14 · Conditional Package Activation

🟢 = Build now
🟡 = Build when trigger is met
🔒 = Do not build until trigger is satisfied

| Package                               | Status | Build when                                          | Do NOT build when                        | Min consumers |
| ------------------------------------- | ------ | --------------------------------------------------- | ---------------------------------------- | ------------- |
| `@agency/config-*`                    | 🟢     | Always                                              | —                                        | —             |
| `@agency/core-*`                      | 🟢     | Always                                              | —                                        | —             |
| `@agency/ui-*`                        | 🟢     | Always                                              | —                                        | —             |
| `@agency/seo`                         | 🟡     | 2+ surfaces need shared SEO helpers                 | SEO limited to 1 simple app              | 2             |
| `@agency/compliance`                  | 🟡     | First real consent/privacy UI is needed             | One-off banner acceptable                | 1             |
| `@agency/compliance-security-headers` | 🔒     | Audit or stricter header needs justify it           | Standard platform headers are sufficient | 1             |
| `@agency/monitoring`                  | 🔒     | Ranking-critical or real observability need exists  | Lab/platform defaults are sufficient     | 1             |
| `@agency/monitoring-rum`              | 🔒     | Real-user performance data is needed                | No ranking-critical traffic yet          | 1             |
| `@agency/data-db`                     | 🟡     | First internal tool needs persistent data           | Storage needs are still hypothetical     | 1             |
| `@agency/data-cms`                    | 🟡     | First Sanity-backed site is approved                | Content lives in a single app only       | 1             |
| `@agency/data-content-federation`     | 🔒     | 2+ content sources need federation                  | Single CMS source                        | 1             |
| `@agency/data-ai-enrichment`          | 🔒     | High content volume justifies AI automation         | Manual enrichment is sufficient          | 1             |
| `@agency/data-api-client`             | 🟡     | 2+ apps call the same internal API                  | Only one app uses that API               | 2             |
| `@agency/auth-internal`               | 🟡     | First internal tool requires auth                   | Tools are public-only                    | 1             |
| `@agency/auth-portal`                 | 🟡     | First client portal needs login                     | Sites are brochure-only                  | 1             |
| `@agency/email-templates`             | 🟡     | First transactional email flow is real              | Email is hypothetical                    | 1             |
| `@agency/email-service`               | 🟡     | With `@agency/email-templates`                      | Email is hypothetical                    | 1             |
| `@agency/notifications`               | 🔒     | 2+ workflows need shared notification delivery      | One app can call provider directly       | 2             |
| `@agency/analytics`                   | 🟡     | 2+ apps need analytics abstraction                  | Analytics limited to one app             | 2             |
| `@agency/analytics-attribution`       | 🔒     | Cross-channel attribution is truly needed           | Last-click is sufficient                 | 1             |
| `@agency/analytics-consent-bridge`    | 🔒     | 2+ analytics providers need unified consent         | One provider is sufficient               | 2             |
| `@agency/experimentation`             | 🔒     | First real AB test / flag system is needed          | No experimentation planned               | 1             |
| `@agency/experimentation-edge`        | 🔒     | Marketing site needs edge AB testing                | Product-side flags are sufficient        | 1             |
| `@agency/lead-capture`                | 🔒     | Marketing site needs lead forms                     | No inbound lead flow                     | 1             |
| `@agency/lead-capture-progressive`    | 🔒     | Forms are materially complex or abandonment is real | Simple forms are sufficient              | 1             |
| `@agency/lead-capture-enrichment`     | 🔒     | Sales workflow requires enrichment                  | Manual research is sufficient            | 1             |
| `@agency/test-setup`                  | 🟡     | Test config duplication is observed                 | Test needs remain unique                 | 2             |
| `@agency/test-fixtures`               | 🔒     | 2+ suites need shared fixtures                      | Test data remains suite-specific         | 2             |

---

## §15 · Client-Profile Routing

Use this table to choose the right provider lane when starting a new client project.

| Profile                            | DB Lane                       | Auth Lane              | CMS Lane             | Email Lane                | Analytics Lane                             | Hosting Lane              |
| ---------------------------------- | ----------------------------- | ---------------------- | -------------------- | ------------------------- | ------------------------------------------ | ------------------------- |
| **Brochure / Marketing site**      | None or Neon                  | None                   | Sanity               | Resend                    | Plausible or Cloudflare                    | Vercel or Cloudflare      |
| **Privacy-sensitive / EU client**  | Neon/Supabase EU              | Better Auth            | Strapi / Payload     | Brevo or self-hosted SMTP | Umami or Matomo                            | Cloudflare or self-hosted |
| **Internal tool / dashboard**      | Neon                          | Clerk                  | None or Sanity       | Resend                    | PostHog                                    | Vercel                    |
| **Client portal / SaaS starter**   | Neon or Supabase              | Better Auth            | Sanity or Contentful | Resend or Postmark        | PostHog                                    | Vercel                    |
| **High-traffic landing page**      | Neon                          | None                   | Sanity or Prismic    | Resend                    | Plausible + PostHog + edge experimentation | Vercel Edge or Cloudflare |
| **Enterprise / procurement-bound** | Aurora PostgreSQL or Supabase | WorkOS + Clerk         | Contentful or Sanity | SendGrid or SES           | Datadog or New Relic                       | AWS / Azure / GCP         |
| **Budget / startup MVP**           | Neon or Supabase              | Better Auth or Auth.js | Cosmic or Prismic    | Brevo / Resend            | Cloudflare Analytics + Clarity             | Vercel Hobby              |
| **Content-heavy / editorial**      | Neon                          | Clerk or Better Auth   | Sanity               | Resend                    | Plausible                                  | Vercel                    |

---

## §16 · CI/CD & Hosting

| Platform                       | Role                      | Best Fit                                     |
| ------------------------------ | ------------------------- | -------------------------------------------- |
| **Vercel**                     | Primary default           | Fastest DX, previews, native Next.js support |
| **Cloudflare Pages + Workers** | Cost/edge alternative     | Static/edge-heavy deployments                |
| **Netlify**                    | Alternative managed       | Simpler static + serverless sites            |
| **Railway**                    | Long-running workloads    | Background jobs / stateful processes         |
| **Render**                     | Long-running alternative  | Simple server processes                      |
| **AWS / GCP / Azure**          | Enterprise / self-managed | Enterprise mandates                          |

### GitHub Actions Baseline

```yaml
- uses: actions/checkout@v4
- uses: actions/setup-node@v4
  with:
    node-version: "24.x"
- run: pnpm install --frozen-lockfile
- run: pnpm lint
- run: pnpm test
- run: pnpm build
```

All CI jobs target Node 24.x.

---

## §17 · AI Agent Rules

1. Do not install any package not listed in this document.
2. Do not install a package in the wrong internal package.
3. Do not activate a 🔒 package unless its trigger is explicitly confirmed.
4. Do not hard-code provider names in app logic.
5. Do not add a second auth provider to an existing app without explicit approval.
6. Do not add monitoring/RUM packages until their trigger is confirmed.
7. Do not install Storybook and Ladle in the same repo.
8. Use `workspace:*` for all internal dependencies.
9. Version authority lives here first.
10. When in doubt, do less.

---

## §18 · Linting Configuration (Post-Next.js 16)

> `next lint` is removed. Configure ESLint directly.

### Root script baseline

```json
{
  "scripts": {
    "lint": "eslint . --ext .ts,.tsx,.js,.jsx",
    "lint:fix": "eslint . --ext .ts,.tsx,.js,.jsx --fix"
  }
}
```

### `@agency/config-eslint` requirements

* flat config only
* include Next rules
* include TypeScript rules
* include boundary rules
* include the standard hooks lint path

### Compiler-lint note

Use the shared ESLint lane to surface React Compiler diagnostics through `eslint-plugin-react-hooks`.

Do not treat compiler rollout as an ESLint-only opt-in.

### Biome

Biome remains a separate open evaluation topic.
Do not migrate by inference.

---

## §19 · Version Verification and QA Notes

This document has been normalized across Topics 1–10.

### 6–10 QA corrections now reflected

* React Compiler integration wording corrected
* compiler diagnostics moved to the standard hooks lint path
* Tailwind v4 ownership clarified:

  * `config-tailwind` = setup contract
  * `ui-theme` = semantic tokens
  * `ui-design-system` = primitives
* shadcn monorepo workflow wording corrected

### Remaining caution

This document is the dependency authority, but not every non-core provider row was re-verified during the Topic 6–10 QA pass.

That means:

* core stack, governance-critical, and corrected topic-sensitive sections should be treated as highest-confidence
* any provider lane marked `⚠️ Validation pending` must be verified before active implementation
* future provider refreshes must still begin in this document

---

*Last updated: April 9, 2026 — final reproduced version after Topics 6–10 QA corrections.*