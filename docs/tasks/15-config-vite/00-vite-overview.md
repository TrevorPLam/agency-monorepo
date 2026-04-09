# 15-config-vite: Vite Configuration

## Purpose

Provide modern build tooling for agency monorepo using Vite as **conditional** build tool for specific use cases, not as default Next.js bundler.

## Dependencies

- None (uses external Vite packages only)
- Consumed by: All packages and apps (replaces custom webpack configurations)

## Scope

This package provides:
- **Conditional Vite configuration** for specific use cases (non-Next projects, standalone tools)
- Development server optimization for non-Next.js apps
- Build performance improvements for edge cases
- Plugin ecosystem integration
- TypeScript integration

**Important**: Next.js 16 uses Turbopack by default. Vite is only used when:
- Building standalone tools that don't use Next.js
- Creating edge-optimized builds for specific performance requirements
- Migrating legacy webpack configurations away from Next.js apps

## Critical Features

- **Lightning-fast builds**: Vite's native ESM bundling and dev server
- **HMR**: Hot Module Replacement for instant development feedback
- **Plugin Ecosystem**: Rich plugin system for custom build optimizations
- **Next.js Integration**: Native Next.js 16+ Vite integration
- **Monorepo Support**: Workspace-aware configuration and dependency optimization

## Migration Strategy

Vite is positioned as **conditional/supplementary** tool:

1. **Phase 1**: Vite for standalone tools and non-Next.js projects
2. **Phase 2**: Optional migration for specific performance cases
3. **Phase 3**: Legacy webpack replacement where appropriate

**Note**: Next.js 16 uses Turbopack by default. Vite does not replace Turbopack for standard Next.js applications.

## Next Steps
1. All new packages use Vite configuration by default
2. Existing packages can opt into Vite migration when ready
3. Next.js apps use Turbopack by default (Vite is optional)

## Performance Benefits
- **10x faster builds** than webpack-based configurations
- **Instant HMR** for development experience
- **Native ESM** support for modern module resolution
- **Plugin ecosystem** for custom optimizations
- **Reduced bundle sizes** through tree-shaking optimizations
