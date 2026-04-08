# Compliance Security Headers


## Purpose
Security headers specifically designed for GDPR/CCPA compliance requirements, including data protection headers, privacy-preserving configurations, and audit-friendly security policies. Extends base security headers with privacy-focused enhancements.


## Condition Block

- **Build when:** Client operates in EU/UK (GDPR) or California (CCPA) OR requires privacy-by-default security headers OR security audit demands compliance-specific headers.
- **Do not build when:** Standard security headers sufficient OR no privacy regulations apply.
- **Minimum consumer rule:** One client with GDPR/CCPA exposure.
- **Exit criteria:**
  - [ ] GDPR-compliant CSP (no third-party data leakage)
  - [ ] Privacy-preserving Referrer-Policy
  - [ ] Permissions-Policy for device access restrictions
  - [ ] Cross-origin isolation for sensitive data
  - [ ] Security.txt with privacy contact
  - [ ] Header audit logging
  - [ ] Used by at least one compliance-sensitive site
  - [ ] README with compliance guide
  - [ ] Changeset documenting initial release


## Dependencies

- `c9-infra-security-headers` - Base security headers
- `41-compliance` - Core compliance infrastructure
- `80b-analytics-consent-bridge` - Consent integration
