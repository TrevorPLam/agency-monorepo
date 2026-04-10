# a2-docs-adrs: Implementation Specification

## Task Header

| Field | Value |
|-------|-------|
| **State** | `planned` — Documented target; implementation not yet authorized |
| **Trigger** | Architecture decisions require documentation |
| **Minimum Consumers** | All architecture decision records |
| **Dependencies** | None (meta documentation) |
| **Exit Criteria** | ADR structure published and used |
| **Implementation Authority** | `REPO-STATE.md` — Phase: Planning, Build status: Not started |
| **Version Authority** | `DEPENDENCY.md` — repository version-governance baseline referenced by ADRs |
| **Supersedes** | n/a |
| **Superseded by** | n/a |

**Cross-references:**
- Decision status: `DECISION-STATUS.md` — ADR process `approved`
- Location: `docs/architecture/ADRs/`
- Note: ADRs are immutable once accepted

## Files
```
docs/
└── architecture/
    └── ADRs/
        ├── 000-template.md
        ├── 001-monorepo-tooling.md
        ├── 002-package-structure.md
        ├── 003-database-orm.md
        └── 01-config-biome-migration-50-ref-quickstart.md
```

### `docs/architecture/ADRs/000-template.md`
```markdown
# ADR 000: [Title]

## Status
- Proposed / Accepted / Deprecated / Superseded by ADR-XXX

## Context
What is the issue that we're seeing that is motivating this decision or change?

## Decision
What is the change that we're proposing or have agreed to implement?

## Consequences
What becomes easier or more difficult to do because of this change?

### Positive
- 

### Negative
- 

### Neutral
- 

## Alternatives Considered
What other options were evaluated? Why were they rejected?

## References
- Links to relevant docs, discussions, external resources
```

### `docs/architecture/ADRs/001-monorepo-tooling.md`
```markdown
# ADR 001: Monorepo Tooling (pnpm + Turborepo)

## Status
Accepted

## Context
We needed to choose a monorepo tooling solution that balances:
- Developer experience (speed, reliability)
- Scalability (10 → 50+ apps)
- Migration path (can evolve to stricter governance)

## Decision
Use **pnpm workspaces** + **Turborepo** with planned migration path to **Nx** at scale.

### Rationale

**pnpm over npm/yarn:**
- Content-addressable store reduces disk usage
- Strict dependency resolution prevents phantom dependencies
- Native workspace support with `workspace:*` protocol
- Faster installs, better cache efficiency

**Turborepo over Nx (initially):**
- Minimal configuration overhead
- Built by Vercel → seamless Next.js/Vercel integration
- 96% faster builds via intelligent caching
- Remote caching works out of box with Vercel

**Nx migration path:**
- Current domain-grouped structure compatible with Nx tags
- Turborepo pipeline config maps to Nx project graph
- Migration planned at 30+ apps or multiple active teams

## Consequences

### Positive
- Fast CI via affected-only builds and remote caching
- Zero-config Vercel deployment
- Can add strict boundaries later without restructuring

### Negative
- Less built-in governance than Nx (no module boundaries yet)
- Must rely on ESLint rules + code review for import restrictions

## Alternatives Considered

**Nx from day one:**
- Rejected: Adds complexity before scale requires it
- Nx plugins and generators add learning curve
- Distributed task execution not needed at <10 apps

**npm workspaces:**
- Rejected: No content-addressable store, duplicate disk usage
- Less strict dependency resolution

**Rush:**
- Rejected: Microsoft-specific, less community adoption
- More opinionated than needed

## References
- [Turborepo docs](https://turbo.build)
- [Nx comparison](https://nx.dev/concepts/turbo-and-nx)
- ARCHITECTURE.md section on scaling plan
```

### `docs/architecture/ADRs/002-package-structure.md`
```markdown
# ADR 002: Domain-Grouped Package Structure

## Status
Accepted

## Context
Monorepos often organize packages by technical role (`components/`, `utils/`, `hooks/`). We needed a structure that:
- Communicates business intent, not just implementation
- Scales to many packages without deep nesting
- Maps cleanly to Nx boundary tags when we migrate
- Makes ownership and dependencies obvious

## Decision
Organize `packages/` by **domain** not technical role:

```
packages/
├── config/          # Shared configuration
├── core/            # Foundational runtime code
├── ui/              # Visual layer
├── data/            # Data layer (DB, CMS, API)
├── auth/            # Authentication
├── communication/   # Email, notifications
└── testing/         # Test infrastructure
```

Each domain contains related packages:
- `ui/` → `theme/`, `icons/`, `design-system/`
- `data/` → `database/`, `cms-schemas/`, `api-client/`

## Consequences

### Positive
- Domain boundaries align with team ownership
- Clear dependency flow (config → core → domain → apps)
- Compatible with Nx tag-based constraints when we migrate
- Package names communicate scope (`@agency/ui-theme`, `@agency/data-db`)

### Negative
- Some packages could fit multiple domains (e.g., auth-related types)
- Requires discipline to not create "misc" dumping ground

## Alternatives Considered

**Flat structure (all packages at root):**
- Rejected: 20+ packages become unwieldy
- No visual grouping
- Harder to enforce ownership

**Technical-role grouping:**
- Rejected: `components/`, `utils/`, `hooks/` don't communicate business purpose
- Leads to generic packages that accumulate unrelated code

## References
- ARCHITECTURE.md "Repository shape" section
- Nx documentation on tags and module boundaries
```

### `docs/architecture/ADRs/003-database-orm.md`
```markdown
# ADR 003: Database and ORM Selection

## Status
Accepted

## Context
We needed a database solution for the operational data model (clients, projects, invoices) that supports:
- Serverless deployment (Next.js on Vercel)
- Type-safe queries
- Migration management
- Client data isolation (multi-tenant)

## Decision
Use **Neon** (PostgreSQL) + **Drizzle ORM**

### Rationale

**Neon over traditional PostgreSQL:**
- True serverless PostgreSQL with connection pooling
- Database branching for development (isolated feature work)
- Pay-per-compute pricing scales from low to high traffic
- HTTP/WebSocket driver works in serverless environments

**Drizzle ORM over Prisma:**
- TypeScript-first, no code generation step at runtime
- SQL-like query API (familiar to SQL users)
- Smaller bundle size
- Native support for Neon's serverless driver
- No query engine binary (Prisma's engine causes issues in some serverless environments)

**Better Auth over Clerk for portals:**
- Self-hosted = data ownership
- Zero per-MAU cost
- Drizzle adapter native support
- Plugin system (2FA, passkeys, RBAC)

## Consequences

### Positive
- Type-safe queries without runtime overhead
- Serverless-compatible (no connection pooling issues)
- Branch-based development workflow
- Can migrate to stronger isolation (schema-per-client) if needed

### Negative
- Drizzle ecosystem smaller than Prisma's
- No built-in connection pooling (relies on Neon's pooling)
- Must manually enforce client_id scoping in queries

## Alternatives Considered

**PlanetScale (MySQL):**
- Rejected: MySQL less familiar to team
- No branching feature as mature as Neon's

**Supabase:**
- Rejected: Bundled offering, less control over schema
- Realtime features not needed for operational data

**Prisma:**
- Rejected: Query engine binary issues in some edge environments
- Runtime code generation adds latency
- Larger bundle size

**Clerk for all auth:**
- Rejected: Per-MAU pricing scales poorly for client portals
- Data leaves our infrastructure

## References
- [Neon serverless driver docs](https://neon.tech/docs/serverless/serverless-driver)
- [Drizzle ORM comparison](https://orm.drizzle.team/docs/comparison)
- ARCHITECTURE.md "Data architecture and client isolation" section
```

### `docs/architecture/ADRs/01-config-biome-migration-50-ref-quickstart.md`
```markdown
# Architecture Decision Records (ADRs)

This directory contains Architecture Decision Records for the Agency Monorepo.

## What is an ADR?

An Architecture Decision Record captures:
- An important architectural decision
- The context in which it was made
- The consequences of that decision
- Alternatives that were considered

## ADR Index

| ADR | Title | Status | Date |
|-----|-------|--------|------|
| 001 | Monorepo Tooling (pnpm + Turborepo) | Accepted | 2024-XX-XX |
| 002 | Domain-Grouped Package Structure | Accepted | 2024-XX-XX |
| 003 | Database and ORM Selection | Accepted | 2024-XX-XX |

## Creating a New ADR

1. Copy `000-template.md` to `NNN-title.md`
2. Fill in all sections
3. Update this README index
4. Submit as PR for review

## When to Write an ADR

Write an ADR when:
- Choosing between significantly different technical approaches
- Making a decision that will be hard to reverse
- Establishing patterns others must follow
- Answering "why is it built this way?" questions

Don't write an ADR for:
- Bug fixes
- Minor implementation details
- Standard patterns already documented
```


## Implementation Checklist

- [ ] Directory created at `docs/architecture/ADRs/`
- [ ] Template file created (`000-template.md`)
- [ ] Initial ADRs written (001, 002, 003)
- [ ] Index README created
- [ ] Linked from main `ARCHITECTURE.md`
