# Onboarding — Handoff Prompt

## Purpose

Bounded prompt for AI agents helping new contributors with onboarding tasks.

---

## Context

New contributor needs workstation setup for the agency monorepo. They may be:
- Human developer joining the team
- AI agent being configured for the repository
- Contractor setting up temporary environment

**Your role:** Guide them through setup efficiently, troubleshooting as needed.

---

## Required Reading (Read First)

Before assisting:

1. **This handoff prompt** — Scope and constraints
2. `docs/AGENTS.md` — AI agent rules for this repo
3. `docs/tasks/a1-docs-onboarding/02-docs-onboarding-constraints.md` — Environment requirements
4. `docs/tasks/a1-docs-onboarding/03-docs-onboarding-adr-tooling.md` — Why tools were chosen
5. `docs/tasks/a1-docs-onboarding/04-docs-onboarding-guide-setup.md` — Step-by-step instructions
6. `docs/DEPENDENCY.md` §1 — Exact version requirements

---

## Session Protocol

### On EVERY Response

**Restate current status:**
```
Current step: [e.g., "Step 3: Install Node.js"]
Last command run: [e.g., "nvm install 24"]
Output: [success / error with details]
Next action: [what you're doing now]
```

### Constraints (Never Violate)

- **Never suggest npm instead of pnpm**
- **Never suggest system Node instead of nvm/fnm**
- **Never skip environment verification steps**
- **Never suggest versions different from DEPENDENCY.md**
- **Never commit .env files or secrets**

---

## Setup Flow

### Phase 1: Pre-Check (2 minutes)

Verify prerequisites:
1. OS support level (Tier 1 vs Tier 2)
2. Hardware meets minimum requirements
3. Admin access confirmed
4. GitHub access confirmed

**If any fail:** Document the constraint, suggest upgrade path.

### Phase 2: Tool Installation (10 minutes)

Execute in order:
1. Install nvm (macOS/Linux) or fnm (Windows)
2. Install Node.js 24.x via version manager
3. Enable Corepack
4. Configure Git

**If error occurs:**
- Capture exact error message
- Check against constraints document
- Apply troubleshooting solution
- Verify fix before continuing

### Phase 3: Repository Setup (10 minutes)

Execute:
1. Clone repository
2. Run pnpm install
3. Verify workspace recognition
4. Verify Turborepo
5. Verify TypeScript
6. Verify ESLint
7. Run tests

**If any verification fails:** STOP and troubleshoot before continuing.

### Phase 4: Environment & Dev Server (10 minutes)

Execute:
1. Copy .env.example to .env.local
2. Start dev server
3. Verify HMR works
4. Build test
5. Git workflow test (branch, commit, push)

### Phase 5: Final Verification (5 minutes)

Complete QA checklist from `05-docs-onboarding-qa-checklist.md`.

**All must pass before declaring setup complete.**

---

## Troubleshooting Decision Tree

### Node.js Issues

```
Problem: node -v shows wrong version
→ Check: Is nvm/fnm installed?
→ Check: Is .nvmrc present?
→ Action: nvm use 24 / fnm use
→ Verify: node -v again
```

### pnpm Issues

```
Problem: pnpm not found
→ Check: corepack enabled?
→ Action: corepack enable
→ Verify: pnpm -v
```

### Install Issues

```
Problem: pnpm install fails
→ Check: Node version correct?
→ Check: pnpm version correct?
→ Action: Clear cache → pnpm store prune → retry
→ Action: Delete node_modules → retry
```

### Build/Test Issues

```
Problem: pnpm build or pnpm test fails
→ Check: Was install successful?
→ Check: Any environment variables needed?
→ Action: Check specific package with --filter
→ Action: Clear turbo cache → rm -rf .turbo → retry
```

---

## When to Escalate

STOP and escalate if:

- Hardware below minimum requirements
- OS not in Tier 1 or Tier 2 support
- Corporate proxy blocking package downloads
- Custom SSL certificates required
- Non-standard OS configuration
- Docker/Podman required (not covered in standard onboarding)

**Escalation message:**
```
Standard onboarding cannot proceed due to:
[constraint violated]

Options:
1. [option A with tradeoffs]
2. [option B with tradeoffs]

Recommendation: [your suggestion]
```

---

## Output Format

### Progress Updates

```
## Setup Progress: [X]/5 Phases

### Completed
- [list completed steps]

### Current
[what's happening now]

### Next
[what's coming next]
```

### Error Reports

```
## Error Encountered

**Step:** [which setup step]
**Command:** [exact command run]
**Output:** [error message]
**Cause:** [identified cause]
**Solution:** [fix applied or suggested]
```

### Completion Report

```
## Setup Complete

### Verified
- Node.js 24.x: ✓
- pnpm 10.33.0: ✓
- Git configured: ✓
- Repository cloned: ✓
- Install successful: ✓
- Type check passing: ✓
- Lint passing: ✓
- Tests passing: ✓
- Dev server running: ✓
- Git workflow tested: ✓

### Commands Working
- pnpm dev
- pnpm build
- pnpm test
- pnpm lint
- pnpm typecheck

### Ready For
- First contribution
- Package development
- App development
```

---

## Common Contributor Questions

### "Can I use npm/yarn instead of pnpm?"

**Answer:** No. The monorepo requires pnpm for:
- Content-addressable store (disk space)
- Strict resolution (prevents phantom deps)
- Workspace symlinks
- Corepack integration for version consistency

### "Can I use a different Node version?"

**Answer:** Node 24.x is required. The repository uses features from Node 24 (Corepack improvements, etc.). Use nvm/fnm to switch versions per project.

### "Do I need all the environment variables?"

**Answer:** No. Basic development works without any. Add variables only when working on specific features (database, email, analytics).

### "Which editor should I use?"

**Answer:** VS Code, Cursor, or Windsurf are all fully supported. All are VS Code-based so extensions and settings work across all three.

### "How long should setup take?"

**Answer:** 30-45 minutes for first-time setup. If taking longer, something is wrong — check troubleshooting section.

---

## Remember

**Your goal:** Get the contributor to a working development environment as efficiently as possible.

**Not your goal:** Explain deep architecture, teach Git/Node basics, or customize the setup.

**When in doubt:** Follow the constraints document exactly. The constraints exist to ensure consistency across all environments.

---

*Part of a1-docs-onboarding task — April 2026.*
