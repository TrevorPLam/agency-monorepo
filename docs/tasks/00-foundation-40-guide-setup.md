# 00-foundation: Setup Guide

## Prerequisites

1. Install Node.js 24.x LTS from [nodejs.org](https://nodejs.org)
2. Install pnpm 10.33.0:
   ```bash
   npm install -g pnpm@10.33.0
   ```

## Step-by-Step Setup

### 1. Create Root Directory Structure

```bash
mkdir agency-monorepo
cd agency-monorepo
```

### 2. Create Required Files

Copy the following files from `00-foundation-10-spec.md`:

- `.gitignore`
- `.nvmrc`
- `.prettierignore`
- `package.json`
- `pnpm-workspace.yaml`
- `turbo.json`

### 3. Initialize Git Repository

```bash
git init
git add .
git commit -m "chore: initial monorepo foundation"
```

### 4. Verify pnpm Installation

```bash
pnpm -v
# Should output: 10.33.0

node -v
# Should output: v24.x.x
```

### 5. Create Directory Structure

```bash
mkdir -p apps packages/core packages/data packages/ui packages/auth packages/communication packages/config tools
```

### 6. Install Root Dependencies

```bash
pnpm install
```

### 7. Verify Turborepo

```bash
pnpm turbo --version
# Should output Turbo version

pnpm turbo build --dry-run
# Should show planned build graph
```

### 8. Verify Workspaces

```bash
pnpm recursive list
# Should show empty workspace list (no packages yet)
```

## Next Steps

After foundation is set up, proceed with:

1. **Task 10**: ESLint configuration
2. **Task 11**: TypeScript configuration
3. **Task 12**: Tailwind CSS configuration
4. **Task 13**: Prettier configuration

## Verification Checklist

- [ ] Node.js 24.x installed
- [ ] pnpm 10.33.0 installed
- [ ] Root files created
- [ ] Git repository initialized
- [ ] pnpm install succeeds
- [ ] Turbo commands work
- [ ] Directory structure created

## Common Issues

### Issue: "pnpm: command not found"

**Solution**: Install pnpm globally:
```bash
curl -fsSL https://get.pnpm.io/install.sh | sh -
```

### Issue: "Cannot find module 'turbo'"

**Solution**: Install root dependencies:
```bash
pnpm install
```

### Issue: "Node version mismatch"

**Solution**: Use nvm to switch versions:
```bash
nvm use 24
```

## Support

- Review `AGENTS.md` for architecture rules
- Check `ARCHITECTURE.md` for monorepo philosophy
