# Monitoring Rum


## Purpose
Field performance monitoring using Chrome User Experience Report (CrUX) data and custom Web Vitals tracking. Measures actual user experiences rather than lab scores, providing ranking-critical performance data for client sites.


## Condition Block

- **Build when:** Client sites need Google ranking-critical performance data OR Core Web Vitals field data for SLA reporting.
- **Do not build when:** Lab-based Lighthouse scores are sufficient OR client uses third-party RUM (SpeedCurve, Calibre).
- **Minimum consumer rule:** One client site requiring CrUX data integration.
- **Exit criteria:**
  - [ ] Web Vitals library integration (INP, LCP, CLS, TTFB, FCP)
  - [ ] CrUX API client for origin-level data
  - [ ] Performance attribution (by page, component, traffic source)
  - [ ] Mobile vs Desktop segmentation
  - [ ] Historical trend storage
  - [ ] Dashboard data endpoints
  - [ ] Used by at least one client site
  - [ ] README with Web Vitals implementation guide
  - [ ] Changeset documenting initial release


## Dependencies

- `42-monitoring` (Base monitoring infrastructure)
- `50-data-db` (Historical data storage)
