# 14-config-biome: Implementation Specification

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
  "$schema": "https://biomejs.dev/schemas/1.9.0/schema.json",
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
- **Performance Focus**: 56x faster than ESLint according to 2026 benchmarks
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
    "lint": "biome check .",
    "format": "biome format .",
    "lint:fix": "biome check . --apply"
  }
}
```

## Migration Strategy
1. **Phase 1**: Add Biome alongside ESLint for new projects
2. **Phase 2**: Gradually migrate existing packages to Biome-only
3. **Phase 3**: Remove ESLint dependencies once migration complete

## Performance Benefits
- 56x faster linting than ESLint
- Single tool for linting + formatting
- Rust-based performance with minimal overhead
- Workspace-aware configuration out of the box
