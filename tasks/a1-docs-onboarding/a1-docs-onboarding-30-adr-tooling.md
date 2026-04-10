# ADR: Onboarding Tooling Selection

## Status

**Accepted** — April 2026

## Context

New contributors need a consistent, reproducible development environment. The monorepo uses specific versions of Node.js, pnpm, and related tools that must be enforced.

Key requirements:
1. Exact version reproducibility
2. Easy version switching for multiple projects
3. Automated setup where possible
4. Cross-platform support (macOS, Windows, Linux)
5. Minimal maintenance burden

## Decision

### 1. Node.js Version Management: nvm + fnm

**Decision:** Use nvm on macOS/Linux, fnm on Windows/cross-platform.

**Why nvm:**
- Industry standard on Unix-like systems
- Widely documented and understood
- Supports `.nvmrc` for automatic version switching
- Mature and stable

**Why fnm for Windows:**
- Cross-platform (works on macOS/Linux/Windows)
- Much faster than nvm-windows (Rust-based)
- Supports `.nvmrc` like nvm
- Better WSL2 integration

**Rejected alternatives:**
- **nvm-windows:** Slower, less maintained, different commands than nvm
- **Volta:** Good but less familiar to most developers
- **asdf:** Plugin-based, more complex than needed
- **System Node:** No version switching, breaks reproducibility

### 2. Package Manager: pnpm via Corepack

**Decision:** Use pnpm with Corepack for automatic version management.

**Why pnpm:**
- Content-addressable store (saves disk space in monorepos)
- Strict resolution (prevents phantom dependencies)
- Native workspace support
- Fast (faster than npm, competitive with yarn)

**Why Corepack:**
- Node.js built-in (no separate installation)
- Automatic pnpm version from `packageManager` field
- Ensures all developers use exact same pnpm version

**Configuration:**
```json
{
  "packageManager": "pnpm@10.33.0"
}
```

**Rejected alternatives:**
- **npm:** No workspace symlinks, slower, less strict
- **yarn (berry):** Good but pnpm's content store is superior for monorepos
- **yarn (classic):** Outdated, node_modules bloat
- **Global pnpm:** Version drift between developers

### 3. Git Configuration: Minimal Required

**Decision:** Require only essential Git configuration, recommend but don't mandate advanced features.

**Required:**
- user.name and user.email (GitHub attribution)
- init.defaultBranch main (consistency)

**Recommended but optional:**
- GPG signing (security)
- SSH keys (convenience)
- push.autoSetupRemote (convenience)

**Rationale:** Lower barrier to entry for new contributors while maintaining basic standards.

### 4. Editor: VS Code Family as Default

**Decision:** Document VS Code as primary, support Cursor and Windsurf as first-class alternatives.

**Why VS Code:**
- Free and widely used
- Excellent TypeScript support
- Extensive extension ecosystem
- All AI coding tools (Cursor, Windsurf) are VS Code-based

**Why include Cursor/Windsurf:**
- Repository is designed for AI-assisted development
- These editors have the AI agent built-in
- Same extensions and configuration work across all three

**Rejected alternatives:**
- **WebStorm:** Paid, steeper learning curve
- **Vim/Neovim:** Documented as community-supported, not default
- **Sublime/Atom:** Atom discontinued, Sublime less common now

### 5. Environment Variables: .env.example as Template

**Decision:** Use `.env.example` as the source of truth for required environment variables.

**Pattern:**
```bash
# In repository
.env.example     # Template with placeholder values (committed)
.env.local       # Real values (gitignored)

# New contributor copies
cp .env.example .env.local
# Then fills in real values
```

**Why this pattern:**
- Clear documentation of required variables
- No secrets committed to repository
- Easy to see what needs to be configured
- Standard across many projects

**Rejected alternatives:**
- **Documentation only:** Easy to miss required variables
- **Setup scripts:** More complex, harder to maintain
- **Docker Compose env:** Not everyone uses Docker

## Consequences

### Positive

- Reproducible environments across all developers
- Automatic tool version management via Corepack and nvm
- Lower barrier to entry with clear defaults
- AI agents can follow standard setup procedures

### Negative

- nvm/fnm split creates slight platform differences
- Corepack still relatively new (introduced Node 16.13, stabilized recently)
- Some developers may prefer different tools

### Neutral

- Requires learning nvm/fnm for developers new to Node version management
- pnpm syntax differs slightly from npm/yarn

## Migration Path

For developers coming from other setups:

**From npm/yarn:**
```bash
# Install pnpm via Corepack
corepack enable
corepack prepare pnpm@10.33.0 --activate

# pnpm equivalents:
# npm install → pnpm install
# npm run dev → pnpm dev
# npm run build → pnpm build
# npx [cmd] → pnpm [cmd]
```

**From nvm-windows:**
```bash
# Install fnm
winget install Schniz.fnm

# fnm uses same commands as nvm
fnm install 24
fnm use 24
```

## Implementation Notes

1. `.nvmrc` file at root with `24.0.0`
2. `packageManager` field in root `package.json`
3. `engines` field enforcing minimum Node version
4. `.env.example` committed with placeholder values
5. `.env.local` in `.gitignore`
6. VS Code extensions listed in onboarding guide

## References

- nvm: https://github.com/nvm-sh/nvm
- fnm: https://github.com/Schniz/fnm
- pnpm: https://pnpm.io/
- Corepack: https://nodejs.org/api/corepack.html

---

*ADR-004: Onboarding Tooling Selection — Accepted April 2026*
