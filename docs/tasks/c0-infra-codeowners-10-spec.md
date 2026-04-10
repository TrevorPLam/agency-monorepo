# c0-infra-codeowners: Implementation Specification

## Task Header

| Field | Value |
|-------|-------|
| **State** | `planned` — Documented target; implementation not yet authorized |
| **Trigger** | Repository requires code ownership rules |
| **Minimum Consumers** | All repository contributors |
| **Dependencies** | GitHub repository |
| **Exit Criteria** | CODEOWNERS file published and active |
| **Implementation Authority** | `REPO-STATE.md` — Phase: Planning, Build status: Not started |
| **Version Authority** | Repository governance |
| **Superseded by** | n/a |
| **Supersedes** | n/a |

**Cross-references:**
- Decision status: `DECISION-STATUS.md` — CODEOWNERS `approved`
- Location: `.github/CODEOWNERS`
- Note: Canonical starting point for CODEOWNERS; c1 is a later-growth refinement, not a current replacement

## Files
```
.github/
└── CODEOWNERS
```

### `.github/CODEOWNERS`
```markdown
# Global fallback - Platform team owns everything not otherwise specified
* @agency/platform-team

# ============================================
# PACKAGE DOMAINS
# ============================================

# Config packages - Platform owner
/packages/config/ @agency/platform-team

# Core packages - Senior full-stack lead
/packages/core/ @agency/senior-backend-lead

# UI packages - Frontend lead / Design engineer
/packages/ui/ @agency/frontend-lead

# Data packages - Backend / Data owner
/packages/data/ @agency/backend-lead

# Auth packages - Security-aware senior developer
/packages/auth/ @agency/security-lead

# Communication packages - Project / Product owner
/packages/communication/ @agency/product-owner

# Testing packages - Platform or QA owner
/packages/testing/ @agency/qa-lead

# ============================================
# APPS
# ============================================

# Agency website - Marketing / Frontend lead
/apps/agency-website/ @agency/marketing-lead @agency/frontend-lead

# Client sites - Per-client project lead (examples)
/apps/client-sites/client-a-*/ @agency/project-lead-alice
/apps/client-sites/client-b-*/ @agency/project-lead-bob

# Internal tools - Internal tools lead
/apps/internal-tools/crm/ @agency/internal-tools-lead
/apps/internal-tools/project-tracker/ @agency/internal-tools-lead
/apps/internal-tools/invoicing/ @agency/internal-tools-lead @agency/finance-lead
/apps/internal-tools/reporting/ @agency/internal-tools-lead @agency/data-lead
/apps/internal-tools/operations-dashboard/ @agency/internal-tools-lead @agency/ops-lead

# ============================================
# INFRASTRUCTURE
# ============================================

# CI/CD workflows - Platform owner
/.github/workflows/ @agency/platform-team

# Changesets configuration
/.changeset/ @agency/platform-team

# Root configuration files
/package.json @agency/platform-team
/pnpm-workspace.yaml @agency/platform-team
/turbo.json @agency/platform-team
/.nvmrc @agency/platform-team

# Docs infrastructure
/docs/AGENTS.md @agency/platform-team @agency/tech-lead
/docs/architecture/ @agency/tech-lead
/docs/onboarding/ @agency/platform-team

# Tools
/tools/generators/ @agency/platform-team
/tools/codemods/ @agency/platform-team
/tools/scripts/ @agency/backend-lead @agency/platform-team

# ============================================
# SECURITY-SENSITIVE
# ============================================

# Database schema changes require data owner review
/packages/data/database/src/schema/ @agency/data-owner @agency/security-lead

# Auth configuration requires security review
/packages/auth/*/src/ @agency/security-lead

# Environment and secrets handling
**/.env* @agency/security-lead @agency/platform-team

# ============================================
# DOCUMENTATION
# ============================================

# Root docs - Tech lead
/01-config-biome-migration-50-ref-quickstart.md @agency/tech-lead
/ARCHITECTURE.md @agency/tech-lead
/DEPENDENCY.md @agency/tech-lead @agency/platform-team
/ROADMAP.md @agency/tech-lead @agency/product-owner
```


## Implementation Notes

### Setting Up Teams

Replace `@agency/xxx` with actual GitHub team handles:
- `@agency/platform-team` → e.g., `@acme-corp/platform`
- `@agency/frontend-lead` → e.g., `@sarah-frontend`

### Ownership Principles

| Area | Owner Responsibility |
|------|---------------------|
| Config | ESLint/TS/Tailwind correctness, import boundary rules |
| Core | Type quality, utility purity, preventing business logic leakage |
| UI | Accessibility compliance, visual consistency, component API stability |
| Data | Schema changes, migration correctness, query safety, client_id enforcement |
| Auth | Session security, token handling, RBAC correctness, auth flow coverage |
| Communication | Email template correctness, client-facing copy, notification reliability |
| Testing | Fixture quality, mock factory correctness, cross-app test consistency |

### PR Review Rules

1. **CODEOWNERS automatically requested** when matching files change
2. **Required reviews** should be configured in branch protection:
   - At least 1 CODEOWNER approval for shared packages
   - At least 2 approvals for auth/data schema changes
3. **Override capability**: Senior tech leads can merge with admin override in emergencies (documented in incident post-mortem)


## Implementation Checklist

- [ ] File placed at `.github/CODEOWNERS`
- [ ] GitHub teams created and populated
- [ ] Branch protection rules configured to require CODEOWNER review
- [ ] Team members notified of ownership responsibilities
- [ ] Test PR created to verify automatic reviewer assignment
