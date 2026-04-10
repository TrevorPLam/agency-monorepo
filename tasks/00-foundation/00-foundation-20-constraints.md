# 00-foundation: Technical Constraints

## Platform Requirements

- **Node.js**: Version 24.x LTS (minimum 20.9.0 for Next.js 16 compatibility)
- **pnpm**: Version 10.33.0 (locked via `packageManager` field)
- **Operating System**: Windows 10+, macOS 11+, or Linux (Ubuntu 20.04+)

## Git Configuration

- **Git**: Version 2.30+ required for sparse checkout support
- **Line Endings**: Repository uses LF line endings (enforced via `.gitattributes`)

## IDE Requirements

- **VS Code**: Recommended editor with workspace settings provided
- **Extensions**: See `.vscode/extensions.json` for required extensions

## Package Manager Constraints

- **pnpm Only**: Do not use npm or yarn; monorepo relies on pnpm workspaces
- **Catalog Protocol**: Use `catalog:` in package.json for centralized version management
- **Workspace Protocol**: Use `workspace:*` for internal dependencies

## Turborepo Constraints

- **Remote Caching**: Requires `TURBO_TOKEN` and `TURBO_TEAM` environment variables in CI
- **Build Artifacts**: Must output to `.next/`, `dist/`, or `build/` directories
- **Task Dependencies**: `^build` means build all dependencies first

## Environment Variables

| Variable | Required | Purpose |
|----------|----------|---------|
| `NODE_ENV` | Yes | `development`, `production`, or `test` |
| `DATABASE_URL` | Conditional | Required for data layer packages |
| `TURBO_TOKEN` | CI only | Turborepo remote caching |
| `TURBO_TEAM` | CI only | Turborepo team identifier |

## Forbidden Actions

- Do not commit `.env` files with secrets
- Do not use `npm install` or `yarn` commands
- Do not modify `pnpm-lock.yaml` manually
- Do not create nested `node_modules` in package directories

## Performance Considerations

- **Initial Install**: May take 2-5 minutes depending on network
- **Cold Build**: Full monorepo build may take 5-10 minutes
- **Hot Reload**: Turbo dev mode provides fast incremental updates
