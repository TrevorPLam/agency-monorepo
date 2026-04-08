# 13-config-prettier: Handoff Prompt

## Context
You are continuing the Prettier configuration for the agency monorepo. The base configuration is established in `@agency/config-prettier`.

## Current State
- ✅ Prettier 3.x installed via catalog
- ✅ Shared configuration in `index.json`
- ✅ VS Code settings configured for format-on-save
- ✅ Root scripts for `format` and `format:check`

## Your Task

### Immediate Next Steps

1. **Integrate with All Packages**
   - Add `@agency/config-prettier` as devDependency to all packages
   - Create `.prettierrc` in each package extending shared config
   - Remove any existing local Prettier configurations

2. **Run Initial Format**
   - Execute `pnpm format` from root
   - Commit the formatted baseline
   - This is a one-time operation to establish clean state

3. **Set Up CI Check**
   - Add `pnpm format:check` to CI pipeline
   - Configure to fail PRs with unformatted code
   - Add helpful error message suggesting `pnpm format`

### Implementation Guide

#### Package Integration
```json
// packages/my-package/package.json
{
  "devDependencies": {
    "@agency/config-prettier": "workspace:*",
    "prettier": "catalog:"
  }
}
```

```
// packages/my-package/.prettierrc
"@agency/config-prettier"
```

#### CI Pipeline Integration
```yaml
# .github/workflows/ci.yml
jobs:
  format:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v3
      - name: Check Formatting
        run: pnpm format:check
```

### Constraints & Rules

**MUST Follow:**
- All packages use `@agency/config-prettier` — no local configs
- Run format before every commit
- CI must check formatting on every PR

**MUST NOT:**
- Create package-specific `.prettierrc` files
- Use Prettier plugins without approval
- Bypass format check in CI

### Testing Requirements

Before marking complete:
1. Run `pnpm format:check` — should pass
2. Make intentional formatting error — should fail
3. Test format-on-save in VS Code
4. Verify CI catches unformatted code

### Common Pitfalls

⚠️ **Format Check Failing**: Run `pnpm format` locally to fix
⚠️ **VS Code Not Formatting**: Check extension is installed and enabled
⚠️ **Different Results**: Ensure all use same Prettier version via catalog
⚠️ **CI False Positives**: Verify `.prettierignore` excludes generated files

### Deliverables

- [ ] All packages using shared Prettier config
- [ ] Initial format run and committed
- [ ] CI includes format check
- [ ] Team documentation updated

### Questions?

If you encounter:
- **Format check fails**: Run `pnpm format` and commit changes
- **VS Code issues**: Reload window, verify extension enabled
- **Inconsistent results**: Check Prettier version matches catalog

### References

- `@/docs/tasks/13-config-prettier/01-prettier-spec.md` — Technical specification
- `@/docs/tasks/13-config-prettier/04-prettier-guide-usage.md` — Usage guide
- `@/docs/tasks/13-config-prettier/05-prettier-qa-checklist.md` — QA checklist
- `@/docs/ARCHITECTURE.md` — Monorepo architecture rules

---

**Ready to proceed**: Start with package integration, then run initial format.
