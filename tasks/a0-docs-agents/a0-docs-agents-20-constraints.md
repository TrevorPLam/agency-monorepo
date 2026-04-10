# AI Agent Rules — Hard Constraints

## Purpose

Define the absolute boundaries that AI coding agents must never cross when working in this repository. These constraints are non-negotiable architectural guardrails.

---

## Constraint Categories

### 1. Import Boundaries (CRITICAL)

**NEVER violate these import rules:**

| Violation | Why Forbidden | Safe Alternative |
|-----------|---------------|----------------|
| Import from `apps/*` into `packages/*` | Creates circular dependencies, breaks package isolation | Move shared code to appropriate package |
| Import from `src/` across package boundaries | Bypasses public API, causes breaking changes on refactors | Use package exports only |
| Import from higher domain to lower domain | Violates dependency flow (see ARCHITECTURE.md §Dependency Flow) | Restructure to respect flow direction |
| Use relative paths (`../../`) across packages | Breaks when packages move, prevents independent versioning | Use `workspace:*` + package exports |
| Import internal implementation files (files not in `exports`) | Creates hidden coupling | Request public API addition via ADR |

**Example of violation:**
```typescript
// FORBIDDEN: Direct import from internal path
import { dbClient } from '@agency/data-db/src/internal/client';

// CORRECT: Import from public API
import { db } from '@agency/data-db';
```

### 2. Package Creation Constraints

**Before creating ANY package, verify ALL of these:**

- [ ] Two or more consumers genuinely need this code
- [ ] The consumers need the SAME behavior (not similar but different)
- [ ] The package trigger condition from §14 of DEPENDENCY.md is satisfied
- [ ] The dependency flow direction is verified (lower domains may not import from higher)
- [ ] A README.md path is planned with explicit exports field
- [ ] CODEOWNERS entry is planned

**STOP and ask if:**
- Only one app needs this code
- The code is still evolving and has no stable API
- The second consumer is hypothetical

### 3. Dependency Installation Constraints

**ALWAYS verify before installing:**

- [ ] Package is listed in DEPENDENCY.md §13 (Internal Package Dependency Matrix)
- [ ] Version matches the exact pin specified
- [ ] Installing in the correct internal package (not app)
- [ ] Not a 🔒 conditional package without confirmed trigger

**Automatic stop conditions:**
- Package not in DEPENDENCY.md → STOP, update DEPENDENCY.md first
- Version mismatch → STOP, verify compatibility
- Installing dev dependency in wrong package → STOP, check ownership

### 4. Conditional Package Activation

**NEVER activate 🔒 packages without:**

1. Explicit confirmation that trigger condition is met
2. Documentation update showing the trigger is satisfied
3. ADR if the activation changes architectural decisions

**Current 🔒 packages (as of April 2026):**
- `@agency/compliance-security-headers`
- `@agency/monitoring`
- `@agency/monitoring-rum`
- `@agency/data-content-federation`
- `@agency/data-ai-enrichment`
- `@agency/notifications`
- `@agency/analytics-attribution`
- `@agency/analytics-consent-bridge`
- `@agency/experimentation`
- `@agency/experimentation-edge`
- `@agency/lead-capture` and sub-packages
- `@agency/test-fixtures`

### 5. Data Isolation Constraints

**Client data isolation is NON-NEGOTIABLE:**

- Every client-owned table MUST include `client_id` column
- Every query MUST require and enforce `client_id` filter
- NEVER make client scoping optional for convenience
- NEVER return cross-client data in shared query helpers

**Violation example:**
```typescript
// FORBIDDEN: Optional client scoping
export async function getProjects(clientId?: string) {
  // Missing clientId returns ALL projects across clients
  return db.query.projects.findMany(
    clientId ? { where: eq(projects.clientId, clientId) } : undefined
  );
}

// CORRECT: Mandatory client scoping
export async function getProjects(clientId: string) {
  if (!clientId) throw new Error('clientId is required');
  return db.query.projects.findMany(
    { where: eq(projects.clientId, clientId) }
  );
}
```

### 6. Change Management Constraints

**Version bump rules (strict)::**

| Change Type | Required | Forbidden |
|-------------|----------|-----------|
| **Patch** | Bug fixes, internal refactors, docs | No breaking changes |
| **Minor** | New exports, new optional config | No signature changes, no removals |
| **Major** | Signature changes, removals, schema changes | Cannot do without changeset + migration note |

**Major change requirements:**
1. Changeset documenting the breaking change
2. Migration note for consumers
3. Clear statement of consumer impact
4. Owner awareness and approval

**Preferred pattern for major changes:**
1. Add new API alongside old API
2. Mark old API deprecated
3. Give consumers one release cycle
4. Remove old API in subsequent major

### 7. High-Risk Area Constraints

**Extra scrutiny required for changes to:**

- `packages/config/*` — affects every package
- `packages/data/database/*` — affects every data consumer
- `packages/auth/*` — breaks session behavior across apps
- Root workspace config — affects entire repo
- CI workflows — can hide failures or block delivery
- Security headers — production security impact
- Environment management — can cause production instability

**Before modifying high-risk areas:**
1. Restate the requested scope
2. Identify all downstream consumers
3. State the blast radius
4. Propose smallest safe change
5. Get explicit approval before implementing

### 8. Secrets & Environment Constraints

**NEVER commit:**
- API keys or tokens
- Passwords or client secrets
- `.env` values
- Production credentials
- Example secrets that look real

**Required practices:**
- Use environment variable names only in documentation
- `.env.example` shows structure with placeholder values
- Never hardcode secrets in code
- Never log secrets or token values

---

## When Constraints Conflict

**Authority order when constraints conflict:**

1. Direct owner instruction in current session
2. `docs/AGENTS.md` (hard constraints)
3. Task folder documents
4. Package-local README.md
5. Package CHANGELOG.md
6. DEPENDENCY.md version pins
7. Existing code patterns

If conflict cannot be resolved using this order, STOP and ask for clarification.

---

## Enforcement

These constraints are enforced through:

- **Compile-time:** TypeScript strict mode, import boundary ESLint rules
- **Lint-time:** `no-restricted-paths` ESLint rules for dependency flow
- **CI-time:** Automated checks in GitHub Actions
- **Review-time:** CODEOWNERS assignment for high-risk areas

**Violations caught at any stage must be fixed before merge.**

---

*Part of a0-docs-agents task — created April 2026.*
