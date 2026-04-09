# a0-docs-agents: AI Agent Rules Specification

## Task Header

| Field | Value |
|-------|-------|
| **State** | `planned` — Documented target; implementation not yet authorized |
| **Trigger** | Monorepo requires AI agent operating rules |
| **Minimum Consumers** | All AI agents working in repository |
| **Dependencies** | None (meta documentation) |
| **Exit Criteria** | `AGENTS.md` published and enforced |
| **Implementation Authority** | `REPO-STATE.md` — Phase: Planning, Build status: Not started |
| **Version Authority** | Repository governance |
| **Supersedes** | n/a |
| **Superseded by** | n/a |

**Cross-references:**
- Decision status: `DECISION-STATUS.md` — AI agent rules `approved`
- Location: `docs/AGENTS.md`
- Note: Living document; evolves with repository needs

## File Location
`docs/AGENTS.md`

## Complete Rules Content

```markdown
# AI Agent Rules for Agency Monorepo

These rules are **hard constraints**, not suggestions.

## Reading Requirements Before Touching Any Shared Package

1. **Read the package's `README.md`** - Understand its purpose and consumers
2. **Read the package's `CHANGELOG.md`** - Understand recent changes and patterns
3. **Read the package's `package.json` exports field** - Understand the public API surface
4. **Read `CODEOWNERS`** - Know who must review changes

Never import from a path not listed in `exports`. Never import from `src/` directly.

## Change Rules (Non-Negotiable)

### API Changes
- **Never rename, remove, or change the signature** without:
  - Creating a changeset entry classified as `major`
  - Documenting the migration path
  - Marking old exports with `@deprecated` for one release cycle

### Import Rules
- **Never add a new import from a higher-level package domain**
  - `core/` packages **cannot** import from `ui/`, `data/`, `auth/`, or `communication/`
  - `data/` packages **cannot** import from `ui/` or `auth/`
  - The dependency flow is: `config/core → data/auth/communication/ui → apps`

- **Never introduce a circular dependency** - Stop and explain the design problem

- **Never import from an app** into a package

- **Always use `workspace:*`** for internal dependencies

- **Always use package exports** - Never import from `src/` or internal paths

### React Compiler Compatibility (Next.js 16+)

With React Compiler stable in Next.js 16, follow these patterns:

- **Prefer removing manual memoization** over adding `useMemo`/`useCallback`
  - React Compiler handles automatic optimization
  - Keep manual memoization only for complex custom comparisons

- **Use 'no memo' directive** when component can't be compiled:
  ```tsx
  'no memo';
  export function ProblematicComponent() { }
  ```

- **Test compilation** with `DEBUG=react-compiler` before commits

- **Add 'use memo' directive** for opt-out mode compilation:
  ```tsx
  'use memo';
  export function OptimizedComponent() { }
  ```

### Accessibility Requirements (WCAG 2.2 AA)

All UI components must meet accessibility standards:

- **All images must have alt text** - Use empty string for decorative images
- **All interactive elements must be keyboard accessible**
- **All form inputs must have associated labels**
- **Color contrast must meet 4.5:1 ratio** (3:1 for large text)
- **Focus indicators must be visible** (2px minimum thickness)

**Component patterns must include:**
- Proper ARIA roles and attributes
- Keyboard event handlers (Enter, Escape, Tab)
- Screen reader announcements for dynamic content

### MCP Server Integration

When using the monorepo MCP server (@agency/tools-mcp-server):

- **Query package context before changes** using `get_package_details` and `get_package_exports`
- **Validate changes against rules** using `validate_change` tool
- **Check dependency impact** using `find_usages` before API modifications
- **Read AGENTS.md through MCP** for rule consistency

### Code Quality Rules
- **Always add or update tests** when modifying a shared package

- **Always use filtered commands**:
  ```bash
  pnpm turbo build --filter=@agency/[changed-package]...
  ```

- **Never commit environment variables, API keys, or secrets**

## High-Risk Package Treatment

| Package | Risk |
|---------|------|
| `packages/config/` | Broken lint rules affect every package |
| `packages/data/database/` | Schema changes affect all internal tools |
| `packages/auth/` | Broken session helpers lock out all users |
| `packages/ui/design-system/` | Component changes affect all UIs |

## Client Data Isolation Rules

When working in `@agency/data-db`:

1. **Every table must have a non-nullable `client_id` UUID column**
2. **Every query module must accept `client_id` as required parameter**
3. **It must be structurally impossible** to query without specifying a client

**CORRECT:**
```ts
export async function getProjectById(db: DatabaseClient, clientId: string, projectId: string) {
  return db.select().from(projects).where(
    and(eq(projects.id, projectId), eq(projects.clientId, clientId))
  );
}
```

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
