# Monitoring Package - Implementation Prompt


## Context

You are implementing the `@agency/monitoring` package per the specification in `42-monitoring-10-spec.md`. This is a **foundational package** that `@agency/monitoring-rum` will build upon.

**Status:** This package is 🔒 condition-gated per `DEPENDENCY.md:456`. Only implement when:
- First production app needs performance monitoring
- Error tracking requirements emerge
- SLI/SLO tracking is needed


## Scope

Implement the complete package structure:

```
packages/monitoring/
├── package.json
├── tsconfig.json
├── 01-config-biome-migration-50-ref-quickstart.md
├── CHANGELOG.md
└── src/
    ├── index.ts
    ├── providers/
    │   ├── index.ts
    │   ├── base.ts
    │   ├── sentry.ts
    │   └── console.ts (fallback)
    ├── boundaries/
    │   ├── index.ts
    │   └── error-boundary.tsx
    ├── vitals/
    │   ├── index.ts
    │   └── core-web-vitals.ts
    ├── health/
    │   ├── index.ts
    │   └── checks.ts
    └── utils/
        ├── index.ts
        └── diagnostic.ts
```


## Implementation Order

### Phase 1: Foundation
1. Create `package.json` with:
   - `optionalDependencies` for `@sentry/nextjs` and `newrelic`
   - `peerDependencies` for `next` and `react`
   - Proper `exports` field for all subpaths
   - `workspace:*` for internal dependencies

2. Create `tsconfig.json` extending `@agency/config-typescript`

3. Create `src/providers/base.ts` with complete interface definitions

### Phase 2: Providers
4. Implement `SentryProvider` in `src/providers/sentry.ts`
   - Must satisfy `MonitoringProvider` interface
   - Include session replay configuration
   - Handle browser tracing

5. Implement `ConsoleProvider` as fallback
   - Logs to console in structured format
   - Never throws errors

6. Create provider registry in `src/providers/index.ts`
   - `setMonitoringProvider()`
   - `getMonitoringProvider()`

### Phase 3: Error Boundaries
7. Implement `ErrorBoundary` component
   - Must be Client Component (`'use client'`)
   - Capture errors via `getMonitoringProvider()`
   - Render configurable fallback UI
   - Include component stack in reports

### Phase 4: Vitals
8. Create `src/vitals/core-web-vitals.ts`
   - Export `VITALS_THRESHOLDS` with 2026 values
   - Implement `assessVitalScore()`
   - Include INP thresholds (good: 200ms, poor: 500ms)
   - Add Vercel Speed Insights integration helper

### Phase 5: Health Checks
9. Implement `HealthChecker` class
   - `register()` method for adding checks
   - `runCheck()` with timeout handling
   - `runAllChecks()` for aggregate status
   - Return standardized response format

### Phase 6: Exports & Documentation
10. Create `src/index.ts` with all public exports
11. Write `01-config-biome-migration-50-ref-quickstart.md` with:
    - Installation instructions
    - Provider setup guide
    - Error boundary usage
    - Health check examples
    - Troubleshooting

12. Initialize `CHANGELOG.md` with initial release


## Key Implementation Details

### Provider Interface

```typescript
export interface MonitoringProvider {
  name: string;
  init(config: ProviderConfig): void;
  captureError(error: Error, context?: ErrorContext): void;
  captureMessage(message: string, level?: LogLevel): void;
  setUser(user: UserContext | null): void;
  addBreadcrumb(breadcrumb: Breadcrumb): void;
  // Transaction methods (simplified for initial release)
  startTransaction(name: string, op?: string): Transaction;
  finishTransaction(transaction: Transaction): void;
}
```

### Error Boundary Pattern

```typescript
'use client';

export class ErrorBoundary extends Component<Props, State> {
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    const provider = getMonitoringProvider();
    provider?.captureError(error, {
      extra: { componentStack: errorInfo.componentStack },
      tags: { errorBoundary: 'react' },
    });
  }
  // ...
}
```

### Health Check Pattern

```typescript
export class HealthChecker {
  private checks = new Map<string, HealthCheck>();
  
  register(name: string, check: HealthCheck) {
    this.checks.set(name, check);
  }
  
  async runAllChecks(): Promise<SystemHealth> {
    // Run all checks with timeout handling
    // Return aggregate status
  }
}
```


## Critical Constraints

1. **Tree Shaking:** Provider SDKs must be dynamically imported:
   ```typescript
   // CORRECT
   const { SentryProvider } = await import('./providers/sentry');
   
   // WRONG - causes bundle bloat
   import { SentryProvider } from './providers/sentry';
   ```

2. **Optional Dependencies:** SDKs must be in `optionalDependencies`, not `dependencies`

3. **Graceful Degradation:** If no provider configured, use `ConsoleProvider` (never throw)

4. **Type Safety:** All types must be exported from `@agency/core-types` (check with tech lead if types don't exist yet)

5. **Edge Runtime:** New Relic doesn't support Edge. Add runtime checks or document limitation.


## Testing Requirements

Create minimal test coverage:

```typescript
// tests/providers.test.ts
describe('Provider Abstraction', () => {
  it('sets and gets monitoring provider', () => {
    const mock = { captureError: vi.fn() };
    setMonitoringProvider(mock as any);
    expect(getMonitoringProvider()).toBe(mock);
  });
});

// tests/boundaries.test.ts
describe('Error Boundary', () => {
  it('catches errors and calls provider', () => {
    const mock = { captureError: vi.fn() };
    setMonitoringProvider(mock as any);
    
    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );
    
    expect(mock.captureError).toHaveBeenCalled();
  });
});
```


## Verification Commands

After implementation, run:

```bash
# Type checking
pnpm --filter @agency/monitoring typecheck

# Linting
pnpm --filter @agency/monitoring lint

# Testing
pnpm --filter @agency/monitoring test

# Build
pnpm --filter @agency/monitoring build

# Verify exports
node -e "const pkg = require('./packages/monitoring/package.json'); console.log(pkg.exports)"
```


## Do NOT Implement (Out of Scope)

- New Relic provider implementation (Sentry only for initial release)
- Distributed tracing (complex, defer to v2)
- Custom metrics API (use provider SDK directly)
- Server-side error tracking (handled by Sentry Next.js SDK)
- Log aggregation (separate package)


## Handoff Checklist

Before marking complete:

- [ ] All Phase 1-6 files created
- [ ] Provider abstraction functional
- [ ] Error boundary tested
- [ ] TypeScript compiles without errors
- [ ] No provider SDKs in main bundle when unused
- [ ] README includes working examples
- [ ] Follows `AGENTS.md` dependency flow rules


## References

- `42-monitoring-10-spec.md` - Full specification
- `42-monitoring-20-constraints.md` - Technical/budget limits
- `42-monitoring-30-adr-provider.md` - Why provider abstraction
- `42-monitoring-40-guide-integration.md` - How to use the package
- `42-monitoring-60-qa-checklist.md` - Validation criteria
