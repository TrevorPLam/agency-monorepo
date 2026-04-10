# Cross-Cutting Standards

## Status

This file is a high-level index only.

Authoritative cross-cutting rules now live in dedicated task families and standards:

- Tenant isolation: `docs/tasks/a5-docs-tenant-isolation-data-governance-00-overview.md` and `docs/standards/tenant-isolation-data-governance.md`
- Dependency truth: `docs/tasks/a6-docs-dependency-truth-version-authority-00-overview.md` and `docs/standards/dependency-truth.md`
- Analytics documentation governance: `docs/tasks/a7-docs-analytics-guides-00-overview.md` and `docs/analytics/01-config-biome-migration-50-ref-quickstart.md`
- Decision-log governance: `docs/tasks/a8-docs-decisions-log-00-overview.md` and `docs/decisions/01-config-biome-migration-50-ref-quickstart.md`

Do not treat this file as the detailed implementation contract for those areas, and do not duplicate or override the dedicated standards here.

## Purpose
Define universal standards that apply across all packages and applications in the agency monorepo to ensure consistency, proper governance, and maintainable architecture.

## Scope

This document establishes three critical cross-cutting standards:

1. **Tenant Isolation Standard** - Multi-client data governance
2. **Dependency Truth Standard** - Version verification and management
3. **Provider Abstraction Standard** - When multi-provider support is justified

---

## 1. Tenant Isolation Standard

### Core Principle
Every client-owned table must include client scoping as designed by the data package. Every query that operates on client-owned data must require and enforce client scope.

### Implementation Requirements

#### Database Schema Requirements
- Every client-owned table MUST include a `clientId` column (UUID or similar identifier)
- Every query function MUST accept a `clientId` parameter
- Client scope MUST be enforced at query level, not just application level
- Row-level security is the baseline; schema-per-client is available for stronger isolation

#### Query Function Pattern
```typescript
// Correct: Enforces client scope
export async function getUsersByClient(clientId: string) {
  return db.select().from(users).where(eq(users.clientId, clientId));
}

// Incorrect: No client scope enforcement
export async function getAllUsers() {
  return db.select().from(users); // Violates isolation
}
```

#### Application-Level Integration
```typescript
// Middleware or route handler must extract clientId
export async function requireClientScope(req: Request) {
  const clientId = req.headers['x-client-id'] || req.session.clientId;
  if (!clientId) {
    throw new Error('Client scope required');
  }
  return { clientId };
}
```

### Verification Checklist
- [ ] All client-owned tables include `clientId` column
- [ ] All data access functions require `clientId` parameter
- [ ] Client scope is enforced at database query level
- [ ] No cross-client data queries exist
- [ ] Documentation clearly explains isolation model

---

## 2. Dependency Truth Standard

### Core Principle
Never install a dependency without first checking `DEPENDENCY.md` for the authorized version and classification.

### Implementation Requirements

#### Version Verification Process
1. Check `DEPENDENCY.md` for package classification
2. Verify exact pins from official sources (npm registry, changelog, docs)
3. Use approved ranges only when explicitly allowed
4. Never use `latest` for runtime dependencies
5. Use `workspace:*` for internal dependencies only

#### Package Installation Pattern
```bash
# Correct: Follows dependency truth
pnpm add @agency/config-eslint@workspace:*  # Uses workspace version

# Incorrect: Bypasses governance
pnpm add eslint@^9.0.0  # Should reference DEPENDENCY.md first
```

### Verification Checklist
- [ ] All packages reference `DEPENDENCY.md` for version authority
- [ ] No runtime dependencies use `latest` specifier
- [ ] Internal dependencies use `workspace:*` ranges
- [ ] Version pins match DEPENDENCY.md exactly
- [ ] New dependencies added to DEPENDENCY.md before installation

---

## 3. Provider Abstraction Standard

### Core Principle
Never install provider SDKs directly in applications. All provider access must go through shared abstraction packages.

### Implementation Requirements

#### Abstraction Layer Pattern
```typescript
// Correct: Provider abstraction
import { emailService } from '@agency/email-service';

export async function sendWelcomeEmail(to: string, clientId: string) {
  return emailService.send({
    template: 'welcome',
    to,
    data: { clientId }
  });
}

// Incorrect: Direct provider SDK
import Resend from 'resend';

export async function sendWelcomeEmail(to: string) {
  // Violates abstraction principle
  return await Resend.emails.send({ template: 'welcome', to });
}
```

#### Multi-Provider Support Criteria
Multi-provider support is ONLY justified when:

1. **Client Requirements** - Different clients need different providers
2. **Feature Parity** - Providers have different capabilities that must be available
3. **Migration Path** - Clear migration strategy between providers
4. **Cost Optimization** - Provider selection optimizes for different use cases
5. **Fallback Strategy** - Secondary provider for backup scenarios

#### Provider Selection Matrix
| Category | Primary | Secondary | Fallback | Decision Criteria |
|-----------|---------|----------|---------|------------------|
| **Database** | Neon | Supabase | AWS Aurora | Cost, scaling needs |
| **Auth** | Clerk | Better Auth | Auth.js | Internal vs client portals |
| **Email** | Resend | Postmark | SendGrid | Deliverability vs volume |
| **CMS** | Sanity | Strapi | Directus | Self-hosted needs |
| **Analytics** | Plausible | PostHog | - | Public vs authenticated |

### Verification Checklist
- [ ] Provider SDKs never imported directly in apps
- [ ] All provider access goes through shared packages
- [ ] Provider selection follows decision matrix
- [ ] Multi-provider support has clear business justification
- [ ] Fallback strategies documented and implemented

---

## Enforcement

### Code Review Requirements
All PRs touching cross-cutting concerns must verify:

1. **Tenant Isolation** - Client scope enforcement in data queries
2. **Dependency Truth** - Version compliance with DEPENDENCY.md
3. **Provider Abstraction** - No direct provider SDK imports

### Documentation Requirements
1. Update this document when standards evolve
2. Reference specific standard sections in task documentation
3. Include verification checklists for each standard
4. Document exceptions with clear justification

---

## Governance

These standards are enforced through:
- Code review processes
- AI agent validation rules
- Package dependency checks
- Architecture review requirements

### Version History
- v1.0 - Initial cross-cutting standards definition
- Established April 2026 as part of repository correction phase


