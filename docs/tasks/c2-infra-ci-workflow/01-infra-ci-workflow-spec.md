# c2-infra-ci-workflow: Implementation Specification

## Task Header

| Field | Value |
|-------|-------|
| **State** | `planned` — Documented target; implementation not yet authorized |
| **Trigger** | Repository requires automated CI/CD |
| **Minimum Consumers** | All packages and apps |
| **Dependencies** | GitHub Actions, pnpm 10.33.0, Turborepo 2.9.5 |
| **Exit Criteria** | CI workflow running on all PRs and main branch |
| **Implementation Authority** | `REPO-STATE.md` — Phase: Planning, Build status: Not started |
| **Version Authority** | `DEPENDENCY.md` §1, §3 — pnpm 10.33.0, Turborepo 2.9.5 |
| **Superseded by** | c3-infra-ci-workflow-v2 (deferred) |

**Cross-references:**
- Decision status: `DECISION-STATUS.md` — CI workflow `approved`
- Version pins: `DEPENDENCY.md` §1, §3
- Dependency-truth policy: `docs/standards/dependency-truth.md`
- Location: `.github/workflows/ci.yml`
- Note: Required for quality assurance and automated testing

## Files

```
.github/
└── workflows/
    └── ci.yml
```

### `.github/workflows/ci.yml`
```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    types: [opened, synchronize, reopened]

concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true

env:
  NODE_VERSION: "24"
  PNPM_VERSION: "10.33.0"

jobs:
  build:
    name: Build, Lint, Test, Typecheck
    runs-on: ubuntu-latest
    timeout-minutes: 20
    
    env:
      TURBO_TOKEN: ${{ secrets.TURBO_TOKEN }}
      TURBO_TEAM: ${{ vars.TURBO_TEAM }}
    
    steps:
      - name: Checkout
        uses: actions/checkout@v4
        with:
          fetch-depth: 0  # Required for Turborepo affected detection

      - name: Setup pnpm
        uses: pnpm/action-setup@v3
        with:
          version: ${{ env.PNPM_VERSION }}

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: pnpm

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Build
        run: pnpm turbo build

      - name: Lint
        run: pnpm turbo lint

      - name: Type check
        run: pnpm turbo typecheck

      - name: Test
        run: pnpm turbo test
        env:
          # Test environment variables (use mock values for CI)
          DATABASE_URL: "postgresql://test:test@localhost:5432/test"
          NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: "pk_test_test"
          CLERK_SECRET_KEY: "sk_test_test"

  changeset-check:
    name: Check Changeset
    runs-on: ubuntu-latest
    if: github.event_name == 'pull_request'
    
    steps:
      - name: Checkout
        uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Setup pnpm
        uses: pnpm/action-setup@v3
        with:
          version: ${{ env.PNPM_VERSION }}

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: pnpm

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Check for changeset
        run: |
          # Check if any shared packages were modified
          CHANGED_PACKAGES=$(git diff --name-only origin/main | grep -E "^packages/" | cut -d/ -f2 | sort -u)
          
          if [ -n "$CHANGED_PACKAGES" ]; then
            echo "Modified packages: $CHANGED_PACKAGES"
            
            # Check if a changeset file exists for this PR
            if ! git diff --name-only origin/main | grep -q "^\.changeset/"; then
              echo "⚠️ Warning: Package changes detected but no changeset file found"
              echo "Run 'pnpm changeset' to create a changeset"
              
              # Don't fail, just warn - some changes might not need changesets
              # Uncomment below to enforce changesets:
              # exit 1
            fi
          fi
```


## Required Secrets and Variables

| Name | Type | Setup Location | Purpose |
|------|------|----------------|---------|
| `TURBO_TOKEN` | Secret | GitHub Settings → Secrets | Turborepo remote cache auth |
| `TURBO_TEAM` | Variable | GitHub Settings → Variables | Vercel team slug |

### Setting up Turborepo Remote Cache

1. Go to [vercel.com](https://vercel.com) → Your Team Settings → Remote Cache
2. Generate a new token
3. Add to GitHub Secrets as `TURBO_TOKEN`
4. Add your team slug to GitHub Variables as `TURBO_TEAM`


## Pipeline Behavior

### On Pull Request
1. Builds all affected packages (compared to `main`)
2. Runs lint on affected packages
3. Runs type check on affected packages
4. Runs tests on affected packages
5. Checks if changeset is needed (warning only)

### On Push to Main
1. Same as PR but builds from clean state
2. Triggers release workflow (see TASK_26)


## Caching Strategy

Turborepo automatically caches:
- Build outputs (`.next/**`, `dist/**`)
- Lint results
- Test results
- Type check results

Cache keys are based on:
- Source file content hashes
- Dependency versions
- Environment variables (only those specified in `turbo.json` `globalEnv`)


## Verification

```bash
# Test locally with act (GitHub Actions local runner)
# https://github.com/nektos/act
act push -j build

# Or manually run the same commands CI runs
pnpm install --frozen-lockfile
pnpm turbo build lint typecheck test
```


## Troubleshooting

### Cache Misses
If builds are slower than expected:
```bash
# Check what Turborepo thinks changed
pnpm turbo build --dry-run

# Force a fresh build
pnpm turbo build --force
```

### Test Failures in CI Only
```bash
# Run tests with CI-like environment
CI=true pnpm turbo test
```


## Implementation Checklist

- [ ] File placed at `.github/workflows/ci.yml`
- [ ] `TURBO_TOKEN` secret added to GitHub
- [ ] `TURBO_TEAM` variable added to GitHub
- [ ] PR created to verify workflow runs
- [ ] Cache hit rate verified (should be >50% on subsequent runs)


## Related Tasks
- TASK_26: Release Workflow (runs after CI on main)
- TASK_36: Database Migration Workflow (separate DB workflow)
- TASK_40: Security Audit (runs in parallel)
