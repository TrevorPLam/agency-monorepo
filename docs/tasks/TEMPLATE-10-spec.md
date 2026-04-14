> **Non-Authoritative Warning**
>
> This is a task specification, not implementation authority.
>
> **Read first:**
> 1. `REPO-STATE.md` — what is approved to build now
> 2. `DECISION-STATUS.md` — which decisions are locked vs open
> 3. `DEPENDENCY.md` — exact versions and provider lanes
>
> **Before implementation:** Verify this package is approved in `REPO-STATE.md` and all dependencies are allowed.

---

# {family-key}: Implementation Specification

## Task Header

| Field | Value |
|-------|-------|
| **State** | {Draft/Review/Approved} |
| **Trigger** | {What activates this task} |
| **Dependencies** | {Required prerequisites} |
| **Exit Criteria** | {Completion criteria} |
| **Package/App** | `{package-name}` |

## Cross-References

- Overview: `{family-key}-00-overview.md`
- Constraints: `{family-key}-20-constraints.md`
- ADR: `{family-key}-30-adr-*.md`
- QA Checklist: `{family-key}-60-qa-checklist.md`
- Execution Prompt: `{family-key}-70-execution-prompt.md`

## Files

```
{path-to-package}/
├── package.json
├── tsconfig.json
├── src/
│   ├── index.ts
│   └── {other-files}
└── README.md
```

### `package.json`

```json
{
  "name": "@agency/{package-name}",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "exports": {
    ".": "./src/index.ts"
  },
  "dependencies": {},
  "devDependencies": {}
}
```

### `src/index.ts`

```ts
// Implementation goes here
```

## Critical Requirements

1. {Requirement 1}
2. {Requirement 2}
3. {Requirement 3}

## Verification

```bash
# Type check
pnpm --filter @agency/{package-name} typecheck

# Test
pnpm --filter @agency/{package-name} test

# Build
pnpm --filter @agency/{package-name} build
```
