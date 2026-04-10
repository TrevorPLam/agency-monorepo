# 14-config-biome: Migration Guide

## Purpose
Guide developers through evaluating Biome against the canonical ESLint + Prettier lane without turning that evaluation into an unapproved repo-wide migration.

## Migration Overview

This guide covers how to run a bounded Biome comparison on approved targets so decision owners can judge whether adoption is justified later.

## Prerequisites
- Complete `@agency/config-biome` package installation for the evaluation lane
- Use only the Biome version approved in `DEPENDENCY.md`
- Preserve existing ESLint + Prettier configurations as the canonical default

## Step-by-Step Evaluation

### Phase 1: Preparation
1. **Choose an Evaluation Target**
   Select a representative package, fixture, or isolated workspace target and document why it was chosen.

2. **Add Opt-In Evaluation Scripts**
   ```json
   {
     "scripts": {
       "lint:biome:eval": "biome check .",
       "format:biome:eval": "biome format .",
       "lint:biome:fix:eval": "biome check . --apply"
     }
   }
   ```

3. **Test Biome on the Evaluation Target**
   ```bash
   pnpm --filter <evaluation-target> lint:biome:eval
   pnpm --filter <evaluation-target> format:biome:eval
   ```

### Phase 2: Comparison
1. **Compare Against the Current Baseline**
   Run the evaluation target through both the Biome lane and the canonical ESLint + Prettier lane.

2. **Capture Gaps and Tradeoffs**
   Record rule differences, workflow friction, editor behavior, and any missing boundary checks.

3. **Keep Default Scripts Intact**
   Do not replace root or package `lint` / `format` commands during evaluation.

4. **Validate the Evaluation Result**
   ```bash
   pnpm --filter <evaluation-target> lint
   pnpm --filter <evaluation-target> lint:biome:eval
   pnpm --filter <evaluation-target> build
   ```

### Phase 3: Assessment
1. **Document Findings**
   Summarize performance, parity, and operational tradeoffs clearly.

2. **Preserve the Canonical Lane**
   Leave ESLint + Prettier in place unless a human decision explicitly authorizes a tooling change.

3. **Prepare Decision Follow-Up**
   If the evaluation is promising, point decision owners to the remaining blockers and adoption requirements.

## Troubleshooting

### Common Issues
- **Biome Version Conflicts**: Do not install Biome in the repo until `DEPENDENCY.md` records a validated evaluation pin
- **Legacy Rules**: Some ESLint rules may not have Biome equivalents
- **IDE Integration**: VS Code may need extension update to recognize Biome

### Validation Checklist
- [ ] Evaluation scope is explicit and bounded
- [ ] ESLint + Prettier remain the canonical default lane
- [ ] Biome checks can be compared directly to the current baseline
- [ ] Build processes remain unaffected by evaluation work
- [ ] IDE integration is verified before any rollout recommendation

## Potential Benefits Under Evaluation
- **Potential Faster Linting**: Performance benefit if later adopted
- **Potential Single Tooling Surface**: Could unify linting and formatting
- **Potential Reduced Complexity**: Only after boundary and workflow parity are proven
- **Modern Implementation Model**: Rust-based tooling with modern language support

## Success Criteria
Evaluation is complete when:
1. Feature and boundary-rule parity have been assessed honestly
2. No default-lane language remains ambiguous
3. Performance improvements are measurable and relevant
4. Developer workflow tradeoffs are documented clearly
5. Decision owners can choose whether adoption is justified
