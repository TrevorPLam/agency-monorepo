# a0-docs-agents: Handoff Prompt for AI Agents

## Agent Implementation Prompt

When implementing features in this monorepo, follow this workflow:

### Before Starting
1. Read `docs/AGENTS.md` completely
2. Read the target package's:
   - `README.md` (purpose and consumers)
   - `CHANGELOG.md` (recent patterns)
   - `package.json` exports (public API)
   - `CODEOWNERS` (who reviews)

### During Implementation
1. **Never import from internal paths** - Use only exported paths
2. **Check dependency direction** - Core cannot import from UI/Data/Auth
3. **Add tests** - Every behavior change needs test coverage
4. **Use workspace:* for internal deps** - Never use relative paths crossing package boundaries

### Before Submitting
1. Run filtered build: `pnpm turbo build --filter=@agency/[package]...`
2. Run filtered test: `pnpm turbo test --filter=@agency/[package]...`
3. Check for changeset need: `pnpm changeset` if shared package changed
4. Verify no secrets committed

### Client Data Handling
If touching `@agency/data-db`:
- Every query function MUST require `clientId` parameter
- Every WHERE clause MUST include `client_id` filter
- Think: "Can this accidentally return another client's data?"

### When Uncertain
Stop and ask. Do not guess. The monorepo rules exist to prevent silent technical debt.
