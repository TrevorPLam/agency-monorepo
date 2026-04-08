# ADR: AI Agent Tooling and Rules Architecture

## Status

**Accepted** — April 2026

## Context

The agency monorepo is designed to be maintained primarily through AI coding tools (Cursor, Windsurf, Claude Code, Copilot). This approach requires explicit architectural decisions about:

1. Which AI tools are supported
2. How rules are structured for machine consumption
3. What documentation format optimizes for AI agent comprehension
4. How to prevent architectural drift from AI-generated code

## Decision

### 1. Multi-Tool Support Strategy

**Decision:** Support all major AI coding tools without tool-specific lock-in.

**Rationale:**
- Cursor, Windsurf, and Claude Code each have strengths for different tasks
- Tool landscape evolves rapidly (Windsurf acquired by Cognition AI in July 2025)
- No single tool dominates all use cases
- Repository must remain portable between tools

**Implementation:**
- `AGENTS.md` uses natural language rules (not tool-specific syntax)
- All tools can read and follow the same rule set
- Tool-specific optimizations (like .cursorrules) are additive, not required

### 2. AGENTS.md as Hard Constraints Document

**Decision:** `AGENTS.md` defines non-negotiable rules that override default AI behavior.

**Rationale:**
- AI tools have default behaviors that may conflict with monorepo architecture
- Explicit constraints prevent "helpful" violations (like adding convenient imports)
- Hard constraint language signals severity to both AI and human readers

**Format choices:**
- Rules stated as imperatives ("Never", "Always", "Must")
- Examples show correct vs forbidden patterns
- Authority order clearly defined for conflict resolution
- Stop conditions explicitly stated

### 3. Task-Based Documentation Structure

**Decision:** Use numbered task folders (00-overview, 01-spec, 02-constraints, etc.) per `docs/tasks/1.md` convention.

**Rationale:**
- AI agents navigate structured documentation more effectively than flat files
- Sequential numbering implies reading order
- Separation of concerns: overview ≠ spec ≠ constraints
- Extensible: new aspects can be added without reorganizing

**Structure:**
```
docs/tasks/a0-docs-agents/
├── 00-agents-overview.md      # What this is
├── 01-agents-rules-spec.md    # Complete AGENTS.md content
├── 02-agents-constraints.md   # Hard boundaries
├── 03-agents-adr-tooling.md   # This file — why this structure
├── 04-agents-guide-impl.md    # How to write agent-compliant code
├── 05-agents-qa-checklist.md  # Validation steps
└── 06-agents-handoff-prompt.md # Bounded implementation prompt
```

### 4. Public API Enforcement via Exports

**Decision:** Every shared package MUST define explicit `exports` in `package.json`.

**Rationale:**
- Without exports, AI agents can import any file via deep paths
- Deep imports create breaking changes during internal refactoring
- Exports define the intentional API surface
- Missing export signals "this is not public API"

**Rule:** AI agents must STOP when an export is needed but doesn't exist. Request it via ADR rather than work around it.

### 5. Dependency Flow Visualization

**Decision:** Document dependency flow as both text and ASCII diagram in AGENTS.md.

**Rationale:**
- Visual representation helps AI agents understand architecture quickly
- Directional arrows make flow constraints explicit
- Layer names map directly to folder structure

**Flow:**
```
config → core → ui/data/auth/communication/marketing → analytics/experimentation/lead-capture → apps
```

### 6. Generator-First Rule

**Decision:** Prefer generators over manual scaffolding or copy-paste.

**Rationale:**
- Manual scaffolding causes structural drift over time
- Generators enforce consistency in new files
- AI agents can use generators deterministically
- Human developers benefit from generator templates too

**Implementation:**
- `tools/generators/` contains all scaffolding logic
- Generators read from same templates used by documentation
- No manual copying of existing package directories

## Consequences

### Positive

- AI agents have clear, unambiguous rules to follow
- Repository structure is self-documenting for both AI and humans
- Hard constraints prevent well-intentioned architectural violations
- Task documentation structure scales to any number of concerns

### Negative

- More upfront documentation investment than typical repo
- AI agents may need multiple documentation reads per task
- Rule conflicts require explicit resolution
- Maintaining AGENTS.md as code changes requires discipline

### Neutral

- Repository assumes AI tooling is primary interface
- Human developers must also follow AGENTS.md rules
- Documentation format optimized for parsing over prose

## Alternatives Considered

### Option A: Tool-Specific Rule Files
Create `.cursorrules`, `.windsurfrules`, etc. for each tool.

**Rejected:** Fragmentation would cause drift between tool-specific rules. Single source of truth (AGENTS.md) with optional tool-specific overlays is preferred.

### Option B: No Explicit Rules
Rely on AI tool defaults and code review to catch issues.

**Rejected:** Architectural drift is expensive to fix retroactively. Explicit rules are cheaper than refactoring violations later.

### Option C: Strict Single-Tool Policy
Standardize on one AI tool (e.g., Cursor only).

**Rejected:** Tool landscape evolves too rapidly. Lock-in to one tool creates vendor risk. Repository should work well with any capable AI tool.

## Implementation Notes

1. AGENTS.md must be read by AI agents at the start of every session
2. Task folder documents follow the 00-06 numbering convention
3. All packages must have exports field before any AI agent uses them
4. Generator templates are the source of truth for scaffolding
5. AGENTS.md updates require corresponding task folder updates

## References

- `docs/AGENTS.md` — The actual rules document
- `docs/tasks/1.md` — Task folder convention specification
- `docs/ARCHITECTURE.md` — Dependency flow rules
- `docs/DEPENDENCY.md` — Package ownership and version pins

---

*ADR-003: AI Agent Tooling Architecture — Accepted April 2026*
