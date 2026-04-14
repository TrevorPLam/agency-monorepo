# 20-core-types: Shared TypeScript Types and Zod Schemas

## Purpose

Define the canonical TypeScript types and Zod validation schemas for all domain models in the agency monorepo. This package sits at the base of the entire dependency graph and must remain dependency-light.

## Dependencies

- **Required**: Zod v4 for schema validation
- **Followed by**: `21-core-utils`, `22-core-constants`, `23-core-hooks`
- **Consumed by**: All packages in `packages/*` and apps in `apps/*`

## Scope

This package establishes:
- Domain model types (Client, Project, Invoice, User)
- Zod validation schemas with strict mode
- Type inference patterns for compile-time safety
- Performance benchmarks for validation operations

## Success Criteria

- [ ] All domain models have TypeScript types and Zod schemas
- [ ] Zod v4 `.strict()` mode used throughout
- [ ] Bundle size impact <50KB
- [ ] Validation performance <7ms for complex objects
- [ ] 100% TypeScript coverage

## Exit Criteria

Package published to workspace with:
- Validated exports
- Type checking passes
- Performance benchmarks met
- README documentation complete

## Next Steps

1. Implement `21-core-utils` — Pure utility functions
2. Implement `22-core-constants` — Enums and error codes
3. Implement `23-core-hooks` — React hooks

## Implementation Authority

`REPO-STATE.md` — Core packages approved for Milestone 1 as foundation layer
