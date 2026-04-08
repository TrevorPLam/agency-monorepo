# Monitoring Provider Abstraction ADR


## Status

**Proposed**


## Context

The agency monorepo needs a unified monitoring solution that can:
- Track errors across all applications (agency website, client sites, internal tools)
- Measure Core Web Vitals performance metrics
- Provide health check endpoints for operational monitoring
- Support multiple provider backends without code changes

Current market options include:
- **Sentry**: Error tracking with performance monitoring, 5k errors/mo free tier
- **New Relic**: Full observability with 100 GB/mo free ingest
- **Grafana Faro**: Open-source RUM with cloud ingest options

Each provider has different strengths, pricing models, and runtime compatibility.


## Decision

We will implement a **provider abstraction layer** in `@agency/monitoring` that:

1. Defines a common `MonitoringProvider` interface
2. Implements provider-specific adapters (SentryProvider, NewRelicProvider)
3. Uses runtime provider selection via environment variable
4. Treats provider SDKs as optional dependencies (tree-shakeable)
5. Falls back to console logging if no provider configured


## Rationale

### Why not hardcode Sentry everywhere?

Hardcoding a specific provider creates vendor lock-in:
- Client sites may have existing monitoring contracts
- Different pricing models suit different traffic volumes
- Enterprise clients may mandate specific providers
- Migration requires touching every file that imports monitoring

### Why not use multiple providers simultaneously?

Running multiple providers simultaneously:
- Increases bundle size significantly
- Creates duplicate event transmission costs
- Complicates debugging with multiple dashboards
- Violates single-source-of-truth principle

### Why optional dependencies instead of peer dependencies?

Optional dependencies via `optionalDependencies` in package.json:
- Don't fail install if SDK unavailable
- Allow tree-shaking when provider not used
- Keep bundle minimal for apps without monitoring
- Match the condition-gated philosophy in `DEPENDENCY.md`


## Consequences

### Positive

- **Vendor independence**: Swap providers via configuration only
- **Cost optimization**: Choose provider based on client traffic patterns
- **Testing flexibility**: Use console provider in tests, real provider in production
- **Incremental adoption**: Add monitoring to one app at a time

### Negative

- **Abstraction overhead**: Provider interface adds ~2 KB to bundle
- **Feature limitations**: Lowest common denominator across providers
- **Provider-specific features**: Some advanced features require provider-specific code
- **Documentation burden**: Must document multiple provider configurations

### Neutral

- **Migration path**: Existing Sentry users can migrate gradually
- **Type safety**: All providers must implement same interface


## Provider Selection Matrix

| Scenario | Recommended Provider | Rationale |
|----------|---------------------|-----------|
| Internal tools | Sentry | Simple setup, good free tier
| High-traffic client sites | New Relic | Better volume pricing
| EU data residency | Sentry EU | EU data centers available
| Serverless/Edge | Sentry | Better Edge Runtime support
| HIPAA compliance | New Relic | BAA available


## Implementation Notes

### Provider Interface

```typescript
export interface MonitoringProvider {
  name: string;
  init(config: ProviderConfig): void;
  captureError(error: Error, context?: ErrorContext): void;
  captureMessage(message: string, level?: LogLevel): void;
  // ... additional methods
}
```

### Runtime Selection

```typescript
// Provider selection based on env var
const providerName = process.env.MONITORING_PROVIDER ?? 'none';

const providers: Record<string, () => Promise<MonitoringProvider>> = {
  sentry: async () => {
    const { SentryProvider } = await import('./providers/sentry');
    return new SentryProvider();
  },
  newrelic: async () => {
    const { NewRelicProvider } = await import('./providers/newrelic');
    return new NewRelicProvider();
  },
  none: async () => {
    const { ConsoleProvider } = await import('./providers/console');
    return new ConsoleProvider();
  },
};
```

### Edge Runtime Consideration

New Relic Node agent cannot run in Edge Runtime. For edge functions:
- Use Sentry (has Edge Runtime support)
- Or disable monitoring for edge routes
- Or use browser-only provider with reduced context


## Alternatives Considered

### Option 1: Direct SDK imports

Apps import `@sentry/nextjs` directly.

**Rejected**: Creates vendor lock-in, prevents provider swapping, duplicates configuration.

### Option 2: Proxy service

All monitoring goes through internal proxy API.

**Rejected**: Adds latency, creates single point of failure, more infrastructure.

### Option 3: OpenTelemetry

Use OTel as abstraction layer.

**Deferred**: OTel for JavaScript is still stabilizing in 2026. Revisit when OTel 2.0 is stable.


## Related Decisions

- `42a-monitoring-rum` will use same provider abstraction for CrUX data (separate package due to different triggers)
- `d4-infra-sentry` handles Sentry infrastructure setup (project creation, alerts)
- Provider selection documented in `DEPENDENCY.md:307-337`


## References

- `DEPENDENCY.md:456-457` - Conditional activation rules
- `ARCHITECTURE.md:351` - Build order (monitoring after UI, before analytics)
- `AGENTS.md` - Provider abstraction follows "explicit package boundaries" rule
