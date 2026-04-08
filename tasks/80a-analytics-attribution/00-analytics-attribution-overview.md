# Analytics Attribution


## Purpose
Multi-touch attribution modeling for marketing campaigns across channels (organic, paid, social, email, direct). Enables data-driven budget allocation by calculating true contribution of each touchpoint to conversions, beyond last-click reporting.


## Condition Block

- **Build when:** Client runs cross-channel campaigns OR needs data-driven budget allocation OR last-click attribution insufficient.
- **Do not build when:** Single-channel marketing OR basic last-click reporting sufficient.
- **Minimum consumer rule:** One client with 3+ marketing channels.
- **Exit criteria:**
  - [ ] Attribution models implemented (first-touch, linear, time-decay, data-driven)
  - [ ] Touchpoint tracking across sessions
  - [ ] Channel path analysis
  - [ ] Assisted conversions reporting
  - [ ] Budget allocation recommendations
  - [ ] Data warehouse integration (BigQuery/Snowflake)
  - [ ] Used by at least one client site
  - [ ] README with attribution setup guide
  - [ ] Changeset documenting initial release


## Dependencies

- `80-analytics` - Base analytics infrastructure
- `50-data-db` - Data persistence
