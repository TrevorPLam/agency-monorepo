# 10-tools/03-codemods: Codemods Infrastructure

## Purpose
Create automated migration scripts (codemods) for handling breaking changes in shared packages. Codemods transform code automatically, reducing manual migration effort when APIs change.

## Dependencies
- TASK_0 (Root Repository Scaffolding)
- TASK_29 (App Generator) - for understanding app structure
- TASK_30 (Package Generator) - for understanding package structure

## Files

```
tools/
└── codemods/
    ├── README.md
    ├── tsconfig.json
    ├── package.json
    └── src/
        ├── index.ts
        ├── utils/
        │   └── ast-helpers.ts
        └── transforms/
            ├── example-migration/
            │   ├── index.ts
            │   ├── test.ts
            │   └── fixture.ts
            └── template/
                └── index.ts
```

### `package.json`
```json
{
  "name": "@agency/codemods",
  "version": "0.1.0",
  "private": true,
  "description": "Automated code migration tools for the monorepo",
  "type": "module",
  "bin": {
    "agency-codemod": "./dist/index.js"
  },
  "scripts": {
    "build": "tsc",
    "dev": "tsc --watch",
    "test": "vitest run",
    "apply": "node ./dist/index.js"
  },
  "dependencies": {
    "@agency/core-utils": "workspace:*",
    "jscodeshift": "^0.15.0",
    "glob": "^10.3.0",
    "commander": "^11.0.0"
  },
  "devDependencies": {
    "@agency/config-eslint": "workspace:*",
    "@agency/config-typescript": "workspace:*",
    "@types/jscodeshift": "^0.11.0",
    "@types/node": "latest",
    "typescript": "6.0.0",
    "vitest": "4.1.3"
  }
}
```

### `tsconfig.json`
```json
{
  "extends": "@agency/config-typescript/library",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*"]
}
```

### Main Entry (`src/index.ts`)
```typescript
#!/usr/bin/env node

import { Command } from "commander";
import { glob } from "glob";
import { runTransform } from "jscodeshift/src/Runner.js";
import { resolve } from "path";

const program = new Command();

program
  .name("agency-codemod")
  .description("Run automated code migrations")
  .version("0.1.0");

program
  .command("list")
  .description("List available codemods")
  .action(async () => {
    const transformsDir = resolve(__dirname, "transforms");
    const transforms = await glob("*/index.ts", { cwd: transformsDir });
    
    console.log("Available codemods:");
    transforms.forEach(t => {
      const name = t.replace("/index.ts", "");
      console.log(`  - ${name}`);
    });
  });

program
  .command("run <transform>")
  .description("Run a specific codemod")
  .option("-p, --path <path>", "Target path", "apps/")
  .option("-d, --dry", "Dry run (no changes)", false)
  .action(async (transform, options) => {
    const transformPath = resolve(__dirname, "transforms", transform, "index.ts");
    const targetPath = resolve(process.cwd(), options.path);
    
    console.log(`Running ${transform} on ${targetPath}`);
    
    const files = await glob("**/*.{ts,tsx}", { cwd: targetPath });
    
    await runTransform(transformPath, files, {
      dry: options.dry,
      parser: "tsx",
      extensions: "tsx,ts",
    });
  });

program.parse();
```

### Example Transform (`src/transforms/rename-button-variant/index.ts`)
```typescript
import { API, FileInfo } from "jscodeshift";

/**
 * Example codemod: Rename button variant "primary" to "default"
 * 
 * This demonstrates the pattern for creating migrations.
 * Real codemods would handle more complex transformations.
 */

export default function transformer(file: FileInfo, api: API) {
  const j = api.jscodeshift;
  const root = j(file.source);
  
  let hasChanges = false;
  
  // Find Button components with variant="primary"
  root
    .find(j.JSXOpeningElement, { name: { name: "Button" } })
    .find(j.JSXAttribute, { name: { name: "variant" } })
    .forEach(path => {
      const value = path.value.value;
      
      if (value?.type === "StringLiteral" && value.value === "primary") {
        value.value = "default";
        hasChanges = true;
      }
    });
  
  return hasChanges ? root.toSource() : null;
}
```

### Test for Transform (`src/transforms/rename-button-variant/test.ts`)
```typescript
import { defineTest } from "jscodeshift/src/testUtils";

defineTest(__dirname, "rename-button-variant", null, "fixture", {
  parser: "tsx",
});
```

### Fixture (`src/transforms/rename-button-variant/fixture.ts`)
```typescript
// Input
export function Component() {
  return (
    <div>
      <Button variant="primary">Click me</Button>
      <Button variant="secondary">Cancel</Button>
    </div>
  );
}

// Expected output
export function Component() {
  return (
    <div>
      <Button variant="default">Click me</Button>
      <Button variant="secondary">Cancel</Button>
    </div>
  );
}
```

### Transform Template (`src/transforms/template/index.ts`)
```typescript
import { API, FileInfo } from "jscodeshift";

/**
 * Template for new codemods
 * 
 * Copy this directory and modify for your specific migration:
 * 1. Rename the directory
 * 2. Update this JSDoc description
 * 3. Implement the transformation logic
 * 4. Add test fixture
 * 5. Run tests to verify
 */

export default function transformer(file: FileInfo, api: API) {
  const j = api.jscodeshift;
  const root = j(file.source);
  
  let hasChanges = false;
  
  // Your transformation logic here
  // Example: Find and replace patterns
  
  return hasChanges ? root.toSource() : null;
}

/**
 * Usage:
 *   npx agency-codemod run rename-button-variant -p apps/
 * 
 * Or from root:
 *   pnpm codemod:run rename-button-variant
 */
```

### README (`README.md`)
```markdown
# Codemods

Automated code transformation tools for the agency monorepo.

## When to Create a Codemod

Create a codemod when:
- A shared package API changes (renamed exports, changed signatures)
- A pattern is deprecated and needs migration
- Mass refactoring is needed across many files

## Creating a New Codemod

1. Copy the template:
   ```bash
   cp -r src/transforms/template src/transforms/my-migration
   ```

2. Implement the transformation in `index.ts`

3. Add test fixture showing input/output

4. Test the codemod:
   ```bash
   pnpm test
   ```

5. Document in changeset

## Running Codemods

### List available codemods:
```bash
pnpm codemod:list
```

### Run a codemod (dry run first):
```bash
pnpm codemod:run rename-button-variant -p apps/internal-tools --dry
```

### Apply the codemod:
```bash
pnpm codemod:run rename-button-variant -p apps/internal-tools
```

## Common Patterns

### Rename an import
```typescript
root
  .find(j.ImportDeclaration)
  .filter(path => path.value.source.value === "old-package")
  .forEach(path => {
    path.value.source.value = "new-package";
  });
```

### Rename a component prop
```typescript
root
  .find(j.JSXAttribute, { name: { name: "oldProp" } })
  .forEach(path => {
    path.value.name.name = "newProp";
  });
```

### Add a new prop
```typescript
root
  .find(j.JSXOpeningElement, { name: { name: "Button" } })
  .forEach(path => {
    const newProp = j.jsxAttribute(
      j.jsxIdentifier("newProp"),
      j.stringLiteral("value")
    );
    path.value.attributes.push(newProp);
  });
```

## Testing

Each codemod should have:
- A test file using `defineTest`
- A fixture showing before/after
- Edge case coverage

Run all codemod tests:
```bash
pnpm --filter @agency/codemods test
```
```

## Root package.json Scripts

Add to root `package.json`:
```json
{
  "scripts": {
    "codemod:list": "pnpm --filter @agency/codemods apply list",
    "codemod:run": "pnpm --filter @agency/codemods apply run"
  }
}
```

## Documentation Requirements

Per ARCHITECTURE.md section on Documentation Standard, this package must have:

1. **README.md** ✓ (explains purpose, usage, examples)
2. **CHANGELOG.md** (generated by Changesets)
3. **package.json with exports** ✓ (bin entry for CLI)
4. **Test scripts** ✓ (vitest)
5. **Usage examples** ✓ (in README and template)

## Integration with Changesets

When a breaking change requires a codemod:

1. Create the codemod first
2. Add changeset with `major` classification
3. Include migration instructions:
   ```markdown
   ## Migration
   Run the automated codemod:
   ```bash
   pnpm codemod:run rename-button-variant
   ```
   ```

## Verification

```bash
# Build the codemod tool
pnpm --filter @agency/codemods build

# List available codemods
pnpm codemod:list

# Run example codemod in dry mode
pnpm codemod:run rename-button-variant --dry

# Run tests
pnpm --filter @agency/codemods test
```

## Related Tasks

- TASK_29: App Generator (scaffolds new apps)
- TASK_30: Package Generator (scaffolds new packages)
- TASK_28: Changeset Configuration (versions changes)
- TASK_21: AI Agent Rules (codemods help enforce rules)
