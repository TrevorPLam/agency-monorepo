# Monitoring


## Purpose

Base performance monitoring and observability utilities for all agency applications. Provides Core Web Vitals instrumentation, error boundary patterns, health check utilities, and provider abstraction layer that enables swapping between Sentry, New Relic, or other monitoring services without app code changes.

This is the foundational monitoring package that `@agency/monitoring-rum` builds upon. It handles lab-based performance measurement, error tracking, and diagnostic utilities while RUM focuses on field data and CrUX integration.


## Condition Block

- **Build when:** First production app needs performance monitoring OR error tracking requirements emerge OR SLI/SLO tracking is needed.
- **Do not build when:** Apps are pre-production with no observability requirements OR third-party monitoring is handled entirely outside the monorepo.
- **Minimum consumer rule:** One consumer required — this package provides base infrastructure that even a single app benefits from.
- **Exit criteria:**
  - [ ] Core Web Vitals instrumentation utilities functional
  - [ ] Error boundary components capturing and reporting errors
  - [ ] Health check patterns implemented and documented
  - [ ] Provider abstraction layer supports at least two providers (Sentry + New Relic)
  - [ ] Vercel Speed Insights integration working
  - [ ] Performance marks and measures API exposed
  - [ ] README with integration guide complete
  - [ ] Changeset documenting initial release


## Dependencies

- `@agency/core-types` - for error and metric type definitions
- `@agency/core-utils` - for diagnostic utilities
- `@agency/config-eslint` - lint rules
- `@agency/config-typescript` - TypeScript configuration

Optional runtime dependencies (install only when provider activated):
- `@sentry/nextjs` - Error tracking and performance monitoring
- `newrelic` - Node agent for full observability


## Consumer Apps

- `apps/agency-website` - Marketing site performance monitoring
- `apps/client-sites/*` - Client site error tracking
- `apps/internal-tools/*` - Internal tool health monitoring
- Any app requiring error boundaries or performance marks


## Success Criteria

- Core Web Vitals metrics captured and reportable
- Error boundaries catch and report unhandled errors
- Health check endpoints return standardized status
- Provider swap requires only configuration change
- Performance marks API integrates with React Profiler
- No app code changes needed to switch monitoring vendors
- Type-safe exports for all monitoring utilities
- Server and client-side monitoring patterns documented

