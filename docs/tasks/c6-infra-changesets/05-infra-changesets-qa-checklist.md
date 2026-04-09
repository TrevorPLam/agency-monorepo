# c6-infra-changesets: QA Checklist

- [ ] `.changeset/config.json` exists at the repo root.
- [ ] `.changeset/README.md` explains when to create or skip a changeset.
- [ ] `baseBranch` is `main`.
- [ ] `privatePackages` behavior matches the repository policy.
- [ ] `updateInternalDependencies` is set intentionally and documented.
- [ ] A sample `pnpm changeset` run succeeds locally.
- [ ] The example changeset file format is accurate.
- [ ] Docs-only and CI-only changes are clearly documented as skip-eligible.
- [ ] Shared package API changes are clearly documented as changeset-required.
- [ ] Release workflow dependencies are referenced but not implemented implicitly here.
