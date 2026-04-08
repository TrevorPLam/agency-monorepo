# 01-config-biome-migration: QA Checklist

## Pre-Migration Verification

### Biome Installation
- [ ] Biome v2.3+ installed globally
- [ ] `@biomejs/biome migrate eslint` command available
- [ ] Migration assessment completed with dry-run
- [ ] Current ESLint rules documented

### Migration Readiness
- [ ] Team training completed (Biome fundamentals)
- [ ] Rollback procedures documented
- [ ] Success metrics defined
- [ ] Hybrid configuration examples created

## Phase 1: Assessment Verification

### Current Setup Analysis
- [ ] Plugin inventory completed
- [ ] Rule coverage gap analysis documented
- [ ] Performance baseline established
- [ ] Migration plan approved

## Phase 2: Core Migration

### Core Package Migration
For each core package:
- [ ] Backup current configuration
- [ ] Update package.json with Biome dependencies
- [ ] Run migration validation
- [ ] Compare ESLint vs Biome results
- [ ] Update ESLint config for rule conflicts

### Validation Tests
For each migrated core package:
- [ ] Biome check passes
- [ ] Tests pass
- [ ] Type checking passes
- [ ] Build succeeds

## Phase 3: UI Migration

### UI Package Migration
For each UI package:
- [ ] Backup current configuration
- [ ] Update package.json with Biome dependencies
- [ ] Run migration validation
- [ ] Visual regression testing completed
- [ ] Design system documentation updated

### Validation Tests
For each migrated UI package:
- [ ] Biome check passes
- [ ] Tests pass
- [ ] Build succeeds
- [ ] Visual output matches before/after

## Phase 4: Application Migration

### Application Migration
For each application:
- [ ] Backup current configuration
- [ ] Update package.json with Biome dependencies
- [ ] Run migration validation
- [ ] Full build test successful
- [ ] End-to-end testing passes
- [ ] Production deployment ready

## Success Criteria

- [ ] All packages use Biome for formatting and core linting
- [ ] ESLint retained only for specialized rules (React Hooks, Unicorn)
- [ ] CI/CD performance improved by 25%+
- [ ] Team training completed with 90%+ adoption
- [ ] Zero production incidents during migration
- [ ] Documentation updated with hybrid examples
- [ ] Rollback procedures tested and documented

## Sign-Off

- [ ] Migration Lead verified
- [ ] QA Engineer approved
- [ ] Team Lead trained
- [ ] Documentation reviewed

## Notes

- Migration must be gradual to minimize risk
- Performance metrics must be tracked throughout process
- Team support available during entire transition period
- Rollback procedures must be tested before migration begins
