# c2-infra-ci-workflow: QA Checklist

- [ ] `.github/workflows/ci.yml` exists and loads in GitHub Actions.
- [ ] The workflow triggers on pull requests and pushes to `main`.
- [ ] `actions/checkout`, `pnpm/action-setup`, and `actions/setup-node` are pinned to major versions intentionally used elsewhere in the repo.
- [ ] `pnpm install --frozen-lockfile` is used.
- [ ] Build, lint, typecheck, and test each run in CI.
- [ ] CI uses safe mock values instead of production secrets for test-only env vars.
- [ ] Concurrency cancellation is enabled.
- [ ] Turborepo remote cache env vars are documented and used safely.
- [ ] A failing lint or test command causes the workflow to fail.
- [ ] A PR run confirms the workflow posts the expected status checks.
