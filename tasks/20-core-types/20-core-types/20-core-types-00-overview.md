# 20-core-types: Domain Types & Zod Schemas

## Purpose
Shared TypeScript types and Zod schemas for domain models used across apps — client records, project statuses, invoice states, user roles.

## Dependencies
- `@agency/config-typescript` — TypeScript configuration

## Scope
This package provides:
- Canonical domain type definitions
- Zod schemas for runtime validation
- Type inference from schemas
- No dependencies on React, database, or UI

## Position in Dependency Flow
Base of the entire dependency graph. Must stay dependency-light.

## Next Steps
1. Define core domain entities (Client, Project, Invoice, User)
2. Create Zod schemas for each entity
3. Export types for use in all other packages
