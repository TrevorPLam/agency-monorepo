# c14-infra-workspace-boundaries: QA Checklist

- [ ] The boundary-check tool structure exists and is documented.
- [ ] App-to-app imports are rejected.
- [ ] Package-to-app imports are rejected.
- [ ] Deep imports into package internals are rejected.
- [ ] Domain dependency flow violations are rejected.
- [ ] Violations report file path and actionable rule context.
- [ ] CI runs the boundary check.
- [ ] A clean repository run passes.
- [ ] A seeded violation produces the expected failure.
- [ ] Fix-mode behavior, if implemented, is documented as safe or limited.
