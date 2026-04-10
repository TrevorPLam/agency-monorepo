# 16-config-changesets: ADR - Automated Version Management

## Status
**Accepted** - Adopt Changesets as the primary version management system for the agency monorepo.

## Context
All packages in the monorepo will use Changesets for automated semantic versioning, changelog generation, and release workflows.

## Decision
We will standardize on Changesets as the primary version management solution.

### Rationale
1. **Semantic Versioning**: Changesets provides automated semantic versioning based on conventional commits
2. **Changelog Automation**: Automatic changelog generation for all package releases
3. **Release Workflow**: Integrated with Turborepo and CI/CD pipelines for streamlined releases
4. **Monorepo Support**: Workspace-aware version management across all packages
5. **Developer Experience**: Simplified release process with clear change documentation

### Implementation Details
- All packages will use `@agency/config-changesets` by default
- Changesets will handle version bumping, changelog generation, and publishing
- Integration with Turborepo for build caching and task orchestration
- CI/CD integration for automated releases

## Migration Strategy
1. **Phase 1**: Changesets for all new projects, manual versioning for existing
2. **Phase 2**: Gradual migration of existing packages to Changesets-only
3. **Phase 3**: Complete manual versioning removal once migration validated

## Consequences
This decision enables significant automation improvements while maintaining strict version management and release quality standards. Long-term, this simplifies the release process and reduces manual overhead across the monorepo.
