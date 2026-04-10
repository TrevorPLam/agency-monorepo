# Guide: Schema Composition Patterns

## Purpose
Advanced Zod patterns for building complex, reusable domain schemas while maintaining type safety and validation performance.

## Core Patterns

### 1. Schema Composition
Combine smaller schemas into larger ones using `z.extend()` and `z.merge()`:

```ts
// Base contact schema
const contactSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(255),
  email: z.string().email(),
  phone: z.string().optional()
});

// Extended schemas
const clientSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(255),
  contact: contactSchema.optional(), // Reuse contact schema
  billingEmail: z.string().email()
});

const userSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(255),
  clientId: z.string().uuid().optional(), // Optional for internal users
  role: z.enum(["admin", "user", "viewer"])
});
```

### 2. Conditional Validation
Use `.superRefine()` for cross-field validation:

```ts
const userSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  password: z.string().min(8),
  confirmPassword: z.string().min(8)
}).superRefine(
  (data, ctx) => data.password === data.confirmPassword,
  {
    message: "Passwords must match",
    path: ["confirmPassword"]
  }
);
```

### 3. Schema Transformation
Use `.transform()` for data normalization:

```ts
const projectSchema = z.object({
  name: z.string().transform(val => val.trim()),
  slug: z.string().transform(val => val.toLowerCase().replace(/\s+/g, '-')),
  status: z.enum(["draft", "active"]).default("draft")
});
```

### 4. Branded Types
Create branded types for critical business values:

```ts
// Create branded type
const InvoiceIdSchema = z.string().uuid().brand("InvoiceId");
type InvoiceId = z.infer<typeof InvoiceIdSchema>;

// Usage
const invoiceSchema = z.object({
  id: InvoiceIdSchema,
  amount: z.number().positive()
});
```

### 5. Recursive Schemas
Handle self-referencing schemas with `z.lazy()`:

```ts
const categorySchema = z.lazy(() => z.object({
  id: z.string().uuid(),
  name: z.string(),
  subcategories: z.array(categorySchema)
}));

const productSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  category: categorySchema.optional()
});
```

## Performance Considerations

### Tree Shaking
Export individual schemas for optimal tree-shaking:

```ts
// src/index.ts
export { clientSchema, type Client } from "./client";
export { projectSchema, type Project } from "./project";
export { userSchema, type User } from "./user";
export { invoiceSchema, type Invoice } from "./invoice";
```

### Validation Performance
Use `.safeParse()` instead of `.parse()` for better error handling:

```ts
// Instead of this:
try {
  const result = schema.parse(data);
} catch (error) {
  // Handle error
}

// Use this:
const result = schema.safeParse(data);
if (!result.success) {
  // Handle validation error
  return result.error;
}
const data = result.data;
```

## Integration Examples

### Error Types
Create standardized error types for validation failures:

```ts
export class ValidationError extends Error {
  constructor(
    message: string,
    path: string[],
    code: string = 'VALIDATION_ERROR'
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}

export function createValidationError(
  message: string,
  path: string[] = []
): ValidationError {
  return new ValidationError(message, path);
}
```

### Schema Extensions
Create reusable schema extensions for common patterns:

```ts
// Timestamped entity
export const withTimestamps = <T extends z.ZodObject>(schema: T) => 
  schema.extend({
    createdAt: z.date(),
    updatedAt: z.date()
  });

// Soft deletable entity
export const withSoftDelete = <T extends z.ZodObject>(schema: T) =>
  schema.extend({
    deletedAt: z.date().optional()
  });
```

## Testing Strategies

### Unit Testing
Test schemas with various input scenarios:

```ts
describe('clientSchema', () => {
  it('should validate valid client data', () => {
    const validData = {
      id: '550e8400-e29b-41d4-a716-446655440',
      name: 'Test Client',
      email: 'test@example.com'
    };
    
    expect(clientSchema.parse(validData)).toEqual(validData);
  });

  it('should reject invalid email', () => {
    const invalidData = {
      id: '550e8400-e29b-41d4-a716-446655440',
      name: 'Test Client',
      email: 'invalid-email'
    };
    
    expect(() => clientSchema.parse(invalidData)).toThrow();
  });
});
```

### Integration Testing
Test schema composition and inheritance:

```ts
describe('schema composition', () => {
  it('should extend base schemas correctly', () => {
    const extendedSchema = createExtendedClientSchema();
    const data = {
      id: '550e8400-e29b-41d4-a716-446655440',
      name: 'Test Client',
      contact: {
        name: 'John Doe',
        email: 'john@example.com'
      }
    };
    
    expect(extendedSchema.parse(data)).toMatchObject(data);
  });
});
```

## Best Practices

1. **Always use discriminated unions for state-like objects**
2. **Prefer `.safeParse()` over `.parse()` for better error handling**
3. **Use schema composition over inheritance for flexibility**
4. **Create branded types for business-critical values**
5. **Export schemas individually for tree-shaking**
6. **Add comprehensive JSDoc comments for all schemas**
7. **Include transformation logic in schemas when needed**
8. **Use lazy schemas for recursive structures**
