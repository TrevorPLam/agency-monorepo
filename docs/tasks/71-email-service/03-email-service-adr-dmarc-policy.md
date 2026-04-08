# ADR: Email Deliverability and DMARC Policy

## Status
Accepted

## Context
Email deliverability is non-negotiable for transactional emails (password resets, invoices, notifications). Major inbox providers (Gmail, Outlook, Yahoo) now require authentication protocols for inbox placement.

Key requirements (2026):
- DMARC mandatory for Gmail, Outlook, Yahoo delivery
- SPF and DKIM required as DMARC prerequisites
- Domain reputation affects deliverability scores
- Bounce rates >5% risk provider suspension

## Decision
Implement strict deliverability requirements before ANY production email sending.

## Authentication Stack

### 1. SPF (Sender Policy Framework)
DNS TXT record format:
```
v=spf1 include:resend.com include:spf.postmarkapp.com ~all
```

### 2. DKIM (DomainKeys Identified Mail)
- 2048-bit RSA key minimum
- Auto-enabled by Postmark
- Manual setup required for Resend, Brevo

### 3. DMARC (Domain-based Message Authentication)
Progressive policy implementation:

**Phase 1: Monitoring (Month 1-2)**
```
v=DMARC1; p=none; rua=mailto:dmarc@agency.com; pct=100
```

**Phase 2: Quarantine (Month 3+)**
```
v=DMARC1; p=quarantine; rua=mailto:dmarc@agency.com; pct=100
```

**Phase 3: Reject (Month 6+, if metrics good)**
```
v=DMARC1; p=reject; rua=mailto:dmarc@agency.com; pct=100
```

## Provider-Specific Requirements

| Provider | SPF | DKIM | DMARC | Warm-up |
|----------|-----|------|-------|---------|
| Resend | Required | Required | Recommended | 100/day start |
| Postmark | Required | Auto | Recommended | 100/day start |
| Brevo | Required | Required | Required | 100/day start |

## Domain Warm-up Protocol

New sending domains must follow gradual volume increase:

| Week | Daily Volume | Increase |
|------|-------------|----------|
| 1 | 50 emails | Baseline |
| 2 | 75 emails | +50% |
| 3 | 100 emails | +33% |
| 4 | 150 emails | +50% |
| 5+ | Double weekly until target |

**Never exceed 20% daily increase** - sudden spikes damage reputation.

## Bounce Handling

### Hard Bounces (Permanent Failures)
- Invalid email address
- Domain doesn't exist
- **Action**: Immediately suppress, never retry

### Soft Bounces (Temporary Failures)
- Mailbox full
- Server temporarily unavailable
- **Action**: Retry 3x over 72 hours, then suppress

### Complaints
- Spam button clicks
- **Action**: Immediately suppress globally
- **Target**: <0.1% complaint rate (1 per 1,000 emails)

## Monitoring

Required tools:
- **DMARC reports**: dmarcian or similar service
- **Bounce tracking**: Provider webhooks
- **Reputation monitoring**: Google Postmaster Tools, Microsoft SNDS

## Exit Criteria for Production
- [ ] SPF record published and validated
- [ ] DKIM signing verified (check headers)
- [ ] DMARC policy published (start with p=none)
- [ ] DMARC reports receiving and monitoring
- [ ] Domain warm-up completed or in progress
- [ ] Bounce webhook handler implemented
- [ ] Suppression list management active

## References
- [DMARC Guide](https://dmarc.org/)
- [Google Email Sender Guidelines](https://support.google.com/mail/answer/81126)
- [Microsoft Anti-Spam Policy](https://docs.microsoft.com/en-us/microsoft-365/security/office-365-security/anti-spam-protection)
