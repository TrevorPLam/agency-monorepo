# 10-config-eslint: Usage Guide

## Quick Start

### For Packages

```javascript
// eslint.config.mjs
import agency from '@agency/config-eslint';

export default [...agency];
```

### For Next.js Apps

```javascript
// eslint.config.mjs
import agencyNext from '@agency/config-eslint/next';

export default [...agencyNext];
```

## Step-by-Step Setup

### 1. Install Config Package

```bash
pnpm add -D @agency/config-eslint
```

### 2. Create ESLint Config

Create `eslint.config.mjs` in package/app root:

```javascript
import agency from '@agency/config-eslint';

export default [
  ...agency,
  // Add custom rules here
  {
    rules: {
      '@typescript-eslint/no-unused-vars': 'warn',
    },
  },
];
```

### 3. Update package.json

Add lint script:

```json
{
  "scripts": {
    "lint": "eslint .",
    "lint:fix": "eslint . --fix"
  }
}
```

### 4. Verify Setup

```bash
pnpm lint
# Should run without errors
```

## Customizing Rules

### Override Specific Rules

```javascript
export default [
  ...agency,
  {
    rules: {
      // Disable a rule
      '@typescript-eslint/explicit-function-return-type': 'off',
      // Change severity
      'import/no-cycle': 'warn',
    },
  },
];
```

### Add File-Specific Rules

```javascript
export default [
  ...agency,
  {
    files: ['**/*.test.ts', '**/*.test.tsx'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
];
```

## Troubleshooting

### Issue: "Cannot find module '@agency/config-eslint'"

**Solution**: Install the package:
```bash
pnpm add -D @agency/config-eslint
```

### Issue: "Parsing error: Unexpected token"

**Solution**: Ensure TypeScript parser is configured:
```javascript
export default [
  ...agency,
  {
    languageOptions: {
      parserOptions: {
        project: './tsconfig.json',
      },
    },
  },
];
```

### Issue: Import restrictions not working

**Solution**: Verify you're using the package's public exports:
```javascript
// ❌ Bad - importing from src
import { utils } from '@agency/core-utils/src/internal';

// ✅ Good - using public export
import { utils } from '@agency/core-utils';
```

## IDE Integration

### VS Code

Install ESLint extension. It will automatically detect `eslint.config.mjs`.

### WebStorm

ESLint 9+ flat config is supported in WebStorm 2023.3+.

## Continuous Integration

Add to CI pipeline:

```yaml
# .github/workflows/ci.yml
- name: Lint
  run: pnpm lint
```
