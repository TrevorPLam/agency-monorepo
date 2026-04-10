# C2 Infra Ci Workflow (Superseded)


## Purpose
Continuous Integration pipeline that builds, lints, tests, and type-checks all affected packages on every PR and push to main. Uses Turborepo remote caching for speed.


## Status
**Superseded by:** `c3-infra-ci-workflow-v2`  
**Reason:** V2 provides quality gate with Turborepo affected-only execution


## Dependencies
- `00-foundation` - for `turbo.json`
- `10-config-eslint` - for linting
- `11-config-typescript` - for type checking
- `90-test-setup` - for testing infrastructure
