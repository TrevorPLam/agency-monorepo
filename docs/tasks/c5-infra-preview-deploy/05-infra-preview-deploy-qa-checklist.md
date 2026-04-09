# c5-infra-preview-deploy: QA Checklist

- [ ] `.github/workflows/preview.yml` exists.
- [ ] Preview deployment is limited to deployable apps.
- [ ] The workflow does not require production secrets.
- [ ] Affected-app or label-based deployment rules are documented.
- [ ] Preview comments update in place instead of spamming duplicates.
- [ ] Each deployed app maps to the correct provider project ID.
- [ ] Preview URLs are visible in the PR.
- [ ] A PR with no relevant app changes does not trigger unnecessary deploys.
- [ ] Required provider secrets and variables are documented.
- [ ] Cleanup/retention behavior is documented where relevant.
