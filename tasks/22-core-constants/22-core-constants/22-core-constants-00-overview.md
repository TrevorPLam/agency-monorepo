# 22-core-constants: Enums & Constants

## Purpose
Shared constants: route keys, error codes, fixed enums, and configuration values. Provides type-safe constants while avoiding enum pitfalls.

## Dependencies
- `@agency/config-typescript` — TypeScript configuration

## Scope
This package provides:
- Route key constants with type safety
- Error code mappings for consistent error handling
- Fixed enums with modern TypeScript patterns
- Configuration constants that prevent "magic strings"
- Union types and const assertions where appropriate

## Critical Rules
- Use const enums for better tree-shaking and runtime performance
- Prefer union types for string literals when values are fixed
- Use object literals for grouped constants
- Never use regular enums that compile to JavaScript objects
- Provide both enum alternatives and migration guidance

## Position in Dependency Flow
Base foundation package with zero dependencies. Can be imported by any other package.

## Next Steps
1. Define route constants with proper typing
2. Create error code mappings with TypeScript types
3. Add configuration constants for common settings
4. Document enum alternatives and migration patterns
5. Ensure all constants are tree-shakable
