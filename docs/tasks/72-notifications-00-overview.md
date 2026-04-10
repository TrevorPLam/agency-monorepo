# Notifications


## Purpose
Slack, Discord, and webhook helpers plus in-app notification plumbing.


## Condition Block

- **Build when:** Multiple workflows need the same Slack, Discord, webhook, or in-app notification plumbing.
- **Do not build when:** A single app can call one provider directly without distortion.
- **Minimum consumer rule:** Two consumers required — this package exists to normalize notification delivery.
- **Exit criteria:**
  - [ ] At least two consumers share the same normalized notification layer
  - [ ] Provider abstraction (Slack/Discord/webhook) functional
  - [ ] In-app notification plumbing working (if implemented)
  - [ ] README with notification patterns
  - [ ] Changeset documenting initial release
