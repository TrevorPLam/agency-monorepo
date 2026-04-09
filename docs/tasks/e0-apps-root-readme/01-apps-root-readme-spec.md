# e0-apps-root-readme: Implementation Specification

## Task Header

| Field | Value |
|-------|-------|
| **State** | `planned` — Documented target; implementation not yet authorized |
| **Trigger** | Repository requires root documentation |
| **Minimum Consumers** | All repository visitors |
| **Dependencies** | None (meta documentation) |
| **Exit Criteria** | Root README published and informative |
| **Implementation Authority** | `REPO-STATE.md` — Phase: Planning, Build status: Not started |
| **Version Authority** | Repository governance |
| **Superseded by** | n/a |

**Cross-references:**
- Decision status: `DECISION-STATUS.md` — Root README `approved`
- Location: Repository root `README.md`
- Note: First impression for all visitors; keep current

## Files
```
README.md
```

### `README.md`
```markdown
# Agency Monorepo

A production-grade monorepo for managing agency operations, client sites, and internal tools.

Built with **pnpm workspaces** + **Turborepo** + **Next.js**.

## Quick Start

```bash
# 1. Clone and enter
git clone <repo-url>
cd agency-monorepo

# 2. Use correct Node version (24.x)
nvm use

# 3. Install dependencies
pnpm install

# 4. Run everything
pnpm dev
```

## Documentation

| Document | Purpose |
|----------|---------|
| [ARCHITECTURE.md](ARCHITECTURE.md) | Complete architecture guide |
| [DEPENDENCY.md](DEPENDENCY.md) | Dependency versions and rationale |
| [docs/AGENTS.md](docs/AGENTS.md) | **Required reading** - AI agent rules |
| [docs/onboarding/new-contributor.md](docs/onboarding/new-contributor.md) | New developer guide |

## Repository Structure

```
├── apps/               # Deployable applications
│   ├── agency-website/ # Marketing site
│   ├── client-sites/   # Client projects (isolated)
│   └── internal-tools/ # CRM, invoicing, reporting
├── packages/           # Shared code (internal packages)
│   ├── config/        # ESLint, TypeScript, Tailwind configs
│   ├── core/          # Types, utils, constants, hooks
│   ├── ui/            # Theme, icons, design system
│   ├── data/          # Database, CMS schemas, API client
│   ├── auth/          # Internal (Clerk) + Portal (Better Auth)
│   ├── communication/ # Email, notifications
│   └── testing/       # Test setup, fixtures
├── docs/              # Documentation, ADRs
└── tools/             # Generators, scripts
```

## Common Commands

```bash
# Development
pnpm dev              # Start all apps
pnpm dev --filter=crm # Start specific app

# Building
pnpm build            # Build all packages and apps
pnpm build --filter=@agency/core-types...

# Testing
pnpm test             # Run all tests
pnpm test --filter=@agency/ui-design-system

# Linting & Type Checking
pnpm lint             # ESLint all packages
pnpm typecheck        # TypeScript check all

# Database
pnpm db:seed          # Seed dev database
pnpm db:migrate       # Run migrations

# Changesets (for releases)
pnpm changeset        # Create changeset
pnpm version-packages # Bump versions
```

## Key Technologies

| Layer | Stack |
|-------|-------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript 6.0 |
| Styling | Tailwind CSS 4.2 |
| UI | shadcn/ui |
| Database | Neon (PostgreSQL) + Drizzle ORM |
| Auth | Clerk (internal) + Better Auth (portals) |
| Email | React Email + Resend/Postmark |
| CMS | Sanity |
| Testing | Vitest + Testing Library + Playwright |
| CI/CD | GitHub Actions + Turborepo Remote Cache |

## Contributing

1. Read [docs/AGENTS.md](docs/AGENTS.md) - rules for working in this repo
2. Read [docs/onboarding/new-contributor.md](docs/onboarding/new-contributor.md) - setup guide
3. Create a branch: `git checkout -b feature/my-change`
4. Make changes following the dependency flow rules
5. Add changeset if modifying shared packages: `pnpm changeset`
6. Ensure CI passes: `pnpm turbo build lint test typecheck`
7. Submit PR - CODEOWNERS will be auto-assigned

## Dependency Flow

```
config/core → data/auth/communication/ui → apps
```

**Critical Rules:**
- `core/` cannot import from `ui/`, `data/`, `auth/`
- `data/` cannot import from `ui/`
- **No package may ever import from an app**

## Need Help?

- **Architecture questions**: See [ARCHITECTURE.md](ARCHITECTURE.md)
- **Package questions**: Check package-level README.md
- **Workflow questions**: Check [docs/AGENTS.md](docs/AGENTS.md)
- **Setup issues**: Check [docs/onboarding/new-contributor.md](docs/onboarding/new-contributor.md)

## License

Private - Agency Internal Use Only
```


## Implementation Checklist

- [ ] File placed at root `README.md`
- [ ] All internal links verified
- [ ] Badges added (optional): CI status, license
- [ ] Quick start tested by new contributor
