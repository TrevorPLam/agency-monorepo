# 01-config-biome-migration: Handoff Prompt

## Task Context

Implement Biome migration strategy for the agency monorepo, providing a gradual transition from ESLint + Prettier to Biome while maintaining rule coverage and minimizing risk.

## Required Reading

Before starting, read:
1. `AGENTS.md` - Architecture rules and constraints
2. `01-config-biome-migration/03-biome-migration-adr.md` - Migration strategy and rationale
3. `01-config-biome-migration/04-biome-migration-guide-migration.md` - Step-by-step migration guide
4. `01-config-biome-migration/05-biome-migration-qa-checklist.md` - Quality assurance checklist

## Implementation Scope

Create the Biome migration package with these files:

### Configuration Files
- `package.json` - Package metadata and scripts
- `biome.json` - Biome configuration with hybrid approach
- `README.md` - Usage documentation and quick start guide

### Documentation Files
- `rule-mapping.md` - ESLint to Biome rule mapping
- `migration-guide.md` - Step-by-step migration instructions

## Constraints

- Use Biome v2.3+ for latest features
- Follow hybrid migration approach from ADR
- Maintain ESLint for React Hooks and Unicorn rules
- Ensure all packages work during transition
- Complete migration within 4 weeks total

## Verification Steps

1. Install Biome migration package
2. Test migration on core package
3. Validate ESLint + Biome hybrid configuration
4. Ensure CI/CD performance improvements
5. Complete team training

## Acceptance Criteria

- [ ] Migration package created with all required files
- [ ] Hybrid configuration examples documented
- [ ] Rule mapping complete for common ESLint plugins
- [ ] Migration guide covers all phases (assessment → core → UI → apps)
- [ ] QA checklist completed and signed off
- [ ] Performance benchmarks show 25%+ improvement
- [ ] Team training materials completed

## Next Tasks

After migration completion:
- Task 14: Update Biome configuration with team training results
- Task 10: Update ESLint configuration with hybrid approach examples

## Reference Materials

- `DEPENDENCY.md` - Version constraints and governance
- `ARCHITECTURE.md` - Repository structure and technology choices
- `tasks/README.md` - Task overview and build order
