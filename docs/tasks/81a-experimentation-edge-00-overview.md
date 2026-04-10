# Experimentation Edge


## Purpose
Zero-latency feature flags and A/B testing using Vercel Edge Config for marketing sites. Enables instant variant switching without API calls, critical for high-traffic landing pages where millisecond delays impact conversion rates.


## Condition Block

- **Build when:** Marketing sites need zero-latency A/B testing OR hero/CTA variants must switch instantly without page flicker.
- **Do not build when:** Product portals using PostHog/LaunchDarkly for complex experiments OR latency tolerance >100ms.
- **Minimum consumer rule:** One marketing site requiring instant variant delivery.
- **Exit criteria:**
  - [ ] Edge Config client integrated
  - [ ] Flag evaluation at edge (no origin round-trip)
  - [ ] A/B variant assignment with sticky bucketing
  - [ ] SSR-safe hooks (no hydration mismatch)
  - [ ] Vercel Toolbar integration
  - [ ] Used by at least one marketing site
  - [ ] README with Edge Config setup guide
  - [ ] Changeset documenting initial release


## Dependencies

- `81-experimentation` (Product experimentation foundation)
- `80-analytics` (Conversion tracking)
