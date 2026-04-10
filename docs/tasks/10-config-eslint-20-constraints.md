# 10-config-eslint: Technical Constraints

## ESLint Version Requirements

- **ESLint**: Version 9.0.0 or higher (flat config required)
- **Node.js**: Version 18+ (for ESLint 9 performance)

## Plugin Dependencies

| Plugin | Minimum Version | Purpose |
|--------|-----------------|---------|
| `@typescript-eslint/eslint-plugin` | ^8.0.0 | TypeScript rules |
| `@typescript-eslint/parser` | ^8.0.0 | TypeScript parsing |
| `eslint-plugin-import` | ^2.31.0 | Import restriction rules |
| `eslint-config-next` | 16.2.3 | Next.js specific rules |

## Configuration Format

- **Only Flat Config**: ESLint 9+ uses `eslint.config.js` (flat config)
- **No eslintrc**: Legacy `.eslintrc.json` not supported
- **ESM Only**: Config files must use `.mjs` or `type: "module"`

## Monorepo-Specific Constraints

### Dependency Boundaries (Enforced)

- Config packages (`config/*`) cannot import from any other domain
- Core packages (`core/*`) cannot import from `ui`, `data`, `auth`, `communication`
- Data packages (`data/*`) cannot import from `ui`, `auth`
- No package may import from `apps/*`

### Import Restrictions (Enforced)

- Never import from `src/` across package boundaries
- Never use deep imports into internal files
- Always use package exports defined in `package.json`

## Performance Considerations

- **Large Monorepo**: Rules run on every file; keep config efficient
- **no-restricted-paths**: Can be slow on large codebases; use targeted `zones`
- **Type-Aware Rules**: Disable in CI if too slow; enable locally

## Forbidden Patterns

- ❌ Using ESLint 8.x or lower
- ❌ Using legacy `.eslintrc` format
- ❌ Using CommonJS `require()` in config
- ❌ Defining rules that conflict with Next.js defaults
- ❌ Creating circular dependency zones
