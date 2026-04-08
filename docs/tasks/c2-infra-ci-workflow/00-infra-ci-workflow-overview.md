# C2 Infra Ci Workflow


## Purpose
Continuous Integration pipeline that builds, lints, tests, and type-checks all affected packages on every PR and push to main. Uses Turborepo remote caching for speed.


## Dependencies
- TASK_0 (Root Repository Scaffolding) - for `turbo.json`
- TASK_1 (ESLint Config) - for linting
- TASK_2 (TypeScript Config) - for type checking
- TASK_17 (Test Setup) - for testing infrastructure
