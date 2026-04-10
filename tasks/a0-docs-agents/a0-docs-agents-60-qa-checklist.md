# AI Agent Rules — QA Checklist

## Purpose

Validation checklist for ensuring AI agents and their work comply with repository standards. Use this before submitting any implementation.

---

## Pre-Implementation Verification

### Documentation Reading

- [ ] `docs/AGENTS.md` has been read completely
- [ ] Task folder overview (00-*) has been read
- [ ] Task specification (01-*) has been read
- [ ] Target package `README.md` has been read
- [ ] Target package `CHANGELOG.md` has been reviewed for context

### Package Verification

- [ ] Target package `package.json` exports field has been checked
- [ ] Import path needed exists in exports (or has been requested)
- [ ] Package is not 🔒 conditional without confirmed trigger

### Dependency Verification

- [ ] All dependencies to be added exist in DEPENDENCY.md §13
- [ ] Versions match exact pins in DEPENDENCY.md
- [ ] Dependencies will be installed in correct internal package
- [ ] No packages will be installed directly in apps (except app-specific deps)

---

## During Implementation

### Import Compliance

- [ ] No imports from `apps/*` into `packages/*`
- [ ] No imports from `src/` across package boundaries
- [ ] No deep imports bypassing public API
- [ ] No relative paths (`../../`) across packages
- [ ] All imports respect dependency flow direction

### Code Quality

- [ ] TypeScript strict mode is satisfied
- [ ] No `any` types without explicit justification
- [ ] Zod schemas used for data validation
- [ ] Proper error handling (not just console.log)
- [ ] No TODO comments left (unless tracked in issue)

### React Patterns

- [ ] Server Components used by default
- [ ] 'use client' only when browser APIs or hooks needed
- [ ] React Compiler compatibility verified (no manual memoization unless needed)
- [ ] Accessibility attributes included (aria-labels, roles)

### Database Patterns (if applicable)

- [ ] Client scoping is mandatory (never optional)
- [ ] All queries enforce `client_id` filter
- [ ] Schema includes `client_id` on all client-owned tables
- [ ] No cross-client data access possible

---

## Post-Implementation Verification

### Testing

- [ ] Unit tests added for new functions/utilities
- [ ] Component tests added for new components
- [ ] Edge cases tested (null, empty, error states)
- [ ] All tests pass: `pnpm test`
- [ ] No test coverage decreased without justification

### Type Checking

- [ ] `pnpm typecheck` passes in affected packages
- [ ] No TypeScript errors introduced
- [ ] No type assertions (`as Type`) without comment explaining safety

### Linting

- [ ] `pnpm lint` passes
- [ ] No ESLint warnings introduced (or justified with comment)
- [ ] No import boundary violations

### Build

- [ ] `pnpm build` succeeds for affected packages
- [ ] No circular dependencies introduced
- [ ] Package exports resolve correctly

### Documentation

- [ ] Package `README.md` updated if behavior changed
- [ ] `CHANGELOG.md` entry added with changeset
- [ ] Code comments explain "why" not "what"
- [ ] No comments that just repeat code

---

## Change Management Verification

### Version Bump Determination

- [ ] Change type identified (patch/minor/major)
- [ ] Breaking changes documented with migration notes (if major)
- [ ] Deprecated APIs marked with `@deprecated` (if minor)

### Changeset

- [ ] Changeset created: `pnpm changeset`
- [ ] Changeset describes change clearly
- [ ] Correct package(s) selected in changeset
- [ ] Changeset committed with changes

---

## High-Risk Area Verification

If modifying high-risk areas, confirm:

- [ ] Scope restated and agreed upon
- [ ] All downstream consumers identified
- [ ] Blast radius stated in PR description
- [ ] Smallest safe change approach taken
- [ ] Owner approval obtained (if required by CODEOWNERS)

High-risk areas include:
- `packages/config/*`
- `packages/data/db/*`
- `packages/auth/*`
- Root workspace config
- CI workflows
- Security headers
- Environment management

---

## Security Verification

- [ ] No secrets, keys, or tokens committed
- [ ] No `.env` files committed
- [ ] Environment variables use names only (no values)
- [ ] No hardcoded credentials
- [ ] No secrets logged or exposed in error messages

---

## Final Pre-Submission

### Code Review Readiness

- [ ] Self-review completed using this checklist
- [ ] All checklist items checked or explicitly noted as N/A
- [ ] PR description explains what and why
- [ ] Implementation notes added for complex logic
- [ ] Screenshots included for UI changes (if applicable)

### Submission Requirements

- [ ] All CI checks pass
- [ ] No merge conflicts
- [ ] Branch up to date with main
- [ ] Commit messages describe changes (not just "fix" or "update")

---

## Quick Reference

| Violation Type | How to Check |
|----------------|--------------|
| Import boundary | `pnpm lint` will catch `no-restricted-paths` violations |
| Type errors | `pnpm typecheck` in affected packages |
| Test failures | `pnpm test` in affected packages |
| Build issues | `pnpm build` in affected packages |
| Secrets | Manual review — never commit `.env` or keys |
| Client isolation | Code review — verify `client_id` always required |

---

## Sign-Off

Before submitting work, confirm:

> I have read `docs/AGENTS.md` and the relevant task documentation. This implementation follows the dependency flow rules, respects package boundaries, and includes appropriate tests and documentation.

---

*Part of a0-docs-agents task — created April 2026.*
