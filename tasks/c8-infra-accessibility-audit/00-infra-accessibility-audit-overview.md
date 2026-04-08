# c8-infra-accessibility-audit: Accessibility Audit Infrastructure

## Purpose
Automated accessibility testing infrastructure ensuring WCAG 2.2 AA compliance across all applications. Critical for legal compliance (ADA, EAA) and inclusive user experience.

## Dependencies
- **Required**: `32-ui-design-system` (components to test)
- **Required**: `10-config-eslint` (for linting integration)
- **Optional**: `31-ui-icons` (icon accessibility)
- **Optional**: `e5-apps-playwright-e2e` (E2E accessibility tests)

## Scope
This task establishes:
- Automated accessibility linting (JSX a11y)
- Component-level accessibility testing (Storybook/Ladle)
- E2E accessibility scans (Playwright + axe)
- CI accessibility gates (fails build on violations)
- WCAG 2.2 compliance reporting

## Why Accessibility is Non-Negotiable

### Legal Requirements (2026)
- **USA**: ADA Title III lawsuits against websites increased 400% since 2020
- **EU**: European Accessibility Act (EAA) mandatory compliance by June 2025
- **UK**: Public sector bodies must meet WCAG 2.2 AA
- **Risk**: Average settlement $50,000-$500,000 per lawsuit

### Business Impact
- 15-20% of users have disabilities (visual, motor, cognitive)
- Accessible sites rank better in SEO
- Better usability for ALL users (curb-cut effect)

## Next Steps
1. Implement accessibility ESLint rules
2. Add Storybook/Ladle a11y addon
3. Configure Playwright + axe-core E2E tests
4. Set up CI accessibility gates
5. Create WCAG 2.2 compliance checklist

## Related Tasks
- `32-ui-design-system` - Component patterns must be accessible
- `41-compliance` - GDPR compliance (separate from a11y)
- `c2-infra-ci-workflow` - CI integration for a11y gates
- `e3-apps-agency-website` - Marketing site must be accessible
