# 13-config-prettier: Implementation Constraints

## Purpose
Define hard boundaries and constraints for Prettier configuration to ensure consistent code formatting across the monorepo.

## Hard Constraints

### Version Management
- **Prettier Version Lock**: All packages must use exact Prettier 3.x from workspace catalog
- **No Manual Version Overrides**: Individual packages cannot override Prettier version
- **Catalog-Only Dependencies**: Use `catalog:prettier` reference instead of direct version specifiers

### Configuration Extensibility
- **Base Configuration Only**: Packages must extend from `@agency/config-prettier`, never configure from scratch
- **No Extending Extends Chains**: Maximum of one level of extension (base → optional app overrides)
- **Shared Configuration**: All packages must use `@agency/config-prettier/index.json`

### Formatting Rules
- **Single Quote**: Use `singleQuote: true` for consistency
- **No Semicolons**: Use `semi: false` (except where required by ASI rules)
- **Trailing Commas**: Use `trailingComma: "es5"` for cleaner diffs
- **Print Width**: Use `printWidth: 100` for readability
- **Tab Width**: Use `tabWidth: 2` for compact indentation

### File Coverage
- **All Source Files**: Must include `*.{ts,tsx,js,jsx,mjs,cjs}`
- **Config Files**: Must include `*.{json,yaml,yml,md}`
- **CSS Files**: Must include `*.{css,scss,less}`
- **Exclusions**: Must ignore `node_modules`, `.next`, `dist`, `build`, `.turbo`

## Forbidden Patterns

### ❌ Never Use These
```json
{
  "semi": true,
  "singleQuote": false,
  "trailingComma": "none",
  "printWidth": 120,
  "tabWidth": 4,
  "useTabs": true
}
```

### ❌ Avoid These Anti-Patterns
- **Multiple prettier configs**: Don't create `.prettierrc`, `prettier.config.js` — use single shared config
- **Per-package overrides**: Don't add package-specific Prettier rules without ADR approval
- **Editor-only formatting**: Never rely solely on editor formatting — must have CI check
- **Ignoring format errors**: Never bypass format checks in CI

## Compliance Requirements

### IDE Integration
- **VS Code**: Must use Prettier extension with workspace settings
- **Format On Save**: Enabled via `.vscode/settings.json`
- **Default Formatter**: Prettier must be set as default for all supported languages

### CI/CD Integration
- **Format Check**: Must run `prettier --check` in CI pipeline
- **Format Command**: Root `package.json` must have `format` script
- **Pre-commit Hooks**: Optional but recommended via `lint-staged`

### Integration Requirements
- **Biome Compatibility**: Prettier runs alongside Biome — Biome handles linting, Prettier handles formatting
- **ESLint**: No ESLint formatting rules (delegated to Prettier)
- **Git**: Line endings normalized via `endOfLine: "lf"`

## Exit Criteria

A Prettier configuration is complete when:
1. All packages extend from `@agency/config-prettier`
2. IDE integration works (format on save)
3. CI includes format checking
4. No forbidden patterns exist in codebase
5. All source files covered by configuration
6. Team trained on format requirements

## Review Process

1. **Configuration Review**: Verify all packages use shared config
2. **IDE Validation**: Test format on save in VS Code
3. **CI Testing**: Validate format check catches unformatted code
4. **Team Training**: Ensure developers understand format requirements

## Consequences

This decision ensures consistent code formatting across all packages while maintaining compatibility with Biome for linting. The shared configuration reduces maintenance burden and eliminates formatting debates.
