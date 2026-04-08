# 15-config-vite: Vite Configuration

## Purpose
Provide modern build tooling for the agency monorepo using Vite as the standard bundler and development server.

## Dependencies
- None (uses external Vite packages only)
- Consumed by: All packages and apps (replaces custom webpack configurations)

## Scope
This package provides:
- Shared Vite configuration for monorepo
- Development server optimization for Next.js apps
- Build performance improvements
- Plugin ecosystem integration
- TypeScript integration

## Critical Features
- **Lightning-fast builds**: Vite's native ESM bundling and dev server
- **HMR**: Hot Module Replacement for instant development feedback
- **Plugin Ecosystem**: Rich plugin system for custom build optimizations
- **Next.js Integration**: Native Next.js 16+ Vite integration
- **Monorepo Support**: Workspace-aware configuration and dependency optimization

## Migration Strategy
Vite will be introduced as the standard build tool:
1. **Phase 1**: Vite for new projects, maintain existing build tools
2. **Phase 2**: Gradual migration to Vite-only
3. **Phase 3**: Remove legacy build configurations

## Next Steps
1. All new packages use Vite configuration by default
2. Existing packages can opt into Vite migration when ready
3. Next.js apps use Vite via Turbopack (default in Next.js 16)

## Performance Benefits
- **10x faster builds** than webpack-based configurations
- **Instant HMR** for development experience
- **Native ESM** support for modern module resolution
- **Plugin ecosystem** for custom optimizations
- **Reduced bundle sizes** through tree-shaking optimizations
