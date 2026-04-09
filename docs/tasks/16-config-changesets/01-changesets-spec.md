# 16-config-changesets: Implementation Specification

## Task Header

| Field | Value |
|-------|-------|
| **State** | `deferred` — Legacy package-form draft; canonical track is c6-infra-changesets |
| **Trigger** | n/a — root Changesets configuration is tracked in c6-infra-changesets |
| **Minimum Consumers** | n/a (root infrastructure) |
| **Dependencies** | Changesets CLI, TypeScript 6.0 |
| **Exit Criteria** | n/a — see c6-infra-changesets |
| **Implementation Authority** | `REPO-STATE.md` — Phase: Planning, Build status: Not started |
| **Version Authority** | `DEPENDENCY.md` §13 — Changesets CLI |
| **Supersedes** | n/a |
| **Superseded by** | c6-infra-changesets (canonical root implementation) |

## Cross-references

- Decision status: `DECISION-STATUS.md` — Changesets `approved`
- Version pins: `DEPENDENCY.md` §13
- Architecture: `ARCHITECTURE.md` — Final stack section
- Note: Legacy package-form draft only; do not implement separately from c6-infra-changesets

## Files
```
packages/config/changesets-config/
├── package.json
├── .changeset
│   └── config.json
└── README.md
```

### `package.json`
```json
{
  "name": "@agency/config-changesets",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "exports": {
    ".": "./.changeset/config.json"
  },
  "files": [".changeset/config.json", "README.md"],
  "publishConfig": { "access": "restricted" }
}
```

### `.changeset/config.json`
```json
{
  "$schema": "https://unpkg.com/@changesets/config@3.0.0/schema.json",
  "changelog": "@changesets/cli/changelog",
  "commit": false,
  "fixed": [],
  "linked": [],
  "access": "restricted",
  "baseBranch": "main",
  "updateInternalDependencies": "patch",
  "ignore": ["@agency/*-test"],
  "___experimentalUnsafeOptions_WILL_CHANGE_IN_PATCH": {
    "onlyUpdatePeerDependentsWhenOutOfRange": true
  }
}
```

## Configuration Details

### Base Configuration
- **Semantic Versioning**: Automated version management based on conventional commits
- **Changelog Generation**: Automatic changelog creation for all package releases
- **Release Workflow**: Integrated with Turborepo and CI/CD pipelines
- **Monorepo Support**: Workspace-aware version management across all packages

### Version Management
- **Conventional Commits**: Follows conventional commit format for automatic versioning
- **Dependency Updates**: Automatic internal dependency updates when packages change
- **Release Strategy**: Configurable release strategies for different scenarios

### Changelog Configuration
- **Automatic Generation**: Changelogs generated from changeset content
- **Release Notes**: Structured release notes for consumers
- **Version History**: Complete version history tracking

## Usage

### In Package
```json
{
  "devDependencies": {
    "@agency/config-changesets": "workspace:*"
  },
  "scripts": {
    "version": "changeset version",
    "release": "changeset publish"
  }
}
```

### Root Integration
```json
{
  "scripts": {
    "version": "changeset version",
    "release": "changeset publish",
    "changeset": "changeset"
  }
}
```

### Changeset Workflow
1. Create changeset file: `pnpm changeset`
2. Version packages: `pnpm changeset version`
3. Publish packages: `pnpm changeset publish`
4. Generate changelogs automatically

## Performance Benefits
- **Automated Releases**: Streamlined release process with reduced manual overhead
- **Semantic Versioning**: Consistent version bumps based on commit conventions
- **Changelog Automation**: Automatic documentation of changes for consumers
- **Monorepo Optimization**: Workspace-aware dependency management and updates

## Integration Benefits
- **Turborepo Integration**: Native support for build caching and task orchestration
- **CI/CD Ready**: Pre-configured workflows for automated releases
- **Developer Experience**: Simplified release process with clear change documentation
