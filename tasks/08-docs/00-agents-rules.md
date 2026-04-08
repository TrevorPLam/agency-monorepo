# 08-docs/00-agents-rules: AI Agent Rules (`docs/AGENTS.md`)

## Purpose
Explicit, unambiguous rules for AI coding agents (Cursor, Windsurf, Claude) working in this monorepo. These rules override default agent behavior.

## Files
```
docs/
└── AGENTS.md
```

### `docs/AGENTS.md`
```markdown
# AI Agent Rules for Agency Monorepo

These rules are **hard constraints**, not suggestions. Violating them creates technical debt silently.

## Reading Requirements Before Touching Any Shared Package

1. **Read the package's `README.md`** - Understand its purpose and consumers
2. **Read the package's `CHANGELOG.md`** - Understand recent changes and patterns
3. **Read the package's `package.json` exports field** - Understand the public API surface
4. **Read `CODEOWNERS`** - Know who must review changes

Never import from a path not listed in `exports`. Never import from `src/` directly.

## Change Rules (Non-Negotiable)

### API Changes
- **Never rename, remove, or change the signature** of an existing exported function, component, type, or constant without:
  - Creating a changeset entry classified as `major`
  - Documenting the migration path in the changeset description
  - Marking old exports with `@deprecated` JSDoc comment for one release cycle

### Import Rules
- **Never add a new import from a higher-level package domain**
  - `core/` packages **cannot** import from `ui/`, `data/`, `auth/`, or `communication/`
  - `data/` packages **cannot** import from `ui/` or `auth/`
  - The dependency flow is: `config/core → data/auth/communication/ui → apps`
  
- **Never introduce a circular dependency** between packages
  - If you need to import from package A inside package B, and package B is already imported by package A, **stop and explain the design problem** rather than proceeding

- **Never import from an app** into a package
  - Packages may only import from other packages, never from `apps/`

- **Always use `workspace:*`** for internal dependencies in `package.json`
  - Never use relative path imports (`../../packages/core-types`) to cross package boundaries

### Code Quality Rules
- **Always add or update tests** when modifying a shared package
  - A PR that changes behavior without updating tests should not be merged
  
- **Always use filtered commands** to avoid running unnecessary tasks:
  ```bash
  pnpm turbo build --filter=@agency/[changed-package]...
  ```
  Rather than building the entire repo to test a single package change

- **Never commit environment variables, API keys, or secrets** to any file in the repository

## High-Risk Package Treatment

Treat any change to these packages as **high risk** - they have broad blast radius:

| Package | Risk |
|---------|------|
| `packages/config/` | Broken lint rules affect every package |
| `packages/data/database/` | Schema changes affect all internal tools |
| `packages/auth/` | Broken session helpers lock out all users |
| `packages/ui/design-system/` | Component changes affect all UIs |

For these packages:
1. Run full test suite locally before committing
2. Add extra reviewers beyond CODEOWNERS
3. Consider staging deployment before production

## Client Data Isolation Rules

When working in `@agency/data-db`:

1. **Every table holding client-specific data must have a non-nullable `client_id` UUID column**
2. **Every query module must accept `client_id` as a required TypeScript parameter**
3. **It must be structurally impossible** to call a function operating on client data without specifying a client

Example of CORRECT query pattern:
```ts
// CORRECT: clientId is required
export async function getProjectById(db: DatabaseClient, clientId: string, projectId: string) {
  return db.select().from(projects).where(and(eq(projects.id, projectId), eq(projects.clientId, clientId)));
}

// WRONG: clientId optional or missing from WHERE clause
export async function getProjectById(db: DatabaseClient, projectId: string, clientId?: string) {
  // Never do this - data isolation violation
}
```

## Scaffolding Rules

When creating a new app or package:

1. **Use the generators in `tools/generators/`** rather than copying an existing directory manually
   ```bash
   pnpm generate:app my-new-app
   pnpm generate:package @agency/my-package
   ```

2. **Never copy-paste an existing app** - copied code misses half the standard wiring

## Package API Design Rules

1. **Every shared package needs an explicit `exports` field in `package.json`**
   ```json
   "exports": {
     ".": "./src/index.ts",
     "./button": "./src/components/ui/button.tsx"
   }
   ```

2. **Never use barrel exports for internal files** - each export should be intentional

3. **Always include README.md with:**
   - Package purpose
   - Consumer list (who uses this?)
   - Usage example
   - Installation instructions

## Version and Release Rules

1. **Every PR that changes a shared package must include a changeset file**
   ```bash
   pnpm changeset
   ```

2. **Version classification:**
   - **Patch**: Bug fix, performance improvement, internal refactor (no API change)
   - **Minor**: New export, component, utility (backward-compatible)
   - **Major**: Any public API change (renamed export, removed utility, changed signature)

3. **Breaking changes require:**
   - Major changeset entry
   - Migration documentation
   - Deprecated period for old API (one release cycle)

## Testing Rules

1. **Unit tests must be runnable in isolation:**
   ```bash
   pnpm --filter @agency/core-utils test
   ```

2. **Integration tests must not require external services**
   - Mock database calls
   - Mock API calls
   - Use `@agency/test-fixtures` for mock data

3. **Playwright E2E tests:**
   - Target critical user flows only
   - Run against preview deployments, not production

## Debugging Help

If you encounter:

**"Cannot find module '@agency/xxx'"**
- Check that the package has `package.json` with correct `name` field
- Run `pnpm install` to update workspace links
- Check that the consuming package has `"@agency/xxx": "workspace:*"` in dependencies

**"Module not found" for internal imports**
- Verify the path is in the package's `exports` field
- Never import from `src/` directly - use the public export path

**Circular dependency errors**
- Check dependency flow: should flow `config → core → data/ui/auth → apps`
- Use `pnpm recursive list` to see dependency tree

## Questions?

If these rules conflict with a requirement:
1. Explain the conflict
2. Propose a solution that maintains architectural integrity
3. Do not bypass rules without explicit human approval

Remember: This monorepo is designed to scale to 50+ apps. Today's shortcuts become tomorrow's blockers.
```

## Implementation Checklist

- [ ] File placed at `docs/AGENTS.md`
- [ ] Referenced in root `README.md`
- [ ] Referenced in `docs/onboarding/new-contributor.md`
- [ ] CI does not validate this file (it's documentation, not code)
