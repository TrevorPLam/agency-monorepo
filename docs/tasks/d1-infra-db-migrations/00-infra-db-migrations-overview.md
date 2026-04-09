# D1 Infra Db Migrations

## Task Header

| Field | Value |
|-------|-------|
| **State** | `planned` — Documented target; implementation not yet authorized |
| **Trigger** | First approved database implementation using the shared data layer |
| **Minimum Consumers** | Repository-wide once the database lane is activated |
| **Dependencies** | `50-data-db`, `d2-infra-environment-mgmt`, `a5-docs-tenant-isolation-data-governance`, `a6-docs-dependency-truth-version-authority` |
| **Exit Criteria** | Migration workflow, documentation, and safety rules are defined for development, CI, and production |
| **Implementation Authority** | `REPO-STATE.md` — Planning only until the database lane is approved |
| **Version Authority** | `DEPENDENCY.md` §1, §4 when implementation becomes approved |
| **Supersedes** | n/a |
| **Superseded by** | n/a |


## Purpose
Define how database schema migrations are created, applied, and managed across development, CI, and production environments.


## Cross-references

- `docs/REPO-STATE.md`
- `docs/DECISION-STATUS.md`
- `docs/DEPENDENCY.md`
- `docs/standards/tenant-isolation-data-governance.md`
- `docs/standards/dependency-truth.md`


## Planning dependencies
- `50-data-db` — shared database lane
- `d2-infra-environment-mgmt` — `DATABASE_URL` handling and environment separation
- `a5-docs-tenant-isolation-data-governance` — tenant-safe migration and seed rules
- `a6-docs-dependency-truth-version-authority` — migration tooling and dependency-pin governance


## Tooling dependencies

Add to root `package.json` devDependencies:
```json
{
  "devDependencies": {
    "tsx": "^4.7.0",
    "dotenv": "^16.4.0"
  }
}
```
