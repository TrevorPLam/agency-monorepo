# ADR: Use Discriminated Unions for Complex Domain Models

## Status
**Accepted** - This decision adopts discriminated unions as the standard pattern for complex domain models in `@agency/core-types`.

## Context
Domain models like `Project` and `Invoice` have multiple states that require different validation rules and behaviors. Traditional union types (`"draft" | "active" | "completed"`) don't provide enough type information for TypeScript to narrow types safely in switch statements or when accessing properties.

## Decision
We will use Zod discriminated unions for all complex domain objects that have state-like or type-like properties.

## Consequences
- **Positive**: Type-safe state handling, better autocomplete, compile-time validation
- **Positive**: Clear intent signaling through discriminant properties
- **Negative**: Slightly more verbose schema definitions
- **Negative**: Requires learning curve for team members unfamiliar with discriminated unions

## Implementation

### Before (Current - Zod v3)
```ts
export const projectSchema = z.object({
  id: z.string().uuid(),
  clientId: z.string().uuid(),
  name: z.string().min(1).max(255),
  status: z.enum(["lead", "scoping", "active", "on-hold", "completed", "archived"]),
  // ... other fields
});

export type ProjectStatus = "lead" | "scoping" | "active" | "on-hold" | "completed" | "archived";
```

### After (This ADR - Zod v4 Enhanced)
```ts
// Zod v4: Use .strict() for enhanced validation and better performance
const projectStatusSchema = z.enum(["lead", "scoping", "active", "on-hold", "completed", "archived"]);

const baseProjectSchema = z.object({
  id: z.string().uuid(),
  clientId: z.string().uuid(),
  name: z.string().min(1).max(255),
  createdAt: z.date(),
  updatedAt: z.date()
}).strict(); // Zod v4: Strict mode for better validation

const leadProjectSchema = baseProjectSchema.extend({
  status: projectStatusSchema.refine(status => status === "lead"),
  budget: z.number().optional(),
  expectedCloseDate: z.date().optional()
});

const activeProjectSchema = baseProjectSchema.extend({
  status: projectStatusSchema.refine(status => status === "active"),
  teamAssignee: z.string().uuid().optional(),
  progress: z.number().min(0).max(100).optional()
});

const completedProjectSchema = baseProjectSchema.extend({
  status: projectStatusSchema.refine(status => status === "completed"),
  actualHours: z.number().min(0),
  invoiceId: z.string().uuid().optional()
});

// Zod v4: Enhanced discriminated union with better performance
export const projectSchema = z.discriminatedUnion("status", [
  leadProjectSchema,
  activeProjectSchema,
  completedProjectSchema,
  // ... other states as needed
]);

export type Project = z.infer<typeof projectSchema>;
```

## Migration Strategy
1. Update existing entity schemas to use discriminated unions
2. Add helper functions for type-safe state transitions
3. Update validation utilities to work with discriminated unions
4. Document pattern in `@agency/core-types` README

## References
- [Zod Discriminated Unions](https://zod.dev/api?id=discriminated-unions)
- [TypeScript Discriminated Unions Guide](https://www.typescriptlang.org/docs/handbook/2/narrowing#discriminated-unions)
