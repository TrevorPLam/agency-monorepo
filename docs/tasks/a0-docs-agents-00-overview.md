# a0-docs-agents: AI Agent Rules

## Purpose
Explicit, unambiguous rules for AI coding agents (Cursor, Windsurf, Claude) working in this monorepo. These rules override default agent behavior.

## Dependencies
- None (documentation only)
- Referenced by: Root 01-config-biome-migration-50-ref-quickstart.md, onboarding guide

## Scope
This document provides:
- Hard constraints for AI agent behavior
- Import and dependency rules
- Code quality requirements
- High-risk package treatment guidelines
- Client data isolation rules

## Critical Rules Summary
- Never import from paths not listed in `package.json` exports
- Never break dependency flow (config/core → data/ui/auth → apps)
- Always use `workspace:*` for internal dependencies
- Always add changeset for shared package changes
- Client data isolation is non-negotiable

## Next Steps
1. Place file at `docs/AGENTS.md`
2. Reference in root 01-config-biome-migration-50-ref-quickstart.md
3. Include in onboarding guide
