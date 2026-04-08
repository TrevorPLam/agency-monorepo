# 08-docs/01-onboarding: New Contributor Onboarding (`docs/onboarding/new-contributor.md`)

## Purpose
Guide for new developers and AI agents joining the project. Covers environment setup, workflow, and where to find help.

## Files
```
docs/
└── onboarding/
    └── new-contributor.md
```

### `docs/onboarding/new-contributor.md`
```markdown
# New Contributor Onboarding

Welcome to the Agency Monorepo. This guide gets you productive quickly.

## Prerequisites

- **Node.js**: 24.x LTS (use `.nvmrc` with nvm or fnm)
  ```bash
  nvm use  # Reads .nvmrc
  ```

- **pnpm**: 10.33.0 (automatic via `packageManager` field)
  ```bash
  corepack enable  # If pnpm not installed
  pnpm -v          # Should show 10.33.0
  ```

- **Git**: Latest with signed commits configured

## Initial Setup

### 1. Clone and Install
```bash
git clone <repo-url>
cd agency-monorepo
pnpm install
```

### 2. Verify Setup
```bash
# Check workspace recognition
pnpm recursive list

# Check Turborepo works
pnpm turbo build --dry-run

# Run typecheck on all packages
pnpm typecheck
```

## Development Workflow

### Making Changes

1. **Create a branch**
   ```bash
   git checkout -b feature/my-change
   ```

2. **Make changes** following [AGENTS.md rules](../AGENTS.md)

3. **Test locally**
   ```bash
   # For package changes
   pnpm --filter @agency/package-name test
   
   # For app changes
   pnpm --filter app-name dev
   
   # Full check
   pnpm turbo build lint test typecheck
   ```

4. **Add changeset if modifying shared packages**
   ```bash
   pnpm changeset
   # Select packages, describe change, classify as patch/minor/major
   ```

5. **Commit** (signed commits preferred)
   ```bash
   git commit -m "feat(core-types): add ProjectStatus enum"
   ```

### Working with Specific Packages

```bash
# Install dependency in a package
pnpm --filter @agency/core-utils add zod

# Run tests for specific package
pnpm --filter @agency/core-utils test

# Build specific package and dependents
pnpm turbo build --filter=@agency/core-utils...
```

## Monorepo Structure

```
├── apps/                    # Deployable applications
│   ├── agency-website/     # Marketing site
│   ├── client-sites/       # Client projects (isolated)
│   └── internal-tools/     # CRM, invoicing, etc.
├── packages/               # Shared code (internal packages)
│   ├── config/            # ESLint, TypeScript, Tailwind configs
│   ├── core/              # Types, utils, constants, hooks
│   ├── ui/                # Theme, icons, design system
│   ├── data/              # Database, CMS schemas, API client
│   ├── auth/              # Internal (Clerk) + Portal (Better Auth)
│   ├── communication/     # Email, notifications
│   └── testing/           # Test setup, fixtures
├── tools/                 # Generators, scripts, codemods
└── docs/                  # Documentation, ADRs, onboarding
```

### Package Naming Convention

- Config: `@agency/config-eslint`, `@agency/config-typescript`
- Core: `@agency/core-types`, `@agency/core-utils`
- UI: `@agency/ui-theme`, `@agency/ui-design-system`
- Data: `@agency/data-db`, `@agency/data-cms`
- Auth: `@agency/auth-internal`, `@agency/auth-portal`

### Dependency Flow (Critical)

```
config/core → data/auth/communication/ui → apps
```

**Rules:**
- `core/` cannot import from `ui/`, `data/`, `auth/`, `communication/`
- `data/` can import from `core/` but not from `ui/` or `auth/`
- Apps can import from any package
- **No package may ever import from an app**

## Key Documentation

| Document | Purpose |
|----------|---------|
| [AGENTS.md](../AGENTS.md) | **Required reading** - Rules for AI agents and developers |
| [ARCHITECTURE.md](../../ARCHITECTURE.md) | Full architecture documentation |
| [DEPENDENCY.md](../../DEPENDENCY.md) | Dependency versions and rationale |
| Package READMEs | Each package has its own README.md |

## Common Commands

```bash
# Development
pnpm dev              # Start all dev servers
pnpm dev --filter=crm # Start specific app

# Building
pnpm build            # Build all packages and apps
pnpm build --filter=@agency/core-types...

# Testing
pnpm test             # Run all tests
pnpm test --filter=@agency/ui-design-system

# Linting
pnpm lint             # Lint all packages
pnpm lint --filter=@agency/core-utils

# Type checking
pnpm typecheck        # TypeScript check all

# Changesets
pnpm changeset        # Create changeset
pnpm version-packages # Bump versions
pnpm release          # Publish (maintainers only)
```

## Environment Variables

Copy `.env.example` to `.env.local` in apps that need them:

```bash
cd apps/internal-tools/crm
cp .env.example .env.local
```

**Never commit `.env.local` or any file with secrets.**

Required env vars by app type:
- **Internal tools**: `DATABASE_URL`, Clerk keys
- **Client portals**: `DATABASE_URL`, Better Auth secrets
- **All apps**: `NEXT_PUBLIC_APP_URL`

## Getting Help

1. **Check package README** - Every package has usage docs
2. **Review AGENTS.md** - Rules for working in this repo
3. **Check CODEOWNERS** - Tag relevant owners for review
4. **Run diagnostics**
   ```bash
   pnpm recursive list        # Verify workspace
   pnpm turbo build --dry-run # See what would build
   ```

## Troubleshooting

### "Cannot find module '@agency/xxx'"
- Run `pnpm install` to refresh workspace links
- Check the package has correct `name` in `package.json`
- Verify import path matches `exports` field

### Tests fail after package changes
- Run `pnpm build` first (tests may depend on built artifacts)
- Check if dependent packages need updates

### TypeScript errors in unrelated packages
- Ensure you haven't created a circular dependency
- Check that you're following the dependency flow rules

## First Tasks for New Contributors

Good starter tasks to learn the codebase:

1. **Add a utility to `@agency/core-utils`**
2. **Add a component story to design system**
3. **Fix a test in an existing package**
4. **Update documentation** (this file, package READMEs)

## Code Review Process

1. **Self-review** against AGENTS.md rules
2. **Automated checks** must pass (CI runs build, lint, test, typecheck)
3. **CODEOWNERS review** for affected packages
4. **Changeset review** for shared package changes

## Questions?

- **Architecture questions**: Check ARCHITECTURE.md
- **Workflow questions**: Check AGENTS.md
- **Package questions**: Check package README.md
- **Still stuck**: Tag platform team in PR description

---

Welcome aboard. Keep the dependency rules, and the dependency rules will keep you.
```

## Implementation Checklist

- [ ] File placed at `docs/onboarding/new-contributor.md`
- [ ] Links to `docs/AGENTS.md` verified
- [ ] Links to root docs (`ARCHITECTURE.md`, `DEPENDENCY.md`) verified
- [ ] Common commands tested
- [ ] Troubleshooting section validated
