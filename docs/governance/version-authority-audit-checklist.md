# docs/governance/version-authority-audit-checklist.md

> **Purpose of this document**  
> This checklist is the human review companion to Topic 5.
>
> It exists to catch dependency and version drift before merge and to support:
> - `DEPENDENCY.md` as the human source of truth
> - machine-truth consistency across manifests, lockfiles, and CI
> - safe AI-assisted dependency changes
>
> Use this checklist whenever:
> - a dependency is added
> - a dependency is upgraded
> - a root toolchain version changes
> - a CI workflow changes package-manager or runtime versions
> - a shared package changes its dependency surface
> - a milestone activates a new package lane

---

## How to use this checklist

Run this checklist during:

- dependency-related PR review
- milestone transition review
- dependency normalization work
- scheduled dependency truth audits

This checklist does **not** replace CI.
It exists to make dependency-governance review explicit and repeatable.

---

# Version Authority Audit Checklist

## Section 1 — Human authority consistency

### 1.1 `DEPENDENCY.md` first
- [ ] Did the dependency change begin in `DEPENDENCY.md`?
- [ ] Does `DEPENDENCY.md` reflect the current approved version or policy state?
- [ ] Is the dependency classified correctly as one of:
  - verified exact pin
  - approved range
  - validation pending
  - tool-only latest

### 1.2 Exact version authority
- [ ] Is `DEPENDENCY.md` the only authoritative human source for exact versions?
- [ ] Have any exact-version duplications outside `DEPENDENCY.md` been removed or explicitly de-authorized?
- [ ] If `ARCHITECTURE.md` mentions versions, are they clearly non-authoritative?

### Reviewer notes
- Dependency reviewed:
- Section result:
- Issues found:

---

## Section 2 — Root runtime/toolchain consistency

### 2.1 Node consistency
- [ ] Does `.nvmrc` match the approved Node baseline?
- [ ] Does `package.json` `engines.node` match the approved Node baseline?
- [ ] Do CI workflow Node references match the approved Node baseline?

### 2.2 Package manager consistency
- [ ] Does root `package.json` `packageManager` match the approved pnpm version?
- [ ] Do CI workflow pnpm references match the approved pnpm version?
- [ ] Is the pnpm version still aligned with `DEPENDENCY.md`?

### 2.3 Core toolchain references
- [ ] Are TypeScript references aligned with `DEPENDENCY.md`?
- [ ] Are Turborepo references aligned with `DEPENDENCY.md`?
- [ ] Are core framework references aligned where they appear in machine-truth files?

### Reviewer notes
- Runtime/toolchain items reviewed:
- Section result:
- Issues found:

---

## Section 3 — Manifest and workspace consistency

### 3.1 Internal dependencies
- [ ] Are all internal package dependencies using `workspace:*`?
- [ ] Are there any hardcoded internal semver ranges?
- [ ] Are there any relative-path dependency workarounds across package boundaries?

### 3.2 Allowed placement
- [ ] Is the dependency installed in the correct owning internal package?
- [ ] Was the dependency kept out of the app when `DEPENDENCY.md` assigns ownership to a shared package?
- [ ] Were no extra installs added “for convenience” in consuming apps?

### 3.3 Workspace correctness
- [ ] Does `pnpm-workspace.yaml` still reflect the intended workspace package layout?
- [ ] Were no ad hoc workspace patterns added without approval?

### Reviewer notes
- Packages/manifests reviewed:
- Section result:
- Issues found:

---

## Section 4 — Lockfile and install discipline

### 4.1 Lockfile presence
- [ ] Does the PR include root lockfile updates when dependencies changed?
- [ ] Is there exactly one shared root lockfile governing the repo?

### 4.2 CI install mode
- [ ] Does CI still use frozen-lockfile install mode?
- [ ] Has no install workflow been loosened without approval?

### 4.3 Determinism
- [ ] Is the lockfile change proportional to the dependency change?
- [ ] Are unexpected lockfile changes explained?

### Reviewer notes
- Lockfile reviewed:
- Section result:
- Issues found:

---

## Section 5 — Version-policy hygiene

### 5.1 `latest` rule
- [ ] Is `latest` absent from all repo manifests?
- [ ] If `latest` appears anywhere, is it only in tool-command docs/examples explicitly allowed by policy?

### 5.2 Placeholder hygiene
- [ ] Are no ambiguous freeform version placeholders being used as implementation authority?
- [ ] If a dependency is still validation pending, is it being kept out of active implementation?
- [ ] If an approved range is used, is the range intentional and documented?

### 5.3 Normalization quality
- [ ] Does each dependency have one canonical policy/value in `DEPENDENCY.md`?
- [ ] Are there no internal contradictions such as one section using one exact version and another using a different one?

### Reviewer notes
- Version-policy items reviewed:
- Section result:
- Issues found:

---

## Section 6 — Root exception controls

### 6.1 Overrides / packageExtensions
- [ ] Are all `overrides` root-only?
- [ ] Are all `packageExtensions` root-only?
- [ ] Does each exception have a reason?
- [ ] Does each exception have an owner?
- [ ] Does each exception have a cleanup target or review note?

### 6.2 Exception necessity
- [ ] Was the exception actually necessary?
- [ ] Was a less invasive solution ruled out first?
- [ ] Was the exception recorded in `DEPENDENCY.md` or an ADR when appropriate?

### Reviewer notes
- Exceptions reviewed:
- Section result:
- Issues found:

---

## Section 7 — Shared package dependency changes

Use this section when a shared package changed its dependency surface.

### 7.1 Shared package dependency discipline
- [ ] Do new external dependencies belong to this package according to `DEPENDENCY.md`?
- [ ] Do new internal dependencies fit the repository dependency flow?
- [ ] Was the package public API preserved or intentionally versioned if affected?

### 7.2 Shared package change intent
- [ ] Was a Changeset considered or added if the change affects public behavior?
- [ ] Were package docs updated if usage expectations changed?
- [ ] Were tests updated to reflect the dependency change?

### Reviewer notes
- Shared package reviewed:
- Section result:
- Issues found:

---

## Section 8 — Milestone and activation compliance

### 8.1 Milestone scope
- [ ] Is the dependency/package change allowed in the current milestone?
- [ ] Did the change avoid activating deferred packages early?

### 8.2 Conditional activation
- [ ] If the change touches a conditional package, is its trigger clearly satisfied?
- [ ] Is the package approved in `REPO-STATE.md`?
- [ ] Is the relevant decision already locked in `DECISION-STATUS.md`?

### Reviewer notes
- Milestone/activation reviewed:
- Section result:
- Issues found:

---

## Section 9 — CI drift-check alignment

### 9.1 Human review vs CI coverage
- [ ] Is the relevant drift condition already enforced in CI?
- [ ] If not, should a CI check be added?
- [ ] Did this review discover a new repeatable drift class that belongs in automation?

### 9.2 Known required CI checks
Confirm the repo still fails appropriately on:
- [ ] runtime/toolchain drift
- [ ] non-`workspace:*` internal deps
- [ ] `latest` in manifests
- [ ] missing lockfile updates after dependency changes
- [ ] dependency-truth conflicts between docs and machine-truth files

### Reviewer notes
- CI alignment reviewed:
- Section result:
- Issues found:

---

## Section 10 — Final audit outcome

### Final outcome
- [ ] Pass
- [ ] Pass with follow-up required
- [ ] Fail

### Summary
- PR / change reviewed:
- Reviewer:
- Date:
- Dependencies affected:
- Final result:
- Follow-up actions:

---

# Fast-fail conditions

Fail the audit immediately if any of the following are true:

- `DEPENDENCY.md` was not updated first for a dependency change
- exact versions disagree across authoritative sources
- `latest` appears in a repo manifest
- internal dependencies are not using `workspace:*`
- a conditional package was activated without trigger satisfaction
- root runtime/toolchain references drifted
- overrides/packageExtensions were added casually
- lockfile updates are missing after dependency changes

---

# Reviewer reminder

Topic 5 is not just about pinning versions.

It is about maintaining trust in the repository’s dependency authority model.

A dependency review passes only when:
- human truth is clear
- machine truth is aligned
- the lockfile is consistent
- milestone/activation rules are respected
- AI tools could not reasonably misread the change

When in doubt, do not pass the audit until the authority chain is clean.