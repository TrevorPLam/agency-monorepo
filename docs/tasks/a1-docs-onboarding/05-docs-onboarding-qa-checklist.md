# Onboarding — QA Checklist

## Purpose

Verification checklist to confirm workstation setup is complete and correct.

---

## Environment Verification

### Node.js Setup

- [ ] Node.js version manager installed (nvm or fnm)
- [ ] Node.js 24.x installed
- [ ] Node.js 24.x set as default
- [ ] `node -v` shows v24.x.x
- [ ] `.nvmrc` file exists in repository root

### pnpm Setup

- [ ] Corepack enabled
- [ ] pnpm 10.33.0 active
- [ ] `pnpm -v` shows 10.33.0
- [ ] `packageManager` field in root package.json shows pnpm@10.33.0

### Git Setup

- [ ] Git installed (2.40+)
- [ ] `git config user.name` shows your name
- [ ] `git config user.email` shows your email
- [ ] `git config init.defaultBranch` shows main
- [ ] SSH key configured or HTTPS credentials set up
- [ ] Can clone from GitHub without password prompts (SSH) or with credentials (HTTPS)

---

## Repository Verification

### Clone & Install

- [ ] Repository cloned successfully
- [ ] `pnpm install` completed without errors
- [ ] `node_modules` exists in root
- [ ] `pnpm-lock.yaml` exists (do not delete)

### Workspace Recognition

- [ ] `pnpm recursive list` shows all packages
- [ ] All `@agency/*` packages listed
- [ ] No workspace errors

---

## Tool Verification

### Turborepo

- [ ] `pnpm turbo build --dry-run` shows task graph
- [ ] No turbo configuration errors
- [ ] `.turbo` directory created after first run

### TypeScript

- [ ] `pnpm typecheck` passes without errors
- [ ] No red squiggles in VS Code for TypeScript files
- [ ] `tsconfig.json` extends from @agency/config-typescript

### ESLint

- [ ] `pnpm lint` passes without errors
- [ ] `pnpm lint:fix` runs successfully
- [ ] VS Code ESLint extension shows no errors in open files
- [ ] Flat config (eslint.config.mjs) exists

### Testing

- [ ] `pnpm test` runs without crashing
- [ ] All tests pass (or known pending tests are expected)
- [ ] Can run tests for specific package: `pnpm --filter @agency/core-utils test`

---

## Development Workflow Verification

### Dev Server

- [ ] Can start dev server: `pnpm --filter @agency/agency-website dev`
- [ ] Server starts on http://localhost:3000
- [ ] Page loads without errors
- [ ] Hot Module Replacement (HMR) works on file save

### Build

- [ ] `pnpm build` completes successfully
- [ ] No build errors in any package
- [ ] `.next` or `dist` directories created

### Environment Variables

- [ ] `.env.example` exists in root
- [ ] `.env.local` created (can be empty for basic dev)
- [ ] `.env.local` is gitignored (not shown in `git status`)

---

## Git Workflow Verification

### Branching

- [ ] Can create branch: `git checkout -b test/setup-verification`
- [ ] Branch shows in `git branch`

### Committing

- [ ] Can stage files: `git add .`
- [ ] Can commit: `git commit -m "test: verify setup"`
- [ ] Commit shows correct author name and email
- [ ] Commit uses conventional commit format (optional but recommended)

### Pushing

- [ ] Can push to remote: `git push -u origin test/setup-verification`
- [ ] Branch appears on GitHub
- [ ] Can create pull request (if you have permissions)

---

## IDE Verification

### VS Code (if using)

- [ ] ESLint extension installed and enabled
- [ ] TypeScript extension working
- [ ] Tailwind CSS IntelliSense installed
- [ ] Format on save works
- [ ] Can navigate to definition (Ctrl+Click)
- [ ] Auto-import suggestions appear

### Other Editors

- [ ] TypeScript LSP configured
- [ ] ESLint integration working
- [ ] Can run commands from terminal

---

## Performance Verification

### System Resources

- [ ] `pnpm install` completed in under 5 minutes
- [ ] Dev server starts in under 10 seconds
- [ ] Build completes in under 2 minutes
- [ ] No excessive memory usage during dev

### Disk Space

- [ ] At least 5 GB free space remaining
- [ ] pnpm store is manageable: `pnpm store status`

---

## Troubleshooting Verification

If you encountered issues, verify you can:

- [ ] Clear caches: `pnpm store prune`
- [ ] Reinstall: delete node_modules, run `pnpm install`
- [ ] Reset turbo: delete `.turbo` directory
- [ ] Kill processes on occupied ports
- [ ] Switch Node versions with nvm/fnm

---

## Sign-Off

**Required confirmation before first contribution:**

> I have verified my development environment setup using this checklist. All marked items have been confirmed working. I understand the monorepo structure and can run the development workflow.

**Date:** _______________

**Name:** _______________

**GitHub Handle:** _______________

**Issues encountered (if any):**
_______________________________________________
_______________________________________________

**Resolved by:**
_______________________________________________

---

## Quick Commands Reference

```bash
# Verify Node
node -v                    # Should be 24.x

# Verify pnpm
pnpm -v                    # Should be 10.33.0

# Verify Git
git config user.name       # Should show your name
git config user.email      # Should show your email

# Verify workspace
pnpm recursive list        # Shows all packages

# Verify build
pnpm build                 # Should complete

# Verify tests
pnpm test                  # Should pass

# Verify lint
pnpm lint                  # Should pass

# Verify types
pnpm typecheck             # Should pass
```

---

*Part of a1-docs-onboarding task — April 2026.*
