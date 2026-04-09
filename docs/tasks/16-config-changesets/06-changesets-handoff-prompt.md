# 16-config-changesets: Handoff Prompt

## Purpose
AI agent instructions for implementing Changesets configuration with automated version management for agency monorepo.

## Context
You are implementing Changesets configuration for a monorepo that uses:
- pnpm 10.33.0 with workspace catalog
- Turborepo 2.9.5 with tasks-based configuration
- Conventional commit format for semantic versioning
- CI/CD integration for automated releases

## Implementation Instructions

### Primary Goal
Create a unified Changesets configuration system that enables:
1. Automated semantic versioning based on conventional commits
2. Automatic changelog generation for all package releases
3. Streamlined release workflow with CI/CD integration
4. Workspace-aware dependency management and updates
5. Simplified developer experience for version management

### Key Requirements

#### 1. Base Configuration (`.changeset/config.json`)
- Semantic versioning enabled for automated version management
- Conventional commit checking for proper version bumping
- Changelog generation configured for clear release notes
- Release workflow automation enabled
- Workspace-aware configuration for monorepo

#### 2. Version Management
- Semantic versioning (major.minor.patch) based on conventional commits
- Automatic internal dependency updates when packages change
- Release automation with proper version bumping
- Changelog generation for all package releases

#### 3. Integration Requirements
- Turborepo integration for build caching and task orchestration
- CI/CD integration for automated releases
- Monorepo support for workspace-aware dependency management
- Developer experience optimization for streamlined releases

### Critical Implementation Details

#### Package Configuration
```json
{
  "devDependencies": {
    "@agency/config-changesets": "workspace:*"
  },
  "scripts": {
    "version": "changeset version",
    "release": "changeset publish"
  }
}
```

#### Root Integration
```json
{
  "scripts": {
    "version": "changeset version",
    "release": "changeset publish",
    "changeset": "changeset"
  }
}
```

### Performance Targets
- **Automated Versioning**: Semantic versioning based on conventional commits
- **Changelog Generation**: Automatic changelog creation for all releases
- **Release Automation**: Streamlined release process with reduced manual overhead
- **Workspace Optimization**: Dependency management and updates across monorepo

### Migration Strategy
1. **Phase 1**: Changesets for all new projects, manual versioning for existing
2. **Phase 2**: Gradual migration of existing packages to Changesets-only
3. **Phase 3**: Complete manual versioning removal once migration validated

### Quality Gates
- All Changesets commands must work without errors
- Semantic versioning must be consistent across workspace
- Changelog generation must produce clear output
- Release automation must be functional and tested

### Testing Strategy
1. Changesets workflow testing across workspace
2. Version management validation for semantic versioning
3. Changelog generation testing for all packages
4. Release workflow testing in staging environment

## Success Criteria
Implementation is complete when:
1. All packages use unified Changesets configuration from workspace catalog
2. Semantic versioning is automated and consistent
3. Changelog generation is working correctly
4. Release automation is functional and tested
5. Documentation is comprehensive and tested
6. Migration path is clear and functional

## Common Pitfalls to Avoid

- ❌ **Manual Versioning**: Don't manually bump package.json versions, use Changesets
- ❌ **Conventional Commit Violations**: Don't ignore conventional commit format requirements
- ❌ **Changelog Disabling**: Don't disable automatic changelog generation
- ❌ **Release Blocking**: Don't block automated release workflows

## Next Steps After Implementation
1. Update all shared package README files with Changesets usage examples
2. Create semantic versioning guidelines for the monorepo
3. Add Changesets-specific migration documentation
4. Update root package.json scripts for unified Changesets usage
5. Configure CI/CD integration for automated releases

Remember: Changesets provides significant automation benefits while maintaining strict version management and release quality standards. Follow the gradual migration strategy to ensure smooth transition for existing projects.
