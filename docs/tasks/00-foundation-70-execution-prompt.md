# 00-foundation-70-execution-prompt.md

> **⚠️ IMPLEMENTATION PROMPT — GOVERNANCE CHECK REQUIRED ⚠️**
>
> This prompt authorizes work only when combined with current governance documents.
>
> **Mandatory pre-read (in order):**
> 1. `REPO-STATE.md` — what is approved now
> 2. `DECISION-STATUS.md` — locked vs open decisions  
> 3. `DEPENDENCY.md` — exact version authority
>
> **Authority hierarchy:** `REPO-STATE.md` > `DECISION-STATUS.md` > `DEPENDENCY.md` > this prompt > `ARCHITECTURE.md`
>
> **Stop and escalate if:** Any conflict exists between these documents.

## Task Context

Implement the root repository scaffolding for the agency monorepo. This is the foundation upon which all other packages and apps will be built.

## Required Reading

Before starting, read in this exact order:
1. `REPO-STATE.md` - What is approved to build now
2. `DECISION-STATUS.md` - Which decisions are locked vs open
3. `DEPENDENCY.md` - Exact version authority for all dependencies
4. `AGENTS.md` - Architecture rules and constraints
5. `00-foundation-10-spec.md` - Detailed specification
6. `ARCHITECTURE.md` - Target state design (reference only)

**Authority rule:** When any document conflicts with `REPO-STATE.md`, `DECISION-STATUS.md`, or `DEPENDENCY.md`, stop and escalate. The governance documents always win.

## Implementation Scope

Create the following files in the repository root:

### Configuration Files
- `.gitignore` - Exclude node_modules, build outputs, env files
- `.nvmrc` - Node version 24.11.0 (LTS)
- `.prettierignore` - Exclude files from formatting
- `package.json` - Root workspace configuration
- `pnpm-workspace.yaml` - pnpm workspace + catalog configuration
- `turbo.json` - Turborepo pipeline configuration

### Directory Structure
- `apps/` - Application packages
- `packages/` - Shared library packages (nested structure)
- `tools/` - Development and build tools

## Constraints

- Use Node.js 24.x LTS
- Use pnpm 10.15.1 exactly
- Include pnpm catalog in workspace config
- Follow Turborepo best practices
- No secrets in any committed files

## Verification Steps

1. Run `node -v` - should be v24.x.x
2. Run `pnpm -v` - should be 10.15.1
3. Run `pnpm install` - should succeed
4. Run `pnpm turbo build --dry-run` - should show task graph

## Acceptance Criteria

- [ ] All root config files created per specification
- [ ] Git repository initialized with initial commit
- [ ] Directory structure created
- [ ] pnpm workspaces recognized
- [ ] Turborepo pipeline configured
- [ ] Catalog dependencies defined

## Next Tasks

After completion, proceed to:
- Task 10: ESLint configuration
- Task 11: TypeScript configuration
- Task 12: Tailwind CSS configuration
- Task 13: Prettier configuration

## Reference Materials

- `DEPENDENCY.md` - Technology versions
- `docs/tasks/a0-docs-agents-30-adr-tooling.md` - Task document structure and naming conventions
- `docs/tasks/` - Flat task corpus and execution context

