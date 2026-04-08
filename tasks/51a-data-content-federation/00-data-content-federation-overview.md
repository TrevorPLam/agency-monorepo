# Data Content Federation


## Purpose
Unified content API that aggregates content from multiple sources (Sanity, Strapi, Shopify, custom APIs) into a single GraphQL/REST interface. Enables composable architecture where content is treated as data from multiple sources rather than locked into a single CMS.


## Condition Block

- **Build when:** A client site needs content from 2+ distinct sources (e.g., Sanity for marketing + Shopify for products + Strapi for documentation).
- **Do not build when:** All content lives in a single CMS or external APIs are consumed directly by apps.
- **Minimum consumer rule:** One client site with genuine multi-source content needs.
- **Exit criteria:**
  - [ ] Federation schema defined with at least 2 real content sources
  - [ ] GraphQL gateway operational with type merging
  - [ ] Source-specific resolvers implemented
  - [ ] Caching layer for federated queries
  - [ ] Error handling for partial source failures
  - [ ] Used by at least one client site
  - [ ] README with source configuration and query examples
  - [ ] Changeset documenting initial release


## Dependencies

- `51-data-cms` (Sanity client patterns)
- `50-data-db` (Caching infrastructure)
