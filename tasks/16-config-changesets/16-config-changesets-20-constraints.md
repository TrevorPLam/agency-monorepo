# 16-config-changesets: Implementation Constraints

## Purpose
Define hard boundaries and constraints for Changesets configuration to prevent configuration drift and ensure consistency across the monorepo.

## Hard Constraints

### Version Management
- **Changesets Version Lock**: All packages must use exact Changesets 3.0.0 from workspace catalog
- **No Manual Version Overrides**: Individual packages cannot override Changesets version in their own package.json
- **Catalog-Only Dependencies**: Use `catalog:changesets` reference instead of direct version specifiers

### Configuration Extensibility
- **Base Configuration Only**: Packages must extend from base configuration, never configure Changesets from scratch
- **No Extending Extends Chains**: Maximum of one level of extension (base → specific overrides)
- **Shared .changeset/config.json**: All packages must use `.changeset/config.json` filename, not project-specific names

### Version Management Constraints
- **Semantic Versioning**: Must follow semantic versioning based on conventional commits
- **Conventional Commits**: All changes must follow conventional commit format for automatic versioning
- **Changelog Generation**: Automatic changelog creation must be enabled

### Integration Requirements
- **Turborepo Integration**: Changesets must work seamlessly with Turborepo 2.9.5+
- **CI/CD Integration**: Must support automated release workflows
- **Monorepo Support**: Workspace-aware configuration and dependency updates

## Forbidden Patterns

### ❌ Never Use These
```json
{
  "changelog": false,  // Always enable changelog generation
  "commit": false,     // Always enable conventional commit checking
  "access": "public"   // Use restricted access for internal packages
}
```

### ❌ Avoid These Anti-Patterns
- **Multiple .changeset/config.json files**: Don't create `.changeset/dev.config.json`, `.changeset/prod.config.json` - use single `.changeset/config.json`
- **Per-package changeset configs**: Don't extend from other packages, only from `@agency/config-changesets`
- **Manual Versioning**: Never manually bump package.json versions, use Changesets
- **Ignoring Changesets Errors**: Never use `// @changesets-ignore` without filing a Changesets issue or ADR

## Compliance Requirements

### Version Management
- **Semantic Versioning**: Must follow semantic versioning (major.minor.patch)
- **Conventional Commits**: All commits must follow conventional commit format
- **Changelog Generation**: Automatic changelog creation for all releases
- **Release Automation**: Full automation of version bumping and publishing

### Integration Requirements
- **Turborepo Integration**: Changesets must work with Turborepo tasks and caching
- **CI/CD Integration**: Must support automated release workflows
- **Monorepo Support**: Workspace-aware dependency management and updates

### Testing Requirements
- **Changesets Testing**: Use Changesets' integrated test runner
- **Version Validation**: Validate semantic versioning across all packages
- **Release Testing**: Test release workflow in staging environment

## Exit Criteria

A Changesets configuration is complete when:
1. All packages extend from catalog-based base configuration
2. Semantic versioning is automated and consistent
3. Changelog generation is working correctly
4. CI/CD integration is functional and tested
5. Documentation is comprehensive and tested
6. Performance meets or exceeds baseline measurements

## Review Process

1. **Architecture Review**: Verify configuration follows ARCHITECTURE.md dependency flow rules
2. **Version Audit**: Confirm all packages use catalog Changesets 3.0.0
3. **Performance Testing**: Validate Changesets' automation benefits
4. **Integration Validation**: Test Turborepo and CI/CD integration in complex scenarios
5. **Security Review**: Ensure no security vulnerabilities in Changesets configuration

## Consequences

This decision enables significant automation improvements while maintaining strict version management and release quality standards. The migration path allows gradual adoption while preserving existing manual versioning during transition.
