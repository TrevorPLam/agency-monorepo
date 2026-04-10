# g0-infra-mcp-server: Model Context Protocol (MCP) Server Infrastructure

## Purpose
Centralized MCP (Model Context Protocol) server exposing agency monorepo context to AI tools (Cursor, Windsurf, Claude Desktop, etc.). Enables AI agents to understand repository structure, package APIs, dependencies, and architectural constraints programmatically.

## Dependencies
- **Required**: All foundation packages (config, core, UI)
- **Required**: `a0-docs-agents` (AGENTS.md rules)
- **Optional**: `c2-infra-ci-workflow` (build context)
- **Optional**: `b4-tools-content-pipeline` (AI content integration)

## Scope
This task establishes:
- MCP server implementation using official SDK
- Repository structure exploration tools
- Package documentation and API lookup
- Dependency graph analysis
- Build/test context exposure
- Automated refactoring capabilities

## Why MCP is Strategic (2026)

### Industry Standardization
- MCP is becoming the universal standard for AI tool integration (Vercel, Anthropic, OpenAI support)
- Replaces ad-hoc file-based context with structured programmatic access
- Vercel launched official MCP server in early 2026

### Benefits for Agency Workflow
- AI agents can query package APIs without parsing READMEs
- Automated dependency analysis and impact assessment
- Consistent context across all AI tools (Cursor, Windsurf, Claude)
- Reduced token waste on irrelevant files

### Future-Proofing
- MCP servers will be standard infrastructure by 2027
- Early adoption provides competitive advantage
- Enables agent-to-agent communication patterns

## Next Steps
1. Set up MCP server using `@modelcontextprotocol/sdk`
2. Implement repository structure tools
3. Create package documentation API
4. Add dependency graph analysis
5. Integrate with AI Agent Rules (AGENTS.md)
6. Enable in Cursor/Windsurf configuration

## Related Tasks
- `a0-docs-agents` - AGENTS.md (contextual rules)
- `b4-tools-content-pipeline` - AI content workflows
- `32-ui-design-system` - Component API exposure
- `c14-infra-workspace-boundaries` - Dependency enforcement
