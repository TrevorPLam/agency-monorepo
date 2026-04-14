# @agency/config-eslint

ESLint flat configuration with package boundary enforcement for the agency monorepo.

## Purpose

This package provides a shared ESLint configuration that:

- Enforces the monorepo's package dependency flow: `config` -> `core` -> `ui/data/auth/communication` -> `apps`
- Prevents circular dependencies and boundary violations
- Provides TypeScript support with strict linting rules
- Uses ESLint 9+ flat config format for better performance and clarity

## Installation

```bash
pnpm add -D @agency/config-eslint
```

## Usage

Create an `eslint.config.js` file in your package root:

```javascript
import config from '@agency/config-eslint';

export default config;
```

For TypeScript projects, you can use `eslint.config.ts`:

```typescript
import config from '@agency/config-eslint';

export default config;
```

## Package Boundary Rules

This configuration enforces strict package boundaries:

### Allowed Import Directions

```text
config (bottom level)
  ^
  |
core
  ^
  |
ui, data, auth, communication
  ^
  |
apps (top level)
```

### Forbidden Imports

- **Core packages** cannot import from `ui`, `data`, `auth`, `communication` domains
- **UI packages** cannot import from `data`, `auth`, `communication` domains  
- **Data packages** cannot import from `auth`, `communication` domains
- **Auth packages** cannot import from `communication` domains
- **No packages** can import from `apps` directory
- **No cross-package** imports from internal `src/` paths
- **No relative imports** across package boundaries

### Error Messages

When a boundary rule is violated, ESLint will show clear error messages:

```text
Core packages may only import from config domain, not from higher-level domains
Packages may never import from applications - this violates package boundaries
Do not import from internal src/ paths across packages - use package exports instead
```

## TypeScript Support

This config includes:

- TypeScript parser with project resolution
- Recommended TypeScript linting rules
- Additional strictness rules:
  - `@typescript-eslint/no-unused-vars`: error
  - `@typescript-eslint/no-explicit-any`: warn
  - `@typescript-eslint/prefer-const`: error
  - `@typescript-eslint/no-var-requires`: error

## File Patterns

The configuration applies to:

- `**/*.{ts,tsx}`: TypeScript files with parser and rules
- All files: JavaScript base rules and boundary enforcement

Ignored patterns:

- `node_modules/**`
- `dist/**`, `build/**`, `.next/**`
- `.turbo/**`, `coverage/**`
- `*.config.js`, `*.config.ts`

## Dependencies

- `eslint@^9.0.0`
- `@typescript-eslint/parser@^8.0.0`
- `@typescript-eslint/eslint-plugin@^8.0.0`

## Integration with Other Tools

This config works alongside:

- **Prettier**: Use `@agency/config-prettier` for code formatting
- **TypeScript**: Use `@agency/config-typescript` for compiler configuration

## Troubleshooting

### "Could not find parser" error

Ensure TypeScript dependencies are installed in your package:

```bash
pnpm add -D typescript @typescript-eslint/parser @typescript-eslint/eslint-plugin
```

### Boundary violations in existing code

If you're migrating existing code, you may need to:

1. Move shared logic to appropriate packages
2. Use package exports instead of internal imports
3. Restructure dependencies to follow the allowed flow

### Config not being picked up

Ensure your `eslint.config.js`/`eslint.config.ts` file is in the package root and properly exports the config.

## Contributing

When modifying this configuration:

1. Test boundary rules with various import scenarios
2. Verify TypeScript parsing works correctly
3. Update this README if behavior changes
4. Consider impact on all consuming packages
