# 15-config-vite: Migration Guide

## Purpose
Guide developers through adopting Vite for an approved non-Next consumer that benefits from a Vite-based dev/build workflow.

## Migration Overview

This guide covers the transition from a legacy or custom build setup to Vite for a named non-Next package, app, or standalone tool. It does not authorize a repo-wide bundler migration or any change to the default Next.js Turbopack lane.

## Prerequisites
- A documented, approved non-Next consumer with a real Vite requirement
- `@agency/config-vite` available for that consumer
- Workspace catalog configured with the approved Vite version

## Step-by-Step Migration

### Phase 1: Preparation
1. **Confirm the Target Consumer**
  Identify the exact non-Next package, app, or tool that will adopt Vite and document why it needs it.

2. **Backup Existing Consumer Configuration**
  ```bash
  cp vite.config.ts vite.config.ts.backup
  cp package.json package.json.backup
  ```

3. **Add Consumer-Level Scripts**
  ```json
  {
    "scripts": {
     "dev": "vite",
     "build": "vite build",
     "preview": "vite preview"
    }
  }
  ```

4. **Test Vite Installation in the Target Consumer**
  ```bash
  pnpm --filter <approved-consumer> build
  pnpm --filter <approved-consumer> dev
  ```

### Phase 2: Consumer Migration
1. **Start with the Lowest-Risk Approved Consumer**
  Begin with the approved consumer that has the simplest build surface.

2. **Update Package Configuration**
  ```json
  {
    "devDependencies": {
     "@agency/config-vite": "workspace:*"
    },
    "scripts": {
     "dev": "vite",
     "build": "vite build",
     "preview": "vite preview"
    }
  }
  ```

3. **Remove Replaced Legacy Dependencies**
  ```bash
  pnpm --filter <approved-consumer> remove webpack webpack-cli
  ```

4. **Validate Migration**
  ```bash
  pnpm --filter <approved-consumer> build
  pnpm --filter <approved-consumer> dev
  ```

### Phase 3: Consumer Validation
1. **Verify Scope Boundaries**
  Confirm that only the approved non-Next consumer adopted Vite.

2. **Preserve Next.js Defaults**
  Keep standard Next.js applications on `next dev --turbo` and `next build`.

3. **Document Rollback and Follow-Up**
  Record how to revert the consumer if Vite does not provide the expected benefit.

## Troubleshooting

### Common Issues
- **Vite Version Conflicts**: Ensure the workspace catalog uses the approved Vite version
- **Legacy Plugins**: Some webpack plugins may not have direct Vite equivalents
- **IDE Integration**: VS Code may need updated tooling to recognize Vite config and scripts
- **Environment Variables**: Vite uses different env var naming than some legacy bundlers

### Validation Checklist
- [ ] The approved non-Next consumer uses `@agency/config-vite`
- [ ] No unauthorized Next.js app adopted Vite
- [ ] Replaced legacy dependencies were removed where appropriate
- [ ] Vite build passes without errors for the target consumer
- [ ] Vite dev server works correctly for the target consumer
- [ ] Other workspace build lanes are unaffected
- [ ] IDE integration is functional

## Benefits
- **Faster Builds**: Potential performance improvement for the approved consumer
- **Instant HMR**: Fast development feedback where a dev server is part of the workflow
- **Native ESM**: Modern module resolution and tree shaking
- **Plugin Ecosystem**: Useful extension points for non-Next build needs
- **Scoped Adoption**: Improved tooling for the target consumer without changing the repo default build lane

## Success Criteria
Migration is complete when:
1. The approved non-Next consumer successfully uses shared Vite configuration
2. No functionality regressions are introduced in that consumer
3. Performance improvements are measurable and significant for that consumer
4. Developer experience for that consumer maintains or improves
5. Next.js applications remain on Turbopack by default
6. Documentation is updated with consumer-specific Vite usage examples
