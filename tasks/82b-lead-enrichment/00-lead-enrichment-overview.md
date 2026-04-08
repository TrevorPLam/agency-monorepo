# Lead Enrichment


## Purpose
Social profile data enhancement for lead capture forms. Augments submitted form data with publicly available information (company size, industry, role) from sources like Clearbit, Apollo, or LinkedIn to provide sales teams with context without adding form friction.


## Condition Block

- **Build when:** Sales team needs enriched lead data OR CRM integration requires company/role data OR form conversion suffers from too many fields.
- **Do not build when:** Simple lead forms sufficient OR sales team does manual research.
- **Minimum consumer rule:** One client site with CRM integration and enrichment needs.
- **Exit criteria:**
  - [ ] Email-to-profile lookup integration (Clearbit/Apollo)
  - [ ] Company data enrichment (size, industry, revenue)
  - [ ] Role/title standardization
  - [ ] Data quality scoring
  - [ ] Privacy-compliant data handling (GDPR)
  - [ ] CRM webhook integration (Salesforce/HubSpot)
  - [ ] Fallback for unmatched emails
  - [ ] Used by at least one client site
  - [ ] README with enrichment setup guide
  - [ ] Changeset documenting initial release


## Dependencies

- `82-lead-capture` - Base lead capture
- `82a-lead-forms-progressive` - Progressive form integration
- `50-data-db` - Enrichment caching
