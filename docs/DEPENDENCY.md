# Agency Monorepo — Dependency Governance

> **Purpose of this document**  
> This is not a technology wishlist. It is a *governance contract* — the authoritative reference that controls which dependencies exist, where they live, when they are allowed to be installed, and what conditions must be met before any conditional package is activated. AI coding tools must read this document before installing anything. No dependency outside this contract may be added without updating this document first.

***

## How to use this document

1. **Before installing any package** — look up which internal package owns that dependency. Install it there, not in an app.
2. **Before creating a new package** — verify its trigger condition is met (see §14).
3. **Before choosing a provider** — consult the provider lane table for that category. Do not invent a new provider.
4. **When a client has unusual needs** — consult §15 Client-Profile Routing to select the right lane.
5. **"Do not build yet" items** — packages marked 🔒 in §14 must not be scaffolded until their trigger is satisfied.

***

## §1 · Runtime, Package Manager & Compiler

Global baseline. These values are authoritative. Do not override per-package.

| Tool | Pin | Minimum | Source of truth |
| --- | --- | --- | --- |
| **Node.js** | 24.x LTS | 20.9.0 | `.nvmrc` + `engines` in root `package.json` |
| **pnpm** | 10.33.0 | 10.x | `packageManager` field in root `package.json` |
| **TypeScript** | 6.0 | 5.x | `devDependencies` in `@agency/config-typescript` |

**TS 6.0 breaking changes** — `--moduleResolution node` removed; ES5 target deprecated; `strict: true` is now the default. `@agency/config-typescript` must use `moduleResolution: "bundler"` or `"nodenext"`.

**Root `package.json` required fields:**
```json
{
  "packageManager": "pnpm@10.33.0",
  "engines": { "node": ">=20.9.0" }
}
```

**`pnpm-workspace.yaml` minimum:**
```yaml
packages:
  - "apps/*"
  - "packages/*"
  - "tools/*"
```

***

## §2 · Core Framework & Styling

These three must always be installed as a coordinated trio. Never install one without pinning all three.

| Package | Pin | Notes |
| --- | --- | --- |
| `next` | **16.2.2** | App Router-first. Requires Node 20.9+, TS 5+. |
| `react` | **19.2.4** | Required pairing for Next 16. |
| `react-dom` | **19.2.4** | Must match `react` exactly. |

### Tailwind CSS v4

| Package | Pin | Notes |
| --- | --- | --- |
| `tailwindcss` | **4.2.2** | CSS-first. `@theme {}` replaces `tailwind.config.js`. `presets` API removed. |
| `postcss` | latest 8.x | Still required for Next's CSS pipeline. |
| `autoprefixer` | latest 10.x | Standard PostCSS peer. |

**`@agency/config-tailwind` must export a CSS file — not a JS preset.** The `presets` API does not exist in v4.
- Export `theme.css` with design tokens inside an `@theme {}` block.
- Consuming apps: `@import "@agency/config-tailwind/theme.css"` + `@source "../../packages/ui/**/*.tsx"`.

### shadcn/ui Stack

shadcn/ui is **not an installable package**. Run the CLI into `packages/ui/design-system`. For Tailwind v4, leave `tailwind` empty in `components.json`.

| Package | Pin | Owned by |
| --- | --- | --- |
| `@radix-ui/react-*` | latest | Installed per-component by shadcn CLI → `@agency/ui-design-system` |
| `lucide-react` | latest | `@agency/ui-icons` |
| `clsx` | latest | `@agency/ui-design-system` |
| `tailwind-merge` | latest | `@agency/ui-design-system` |
| `class-variance-authority` | latest | `@agency/ui-design-system` |

### React Compiler (`@agency/config-react-compiler`)

React Compiler is **stable in Next 16 but opt-in only**. It is not enabled by default.

- Enable via `reactCompiler: true` in `next.config.ts` — not globally.
- Required dev dependency when opt-in: `babel-plugin-react-compiler`.
- This config lives exclusively in `@agency/config-react-compiler`. Apps consume it; they do not configure it themselves.

***

## §3 · Monorepo Tooling

| Package | Pin | Purpose |
| --- | --- | --- |
| `turbo` | **2.9.4** | Task orchestration above pnpm workspaces. |
| `@changesets/cli` | **2.30.0** | Versioning and changelogs. |
| `eslint` | latest 9.x | Base linter. |
| `eslint-config-next` | **16.2.2** | Must match Next pin exactly. |
| `@typescript-eslint/parser` | latest | TS-aware ESLint parser. |
| `@typescript-eslint/eslint-plugin` | latest | TS ESLint rules. |
| `@types/node` | latest | Node typings for apps and tools. |

**All internal dependencies use `workspace:*` ranges** so pnpm resolves locally and Changesets can bump versions correctly.

***

## §4 · Database Layer

### Provider Strategy

| Lane | Provider | Role | Free Tier (verify before use) | Best Fit |
| --- | --- | --- | --- | --- |
| **Primary** | **Neon** | Serverless Postgres, branching workflow | 0.5 GB storage, 1 project, autosuspend | Branch-heavy dev, PR preview DBs, auth-separate setup |
| **Fallback / Integrated** | **Supabase** | Postgres + Auth + Storage bundle | 500 MB DB, 50k MAU auth, 1 GB storage | All-in-one clients, non-edge budget projects |
| **Enterprise / Cloud-standard** | **AWS Aurora PostgreSQL** | Managed Postgres on AWS Free Tier (new March 2026) | 750 hrs/month, 20 GB | AWS-procurement clients |
| **Alternative managed** | **Aiven** | Managed Postgres | Free tier available (verify limits) | Teams needing managed ops without Neon/Supabase lock-in |

**Drizzle ORM is the mandatory abstraction layer.** Apps never talk directly to a Postgres provider. All queries go through `@agency/data-db`. Switching providers is a config change, not a code change.

### Runtime Packages (`@agency/data-db`)

| Package | Pin | Role |
| --- | --- | --- |
| `drizzle-orm` | **0.45.2** | ORM layer — works with Neon, Supabase, and standard pg. |
| `drizzle-kit` | latest 0.3x | Migrations CLI. |
| `@neondatabase/serverless` | **1.0.2** | Neon driver (primary lane). |
| `@supabase/supabase-js` | **2.102.0** ⚠️ | Supabase client (was pinned at 2.49.0 — **update required**). |
| `pg` | optional | Classic TCP Postgres for non-edge/long-running workers only. |

> ⚠️ `@supabase/supabase-js` version in the previous doc (2.49.0) is stale. Current release is 2.102.0. Update before implementing `@agency/data-db`.

### Tooling Rules
- Switch providers via `DATABASE_PROVIDER` environment variable.
- `drizzle-kit` works with both Neon and Supabase — use one migration workflow.
- Never install a database driver directly in an app. All DB access flows through `@agency/data-db`.

***

## §5 · Auth Layer

### Provider Matrix

| Lane | Provider | Package | Cost Model | Data Ownership | Best Fit |
| --- | --- | --- | --- | --- | --- |
| **Internal tools — Primary** | **Clerk** | `@clerk/nextjs` | Per-MAU (free tier: 10k MAU) | Managed (vendor) | Internal dashboards, team tools — fastest DX |
| **Client portals — Primary** | **Better Auth** | `better-auth` | Zero per-MAU | Self-hosted (you own data) | Client portals that may scale to thousands |
| **OSS / full control** | **Auth.js (NextAuth v5)** | `next-auth` | Free forever | Self-hosted | Open-source projects, full control required |
| **Managed with free tier** | **Authgear** | REST/SDK | Free up to 5k MAU | Managed | Budget clients needing managed auth without Clerk cost |
| **Integrated fallback** | **Supabase Auth** | `@supabase/supabase-js` | Bundled with Supabase | Managed (Supabase) | When already using Supabase as DB |
| **Enterprise SSO escalation** | **WorkOS** | REST | Per-feature | Managed | SAML/SCIM enterprise requirements |

### Package Pins

**`@agency/auth-internal` (Clerk lane):**
| Package | Pin |
| --- | --- |
| `@clerk/nextjs` | **7.0.8** |

**`@agency/auth-portal` (Better Auth lane):**
| Package | Pin |
| --- | --- |
| `better-auth` | **1.6.0** ⚠️ See breaking changes note below |
| `better-auth/react` | **1.6.0** |
| Plugins | optional (`better-auth-plugins` for 2FA, passkeys, RBAC) |

> ⚠️ **Better Auth 1.6.0 Breaking Changes** (April 6, 2026):
> - `session.freshAge` now calculates from `createdAt` instead of `updatedAt` — session activity no longer extends freshness window
> - `oidc-provider` plugin deprecated — migrate to `@better-auth/oauth-provider` before next major release
> - See [Better Auth Changelog](https://better-auth.com/changelog) for migration guide

### Selection Rules
- **Never mix auth providers within the same app** — pick one lane per app.
- Better Auth requires a database connection — it integrates with `@agency/data-db`.
- Auth.js is a valid swap-in for Better Auth on client portals when full OSS posture is required.
- WorkOS is escalation only. Do not add it speculatively.

***

## §6 · Email Stack

### Architecture Rule
`@agency/email-templates` handles **rendering only** (React Email components, no transport logic).  
`@agency/email-service` handles **delivery only** (provider SDKs, no template logic).  
Apps call `@agency/email-service` and never touch provider SDKs directly.

### Template Package (`@agency/email-templates`)

| Package | Pin | Notes |
| --- | --- | --- |
| `@react-email/components` | **1.0.10** | Component primitives. |
| `@react-email/preview-server` | latest | Dev preview server — `devDependencies` only. |

### Transport Providers (`@agency/email-service`)

| Provider | Package | Free Tier | Best Fit | Lane |
| --- | --- | --- | --- | --- |
| **Resend** | `resend` (latest 3.x) | 3,000 emails/mo, 1 domain | Developer DX, modern API, monorepo-friendly | Primary |
| **Postmark** | `postmark` (4.0.7) | 100 emails/mo (dev only) | Transactional deliverability, premium | Primary alt / high-stakes transactional |
| **Brevo (Sendinblue)** | REST or `@getbrevo/brevo` | 300 emails/day | Budget clients, marketing + transactional blend | Backup |
| **SendGrid** | `@sendgrid/mail` | 100 emails/day | Enterprise, existing Twilio contracts | Backup |
| **Mailtrap** | REST | Free dev sandbox | Dev/staging email testing (not production) | Dev tooling |
| **SMTP2GO** | SMTP/REST | 1,000 emails/mo | SMTP-native clients, small volume | Backup |
| **AWS SES** | `@aws-sdk/client-ses` | $0.10/1k after free tier | High-volume, existing AWS setup | Backup |

**Repo rule:** Only one transport provider is active per deployment. Switch via `EMAIL_PROVIDER` env var. Never hard-code provider name in app logic.

***

## §7 · CMS Layer

### Provider Matrix

| Provider | Package(s) | Free Tier | Self-hostable | Best Fit | Lane |
| --- | --- | --- | --- | --- | --- |
| **Sanity** | `sanity@5.19.0`, `next-sanity@12.1.5` | Free (with seat limits) | No (cloud-hosted Studio, open-source SDK) | Rich content modeling, real-time collab, visual editing | **Primary** |
| **Hygraph** | REST/GraphQL SDK | Free (limited operations) | No | GraphQL-native CMS, federated content | Backup |
| **Contentful** | `contentful` | Free (25k records, 2 locales) | No | Enterprise-familiar CMS, broad ecosystem | Backup |
| **Prismic** | `@prismicio/client` | Free (1 user, 1 repo) | No | Slice-based page building, Next.js strong support | Backup |
| **Cosmic** | REST SDK | Free (100 objects) | No | Simple, budget-friendly, API-first | Backup / small sites |
| **Strapi** | `@strapi/strapi` | Free (self-hosted) | **Yes** | Maximum control, EU data residency, no vendor lock-in | Self-host lane |
| **Payload CMS** | `payload` | Free (self-hosted) | **Yes** | TypeScript-native, code-first schema, tight Next.js integration | Self-host alt |
| **Directus** | `@directus/sdk` | Free (self-hosted) | **Yes** | DB-first, non-destructive, data platform approach | Self-host alt |

**`@agency/data-cms` owns all CMS dependencies.** Apps consume `@agency/data-cms` exports — they do not install CMS SDKs directly.

### `@agency/data-cms` Default Packages (Sanity lane)

| Package | Pin |
| --- | --- |
| `sanity` | **5.19.0** |
| `next-sanity` | **12.1.5** |
| `@sanity/client` | **7.20.0** (optional if only using `next-sanity`) |

### CMS Selection Trigger
- Default to Sanity when a client site requires structured content authoring.
- Switch to Strapi/Payload/Directus when EU data residency, self-hosted control, or no-cloud mandate is required.
- Consider Prismic/Hygraph when a client team is GraphQL-centric or prefers slice-based page building.

***

## §8 · Analytics Stack

### Architecture Rule
`@agency/analytics` provides a provider-abstracted interface. Apps call the abstraction — they do not import Plausible, PostHog, or any other tracker directly.

### Provider Matrix

| Provider | Package | Free Tier | Privacy | Best Fit | Lane |
| --- | --- | --- | --- | --- | --- |
| **Plausible** | `@plausible-analytics/tracker@0.4.4` | $9/mo (no meaningful free tier for production) | GDPR-compliant by default, cookieless | Public marketing sites, EU-first | **Primary — marketing** |
| **PostHog** | `posthog-js@1.364.7`, `posthog-node@5.28.8` | 1M events/mo free | Configurable, self-host available | Product analytics, feature flags, session replay | **Primary — product** |
| **Cloudflare Web Analytics** | Script tag only (no npm) | **Free unlimited** | Privacy-first, no cookies | Static/edge sites already on Cloudflare | Backup — zero cost |
| **Microsoft Clarity** | Script tag / REST | **Free unlimited** | GDPR-configurable | Heatmaps, session recording, UX debugging | Backup — free UX layer |
| **Umami** | Self-hosted or cloud | Free self-hosted | GDPR-compliant, cookieless | Privacy-sensitive clients who want self-hosting | Self-host lane |
| **Matomo** | Self-hosted or cloud | Free self-hosted | Full data ownership | Enterprise privacy mandates | Self-host lane |
| **Swetrix** | `swetrix` | Free (5k events/mo) | Open-source, cookieless | Budget or OSS-preference clients | Budget lane |
| **Fathom** | Script tag | $14/mo | Privacy-first, GDPR | Simple privacy-first alternative to Plausible | Paid alt |

### `@agency/analytics` Default Packages

| Package | Pin |
| --- | --- |
| `@plausible-analytics/tracker` | **0.4.4** |
| `posthog-js` | **1.364.7** |
| `posthog-node` | **5.28.8** |

### Escalation Packages (condition-gated — see §14)

| Package | Trigger |
| --- | --- |
| `@agency/analytics-attribution` | Multi-touch attribution needed across 2+ ad platforms |
| `@agency/analytics-consent-bridge` | 2+ analytics providers with different consent requirements |

***

## §9 · Feature Flags & Experimentation

### Provider Matrix

| Provider | Type | Free Tier | Best Fit | Lane |
| --- | --- | --- | --- | --- |
| **PostHog** | Cloud managed | 1M events/mo incl. flags | Product-side flags, tied to analytics | **Primary — product** |
| **Vercel Edge Config** | Edge infrastructure | Included with Vercel | Zero-latency marketing AB tests | **Primary — edge marketing** |
| **GrowthBook** | Open-source + cloud | Free self-hosted | Stats-rigorous experimentation, budget | Backup / self-host |
| **Flagsmith** | Open-source + cloud | Free self-hosted, 50k requests/mo cloud | Feature flags + remote config | Backup |
| **LaunchDarkly** | Enterprise managed | No free tier | Enterprise SDK breadth, compliance | Enterprise escalation |
| **Harness Feature Flags** | Enterprise managed | Free up to 25k MAU | Enterprise with Harness CI | Enterprise escalation |
| **Flipper** | Open-source | Free self-hosted | Ruby-native teams, OSS preference | Special case |

### Package Ownership

| Package | Internal pkg | Condition |
| --- | --- | --- |
| PostHog flags (product) | `@agency/analytics` | Active when PostHog is provider |
| Edge Config experiments | `@agency/experimentation-edge` | 🔒 See §14 trigger |
| General experimentation | `@agency/experimentation` | 🔒 See §14 trigger |

### `@agency/experimentation-edge` Dependencies (when activated)

| Package | Pin |
| --- | --- |
| `@vercel/edge-config` | latest |

***

## §10 · Monitoring, RUM & Observability

> **This entire category is condition-gated.** Do not install any monitoring package until the trigger in §14 is met.

### Provider Matrix

| Provider | Type | Free Tier | Best Fit | Lane |
| --- | --- | --- | --- | --- |
| **Vercel Speed Insights** | Built-in Vercel | Included | Core Web Vitals for Vercel-deployed apps | **Default for Vercel apps** |
| **Vercel Analytics** | Built-in Vercel | Included | Lightweight traffic analytics on Vercel | **Default for Vercel apps** |
| **New Relic** | Full-stack observability | **100 GB ingest/mo free** | Full-stack APM + RUM + logs | Primary RUM/observability |
| **Grafana Faro + Grafana Cloud** | Open-source RUM + cloud | Free tier (50 GB logs, 10k metrics) | Open-source RUM with cloud ingest | Backup / OSS lane |
| **Elastic RUM** | APM + RUM | Free self-hosted | Teams already using Elastic stack | Self-host lane |
| **Middleware.io** | Full-stack | Free tier available | RUM + APM for growing projects | Budget lane |
| **OpenObserve** | Open-source | Free self-hosted | Cost-optimized observability, S3 backend | Self-host / cost lane |
| **Sentry** | Error + performance | Free (5k errors/mo) | Error tracking + basic performance | Error monitoring primary |
| **Datadog** | Enterprise | No meaningful free tier | Enterprise-grade full observability | Enterprise escalation |

### `@agency/monitoring` and `@agency/monitoring-rum`

Both packages are **🔒 condition-gated** (see §14).

When activated, package dependencies are:

| Scenario | Package to install |
| --- | --- |
| Vercel default (no extra install) | Use built-in Vercel Speed Insights + Analytics via Next.js integration |
| New Relic RUM lane | `newrelic` (Node agent) + browser agent script |
| Sentry error lane | `@sentry/nextjs` |
| Grafana Faro | `@grafana/faro-web-sdk` |

***

## §11 · Communication & Notifications

### `@agency/notifications` Dependencies

| Package | Version | Role |
| --- | --- | --- |
| `posthog-node` | **5.28.8** | Route notification events into analytics (optional) |
| Provider SDKs | Per-provider | Slack, Discord, webhook — install the minimum required |

**Notification provider options (install only the one(s) needed):**

| Provider | Package | Free Tier | Best Fit |
| --- | --- | --- | --- |
| **Slack** | `@slack/web-api` | Free (limited history) | Internal ops notifications |
| **Discord** | `discord.js` or webhook-only | Free | Dev team notifications |
| **Generic webhook** | Native `fetch` — no package needed | N/A | Simple outbound push |
| **Knock** | `@knocklabs/node` | Free (10k notifications/mo) | Multi-channel orchestration |
| **Novu** | `@novu/node` | Free self-hosted | Open-source notification infra |

***

## §12 · Testing & Component Workbench

> **Centralize only when repetition is observed.** `@agency/test-setup` and `@agency/test-fixtures` exist to eliminate duplicated config, not as default scaffolding. See §14 for trigger conditions.

### Unit & Integration (`@agency/test-setup`)

| Package | Pin | Notes |
| --- | --- | --- |
| `vitest` | **4.1.3** | Requires Node 20+, Vite 6+. |
| `@testing-library/react` | **16.3.2** | Supports React 19. |
| `@testing-library/jest-dom` | latest | DOM matchers. |
| `@testing-library/user-event` | latest | Interaction helpers. |
| `jsdom` | latest | Browser env for unit tests. |

### E2E (`@agency/test-setup`)

| Package | Pin | Notes |
| --- | --- | --- |
| `@playwright/test` | **1.59.1** | Node 16+ compatible, tested on Node 24. |

### Component Workbench (pick one — do not install both)

| Option | Package | Pin | Best Fit |
| --- | --- | --- | --- |
| **Storybook** | `storybook`, `@storybook/react` | **10.3.4** | Full-featured, design system integration |
| **Ladle** | `@ladle/react` | **5.1.1** | Lightweight, fast startup, less config |

### Test Fixtures (`@agency/test-fixtures`)

| Package | Pin |
| --- | --- |
| `@faker-js/faker` | latest |

***

## §13 · Internal Package Dependency Matrix

This table is the canonical record of what each internal package is allowed to depend on. Installing a dependency in the wrong package is a governance violation.

| Package | Allowed external deps | Allowed internal deps |
| --- | --- | --- |
| `@agency/config-eslint` | `eslint`, `eslint-config-next@16.2.2`, `@typescript-eslint/*` | — |
| `@agency/config-typescript` | `typescript@6.0` | — |
| `@agency/config-tailwind` | `tailwindcss@4.2.2`, `postcss`, `autoprefixer` | — |
| `@agency/config-prettier` | `prettier@3.5.0` | — |
| `@agency/config-react-compiler` | `babel-plugin-react-compiler` | — |
| `@agency/core-types` | `zod`, `typescript` | — |
| `@agency/core-utils` | `typescript` | `@agency/core-types` |
| `@agency/core-constants` | `typescript` | `@agency/core-types` |
| `@agency/core-hooks` | `react`, `typescript` | `@agency/core-types`, `@agency/core-utils` |
| `@agency/ui-theme` | `tailwindcss` | `@agency/config-tailwind` |
| `@agency/ui-icons` | `lucide-react`, `react` | — |
| `@agency/ui-design-system` | `react`, `react-dom`, `tailwindcss`, `@radix-ui/react-*`, `lucide-react`, `clsx`, `tailwind-merge`, `class-variance-authority` | `@agency/ui-theme`, `@agency/ui-icons`, `@agency/core-types` |
| `@agency/seo` | `next`, `react` | `@agency/core-types`, `@agency/core-utils` |
| `@agency/compliance` | `react`, `zod` | `@agency/core-types`, `@agency/ui-design-system` |
| `@agency/compliance-security-headers` | — | `@agency/compliance` |
| `@agency/monitoring` | Provider SDK (see §10) | `@agency/core-types` |
| `@agency/monitoring-rum` | Provider SDK (see §10) | `@agency/monitoring` |
| `@agency/data-db` | `drizzle-orm@0.45.2`, `drizzle-kit`, `@neondatabase/serverless@1.0.2`, `@supabase/supabase-js@2.102.0`, `pg` (optional) | `@agency/core-types` |
| `@agency/data-cms` | `sanity@5.19.0`, `next-sanity@12.1.5`, `@sanity/client@7.20.0` | `@agency/core-types` |
| `@agency/data-content-federation` | Federation provider SDKs | `@agency/data-cms`, `@agency/data-db`, `@agency/core-types` |
| `@agency/data-ai-enrichment` | AI SDK (e.g. `@ai-sdk/openai`) | `@agency/data-cms`, `@agency/core-types` |
| `@agency/data-api-client` | `zod` | `@agency/core-types`, `@agency/core-utils` |
| `@agency/auth-internal` | `@clerk/nextjs@7.0.8` | `@agency/core-types` |
| `@agency/auth-portal` | `better-auth@1.5.0` | `@agency/core-types`, `@agency/data-db` |
| `@agency/email-templates` | `@react-email/components@1.0.10`, `react`, `react-dom` | `@agency/core-types` |
| `@agency/email-service` | Transport provider SDK (see §6) | `@agency/email-templates`, `@agency/core-types` |
| `@agency/notifications` | Provider SDK (see §11) | `@agency/core-types`, `@agency/email-service` |
| `@agency/analytics` | `@plausible-analytics/tracker@0.4.4`, `posthog-js@1.364.7`, `posthog-node@5.28.8` | `@agency/core-types` |
| `@agency/analytics-attribution` | Attribution provider SDKs | `@agency/analytics`, `@agency/compliance` |
| `@agency/analytics-consent-bridge` | — | `@agency/analytics`, `@agency/compliance` |
| `@agency/experimentation` | Provider SDK (see §9) | `@agency/analytics`, `@agency/core-types` |
| `@agency/experimentation-edge` | `@vercel/edge-config` | `@agency/analytics`, `@agency/core-types` |
| `@agency/lead-capture` | `react-hook-form@7.51.0`, `@hookform/resolvers@3.3.0`, `zod@3.23.0` | `@agency/ui-design-system`, `@agency/analytics`, `@agency/compliance`, `@agency/core-types` |
| `@agency/lead-capture-progressive` | — | `@agency/lead-capture` |
| `@agency/lead-capture-enrichment` | Enrichment provider SDK (Clearbit/Apollo) | `@agency/lead-capture`, `@agency/data-db` |
| `@agency/test-setup` | `vitest@4.1.3`, `@testing-library/react@16.3.2`, `@playwright/test@1.59.1`, `jsdom` | — |
| `@agency/test-fixtures` | `@faker-js/faker` | `@agency/core-types` |

***

## §14 · Conditional Package Activation

🟢 = Build now (always required)  
🟡 = Build when trigger is met  
🔒 = Do not build until trigger is satisfied — creating this package prematurely is a governance violation

| Package | Status | Build when | Do NOT build when | Min consumers |
| --- | --- | --- | --- | --- |
| `@agency/config-*` (all 5) | 🟢 | Always | — | — |
| `@agency/core-*` (all 4) | 🟢 | Always | — | — |
| `@agency/ui-*` (all 3) | 🟢 | Always | — | — |
| `@agency/seo` | 🟡 | 2+ surfaces need consistent meta/OG/schema | SEO limited to 1 simple app | 2 |
| `@agency/compliance` | 🟡 | First GDPR/CCPA consent UI needed | One-off banner acceptable | 1 |
| `@agency/compliance-security-headers` | 🔒 | GDPR/CCPA headers required OR security audit mandated | Standard Vercel security headers sufficient | 1 |
| `@agency/monitoring` | 🔒 | CrUX data needed for ranking-critical site | Lighthouse/lab scores sufficient | 1 |
| `@agency/monitoring-rum` | 🔒 | Real user data required beyond lab metrics | No ranking-critical traffic yet | 1 |
| `@agency/data-db` | 🟡 | First internal tool needs persistent data | Storage needs are still hypothetical | 1 |
| `@agency/data-cms` | 🟡 | First Sanity-backed client site confirmed | Content lives in single app | 1 |
| `@agency/data-content-federation` | 🔒 | Content from 2+ sources (e.g. Sanity + Shopify) | Single CMS source | 1 |
| `@agency/data-ai-enrichment` | 🔒 | High content volume justifies AI automation | Manual enrichment is sufficient | 1 |
| `@agency/data-api-client` | 🟡 | 2+ apps call the same internal API | Only one app uses that API | 2 |
| `@agency/auth-internal` | 🟡 | First internal tool requires authentication | Tools are public-only | 1 |
| `@agency/auth-portal` | 🟡 | First client portal needs login | Sites are brochure-only | 1 |
| `@agency/email-templates` | 🟡 | First transactional email flow confirmed | Email is hypothetical | 1 |
| `@agency/email-service` | 🟡 | With `@agency/email-templates` | Email is hypothetical | 1 |
| `@agency/notifications` | 🔒 | 2+ workflows need Slack/Discord/webhook delivery | Single app calls provider directly | 2 |
| `@agency/analytics` | 🟡 | 2+ apps need analytics provider abstraction | Analytics limited to single app | 2 |
| `@agency/analytics-attribution` | 🔒 | Cross-channel attribution across 2+ ad platforms | Last-click attribution sufficient | 1 |
| `@agency/analytics-consent-bridge` | 🔒 | 2+ analytics providers need unified consent | Single provider with built-in consent | 2 |
| `@agency/experimentation` | 🔒 | First AB test or feature flag system needed | No experimentation planned | 1 |
| `@agency/experimentation-edge` | 🔒 | Marketing site needs zero-latency AB testing | Product portals use PostHog/LaunchDarkly | 1 |
| `@agency/lead-capture` | 🔒 | Marketing site needs contact/lead forms | No inbound lead flow | 1 |
| `@agency/lead-capture-progressive` | 🔒 | Forms have 4+ fields OR 40%+ abandonment rate observed | Simple 1–2 field forms sufficient | 1 |
| `@agency/lead-capture-enrichment` | 🔒 | Sales team requires enriched lead data for CRM | Manual research is sufficient | 1 |
| `@agency/test-setup` | 🟡 | Duplicated test config observed across 2+ packages | Test needs are unique per package | 2 |
| `@agency/test-fixtures` | 🔒 | 2+ test suites need the same domain factories | Each suite has unique test data needs | 2 |

***

## §15 · Client-Profile Routing

Use this table to select the right provider lane when starting a new client project. Match the client to a profile, then follow the lane recommendations.

| Profile | Description | DB Lane | Auth Lane | CMS Lane | Email Lane | Analytics Lane | Hosting Lane |
| --- | --- | --- | --- | --- | --- | --- | --- |
| **Brochure / Marketing site** | Static or lightly dynamic, no login, low content volume | None or Neon free | None | Sanity free | Resend free | Plausible or Cloudflare Web Analytics | Vercel Hobby or Cloudflare Pages |
| **Privacy-sensitive / EU client** | GDPR strict, data residency concern, cookieless preference | Neon or Supabase EU region | Better Auth (self-hosted) | Strapi / Payload self-hosted | Brevo or self-hosted SMTP | Umami or Matomo self-hosted | Cloudflare or self-hosted VPS |
| **Internal tool / dashboard** | Team-only, fast auth, internal data | Neon | Clerk | None or Sanity | Resend | PostHog | Vercel |
| **Client portal / SaaS starter** | Multi-tenant login, client-facing, must scale | Neon or Supabase | Better Auth | Sanity or Contentful | Resend or Postmark | PostHog | Vercel |
| **High-traffic landing page** | Performance-critical, conversion-optimized, AB tested | Neon | None or Clerk | Sanity or Prismic | Resend | Plausible + PostHog + Edge Config experiments | Vercel Edge or Cloudflare |
| **Enterprise / procurement-bound** | SSO required, AWS/Azure mandate, compliance audit | Aurora PostgreSQL or Supabase | WorkOS + Clerk | Contentful or Sanity | SendGrid or SES | Datadog or New Relic | AWS / Azure / GCP |
| **Budget / startup MVP** | Maximize free tiers, minimal cost, fast launch | Neon free or Supabase free | Better Auth or Auth.js | Cosmic or Prismic free | Brevo or Mailtrap (dev) + Resend (prod) | Cloudflare Web Analytics + Clarity | Vercel Hobby |
| **Content-heavy / editorial** | High volume content, editorial workflow, media-rich | Neon | Clerk or Better Auth | Sanity (primary) | Resend | Plausible | Vercel |

***

## §16 · CI/CD & Hosting

### Deployment Platform Matrix

| Platform | Role | Free/Entry Tier | Full Next.js Support | Best Fit |
| --- | --- | --- | --- | --- |
| **Vercel** | Primary default | Hobby: free for personal projects | ✅ Native | Fastest DX, preview deployments, Turborepo remote cache |
| **Cloudflare Pages + Workers** | Cost/edge alternative | Free: unlimited sites, 100k req/day Workers | ⚠️ Via OpenNext adapter | High-traffic static/edge, bandwidth-sensitive, reduced lock-in |
| **Netlify** | Alternative managed | Free: 100 GB bandwidth, 300 build min/mo | ⚠️ Via adapter | Teams familiar with Netlify, simple static + serverless |
| **Railway** | Long-running workloads | Free trial, then usage-based | ⚠️ Not native | Background jobs, >60s execution, stateful processes |
| **Render** | Long-running alternative | Free tier (spins down on idle) | ⚠️ Not native | Simple server processes, light background workers |
| **AWS / GCP / Azure** | Enterprise / self-managed | Pay-as-you-go | ⚠️ Via containers | Enterprise mandate, full infra control |

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

All CI jobs target Node 24.x. Node 16 actions are deprecated.

### Platform Selection Rules

**Use Vercel when:** fastest time to production, preview deployments, full Next.js feature set (API routes, Image Optimization, ISR), Turborepo remote cache integration.

**Use Cloudflare when:** cost optimization at scale, 300+ edge locations, site is primarily static or lightly dynamic, client wants reduced vendor lock-in from Vercel. Note: full-stack Next.js apps require the OpenNext adapter; API routes may need separate Workers.

**Use Railway/Render when:** any workload exceeds 60 seconds, background processing required, stateful processes needed.

**Use self-hosted/cloud-provider when:** enterprise procurement mandate, full infrastructure control required, existing cloud contract.

### Provider Compatibility Note

All service providers — Plausible, PostHog, Resend, Postmark, Clerk, Better Auth, Sanity — operate over HTTP APIs and are platform-agnostic. Hosting choice does not dictate service provider choice.

***

## §17 · AI Agent Rules

These rules apply to all AI coding tools (Cursor, Windsurf, Copilot, etc.) when working in this repository. Violating these rules causes architectural drift.

1. **Do not install any package not listed in this document.** If a package is needed that is not listed, stop and update this document first.
2. **Do not install a package in the wrong internal package.** Check §13 for the allowed dependency list before every install.
3. **Do not activate a 🔒 conditional package** unless its trigger condition in §14 has been explicitly confirmed.
4. **Do not hard-code a provider name in app logic.** All provider selection is via environment variables and abstraction packages.
5. **Do not add a second auth provider to an existing app** without explicit instruction.
6. **Do not add monitoring, RUM, or observability packages** until `@agency/monitoring` activation trigger is confirmed.
7. **Do not install Storybook and Ladle in the same repo.** Pick one.
8. **When in doubt, do less.** A missing package is easier to add than an incorrect one is to remove.
9. **Use `workspace:*` for all internal dependencies**, never relative paths or version numbers.
10. **Version pins in §13 are exact.** Do not upgrade without updating this document.

***

## §18 · Open Validation Items

These items require an official-source pricing/limits check before being treated as authoritative. Do not commit to a provider in production without completing this verification.

| Item | Why it needs verification | Priority |
| --- | --- | --- |
| `@supabase/supabase-js` version | Previous pin (2.49.0) is stale; current is ~2.102.0 — confirm exact pin | 🔴 High |
| Neon free tier limits | Storage, compute hours, and project count may have changed in 2026 | 🔴 High |
| Supabase free tier limits | Auth MAU, DB size, storage — verify current limits before recommending | 🔴 High |
| Clerk free tier MAU | 10k MAU free — confirm this is still accurate for 2026 | 🟡 Medium |
| Better Auth `1.5.0` exact pin | Confirm this is current stable release | 🟡 Medium |
| Resend free tier | 3,000 emails/mo, 1 domain — verify not changed | 🟡 Medium |
| Brevo free tier | 300 emails/day — confirm commercial-use status | 🟡 Medium |
| Sanity free tier seat limits | Confirm free tier is still commercially usable for client projects | 🟡 Medium |
| PostHog free tier event count | 1M events/mo — confirm includes feature flags | 🟡 Medium |
| Plausible pricing | No meaningful free production tier — confirm self-host option is viable for budget clients | 🟡 Medium |
| New Relic 100 GB free ingest | Confirm this is still the current free tier and includes RUM | 🟡 Medium |
| Vercel Hobby free tier for client sites | Confirm commercial use is allowed on Hobby plan | 🟡 Medium |
| Cloudflare Pages/Workers free limits | 100k req/day Workers free — confirm sufficient for typical marketing sites | 🟡 Medium |
| `@clerk/nextjs@7.0.8` exact pin | Confirm latest in 7.x series | 🟢 Low |
| `posthog-js@1.364.7` exact pin | Confirm latest stable | 🟢 Low |
| `next-sanity@12.1.5` exact pin | Confirm latest stable | 🟢 Low |

***

*Last updated: April 2026 — synthesized from TASKS.md analysis across four research passes plus provider-lane enrichment research.* 