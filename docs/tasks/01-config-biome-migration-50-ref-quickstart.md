# @agency/config-biome-migration

Migration utilities and guidance for transitioning from ESLint + Prettier to Biome in the agency monorepo.

## Quick Start

```bash
# Install migration tools
pnpm add -D -w @agency/config-biome-migration

# Run migration assessment
pnpm biome-migrate migrate

# Apply to specific package
pnpm --filter @agency/core-utils biome-migrate migrate
```

## Usage

### For New Packages
Use Biome configuration directly from `@agency/config-biome` (see task 14).

### For Existing Packages
Use this migration package to gradually transition from ESLint to Biome while maintaining rule coverage.

## Migration Timeline

- **Week 1**: Assessment and setup
- **Week 2**: Core package migration
- **Week 3**: UI package migration
- **Week 4**: Application migration and cleanup

## Performance Expectations

Based on 2026 benchmarks:
- **25-56x faster** linting for large codebases
- **Near-instant** formatting feedback
- **Significant CI/CD** time reduction

## Documentation

See individual files for detailed migration guidance:
- [`01-config-biome-migration-10-spec.md`](./01-config-biome-migration-10-spec.md)
- [`01-biome-migration-guide-migration.md`](./01-biome-migration-guide-migration.md)
- [`01-biome-migration-qa-checklist.md`](./01-biome-migration-qa-checklist.md)
- [`01-biome-migration-handoff-prompt.md`](./01-biome-migration-handoff-prompt.md)
