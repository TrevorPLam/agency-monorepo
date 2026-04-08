# c4-infra-release-workflow/00-package: Release Workflow

## Purpose
Automate versioning and package releases using Changesets. Opens PR with version bumps, publishes to registry when merged.

## Files
```
.github/
└── workflows/
    └── release.yml
```

### `.github/workflows/release.yml`
```yaml
name: Release

on:
  push:
    branches: [main]

concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true

env:
  TURBO_TOKEN: ${{ secrets.TURBO_TOKEN }}
  TURBO_TEAM: ${{ vars.TURBO_TEAM }}
  NODE_VERSION: "24"
  PNPM_VERSION: "10.33.0"

jobs:
  release:
    name: Release
    runs-on: ubuntu-latest
    timeout-minutes: 20
    steps:
      - name: Checkout
        uses: actions/checkout@v4
        with:
          fetch-depth: 0
          token: ${{ secrets.CHANGESETS_TOKEN }}

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

      - name: Build packages
        run: pnpm turbo build --filter=./packages/*
        env:
          TURBO_TOKEN: ${{ secrets.TURBO_TOKEN }}
          TURBO_TEAM: ${{ vars.TURBO_TEAM }}

      - name: Create Release Pull Request or Publish
        id: changesets
        uses: changesets/action@v1
        with:
          version: pnpm version-packages
          publish: pnpm release
          commit: "chore: version packages"
          title: "chore: version packages"
        env:
          GITHUB_TOKEN: ${{ secrets.CHANGESETS_TOKEN }}
          NPM_TOKEN: ${{ secrets.NPM_TOKEN }}
```

## Required Secrets

| Secret | Purpose | Setup |
|--------|---------|-------|
| `CHANGESETS_TOKEN` | PAT with repo scope for creating PRs | GitHub Settings → Developer → PAT |
| `NPM_TOKEN` | (Optional) For publishing to npm registry | npmjs.com → Access Tokens |

## How It Works

1. **Changeset files created** in PRs via `pnpm changeset`
2. **On merge to main**, this workflow:
   - Reads all pending changeset files
   - Calculates version bumps (patch/minor/major)
   - Updates `package.json` versions
   - Updates changelogs
   - Replaces `workspace:*` with actual version ranges
3. **Creates PR** with title "chore: version packages"
4. **On PR merge**, if publish enabled:
   - Publishes changed packages to registry
   - Creates GitHub releases

## Manual Steps (if needed)

```bash
# Create changeset in feature branch
pnpm changeset
# Select packages, describe change, classify version

# Version packages locally (rarely needed)
pnpm version-packages

# Publish manually (emergency only)
pnpm release
```

## Implementation Checklist

- [ ] File placed at `.github/workflows/release.yml`
- [ ] `CHANGESETS_TOKEN` PAT created and added to secrets
- [ ] Test changeset created and verified
