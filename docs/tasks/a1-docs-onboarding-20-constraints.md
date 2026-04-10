# Onboarding — Environment Constraints

## Purpose

Define the hard requirements and constraints for workstation setup and development environment.

---

## Operating System Support

### Tier 1 (Fully Supported)

- **macOS** 14+ ( Sonoma / Sequoia )
- **Windows** 10/11 with WSL2 (Ubuntu 22.04 LTS recommended)
- **Linux** — Ubuntu 22.04 LTS, Fedora 40+

### Tier 2 (Community Supported)

- Other Linux distributions
- Windows without WSL2 (native PowerShell)

**Note:** Tier 2 setups may require additional troubleshooting not covered in standard onboarding.

---

## Hardware Requirements

### Minimum

- 8 GB RAM
- 4 CPU cores
- 10 GB free disk space (20 GB+ recommended for monorepo)

### Recommended

- 16 GB RAM (32 GB for working with multiple large apps)
- 8+ CPU cores
- 50 GB free disk space (SSD required)
- Broadband internet (packages download on install)

---

## Required Software Versions

These versions are **non-negotiable** — pinned for reproducibility:

| Tool | Minimum | Target | Verification |
|------|---------|--------|------------|
| Node.js | 20.9.0 | 24.x LTS | `node -v` |
| pnpm | 10.x | 10.33.0 | `pnpm -v` |
| Git | 2.40 | 2.45+ | `git --version` |

**Automatic via configuration:**
- `.nvmrc` — specifies Node version for nvm/fnm
- `packageManager` field in `package.json` — specifies pnpm version
- `engines` field — enforces minimum Node version

---

## Environment Constraints

### Node.js Version Management

**Required:** Use nvm (Linux/macOS) or fnm (cross-platform)

**Forbidden:**
- System Node.js without version manager
- nvm-windows (use fnm on Windows instead)
- Multiple Node version managers simultaneously

### Package Manager

**Required:** pnpm via Corepack

**Forbidden:**
- npm (doesn't handle workspace symlinks correctly)
- yarn (not configured for this repo)
- Global pnpm installation (use Corepack)

### Git Configuration

**Required:**
```bash
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
git config --global init.defaultBranch main
```

**Recommended:**
- GPG signing configured
- SSH keys for GitHub
- `git config --global push.autoSetupRemote true`

---

## Network Requirements

### Ports Used During Development

| Port | Purpose | Configurable |
|------|---------|--------------|
| 3000 | Next.js dev server (default) | Yes (next dev -p [port]) |
| 3001+ | Additional app dev servers | Yes |
| 5173 | Vite dev server (if applicable) | Yes |
| 2222 | React Email preview server | No |

### Required Connectivity

- GitHub (clone, push, PRs)
- npm registry (pnpm install)
- Vercel (if deploying there)
- Neon/Supabase (if developing with database)

**Note:** Corporate proxies may require additional configuration (not covered in standard onboarding).

---

## IDE/Editor Requirements

### Supported Editors

- **VS Code** (primary recommendation)
- **Cursor** (AI-powered, VS Code-based)
- **Windsurf** (AI-powered, Cascade agent)
- **IntelliJ/WebStorm** (with TypeScript plugin)
- **Vim/Neovim** (with LSP)

### Required VS Code Extensions

- TypeScript and JavaScript Language Features (built-in)
- ESLint (flat config compatible)
- Prettier (if using)
- Tailwind CSS IntelliSense

**Recommended:**
- GitLens
- Markdown All in One
- Error Lens

### Forbidden Editor Configurations

- Settings that override project ESLint rules
- Auto-format on save using different formatter than project
- Import organization rules that conflict with project conventions

---

## Environment Variables

### Required Local Variables

Copy from `.env.example` to `.env.local`:

```bash
# Database (Neon primary lane)
DATABASE_URL="postgresql://..."
DATABASE_PROVIDER="neon"

# Auth (varies by app)
# Clerk or Better Auth keys per app requirements

# Email (Resend primary)
RESEND_API_KEY="re_..."
EMAIL_PROVIDER="resend"

# Analytics
NEXT_PUBLIC_PLAUSIBLE_DOMAIN="yourdomain.com"
NEXT_PUBLIC_POSTHOG_KEY="phc_..."
```

**Security constraint:** Never commit `.env.local` or any file with real values.

---

## Troubleshooting Constraints

### Common Issues Within Scope

- Node version mismatches
- pnpm installation problems
- Git clone failures
- Initial install errors
- Port conflicts
- TypeScript/ESLint setup issues

### Issues Requiring Escalation

- Corporate proxy configuration
- Custom SSL certificate setups
- Non-standard OS configurations
- Docker/Podman development environments
- Monorepo performance issues on underpowered hardware

---

## Verification Steps

After setup, verify ALL of these pass:

```bash
# 1. Node version correct
node -v  # v24.x.x

# 2. pnpm version correct
pnpm -v  # 10.33.0

# 3. Git configured
git config user.name  # Shows your name
git config user.email # Shows your email

# 4. Repository cloned and installed
pnpm install  # Completes without errors

# 5. Workspace recognized
pnpm recursive list  # Shows all packages

# 6. Build works
pnpm build  # Completes without errors

# 7. Type check passes
pnpm typecheck  # No errors

# 8. Lint passes
pnpm lint  # No errors

# 9. Tests pass
pnpm test  # All pass
```

**All must pass before claiming setup is complete.**

---

## Time Constraints

### Expected Setup Time

- **New developer:** 30-45 minutes
- **Experienced monorepo developer:** 15-20 minutes
- **AI agent following this guide:** 10-15 minutes (automated)

**If setup takes longer:**
1. Check against constraints in this document
2. Verify software versions match exactly
3. Consult troubleshooting section
4. Ask for help — don't struggle silently

---

*Part of a1-docs-onboarding task — April 2026.*
