# e9-apps-api: Constraints

## Hard constraints

- Keep route handlers as the default until the extraction threshold is met.
- Keep internal and public API concerns separate.
- Keep tenant-sensitive APIs aligned with the tenant-isolation standard.
- Do not let “future reuse” justify present extraction.

## Documentation constraints

- Make the extraction threshold explicit.
- State deployment, auth, and rate-limit assumptions clearly.
- Keep this task narrow: it governs when the lane exists, not how every endpoint should be implemented.