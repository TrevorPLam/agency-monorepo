# AI Agent Handoff Prompt

## Purpose

Bounded implementation prompt for AI coding agents. Use this structure when handing off tasks to ensure consistent, compliant implementation.

---

## Before Starting Implementation

### Required Reading (MUST READ)

Read these documents in order:

1. **This handoff prompt** — Understand the bounded scope
2. `docs/AGENTS.md` — Hard constraints that override everything
3. **Task folder documents**:
   - `00-*-overview.md` — What we're building
   - `01-*-spec.md` — How to build it
   - `02-*-constraints.md` — What not to do
4. **Target package documentation**:
   - `packages/[domain]/[package]/README.md`
   - `packages/[domain]/[package]/CHANGELOG.md`
   - `packages/[domain]/[package]/package.json` (check exports)

### Verify Before Coding

Confirm ALL of these:

- [ ] Task trigger conditions are met (check DEPENDENCY.md §14 for 🔒 packages)
- [ ] Dependencies needed are listed in DEPENDENCY.md §13
- [ ] Versions match exact pins
- [ ] Import paths exist in target package exports
- [ ] No import boundary violations will occur

### Stop Conditions

STOP and ask if:

- A required dependency is not in DEPENDENCY.md
- The import path needed doesn't exist in package exports
- Task conflicts with AGENTS.md constraints
- Conditional package trigger is unclear
- High-risk area requires owner approval

---

## During Implementation

### Code Style Rules

**Follow these without exception:**

1. **Imports**: Only from package exports, never from `src/` internals
2. **Dependencies**: Install in correct internal package per DEPENDENCY.md §13
3. **Types**: Strict TypeScript, Zod schemas for validation
4. **React**: Server Components by default, 'use client' only when necessary
5. **Database**: Mandatory client scoping, never optional
6. **Tests**: Unit tests for utilities, component tests for UI

### AI Agent Session Protocol

**On EVERY query context window:**

1. Restate current goal in one sentence
2. List files being modified
3. State how changes respect dependency flow
4. Note any deviations with justification

**Example:**
```
Goal: Add date formatting utility to @agency/core-utils
Files: packages/core-utils/src/formatters/date.ts, date.test.ts
Dependency flow: core-utils sits at base, no imports from higher domains
Note: Adding new export to package.json exports field
```

### Scope Control

**Do NOT:**

- Add features not in the spec
- Refactor unrelated code
- Upgrade dependencies without explicit instruction
- Add new dependencies not in DEPENDENCY.md
- Create new packages without confirmed trigger
- Modify high-risk areas without owner awareness

**If scope creep is tempting:**

1. Document the additional work needed
2. Note it as a separate task
3. Complete current bounded task first
4. Propose new task separately

---

## Before Submitting Work

### Required Checklist

Run through `05-agents-qa-checklist.md` and confirm:

- [ ] All pre-implementation verification done
- [ ] Import compliance verified
- [ ] Tests added and passing
- [ ] Type checking passes
- [ ] Linting passes
- [ ] Documentation updated
- [ ] Changeset created (if needed)

### Self-Review Questions

Answer these in your PR description:

1. **What** changed? (Brief summary)
2. **Why** was this needed? (Link to task/requirement)
3. **How** does it work? (Key implementation details)
4. **What** could go wrong? (Risks, mitigation)

### Verification Commands

Run these and confirm output:

```bash
# Type checking
pnpm --filter @agency/[package] typecheck

# Linting
pnpm --filter @agency/[package] lint

# Testing
pnpm --filter @agency/[package] test

# Building
pnpm --filter @agency/[package] build
```

All must pass before submission.

---

## When Uncertain

### Escalation Path

If you encounter any of these, STOP and ask:

| Situation | Action |
|-----------|--------|
| Constraint conflict | State both rules, ask for resolution |
| Missing dependency in DEPENDENCY.md | Don't install; ask for document update |
| Export doesn't exist | Don't deep import; ask for public API addition |
| Test failure you don't understand | Ask before weakening/removing test |
| Security header change | Confirm with security owner per CODEOWNERS |
| Database schema change | Confirm migration plan and blast radius |
| Auth/session change | Confirm with auth owner per CODEOWNERS |

### Uncertainty Template

When asking for clarification, use this format:

```
**Goal**: [Task from spec]
**Conflict**: [What's blocking/confusing]
**Options**:
1. [Option A with tradeoffs]
2. [Option B with tradeoffs]
**Recommendation**: [Your suggested approach]
**Question**: What is the preferred path?
```

---

## Output Contract

When submitting implementation work, provide:

### Summary
- What was implemented
- Files modified/created
- Tests added/updated

### Verification
- Commands run and results
- Checklist status (from 05-agents-qa-checklist)

### Notes for Reviewer
- Design decisions made
- Tradeoffs considered
- Areas needing extra review

### Not Implemented (if applicable)
- Out-of-scope items noted
- Future work identified

---

## Default Philosophy

When no rule applies:

1. **Do less** — A missing feature is easier to add than a wrong one is to remove
2. **Ask early** — Clarification before coding saves rework
3. **Document** — Explain "why" in code comments and PR description
4. **Test** — If it has behavior, it has tests
5. **Respect boundaries** — Package, dependency, and data flow rules exist for a reason

---

## Remember

**Your job is not only to make code work. Your job is to preserve architecture.**

- Optimize for architectural stability, not speed
- Prefer explicit boundaries over convenience
- Think about the next AI agent who will work here
- When in doubt, the most conservative choice is usually correct

---

*Part of a0-docs-agents task — created April 2026.*
