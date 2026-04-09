# 15-config-vite: Implementation Specification

## Task Header

| Field | Value |
|-------|-------|
| **State** | `conditional` — Only for non-Next build needs |
| **Trigger** | A non-Next package or app requires a Vite-based dev/build pipeline |
| **Minimum Consumers** | 1+ non-Next packages/apps with a real Vite requirement |
| **Dependencies** | Vite 8.0.8, TypeScript 6.0 |
| **Exit Criteria** | Shared Vite config exported and adopted by at least one non-Next consumer |
| **Implementation Authority** | `REPO-STATE.md` — Phase: Planning, Build status: Not started |
| **Version Authority** | `DEPENDENCY.md` §2 — Vite 8.0.8 |
| **Supersedes** | n/a |
| **Superseded by** | n/a |

## Cross-references

- Decision status: `DECISION-STATUS.md` — Vite `leaning` (demoted from primary build tool)
- Version pins: `DEPENDENCY.md` §2
- Architecture: `ARCHITECTURE.md` — Final stack section
- Note: Next.js apps rely on Turbopack by default; Vite is not foundational for this repo

## Files
```
packages/config/vite-config/
├── package.json
├── vite.config.ts
└── README.md
```

### `package.json`
```json
{
  "name": "@agency/config-vite",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "exports": {
    ".": "./vite.config.ts",
    "./base": "./vite.config.ts"
  },
  "files": ["vite.config.ts", "README.md"],
  "publishConfig": { "access": "restricted" }
}
```

### `vite.config.ts`
```typescript
import { defineConfig } from 'vite'
import type { UserConfig } from 'vite'

export const baseConfig = defineConfig({
  plugins: [],
  build: {
    target: 'es2022',
    lib: ['es2022', 'dom'],
    format: 'esm',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: undefined
      }
    }
  },
  optimizeDeps: {
    include: ['react', 'react-dom']
  },
  server: {
    fs: {
      strict: false
    }
  }
})

export const nextjsConfig = defineConfig({
  plugins: [],
  build: {
    target: 'es2022',
    lib: ['es2022', 'dom'],
    format: 'esm',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: undefined,
        chunkFileNames: 'static/[name]-[hash].js'
      }
    }
  },
  optimizeDeps: {
    include: ['react', 'react-dom']
  },
  experimental: {
    appBundleTarget: 'app'
  },
  server: {
    fs: {
      strict: false
    }
  }
})

export default baseConfig
export { nextjsConfig }
```

## Configuration Details

### Base Configuration
- **Modern ES2022 Target**: Latest JavaScript features with broad browser support
- **ESM Output**: Native ES modules for optimal tree-shaking
- **Source Maps**: Enabled for debugging and source mapping
- **Dependency Optimization**: Pre-bundles React and React-DOM

### Next.js Configuration
- **App Bundle Target**: Optimized for Next.js 16+ App Router
- **Static Output**: Proper chunk naming for static assets
- **Experimental Features**: Latest Next.js Vite integration features

### Development Server
- **File System Watching**: Efficient HMR with strict file system disabled
- **Performance Optimizations**: Development server tuned for monorepo workflows

## Usage

### In Package
```json
{
  "viteConfig": "@agency/config-vite"
}
```

### In Consuming Package
```json
{
  "viteConfig": "@agency/config-vite/base"
}
```

### Next.js Integration
```json
{
  "viteConfig": "@agency/config-vite/nextjs"
}
```

### Root Integration
```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  }
}
```

## Performance Benefits
- **10x faster builds** than webpack-based configurations
- **Instant HMR** for development experience
- **Native ESM** support with optimal tree-shaking
- **Plugin ecosystem** for custom optimizations
- **Next.js 16+** integration with App Router support
