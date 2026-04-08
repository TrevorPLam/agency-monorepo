# Monitoring QA Checklist


## Pre-Implementation Checks

- [ ] Provider selected from approved list (Sentry, New Relic, Grafana Faro)
- [ ] Environment variables configured in `.env.example`
- [ ] Free tier limits documented and acceptable
- [ ] Data residency requirements validated (EU, US, etc.)
- [ ] Runtime compatibility verified (Node.js vs Edge)
- [ ] Bundle size impact assessed (< 50 KB gzipped)
- [ ] Tree-shaking verified (optional dependencies)


## Package Structure Validation

- [ ] `package.json` uses `optionalDependencies` for provider SDKs
- [ ] `exports` field includes all subpaths (providers, boundaries, vitals, health)
- [ ] `peerDependencies` lists `next` and `react` versions
- [ ] No provider SDKs in `dependencies` (must be optional)
- [ ] `@agency/core-types` listed in dependencies
- [ ] README includes integration guide
- [ ] CHANGELOG initialized with initial release


## Type Safety

- [ ] `MonitoringProvider` interface exported from core
- [ ] All provider implementations satisfy interface
- [ ] Error context types exported
- [ ] Health check types exported
- [ ] No `any` types in public API
- [ ] TypeScript strict mode enabled


## Error Boundary Testing

- [ ] Error boundary catches React errors
- [ ] Error boundary reports to provider
- [ ] Fallback UI renders correctly
- [ ] Component stack included in error report
- [ ] Error digest captured for Next.js
- [ ] Error boundary is a Client Component (`'use client'`)

### Test Case

```typescript
const ThrowError = () => { throw new Error('Test'); };

render(
  <ErrorBoundary fallback={<div>Error!</div>}>
    <ThrowError />
  </ErrorBoundary>
);

// Assert: Error reported to provider
// Assert: Fallback rendered
```


## Provider Abstraction Testing

- [ ] `setMonitoringProvider` accepts provider instance
- [ ] `getMonitoringProvider` returns configured provider
- [ ] Provider methods callable (captureError, captureMessage, etc.)
- [ ] Console provider works without configuration
- [ ] Provider selection via env var works
- [ ] Missing provider logs warning but doesn't crash

### Test Case

```typescript
const mockProvider = {
  captureError: vi.fn(),
  captureMessage: vi.fn(),
};

setMonitoringProvider(mockProvider);
getMonitoringProvider()?.captureError(new Error('test'));

// Assert: mockProvider.captureError called
```


## Health Check Testing

- [ ] Health checker registers checks
- [ ] Individual check returns correct status
- [ ] All checks return aggregate status
- [ ] Timeout handling works
- [ ] Response time included
- [ ] Error cases return 'unhealthy' status

### Test Case

```typescript
healthChecker.register('test', {
  check: () => ({ status: 'healthy' }),
});

const result = await healthChecker.runCheck('test');
// Assert: result.status === 'healthy'
```


## Web Vitals Integration

- [ ] `assessVitalScore` returns correct ratings
- [ ] Thresholds match Google CWV guidelines
- [ ] INP threshold at 200ms/500ms (2026 standard)
- [ ] FID still present for backward compatibility
- [ ] Vercel Speed Insights integration functional

### Test Case

```typescript
// INP threshold test
expect(assessVitalScore('INP', 150)).toBe('good');
expect(assessVitalScore('INP', 300)).toBe('needs-improvement');
expect(assessVitalScore('INP', 600)).toBe('poor');
```


## Environment Variable Validation

- [ ] `MONITORING_PROVIDER` defaults to 'none'
- [ ] Missing DSN logs warning, doesn't crash
- [ ] Invalid provider name handled gracefully
- [ ] `NEXT_PUBLIC_APP_VERSION` optional but recommended
- [ ] `NODE_ENV` determines debug mode


## Build & Typecheck

```bash
# Run these commands
pnpm --filter @agency/monitoring typecheck
pnpm --filter @agency/monitoring lint
pnpm --filter @agency/monitoring test

# Verify all pass
```


## Integration Testing

- [ ] Package builds without errors
- [ ] Type exports are accessible from consuming apps
- [ ] Provider abstraction works in Next.js app
- [ ] Error boundary renders in browser
- [ ] Health endpoint returns 200/503 appropriately
- [ ] No console errors in development


## Security & Privacy

- [ ] PII scrubbing implemented in `beforeSend`
- [ ] Email addresses masked in error messages
- [ ] Authorization headers removed from requests
- [ ] Cookies sanitized
- [ ] User consent checked before session replay
- [ ] IP addresses hashed (GDPR compliance)


## Performance Validation

- [ ] Bundle size under 50 KB gzipped with provider
- [ ] Provider SDK dynamically imported
- [ ] No memory leaks in error boundary
- [ ] Health checks timeout appropriately
- [ ] No blocking operations on main thread


## Documentation Review

- [ ] README includes installation steps
- [ ] Provider selection matrix present
- [ ] Environment variables documented
- [ ] Code examples compile without errors
- [ ] Migration guide from direct SDK included
- [ ] Troubleshooting section covers common issues


## Conditional Activation Verification

Per `DEPENDENCY.md:456`, confirm:

- [ ] Package is 🔒 condition-gated
- [ ] Activation trigger documented (CrUX data needed OR error tracking needed)
- [ ] Minimum 1 consumer requirement noted
- [ ] Exit criteria defined and testable


## Release Readiness

- [ ] Changeset created (`pnpm changeset`)
- [ ] Version bump appropriate (minor for new package)
- [ ] CI tests passing
- [ ] No breaking changes to existing code
- [ ] Package listed in root README
- [ ] CODEOWNERS updated if needed


## Sign-off

| Role | Name | Date | Approved |
|------|------|------|----------|
| Tech Lead | | | [ ] |
| Security Review | | | [ ] |
| QA Lead | | | [ ] |
