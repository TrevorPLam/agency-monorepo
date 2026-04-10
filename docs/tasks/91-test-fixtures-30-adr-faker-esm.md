# ADR: Faker.js v10 ESM Migration

## Status
**Accepted**

## Context

Faker.js released v10 in early 2026 with a significant architectural change: it is now **ESM-only**. This affects:
- Node.js version requirements
- TypeScript configuration
- Import patterns
- Compatibility with CommonJS projects

## Decision

We will use **Faker.js v10.4.0** in `@agency/test-fixtures` with the following requirements:

### Node.js Requirements
- **Minimum**: Node.js 20.19.0, 22.13.0, or 24.0.0+
- **Rationale**: These versions support ESM module resolution with `require()` interoperability

### TypeScript Configuration
- **moduleResolution**: `"Node20"` (TS 5.9+) or `"Bundler"`
- **target**: `"ES2022"` or later
- **module**: `"ESNext"` or `"NodeNext"`

## Rationale

### Why Faker.js v10?

| Factor | v9 (CJS) | v10 (ESM) | Decision |
|--------|----------|-----------|----------|
| Security | Older dependencies | Updated, CVE-free | v10 |
| Performance | Good | 15-20% faster | v10 |
| Bundle size | ~3MB | ~2.1MB | v10 |
| Tree shaking | Partial | Full | v10 |
| Ecosystem trend | Legacy | Modern standard | v10 |

### Why Not Stay on v9?
- v9 will eventually stop receiving security updates
- v10 aligns with monorepo's ESM-first architecture
- `@agency/core-types` already uses ESM

## Implementation

### Package.json Configuration
```json
{
  "name": "@agency/test-fixtures",
  "type": "module",
  "dependencies": {
    "@faker-js/faker": "10.4.0",
    "@agency/core-types": "workspace:*"
  }
}
```

### TypeScript Configuration
```json
{
  "extends": "@agency/config-typescript/base.json",
  "compilerOptions": {
    "moduleResolution": "Bundler",
    "target": "ES2022",
    "module": "ESNext"
  }
}
```

### Import Pattern
```typescript
// ✅ Correct ESM import
import { faker } from '@faker-js/faker';

// ❌ Wrong - CJS style no longer works
const { faker } = require('@faker-js/faker');
```

## Compatibility Notes

### For Node.js Compatibility
In Node 20.19+ and 22.13+, you can still use `require()` in CJS files:
```javascript
// This works in modern Node despite ESM-only package
const { faker } = require('@faker-js/faker');
```

However, we **strongly recommend** using ESM imports for consistency.

### Jest Compatibility Warning
Jest has known issues with ESM-only packages. If you encounter problems:
1. Ensure Jest is configured for ESM
2. Or use `@agency/core-testing` fixtures (which don't use Faker.js)

## Migration Path

### For Existing Fixtures
If migrating from v9 to v10:

1. **Update package.json**:
   ```bash
   pnpm update @faker-js/faker@10.4.0
   ```

2. **Update tsconfig.json**:
   ```json
   {
     "compilerOptions": {
       "moduleResolution": "Bundler"
     }
   }
   ```

3. **Update imports**:
   ```typescript
   // Before (v9)
   import faker from '@faker-js/faker';
   
   // After (v10)
   import { faker } from '@faker-js/faker';
   ```

4. **Handle deprecated methods**:
   ```typescript
   // Before
   faker.name.firstName()  // ❌ Deprecated
   
   // After
   faker.person.firstName() // ✅ Current
   ```

## Deprecations in v10

| Old (v9) | New (v10) | Status |
|----------|-----------|--------|
| `faker.name.*` | `faker.person.*` | Changed |
| `faker.address.*` | `faker.location.*` | Changed |
| `faker.internet.userName` | `faker.internet.username` | Changed |
| `faker.image.avatarLegacy` | `faker.image.avatar` | Changed |
| `faker.internet.color` | `faker.color.rgb` | Moved |

## Node Version Check

Add to test setup:
```typescript
// verify-node-version.ts
const nodeVersion = process.version;
const [major, minor] = nodeVersion.slice(1).split('.').map(Number);

if (major < 20 || (major === 20 && minor < 19)) {
  console.warn(
    `⚠️  Node.js ${nodeVersion} detected. ` +
    `@agency/test-fixtures requires Node.js 20.19+, 22.13+, or 24.x ` +
    `due to Faker.js v10 ESM requirements.`
  );
}
```

## Consequences

### Positive
- Smaller bundle size
- Better tree-shaking
- Modern ESM ecosystem alignment
- Improved performance
- Future-proof architecture

### Negative
- Node.js version constraint (20.19+)
- TypeScript configuration requirement
- Potential friction for CJS-only consumers
- Jest users may need additional configuration

## Alternatives Considered

| Alternative | Pros | Cons | Decision |
|-------------|------|------|----------|
| Stay on v9 | No migration | Security risk, outdated | Rejected |
| Use @faker-js/faker v9 | CJS compatible | Not future-proof | Rejected |
| Use @ngneat/falso | Different API | Smaller but less mature | Rejected |
| Custom factory functions | Full control | Maintenance burden | Rejected |

## References

- [Faker.js v10 Upgrade Guide](https://fakerjs.dev/guide/upgrading.html)
- [Faker.js ESM Requirements](https://fakerjs.dev/guide/usage.html#node-esm-only)
- [Node.js ESM Interoperability](https://nodejs.org/api/modules.html#modules-ecmascript-modules-interoperability)
- `@agency/core-testing` (25) - Alternative for basic fixtures without Faker.js
