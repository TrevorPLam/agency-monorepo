# Tenant Isolation and Data Governance Standard

## Purpose

This standard defines mandatory tenant isolation rules and data governance requirements for all agency monorepo packages and applications that handle client data. These rules are non-negotiable and must be enforced in code reviews and automated testing.

## Core Principles

1. **Zero Trust Boundary**: No package may ever return data belonging to a different client without explicit authorization
2. **Explicit Scoping**: Every data access must require and enforce client scope
3. **Defense in Depth**: Multiple layers of isolation prevent both accidental and malicious data crossover
4. **Audit Trail**: All data access must be logged for compliance and debugging

## Mandatory Scoping Rules

### Database Level
- **Every client-owned table MUST include**:
  - `client_id` column (non-nullable, UUID/GUID type)
  - `created_at` timestamp for audit trail
  - `updated_at` timestamp for audit trail
  - `tenant_isolation_level` enum (e.g., 'strict', 'standard', 'shared')

### Query Level Requirements
- **All query functions MUST accept**:
  - `client_id` parameter (required, validated)
  - `user_context` with requesting user's client access rights
  - Row-level filtering enforced at query level, not just application level

### Application Level Requirements
- **All API endpoints MUST validate**:
  - Requesting user has `client_id` in their session/context
  - Requesting user is authorized to access requested client
  - Cross-client requests are rejected with 403 status

## Isolation Levels

### Level 1: Strict (Default for Client Portals)
- **Database**: Row-level `client_id` filtering on ALL queries
- **Application**: Session-scoped data access only
- **Cache**: Client-specific cache keys only
- **Search**: Full-text search scoped to client data only
- **Export**: No cross-client data aggregation allowed

### Level 2: Standard (Default for Internal Tools)
- **Database**: Row-level `client_id` filtering on sensitive queries
- **Application**: User-scoped access with elevated privileges for own client only
- **Cache**: Shared cache with client key isolation
- **Search**: Cross-client search allowed for admin users only
- **Export**: Limited cross-client aggregation for reporting only

### Level 3: Shared (Rare Exceptions)
- **Database**: No `client_id` filter (truly shared reference data)
- **Application**: Full access for admin users only
- **Cache**: Shared cache with namespace isolation
- **Search**: Full cross-client search allowed
- **Export**: Full cross-client aggregation allowed

## Implementation Requirements

### Package: @agency/data-db
- **Schema Enforcement**: All client-owned schemas MUST include `client_id` column
- **Query Builder**: All query functions MUST enforce `client_id` parameter
- **Migration Safety**: Migrations MUST preserve client isolation
- **Testing**: All tests MUST use client-scoped test data

### Package: @agency/auth-internal & @agency/auth-portal
- **Session Management**: Sessions MUST be scoped to single client
- **Token Validation**: JWT tokens MUST include `client_id` claim
- **Middleware**: Auth middleware MUST validate client scope on every request

### Package: @agency/analytics
- **Data Separation**: Analytics data MUST be stored client-scoped
- **Consent Bridge**: MUST integrate with `@agency/compliance` for client-specific consent
- **Reporting**: Cross-client analytics aggregation requires explicit authorization

## Migration and Seeding Rules

### Data Migration
- **Never migrate across clients** without explicit migration scripts
- **Seed data MUST be client-scoped** using `client_id` from seed configuration
- **Backup required** before any cross-client data operations

### Development Data
- **Development databases MUST use client suffixes** (e.g., `agency_dev_client1`)
- **Test data fixtures MUST be client-scoped**
- **Local development MAY use shared reference data** with clear documentation

## Compliance and Audit Requirements

### Automated Testing
- **Unit tests**: MUST verify client isolation in all data access functions
- **Integration tests**: MUST test cross-client data leakage scenarios
- **E2E tests**: MUST verify no unauthorized data access between clients

### Audit Logging
- **All data access MUST be logged** with: timestamp, user_id, client_id, action, table, row_id
- **Failed access attempts MUST be logged** with IP address and failure reason
- **Monthly audit reports MUST be generated** for each client

### Security Headers
- **CSP MUST restrict data endpoints** to client-specific origins only
- **Rate limiting MUST be client-aware** where applicable
- **Data deletion MUST require client-scoped authorization**

## Enforcement Mechanisms

### Code Review Checklist
- [ ] All client-owned tables include `client_id` column
- [ ] All queries accept and enforce `client_id` parameter
- [ ] No cross-client data access without explicit authorization
- [ ] Auth sessions are properly client-scoped
- [ ] Analytics data is client-isolated
- [ ] Cache keys include client isolation
- [ ] Test fixtures are client-scoped

### CI/CD Pipeline Checks
- [ ] Database migrations run with client isolation validation
- [ ] Security scanning includes client isolation verification
- [ ] Performance tests verify no cross-client data leakage
- [ ] Compliance audit passes tenant isolation rules

## Violation Categories

### Critical (Must Fix Immediately)
- **Data Leakage**: Any possibility of one client accessing another client's data
- **Bypass Scoping**: Disabled or circumvented client isolation mechanisms
- **Shared Authentication**: Cross-client session or token usage

### High Priority
- **Insufficient Logging**: Missing audit trails for data access
- **Weak Scoping**: Client_id validation missing or incomplete
- **Cache Bleed**: Client data accessible through wrong cache keys

### Medium Priority
- **Documentation Gaps**: Tenant isolation rules not documented
- **Test Coverage**: Client isolation scenarios not tested
- **Inconsistent Application**: Mixed application of isolation levels

## Exceptions Process

### Exception Request Requirements
- **Written justification** explaining why standard isolation cannot be used
- **Security review** by at least two senior engineers
- **Explicit approval** from repository owner or security lead
- **Documented mitigation** strategies for the specific exception
- **Time-limited exception** with clear expiration date

### Approved Exception Types
- **Admin Tools**: Cross-client access for legitimate administration purposes
- **Reporting Aggregation**: Cross-client analytics for business intelligence
- **Data Migration**: Temporary cross-client access during planned migration
- **Emergency Access**: Time-limited cross-client access for incident response

## Review Schedule

- **Quarterly**: Review all new client onboarding for isolation compliance
- **Monthly**: Audit log review for violation patterns
- **On-demand**: Immediate review for any exception requests
- **Annual**: Full standard review and update process

## Related Standards

This standard integrates with:
- `@agency/compliance` - Privacy and consent management
- `@agency/data-db` - Database access patterns
- `@agency/auth-*` - Authentication and authorization
- `@agency/analytics` - Analytics data handling

All packages handling client data MUST reference this standard in their documentation and implementation.
