# Agency Monorepo

A production-grade agency monorepo built with pnpm workspaces, Turborepo, and Next.js.

## Architecture

This monorepo follows a **domain-grouped package structure** with strict dependency flow:

```
config/core → data/auth/communication/ui → apps
```

- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - Complete architecture guide and decisions
- **[DEPENDENCY.md](./DEPENDENCY.md)** - Package versions and compatibility matrix
- **[tasks/README.md](./tasks/README.md)** - Implementation task index (56 tasks)

## Quick Start

```bash
# Verify environment
node -v  # v24.x.x
pnpm -v  # 10.33.0

# Install dependencies
pnpm install

# Build all packages
pnpm turbo build

# Run tests
pnpm turbo test

# Format code
pnpm format
```

## Repository Structure

```
agency-monorepo/
├── apps/                       # Deployable applications
│   ├── agency-website/        # Public marketing site
│   ├── client-sites/          # Client projects
│   └── internal-tools/        # CRM, invoicing, etc.
├── packages/                   # Shared packages (domain-grouped)
│   ├── config/                # ESLint, TypeScript, Tailwind
│   ├── core/                  # Types, utils, constants, hooks
│   ├── ui/                    # Theme, icons, design system
│   ├── data/                  # Database, CMS, API client
│   ├── auth/                  # Internal (Clerk) + Portal (Better Auth)
│   ├── communication/         # Email, notifications
│   └── testing/               # Test setup, fixtures
├── tools/                      # Generators and scripts
├── docs/                       # Documentation
│   └── AGENTS.md              # AI agent rules
└── .github/workflows/          # CI/CD
```

## Key Technologies

| Category | Stack |
|----------|-------|
| Package Manager | pnpm 10.33.0 |
| Task Runner | Turborepo 2.9.4 |
| Framework | Next.js 16.2.2 + React 19.2.4 |
| Language | TypeScript 6.0 |
| Styling | Tailwind CSS v4 |
| Database | Neon (primary) + Supabase (fallback) |
| ORM | Drizzle ORM |
| Auth | Clerk (internal) + Better Auth (portals) |
| Testing | Vitest + Playwright |

## Development

### Creating a New App

```bash
./tools/generators/new-app.sh client-site acme-corp
./tools/generators/new-app.sh internal-tool analytics-dashboard
./tools/generators/new-app.sh portal client-name
```

### Working with Packages

```bash
# Build specific package
pnpm turbo build --filter=@agency/ui-design-system

# Test specific package
pnpm --filter @agency/core-utils test

# Add dependency to package
pnpm --filter @agency/ui-design-system add zod
```

### Environment Setup

1. Copy `.env.example` to `.env.local` in each app
2. Configure database connection (`DATABASE_URL`)
3. Configure auth keys (Clerk or Better Auth)

## CI/CD

- **GitHub Actions** workflow in `.github/workflows/ci.yml`
- **Turborepo Remote Cache** enabled for speed
- **Changesets** for versioning and releases

Required secrets:
- `TURBO_TOKEN` - Vercel remote cache token
- `TURBO_TEAM` - Vercel team slug

## AI Agent Rules

See [docs/AGENTS.md](./docs/AGENTS.md) for strict rules governing AI coding agents in this repo.

**Critical rules:**
- Never import from paths not listed in `package.json` exports
- Never break dependency flow (core → data/ui/auth → apps)
- Always use `workspace:*` for internal dependencies
- Always add changeset for shared package changes

## Documentation

- [Architecture Decision Records](./tasks/08-docs/02-adrs.md)
- [Onboarding Guide](./tasks/08-docs/01-onboarding.md)
- [Package Guides](./tasks/08-docs/03-package-guides.md)

## License

Private - Agency Internal Use
