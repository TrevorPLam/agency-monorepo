# Onboarding — Step-by-Step Setup Guide

## Purpose

Detailed walkthrough for setting up a new development environment from scratch.

---

## Pre-Flight Check

Before starting, ensure you have:
- [ ] Admin access to your workstation (can install software)
- [ ] GitHub account with SSH key or HTTPS credentials
- [ ] 30-45 minutes of uninterrupted time
- [ ] Internet connection (packages will download)

---

## Step 1: Install Node.js Version Manager

### macOS / Linux

```bash
# Install nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash

# Restart terminal or source your profile
source ~/.bashrc  # or ~/.zshrc, ~/.bash_profile

# Verify
nvm --version
```

### Windows

```powershell
# Install fnm via winget
winget install Schniz.fnm

# Or via chocolatey
choco install fnm

# Restart terminal
# Verify
fnm --version
```

---

## Step 2: Install Node.js 24.x

```bash
# Navigate to project directory (or where you'll clone)
cd ~/projects  # or wherever you keep code

# Install Node 24
nvm install 24   # macOS/Linux
fnm install 24   # Windows

# Set as default
nvm alias default 24   # macOS/Linux
fnm default 24         # Windows

# Verify
node -v  # Should show v24.x.x
```

---

## Step 3: Enable Corepack (pnpm)

```bash
# Enable Corepack (comes with Node.js 16.13+)
corepack enable

# Verify
pnpm -v  # Should show 10.33.0 (from packageManager field after cloning)
```

**Note:** If `corepack` is not found, update Node.js to 24.x which includes it by default.

---

## Step 4: Configure Git

```bash
# Set identity (required for commits)
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"

# Set default branch name
git config --global init.defaultBranch main

# Optional but recommended
git config --global push.autoSetupRemote true

# Verify
git config --list
```

---

## Step 5: Clone Repository

```bash
# Clone the monorepo
git clone git@github.com:your-org/agency-monorepo.git
# Or via HTTPS:
# git clone https://github.com/your-org/agency-monorepo.git

# Enter directory
cd agency-monorepo

# Verify Node version (should switch automatically via .nvmrc)
nvm use      # macOS/Linux
fnm use      # Windows
node -v      # Should match .nvmrc (24.x)
```

---

## Step 6: Install Dependencies

```bash
# Install all workspace dependencies
pnpm install

# This will take 2-5 minutes depending on connection
# You'll see progress for all packages in the monorepo
```

**If installation fails:**
- Check Node version: `node -v` should be 24.x
- Check pnpm version: `pnpm -v` should be 10.33.0
- Clear cache and retry: `pnpm store prune && pnpm install`

---

## Step 7: Verify Setup

### Check Workspace Recognition

```bash
# List all packages in workspace
pnpm recursive list

# Should show:
# - @agency/config-eslint
# - @agency/config-typescript
# - @agency/core-types
# - ... (all packages)
```

### Check Turborepo

```bash
# Dry run build to verify turbo works
pnpm turbo build --dry-run

# Should show task graph without errors
```

### Run Type Check

```bash
# Check TypeScript across all packages
pnpm typecheck

# Should complete with no errors
```

### Run Lint

```bash
# Check linting
pnpm lint

# Should complete with no errors
```

### Run Tests

```bash
# Run all tests
pnpm test

# Should pass (or show expected pending tests)
```

---

## Step 8: Set Up Environment Variables

```bash
# Copy example environment file
cp .env.example .env.local

# Edit .env.local with your values
# (Use your editor: code .env.local, vim .env.local, etc.)
```

**Required for all development:**
- None — basic development works without environment variables

**Required for specific features:**
- Database features: `DATABASE_URL`
- Email sending: `RESEND_API_KEY`
- Analytics: `NEXT_PUBLIC_PLAUSIBLE_DOMAIN`

---

## Step 9: Start Development Server

```bash
# Start the agency website (or any app)
pnpm --filter @agency/agency-website dev

# Or start from app directory
cd apps/agency-website
pnpm dev
```

Open http://localhost:3000 in your browser.

---

## Step 10: Verify Full Workflow

### Make a Test Change

```bash
# Edit a file in packages/core-utils
# Add a simple console.log or comment

# Save and verify HMR works
```

### Build Test

```bash
# Build the app
pnpm --filter @agency/agency-website build

# Should complete successfully
```

### Create a Branch

```bash
# Create feature branch
git checkout -b test/my-first-branch

# Make a small change
echo "# Test" >> 01-config-biome-migration-50-ref-quickstart.md

# Stage and commit
git add 01-config-biome-migration-50-ref-quickstart.md
git commit -m "test: verify my setup works"

# Push to remote
git push
```

---

## Common Issues & Solutions

### Issue: Node version not switching automatically

**Solution:**
```bash
# Manually switch to correct version
nvm use 24    # or fnm use 24

# Verify .nvmrc exists
cat .nvmrc    # Should show 24.0.0
```

### Issue: pnpm not found

**Solution:**
```bash
# Corepack not enabled
corepack enable

# Or install pnpm explicitly
npm install -g pnpm@10.33.0
```

### Issue: Port 3000 already in use

**Solution:**
```bash
# Find and kill process on port 3000
lsof -ti:3000 | xargs kill -9   # macOS/Linux

# Or use different port
pnpm dev -- -p 3001
```

### Issue: Permission denied during install

**Solution:**
```bash
# Check npm prefix (should not be /usr/local on macOS)
npm config get prefix

# Use Node version manager, not system Node
which node  # Should show nvm/fnm path, not /usr/local
```

### Issue: Turbo build fails

**Solution:**
```bash
# Clear turbo cache
rm -rf .turbo

# Clear all caches
pnpm store prune
rm -rf node_modules
rm -rf */*/node_modules
pnpm install
```

---

## IDE Setup (VS Code)

### Install Extensions

```bash
# Open VS Code quick install (or use Extensions panel)
code --install-extension dbaeumer.vscode-eslint
code --install-extension bradlc.vscode-tailwindcss
code --install-extension esbenp.prettier-vscode
```

### Recommended Settings

```json
// .vscode/settings.json (in project)
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit"
  },
  "typescript.tsdk": "node_modules/typescript/lib"
}
```

---

## Next Steps

After successful setup:

1. **Read AGENTS.md** — Understand AI agent rules
2. **Explore the monorepo** — Review ARCHITECTURE.md
3. **Find your first task** — Look for "good first issue" labels
4. **Join team channels** — Slack/Discord for questions

---

## Verification Checklist

Confirm all before claiming setup complete:

- [ ] Node.js 24.x installed and active
- [ ] pnpm 10.33.0 installed and active
- [ ] Git configured with name and email
- [ ] Repository cloned
- [ ] `pnpm install` completed without errors
- [ ] `pnpm recursive list` shows all packages
- [ ] `pnpm typecheck` passes
- [ ] `pnpm lint` passes
- [ ] `pnpm test` passes
- [ ] Dev server starts on localhost:3000
- [ ] Can make and commit changes
- [ ] Can push to remote repository

**All checked? You're ready to contribute!**

---

*Part of a1-docs-onboarding task — April 2026.*
