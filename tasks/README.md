# Agency Monorepo Tasks

Complete implementation guide organized by execution phase. Each package has its own dedicated folder.

## Quick Navigation

| Phase | Folder | Package | Description |
|-------|--------|---------|-------------|
| 0 | [`00-foundation/`](./00-foundation/) | - | Root scaffolding |
| 10 | [`10-config-eslint/`](./10-config-eslint/) | `@agency/config-eslint` | ESLint configuration |
| 11 | [`11-config-typescript/`](./11-config-typescript/) | `@agency/config-typescript` | TypeScript configuration |
| 12 | [`12-config-tailwind/`](./12-config-tailwind/) | `@agency/config-tailwind` | Tailwind CSS configuration |
| 13 | [`13-config-prettier/`](./13-config-prettier/) | `@agency/config-prettier` | Prettier configuration |
| **13a** | **[`13-config-react-compiler/`](./13-config-react-compiler/)** | **`@agency/config-react-compiler`** | **React Compiler config (Next.js 16)** |
| 20 | [`20-core-types/`](./20-core-types/) | `@agency/core-types` | Domain types & Zod schemas |
| 21 | [`21-core-utils/`](./21-core-utils/) | `@agency/core-utils` | Pure utility functions |
| 22 | [`22-core-constants/`](./22-core-constants/) | `@agency/core-constants` | Enums & constants |
| 23 | [`23-core-hooks/`](./23-core-hooks/) | `@agency/core-hooks` | React hooks |
| 30 | [`30-ui-theme/`](./30-ui-theme/) | `@agency/ui-theme` | Design tokens |
| 31 | [`31-ui-icons/`](./31-ui-icons/) | `@agency/ui-icons` | Icon components |
| 32 | [`32-ui-design-system/`](./32-ui-design-system/) | `@agency/ui-design-system` | UI primitives |
| 40 | [`40-seo/`](./40-seo/) | `@agency/seo` | SEO utilities |
| 41 | [`41-compliance/`](./41-compliance/) | `@agency/compliance` | GDPR/CCPA compliance |
| 41a | [`41a-compliance-security-headers/`](./41a-compliance-security-headers/) | `@agency/compliance-security-headers` | Compliance security headers |
| 42 | [`42-monitoring/`](./42-monitoring/) | `@agency/monitoring` | Performance monitoring |
| 42a | [`42a-monitoring-rum/`](./42a-monitoring-rum/) | `@agency/monitoring-rum` | Real User Monitoring (CrUX) |
| 50 | [`50-data-db/`](./50-data-db/) | `@agency/data-db` | Database (Drizzle/Neon) |
| 51 | [`51-data-cms/`](./51-data-cms/) | `@agency/data-cms` | CMS schemas (Sanity) |
| 51a | [`51a-data-content-federation/`](./51a-data-content-federation/) | `@agency/data-content-federation` | Multi-source content federation |
| 51b | [`51b-data-ai-enrichment/`](./51b-data-ai-enrichment/) | `@agency/data-ai-enrichment` | AI content processing |
| 52 | [`52-data-api-client/`](./52-data-api-client/) | `@agency/data-api-client` | API client utilities |
| 60 | [`60-auth-internal/`](./60-auth-internal/) | `@agency/auth-internal` | Clerk authentication |
| 61 | [`61-auth-portal/`](./61-auth-portal/) | `@agency/auth-portal` | Better Auth for portals |
| 70 | [`70-email-templates/`](./70-email-templates/) | `@agency/email-templates` | React Email templates |
| 71 | [`71-email-service/`](./71-email-service/) | `@agency/email-service` | Email delivery (Resend/Postmark) |
| 72 | [`72-notifications/`](./72-notifications/) | `@agency/notifications` | Notification service |
| 80 | [`80-analytics/`](./80-analytics/) | `@agency/analytics` | Analytics package |
| 80a | [`80a-analytics-attribution/`](./80a-analytics-attribution/) | `@agency/analytics-attribution` | Multi-touch attribution |
| 80b | [`80b-analytics-consent-bridge/`](./80b-analytics-consent-bridge/) | `@agency/analytics-consent-bridge` | Consent-analytics bridge |
| 81 | [`81-experimentation/`](./81-experimentation/) | `@agency/experimentation` | A/B testing & feature flags |
| 81a | [`81a-experimentation-edge/`](./81a-experimentation-edge/) | `@agency/experimentation-edge` | Edge Config experimentation |
| 82 | [`82-lead-capture/`](./82-lead-capture/) | `@agency/lead-capture` | Lead capture forms |
| 82a | [`82a-lead-forms-progressive/`](./82a-lead-forms-progressive/) | `@agency/lead-capture-progressive` | Progressive form orchestration |
| 82b | [`82b-lead-enrichment/`](./82b-lead-enrichment/) | `@agency/lead-capture-enrichment` | Lead data enrichment |
| 90 | [`90-test-setup/`](./90-test-setup/) | `@agency/test-setup` | Test infrastructure |
| 91 | [`91-test-fixtures/`](./91-test-fixtures/) | `@agency/test-fixtures` | Test data generators |
| a0 | [`a0-docs-agents/`](./a0-docs-agents/) | - | AI Agent Rules (`docs/AGENTS.md`) |
| a1 | [`a1-docs-onboarding/`](./a1-docs-onboarding/) | - | Onboarding guide |
| a2 | [`a2-docs-adrs/`](./a2-docs-adrs/) | - | Architecture Decision Records |
| a3 | [`a3-docs-package-guides/`](./a3-docs-package-guides/) | - | Package documentation |
| b0 | [`b0-tools-app-generator/`](./b0-tools-app-generator/) | - | App generator script |
| b1 | [`b1-tools-package-generator/`](./b1-tools-package-generator/) | - | Package generator script |
| b2 | [`b2-tools-db-seed/`](./b2-tools-db-seed/) | - | Database seed script |
| b3 | [`b3-tools-codemods/`](./b3-tools-codemods/) | - | Codemod scripts |
| b4 | [`b4-tools-content-pipeline/`](./b4-tools-content-pipeline/) | - | AI content pipeline |
| c0 | [`c0-infra-codeowners/`](./c0-infra-codeowners/) | - | CODEOWNERS (v1) |
| c1 | [`c1-infra-codeowners-v2/`](./c1-infra-codeowners-v2/) | - | CODEOWNERS (v2) |
| c2 | [`c2-infra-ci-workflow/`](./c2-infra-ci-workflow/) | - | CI Workflow (v1) |
| c3 | [`c3-infra-ci-workflow-v2/`](./c3-infra-ci-workflow-v2/) | - | CI Workflow (v2) |
| c4 | [`c4-infra-release-workflow/`](./c4-infra-release-workflow/) | - | Release workflow |
| c5 | [`c5-infra-preview-deploy/`](./c5-infra-preview-deploy/) | - | Preview deployments |
| c6 | [`c6-infra-changesets/`](./c6-infra-changesets/) | - | Changesets configuration |
| c7 | [`c7-infra-security-audit/`](./c7-infra-security-audit/) | - | Security audit workflow |
| c8 | [`c8-infra-accessibility-audit/`](./c8-infra-accessibility-audit/) | - | Accessibility audit workflow |
| c9 | [`c9-infra-security-headers/`](./c9-infra-security-headers/) | - | Security headers workflow |
| d0 | [`d0-infra-vscode/`](./d0-infra-vscode/) | - | VS Code settings |
| d1 | [`d1-infra-db-migrations/`](./d1-infra-db-migrations/) | - | Database migration workflow |
| d2 | [`d2-infra-environment-mgmt/`](./d2-infra-environment-mgmt/) | - | Environment management |
| d3 | [`d3-infra-deployment-guide/`](./d3-infra-deployment-guide/) | - | Deployment guide |
| d4 | [`d4-infra-sentry/`](./d4-infra-sentry/) | - | Sentry error tracking |
| e0 | [`e0-apps-root-readme/`](./e0-apps-root-readme/) | - | Root README |
| e1 | [`e1-apps-crm/`](./e1-apps-crm/) | - | CRM Application |
| e2 | [`e2-apps-analytics/`](./e2-apps-analytics/) | - | Analytics integration |
| e3 | [`e3-apps-agency-website/`](./e3-apps-agency-website/) | - | Agency website |
| e4 | [`e4-apps-client-portal/`](./e4-apps-client-portal/) | - | Client portal |
| e5 | [`e5-apps-playwright-e2e/`](./e5-apps-playwright-e2e/) | - | Playwright E2E tests |
| **e6** | **[`e6-apps-docs-site/`](./e6-apps-docs-site/)** | **-** | **Documentation site app** |
| **e7** | **[`e7-apps-email-preview/`](./e7-apps-email-preview/)** | **-** | **Email preview app** |
| e8 | [`e8-apps-studio/`](./e8-apps-studio/) | - | Sanity Studio app (conditional) |
| e9 | [`e9-apps-api/`](./e9-apps-api/) | - | API app (conditional) |
| **f0** | **[`f0-packages-monitoring/`](./f0-packages-monitoring/)** | **`@agency/observability`** | **Monitoring/observability (conditional)** |
| **f1** | **[`f1-packages-content-blocks/`](./f1-packages-content-blocks/)** | **`@agency/content-blocks`** | **Content blocks for CMS (conditional)** |
| **f2** | **[`f2-packages-i18n/`](./f2-packages-i18n/)** | **`@agency/i18n`** | **Internationalization (conditional)** |
| f3 | [`f3-apps-client-sites-brand-foundation/`](./f3-apps-client-sites-brand-foundation/) | - | Brand-foundation split (conditional) |
| **c10** | **[`c10-infra-bundle-analysis/`](./c10-infra-bundle-analysis/)** | **-** | **Bundle analysis in CI** |
| **c11** | **[`c11-infra-security-headers/`](./c11-infra-security-headers/)** | **-** | **Shared security headers policy** |
| **c12** | **[`c12-infra-rate-limiting/`](./c12-infra-rate-limiting/)** | **-** | **Rate limiting for public endpoints** |
| **c13** | **[`c13-infra-image-optimization/`](./c13-infra-image-optimization/)** | **-** | **Image optimization policy** |
| **c14** | **[`c14-infra-workspace-boundaries/`](./c14-infra-workspace-boundaries/)** | **-** | **Workspace boundary enforcement** |
| **a4** | **[`a4-docs-marketing-standards/`](./a4-docs-marketing-standards/)** | **-** | **Marketing standards documentation** |
| **g0** | **[`g0-infra-mcp-server/`](./g0-infra-mcp-server/)** | **`@agency/tools-mcp-server`** | **MCP server for AI tooling** |

**Total: 85 tasks** (67 existing + 18 new)

## Build Order (Dependency Flow)

Tasks are numbered to reflect the dependency flow:

```
00 (foundation)
  ↓
10-13 (config) → 20-23 (core) → 30-32 (ui) → 40-42 (marketing utils)
                                                  ↓
50-52 (data) → 60-61 (auth) → 70-72 (communication)
                  ↓                     ↓
41a (compliance)  51a-b (federation)   81a (edge-exp)
42a (rum)                               82a-b (forms)
        ↓                               ↓
80-82 (advanced features: analytics, experimentation, lead-capture)
  ↓
90-91 (testing) → a0-a3 (docs) → b0-b4 (tools) → c0-c9 (infra) → e0-e5 (apps)
```

### Build Philosophy: Condition-Gated Implementation

**Plan broadly, build selectively.** Task numbers indicate logical dependency order, not mandatory construction sequence.

**Foundation phase (always build first):**
- `00-foundation/` - Root scaffolding
- `10-13-config/` - ESLint, TypeScript, Tailwind, Prettier
- `20-23-core/` - Types, utils, constants, hooks
- `30-32-ui/` - Theme, icons, design system
- `c2-infra-ci-workflow/` - CI with test execution capability

**Condition-gated packages (build only when trigger met):**
| Package | Build When | Don't Build When |
|---------|-----------|------------------|
| `40-seo/` | Multiple surfaces need consistent SEO metadata | SEO limited to single simple app |
| `41-compliance/` | Multiple surfaces need consistent consent | One-off banner suffices |
| `41a-compliance-security-headers/` | GDPR/CCPA compliance headers required | Standard security headers sufficient |
| `42a-monitoring-rum/` | Ranking-critical CrUX data needed | Lab scores (Lighthouse) sufficient |
| `50-data-db/` | First internal tool needs persistent data | Storage needs are hypothetical |
| `51-data-cms/` | First Sanity-backed client site arrives | Content lives in single app |
| `51a-data-content-federation/` | Content from 2+ sources (Sanity + Shopify) | Single CMS source |
| `51b-data-ai-enrichment/` | High content volume needs AI automation | Manual enrichment sufficient |
| `52-data-api-client/` | Two+ apps call same internal API | One app with local route handlers |
| `60-auth-internal/` | First internal tool needs authentication | Tools are public-only |
| `61-auth-portal/` | First client portal needs login | Sites are brochure-only |
| `70-71-email/` | First transactional email flow exists | Email needs are hypothetical |
| `72-notifications/` | Multiple workflows need Slack/Discord/webhook | Single app calls provider directly |
| `80-analytics/` | Multiple apps need provider abstraction | Analytics limited to single app |
| `80a-analytics-attribution/` | Cross-channel marketing budget optimization | Last-click sufficient |
| `80b-analytics-consent-bridge/` | 2+ analytics providers need unified consent | Single provider with built-in consent |
| `81a-experimentation-edge/` | Zero-latency marketing A/B testing | Product experimentation (PostHog) sufficient |
| `82a-lead-forms-progressive/` | Forms >4 fields or >40% abandonment | Simple 1-2 field forms |
| `82b-lead-enrichment/` | Sales team needs enriched lead data | Manual research sufficient |
| `90-91-testing/` | Repeated test config/factories observed | Test needs are unique per suite |
| `c9-infra-security-headers/` | Google Ads compliance OR security audit | Vercel handles all security |
| `b4-tools-content-pipeline/` | AI-assisted content workflows adopted | Low content volume (<5/week) |

See individual package specs for full condition blocks with exit criteria.

## File Naming Convention

```
tasks/
├── {phase}-{name}/
│   └── {sequence}-{description}.md
```

- **phase**: Number (00, 10-99) or letter prefix (a0-e5) for non-packages
- **name**: Package or category slug
- **sequence**: Order within folder (typically 00 for single-task packages)
- **description**: Brief semantic name

## Legacy Mapping (Old → New)

| Old Location | New Location |
|--------------|--------------|
| `01-config/00-eslint.md` | `10-config-eslint/00-package.md` |
| `01-config/01-typescript.md` | `11-config-typescript/00-package.md` |
| `02-core/00-types.md` | `20-core-types/00-package.md` |
| `03-ui/02-design-system.md` | `32-ui-design-system/00-package.md` |
| `03a-seo/00-seo-package.md` | `40-seo/00-package.md` |
| `03c-analytics/00-analytics-package.md` | `80-analytics/00-package.md` |
| `04-data/00-database.md` | `50-data-db/00-package.md` |
| `05-auth/00-internal-clerk.md` | `60-auth-internal/00-package.md` |
| `09-cicd/01-ci-workflow.md` | `c2-infra-ci-workflow/00-package.md` |
| `11-apps/01-crm-app.md` | `e1-apps-crm/00-package.md` |

---

## Phase 0: Foundation

| # | Task | File |
|---|------|------|
| 0 | Root Repository Scaffolding | [`00-root-scaffolding.md`](./00-foundation/00-root-scaffolding.md) |

## Phase 1: Config Packages

| # | Task | File |
|---|------|------|
| 1 | ESLint Config | [`00-eslint.md`](./01-config/00-eslint.md) |
| 2 | TypeScript Config | [`01-typescript.md`](./01-config/01-typescript.md) |
| 3 | Tailwind Config | [`02-tailwind.md`](./01-config/02-tailwind.md) |
| 34 | Prettier Config | [`03-prettier.md`](./01-config/03-prettier.md) |

## Phase 2: Core Packages

| # | Task | File |
|---|------|------|
| 4 | Core Types | [`00-types.md`](./02-core/00-types.md) |
| 5 | Core Utils | [`01-utils.md`](./02-core/01-utils.md) |
| 6 | Core Constants | [`02-constants.md`](./02-core/02-constants.md) |
| 10 | Core Hooks | [`03-hooks.md`](./02-core/03-hooks.md) |

## Phase 3: UI Packages

| # | Task | File |
|---|------|------|
| 7 | UI Theme | [`00-theme.md`](./03-ui/00-theme.md) |
| 8 | UI Icons | [`01-icons.md`](./03-ui/01-icons.md) |
| 9 | UI Design System | [`02-design-system.md`](./03-ui/02-design-system.md) |

## Phase 3a: SEO Package

| # | Task | File |
|---|------|------|
| 45 | SEO Package | [`00-seo-package.md`](./03a-seo/00-seo-package.md) |

## Phase 3b: Compliance Package

| # | Task | File |
|---|------|------|
| 46 | Consent Management Package | [`00-consent-package.md`](./03b-compliance/00-consent-package.md) |

## Phase 3c: Analytics Package

| # | Task | File |
|---|------|------|
| 47 | Analytics Package | [`00-analytics-package.md`](./03c-analytics/00-analytics-package.md) |

## Phase 3d: Monitoring Package

| # | Task | File |
|---|------|------|
| 49 | Monitoring Package | [`00-monitoring-package.md`](./03d-monitoring/00-monitoring-package.md) |

## Phase 3e: Experimentation Package

| # | Task | File |
|---|------|------|
| 50 | Experimentation Package | [`00-experimentation-package.md`](./03e-experimentation/00-experimentation-package.md) |

## Phase 3f: Lead Capture Package

| # | Task | File |
|---|------|------|
| 51 | Lead Capture Package | [`00-lead-capture-package.md`](./03f-lead-capture/00-lead-capture-package.md) |

## Phase 4: Data Layer

| # | Task | File |
|---|------|------|
| 11 | Database Package | [`00-database.md`](./04-data/00-database.md) |
| 16 | CMS Schemas | [`01-cms-schemas.md`](./04-data/01-cms-schemas.md) |
| 20 | API Client | [`02-api-client.md`](./04-data/02-api-client.md) |
| 48 | CMS Preview Workflow | [`03-cms-preview.md`](./04-data/03-cms-preview.md) |

## Phase 5: Authentication

| # | Task | File |
|---|------|------|
| 12 | Internal Auth (Clerk) | [`00-internal-clerk.md`](./05-auth/00-internal-clerk.md) |
| 13 | Portal Auth (Better Auth) | [`01-portal-better-auth.md`](./05-auth/01-portal-better-auth.md) |

## Phase 6: Communication

| # | Task | File |
|---|------|------|
| 14 | Email Templates | [`00-email-templates.md`](./06-communication/00-email-templates.md) |
| 15 | Email Service | [`01-email-service.md`](./06-communication/01-email-service.md) |
| 19 | Notifications | [`02-notifications.md`](./06-communication/02-notifications.md) |

## Phase 7: Testing

| # | Task | File |
|---|------|------|
| 17 | Test Setup | [`00-test-setup.md`](./07-testing/00-test-setup.md) |
| 18 | Test Fixtures | [`01-test-fixtures.md`](./07-testing/01-test-fixtures.md) |
| 55 | Playwright E2E Testing | [`02-playwright-e2e.md`](./07-testing/02-playwright-e2e.md) |

## Phase 8: Documentation

| # | Task | File |
|---|------|------|
| 21 | AI Agent Rules | [`00-agents-rules.md`](./08-docs/00-agents-rules.md) |
| 22 | Onboarding Guide | [`01-onboarding.md`](./08-docs/01-onboarding.md) |
| 23 | Architecture Decision Records | [`02-adrs.md`](./08-docs/02-adrs.md) |
| 43 | Package Guides | [`03-package-guides.md`](./08-docs/03-package-guides.md) |

## Phase 9: CI/CD

| # | Task | File |
|---|------|------|
| 24 | CODEOWNERS (v1) | [`00-codeowners.md`](./09-cicd/00-codeowners.md) |
| 25 | CI Workflow (v1) | [`01-ci-workflow.md`](./09-cicd/01-ci-workflow.md) |
| 26 | Release Workflow | [`02-release-workflow.md`](./09-cicd/02-release-workflow.md) |
| 27 | Preview Deployment | [`03-preview-deploy.md`](./09-cicd/03-preview-deploy.md) |
| 28 | Changesets Config | [`04-changesets.md`](./09-cicd/04-changesets.md) |
| 29 | CODEOWNERS (v2) | [`05-codeowners-v2.md`](./09-cicd/05-codeowners-v2.md) |
| 40 | Security Audit | [`06-security-audit.md`](./09-cicd/06-security-audit.md) |
| 41 | CI Workflow (v2) | [`07-ci-workflow-v2.md`](./09-cicd/07-ci-workflow-v2.md) |
| 52 | Accessibility Audit Workflow | [`08-accessibility-audit.md`](./09-cicd/08-accessibility-audit.md) |

## Phase 10: Tools

| # | Task | File |
|---|------|------|
| 30 | App Generator | [`00-app-generator.md`](./10-tools/00-app-generator.md) |
| 31 | Package Generator | [`01-package-generator.md`](./10-tools/01-package-generator.md) |
| 33 | DB Seed Script | [`02-db-seed.md`](./10-tools/02-db-seed.md) |
| 42 | Codemods | [`03-codemods.md`](./10-tools/03-codemods.md) |

## Phase 11: Applications

| # | Task | File |
|---|------|------|
| 32 | Root README | [`00-root-readme.md`](./11-apps/00-root-readme.md) |
| 37 | CRM Application | [`01-crm-app.md`](./11-apps/01-crm-app.md) |
| 44 | Analytics Setup | [`02-analytics.md`](./11-apps/02-analytics.md) |
| 45 | Agency Website App | [`03-agency-website.md`](./11-apps/03-agency-website.md) |
| 54 | Client Portal App | [`04-client-portal.md`](./11-apps/04-client-portal.md) |

## Phase 12: Infrastructure

| # | Task | File |
|---|------|------|
| 35 | VS Code Settings | [`00-vscode-settings.md`](./12-infra/00-vscode-settings.md) |
| 36 | DB Migration Workflow | [`01-db-migrations.md`](./12-infra/01-db-migrations.md) |
| 38 | Environment Management | [`02-environment-mgmt.md`](./12-infra/02-environment-mgmt.md) |
| 39 | Deployment Guide | [`03-deployment-guide.md`](./12-infra/03-deployment-guide.md) |
| 53 | Sentry Error Tracking | [`04-sentry.md`](./12-infra/04-sentry.md) |

---

## Adding New Tasks

To add a new task without renumbering:

1. **Within a phase**: Use the next available sequence number
   - Example: Adding a new config package → `01-config/04-semantic-release.md`

2. **New phase**: Create a new numbered folder
   - Example: Adding monitoring → `13-monitoring/00-setup.md`

3. **Between phases**: Use decimal-like naming
   - Example: Between phase 1 and 2 → create `01a-validate/00-schema-check.md`

## File Naming Convention

```
tasks/
├── {phase}-{name}/
│   └── {sequence}-{brief-description}.md
```

- **phase**: 2-digit number (00-99)
- **name**: Short category slug
- **sequence**: Order within phase (00-99)
- **brief-description**: Semantic name (kebab-case)

## Legacy Mapping

| Old Name | New Location |
|----------|-------------|
| `TASK_0.md` | `00-foundation/00-root-scaffolding.md` |
| `TASK_1.md` | `01-config/00-eslint.md` |
| `TASK_2.md` | `01-config/01-typescript.md` |
| ... | ... |
| `TASK_44.md` | `11-apps/02-analytics.md` |
| `TASK_45.md` | `03a-seo/00-seo-package.md` |
| `TASK_46.md` | `03b-compliance/00-consent-package.md` |
| `TASK_47.md` | `03c-analytics/00-analytics-package.md` |
| `TASK_48.md` | `04-data/03-cms-preview.md` |
| `TASK_49.md` | `03d-monitoring/00-monitoring-package.md` |
| `TASK_50.md` | `03e-experimentation/00-experimentation-package.md` |
| `TASK_51.md` | `03f-lead-capture/00-lead-capture-package.md` |
| `TASK_52.md` | `09-cicd/08-accessibility-audit.md` |
| `TASK_53.md` | `12-infra/04-sentry.md` |
| `TASK_54.md` | `11-apps/04-client-portal.md` |
| `TASK_55.md` | `07-testing/02-playwright-e2e.md` |
