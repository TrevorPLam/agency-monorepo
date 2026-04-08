# ADR: Centralized Dependency Management with pnpm Catalogs

## Status

**Accepted**

## Context

The agency monorepo will contain 50+ packages with many shared dependencies (React, Next.js, TypeScript, etc.). Without centralized version management:

- Version drift occurs between packages
- Upgrades require editing 20+ package.json files
- Merge conflicts happen frequently during dependency updates
- Security patches are hard to apply consistently

## Decision

Use pnpm workspace **catalogs** for centralized dependency version management.

## Rationale

### Why Catalogs Over Individual package.json

1. **Single Source of Truth**: One `pnpm-workspace.yaml` entry per dependency
2. **Automatic Consistency**: All packages use the same version via `catalog:` protocol
3. **Easier Updates**: Change one line to upgrade across entire monorepo
4. **Reduced Conflicts**: package.json files don't change during version bumps
5. **Dependabot Support**: GitHub Dependabot now supports pnpm catalogs

### Why Not npm Workspaces or Yarn

- **pnpm**: Content-addressable store saves disk space
- **pnpm**: Faster install times with hard links
- **pnpm**: Catalog feature not available in npm/yarn

## Consequences

### Positive

- Reduced maintenance burden for dependency updates
- Consistent versions across all packages
- Fewer git merge conflicts
- Easier security patching

### Negative

- Team must learn `catalog:` protocol syntax
- Some tools may not recognize `catalog:` as valid semver
- Requires pnpm 10.33.0+

## Usage Pattern

**In `pnpm-workspace.yaml`:**
```yaml
catalog:
  react: ^19.2.4
```

**In package.json:**
```json
{
  "dependencies": {
    "react": "catalog:"
  }
}
```

## References

- [pnpm Catalogs Documentation](https://pnpm.io/catalogs)
- [GitHub Dependabot + pnpm Catalogs](https://github.blog/changelog/2025-02-04-dependabot-now-supports-pnpm-workspace-catalogs-ga/)
