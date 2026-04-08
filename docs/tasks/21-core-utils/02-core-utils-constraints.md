# 21-core-utils: Constraints & Boundaries

## Purpose
Technical constraints and architectural boundaries for the utils package to ensure pure functions and prevent scope creep.

## Critical Constraints

### Pure Function Rules
- **No Side Effects**: Functions must be pure - same inputs always produce same outputs
- **No External State**: No reading from environment variables, global state, or external services
- **No Date Mutation**: Never modify Date objects passed as parameters
- **No Network Access**: No HTTP requests, database queries, or external API calls
- **Framework Agnostic**: Must work across Next.js, React, and Node.js without framework assumptions

### Dependency Constraints
- **Zero External Dependencies**: Only depends on `@agency/core-types` and `zod`
- **No Circular Dependencies**: Cannot create utilities that depend on other packages that import this package
- **Import Direction**: Only UI, data, auth, and communication packages may import core-utils

### Functional Boundaries
- **Date Utilities**: Formatting only, never business logic for date calculations
- **String Utilities**: Manipulation only, never content validation or sanitization
- **Currency Utilities**: Formatting and parsing only, never conversion logic or exchange rates
- **Validation Utilities**: Schema validation only, never business rule enforcement

## Forbidden Patterns

### ❌ Business Logic in Utils
```ts
// WRONG: Business validation logic
export function validateUserRole(user: User, permissions: Permission[]): boolean {
  return user.role === "admin" && hasRequiredPermissions(permissions); // Business rule
}

// WRONG: Data fetching
export function fetchUserData(userId: string): Promise<User> {
  return fetch(`/api/users/${userId}`); // Network access
}
```

### ✅ Pure Utility Functions
```ts
// CORRECT: Pure validation utility
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// CORRECT: Pure formatting utility
export function formatCurrency(amount: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency
  }).format(amount);
}
```

## Performance Constraints

### Bundle Size Limits
- Individual utility files must be tree-shakable
- No heavy dependencies that increase bundle size
- Prefer built-in APIs (Intl, Web APIs) over external libraries

### Locale Considerations
- **Default Locale**: All functions must accept optional locale parameter with "en-US" fallback
- **No Hardcoded Strings**: Never hardcode locale-specific strings in utilities
- **Timezone Safety**: Date functions must be timezone-agnostic or accept timezone parameter

## Architectural Boundaries

### Domain Separation
Core utils package should only contain these utility categories:

| Category | Belongs | Notes |
|---------|----------|-------|
| Date Formatting | Core | Pure date manipulation and formatting |
| String Manipulation | Core | Text processing and validation |
| Currency Formatting | Core | Number and currency formatting |
| Input Validation | Core | Schema validation using Zod |
| ❌ Data Fetching | Data | Belongs in data-api-client package |
| ❌ Business Rules | Auth | Belongs in auth package |

## Compliance Requirements

- **Zod Version**: Pin to `^3.23.0` for schema validation
- **TypeScript**: Use strict mode and enable all type checks
- **Testing**: All utilities must have comprehensive test coverage
- **Documentation**: Every utility change must update README examples

## Enforcement Mechanisms

### ESLint Rules
- Import boundary enforcement via `@agency/config-eslint`
- No side effects or state mutations in lint rules
- Performance optimization rules for utility functions

### Build Verification
```bash
# Verify no side effects
pnpm --filter @agency/core-utils lint --rule="no-side-effects"

# Check dependency compliance
pnpm --filter @agency/core-utils build --dry-run

# Validate exports
pnpm --filter @agency/core-utils build --report=exports
```

## Review Checklist

- [ ] All functions are pure with no side effects
- [ ] No external dependencies except core-types and zod
- [ ] Date functions use Intl API with proper fallbacks
- [ ] String utilities are framework-agnostic
- [ ] Validation uses Zod schemas only
- [ ] Export structure matches package.json exports
- [ ] No business logic embedded in utilities
- [ ] All changes documented in README
