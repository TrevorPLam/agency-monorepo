# ADR: ESLint 9 Flat Config

## Status

**Accepted**

## Context

ESLint 9.0.0 introduced the flat config system as the new default. The legacy `.eslintrc` format is deprecated. We need to decide:

1. Which ESLint version to standardize on
2. Whether to support legacy config format
3. How to handle the transition period

## Decision

Use ESLint 9+ with flat config exclusively. No support for legacy `.eslintrc` format.

## Rationale

### Why ESLint 9 Flat Config

1. **Future-Proof**: ESLint 9 is the current major version; legacy support will be removed
2. **Simpler Configuration**: Single `eslint.config.js` file vs multiple `.eslintrc` files
3. **Better Performance**: Flat config is faster to load and process
4. **Native ESM Support**: Works seamlessly with ES modules
5. **Monorepo Friendly**: Easier to share configurations across packages

### Why Not Support Legacy Config

- **Maintenance Burden**: Supporting both formats doubles testing and documentation
- **Confusion**: Teams would need to know which format a project uses
- **Consistency**: Single format across entire monorepo

## Consequences

### Positive

- Simpler mental model (one config format)
- Better IDE integration with flat config
- Native support for `import` statements in config
- Can use JavaScript logic in configuration

### Negative

- Learning curve for developers familiar with `.eslintrc`
- Some third-party plugins may not support flat config yet
- CI/CD pipelines may need updates

## Migration Path

Projects with legacy `.eslintrc` files:

1. Rename to `eslint.config.js`
2. Convert to flat config array format
3. Update plugin imports to use ESM
4. Test thoroughly before committing

## Configuration Example

```javascript
// eslint.config.js
import js from '@eslint/js';
import ts from 'typescript-eslint';
import agency from '@agency/config-eslint';

export default [
  js.configs.recommended,
  ...ts.configs.recommended,
  ...agency,
];
```

## References

- [ESLint 9 Migration Guide](https://eslint.org/docs/latest/use/configure/migration-guide)
- [Flat Config Documentation](https://eslint.org/docs/latest/use/configure/configuration-files)
