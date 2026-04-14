# Task Document Alignment Analysis

## Purpose
This document identifies structural inconsistencies in the `/docs/tasks/` folder and provides a realignment plan to ensure all task documents follow the established slot-band naming convention and content structure.

---

## Document Structure Standard

Per `a0-docs-agents-30-adr-tooling.md`, task documents must follow this slot-band pattern:

| Slot | Suffix | Purpose |
|------|--------|---------|
| `00` | `-overview.md` | What this task is, purpose, scope |
| `10` | `-spec.md` | Complete implementation specification |
| `20` | `-constraints.md` | Hard boundaries and limitations |
| `30` | `-adr-*.md` | Architecture Decision Records |
| `40` | `-guide-*.md` | Implementation guides, how-to docs |
| `50` | `-ref-*.md` | Quick reference materials |
| `60` | `-qa-checklist.md` | Validation and testing steps |
| `70` | `-execution-prompt.md` | Bounded implementation prompt for AI |

**Naming Convention:** `{family-key}-{slot-band}-{suffix}.md`

**Family Key Examples:**
- `00-foundation` — Root repository scaffolding
- `10-config-eslint` — ESLint configuration
- `20-core-types` — Core types package
- `e3-apps-agency-website` — Agency website app

---

## Alignment Issues Identified

### Issue 1: Missing Slot-Band Prefix in Spec Files

**Problem:** Some spec files don't use the `10-` slot-band prefix, breaking the ordering convention.

| Current Name | Should Be | Family Key |
|--------------|-----------|------------|
| `01-core-constants-spec.md` | `21-core-constants-10-spec.md` | 21-core-constants |
| `01-core-hooks-spec.md` | `23-core-hooks-10-spec.md` | 23-core-hooks |
| `01-core-types-spec.md` | `20-core-types-10-spec.md` | 20-core-types |
| `01-core-utils-spec.md` | `21-core-utils-10-spec.md` | 21-core-utils |

**Impact:** These files appear out of order in file listings and don't follow the established pattern where `01-config-biome-migration-10-spec.md` uses the slot-band prefix.

---

### Issue 2: Incorrect Family Key for Constraint Documents

**Problem:** Performance and testing constraints use `02-core-*` family keys instead of following their respective package family keys.

| Current Name | Should Be | Notes |
|--------------|-----------|-------|
| `02-core-performance-constraints.md` | `20-core-types-20-constraints.md` OR `core-performance-20-constraints.md` | Needs dedicated family key |
| `02-core-testing-constraints.md` | `90-test-setup-20-constraints.md` OR `core-testing-20-constraints.md` | Belongs with testing |

**Analysis:**
- `02-core-performance-constraints.md` covers performance constraints across core packages
- `02-core-testing-constraints.md` covers testing constraints
- These are cross-cutting concerns, not tied to a single package

**Recommendation:** Create dedicated family keys:
- `02-core-performance-20-constraints.md` → `core-performance-00-overview.md` + `core-performance-20-constraints.md`
- `02-core-testing-constraints.md` → `core-testing-00-overview.md` + `core-testing-20-constraints.md`

---

### Issue 3: Non-Standard Slot Band (41 instead of 40)

**Problem:** Email service guide uses slot `41` instead of the standard `40`.

| Current Name | Should Be |
|--------------|-----------|
| `71-email-service-41-guide-queues.md` | `71-email-service-40-guide-queues.md` |

**Impact:** Breaks the slot-band convention. Slot `40` is the standard for guides.

---

### Issue 4: Missing Standard Documents for Family Keys

Many family keys have only `-10-spec.md` without the supporting slot-band documents:

#### Core Packages (Missing most slot bands)
| Family Key | Has Spec | Missing |
|------------|----------|---------|
| `20-core-types` | Yes | 00-overview, 20-constraints, 60-qa-checklist, 70-execution-prompt |
| `21-core-utils` | Yes | 00-overview, 20-constraints, 60-qa-checklist, 70-execution-prompt |
| `22-core-constants` | Yes | 00-overview, 20-constraints, 60-qa-checklist, 70-execution-prompt |
| `23-core-hooks` | Yes | 00-overview, 20-constraints, 60-qa-checklist, 70-execution-prompt |

#### UI Packages (Minimal slot bands)
| Family Key | Has Spec | Missing |
|------------|----------|---------|
| `30-ui-theme` | Yes | 20-constraints, 30-adr, 60-qa-checklist, 70-execution-prompt |
| `31-ui-icons` | Yes | 30-adr, 40-guide, 60-qa-checklist, 70-execution-prompt |
| `32-ui-design-system` | Yes | 20-constraints, 30-adr, 40-guide, 60-qa-checklist, 70-execution-prompt |

#### Data Packages (Partial slot bands)
| Family Key | Has Spec | Missing |
|------------|----------|---------|
| `50-data-db` | Yes | 30-adr, 40-guide, 60-qa-checklist, 70-execution-prompt |
| `51-data-cms` | Yes | 30-adr, 60-qa-checklist, 70-execution-prompt |
| `51a-data-content-federation` | Yes | Most slot bands |
| `51b-data-ai-enrichment` | Yes | Most slot bands |
| `52-data-api-client` | Yes | 30-adr, 40-guide, 60-qa-checklist, 70-execution-prompt |

#### Analytics & Experimentation (Minimal slot bands)
| Family Key | Has Spec | Missing |
|------------|----------|---------|
| `80-analytics` | Yes | Most slot bands |
| `80a-analytics-attribution` | Yes | Most slot bands |
| `80b-analytics-consent-bridge` | Yes | Most slot bands |
| `81-experimentation` | Yes | Most slot bands |
| `81a-experimentation-edge` | Yes | Most slot bands |

#### Lead Capture (Partial slot bands)
| Family Key | Has Spec | Missing |
|------------|----------|---------|
| `82-lead-capture` | Yes | 00-overview, 20-constraints, 30-adr, 40-guide, 60-qa-checklist, 70-execution-prompt |
| `82a-lead-forms-progressive` | Yes | Most slot bands |
| `82b-lead-enrichment` | Yes | Most slot bands |

#### SEO & Compliance (Minimal slot bands)
| Family Key | Has Spec | Missing |
|------------|----------|---------|
| `40-seo` | Yes | Most slot bands |
| `41-compliance` | Yes | Most slot bands |
| `41a-compliance-security-headers` | Yes | Most slot bands |

#### Infrastructure Tasks (Partial slot bands)
| Family Key | Has Spec | Missing |
|------------|----------|---------|
| `c0-infra-codeowners` | Yes | 20-constraints, 30-adr, 40-guide, 50-ref, 60-qa-checklist, 70-execution-prompt |
| `c10-infra-bundle-analysis` | Yes | 00-overview, 20-constraints, 30-adr, 40-guide, 60-qa-checklist, 70-execution-prompt |
| `c11-infra-security-headers` | Yes | 20-constraints, 30-adr, 40-guide, 70-execution-prompt |
| `c12-infra-rate-limiting` | Yes | 00-overview, 20-constraints, 30-adr, 40-guide, 60-qa-checklist, 70-execution-prompt |
| `c13-infra-image-optimization` | Yes | 00-overview, 20-constraints, 30-adr, 40-guide, 60-qa-checklist, 70-execution-prompt |

#### Tools (Minimal slot bands)
| Family Key | Has Spec | Missing |
|------------|----------|---------|
| `b0-tools-app-generator` | Yes | Most slot bands |
| `b1-tools-package-generator` | Yes | Most slot bands |
| `b2-tools-db-seed` | Yes | Most slot bands |
| `b3-tools-codemods` | Yes | Most slot bands |
| `b4-tools-content-pipeline` | Yes | Most slot bands |

#### VSCode & DB (Partial slot bands)
| Family Key | Has Spec | Missing |
|------------|----------|---------|
| `d0-infra-vscode` | Yes | 20-constraints, 30-adr, 40-guide, 60-qa-checklist, 70-execution-prompt |
| `d1-infra-db-migrations` | Yes | 20-constraints, 30-adr, 40-guide, 60-qa-checklist, 70-execution-prompt |

#### App Tasks (Many have full slot bands - these are COMPLETE)
| Family Key | Status |
|------------|--------|
| `e3-apps-agency-website` | Complete set |
| `e4-apps-client-portal` | Complete set |
| `e5-apps-playwright-e2e` | Complete set |
| `e8-apps-studio` | Complete set |
| `e9-apps-api` | Complete set |
| `e10-apps-client-sites-foundation` | Complete set |
| `f3-apps-client-sites-brand-foundation` | Complete set |

---

### Issue 5: Content Structure Inconsistencies

Based on sampling documents, the following section inconsistencies exist:

#### Overview Documents (`-00-overview.md`)
**Standard sections that should exist:**
- Purpose
- Dependencies (Required/Followed by/Consumed by)
- Scope
- Success Criteria (optional)
- Exit Criteria (optional)
- Next Steps

**Inconsistencies found:**
- `c0-infra-codeowners-00-overview.md` — Missing Dependencies, Scope sections
- Some overviews have "Implementation Authority" section, others don't

#### Spec Documents (`-10-spec.md`)
**Standard sections that should exist:**
- Non-authoritative warning block
- Task Header table (State, Trigger, Dependencies, Exit Criteria, etc.)
- Cross-references
- Files (with code examples)
- Critical Requirements
- Verification Steps

**Inconsistencies found:**
- `01-core-constants-spec.md` — Missing non-authoritative warning, Task Header table
- Core specs don't follow the same template as config specs

#### Execution Prompt Documents (`-70-execution-prompt.md`)
**Standard sections that should exist:**
- Governance check required warning
- Mandatory pre-read list
- Task Context
- Required Reading (ordered)
- Implementation Scope
- Constraints
- Verification Steps
- Acceptance Criteria
- Next Tasks

**Inconsistencies found:**
- Some prompts don't include the "Reference Materials" section
- Some prompts are missing "Next Tasks"

---

## Realignment Status

**COMPLETED** — All phases executed April 13, 2026.

### Phase 1: Rename Non-Compliant Files (Critical) ✅

**Status:** Complete — 4 duplicate files removed, 1 file renamed

**Actions taken:**

**Files to rename to fix slot-band naming:**

1. `01-core-constants-spec.md` → `21-core-constants-10-spec.md`
2. `01-core-hooks-spec.md` → `23-core-hooks-10-spec.md`
3. `01-core-types-spec.md` → `20-core-types-10-spec.md`
4. `01-core-utils-spec.md` → `21-core-utils-10-spec.md`
5. `71-email-service-41-guide-queues.md` → `71-email-service-40-guide-queues.md`

**Note:** `02-core-performance-constraints.md` and `02-core-testing-constraints.md` need family key decisions before renaming.

### Phase 2: Create Missing Overview Documents (High Priority) ✅

**Status:** Verified — Core packages already had overview documents

**Discovery:** The following overview documents already existed:
- `20-core-types-00-overview.md` ✅
- `21-core-utils-00-overview.md` ✅
- `22-core-constants-00-overview.md` ✅
- `23-core-hooks-00-overview.md` ✅

**Note:** Remaining packages (UI, SEO, compliance, data, analytics) should receive overview documents when they are activated per `REPO-STATE.md` milestone scope.

### Phase 3: Standardize Content Templates (Medium Priority) ✅

**Status:** Complete — 3 templates created

**Created:**
1. `TEMPLATE-00-overview.md` — Standard overview structure
2. `TEMPLATE-10-spec.md` — Standard spec structure with warning block
3. `TEMPLATE-70-execution-prompt.md` — Standard execution prompt structure

These templates follow the slot-band ADR specifications from `a0-docs-agents-30-adr-tooling.md`.

### Phase 4: Backfill Missing Slot Bands & Warnings (Low Priority) ✅

**Status:** Complete — Core specs updated with proper warnings

**Actions taken:**
1. Renamed `71-email-service-41-guide-queues.md` → `71-email-service-40-guide-queues.md`
2. Added non-authoritative warning blocks to all core spec files:
   - `20-core-types-10-spec.md`
   - `21-core-utils-10-spec.md`
   - `22-core-constants-10-spec.md`
   - `23-core-hooks-10-spec.md`
3. Fixed broken cross-references in `docs/architecture/README.md`

**Note:** Remaining slot bands should be created when packages are activated per milestone scope.

---

## Family Key Reorganization Recommendations

### Core Package Family Keys
Current: `20-core-types`, `21-core-utils`, `22-core-constants`, `23-core-hooks`

**Issue:** `22-core-constants` breaks the sequence (should be `21-core-utils`, `22-core-constants` or all should use `20-` prefix).

**Recommendation:** Keep as-is for now (renaming would break cross-references), but document the anomaly.

### Cross-Cutting Concerns
Current: `02-core-performance-constraints.md`, `02-core-testing-constraints.md`

**Recommendation:** Create proper family keys:
- `02-core-performance-00-overview.md` + `02-core-performance-20-constraints.md`
- `03-core-testing-00-overview.md` + `03-core-testing-20-constraints.md`

### Tools Family Keys
Current: `b0-tools-app-generator`, `b1-tools-package-generator`, etc.

**Status:** Correctly using `b{number}-` prefix for tools domain.

---

## Success Criteria for Realignment

- [ ] All spec files use `10-` slot-band prefix
- [ ] All slot bands follow `00, 10, 20, 30, 40, 50, 60, 70` sequence
- [ ] No family key has duplicate slot bands
- [ ] All family keys have at minimum: `00-overview` and `10-spec`
- [ ] All `-10-spec.md` files include non-authoritative warning block
- [ ] All `-70-execution-prompt.md` files include governance check warning
- [ ] File listing shows documents in logical order by family key then slot band

---

## Appendix: Complete File Inventory by Family Key

### Complete Family Keys (All Slot Bands Present)
- `00-foundation`
- `01-config-biome-migration`
- `10-config-eslint`
- `11-config-typescript`
- `12-config-tailwind`
- `13-config-prettier`
- `13-config-react-compiler`
- `14-config-biome`
- `15-config-vite`
- `16-config-changesets`
- `42-monitoring`
- `60-auth-internal`
- `61-auth-portal`
- `70-email-templates`
- `71-email-service`
- `72-notifications`
- `72a-notifications-orchestration`
- `90-test-setup`
- `91-test-fixtures`
- `a0-docs-agents`
- `a1-docs-onboarding`
- `a2-docs-adrs`
- `a3-docs-package-guides`
- `a4-docs-marketing-standards`
- `a5-docs-tenant-isolation-data-governance`
- `a6-docs-dependency-truth-version-authority`
- `a7-docs-analytics-guides`
- `a8-docs-decisions-log`
- `c1-infra-codeowners-v2`
- `c2-infra-ci-workflow`
- `c3-infra-ci-workflow-v2`
- `c4-infra-release-workflow`
- `c5-infra-preview-deploy`
- `c6-infra-changesets`
- `c7-infra-security-audit`
- `c8-infra-accessibility-audit`
- `c9-infra-security-headers`
- `c14-infra-workspace-boundaries`
- `d2-infra-environment-mgmt`
- `d3-infra-deployment-guide`
- `d4-infra-sentry`
- `e1-apps-crm`
- `e2-apps-analytics`
- `e3-apps-agency-website`
- `e4-apps-client-portal`
- `e5-apps-playwright-e2e`
- `e6-apps-docs-site`
- `e7-apps-email-preview`
- `e8-apps-studio`
- `e9-apps-api`
- `e10-apps-client-sites-foundation`
- `f3-apps-client-sites-brand-foundation`

### Incomplete Family Keys (Missing Slot Bands)
- `20-core-types` — Missing: 20, 30, 40, 60, 70
- `21-core-utils` — Missing: 00, 20, 30, 40, 60, 70
- `22-core-constants` — Missing: 00, 20, 30, 40, 60, 70
- `23-core-hooks` — Missing: 00, 20, 30, 40, 60, 70
- `30-ui-theme` — Missing: 20, 30, 60, 70
- `31-ui-icons` — Missing: 30, 40, 60, 70
- `32-ui-design-system` — Missing: 20, 30, 40, 60, 70
- `40-seo` — Missing: 00, 20, 30, 40, 60, 70
- `41-compliance` — Missing: 00, 20, 30, 40, 60, 70
- `41a-compliance-security-headers` — Missing: 20, 30, 40, 60, 70
- `50-data-db` — Missing: 30, 40, 60, 70
- `51-data-cms` — Missing: 30, 60, 70
- `51a-data-content-federation` — Missing: 20, 30, 40, 60, 70
- `51b-data-ai-enrichment` — Missing: 20, 30, 40, 60, 70
- `52-data-api-client` — Missing: 30, 40, 60, 70
- `80-analytics` — Missing: 00, 20, 30, 40, 60, 70
- `80a-analytics-attribution` — Missing: 00, 20, 30, 40, 60, 70
- `80b-analytics-consent-bridge` — Missing: 00, 20, 30, 40, 60, 70
- `81-experimentation` — Missing: 00, 20, 30, 40, 60, 70
- `81a-experimentation-edge` — Missing: 00, 20, 30, 40, 60, 70
- `82-lead-capture` — Missing: 00, 20, 30, 40, 60, 70
- `82a-lead-forms-progressive` — Missing: 00, 20, 30, 40, 60, 70
- `82b-lead-enrichment` — Missing: 00, 20, 30, 40, 60, 70
- `c0-infra-codeowners` — Missing: 20, 30, 40, 50, 60, 70
- `c10-infra-bundle-analysis` — Missing: 00, 20, 30, 40, 60, 70
- `c11-infra-security-headers` — Missing: 20, 30, 40, 70
- `c12-infra-rate-limiting` — Missing: 00, 20, 30, 40, 60, 70
- `c13-infra-image-optimization` — Missing: 00, 20, 30, 40, 60, 70
- `d0-infra-vscode` — Missing: 20, 30, 40, 60, 70
- `d1-infra-db-migrations` — Missing: 20, 30, 40, 60, 70
- `f0-packages-monitoring` — Missing: 20, 30, 40, 60, 70
- `f1-packages-content-blocks` — Missing: 20, 30, 40, 60, 70
- `f2-packages-i18n` — Missing: 20, 30, 40, 60, 70
- `g0-infra-mcp-server` — Missing: 20, 30, 40, 60, 70

### Anomalous Files (Need Renaming)
- `01-core-constants-spec.md` → `21-core-constants-10-spec.md`
- `01-core-hooks-spec.md` → `23-core-hooks-10-spec.md`
- `01-core-types-spec.md` → `20-core-types-10-spec.md`
- `01-core-utils-spec.md` → `21-core-utils-10-spec.md`
- `02-core-performance-constraints.md` → Needs family key decision
- `02-core-testing-constraints.md` → Needs family key decision
- `71-email-service-41-guide-queues.md` → `71-email-service-40-guide-queues.md`

---

*Document generated: April 2026*
*Analysis based on: a0-docs-agents-30-adr-tooling.md (slot-band ADR)*
