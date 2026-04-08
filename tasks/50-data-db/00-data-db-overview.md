# 50-data-db: Database Package

## Purpose
Centralized database schema, client factory, and typed query modules using Drizzle ORM. Supports dual-provider strategy: Neon (primary) and Supabase (fallback).

## Dependencies
- `@agency/core-types` — Domain type definitions
- `@agency/config-typescript` — TypeScript configuration

## Scope
This package provides:
- Drizzle schema definitions
- Database client factory (Neon + Supabase)
- Typed query modules
- Migration system
- Strict client_id scoping enforcement

## Condition Block

- **Build when:** The first internal tool needs persistent operational data storage.
- **Do not build when:** Storage needs are hypothetical.
- **Minimum consumer rule:** One internal tool is sufficient.

## Exit Criteria
- [ ] Drizzle schema defined with at least one real entity
- [ ] Database client factory works with both Neon and Supabase
- [ ] Migration system functional
- [ ] `client_id` scoping enforced in all query modules
- [ ] Used by at least one real internal tool app

## Critical Rule
Every table holding client-specific data must have a non-nullable `client_id` UUID column. Every query must include `client_id` in the WHERE clause. Data isolation is non-negotiable.

## Next Steps
1. Define schema for operational entities
2. Implement dual-provider client factory
3. Create typed query modules with client scoping
4. Set up migration workflow
