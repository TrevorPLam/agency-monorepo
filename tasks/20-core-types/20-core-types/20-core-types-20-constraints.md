# 20-core-types: Constraints & Boundaries

## Purpose
Technical constraints and architectural boundaries for the domain types package to ensure long-term maintainability and prevent scope creep.

## Critical Constraints

### Schema Design Rules
- **No Business Logic**: Schemas must define data shapes, not business rules or validation logic
- **Discriminated Unions**: Use `z.discriminatedUnion()` for state-like objects (Zod v4 optimized)
- **Strict Mode**: Use `.strict()` on object schemas for enhanced validation (Zod v4)
- **No Database Coupling**: Types must be database-agnostic. Never import database-specific types
- **Framework Agnostic**: Types must work across Next.js, React, and Node.js without framework-specific assumptions
- **Version Stability**: Schema changes must be backward compatible. Use `deprecated` fields for migration paths

### Dependency Constraints
- **Zero External Dependencies**: Only depends on `zod` and TypeScript configuration
- **No Circular Dependencies**: Cannot create types that depend on other packages that import this package
- **Import Direction**: Only UI, data, auth, and communication packages may import core-types

### Export Discipline
- **Explicit Public API**: Only export through `package.json` `exports` field
- **No Internal Imports**: Other packages cannot import from `src/` directly
- **Schema-First**: Always export Zod schemas first, then infer types from schemas

## Forbidden Patterns

### ❌ Business Logic in Types
```ts
// WRONG: Business validation logic
export const userSchema = z.object({
  email: z.string().email(),
  isActive: z.boolean(),
  role: z.enum(["admin", "user"])
}).refine((data) => {
  if (!data.isActive && data.role === "admin") {
    return false; // Business rule, not schema validation
  }
  return true;
});
```

### ✅ Pure Schema Definition
```ts
// CORRECT: Pure schema definition
export const userSchema = z.object({
  email: z.string().email(),
  isActive: z.boolean(),
  role: z.enum(["admin", "user"])
});

// Business logic lives in application layer
export function isAdminUser(user: User): boolean {
  return user.role === "admin" && user.isActive;
}
```

## Architectural Boundaries

### Domain Entity Scope
Core types package should only contain these domain entities:

| Entity | Belongs | Notes |
|--------|----------|-------|
| Client | Core | Base agency entity |
| Project | Core | Base agency entity |
| Invoice | Core | Base agency entity |
| User | Core | Base agency entity |
| **Session** | ❌ Core | Auth-specific, belongs in auth package |
| **Notification** | ❌ Core | Communication-specific, belongs in notifications package |
| **AnalyticsEvent** | ❌ Core | Analytics-specific, belongs in analytics package |

### Schema Evolution Rules

1. **Additive Changes Only**: Never remove required fields from existing schemas
2. **Optional Fields**: Use `.optional()` for new non-required fields
3. **Default Values**: Provide sensible defaults via `.default()`
4. **Migration Path**: Use `deprecated` with `deprecatedFields` for breaking changes

## Compliance Requirements

- **Zod Version**: Pin to `^4.0.0` (stable as of April 2026)
  - 14x faster string parsing, 7x array parsing, 6.5x object parsing
  - 2x bundle size reduction
  - Upgraded `z.discriminatedUnion()` with better performance
  - See migration guide at https://zod.dev/v4/changelog
- **TypeScript**: Use strict mode and enable all type checks
- **Testing**: All schemas must have comprehensive test coverage
- **Documentation**: Every schema change must update README examples

## Enforcement Mechanisms

### ESLint Rules
- Import boundary enforcement via `@agency/config-eslint`
- No business logic detection in lint rules
- Schema complexity limits to prevent overly complex types

### Build Verification
```bash
# Verify no business logic
pnpm --filter @agency/core-types lint --rule="no-business-logic"

# Check dependency compliance
pnpm --filter @agency/core-types build --dry-run

# Validate exports
pnpm --filter @agency/core-types build --report=exports
```

## Review Checklist

- [ ] No business rules embedded in schemas
- [ ] All domain entities are framework-agnostic
- [ ] Export structure matches package.json exports
- [ ] No circular dependencies with other packages
- [ ] Schema changes include migration path
- [ ] All changes documented in README
