# 10-config-eslint: QA Checklist

## Package Structure

- [ ] Package created at `packages/config/eslint-config/`
- [ ] `package.json` has correct `name` and `exports`
- [ ] `base.mjs` and `next.mjs` files created
- [ ] 01-config-biome-migration-50-ref-quickstart.md with usage instructions

## Dependencies

- [ ] `@typescript-eslint/eslint-plugin` ^8.0.0
- [ ] `@typescript-eslint/parser` ^8.0.0
- [ ] `eslint-config-next` 16.2.3
- [ ] `eslint-plugin-import` ^2.31.0

## Configuration

- [ ] `base.mjs` uses flat config format
- [ ] `no-restricted-paths` zones defined correctly
- [ ] `no-restricted-imports` patterns configured
- [ ] `import/no-cycle` enabled
- [ ] `import/no-self-import` enabled
- [ ] Next.js config extends base correctly

## Dependency Boundaries

Test that these are enforced:
- [ ] `packages/core` cannot import from `packages/ui`
- [ ] `packages/config` cannot import from any other domain
- [ ] `packages/*` cannot import from `apps/*`
- [ ] Cannot import from `src/` across packages

## Integration Tests

### Test 1: Base Config Loads

```bash
cd packages/config/eslint-config
node -e "import('./base.mjs').then(m => console.log('OK'))"
# Should output: OK
```

### Test 2: Lint Command Works

```bash
cd packages/core-utils  # or any package
pnpm add -D @agency/config-eslint
# Create eslint.config.mjs
pnpm lint
# Should run without crashing
```

### Test 3: Import Restrictions Work

```bash
# Create a test file that imports from apps
echo "import foo from '../../apps/something';" > test.ts
pnpm lint
# Should report error about importing from apps
rm test.ts
```

## Verification

- [ ] ESLint 9+ installed
- [ ] Flat config files work
- [ ] Dependency boundary rules catch violations
- [ ] Next.js specific rules active
- [ ] TypeScript parsing works
- [ ] CI pipeline updated to run lint

## Sign-Off

- [ ] QA Engineer verified
- [ ] Platform Lead approved
- [ ] Tested in at least 2 packages
