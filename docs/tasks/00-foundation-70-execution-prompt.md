# 00-foundation-70-execution-prompt.md

## Task Context

Implement the root repository scaffolding for the agency monorepo. This is the foundation upon which all other packages and apps will be built.

## Required Reading

Before starting, read:
1. `AGENTS.md` - Architecture rules and constraints
2. `ARCHITECTURE.md` - Monorepo philosophy and structure
3. `00-foundation-10-spec.md` - Detailed specification

## Implementation Scope

Create the following files in the repository root:

### Configuration Files
- `.gitignore` - Exclude node_modules, build outputs, env files
- `.nvmrc` - Node version 24.0.0
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
- Use pnpm 10.33.0 exactly
- Include pnpm catalog in workspace config
- Follow Turborepo best practices
- No secrets in any committed files

## Verification Steps

1. Run `node -v` - should be v24.x.x
2. Run `pnpm -v` - should be 10.33.0
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

