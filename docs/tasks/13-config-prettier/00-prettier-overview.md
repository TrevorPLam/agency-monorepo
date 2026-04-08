# 13-config-prettier: Prettier Configuration

## Purpose
Provide consistent code formatting across the monorepo with Prettier.

## Dependencies
- None (external Prettier dependency only)
- Consumed by: All packages and apps (via root format script)

## Scope
This package provides:
- Shared Prettier configuration
- Consistent formatting rules
- Integration with root `format` script

## Next Steps
1. Root package.json references this config in format script
2. IDE extensions use this configuration
3. CI enforces formatting via `format:check`
