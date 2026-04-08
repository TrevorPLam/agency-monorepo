# 16-config-changesets: Migration Guide

## Purpose
Guide developers through migrating from manual version management to Changesets for automated semantic versioning in the agency monorepo.

## Migration Overview

This guide covers the transition from manual package.json version bumping to Changesets' automated semantic versioning and release workflow.

## Prerequisites
- Complete `@agency/config-changesets` package installation
- All packages updated to compatible versions
- pnpm workspace configured with catalog dependencies
- Conventional commit format established across repository

## Step-by-Step Migration

### Phase 1: Preparation
1. **Backup Existing Configuration**
   ```bash
   cp package.json package.json.backup
   git log --oneline -10 > version-history.txt
   ```

2. **Update Root Scripts**
   ```json
   {
     "scripts": {
       "version": "changeset version",
       "release": "changeset publish",
       "changeset": "changeset"
     }
   }
   ```

3. **Test Changesets Installation**
   ```bash
   # Test in a single package
   cd packages/core-utils && npx changeset --version=patch
   
   # Test across workspace
   pnpm changeset --version=patch
   ```

### Phase 2: Package-by-Package Migration
1. **Start with Non-Critical Packages**
   Begin with packages that have fewer dependencies and simpler versioning needs.

2. **Update Package Configuration**
   For each package:
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

3. **Remove Manual Version Management**
   ```bash
   # Remove manual version scripts
   pnpm remove version-bump
   pnpm remove conventional-changelog
   ```

4. **Validate Migration**
   ```bash
   # Create a test changeset
   pnpm changeset --version=patch
   
   # Test versioning
   pnpm changeset version
   
   # Test release
   pnpm changeset publish
   ```

### Phase 3: CI/CD Integration
1. **Update CI Configuration**
   ```yaml
   # .github/workflows/release.yml
   - name: Release
     run: |
       pnpm changeset publish
   ```

2. **Configure Automated Releases**
   ```yaml
   - name: Create Release Pull Request
     on:
       push:
         branches: [main]
     jobs:
       release:
         runs: changeset-version
   ```

## Troubleshooting

### Common Issues
- **Changesets Version Conflicts**: Ensure workspace catalog uses Changesets 3.0.0+
- **Conventional Commits**: Some commits may need to be reformatted for Changesets parsing
- **CI Integration**: GitHub Actions may need workflow updates for Changesets
- **Dependency Updates**: Changesets may not update all internal dependencies automatically

### Validation Checklist
- [ ] All packages use `@agency/config-changesets`
- [ ] Conventional commits are properly formatted
- [ ] Changesets create version bumps correctly
- [ ] Changelog generation works
- [ ] Release process is automated
- [ ] CI/CD integration functional

## Benefits
- **Automated Versioning**: Semantic versioning based on conventional commits
- **Changelog Generation**: Automatic changelog creation for all package releases
- **Release Automation**: Streamlined release process with reduced manual overhead
- **Monorepo Optimization**: Workspace-aware dependency management and updates

## Success Criteria
Migration is complete when:
1. All packages successfully use Changesets configuration
2. No manual versioning processes remain
3. Semantic versioning is automated and consistent
4. Changelog generation works correctly
5. Release process is fully automated
6. Documentation updated with Changesets examples
