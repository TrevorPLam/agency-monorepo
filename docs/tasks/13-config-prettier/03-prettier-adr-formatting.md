# ADR: Prettier as Primary Formatter

## Status
**Accepted** — Use Prettier as the primary code formatter across all packages, alongside Biome for linting.

## Context
The agency monorepo needs consistent code formatting. We need to decide:

1. Which formatter to use (Prettier, Biome, or both)
2. How to handle formatting vs linting separation
3. Whether to use Prettier for all file types or only specific ones

## Decision
Use **Prettier** for formatting all supported file types, and **Biome** for linting only. This is a hybrid approach where each tool handles its strength.

## Rationale

### Why Prettier for Formatting

1. **Mature Ecosystem**: Prettier has excellent IDE support, plugins, and community adoption
2. **Broad Language Support**: Handles TypeScript, CSS, JSON, Markdown, YAML, and more
3. **Consistent Output**: Opinionated formatting eliminates style debates
4. **Editor Integration**: Format-on-save works reliably across all editors
5. **Plugin Ecosystem**: Supports Tailwind CSS class sorting, import organization

### Why Not Biome for Formatting

- **Emerging Tool**: Biome formatting is newer, less battle-tested than Prettier
- **IDE Support**: Prettier has better VS Code extension support currently
- **Language Coverage**: Prettier supports more file types (Markdown, YAML)
- **Team Familiarity**: Most developers know Prettier already

### Hybrid Approach

- **Prettier**: Handles formatting (code style, whitespace, quotes, commas)
- **Biome**: Handles linting (code quality, best practices, potential bugs)
- **No Overlap**: Prettier rules don't conflict with Biome lint rules

## Implementation Details

### Configuration Structure
```json
// packages/config/prettier-config/index.json
{
  "semi": false,
  "singleQuote": true,
  "trailingComma": "es5",
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false,
  "bracketSpacing": true,
  "arrowParens": "avoid",
  "endOfLine": "lf"
}
```

### VS Code Settings
```json
// .vscode/settings.json
{
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.formatOnSave": true,
  "editor.formatOnPaste": true
}
```

### Root package.json Scripts
```json
{
  "scripts": {
    "format": "prettier --write \"**/*.{ts,tsx,js,jsx,json,css,md}\"",
    "format:check": "prettier --check \"**/*.{ts,tsx,js,jsx,json,css,md}\""
  }
}
```

## File Type Coverage

| File Type | Formatter | Notes |
|-----------|-----------|-------|
| `.ts`, `.tsx` | Prettier | TypeScript/TSX formatting |
| `.js`, `.jsx` | Prettier | JavaScript/JSX formatting |
| `.json` | Prettier | JSON formatting |
| `.css`, `.scss` | Prettier | CSS formatting |
| `.md`, `.mdx` | Prettier | Markdown formatting |
| `.yaml`, `.yml` | Prettier | YAML formatting |

## Integration with Other Tools

### Biome Integration
- Biome configured to **not** handle formatting
- Biome focuses on linting and code quality
- No conflicts between Prettier output and Biome rules

### ESLint Integration
- ESLint configured with `eslint-config-prettier`
- Disables ESLint rules that conflict with Prettier
- ESLint handles code quality, Prettier handles style

### Git Integration
- `endOfLine: "lf"` ensures consistent line endings
- `.gitattributes` enforces LF for cross-platform teams

## Migration Strategy

### Phase 1: Foundation (Week 1)
- Create `@agency/config-prettier` package
- Configure root Prettier settings
- Set up VS Code workspace settings

### Phase 2: Package Migration (Week 2)
- Migrate all packages to use shared config
- Run format command across codebase
- Create initial formatted baseline

### Phase 3: CI Integration (Week 3)
- Add format check to CI pipeline
- Block PRs with unformatted code
- Document format requirements

## Consequences

### Positive

- **Consistency**: All code formatted identically across monorepo
- **Developer Experience**: Format-on-save eliminates manual formatting
- **Reduced Debates**: Opinionated Prettier eliminates style discussions
- **Better Diffs**: Consistent formatting reduces merge conflicts

### Negative

- **Tool Overlap**: Two tools (Prettier + Biome) instead of one
- **Learning Curve**: Team must understand which tool does what
- **Configuration**: Must maintain both Prettier and Biome configs

## References

- [Prettier Documentation](https://prettier.io/docs/en/)
- [Biome Formatter Comparison](https://biomejs.dev/formatter/)
- [eslint-config-prettier](https://github.com/prettier/eslint-config-prettier)
