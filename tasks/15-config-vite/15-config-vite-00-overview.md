# 15-config-vite: Vite Configuration

## Purpose

Document the conditional Vite lane for non-Next consumers without implying that Vite is a default repo-wide build tool.

## Dependencies

- None (uses external Vite packages only)
- Consumed by: Non-Next packages, standalone tools, or other explicitly approved consumers only

## Scope

This package provides:
- **Conditional Vite configuration** for specific use cases (non-Next projects, standalone tools)
- Development server optimization for non-Next.js apps
- Build performance improvements for edge cases
- Plugin ecosystem integration
- TypeScript integration

This task does **not** make Vite the standard bundler for Next.js apps.

**Important**: Next.js 16 uses Turbopack by default. Vite is only used when:
- Building standalone tools that don't use Next.js
- Supporting a non-Next package or app with a real Vite requirement
- Replacing custom bundling only where a non-Next consumer justifies it

## Conditional Use Cases

- **Lightning-fast builds**: Vite's native ESM bundling and dev server
- **HMR**: Hot Module Replacement for instant development feedback
- **Plugin Ecosystem**: Rich plugin system for custom build optimizations
- **Monorepo Support**: Workspace-aware configuration and dependency optimization

## Migration Strategy

Vite is positioned as **conditional/supplementary** tool:

1. **Phase 1**: Vite for standalone tools and non-Next.js projects
2. **Phase 2**: Optional migration for specific performance cases
3. **Phase 3**: Legacy webpack replacement where appropriate

**Note**: Vite does not replace Turbopack for standard Next.js applications.

## Next Steps
1. Do not add Vite to Next.js apps by default
2. Use Vite only when a non-Next consumer proves the need
3. Keep Turbopack as the default Next.js build lane

## Performance Benefits
- **10x faster builds** than webpack-based configurations
- **Instant HMR** for development experience
- **Native ESM** support for modern module resolution
- **Plugin ecosystem** for custom optimizations
- **Reduced bundle sizes** through tree-shaking optimizations
