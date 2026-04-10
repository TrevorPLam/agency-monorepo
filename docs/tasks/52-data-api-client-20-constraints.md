# 52-data-api-client: Constraints & Critical Rules

## Purpose

This document defines the hard constraints, performance boundaries, and critical rules that govern the `@agency/data-api-client` package. These constraints ensure reliable, type-safe, and performant internal API communication.

## Pattern Selection Constraints

### Pattern Usage Rules

| Consumer Type | Required Pattern | Package Export |
|---------------|------------------|----------------|
| Internal TypeScript apps | **tRPC** | `@agency/data-api-client/trpc` |
| External integrations | **REST + OpenAPI** | `@agency/data-api-client/rest` |
| Multi-CMS content queries | **GraphQL** | `@agency/data-api-client/graphql` |
| Simple form mutations | **Server Actions** | Next.js built-in |

### Pattern Enforcement

```typescript
// CORRECT - Internal app uses tRPC
import { trpc } from '@agency/data-api-client/trpc';

function Component() {
  const { data } = trpc.projects.list.useQuery({ clientId });
}

// INCORRECT - Internal app using REST when tRPC available
import { api } from '@agency/data-api-client/rest';  // Don't use for internal
```

## Timeout & Retry Constraints

### Timeout Configuration

| Operation Type | Timeout | Rationale |
|----------------|---------|-----------|
| Read queries | 5 seconds | Fail fast for lists |
| Mutations | 10 seconds | Allow for processing |
| File uploads | 30 seconds | Network variability |
| Streaming | 60 seconds | Chunked delivery |

### Retry Strategy

```typescript
// REQUIRED: Exponential backoff with jitter
const retryConfig = {
  maxRetries: 3,
  backoff: (attempt: number) => Math.min(1000 * 2 ** attempt, 10000),
  jitter: () => Math.random() * 1000,
  retryableStatuses: [408, 429, 500, 502, 503, 504],
  nonRetryableStatuses: [400, 401, 403, 404, 409],
};
```

### Circuit Breaker Pattern

```typescript
// REQUIRED: Circuit breaker for failing services
interface CircuitBreakerConfig {
  failureThreshold: 5;      // Open after 5 failures
  recoveryTimeout: 30000;   // Try again after 30s
  halfOpenRequests: 1;      // Test with 1 request
}

// State machine: CLOSED → OPEN → HALF_OPEN → CLOSED
```

## Authentication Constraints

### Token Handling

```typescript
// CORRECT - Token in memory, never localStorage for sensitive
const authInterceptor = (getToken: () => string | null) => {
  return async (config: RequestConfig) => {
    const token = getToken();  // From secure storage or memory
    if (token) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${token}`,
      };
    }
    return config;
  };
};

// INCORRECT - Token exposed
const token = localStorage.getItem('token');  // XSS risk
```

### Token Refresh

| Scenario | Behavior |
|----------|----------|
| Token expiring ( < 5 min) | Proactive refresh |
| Token expired | Queue requests, refresh once, replay |
| Refresh fails | Clear auth state, redirect to login |
| Concurrent requests | Single refresh, shared promise |

## Rate Limiting Constraints

### Client-Side Rate Limiting

```typescript
// REQUIRED: Token bucket per operation
interface RateLimitConfig {
  requestsPerSecond: 10;
  burstSize: 5;
  scope: 'user' | 'session' | 'global';
}

// Automatic queueing when rate limited
// Queue max size: 100 requests
// Drop oldest when full
```

### Server Response Handling

| Header | Handling |
|--------|----------|
| `Retry-After` | Wait specified seconds |
| `X-RateLimit-Remaining` | Throttle when < 10% |
| `X-RateLimit-Reset` | Resume at timestamp |
| 429 status | Backoff and retry |

## Error Handling Constraints

### Error Categories

| Status | Category | Client Action |
|--------|----------|---------------|
| 400 | Bad Request | Don't retry, fix input |
| 401 | Unauthorized | Refresh token or redirect |
| 403 | Forbidden | Don't retry, show error |
| 404 | Not Found | Don't retry |
| 408 | Timeout | Retry with backoff |
| 409 | Conflict | Don't retry, handle conflict |
| 429 | Rate Limited | Backoff and retry |
| 500 | Server Error | Retry with backoff |
| 502/503/504 | Gateway Error | Retry with backoff |

### Error Response Format

```typescript
// REQUIRED: Standard error shape
interface ApiError {
  status: number;
  code: string;           // Machine-readable code
  message: string;        // Human-readable message
  details?: Record<string, string[]>;  // Validation errors
  requestId: string;      // For server log correlation
  retryable: boolean;     // Can client retry?
}
```

### Error Interceptor

```typescript
// REQUIRED: Global error handling
const errorInterceptor: ErrorInterceptor = async (error) => {
  // Log to monitoring
  logger.error('API Error', {
    status: error.status,
    code: error.code,
    requestId: error.requestId,
  });

  // Handle auth errors
  if (error.status === 401) {
    await refreshToken();
    throw new RetryError(error);  // Trigger retry
  }

  // Handle rate limits
  if (error.status === 429) {
    const delay = parseInt(error.headers['Retry-After']) * 1000;
    await sleep(delay);
    throw new RetryError(error);
  }

  return error;
};
```

## Type Safety Constraints

### End-to-End Type Safety

```typescript
// REQUIRED: Types flow from schema to client
// Server (tRPC router)
const appRouter = router({
  projects: router({
    list: procedure
      .input(z.object({ clientId: z.string() }))
      .output(z.array(ProjectSchema))  // Source of truth
      .query(async ({ input }) => { ... }),
  }),
});

// Client automatically gets types
const { data } = trpc.projects.list.useQuery({ clientId: '123' });
// data is Project[] - fully typed
```

### Runtime Validation

```typescript
// REQUIRED: All inputs validated with Zod
const createProjectInput = z.object({
  clientId: z.string().uuid(),
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
});

// Don't use without validation
// INCORRECT
fetch('/api/projects', { body: JSON.stringify(data) });  // Risky

// CORRECT
const validated = createProjectInput.parse(data);
```

## Caching Constraints

### Cache Strategy by Pattern

| Pattern | Cache Strategy | Invalidation |
|---------|----------------|--------------|
| tRPC | TanStack Query | Mutation-based |
| REST | HTTP cache headers | Time-based + manual |
| GraphQL | Apollo normalized | Entity-based |

### TanStack Query Configuration

```typescript
// REQUIRED: Standard cache config
const queryConfig = {
  staleTime: 5 * 60 * 1000,    // 5 minutes
  cacheTime: 30 * 60 * 1000,   // 30 minutes
  refetchOnWindowFocus: false,
  refetchOnReconnect: true,
  retry: (failureCount: number, error: ApiError) => {
    return error.retryable && failureCount < 3;
  },
};
```

### Optimistic Updates

```typescript
// REQUIRED: Optimistic UI for mutations
const mutation = useMutation({
  mutationFn: updateProject,
  onMutate: async (newProject) => {
    // Cancel outgoing refetches
    await queryClient.cancelQueries(['projects', newProject.id]);
    
    // Snapshot previous value
    const previous = queryClient.getQueryData(['projects', newProject.id]);
    
    // Optimistically update
    queryClient.setQueryData(['projects', newProject.id], newProject);
    
    return { previous };
  },
  onError: (err, newProject, context) => {
    // Rollback on error
    queryClient.setQueryData(['projects', newProject.id], context?.previous);
  },
  onSettled: (newProject) => {
    // Always refetch after error or success
    queryClient.invalidateQueries(['projects', newProject?.id]);
  },
});
```

## Logging & Observability Constraints

### Request Logging

```typescript
// REQUIRED: Log all requests
interface RequestLog {
  method: string;
  path: string;
  duration: number;
  status: number;
  clientId?: string;      // Hashed for privacy
  userAgent: string;
  timestamp: string;
}

// Include in all environments except local dev
// Sample 100% in production, 1% for high-traffic endpoints
```

### Performance Tracking

| Metric | Target | Alert Threshold |
|--------|--------|-----------------|
| P50 latency | < 50ms | > 100ms |
| P95 latency | < 200ms | > 500ms |
| P99 latency | < 500ms | > 1000ms |
| Error rate | < 0.1% | > 1% |

## Security Constraints

### Request Signing (Sensitive Operations)

```typescript
// REQUIRED: Sign sensitive requests
const signRequest = (payload: object, secret: string) => {
  const timestamp = Date.now();
  const body = JSON.stringify(payload);
  const signature = createHmac('sha256', secret)
    .update(`${timestamp}.${body}`)
    .digest('hex');
  
  return {
    'X-Signature': signature,
    'X-Timestamp': timestamp,
    body,
  };
};
```

### CSRF Protection

```typescript
// REQUIRED: CSRF tokens for mutations
// Server sets HttpOnly cookie with token
// Client reads from meta tag or API
// Include in mutation headers
const csrfHeader = {
  'X-CSRF-Token': getCsrfToken(),
};
```

## Testing Constraints

### Mock Requirements

```typescript
// REQUIRED: Mock service worker for tests
const handlers = [
  trpcMsw.query('projects.list', {
    handler: (req, res, ctx) => {
      return res(ctx.data(mockProjects));
    },
  }),
];

// Test error scenarios
const errorHandler = trpcMsw.query('projects.list', {
  handler: (req, res, ctx) => {
    return res(
      ctx.status(500),
      ctx.errors([{ message: 'Database error' }])
    );
  },
});
```

### Contract Testing

```typescript
// REQUIRED: Pact contract tests for REST
const provider = new PactV3({
  consumer: 'internal-tools',
  provider: 'api-service',
});

// Verify provider meets contract
// Run in CI before deployment
```

## Bundle Size Constraints

| Export | Max Size (gzipped) | Notes |
|--------|-------------------|-------|
| tRPC client | 15 KB | Core + React Query |
| REST client | 8 KB | Fetch wrapper + Zod |
| GraphQL client | 25 KB | Apollo Client subset |
| Combined | 40 KB | Tree-shake unused |

## Version Compatibility

### Breaking Change Policy

| Change Type | Version Bump | Migration Guide |
|-------------|--------------|-----------------|
| Procedure rename | Major | Required |
| Input schema change | Major | Required |
| Output schema change | Minor | Recommended |
| New procedure | Minor | Optional |
| Bug fix | Patch | None |

### Deprecation Process

1. Mark as `@deprecated` with replacement
2. Support for 2 minor versions
3. Log warning on usage
4. Remove in next major

## Violation Response

Violations must be:
1. Detected by type checking or linting
2. Caught in code review
3. Documented with risk assessment
4. Fixed before merge

## References

- `docs/architecture/ADRs/004-data-api-client-adr-pattern-selection.md`
- `docs/AGENTS.md` Package Boundaries
- `docs/DEPENDENCY.md` §13 Internal Package Dependencies
- [tRPC Documentation](https://trpc.io)
- [TanStack Query Docs](https://tanstack.com/query)
