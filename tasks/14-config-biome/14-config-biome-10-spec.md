# 14-config-biome: Implementation Specification

## Task Header

| Field | Value |
|-------|-------|
| **State** | `deferred` — Evaluation-only lane; not a canonical default |
| **Trigger** | Explicit human decision to evaluate or adopt Biome beyond documentation |
| **Minimum Consumers** | n/a (tooling evaluation) |
| **Dependencies** | Biome toolchain, `10-config-eslint`, `13-config-prettier` |
| **Exit Criteria** | Evaluation scope, non-goals, and migration conditions are explicit |
| **Implementation Authority** | `REPO-STATE.md` — Deferred until explicit tooling approval |
| **Version Authority** | `DEPENDENCY.md` §18 — Biome evaluation in progress |
| **Supersedes** | n/a |
| **Superseded by** | n/a |

## Cross-references

- Decision status: `DECISION-STATUS.md` — Biome evaluation `open`
- Version pins: `DEPENDENCY.md` §18
- Related: `10-config-eslint`, `13-config-prettier`, `01-config-biome-migration`
- Note: Evaluation-only; do not treat this task as a parallel default lint/format lane

## Files
```
packages/config/biome-config/
├── package.json
├── biome.json
└── README.md
```

### `package.json`
```json
{
  "name": "@agency/config-biome",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "exports": {
    ".": "./biome.json",
    "./base": "./biome.json"
  },
  "files": ["biome.json", "README.md"],
  "publishConfig": { "access": "restricted" }
}
```

### `biome.json`
```json
{
  "$schema": "https://biomejs.dev/schemas/<validated-version-from-dependency-md>/schema.json",
  "vcs": {
    "enabled": true,
    "clientKind": "git",
    "useIgnoreFile": ".gitignore"
  },
  "organizeImports": true,
  "linter": {
    "enabled": true,
    "rules": {
      "recommended": true,
      "suspicious": {
        "noExplicitAny": "error"
      },
      "style": {
        "noUnusedVariables": "error",
        "useConst": "error"
      },
      "correctness": {
        "noUnusedVariables": "error",
        "noUnreachableCode": "error"
      },
      "performance": {
        "noAccumulatingSpread": "error"
      },
      "complexity": {
        "noExtraBooleanCast": "error",
        "noMultipleVariableDeclarations": "error"
      }
    }
  },
  "formatter": {
    "enabled": true,
    "formatWithErrors": true,
    "indentStyle": "tab",
    "indentWidth": 2,
    "lineWidth": 100,
    "lineEnding": "lf"
  },
  "javascript": {
    "formatter": {
      "quoteStyle": "asNeeded",
      "semicolons": "asNeeded",
      "trailingCommas": "es5"
    },
    "globals": ["Node", "process"]
  },
  "typescript": {
    "enabled": true,
    "all": true,
    "strict": true
  },
  "files": {
    "ignore": ["node_modules", ".next", "dist", "build", ".turbo"],
    "ignoreUnknown": false,
    "include": ["src/**/*"]
  }
}
```

## Configuration Details

### Linter Configuration
- **Performance Focus**: Benchmark Biome against the current ESLint baseline; do not assume benchmark results will generalize to repo adoption
- **Strict Rules**: Suspicious code, unused variables, unreachable code detection
- **Import Organization**: Automatic import sorting and boundary enforcement

### Formatter Configuration  
- **Consistent Formatting**: 2-space indentation, 100 character line width
- **JavaScript Standards**: ES5+ semicolons, trailing commas as needed

### TypeScript Integration
- **Full Type Safety**: All TypeScript features enabled
- **Project References**: Compatible with TypeScript Project References

## Usage

### In Package
```json
{
  "biome": "@agency/config-biome"
}
```

### In Consuming Package
```json
{
  "biomeConfig": "@agency/config-biome"
}
```

### Root Integration
```json
{
  "scripts": {
    "lint:biome:eval": "pnpm --filter <evaluation-target> biome check .",
    "format:biome:eval": "pnpm --filter <evaluation-target> biome format .",
    "lint:biome:fix:eval": "pnpm --filter <evaluation-target> biome check . --apply"
  }
}
```

## Evaluation Strategy
1. **Phase 1**: Add Biome as an isolated evaluation lane for approved targets only
2. **Phase 2**: Compare rule coverage, workflow impact, and performance against ESLint + Prettier
3. **Phase 3**: Update decision docs only if the evaluation justifies broader adoption

## Potential Benefits Under Evaluation
- Faster linting than ESLint on representative targets
- A possible unified linting and formatting surface if parity is proven
- Rust-based performance with low overhead
- Workspace-aware configuration if the tool proves compatible with repo requirements
