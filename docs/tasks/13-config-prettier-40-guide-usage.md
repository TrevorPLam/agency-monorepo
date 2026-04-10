# 13-config-prettier: Usage Guide

## Prerequisites

1. Prettier installed via pnpm catalog
2. VS Code with Prettier extension
3. Understanding of Prettier configuration options

## Step-by-Step Setup

### 1. Install Dependencies

Add to `pnpm-workspace.yaml` catalog:
```yaml
catalog:
  prettier: ^3.5.0
```

Install in config package:
```bash
cd packages/config/prettier-config
pnpm add -D prettier@catalog:
```

### 2. Create Configuration

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
  "endOfLine": "lf",
  "overrides": [
    {
      "files": "*.json",
      "options": {
        "parser": "json"
      }
    },
    {
      "files": "*.md",
      "options": {
        "proseWrap": "always",
        "printWidth": 80
      }
    }
  ]
}
```

### 3. Configure package.json

```json
{
  "name": "@agency/config-prettier",
  "version": "0.1.0",
  "private": true,
  "main": "./index.json",
  "exports": {
    ".": "./index.json"
  },
  "files": ["index.json", "01-config-biome-migration-50-ref-quickstart.md"],
  "devDependencies": {
    "prettier": "catalog:"
  }
}
```

### 4. Configure VS Code

```json
// .vscode/settings.json
{
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.formatOnSave": true,
  "editor.formatOnPaste": true,
  "prettier.requireConfig": true,
  "prettier.configPath": "./packages/config/prettier-config/index.json"
}
```

### 5. Add Root Scripts

```json
// package.json (root)
{
  "scripts": {
    "format": "prettier --write \"**/*.{ts,tsx,js,jsx,mjs,cjs,json,yaml,yml,md,css,scss}\"",
    "format:check": "prettier --check \"**/*.{ts,tsx,js,jsx,mjs,cjs,json,yaml,yml,md,css,scss}\""
  }
}
```

### 6. Create .prettierignore

```
# Build outputs
.next/
dist/
build/
.turbo/

# Dependencies
node_modules/

# Lock files
pnpm-lock.yaml
package-lock.json
yarn.lock

# Generated files
*.generated.ts
*.generated.tsx

# Coverage
coverage/

# Misc
.DS_Store
.env*
```

## Usage in Packages

### Consuming Package Setup
```json
// packages/my-package/package.json
{
  "devDependencies": {
    "@agency/config-prettier": "workspace:*",
    "prettier": "catalog:"
  }
}
```

```json
// packages/my-package/.prettierrc
"@agency/config-prettier"
```

### Format Commands
```bash
# Format specific package
pnpm --filter @agency/my-package exec prettier --write "src/**/*.{ts,tsx}"

# Check format without writing
pnpm --filter @agency/my-package exec prettier --check "src/**/*.{ts,tsx}"
```

## Configuration Options Explained

| Option | Value | Rationale |
|--------|-------|-----------|
| `semi` | `false` | Cleaner code, ASI handles most cases |
| `singleQuote` | `true` | Consistent with JavaScript conventions |
| `trailingComma` | `"es5"` | Cleaner diffs when adding items |
| `printWidth` | `100` | Readable without excessive wrapping |
| `tabWidth` | `2` | Compact, industry standard |
| `useTabs` | `false` | Spaces for consistent rendering |
| `arrowParens` | `"avoid"` | Cleaner for single-parameter arrows |
| `endOfLine` | `"lf"` | Consistent across platforms |

## Troubleshooting

### Format On Save Not Working

**Symptom**: Saving file doesn't format code

**Solutions**:
1. Check VS Code has Prettier extension installed
2. Verify `editor.defaultFormatter` is set to Prettier
3. Ensure `editor.formatOnSave` is `true`
4. Check Prettier config file exists and is valid JSON

### Different Formatting Results

**Symptom**: Prettier formats differently on different machines

**Solutions**:
1. Ensure everyone uses same Prettier version (catalog protocol)
2. Check `.prettierrc` extends shared config
3. Verify no local overrides in VS Code user settings

### CI Format Check Failing

**Symptom**: PR fails format check in CI

**Solutions**:
```bash
# Run format locally before committing
pnpm format

# Or format specific files
pnpm prettier --write "src/**/*.{ts,tsx}"
```

## Best Practices

1. **Always format before commit**: Use format-on-save or pre-commit hooks
2. **Don't ignore format errors**: Fix them immediately, don't bypass checks
3. **Use shared config**: Never create package-specific Prettier rules
4. **Format entire files**: Don't format partial files (leads to inconsistent state)

## Integration with Git

### Pre-commit Hook (Optional)
```json
// package.json
{
  "husky": {
    "hooks": {
      "pre-commit": "lint-staged"
    }
  },
  "lint-staged": {
    "*.{ts,tsx,js,jsx,json,css,md}": "prettier --write"
  }
}
```

### CI Pipeline
```yaml
# .github/workflows/ci.yml
- name: Check Formatting
  run: pnpm format:check
```

## Next Steps

After setup is complete:
1. Run format command across entire codebase
2. Set up CI format check
3. Train team on format requirements
4. Monitor for any formatting edge cases
