# Agency Monorepo Tasks

Complete implementation guide organized by execution phase.

## Quick Navigation

| Phase | Folder | Description | Tasks |
|-------|--------|-------------|-------|
| 0 | [`00-foundation/`](./00-foundation/) | Root scaffolding | 1 |
| 1 | [`01-config/`](./01-config/) | Config packages (ESLint, TS, Tailwind, Prettier) | 4 |
| 2 | [`02-core/`](./02-core/) | Core packages (types, utils, constants, hooks) | 4 |
| 3 | [`03-ui/`](./03-ui/) | UI packages (theme, icons, design system) | 3 |
| 3a | [`03a-seo/`](./03a-seo/) | SEO package (metadata, structured data) | 1 |
| 3b | [`03b-compliance/`](./03b-compliance/) | Compliance package (consent, GDPR/CCPA) | 1 |
| 3c | [`03c-analytics/`](./03c-analytics/) | Analytics package (tracking, attribution) | 1 |
| 3d | [`03d-monitoring/`](./03d-monitoring/) | Monitoring package (performance, Web Vitals) | 1 |
| 3e | [`03e-experimentation/`](./03e-experimentation/) | Experimentation package (A/B testing, feature flags) | 1 |
| 3f | [`03f-lead-capture/`](./03f-lead-capture/) | Lead capture package (forms, CRM integration) | 1 |
| 4 | [`04-data/`](./04-data/) | Data layer (database, CMS, API client, preview) | 4 |
| 5 | [`05-auth/`](./05-auth/) | Authentication (Clerk, Better Auth) | 2 |
| 6 | [`06-communication/`](./06-communication/) | Email & notifications | 3 |
| 7 | [`07-testing/`](./07-testing/) | Testing infrastructure (unit, E2E) | 3 |
| 8 | [`08-docs/`](./08-docs/) | Documentation (agents, onboarding, ADRs) | 4 |
| 9 | [`09-cicd/`](./09-cicd/) | CI/CD workflows | 9 |
| 10 | [`10-tools/`](./10-tools/) | Generators & scripts | 4 |
| 11 | [`11-apps/`](./11-apps/) | Applications (agency website, CRM, portal) | 5 |
| 12 | [`12-infra/`](./12-infra/) | Environment, deployment, Sentry | 5 |

**Total: 56 tasks**

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
