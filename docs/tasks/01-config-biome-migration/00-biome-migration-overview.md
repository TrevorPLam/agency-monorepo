# 01-config-biome-migration: Biome Migration Strategy

## Purpose
Provide comprehensive migration guidance for transitioning from ESLint + Prettier to Biome in the agency monorepo context.

## Dependencies
- **Required**: `10-config-eslint` (existing ESLint configuration)
- **Required**: `13-config-prettier` (existing Prettier configuration)
- **Consumed by**: All packages and apps during migration phase

## Scope
This task establishes:
- Hybrid ESLint + Biome migration strategy
- Step-by-step migration playbook
- Team training materials and timeline
- Rollback procedures and success metrics
- Rule mapping for common ESLint plugins

## Critical Context

### Why Hybrid Approach?
Based on 2026 research, Biome has 423 lint rules vs ESLint's 300+ rules, but gaps exist in:
- React Hooks rules (comprehensive coverage in ESLint)
- Unicorn rules (popular for code quality)
- Custom ESLint plugins (agency-specific rules)
- Complex TypeScript rules (advanced type checking)

### Migration Timeline
- **Week 1**: Assessment and setup
- **Week 2**: Core packages migration
- **Week 3**: UI packages migration  
- **Week 4**: Apps migration
- **Week 5**: Cleanup and optimization

## Success Criteria
- All packages use Biome for formatting and core linting
- ESLint retained only for specialized rules not covered by Biome
- CI/CD pipeline performance improved by 25x+
- Team training completed with 90%+ adoption rate

## Next Steps
1. Create detailed migration specification
2. Develop team training materials
3. Define rollback procedures
4. Set up success metrics and monitoring
