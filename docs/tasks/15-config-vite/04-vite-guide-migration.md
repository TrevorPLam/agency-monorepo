# 15-config-vite: Migration Guide

## Purpose
Guide developers through migrating from webpack/custom build configurations to Vite for modern development and build performance.

## Migration Overview

This guide covers the transition from legacy build tools to Vite's modern ESM-based bundling and development server.

## Prerequisites
- Complete `@agency/config-vite` package installation
- All packages updated to compatible versions
- pnpm workspace configured with catalog dependencies

## Step-by-Step Migration

### Phase 1: Preparation
1. **Backup Existing Configuration**
   ```bash
   cp webpack.config.js webpack.config.js.backup
   cp package.json package.json.backup
   ```

2. **Update Root Scripts**
   ```json
   {
     "scripts": {
       "dev": "vite",
       "build": "vite build",
       "preview": "vite preview"
     }
   }
   ```

3. **Test Vite Installation**
   ```bash
   # Test in a single package
   cd packages/core-utils && npx vite build
   
   # Test across workspace
   pnpm vite build
   ```

### Phase 2: Package-by-Package Migration
1. **Start with Non-Critical Packages**
   Begin with packages that have fewer dependencies and simpler configurations.

2. **Update Package Configuration**
   For each package:
   ```json
   {
     "devDependencies": {
       "@agency/config-vite": "workspace:*"
     },
     "scripts": {
       "dev": "vite",
       "build": "vite build"
     }
   }
   ```

3. **Remove Legacy Dependencies**
   ```bash
   pnpm remove webpack webpack-cli
   ```

4. **Validate Migration**
   ```bash
   # Run Vite build
   pnpm vite build
   
   # Verify development server
   pnpm vite dev
   ```

### Phase 3: Next.js Integration
1. **Update Next.js Configuration**
   ```json
   {
     "scripts": {
       "dev": "next dev --turbo",
       "build": "next build"
     }
   }
   ```

2. **Configure Vite for Next.js**
   ```typescript
   // vite.config.ts for Next.js
   import { defineConfig } from 'vite'
   
   export default defineConfig({
     plugins: [],
     build: {
       target: 'es2022',
       lib: ['es2022', 'dom'],
       format: 'esm'
     }
   })
   ```

## Troubleshooting

### Common Issues
- **Vite Version Conflicts**: Ensure workspace catalog uses Vite 8.0.8+
- **Legacy Plugins**: Some webpack plugins may not have Vite equivalents
- **IDE Integration**: VS Code may need extension update to recognize Vite
- **Environment Variables**: Vite uses different env var naming than webpack

### Validation Checklist
- [ ] All packages use `@agency/config-vite`
- [ ] No webpack dependencies remain
- [ ] Vite build passes without errors
- [ ] Vite dev server works correctly
- [ ] Build processes unaffected
- [ ] IDE integration functional

## Benefits
- **10x Faster Builds**: Significant performance improvement
- **Instant HMR**: Sub-100ms hot module replacement
- **Native ESM**: Modern module resolution and tree shaking
- **Plugin Ecosystem**: Rich optimization and integration options
- **Next.js 16+ Integration**: Seamless Turbopack support

## Success Criteria
Migration is complete when:
1. All packages successfully use Vite configuration
2. No functionality regressions introduced
3. Performance improvements measurable and significant
4. Developer experience maintains or improves
5. Documentation updated with Vite examples
