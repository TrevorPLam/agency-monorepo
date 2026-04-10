# A1 Docs Onboarding — Task Overview

## Purpose

Guide for new developers and AI agents joining the project. Covers environment setup, development workflow, monorepo structure, and where to find help.

## Output

- `docs/onboarding/new-contributor.md` — Complete onboarding guide for new team members

## Dependencies

- DEPENDENCY.md — Version pins for Node.js, pnpm, package versions
- ARCHITECTURE.md — Repository structure, package taxonomy, dependency flow
- a0-docs-agents — AI agent rules (context for AI-assisted onboarding)

## Scope

### In Scope

- Workstation setup (Node.js 24.x, pnpm 10.33.0)
- Repository clone and initial installation
- Development workflow (dev servers, testing, linting)
- Monorepo structure explanation
- Package naming conventions
- Common commands reference
- Environment variable setup
- Troubleshooting common issues
- First contribution workflow
- Code review process

### Out of Scope

- Deep architecture tutorials (see ARCHITECTURE.md)
- Package-specific API documentation (see package-guides/)
- AI agent rules detail (see AGENTS.md)
- Advanced deployment procedures (see CI/CD docs)

## Task Structure

This task follows the standardized task-family file convention:

| File | Purpose |
|------|---------|
| `a1-docs-onboarding-00-overview.md` | This file — task summary and scope |
| `a1-docs-onboarding-10-spec.md` | Detailed specification for new-contributor.md |
| `a1-docs-onboarding-20-constraints.md` | Environment constraints, OS requirements |
| `a1-docs-onboarding-30-adr-tooling.md` | Why nvm, corepack, pnpm were selected |
| `a1-docs-onboarding-40-guide-setup.md` | Step-by-step workstation setup |
| `a1-docs-onboarding-60-qa-checklist.md` | Verify setup completed correctly |
| `a1-docs-onboarding-70-execution-prompt.md` | Agent prompt for onboarding tasks |

## Reading Order

For contributors working on this task:
1. Read this overview (00)
2. Read the spec (01) — contains full new-contributor.md content
3. Read constraints (02) — understand limitations
4. Read ADR (03) — understand tooling decisions
5. Use guide (04) for implementation reference
6. Use QA checklist (05) to verify
7. Use handoff prompt (06) for agent tasking

## Success Criteria

- New contributor can go from zero to first PR in under 30 minutes
- All environment setup steps are verified and reproducible
- Common issues have documented solutions
- Both human developers and AI agents can follow the guide
- Guide stays current with DEPENDENCY.md version pins

## Status

**In Progress** — Creating task documentation structure per conventions.

---

*Part of a1-docs-onboarding task — April 2026.*
