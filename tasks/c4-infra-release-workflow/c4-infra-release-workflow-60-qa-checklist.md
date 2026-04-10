# c4-infra-release-workflow: QA Checklist

- [ ] `.github/workflows/release.yml` exists.
- [ ] The workflow runs only from `main`.
- [ ] Release automation depends on Changesets rather than custom versioning logic.
- [ ] Required secrets are documented and scoped appropriately.
- [ ] The workflow can no-op safely when no releasable package changes exist.
- [ ] App-only and docs-only changes do not trigger package publishing.
- [ ] Version PR creation behavior is verified.
- [ ] Publishing behavior is either verified or explicitly documented as deferred.
- [ ] CI remains an upstream gate before release automation.
- [ ] Manual fallback steps are documented for repo owners.
