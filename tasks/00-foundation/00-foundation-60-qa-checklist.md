# 00-foundation: QA Checklist

## Pre-Merge Verification

### File Structure

- [ ] `.gitignore` created with all required entries
- [ ] `.nvmrc` contains `24.0.0`
- [ ] `.prettierignore` excludes build outputs and lock files
- [ ] `package.json` has correct `packageManager` field
- [ ] `pnpm-workspace.yaml` includes all workspace patterns
- [ ] `turbo.json` has build, lint, test, dev pipeline tasks

### Node and Package Manager

- [ ] Node.js version is 24.x LTS (`node -v`)
- [ ] pnpm version is 10.33.0 (`pnpm -v`)
- [ ] `packageManager` field in package.json matches

### Git Configuration

- [ ] Git repository initialized
- [ ] Initial commit created
- [ ] No secrets in `.env` files committed

### pnpm Workspaces

- [ ] `pnpm recursive list` runs without errors
- [ ] Workspace directories created:
  - [ ] `apps/`
  - [ ] `packages/`
  - [ ] `tools/`

### Turborepo

- [ ] `turbo.json` is valid JSON
- [ ] `pnpm turbo build --dry-run` shows expected task graph
- [ ] Pipeline includes all standard tasks:
  - [ ] `build`
  - [ ] `lint`
  - [ ] `typecheck`
  - [ ] `test`
  - [ ] `dev`

### Catalog Configuration

- [ ] `pnpm-workspace.yaml` has `catalog` section
- [ ] Catalog includes core dependencies:
  - [ ] react
  - [ ] next
  - [ ] typescript
  - [ ] tailwindcss

## Integration Tests

### Install Test

```bash
rm -rf node_modules pnpm-lock.yaml
pnpm install
# Should complete without errors
```

### Clean Test

```bash
pnpm clean
# Should remove node_modules and .turbo
```

### Turbo Test

```bash
pnpm turbo build --dry-run
# Should output task graph without errors
```

## Sign-Off

- [ ] QA Engineer verified
- [ ] Platform Lead approved
- [ ] Documentation reviewed

## Notes

- Foundation must be stable before subsequent tasks can proceed
- Any changes here affect entire monorepo
- Test on clean machine before marking complete
