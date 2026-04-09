# c14-infra-workspace-boundaries: Constraints

## Hard Constraints

- Boundary enforcement must block app-to-app imports.
- Boundary enforcement must block package imports from `apps/*`.
- Shared package imports must respect public exports only.
- Domain dependency flow must align with repository architecture rules.
- Boundary checks must be automatable in CI and understandable from clear rule definitions.

## Scope Boundaries

- This task complements ESLint rules; it does not replace them.
- It does not rewrite project architecture automatically.
- It does not justify creating new packages just to satisfy a checker.
- Codemod support may be suggested, but fixes still need to preserve package boundaries intentionally.

## Implementation Rules

- Prefer deterministic static analysis over heuristic scanning that produces noisy false positives.
- Make violations actionable with path, rule, and suggested fix details.
- Keep rule definitions explicit and version-controlled.
- Ensure CI integration fails clearly when boundary rules are violated.

## Validation Expectations

- The checker must detect app-to-app imports, deep package internal imports, and illegal dependency direction.
- Clean repositories should pass quickly.
- Violations should be easy to map back to the owning package or app.
