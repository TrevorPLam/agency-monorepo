# 01-config-biome-migration: Technical Constraints

## Migration Requirements

### Team Prerequisites
- **ESLint Experience**: Team must be proficient with ESLint 9 flat config
- **Biome Training**: Minimum 1 week dedicated training for all developers
- **Migration Timeline**: 4 weeks total (see overview.md)
- **Rollback Knowledge**: Team must understand ESLint configuration restoration

### Technical Constraints

### Version Requirements
- **Biome**: Validation pending until `DEPENDENCY.md` approves an exact evaluation pin
- **ESLint**: Keep existing v9.3+ during migration
- **Node.js**: 20.9.0+ (required for both tools)
- **pnpm**: 10.33.0 (workspace protocol compatibility)

### Migration Constraints

#### Phase 1: Assessment
- **Duration**: 1 week maximum
- **Scope**: Analysis only, no code changes
- **Deliverable**: Migration assessment report
- **Risk**: LOW (read-only analysis)

#### Phase 2: Core Migration
- **Duration**: 1 week
- **Scope**: Core packages only (types, utils, constants, hooks)
- **Risk**: MEDIUM (affects shared infrastructure)
- **Rollback**: Must be able to revert to ESLint within 24 hours

#### Phase 3: UI Migration
- **Duration**: 1 week
- **Scope**: UI packages (theme, icons, design system)
- **Risk**: MEDIUM (affects visual consistency)
- **Testing**: Visual regression testing required

#### Phase 4: Application Migration
- **Duration**: 1 week
- **Scope**: All applications (internal tools, client sites)
- **Risk**: HIGH (affects production deployments)
- **Approval**: Requires stakeholder sign-off before production

### Performance Constraints

- **CI Impact**: Migration must improve CI/CD performance by minimum 25%
- **Local Development**: Format-on-save must be near-instant
- **Memory Usage**: Biome memory usage must stay within 2x ESLint usage

### Compatibility Constraints

- **IDE Integration**: VS Code Biome extension must be workspace-compatible
- **Pre-commit Hooks**: Must integrate with existing pre-commit workflow
- **GitHub Actions**: Existing ESLint actions must continue working during transition

### Forbidden Actions

- Do not remove ESLint until Biome migration is complete
- Do not change ESLint rule configurations during migration
- Do not deploy to production with mixed linting configurations
- Do not commit partial migrations without rollback plan

### Success Criteria

- [ ] All packages use Biome for formatting and core linting
- [ ] ESLint retained only for specialized rules
- [ ] CI/CD pipeline performance improved by 25%+
- [ ] Team training completed with 90%+ adoption
- [ ] Zero production incidents related to migration
- [ ] Documentation updated with hybrid approach examples
