# ADR: Runtime Validation for Core Constants

## Status
**Accepted** - Adopt runtime validation strategy for constants to provide type safety at runtime while maintaining performance.

## Context
Constants defined with `as const` provide compile-time type safety but no runtime validation. When constants are used across package boundaries or exposed to external consumers, runtime validation becomes critical for preventing invalid states and providing clear error messages.

## Decision
We will implement runtime validation helpers for critical constants while maintaining the `as const` pattern for optimal tree-shaking and performance.

## Consequences
- **Positive**: Runtime safety with clear error messages
- **Positive**: Early detection of invalid constant usage
- **Positive**: Better debugging experience with validation errors
- **Negative**: Slightly larger bundle size due to validation code
- **Negative**: Runtime overhead for validation (minimal with optimized approach)

## Implementation

### Validation Helper Functions
Create type-safe validation utilities:

```ts
// src/validation.ts
import { z } from 'zod';

// Route validation
export const validateRoute = (route: string): string => {
  const validRoutes = Object.values(INTERNAL_ROUTES);
  if (!validRoutes.includes(route as any)) {
    throw new Error(`Invalid route: ${route}. Valid routes: ${validRoutes.join(', ')}`);
  }
  return route;
};

// Error code validation
export const validateErrorCode = (code: string): string => {
  const validErrorCodes = Object.values(ERROR_CODES);
  if (!validErrorCodes.includes(code as any)) {
    throw new Error(`Invalid error code: ${code}. Valid codes: ${validErrorCodes.join(', ')}`);
  }
  return code;
};

// Invoice status validation
export const validateInvoiceStatus = (status: string): InvoiceStatus => {
  if (!INVOICE_STATUSES.includes(status as any)) {
    throw new Error(`Invalid invoice status: ${status}. Valid statuses: ${INVOICE_STATUSES.join(', ')}`);
  }
  return status as InvoiceStatus;
};
```

### Type-Safe Constant Accessors
Create safe accessor functions with runtime validation:

```ts
// src/accessors.ts
export const getRoutePath = (route: InternalRoute): string => {
  validateRoute(route);
  return INTERNAL_ROUTES[route];
};

export const getErrorMessage = (code: ErrorCode): string => {
  validateErrorCode(code);
  return ERROR_MESSAGES[code];
};

export const getInvoiceStatusConfig = (status: InvoiceStatus) => {
  validateInvoiceStatus(status);
  return INVOICE_STATUS_CONFIG[status];
};
```

### Performance-Optimized Validation
Use efficient validation with minimal overhead:

```ts
// src/optimized-validation.ts
// Create validation sets once for O(1) lookup
const ROUTE_SET = new Set(Object.values(INTERNAL_ROUTES));
const ERROR_CODE_SET = new Set(Object.values(ERROR_CODES));
const INVOICE_STATUS_SET = new Set(INVOICE_STATUSES);

// Optimized validation with early returns
export const validateRouteOptimized = (route: string): string => {
  if (!ROUTE_SET.has(route)) {
    const validRoutes = Array.from(ROUTE_SET);
    throw new Error(`Invalid route: ${route}. Valid routes: ${validRoutes.join(', ')}`);
  }
  return route;
};

// Memoized validation for repeated calls
export const createRouteValidator = () => {
  const routeSet = new Set(Object.values(INTERNAL_ROUTES));
  return (route: string): string => {
    if (!routeSet.has(route)) {
      const validRoutes = Array.from(routeSet);
      throw new Error(`Invalid route: ${route}. Valid routes: ${validRoutes.join(', ')}`);
    }
    return route;
  };
};
```

### Development vs Production Validation
Provide different validation strategies for different environments:

```ts
// src/environment-validation.ts
export const createRouteValidator = (isDevelopment: boolean = process.env.NODE_ENV === 'development') => {
  const routeSet = new Set(Object.values(INTERNAL_ROUTES));
  
  return (route: string): string => {
    if (!routeSet.has(route)) {
      const validRoutes = Array.from(routeSet);
      
      if (isDevelopment) {
        console.warn(`Invalid route used: ${route}. Valid routes: ${validRoutes.join(', ')}`);
        return route; // Allow in development with warning
      } else {
        throw new Error(`Invalid route: ${route}. Valid routes: ${validRoutes.join(', ')}`);
      }
    }
    return route;
  };
};
```

## Migration Strategy
1. Add validation helpers to existing constants
2. Update exports to include both raw constants and validation functions
3. Add comprehensive JSDoc documentation for validation functions
4. Update unit tests to cover validation scenarios
5. Add performance benchmarks for validation overhead

## Bundle Optimization

### Tree Shaking Structure
Structure exports for optimal tree-shaking:

```json
{
  "exports": {
    ".": "./src/index.ts",
    "./routes": "./src/routes.ts",
    "./errors": "./src/errors.ts", 
    "./invoice": "./src/invoice.ts",
    "./validation": "./src/validation.ts",
    "./accessors": "./src/accessors.ts"
  }
}
```

### Conditional Validation
Use environment-aware validation to minimize production bundle size:

```ts
// src/index.ts
export * from './constants'; // Raw constants - always exported
export { createRouteValidator } from './validation'; // Validation helpers - tree-shakable

// Consumer can choose
import { INTERNAL_ROUTES } from './routes'; // Direct access
import { createRouteValidator } from './validation'; // Validated access
```

## Testing Strategy

### Unit Testing
Test validation functions with comprehensive scenarios:

```ts
describe('constants validation', () => {
  describe('validateRoute', () => {
    it('should accept valid routes', () => {
      expect(() => validateRoute('/dashboard')).not.toThrow();
      expect(() => validateRoute('/crm')).not.toThrow();
    });

    it('should reject invalid routes', () => {
      expect(() => validateRoute('/invalid')).toThrow('Invalid route: /invalid');
    });
  });

  describe('performance-optimized validation', () => {
    it('should be faster for repeated calls', () => {
      const validator = createRouteValidator();
      
      const start = performance.now();
      for (let i = 0; i < 10000; i++) {
        validator('/dashboard');
      }
      const end = performance.now();
      
      expect(end - start).toBeLessThan(50); // Should be very fast
    });
  });
});
```

### Integration Testing
Test validation across package boundaries:

```ts
describe('cross-package validation', () => {
  it('should catch invalid constants at runtime', () => {
    // Test that validation works when constants are imported from another package
    expect(() => {
      import('./routes').then(({ INTERNAL_ROUTES }) => {
        const route = '/invalid' as any;
        return INTERNAL_ROUTES[route]; // Should be undefined
      });
    }).rejects.toThrow();
  });
});
```

## Best Practices

1. **Validate Early**: Catch errors at constant usage time, not later in execution
2. **Clear Error Messages**: Include valid options in error messages for debugging
3. **Environment Awareness**: Use stricter validation in production, lenient in development
4. **Performance First**: Optimize for O(1) validation with Sets and early returns
5. **Tree Shaking**: Make validation functions tree-shakable for production builds
6. **Type Safety**: Maintain TypeScript inference while adding runtime safety

## References
- [Runtime Validation Best Practices](https://kentcdodds.com/blog/a-safe-type-safe-approach-to-runtime-validators)
- [TypeScript Const Assertions](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-7#const-assertions)
