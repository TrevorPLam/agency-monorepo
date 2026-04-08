# Workspace Boundaries Specification

## What Boundary Enforcement Checks

### No App-to-App Imports
- Apps must be self-contained
- No `import from "../../apps/other-app/..."`
- Enforced at CI and optionally pre-commit

### Package Import Rules
- Only public exports allowed (from `package.json` exports field)
- No deep imports into package internals
- Domain dependency flow respected

### Workspace Isolation
- `apps/*` cannot import from sibling apps
- `packages/*` cannot import from apps
- `tools/*` have restricted access patterns

## Implementation

### Tool Structure

```
tools/boundaries-check/
├── src/
│   ├── index.ts              # CLI entry
│   ├── checker.ts            # Core boundary logic
│   ├── rules.ts              # Rule definitions
│   └── reporters/
│       ├── console.ts        # CLI output
│       └── github.ts         # PR annotations
├── package.json
├── tsconfig.json
└── README.md
```

### Boundary Rules Configuration

```typescript
// tools/boundaries-check/src/rules.ts
export const boundaryRules = {
  apps: {
    canImport: ["packages/*", "shared/*"],
    cannotImport: ["apps/*"],
    requirePublicExports: true,
  },
  packages: {
    canImport: ["packages/*"],
    cannotImport: ["apps/*"],
    requirePublicExports: true,
    // Domain flow enforcement
    dependencyFlow: [
      "config/*",
      "core/*",
      ["data/*", "ui/*", "auth/*", "communication/*"],
    ],
  },
  tools: {
    canImport: ["packages/*"],
    cannotImport: ["apps/*"],
  },
};
```

### Root Integration

Add to root `package.json`:
```json
{
  "scripts": {
    "check-boundaries": "pnpm --filter @agency/boundaries-check check",
    "fix-boundaries": "pnpm --filter @agency/boundaries-check check --fix"
  }
}
```

### CI Integration

```yaml
# .github/workflows/ci.yml
jobs:
  boundaries:
    name: Check Workspace Boundaries
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v3
      - run: pnpm install
      - run: pnpm check-boundaries
```

## Critical Requirements

1. **Fast Execution**
   - Parse `package.json` exports fields only
   - No TypeScript compilation required
   - Cache results between runs

2. **Actionable Output**
   - File path + line number for each violation
   - Suggested fix (codemod link if available)
   - Group by rule type

3. **Fix Mode**
   - Auto-generate codemod for simple renames
   - Suggest public export path for deep imports
   - Create PR with automated fixes

## Verification Steps

```bash
# Check boundaries
pnpm check-boundaries

# Should pass on clean repo
# Should fail with violations if apps import from apps
# Should report exact file locations
```

## References

- [next-forge boundaries pattern](https://github.com/stackframe-next/next-forge)
- [Vercel monorepo best practices](https://vercel.com/docs/monorepos)
