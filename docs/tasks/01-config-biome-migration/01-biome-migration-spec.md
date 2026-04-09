# 01-config-biome-migration: Implementation Specification

## Task Header

| Field | Value |
|-------|-------|
| **State** | `deferred` — Evaluation pending Task 14 completion |
| **Trigger** | Task 14 (14-config-biome) evaluation complete AND ADR recorded |
| **Minimum Consumers** | n/a (transitional package) |
| **Dependencies** | `@agency/config-eslint` (source), Biome toolchain |
| **Exit Criteria** | Migration guide validated, rule mapping complete |
| **Implementation Authority** | `REPO-STATE.md` — Conditional; requires explicit human approval |
| **Version Authority** | `DEPENDENCY.md` — Biome version TBD during evaluation |
| **Supersedes** | `@agency/config-eslint` (if migration proceeds) |
| **Superseded by** | n/a |

**Cross-references:**
- Decision status: `DECISION-STATUS.md` — Biome evaluation `open`
- Version pins: `DEPENDENCY.md` §18 — Biome evaluation in progress
- Architecture: `ARCHITECTURE.md` — Linting configuration section

## Files
```
packages/config/biome-migration/
├── package.json
├── biome.json
├── migration-guide.md
├── rule-mapping.md
└── README.md
```

### `package.json`
```json
{
  "name": "@agency/config-biome-migration",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "exports": {
    "./biome.json": "./biome.json",
    "./migration-guide": "./migration-guide.md",
    "./rule-mapping": "./rule-mapping.md"
  },
  "files": ["biome.json", "*.md", "README.md"],
  "publishConfig": { "access": "restricted" },
  "scripts": {
    "migrate": "biome migrate eslint --write",
    "validate": "biome check",
    "test": "biome ci ."
  }
}
```

### `biome.json`
```json
{
  "linter": {
    "enabled": true,
    "rules": {
      "recommended": true,
      "complexity": {
        "noForEach": "error",
        "noStaticOnlyClass": "error",
        "noUselessSwitchCase": "error",
        "useFlatMap": "error"
      },
      "style": {
        "noNegationElse": "off",
        "useForOf": "error",
        "useNodejsImportProtocol": "error",
        "useNumberNamespace": "error"
      },
      "suspicious": {
        "noDoubleEquals": "error",
        "noThenProperty": "error",
        "useIsArray": "error"
      }
    }
  },
  "formatter": {
    "enabled": true,
    "formatWithErrors": true
  },
  "organizeImports": {
    "enabled": true
  },
  "javascript": {
    "globals": ["Global1"]
  }
}
```

### `migration-guide.md`
```markdown
# Biome Migration Guide

## Phase 1: Assessment (Week 1)

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
Compare ESLint rules vs Biome equivalents using rule mapping.

## Phase 2: Core Migration (Week 2)

### 2.1 Install Biome
```bash
pnpm add -D -w @biomejs/biome@latest
```

### 2.2 Initialize Configuration
```bash
npx @biomejs/biome init
```

### 2.3 Configure Hybrid Approach
Update `biome.json` to use Biome for:
- Formatting and core linting
- Import organization
- Basic style rules

Keep ESLint for:
- React Hooks rules
- Unicorn rules
- Custom agency plugins

## Phase 3: Package Migration (Week 3)

### 3.1 Core Packages
Migrate in this order:
1. `@agency/core-types`
2. `@agency/core-utils`
3. `@agency/core-constants`
4. `@agency/core-hooks`

### 3.2 UI Packages
Migrate in this order:
1. `@agency/ui-theme`
2. `@agency/ui-icons`
3. `@agency/ui-design-system`

## Phase 4: Application Migration (Week 4)

### 4.1 Apps Migration
Migrate applications in this order:
1. Internal tools (CRM, reporting)
2. Client-facing sites (websites, portal)

### 4.2 Validation
For each migrated package:
```bash
# Run Biome check
pnpm --filter <package-name> biome check

# Run tests
pnpm --filter <package-name> test

# Compare with ESLint results
pnpm --filter <package-name> eslint-config lint
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

## Success Metrics

Track these metrics:
- Linting performance (before/after)
- CI/CD pipeline time reduction
- Developer satisfaction survey
- Bug count reduction

## Troubleshooting

### Common Issues
- **Rule mapping gaps**: Document workarounds for missing ESLint rules
- **Plugin conflicts**: Disable conflicting rules during transition
- **Team adoption**: Provide 1-1 support during migration
```

### `rule-mapping.md`
```markdown
# ESLint to Biome Rule Mapping

## Core Rules
| ESLint Rule | Biome Equivalent | Notes |
|-------------|------------------|-------|
| no-unused-vars | noUnusedVariables | Direct mapping |
| no-console | noConsole | Direct mapping |
| prefer-const | useConst | Direct mapping |

## React Hooks Rules
| ESLint Rule | Biome Status | Notes |
|-------------|--------------|-------|
| react-hooks/rules-of-hooks | noDirectRuleMapping | Use ESLint for now |
| react-hooks/exhaustive-deps | noDirectRuleMapping | Use ESLint for now |

## Unicorn Rules
| ESLint Rule | Biome Status | Notes |
|-------------|--------------|-------|
| unicorn/no-new-array | noDirectRuleMapping | Use ESLint for now |
| unicorn/prefer-array-find | noDirectRuleMapping | Use ESLint for now |

## Custom Rules
Document agency-specific custom rules and their Biome status.
```

### `README.md`
```markdown
# @agency/config-biome-migration

Migration utilities and guidance for transitioning from ESLint + Prettier to Biome in the agency monorepo.

## Quick Start
```bash
# Install migration tools
pnpm add -D @agency/config-biome-migration

# Run migration assessment
pnpm biome-migrate migrate

# Apply to specific package
pnpm --filter @agency/core-utils biome-migrate migrate
```

## Usage

### For New Packages
Use Biome configuration directly from `@agency/config-biome` (see task 14).

### For Existing Packages
Use this migration package to gradually transition from ESLint to Biome while maintaining rule coverage.

## Migration Timeline
- **Week 1**: Assessment and setup
- **Week 2**: Core package migration
- **Week 3**: UI package migration
- **Week 4**: Application migration and cleanup

## Performance Expectations
Based on 2026 benchmarks:
- **25-56x faster** linting for large codebases
- **Near-instant** formatting feedback
- **Significant CI/CD** time reduction
```

## Verification
```bash
# Test migration package
pnpm --filter @agency/config-biome-migration test

# Validate Biome configuration
biome check

# Compare performance with ESLint
time biome ci . && time pnpm run lint
```
```
