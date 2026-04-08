# 13-config-prettier: QA Checklist

## Pre-Merge Verification

### Configuration Files

- [ ] `@agency/config-prettier` package created
- [ ] `index.json` has all required configuration options
- [ ] `package.json` has correct exports: `".": "./index.json"`
- [ ] `.prettierignore` created with proper exclusions
- [ ] No package has local `.prettierrc` (all use shared config)

### Configuration Options

- [ ] `semi: false` — no semicolons (except where required)
- [ ] `singleQuote: true` — single quotes for strings
- [ ] `trailingComma: "es5"` — trailing commas where valid
- [ ] `printWidth: 100` — line length limit
- [ ] `tabWidth: 2` — two spaces per indent level
- [ ] `useTabs: false` — spaces instead of tabs
- [ ] `endOfLine: "lf"` — Unix line endings

### IDE Integration

- [ ] `.vscode/settings.json` has `editor.defaultFormatter` set to Prettier
- [ ] `.vscode/settings.json` has `editor.formatOnSave: true`
- [ ] VS Code Prettier extension installed at workspace level
- [ ] Format on save works in test file

### Root Scripts

- [ ] `package.json` has `format` script
- [ ] `package.json` has `format:check` script
- [ ] Scripts cover all file types: `*.{ts,tsx,js,jsx,json,css,md}`

## Integration Tests

### Format Command Test
```bash
pnpm format
# Should format all files without errors
```

### Format Check Test
```bash
pnpm format:check
# Should pass for already-formatted files
```

### Package Integration Test
```bash
cd packages/my-package
pnpm exec prettier --check "src/**/*.{ts,tsx}"
# Should use shared config correctly
```

### VS Code Test
1. Open any TypeScript file
2. Make formatting changes (add extra spaces, change quotes)
3. Save file
4. File should auto-format according to rules

## CI/CD Verification

- [ ] CI workflow includes `pnpm format:check` step
- [ ] CI fails when unformatted code is committed
- [ ] CI passes when all code is properly formatted

### Sample CI Configuration
```yaml
- name: Check Formatting
  run: |
    pnpm format:check
    if [ $? -ne 0 ]; then
      echo "Run 'pnpm format' locally to fix formatting"
      exit 1
    fi
```

## Cross-Platform Testing

- [ ] macOS: Format on save works
- [ ] Windows (WSL): Format on save works
- [ ] Linux: Format on save works

## Code Review Checklist

- [ ] No hard-coded formatting (Prettier handles it all)
- [ ] No `.prettierrc` in individual packages
- [ ] All team members have Prettier extension installed
- [ ] Documentation mentions format requirements

## Sign-Off

- [ ] QA Engineer verified format consistency
- [ ] CI pipeline includes format check
- [ ] Team trained on format requirements
- [ ] Documentation reviewed
- [ ] Platform Lead approved

## Notes

- Format check should be non-blocking during initial migration
- After baseline is established, enforce format check in CI
- Monitor for any edge cases where Prettier produces undesirable output
- Document any intentional deviations from standard config
