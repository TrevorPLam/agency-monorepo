# 09-cicd/05-codeowners-v2: CODEOWNERS File

## Purpose
Enforce automatic review requests from the correct domain owners when shared packages change. GitHub automatically requests CODEOWNERS for review when matching files change in a PR.

## Dependencies
- TASK_0 (Root Repository Scaffolding) - for repository structure
- All package tasks (TASK_1-21) - defines what needs ownership

## Files

```
.github/
└── CODEOWNERS
```

### `.github/CODEOWNERS`
```
# ============================================
# Agency Monorepo CODEOWNERS
# ============================================
# 
# This file defines who must review changes to each part of the codebase.
# GitHub automatically requests review from matching owners on PRs.
#
# Syntax: <pattern> <owner(s)>
# - Pattern uses gitignore-style glob syntax
# - Owner can be @username, @org/team, or email
# - Multiple owners can be listed (space-separated)

# ============================================
# Global fallback - any unowned files
# ============================================
* @agency/platform-lead

# ============================================
# Configuration Packages (high blast radius)
# ============================================
# Changes affect entire monorepo - requires senior review
/packages/config/** @agency/platform-lead @agency/senior-frontend
/.github/workflows/** @agency/platform-lead @agency/devops
/turbo.json @agency/platform-lead
/pnpm-workspace.yaml @agency/platform-lead
/package.json @agency/platform-lead

# ============================================
# Core Domain (foundation layer)
# ============================================
# Base of dependency graph - affects everyone
/packages/core/shared-types/** @agency/senior-backend @agency/platform-lead
/packages/core/shared-utils/** @agency/senior-backend
/packages/core/shared-constants/** @agency/senior-backend
/packages/core/hooks/** @agency/frontend-lead

# ============================================
# UI Domain
# ============================================
/packages/ui/design-system/** @agency/design-engineer @agency/frontend-lead
/packages/ui/theme/** @agency/design-engineer
/packages/ui/icons/** @agency/design-engineer

# ============================================
# Data Domain (critical for data integrity)
# ============================================
/packages/data/database/** @agency/data-owner @agency/senior-backend
/packages/data/database/src/schema/** @agency/data-owner
/packages/data/database/src/queries/** @agency/data-owner
/packages/data/database/migrations/** @agency/data-owner @agency/platform-lead
/packages/data/cms-schemas/** @agency/content-lead @agency/frontend-lead
/packages/data/api-client/** @agency/senior-backend

# ============================================
# Auth Domain (security-critical)
# ============================================
/packages/auth/internal/** @agency/security-lead @agency/platform-lead
/packages/auth/portal/** @agency/security-lead

# ============================================
# Communication Domain
# ============================================
/packages/communication/email-templates/** @agency/product-lead @agency/frontend-lead
/packages/communication/email-service/** @agency/platform-lead
/packages/communication/notifications/** @agency/platform-lead

# ============================================
# Testing Domain
# ============================================
/packages/testing/** @agency/qa-lead @agency/platform-lead

# ============================================
# Applications
# ============================================
# Agency website - public facing
/apps/agency-website/** @agency/frontend-lead @agency/marketing-lead

# Client sites - per-client ownership
/apps/client-sites/** @agency/account-manager @agency/frontend-lead

# Internal tools
/apps/internal-tools/crm/** @agency/product-lead
/apps/internal-tools/** @agency/internal-tools-lead @agency/product-lead

# ============================================
# Documentation
# ============================================
/docs/AGENTS.md @agency/platform-lead
/docs/architecture/** @agency/platform-lead @agency/tech-lead
/docs/onboarding/** @agency/platform-lead
/docs/package-guides/** @agency/platform-lead
/docs/security/** @agency/security-lead

# ============================================
# CI/CD (high risk)
# ============================================
/.github/workflows/ci.yml @agency/platform-lead @agency/devops
/.github/workflows/release.yml @agency/platform-lead
/.github/workflows/db-migrate.yml @agency/data-owner @agency/platform-lead
/.github/workflows/security-audit.yml @agency/security-lead
/.github/CODEOWNERS @agency/platform-lead

# ============================================
# Tools and Scripts
# ============================================
/tools/generators/** @agency/platform-lead
/tools/codemods/** @agency/platform-lead
/tools/scripts/** @agency/platform-lead

# ============================================
# Root Configuration
# ============================================
/.gitignore @agency/platform-lead
/.nvmrc @agency/platform-lead
/.prettierignore @agency/platform-lead
/tsconfig.json @agency/platform-lead
```

## Ownership Matrix

| Area | Owner(s) | Responsibility |
|------|----------|----------------|
| `packages/config/` | Platform Lead + Senior Frontend | ESLint rules, TypeScript config affect all code |
| `packages/core/` | Senior Backend Lead | Type quality, utility purity |
| `packages/ui/` | Design Engineer + Frontend Lead | Accessibility, visual consistency |
| `packages/data/` | Data Owner | Schema changes, migration safety, query correctness |
| `packages/auth/` | Security Lead | Session security, auth flows |
| `packages/communication/` | Product Lead | Email copy, notification logic |
| `packages/testing/` | QA Lead + Platform Lead | Test quality, fixtures accuracy |
| `apps/internal-tools/` | Internal Tools Lead + Product Lead | Business logic integrity |
| `apps/client-sites/` | Account Manager + Frontend Lead | Client isolation, brand compliance |
| `.github/workflows/` | Platform Lead + DevOps | CI correctness, deployment safety |

## Setting Up Teams in GitHub

### Step 1: Create GitHub Teams
In your GitHub organization settings, create teams:
- `@agency/platform-lead` (1-2 senior engineers)
- `@agency/senior-backend` (backend specialists)
- `@agency/frontend-lead` (UI/frontend lead)
- `@agency/design-engineer` (design system owner)
- `@agency/data-owner` (database/schema owner)
- `@agency/security-lead` (auth/security owner)
- `@agency/product-lead` (product manager)
- `@agency/qa-lead` (testing owner)
- `@agency/internal-tools-lead` (internal app owner)
- `@agency/marketing-lead` (website owner)
- `@agency/devops` (infrastructure)
- `@agency/tech-lead` (architecture decisions)
- `@agency/content-lead` (CMS/content)
- `@agency/account-manager` (client relations)

### Step 2: Assign Members
Add appropriate team members to each team based on roles.

### Step 3: Grant Repository Access
Ensure all teams have at least "Write" access to this repository.

## How CODEOWNERS Works

### Automatic Review Requests
When a PR modifies files matching a pattern, GitHub automatically:
1. Requests review from all listed owners
2. Blocks merge until at least one owner approves (if branch protection enabled)
3. Shows ownership in the PR files changed tab

### Example Scenarios

**Scenario 1: Database Schema Change**
```
PR modifies: packages/data/database/src/schema/clients.ts
Automatic reviewers: @agency/data-owner
```

**Scenario 2: UI Component Change**
```
PR modifies: packages/ui/design-system/src/components/button.tsx
Automatic reviewers: @agency/design-engineer, @agency/frontend-lead
```

**Scenario 3: CI Workflow Change**
```
PR modifies: .github/workflows/ci.yml
Automatic reviewers: @agency/platform-lead, @agency/devops
```

## Branch Protection Rules

Combine CODEOWNERS with branch protection for enforcement:

1. Go to Settings → Branches → Add rule
2. Branch name pattern: `main`
3. Enable:
   - "Require a pull request before merging"
   - "Require approvals" (suggest 1-2)
   - "Require review from CODEOWNERS"
   - "Require status checks to pass" (CI workflow)
   - "Require branches to be up to date before merging"

## Customization Guide

### Single Developer Teams
If you're solo/small team, replace team names with your GitHub username:
```
/packages/config/** @yourusername
```

### Multiple Packages, Same Owner
```
/packages/core/** @backend-owner
/packages/data/** @backend-owner
```

### Escalation for High-Risk Changes
Require multiple approvals for critical paths:
```
/packages/data/database/migrations/** @data-owner @platform-lead @senior-backend
```

## Verification

```bash
# CODEOWNERS file is valid
git check-mailmap -f .github/CODEOWNERS

# Or use GitHub CLI
gh api repos/:owner/:repo/codeowners-errors
```

## Implementation Checklist

- [ ] File placed at `.github/CODEOWNERS`
- [ ] GitHub teams created (or usernames substituted)
- [ ] Team members assigned to teams
- [ ] Repository access granted to teams
- [ ] Branch protection enabled with "Require review from CODEOWNERS"
- [ ] Test PR created to verify automatic review requests work

## Related Tasks
- TASK_21: AGENTS.md (references CODEOWNERS for agent rules)
- TASK_43: Package Guides (documents ownership per package)
- TASK_25: CI Workflow (runs checks before CODEOWNERS review)
