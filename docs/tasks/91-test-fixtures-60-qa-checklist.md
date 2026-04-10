# Test Fixtures: QA Checklist

## Package Validation

### Package Structure
- [ ] `package.json` has `type: "module"`
- [ ] `package.json` has `private: true`
- [ ] `package.json` has `publishConfig.access: restricted`
- [ ] `@faker-js/faker` pinned to 10.4.0
- [ ] `@agency/core-types` uses `workspace:*`
- [ ] No test runner dependencies (vitest, testing-library, playwright)
- [ ] No other `@agency/*` dependencies

### Factory Files
- [ ] One file per domain entity (client.ts, project.ts, etc.)
- [ ] Each file exports `createMock<Entity>` function
- [ ] Each file exports `createMock<Entities>` (array) function
- [ ] All factories accept `Partial<T>` overrides parameter
- [ ] All factories return proper TypeScript types

## Functionality Testing

### Faker.js Integration
```bash
# Verify Faker.js version
pnpm list @faker-js/faker | grep "10.4.0"

# Verify ESM imports work
node --input-type=module -e "import { faker } from '@faker-js/faker'; console.log(faker.person.firstName());"
```

### Factory Output Validation
- [ ] `createMockClient()` returns valid Client type
- [ ] `createMockProject()` returns valid Project type
- [ ] `createMockUser()` returns valid User type
- [ ] `createMockInvoice()` returns valid Invoice type
- [ ] All IDs are unique across multiple calls
- [ ] All timestamps are valid ISO strings
- [ ] All enums use valid values

### Schema Validation Test
```typescript
// Verify with Zod schemas
import { clientSchema } from '@agency/core-types';
import { createMockClient } from './client';

const client = createMockClient();
const result = clientSchema.safeParse(client);
expect(result.success).toBe(true);
```

## Type Safety

### TypeScript Compilation
- [ ] `tsc --noEmit` passes with no errors
- [ ] All imports resolve correctly
- [ ] No `any` types in factory functions
- [ ] Override parameters typed as `Partial<T>`
- [ ] Return types match `@agency/core-types`

### ESM Verification
- [ ] No `require()` statements
- [ ] No `module.exports`
- [ ] All imports use ES module syntax
- [ ] Dynamic imports use `import()` syntax

## Node.js Compatibility

### Version Check
```bash
# Verify Node version requirement
node --version  # Must be v20.19+, v22.13+, or v24.x
```

### ESM Module Resolution
```bash
# Test ESM import in Node
node --input-type=module -e "
  import { createMockClient } from './packages/testing/fixtures/src/client.ts';
  console.log(createMockClient());
"
```

## Code Quality

### Linting
- [ ] ESLint passes with no errors
- [ ] No `console.log` statements in factory code
- [ ] No commented-out code
- [ ] Consistent code style

### Documentation
- [ ] 01-config-biome-migration-50-ref-quickstart.md explains package purpose
- [ ] 01-config-biome-migration-50-ref-quickstart.md documents Faker.js version requirement
- [ ] 01-config-biome-migration-50-ref-quickstart.md references `@agency/core-testing` alternative
- [ ] All factory functions have JSDoc comments

## Cross-Package Integration

### Relationship to core-types
- [ ] All types imported from `@agency/core-types`
- [ ] No type redefinitions
- [ ] Builds after `@agency/core-types` in pipeline

### Relationship to core-testing
- [ ] Documentation explains when to use each package
- [ ] No duplicate fixture logic
- [ ] Clear separation: Faker.js vs crypto.randomUUID()

### Relationship to test-setup
- [ ] No test runner configuration in this package
- [ ] No cross-imports between packages

## Performance

### Factory Performance
- [ ] `createMockClient()` executes in <10ms
- [ ] `createMockClients(100)` executes in <100ms
- [ ] No memory leaks in batch creation

### Bundle Size
- [ ] Package size <500KB (Faker.js is the main dependency)
- [ ] Tree-shaking works correctly

## Testing

### Self-Tests
- [ ] Factory self-tests exist
- [ ] All factories pass schema validation
- [ ] Override functionality tested
- [ ] Array creation tested

### Consumer Test
Create test in a consuming package:
```typescript
import { createMockClient } from '@agency/test-fixtures';

test('factory generates valid data', () => {
  const client = createMockClient({ name: 'Test' });
  expect(client.name).toBe('Test');
  expect(client.id).toBeDefined();
});
```

## Exit Criteria

Before marking this task complete:

1. [ ] All factories generate type-safe, valid data
2. [ ] Faker.js 10.4.0 pinned and working
3. [ ] ESM imports work correctly
4. [ ] Node version requirement (20.19+) documented
5. [ ] No test runner dependencies
6. [ ] Relationship to core-testing clearly documented
7. [ ] All factory files have corresponding tests
8. [ ] README accurate and complete
9. [ ] Changeset created for initial release

## Sign-off

- [ ] Package structure reviewed
- [ ] Factory outputs validated against schemas
- [ ] ESM compatibility verified
- [ ] Documentation reviewed
- [ ] Ready for growth-stage implementation
