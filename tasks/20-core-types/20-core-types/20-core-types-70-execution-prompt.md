# Core Types Implementation Prompt

## Package Context
You are implementing `@agency/core-types`, the foundational type package for the entire agency monorepo. This package sits at the base of the dependency graph and must remain dependency-light while providing comprehensive domain modeling.

## Critical Constraints
- **Zero Business Logic**: Schemas define data shapes only, never business rules
- **Database Agnostic**: Types must work with any Postgres provider (Neon, Supabase, standard)
- **Framework Agnostic**: Types work across Next.js, React, and Node.js without assumptions
- **Schema-First**: Always export Zod schemas first, then infer types from schemas
- **Tree Shakable**: Structure exports for optimal bundle elimination

## Implementation Requirements

### 1. Schema Design with Discriminated Unions
Use discriminated unions for all complex domain objects (Project, Invoice, User) as defined in ADR. Follow the pattern exactly as specified in the ADR document.

### 2. Pure Validation Only
All validation logic must be pure schema validation. No business rules, no cross-field validation that requires business context.

### 3. Branded Types for Critical Values
Create branded types for IDs and other business-critical values that should never be confused with regular strings.

### 4. Error Handling Strategy
Use `.safeParse()` for all external data validation. Create standardized error types with clear paths for debugging.

### 5. Export Structure
Follow the export structure defined in the spec:
```json
{
  "exports": {
    ".": "./src/index.ts",
    "./client": "./src/client.ts",
    "./project": "./src/project.ts", 
    "./invoice": "./src/invoice.ts",
    "./user": "./src/user.ts"
  }
}
```

### 6. Dependencies
Only depend on:
- `zod` (pinned to version in DEPENDENCY.md)
- `@agency/config-typescript` (workspace:*)

### 7. Testing Requirements
- Unit tests for all schema validation scenarios
- Integration tests for schema composition
- Performance tests for schema parsing (must be <10ms for typical objects)
- Type inference verification tests

## Quality Standards
- All schemas must have comprehensive JSDoc comments
- All exports must be individually tree-shakable
- No circular dependencies allowed
- Schema changes must include migration path

## Common Pitfalls to Avoid
- Do not embed business logic in schemas
- Do not create regular enums (use const assertions with `as const`)
- Do not import from other `@agency/*` packages
- Do not use `any` without explicit justification
- Do not bypass the export structure

## Success Criteria
- [ ] All domain entities modeled with discriminated unions
- [ ] All validation uses `.safeParse()` with proper error handling
- [ ] All exports work individually for tree-shaking
- [ ] 100% test coverage for schema validation
- [ ] Comprehensive JSDoc documentation
- [ ] Zero circular dependencies
- [ ] Bundle size impact documented

Implement this package as if it will be consumed by every other package in the monorepo. Type safety here prevents runtime errors across the entire system.
