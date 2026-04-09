# c7-infra-security-audit: Implementation Specification

## Task Header

| Field | Value |
|-------|-------|
| **State** | `planned` — Documented target; implementation not yet authorized |
| **Trigger** | Repository requires security audit processes |
| **Minimum Consumers** | All apps and packages |
| **Dependencies** | None (documentation/process) |
| **Exit Criteria** | Security audit docs published and followed |
| **Implementation Authority** | `REPO-STATE.md` — Phase: Planning, Build status: Not started |
| **Version Authority** | Repository governance |
| **Superseded by** | n/a |

**Cross-references:**
- Decision status: `DECISION-STATUS.md` — Security audit `approved`
- Tenant isolation: `docs/standards/tenant-isolation-data-governance.md`
- Dependency truth: `docs/standards/dependency-truth.md`
- Note: Required for maintaining security posture

Security-audit guidance should treat tenant-boundary verification and dependency-integrity verification as governed checks, not ad hoc local rules.

## Files

```
docs/
└── security/
    ├── audit-checklist.md
    ├── dependency-scanning.md
    └── secret-detection.md
.github/
└── workflows/
    └── security-audit.yml
tools/
└── scripts/
    └── security-check.sh
```

### Security Audit Workflow (`.github/workflows/security-audit.yml`)
```yaml
name: Security Audit

on:
  push:
    branches: [main]
  pull_request:
    types: [opened, synchronize, reopened]
  schedule:
    # Run daily at 9 AM UTC
    - cron: "0 9 * * *"
  workflow_dispatch:

concurrency:
  group: security-${{ github.ref }}
  cancel-in-progress: true

jobs:
  secret-scan:
    name: Secret Detection
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Detect secrets
        uses: trufflesecurity/trufflehog@main
        with:
          path: ./
          base: main
          head: HEAD
          extra_args: --debug --only-verified

  dependency-audit:
    name: Dependency Vulnerabilities
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v3
        with:
          version: 10.33.0

      - uses: actions/setup-node@v4
        with:
          node-version: 24
          cache: pnpm

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Run pnpm audit
        run: |
          pnpm audit --audit-level=moderate || true

      - name: Check for high/critical vulnerabilities
        run: |
          pnpm audit --audit-level=high
        continue-on-error: false

  code-security:
    name: Code Security Analysis
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Initialize CodeQL
        uses: github/codeql-action/init@v3
        with:
          languages: javascript, typescript

      - name: Autobuild
        uses: github/codeql-action/autobuild@v3

      - name: Perform CodeQL Analysis
        uses: github/codeql-action/analyze@v3

  env-check:
    name: Environment Variable Check
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Check for committed .env files
        run: |
          if find . -name ".env*" -type f | grep -v ".env.example" | grep -v ".env.sample" | grep -v node_modules | grep -q .; then
            echo "❌ Found committed .env files:"
            find . -name ".env*" -type f | grep -v ".env.example" | grep -v ".env.sample" | grep -v node_modules
            exit 1
          fi
          echo "✅ No .env files committed"

      - name: Check for hardcoded secrets pattern
        run: |
          # Check for common secret patterns in source
          if grep -r "sk_live_" --include="*.ts" --include="*.tsx" --include="*.js" . 2>/dev/null | grep -v node_modules | grep -q .; then
            echo "❌ Found potential hardcoded Clerk secret keys"
            exit 1
          fi
          
          if grep -r "postgresql://" --include="*.ts" --include="*.tsx" --include="*.js" . 2>/dev/null | grep -v node_modules | grep -v "localhost" | grep -q .; then
            echo "❌ Found potential hardcoded database URLs"
            exit 1
          fi
          
          echo "✅ No obvious hardcoded secrets found"
```

### Security Check Script (`tools/scripts/security-check.sh`)
```bash
#!/bin/bash

# ============================================
# Security Check Script
# Run locally before committing
# ============================================

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "🔒 Running security checks...\n"

# Check for .env files
echo "1. Checking for committed .env files..."
if find . -name ".env*" -type f 2>/dev/null | grep -v ".env.example" | grep -v ".env.sample" | grep -v node_modules | grep -q .; then
    echo -e "${RED}❌ Found .env files that should not be committed:${NC}"
    find . -name ".env*" -type f | grep -v ".env.example" | grep -v ".env.sample" | grep -v node_modules
    exit 1
else
    echo -e "${GREEN}✅ No .env files committed${NC}"
fi

# Check for common secrets patterns
echo -e "\n2. Checking for hardcoded secrets..."
SECRETS_FOUND=0

if grep -r "sk_live_" --include="*.ts" --include="*.tsx" --include="*.js" . 2>/dev/null | grep -v node_modules | grep -v ".spec.ts" | grep -q .; then
    echo -e "${RED}❌ Found potential Clerk live secret keys${NC}"
    grep -r "sk_live_" --include="*.ts" --include="*.tsx" --include="*.js" . | grep -v node_modules | grep -v ".spec.ts" || true
    SECRETS_FOUND=1
fi

if grep -r "sk_test_" --include="*.ts" --include="*.tsx" --include="*.js" . 2>/dev/null | grep -v node_modules | grep -v ".spec.ts" | grep -q .; then
    echo -e "${YELLOW}⚠️  Found test keys (verify these are intentional)${NC}"
    grep -r "sk_test_" --include="*.ts" --include="*.tsx" --include="*.js" . | grep -v node_modules | grep -v ".spec.ts" || true
fi

if grep -r "postgresql://" --include="*.ts" --include="*.tsx" --include="*.js" . 2>/dev/null | grep -v node_modules | grep -v "localhost" | grep -v "example" | grep -q .; then
    echo -e "${RED}❌ Found potential production database URLs${NC}"
    grep -r "postgresql://" --include="*.ts" --include="*.tsx" --include="*.js" . | grep -v node_modules | grep -v "localhost" || true
    SECRETS_FOUND=1
fi

if [ $SECRETS_FOUND -eq 0 ]; then
    echo -e "${GREEN}✅ No obvious hardcoded secrets found${NC}"
else
    exit 1
fi

# Run dependency audit
echo -e "\n3. Running dependency audit..."
pnpm audit --audit-level=moderate || echo -e "${YELLOW}⚠️  Some vulnerabilities found (review above)${NC}"

echo -e "\n${GREEN}✅ Security checks complete${NC}"
```

### Security Audit Checklist (`docs/security/audit-checklist.md`)
```markdown
# Security Audit Checklist

## Pre-Deployment Security Review

### Code Security
- [ ] No hardcoded secrets in source code
- [ ] No committed `.env` or `.env.local` files
- [ ] No `console.log` statements with sensitive data
- [ ] All API endpoints have authentication where required
- [ ] Input validation on all user inputs (Zod schemas)
- [ ] SQL injection prevention (use Drizzle ORM parameterized queries)

### Authentication & Authorization
- [ ] Clerk middleware applied to protected routes
- [ ] Better Auth configured for client portals
- [ ] Session expiration configured appropriately
- [ ] Role-based access control (RBAC) implemented
- [ ] Password policy enforced (if applicable)

### Database Security
- [ ] Database credentials not exposed in logs
- [ ] Connection pooling configured
- [ ] SSL/TLS enforced for database connections
- [ ] `client_id` scoping enforced in all queries (multi-tenant; see `a5` standard)
- [ ] Backup strategy in place

### Environment & Secrets
- [ ] All secrets in environment variables
- [ ] Production using different secrets than dev/staging
- [ ] Secrets rotated in last 90 days
- [ ] 1Password (or similar) vault for team secret sharing
- [ ] No secrets in GitHub issues or PRs

### Dependencies
- [ ] `pnpm audit` shows no high/critical vulnerabilities
- [ ] Dependencies reviewed for known security issues
- [ ] Dependency versions and drift reviewed against `docs/DEPENDENCY.md` and `docs/standards/dependency-truth.md`
- [ ] No unused dependencies (reduce attack surface)
- [ ] Lock file committed (pnpm-lock.yaml)

### Infrastructure
- [ ] HTTPS enforced (Vercel default)
- [ ] Security headers configured (CSP, HSTS, X-Frame-Options)
- [ ] CORS configured correctly for API routes
- [ ] Rate limiting implemented
- [ ] DDoS protection (Vercel provides this)

### Monitoring
- [ ] Error tracking configured (Sentry recommended)
- [ ] Failed authentication attempts logged
- [ ] Unusual activity monitoring
- [ ] Incident response plan documented

## Automated Security Tools

### Enabled in CI
- [ ] Secret scanning (TruffleHog)
- [ ] Dependency vulnerability scanning (pnpm audit)
- [ ] CodeQL analysis
- [ ] Environment file detection

### Recommended Local Tools
- [ ] 1Password CLI for secret injection
- [ ] GitLeaks pre-commit hook
- [ ] VS Code security extensions

## Incident Response

### If Secret is Exposed
1. **Immediately** revoke the exposed secret
2. Generate new secret
3. Update all environments
4. Review logs for unauthorized access
5. Document incident

### If Vulnerability Discovered
1. Assess severity (CVSS score)
2. Create fix timeline
3. Apply patch or workaround
4. Verify fix with `pnpm audit`
5. Document in ADR if significant

## Review Schedule

| Check | Frequency | Owner |
|-------|-----------|-------|
| Dependency audit | Weekly (CI) | Automated |
| Secret scan | Every PR (CI) | Automated |
| Full security review | Monthly | Security Lead |
| Penetration test | Quarterly | External (if budget) |
| Secret rotation | Every 90 days | Platform Team |
```

### Secret Detection Guide (`docs/security/secret-detection.md`)
```markdown
# Secret Detection

## What Gets Detected

### API Keys
- Clerk secret keys (`sk_live_*`, `sk_test_*`)
- Stripe keys (`sk_live_*`, `pk_live_*`)
- GitHub tokens (`ghp_*`, `gho_*`)
- AWS credentials (`AKIA*`)

### Database URLs
- PostgreSQL connection strings
- MongoDB connection strings
- Redis connection strings

### Private Keys
- SSH private keys
- JWT secrets
- Encryption keys

## How Secrets Are Detected

### In CI (GitHub Actions)
TruffleHog scans every PR and commit for secrets.

### Locally
Run before committing:
```bash
pnpm security:check
```

Or install pre-commit hook:
```bash
# Install pre-commit
pip install pre-commit

# Add to .pre-commit-config.yaml
repos:
  - repo: https://github.com/trufflesecurity/trufflehog
    rev: v3.63.0
    hooks:
      - id: trufflehog
```

## What To Do If a Secret is Detected

### 1. Don't Panic
CI failing is better than a leaked secret.

### 2. Verify It's a Real Secret
Sometimes the scanner detects test data:
```typescript
// This might trigger a false positive
const EXAMPLE_KEY = "sk_test_1234567890abcdef";
```

### 3. If It's a Real Secret
1. Revoke the secret immediately in the service dashboard
2. Generate a new secret
3. Update your `.env.local` (NOT committed)
4. Remove the secret from git history:
   ```bash
   git filter-branch --force --index-filter \
   'git rm --cached --ignore-unmatch path/to/file' \
   HEAD
   ```
5. Force push (coordinate with team)

### 4. If It's a False Positive
Add a comment to tell the scanner to ignore:
```typescript
// trufflehog:ignore
const TEST_KEY = "sk_test_1234567890abcdef";
```

Or add to `. trufflehogignore`:
```
# Test fixtures
packages/testing/fixtures/*.ts
```

## Prevention

### Use Environment Variables
```typescript
// ✅ Good
const apiKey = process.env.CLICKUP_API_KEY;

// ❌ Bad
const apiKey = "sk_live_51H...
