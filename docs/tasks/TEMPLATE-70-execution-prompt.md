> **Governance Check Required**
>
> Before executing this prompt, verify:
> 1. This task is approved in `REPO-STATE.md`
> 2. All dependencies are allowed in `DEPENDENCY.md`
> 3. No locked topics in `DECISION-STATUS.md` are violated
> 4. Milestone scope is respected
>
> If any check fails, stop and escalate.

---

# {family-key}: Execution Prompt

## Mandatory Pre-Read

Read in this order:
1. `{family-key}-00-overview.md`
2. `{family-key}-10-spec.md`
3. `{family-key}-20-constraints.md`
4. `REPO-STATE.md`
5. `DEPENDENCY.md`

## Task Context

{Description of what needs to be built}

## Implementation Scope

### Must Implement

- [ ] {Item 1}
- [ ] {Item 2}
- [ ] {Item 3}

### Must NOT Implement

- {Out of scope item 1}
- {Out of scope item 2}

## Constraints

1. {Constraint 1}
2. {Constraint 2}
3. {Constraint 3}

## Verification Steps

1. {Step 1}
2. {Step 2}
3. {Step 3}

## Acceptance Criteria

- [ ] All files from `-10-spec.md` are created
- [ ] Type checking passes
- [ ] Tests pass
- [ ] No lint errors
- [ ] Exports are valid

## Reference Materials

- ADR: `{family-key}-30-adr-*.md`
- Guide: `{family-key}-40-guide-*.md`
- Quickstart: `{family-key}-50-ref-*.md`
- QA Checklist: `{family-key}-60-qa-checklist.md`

## Next Tasks

After completion:
1. {Next task 1}
2. {Next task 2}
