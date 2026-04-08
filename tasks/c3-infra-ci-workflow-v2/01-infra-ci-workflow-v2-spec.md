# C3 Infra Ci Workflow V2 Specification

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
  TURBO_TOKEN: ${{ secrets.TURBO_TOKEN }}
  TURBO_TEAM: ${{ vars.TURBO_TEAM }}
  NODE_VERSION: "24"
  PNPM_VERSION: "10.33.0"

jobs:
  # ============================================
  # Setup Job - Cache dependencies
  # ============================================
  setup:
    name: Setup
    runs-on: ubuntu-latest
    timeout-minutes: 10
    outputs:
      node-version: ${{ env.NODE_VERSION }}
    steps:
      - name: Checkout
        uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Setup pnpm
        uses: pnpm/action-setup@v3
        with:
          version: ${{ env.PNPM_VERSION }}

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: pnpm

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Cache node_modules
        uses: actions/cache@v4
        with:
          path: |
            node_modules
            */*/node_modules
          key: ${{ runner.os }}-pnpm-${{ hashFiles('**/pnpm-lock.yaml') }}
          restore-keys: |
            ${{ runner.os }}-pnpm-

  # ============================================
  # Build Job
  # ============================================
  build:
    name: Build
    needs: setup
    runs-on: ubuntu-latest
    timeout-minutes: 15
    steps:
      - name: Checkout
        uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Setup pnpm
        uses: pnpm/action-setup@v3
        with:
          version: ${{ env.PNPM_VERSION }}

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: ${{ needs.setup.outputs.node-version }}
          cache: pnpm

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Build affected packages
        run: pnpm turbo build --filter=[origin/main...HEAD] --summarize
        env:
          TURBO_TOKEN: ${{ secrets.TURBO_TOKEN }}
          TURBO_TEAM: ${{ vars.TURBO_TEAM }}

      - name: Upload build artifacts
        uses: actions/upload-artifact@v4
        with:
          name: build-artifacts
          path: |
            */*/dist
            */*/.next
          retention-days: 1

  # ============================================
  # Lint Job
  # ============================================
  lint:
    name: Lint
    needs: setup
    runs-on: ubuntu-latest
    timeout-minutes: 10
    steps:
      - name: Checkout
        uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Setup pnpm
        uses: pnpm/action-setup@v3
        with:
          version: ${{ env.PNPM_VERSION }}

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: ${{ needs.setup.outputs.node-version }}
          cache: pnpm

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Run linter
        run: pnpm turbo lint --filter=[origin/main...HEAD]

  # ============================================
  # Type Check Job
  # ============================================
  typecheck:
    name: Type Check
    needs: setup
    runs-on: ubuntu-latest
    timeout-minutes: 10
    steps:
      - name: Checkout
        uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Setup pnpm
        uses: pnpm/action-setup@v3
        with:
          version: ${{ env.PNPM_VERSION }}

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: ${{ needs.setup.outputs.node-version }}
          cache: pnpm

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Run TypeScript check
        run: pnpm turbo typecheck --filter=[origin/main...HEAD]

  # ============================================
  # Test Job
  # ============================================
  test:
    name: Test
    needs: build
    runs-on: ubuntu-latest
    timeout-minutes: 15
    steps:
      - name: Checkout
        uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Setup pnpm
        uses: pnpm/action-setup@v3
        with:
          version: ${{ env.PNPM_VERSION }}

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: ${{ needs.setup.outputs.node-version }}
          cache: pnpm

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Download build artifacts
        uses: actions/download-artifact@v4
        with:
          name: build-artifacts

      - name: Run tests
        run: pnpm turbo test --filter=[origin/main...HEAD]

  # ============================================
  # Changeset Check Job
  # ============================================
  changeset-check:
    name: Changeset Check
    needs: setup
    runs-on: ubuntu-latest
    if: github.event_name == 'pull_request'
    timeout-minutes: 5
    steps:
      - name: Checkout
        uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Setup pnpm
        uses: pnpm/action-setup@v3
        with:
          version: ${{ env.PNPM_VERSION }}

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: ${{ needs.setup.outputs.node-version }}
          cache: pnpm

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Check for changeset
        run: pnpm changeset status --since=origin/main
        continue-on-error: true

  # ============================================
  # E2E Test Job (Conditional)
  # ============================================
  e2e:
    name: E2E Tests
    needs: build
    runs-on: ubuntu-latest
    if: contains(github.event.pull_request.labels.*.name, 'e2e-required') || github.ref == 'refs/heads/main'
    timeout-minutes: 20
    steps:
      - name: Checkout
        uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Setup pnpm
        uses: pnpm/action-setup@v3
        with:
          version: ${{ env.PNPM_VERSION }}

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: ${{ needs.setup.outputs.node-version }}
          cache: pnpm

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Install Playwright
        run: pnpm exec playwright install --with-deps

      - name: Run E2E tests
        run: pnpm turbo e2e --filter=[origin/main...HEAD]
        env:
          E2E_BASE_URL: ${{ vars.E2E_BASE_URL || 'http://localhost:3000' }}

  # ============================================
  # Required Status Check Aggregation
  # ============================================
  ci-complete:
    name: CI Complete
    needs: [build, lint, typecheck, test]
    runs-on: ubuntu-latest
    if: always()
    steps:
      - name: Check all jobs passed
        run: |
          if [ "${{ needs.build.result }}" != "success" ] || \
             [ "${{ needs.lint.result }}" != "success" ] || \
             [ "${{ needs.typecheck.result }}" != "success" ] || \
             [ "${{ needs.test.result }}" != "success" ]; then
            echo "One or more required jobs failed"
            exit 1
          fi
          echo "All CI jobs passed"
```


## Critical Configuration

### Required Secrets

| Secret | Source | Purpose |
|--------|--------|---------|
| `TURBO_TOKEN` | Vercel dashboard | Turborepo remote cache access |
| `TURBO_TEAM` | Vercel team slug | Team identifier for cache |

### Setup Steps

1. **Get Turborepo token** from Vercel dashboard:
   - Settings → Turborepo → Remote Cache → Generate Token

2. **Add to GitHub repository secrets**:
   - Settings → Secrets and variables → Actions
   - Add `TURBO_TOKEN` (secret)
   - Add `TURBO_TEAM` (variable, e.g., `acme-corp`)

3. **Configure branch protection**:
   - Settings → Branches → main
   - Require status check: `CI Complete` (ci-complete job)


## Key Features

### Affected-Only Execution
- `--filter=[origin/main...HEAD]` runs only packages changed in PR
- Dramatically reduces CI time for small changes

### Remote Caching
- Build artifacts cached on Vercel's infrastructure
- Shared across all CI runs and local development
- Cache hits replay instantly without rebuilding

### Parallel Jobs
- Build, lint, typecheck run in parallel
- Tests run after build completes (needs artifacts)
- E2E runs conditionally (labeled PRs or main branch)


## Implementation Checklist

- [ ] File placed at `.github/workflows/ci.yml`
- [ ] `TURBO_TOKEN` added to GitHub secrets
- [ ] `TURBO_TEAM` added to GitHub variables
- [ ] Branch protection configured with `CI Complete` required
- [ ] Test PR created to verify pipeline works
- [ ] Cache hit rates verified (should be >50% for repeated builds)
