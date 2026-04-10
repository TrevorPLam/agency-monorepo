# 01-config-biome-migration: Migration Guide

## Phase 1: Assessment and Setup (Week 1)

### 1.1 Current Setup Analysis
Run this command to analyze your current ESLint setup:
```bash
npx @biomejs/biome migrate eslint --dry-run
```

### 1.2 Plugin Inventory
Document all ESLint plugins in use:
- React Hooks
- Unicorn
- TypeScript ESLint
- Custom agency plugins

### 1.3 Rule Coverage Gap
Compare ESLint rules vs Biome equivalents using rule mapping from `rule-mapping.md`.

### 1.4 Install Biome
```bash
pnpm add -D -w @biomejs/biome@<validated-version-from-dependency-md>
```

### 1.5 Initialize Configuration
```bash
npx @biomejs/biome init
```

### 1.6 Configure Evaluation Approach
Update `biome.json` to use Biome for bounded comparison only:
- Formatting and core linting
- Import organization
- Basic style rules

Keep ESLint + Prettier as the canonical repo defaults during evaluation:
- React Hooks rules
- Unicorn rules
- Custom agency plugins

## Phase 2: Core Migration (Week 2)

### 2.1 Core Packages
Migrate in this order:
1. `@agency/core-types`
2. `@agency/core-utils`
3. `@agency/core-constants`
4. `@agency/core-hooks`

### 2.2 Migration Steps
For each core package:

#### Step 1: Backup Current Configuration
```bash
cp package.json package.json.backup
```

#### Step 2: Update package.json
```json
{
  "name": "@agency/core-types",
  "devDependencies": {
    "@agency/config-eslint": "workspace:*",
    "@agency/config-biome-migration": "workspace:*"
  },
  "scripts": {
    "lint": "biome check .",
    "lint:eslint": "eslint-config lint .",
    "lint:compare": "echo '=== Comparing ESLint vs Biome ===' && biome ci . && eslint-config lint ."
  }
}
```

#### Step 3: Run Migration Validation
```bash
# Test Biome configuration
pnpm --filter @agency/core-types biome check

# Compare with ESLint results
pnpm --filter @agency/core-types lint:compare
```

#### Step 4: Update ESLint Configuration
If rule gaps exist, update ESLint config to disable conflicting Biome rules:
```javascript
// eslint.config.js
import baseConfig from "@agency/config-eslint/base.mjs";

export default [
  ...baseConfig,
  {
    files: ["**/*.{js,ts,tsx}"],
    rules: {
      // Disable Biome rules that conflict with ESLint plugins
      "complexity/noStaticOnlyClass": "off",
      "suspicious/noDoubleEquals": "off"
    }
  }
];
```

### 2.3 Validation
For each migrated core package:
```bash
# Run Biome check
pnpm --filter <package-name> biome check

# Run tests
pnpm --filter <package-name> test

# Compare with ESLint results
pnpm --filter <package-name> lint:compare
```

## Phase 3: UI Migration (Week 3)

### 3.1 UI Packages
Migrate in this order:
1. `@agency/ui-theme`
2. `@agency/ui-icons`
3. `@agency/ui-design-system`

### 3.2 Visual Regression Testing
UI packages require additional testing:
```bash
# Before migration
pnpm --filter @agency/ui-theme build

# After migration
pnpm --filter @agency/ui-theme build

# Compare visual output
diff -r build_output_before/ build_output_after/
```

### 3.3 Design System Updates
Update design system to use Biome's formatting:
```json
{
  "devDependencies": {
    "@agency/config-biome-migration": "workspace:*"
  },
  "scripts": {
    "lint": "biome check .",
    "format": "biome format --write ."
  }
}
```

## Phase 4: Application Migration (Week 4)

### 4.1 Apps Migration
Migrate applications in this order:
1. Internal tools (CRM, reporting)
2. Client-facing sites (websites, portal)

### 4.2 Production Readiness
Applications require additional validation:
```bash
# Full build test
pnpm --filter <app-name> build

# Type checking
pnpm --filter <app-name> typecheck

# Linting comparison
pnpm --filter <app-name> lint:compare

# End-to-end testing
pnpm --filter <app-name> test
```

## Rollback Procedures

### Immediate Rollback
If critical issues arise:
```bash
# Restore ESLint configuration
git checkout HEAD~1  # Previous commit

# Remove Biome
pnpm remove @biomejs/biome

# Restore package.json scripts
git checkout HEAD -- package.json
```

### Gradual Rollback
If specific Biome rules cause issues:
```bash
# Disable problematic Biome rules
echo 'disabled_rules: ["complexity/noStaticOnlyClass"]' > biome-disabled.json

# Apply disabled rules
biome check --config-only biome-disabled.json .
```

## Success Metrics

Track these metrics:
- Linting performance (before/after)
- CI/CD pipeline time reduction
- Developer satisfaction survey
- Bug count reduction
- Visual regression test results

### Performance Benchmarking
```bash
# Time ESLint on large codebase
time pnpm run lint

# Time Biome on same codebase
time pnpm biome check .

# Time formatting comparison
time pnpm run format  # ESLint+Prettier vs Biome
```

## Team Training Materials

### Week 1: Biome Fundamentals
- Biome architecture and Rust performance benefits
- Rule naming conventions (camelCase vs kebab-case)
- Configuration file structure and options

### Week 2: Hands-on Migration
- Lab exercises for core package migration
- UI package migration workshop
- Troubleshooting common issues

### Week 3: Advanced Topics
- Custom rule development in Biome
- Performance optimization techniques
- Integration with existing workflows

## Troubleshooting

### Common Issues
- **Rule mapping gaps**: Document workarounds for missing ESLint rules
- **Plugin conflicts**: Disable conflicting rules during transition
- **Team adoption**: Provide 1-1 support during migration
- **Configuration conflicts**: Use biome.json overrides for package-specific needs

### Support Resources
- [Biome Documentation](https://biomejs.dev/)
- [Migration Guide](https://biomejs.dev/guides/migrate-eslint-prettier/)
- [Rule Mapping](https://biomejs.dev/linter/rules-sources)
- [Community Discord](https://discord.gg/biomejs)
