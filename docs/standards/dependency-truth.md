# Dependency Truth Standard

## Purpose

This standard defines the classification system and governance rules for all dependency versions in the agency monorepo. It establishes what counts as verified, what requires validation, and when `latest` is acceptable.

## Classification System

### Verified Exact Pins
**Definition**: Version confirmed from official source (registry, changelog, or docs) and locked for production use.

**Sources of Truth**:
1. **Official npm registry** - Latest stable version from package page
2. **Official changelog** - For release notes and breaking changes  
3. **Official docs** - For installation instructions
4. **GitHub releases** - For verification only

**Requirements**:
- Must include exact version number (no ranges, no `^`, no `latest`)
- Must be referenced in `DEPENDENCY.md` with verification date
- Must be tested in at least one consuming app before merge

### Approved Ranges
**Definition**: Semver range approved for non-runtime dependencies where exact pin isn't critical.

**Requirements**:
- Must use semantic versioning (`^9.0.0`, `^2.1.0`)
- Must be justified in package documentation
- Must be tested across major version boundaries

### Tool-Only Latest
**Definition**: Acceptable for CLI tools invoked by generators, not runtime dependencies.

**Requirements**:
- Must be clearly marked as tool-only in documentation
- Must not appear in any `package.json` dependencies
- Must include verification note if untested

### Validation Pending
**Definition**: Placeholder requiring verification before production use.

**Requirements**:
- Must be marked with ⚠️ emoji in `DEPENDENCY.md`
- Must include verification checklist
- Must have target verification date
- Must not be used in production without verification

## When `latest` is Allowed

### Never Allowed (Runtime)
- In any `package.json` dependencies
- In internal package version pins
- For core framework dependencies (Next.js, React, TypeScript)

### Allowed (Tool-Only)
- Generator CLI commands (e.g., `npx create-next-app@latest`)
- Research placeholders marked "verify before use"
- Documentation examples explicitly labeled as tool commands

## Stale Pin Correction Process

When a version pin is found to be outdated:

1. **Verify** new version from official source
2. **Update** this document (DEPENDENCY.md) first
3. **Update** all referencing documents (ARCHITECTURE.md, task specs)
4. **Run** `pnpm install` to update lockfile
5. **Test** in at least one consuming app before merging
6. **Document** breaking changes in CHANGELOG.md

## Package-Specific Rules

### Core Dependencies
- **Next.js/React/TypeScript**: Must use verified exact pins from §1
- **pnpm**: Must use `packageManager` field, not `engines`
- **Node.js**: Must use `.nvmrc` + `engines` for consistency

### Provider Dependencies
- **Database**: Neon primary, Supabase documented fallback
- **Auth**: Clerk internal, Better Auth portal (with Drizzle adapter)
- **Email**: Resend primary, Postmark premium alternative

### Internal Dependencies
- **All internal packages**: Must use `workspace:*` ranges
- **No cross-package relative imports**: Use workspace protocol

## Governance Requirements

### Before Adding Dependencies
1. Check this standard for classification rules
2. Verify version from official source
3. Determine appropriate classification
4. Update this document first
5. Update task specifications if needed
6. Test in isolation before integration

### Code Review Checklist
- [ ] Dependency follows classification rules
- [ ] Version matches this document exactly
- [ ] Tool-only dependencies are properly marked
- [ ] No `latest` in runtime dependencies
- [ ] Workspace dependencies use `workspace:*`
- [ ] Provider choices follow documented lanes

## Audit Requirements

### Monthly Reviews
- Review all new dependencies added in the month
- Check for stale pins or outdated ranges
- Verify tool-only dependencies are still appropriate
- Update validation pending items with progress

## Integration with Other Standards

This standard integrates with:
- `REPO-STATE.md` - For implementation authority
- `DECISION-STATUS.md` - For decision status
- Package-specific task specifications - For detailed dependency requirements
- `docs/standards/tenant-isolation-data-governance.md` - For data handling dependencies

All dependency decisions must reference this standard and follow the classification system defined herein.
