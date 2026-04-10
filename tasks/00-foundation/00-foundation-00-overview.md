# 00-foundation: Root Repository Scaffolding

## Purpose
Create the foundation of the monorepo with workspace configuration, package manager setup, and orchestration tooling.

## Dependencies
- None (this is the first task)
- Followed by: `10-config-eslint`, `11-config-typescript`, `12-config-tailwind`

## Scope
This task establishes the root repository structure including:
- Package manager configuration (pnpm 10.33.0)
- Workspace definition (pnpm-workspace.yaml)
- Task orchestration (turbo.json)
- Version control setup (.gitignore, .nvmrc)
- Root package.json with shared scripts

## Next Steps
1. Create `10-config-eslint`
2. Create `11-config-typescript`
3. Create `12-config-tailwind`
4. Create `13-config-prettier`
5. Create `13-config-react-compiler`
