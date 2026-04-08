# 14-config-biome: Migration Guide

## Purpose
Guide developers through migrating from ESLint to Biome for linting and formatting in the agency monorepo.

## Migration Overview

This guide covers the transition from ESLint + Prettier to Biome-only configuration for performance and maintainability benefits.

## Prerequisites
- Complete `@agency/config-biome` package installation
- All packages updated to Biome 1.9.0+
- Existing ESLint configurations preserved for compatibility

## Step-by-Step Migration

### Phase 1: Preparation
1. **Backup Current Configuration**
   ```bash
   cp eslint.config.js eslint.config.js.backup
   cp package.json package.json.backup
   ```

2. **Update Root Scripts**
   ```json
   {
     "scripts": {
       "lint": "biome check .",
       "format": "biome format .",
       "lint:fix": "biome check . --apply"
     }
   }
   ```

3. **Test Biome Installation**
   ```bash
   # Test in a single package
   cd packages/core-utils && npx biome check . --apply
   
   # Test across workspace
   pnpm biome check . --apply
   ```

### Phase 2: Package-by-Package Migration
1. **Start with Non-Critical Packages**
   Begin with packages that have fewer dependencies and simpler configurations.

2. **Update Package Configuration**
   For each package:
   ```json
   {
     "devDependencies": {
       "@agency/config-biome": "workspace:*"
     },
     "scripts": {
       "lint": "biome check .",
       "format": "biome format ."
     }
   }
   ```

3. **Remove ESLint Dependencies**
   ```bash
   pnpm remove eslint @typescript-eslint/parser eslint-config-next
   ```

4. **Validate Migration**
   ```bash
   # Run Biome check
   pnpm biome check .
   
   # Verify formatting
   pnpm biome format --check .
   
   # Test build still works
   pnpm --filter @agency/core-utils build
   ```

### Phase 3: Cleanup
1. **Remove ESLint Configuration Files**
   ```bash
   rm eslint.config.js
   rm package.json.backup
   ```

2. **Update Documentation**
   Update all package README files with Biome usage examples

## Troubleshooting

### Common Issues
- **Biome Version Conflicts**: Ensure workspace catalog uses Biome 1.9.0+
- **Legacy Rules**: Some ESLint rules may not have Biome equivalents
- **IDE Integration**: VS Code may need extension update to recognize Biome

### Validation Checklist
- [ ] All packages use `@agency/config-biome`
- [ ] No ESLint dependencies remain
- [ ] Biome check passes without errors
- [ ] Biome format works correctly
- [ ] Build processes unaffected
- [ ] IDE integration functional

## Benefits
- **56x Faster Linting**: Significant performance improvement
- **Single Tool**: Unified linting and formatting
- **Reduced Complexity**: One configuration file instead of multiple
- **Modern Features**: Rust-based performance and latest JavaScript/TypeScript support

## Success Criteria
Migration is complete when:
1. All packages successfully use Biome configuration
2. No functionality regressions introduced
3. Performance improvements measurable and significant
4. Developer experience maintains or improves
5. Documentation updated with Biome examples
