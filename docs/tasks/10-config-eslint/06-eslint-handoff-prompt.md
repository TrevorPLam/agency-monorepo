# 06-eslint-handoff-prompt.md

## Task Context

Implement the shared ESLint configuration package that enforces monorepo dependency boundaries and provides consistent linting rules across all packages and apps.

## Required Reading

Before starting, read:
1. `AGENTS.md` - Dependency flow rules and constraints
2. `ARCHITECTURE.md` - Package structure
3. `01-eslint-spec.md` - Detailed specification
4. `02-eslint-constraints.md` - Technical requirements
5. `03-eslint-adr-flatconfig.md` - Why flat config

## Implementation Scope

Create package at `packages/config/eslint-config/`:

### Files to Create

1. `package.json` - Package manifest with dependencies
2. `base.mjs` - Base ESLint flat config with:
   - TypeScript rules
   - Import restrictions
   - Dependency boundary enforcement
3. `next.mjs` - Next.js specific config extending base
4. `README.md` - Usage documentation

### Key Features

- Flat config format (ESLint 9+)
- `no-restricted-paths` for dependency flow
- `no-restricted-imports` for package boundaries
- TypeScript integration
- Next.js specific rules

## Constraints

- ESLint 9+ only (no legacy eslintrc support)
- ESM format only (.mjs or type: "module")
- Must enforce: config -> core -> data/auth/communication/ui -> apps
- Must prevent src/ imports across packages

## Verification Steps

1. Install package in test package:
   ```bash
   cd packages/core-utils
   pnpm add -D @agency/config-eslint
   ```

2. Create test config:
   ```javascript
   // eslint.config.mjs
   import agency from '@agency/config-eslint';
   export default [...agency];
   ```

3. Test boundary enforcement:
   - Try importing from apps (should fail)
   - Try importing from src/ (should fail)
   - Try cross-domain import (should fail)

## Acceptance Criteria

- [ ] Package created with all required files
- [ ] All dependencies listed in package.json
- [ ] base.mjs uses flat config format
- [ ] next.mjs extends base correctly
- [ ] Dependency boundaries enforced by rules
- [ ] Import restrictions prevent src/ imports
- [ ] README with clear usage examples
- [ ] Tested in at least 2 packages

## Next Tasks

After completion, proceed to:
- Task 11: TypeScript configuration
- Task 12: Tailwind CSS configuration
- Task 13: Prettier configuration

## Reference Materials

- `DEPENDENCY.md` - Technology versions
- `tasks/1.md` - Task naming conventions
- ESLint 9 Migration Guide: https://eslint.org/docs/latest/use/configure/migration-guide
