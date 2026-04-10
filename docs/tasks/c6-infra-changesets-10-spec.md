# c6-infra-changesets: Implementation Specification

## Task Header

| Field | Value |
|-------|-------|
| **State** | `planned` — Documented target; implementation not yet authorized |
| **Trigger** | Monorepo requires version management |
| **Minimum Consumers** | 2+ packages requiring versioning |
| **Dependencies** | Changesets 2.30.0 |
| **Exit Criteria** | Changesets config active and used |
| **Implementation Authority** | `REPO-STATE.md` — Phase: Planning, Build status: Not started |
| **Version Authority** | `DEPENDENCY.md` §3 — Changesets 2.30.0 |
| **Supersedes** | 16-config-changesets (legacy package draft) |
| **Superseded by** | n/a |

**Cross-references:**
- Decision status: `DECISION-STATUS.md` — Changesets `approved`
- Version pins: `DEPENDENCY.md` §3
- Dependency-truth policy: `docs/standards/dependency-truth.md`
- Note: Canonical root-level Changesets track for the repo
- Note: Required for monorepo versioning and releases

## Files
```
.changeset/
├── config.json
└── 01-config-biome-migration-50-ref-quickstart.md
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
  "ignore": [],
  "privatePackages": {
    "version": true,
    "tag": true
  }
}
```

### `.changeset/01-config-biome-migration-50-ref-quickstart.md`
```markdown
# Changesets

This directory contains changeset files for versioning packages.

## What is a Changeset?

A changeset is a Markdown file that describes:
- Which packages are affected
- The type of change (patch, minor, major)
- A description of the change

## Creating a Changeset

```bash
pnpm changeset
```

This will:
1. Ask which packages changed
2. Ask the semver bump type (patch/minor/major)
3. Ask for a summary
4. Create a `.changeset/*.md` file

## Changeset File Format

```md
---
"@agency/core-types": minor
"@agency/ui-design-system": patch
---

Added new ProjectStatus values and updated Button component.
```

## Version Classifications

| Type | Use When | Example |
|------|----------|---------|
| **patch** | Bug fix, internal refactor | Fix date formatting bug |
| **minor** | New feature, backward-compatible | Add new component |
| **major** | Breaking change, API change | Remove exported function |

## Release Process

1. Merge PRs with changeset files
2. GitHub Action creates "Version Packages" PR
3. Review version bumps in the PR
4. Merge "Version Packages" PR
5. Packages published automatically

## Skipping Changesets

Only skip changesets for:
- Documentation-only changes
- CI configuration changes
- Root-level config changes not affecting packages

**Never skip for:**
- Package code changes
- Package dependency updates
- Public API changes
```


## Configuration Explained

| Option | Value | Meaning |
|--------|-------|---------|
| `commit` | `false` | Don't auto-commit; use PR workflow |
| `access` | `restricted` | Private packages, not public npm |
| `baseBranch` | `main` | Compare against main for changes |
| `updateInternalDependencies` | `patch` | Auto-bump dependents on any change |
| `privatePackages.version` | `true` | Version private packages too |


## Implementation Checklist

- [ ] Directory created at `.changeset/`
- [ ] `config.json` created
- [ ] `01-config-biome-migration-50-ref-quickstart.md` created for contributors
- [ ] Changeset Action workflow configured (see `c4-infra-release-workflow`)
- [ ] Test changeset created with `pnpm changeset`
