# c0-infra-codeowners: QA Checklist

- [ ] `.github/CODEOWNERS` exists at the repository root.
- [ ] A global fallback owner rule is present.
- [ ] `packages/config`, `packages/core`, `packages/data`, `packages/auth`, `packages/communication`, `packages/ui`, and `packages/testing` each have explicit ownership.
- [ ] `.github/workflows/`, `.changeset/`, and root config files have explicit ownership.
- [ ] Security-sensitive paths include a security-aware reviewer.
- [ ] Placeholder owner handles are either replaced with real teams or clearly marked as placeholders.
- [ ] No critical path is accidentally shadowed by a broader earlier rule.
- [ ] A test PR or path review confirms the expected reviewer auto-assignment behavior.
- [ ] Branch protection or rulesets are configured to require CODEOWNER review where intended.
