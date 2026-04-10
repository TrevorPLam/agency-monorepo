# 25-core-testing: Shared Testing Utilities

## Purpose
Shared testing utilities, mock factories, and test fixtures for the entire monorepo. Provides consistent testing patterns, performance testing helpers, and cross-package test infrastructure.

## Dependencies
- `@agency/config-typescript` — TypeScript configuration

## Scope
This package provides:
- Custom test matchers for common assertions
- Shared test fixtures and data generators
- Mock utilities for cross-package testing
- Performance testing helpers
- Integration test patterns

## Critical Rules
- Framework-agnostic testing utilities
- Zero dependencies on other `@agency/*` packages
- Tree-shakable test utilities
- SSR-compatible test patterns
- Type-safe test factories

## Position in Dependency Flow
Foundation testing utilities that can be imported by any package for testing, but has no dependencies on other shared packages.

## Next Steps
1. Implement custom test matchers
2. Create shared test fixtures and factories
3. Add performance testing helpers
4. Create integration test patterns
5. Ensure all utilities are framework-agnostic
