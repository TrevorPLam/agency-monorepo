# d4-infra-sentry: Error Tracking & Monitoring Infrastructure

## Purpose
Comprehensive error tracking and performance monitoring infrastructure using Sentry. Critical for production debugging, performance optimization, and user experience monitoring.

## Dependencies
- **Required**: `42-monitoring` (complements performance monitoring)
- **Required**: `e3-apps-agency-website` (monitoring target)
- **Required**: `e1-apps-crm` (monitoring target)
- **Optional**: `72-notifications` (alert routing)

## Scope
This task establishes:
- Sentry SDK integration for all apps
- Error boundary components for React
- Performance tracing for API routes
- Release tracking and source maps
- Alert routing (Slack, PagerDuty, email)
- User feedback collection
- Session replay for critical errors

## Why Error Tracking is Essential

### Production Debugging
- Stack traces with source maps (TypeScript → readable code)
- Request/response context for API errors
- User impact metrics (how many users affected)
- Breadcrumbs showing user journey

### Performance Insights
- Slow database queries identified
- API endpoint latency tracking
- Frontend rendering performance
- Resource loading bottlenecks

### Business Impact
- Reduced mean time to resolution (MTTR)
- Proactive issue detection before user reports
- Quantify technical debt impact
- Prove ROI of performance improvements

## Next Steps
1. Set up Sentry organization and projects
2. Configure Sentry SDK in shared monitoring package
3. Add error boundaries to UI components
4. Configure source maps for production
5. Set up alert routing and escalation
6. Enable session replay for critical flows

## Related Tasks
- `42-monitoring` - Performance monitoring (complementary)
- `72-notifications` - Alert routing
- `42a-monitoring-rum` - Real User Monitoring
- `c2-infra-ci-workflow` - Release tracking integration
