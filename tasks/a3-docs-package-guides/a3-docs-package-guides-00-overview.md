# A3 Docs Package Guides


## Purpose
Create per-package documentation structure providing detailed usage guides, API references, and examples for each shared package.


## Dependencies
- `00-foundation`
- `a0-docs-agents` - agents read these guides alongside `docs/AGENTS.md`
- `e0-apps-root-readme` - links to these guides from the future root README

## Control docs

- `docs/standards/tenant-isolation-data-governance.md`
- `docs/standards/dependency-truth.md`

Tenant-sensitive package guides and version-sensitive package guides should link to these control docs instead of restating incompatible local rules.
