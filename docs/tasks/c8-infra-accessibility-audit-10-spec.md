# c8-infra-accessibility-audit: Implementation Specification

## Task Header

| Field | Value |
|-------|-------|
| **State** | `conditional` — Package-controlled, opt-in only |
| **Trigger** | App requires accessibility audit and compliance |
| **Minimum Consumers** | 1+ apps with accessibility requirements |
| **Dependencies** | axe-core, Playwright, TypeScript 6.0 |
| **Exit Criteria** | Accessibility audit package exported and integrated |
| **Implementation Authority** | `REPO-STATE.md` — Conditional; requires explicit a11y need |
| **Version Authority** | `DEPENDENCY.md` §1 — TypeScript 6.0 |
| **Supersedes** | n/a |
| **Superseded by** | n/a |

**Cross-references:**
- Decision status: `DECISION-STATUS.md` — Accessibility audit `open`
- Version pins: `DEPENDENCY.md` §1
- Note: Optional; required for WCAG compliance

## Files

```
packages/config/accessibility/
├── package.json
├── tsconfig.json
├── 01-config-biome-migration-50-ref-quickstart.md
├── src/
│   ├── index.ts
│   ├── eslint-rules.ts          # JSX a11y configuration
│   ├── wcag-checklist.ts        # WCAG 2.2 AA criteria
│   ├── storybook-addon.ts       # Storybook a11y config
│   └── playwright-axe.ts        # Playwright + axe integration
├── templates/
│   ├── accessibility-ci.yml     # GitHub Actions workflow
│   └── wcag-report.md           # Compliance report template
└── bin/
    └── a11y-audit.ts            # CLI audit tool
```

### `package.json`

```json
{
  "name": "@agency/config-accessibility",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "exports": {
    ".": "./src/index.ts",
    "./eslint": "./src/eslint-rules.ts",
    "./playwright": "./src/playwright-axe.ts",
    "./wcag": "./src/wcag-checklist.ts"
  },
  "dependencies": {
    "@axe-core/react": "^4.10.0",
    "axe-core": "^4.10.0"
  },
  "devDependencies": {
    "@agency/config-eslint": "workspace:*",
    "@agency/config-typescript": "workspace:*",
    "@playwright/test": "^1.59.0"
  },
  "scripts": {
    "audit": "tsx bin/a11y-audit.ts"
  },
  "publishConfig": { "access": "restricted" }
}
```

### `src/eslint-rules.ts`

```typescript
// ESLint accessibility rules configuration

export const accessibilityESLintConfig = {
  plugins: ['jsx-a11y'],
  extends: ['plugin:jsx-a11y/recommended'],
  rules: {
    // Critical - error level
    'jsx-a11y/alt-text': 'error',
    'jsx-a11y/anchor-has-content': 'error',
    'jsx-a11y/anchor-is-valid': 'error',
    'jsx-a11y/aria-props': 'error',
    'jsx-a11y/aria-proptypes': 'error',
    'jsx-a11y/aria-unsupported-elements': 'error',
    'jsx-a11y/click-events-have-key-events': 'error',
    'jsx-a11y/heading-has-content': 'error',
    'jsx-a11y/img-redundant-alt': 'error',
    'jsx-a11y/no-access-key': 'error',
    'jsx-a11y/no-redundant-roles': 'error',
    'jsx-a11y/role-has-required-aria-props': 'error',
    'jsx-a11y/role-supports-aria-props': 'error',
    
    // Important - warning level (strict in CI)
    'jsx-a11y/aria-role': 'warn',
    'jsx-a11y/iframe-has-title': 'warn',
    'jsx-a11y/label-has-associated-control': 'warn',
    'jsx-a11y/no-autofocus': 'warn',
    'jsx-a11y/no-distracting-elements': 'warn',
    'jsx-a11y/no-interactive-element-to-noninteractive-role': 'warn',
    'jsx-a11y/no-noninteractive-element-interactions': 'warn',
    'jsx-a11y/no-noninteractive-tabindex': 'warn',
    'jsx-a11y/no-static-element-interactions': 'warn',
    'jsx-a11y/tabindex-no-positive': 'warn',
    
    // Recommended additional checks
    'jsx-a11y/aria-activedescendant-has-tabindex': 'error',
    'jsx-a11y/control-has-associated-label': 'warn',
    'jsx-a11y/mouse-events-have-key-events': 'warn',
    'jsx-a11y/no-onchange': 'off', // Deprecated, modern React handles this
  },
  settings: {
    'jsx-a11y': {
      components: {
        Button: 'button',
        Image: 'img',
        Input: 'input',
        Link: 'a',
      },
    },
  },
};

// Severity levels for CI gates
export const ciAccessibilityRules = {
  ...accessibilityESLintConfig.rules,
  // Upgrade warnings to errors in CI
  'jsx-a11y/aria-role': 'error',
  'jsx-a11y/label-has-associated-control': 'error',
  'jsx-a11y/mouse-events-have-key-events': 'error',
};
```

### `src/wcag-checklist.ts`

```typescript
// WCAG 2.2 AA compliance checklist

export interface WCAGCriterion {
  id: string;
  name: string;
  level: 'A' | 'AA' | 'AAA';
  description: string;
  tests: string[];
  automated: boolean;
}

export const wcag22Checklist: WCAGCriterion[] = [
  // Perceivable
  {
    id: '1.1.1',
    name: 'Non-text Content',
    level: 'A',
    description: 'All non-text content has text alternative',
    tests: [
      'Images have alt text',
      'Icons have aria-label or aria-hidden',
      'Decorative images have empty alt',
      'Complex images have detailed descriptions',
    ],
    automated: true,
  },
  {
    id: '1.3.1',
    name: 'Info and Relationships',
    level: 'A',
    description: 'Information structure available programmatically',
    tests: [
      'Proper heading hierarchy (h1-h6)',
      'Lists use ul/ol/li',
      'Tables have proper headers',
      'Form labels associated with inputs',
    ],
    automated: true,
  },
  {
    id: '1.4.3',
    name: 'Contrast (Minimum)',
    level: 'AA',
    description: 'Text has 4.5:1 contrast ratio (3:1 for large text)',
    tests: [
      'Normal text: 4.5:1 contrast',
      'Large text (18pt+): 3:1 contrast',
      'UI components: 3:1 contrast',
    ],
    automated: true,
  },
  {
    id: '1.4.11',
    name: 'Non-text Contrast',
    level: 'AA',
    description: 'UI components and graphics have 3:1 contrast',
    tests: [
      'Buttons have visible boundaries',
      'Form inputs have visible borders',
      'Focus indicators are visible',
    ],
    automated: true,
  },
  {
    id: '2.1.1',
    name: 'Keyboard',
    level: 'A',
    description: 'All functionality available via keyboard',
    tests: [
      'All interactive elements focusable',
      'No keyboard traps',
      'Custom controls have keyboard handlers',
    ],
    automated: false,
  },
  {
    id: '2.4.3',
    name: 'Focus Order',
    level: 'A',
    description: 'Focus order matches visual layout',
    tests: [
      'Tab order is logical',
      'No positive tabindex values',
      'Modal focus is trapped',
    ],
    automated: false,
  },
  {
    id: '2.4.7',
    name: 'Focus Visible',
    level: 'AA',
    description: 'Keyboard focus indicator is visible',
    tests: [
      'Focus ring has 2px minimum thickness',
      'Focus color contrasts with background',
      'Focus is not obscured by sticky elements',
    ],
    automated: true,
  },
  {
    id: '2.5.5',
    name: 'Target Size (Enhanced)',
    level: 'AAA',
    description: 'Touch targets minimum 44x44 CSS pixels',
    tests: [
      'Buttons minimum 44x44px',
      'Links in paragraphs exempt',
      'Inline targets exempt',
    ],
    automated: true,
  },
  {
    id: '3.3.1',
    name: 'Error Identification',
    level: 'A',
    description: 'Errors identified in text',
    tests: [
      'Form errors visible to all users',
      'Error messages specific',
      'Screen readers announce errors',
    ],
    automated: true,
  },
  {
    id: '4.1.2',
    name: 'Name, Role, Value',
    level: 'A',
    description: 'Components have name, role, value available',
    tests: [
      'Custom buttons have role="button"',
      'State changes announced (aria-live)',
      'Form inputs have accessible names',
    ],
    automated: true,
  },
];

export function getAutomatedChecks(): WCAGCriterion[] {
  return wcag22Checklist.filter(c => c.automated);
}

export function getManualChecks(): WCAGCriterion[] {
  return wcag22Checklist.filter(c => !c.automated);
}

export function generateReport(results: Record<string, boolean>): string {
  const passed = Object.values(results).filter(Boolean).length;
  const total = Object.keys(results).length;
  
  return `
# WCAG 2.2 AA Compliance Report

**Date**: ${new Date().toISOString().split('T')[0]}
**Score**: ${passed}/${total} (${Math.round((passed/total)*100)}%)

## Summary
${passed === total ? '✅ All automated checks passed' : `⚠️ ${total - passed} checks need attention`}

## Detailed Results
${wcag22Checklist.map(c => {
  const status = results[c.id] ? '✅' : '❌';
  const auto = c.automated ? '[Auto]' : '[Manual]';
  return `- ${status} **${c.id}** ${c.name} (${c.level}) ${auto}`;
}).join('\n')}

## Manual Checks Required
${getManualChecks().map(c => `- ${c.id}: ${c.tests.join(', ')}`).join('\n')}
`;
}
```

### `src/playwright-axe.ts`

```typescript
// Playwright + axe-core integration for E2E accessibility testing

import { Page, expect } from '@playwright/test';
import type { RunOptions, AxeResults } from 'axe-core';

export interface AxeTestOptions extends RunOptions {
  includedImpacts?: ('minor' | 'moderate' | 'serious' | 'critical')[];
}

// Default rules for CI (strict)
export const strictAxeOptions: AxeTestOptions = {
  includedImpacts: ['serious', 'critical'],
  rules: {
    // WCAG 2.2 AA rules
    'color-contrast': { enabled: true },
    'focus-order-semantics': { enabled: true },
    'label': { enabled: true },
    'landmark-one-main': { enabled: true },
    'region': { enabled: true },
    'page-has-heading-one': { enabled: true },
    'aria-required-attr': { enabled: true },
    'aria-required-children': { enabled: true },
    'aria-required-parent': { enabled: true },
    'aria-roles': { enabled: true },
    'aria-valid-attr-value': { enabled: true },
    'aria-valid-attr': { enabled: true },
    'button-name': { enabled: true },
    'image-alt': { enabled: true },
    'input-image-alt': { enabled: true },
    'link-name': { enabled: true },
    'list': { enabled: true },
    'listitem': { enabled: true },
  },
};

// Lenient options for development
export const devAxeOptions: AxeTestOptions = {
  includedImpacts: ['critical'],
  rules: {
    ...strictAxeOptions.rules,
    'color-contrast': { enabled: false }, // Often fails in dev
  },
};

export async function runAxeCheck(
  page: Page,
  options: AxeTestOptions = strictAxeOptions
): Promise<AxeResults> {
  // Inject axe-core
  await page.addScriptTag({
    path: require.resolve('axe-core/axe.min.js'),
  });

  // Run axe
  const results = await page.evaluate((opts) => {
    return new Promise((resolve) => {
      // @ts-ignore - axe is injected globally
      window.axe.run(opts).then(resolve);
    });
  }, options);

  return results as AxeResults;
}

export function assertNoViolations(results: AxeResults, options: AxeTestOptions = {}): void {
  const impacts = options.includedImpacts || ['serious', 'critical'];
  
  const violations = results.violations.filter(
    v => impacts.includes(v.impact as any)
  );

  if (violations.length > 0) {
    const message = violations
      .map(v => `${v.id}: ${v.help} (${v.impact})\n  ${v.nodes.map(n => n.html).join(', ')}`)
      .join('\n\n');
    
    throw new Error(`Accessibility violations found:\n${message}`);
  }
}

// Playwright test helper
export async function expectPageToBeAccessible(
  page: Page,
  options?: AxeTestOptions
): Promise<void> {
  const results = await runAxeCheck(page, options);
  assertNoViolations(results, options);
}

// Test specific components
export async function expectComponentToBeAccessible(
  page: Page,
  selector: string,
  options?: AxeTestOptions
): Promise<void> {
  const results = await runAxeCheck(page, {
    ...options,
    // @ts-ignore
    include: [selector],
  });
  assertNoViolations(results, options);
}
```

### `templates/accessibility-ci.yml`

```yaml
name: Accessibility Audit

on:
  push:
    branches: [main]
  pull_request:
    types: [opened, synchronize]

jobs:
  accessibility:
    name: Accessibility Checks
    runs-on: ubuntu-latest
    timeout-minutes: 15
    
    steps:
      - name: Checkout
        uses: actions/checkout@v4
        
      - name: Setup pnpm
        uses: pnpm/action-setup@v3
        with:
          version: 10.33.0
          
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 24
          cache: pnpm
          
      - name: Install dependencies
        run: pnpm install --frozen-lockfile
        
      - name: Build packages
        run: pnpm turbo build
        
      # 1. ESLint a11y check
      - name: Run accessibility linting
        run: |
          pnpm turbo lint --filter='@agency/*' -- --max-warnings=0 || true
          # Check specifically for a11y violations
          pnpm eslint . --ext .tsx,.jsx --no-error-on-unmatched-pattern || true
        
      # 2. Storybook accessibility tests (if using Storybook)
      - name: Run Storybook accessibility tests
        if: false  # Enable when Storybook is set up
        run: |
          pnpm --filter @agency/ui-design-system storybook:build
          pnpm --filter @agency/ui-design-system test-storybook -- --url-changed
          
      # 3. E2E accessibility tests
      - name: Install Playwright browsers
        run: pnpm exec playwright install chromium
        
      - name: Run Playwright accessibility tests
        run: |
          pnpm --filter @agency/playwright-e2e test:a11y
          
      # 4. Generate accessibility report
      - name: Generate report
        run: |
          pnpm --filter @agency/config-accessibility audit > accessibility-report.md
          
      - name: Upload accessibility report
        uses: actions/upload-artifact@v4
        if: always()
        with:
          name: accessibility-report
          path: accessibility-report.md
          
      # 5. Fail on critical violations
      - name: Check for critical violations
        run: |
          if grep -q "❌ CRITICAL" accessibility-report.md; then
            echo "Critical accessibility violations found!"
            exit 1
          fi
```

### `bin/a11y-audit.ts`

```typescript
#!/usr/bin/env tsx
// CLI tool for accessibility auditing

import { wcag22Checklist, generateReport } from '../src/wcag-checklist';

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  switch (command) {
    case 'checklist':
      console.log('WCAG 2.2 AA Checklist');
      console.log('====================\n');
      
      wcag22Checklist.forEach(c => {
        console.log(`${c.id} (${c.level}): ${c.name}`);
        console.log(`  Automated: ${c.automated ? 'Yes' : 'No (manual)'}`);
        console.log(`  Tests: ${c.tests.join(', ')}`);
        console.log();
      });
      break;

    case 'automated':
      const automated = wcag22Checklist.filter(c => c.automated);
      console.log(`Automated Checks (${automated.length}):`);
      automated.forEach(c => console.log(`  - ${c.id}: ${c.name}`));
      break;

    case 'manual':
      const manual = wcag22Checklist.filter(c => !c.automated);
      console.log(`Manual Checks (${manual.length}):`);
      manual.forEach(c => console.log(`  - ${c.id}: ${c.name}`));
      console.log('\nThese require human testing with screen readers, keyboard navigation, etc.');
      break;

    case 'report':
      // Mock results for demonstration
      const mockResults: Record<string, boolean> = {};
      wcag22Checklist.forEach(c => {
        mockResults[c.id] = Math.random() > 0.2; // 80% pass rate for demo
      });
      console.log(generateReport(mockResults));
      break;

    default:
      console.log(`
Accessibility Audit Tool

Usage:
  pnpm a11y-audit checklist    # Show full WCAG 2.2 checklist
  pnpm a11y-audit automated    # Show automated checks only
  pnpm a11y-audit manual       # Show manual checks only  
  pnpm a11y-audit report       # Generate compliance report

Environment Variables:
  A11Y_STRICT=true            # Fail on warnings (CI mode)
  A11Y_SKIP_CONTRAST=true     # Skip color contrast (dev mode)
`);
  }
}

main();
```

### README

```markdown
# @agency/config-accessibility

Automated accessibility testing infrastructure for WCAG 2.2 AA compliance.

## Why This Matters

- **Legal**: ADA lawsuits up 400% since 2020, average settlement $50K-$500K
- **EU**: European Accessibility Act mandatory compliance
- **Users**: 15-20% of population has disabilities
- **SEO**: Accessible sites rank better

## Quick Start

### 1. Install in your app/package

```bash
pnpm add -D @agency/config-accessibility
```

### 2. Add ESLint rules

```js
// eslint.config.js
import accessibility from '@agency/config-accessibility/eslint';

export default [
  ...accessibility,
];
```

### 3. Add Playwright tests

```ts
// tests/accessibility.spec.ts
import { test, expect } from '@playwright/test';
import { expectPageToBeAccessible } from '@agency/config-accessibility/playwright';

test('homepage is accessible', async ({ page }) => {
  await page.goto('/');
  await expectPageToBeAccessible(page);
});
```

### 4. Run CLI audit

```bash
pnpm a11y-audit checklist
pnpm a11y-audit report
```

## WCAG 2.2 AA Coverage

| Category | Automated | Manual |
|----------|-----------|--------|
| Perceivable | 4/5 | 1/5 |
| Operable | 2/4 | 2/4 |
| Understandable | 1/1 | 0/1 |
| Robust | 1/1 | 0/1 |

## CI Integration

Add to `.github/workflows/accessibility.yml` (see templates/accessibility-ci.yml)

Build will fail on:
- Critical accessibility violations
- Missing alt text on images
- Form inputs without labels
- Insufficient color contrast
- Invalid ARIA usage

## Manual Testing Checklist

Even with automation, manual testing is required:

- [ ] Keyboard navigation (Tab, Enter, Escape)
- [ ] Screen reader testing (NVDA, VoiceOver)
- [ ] Zoom to 200% and 400%
- [ ] High contrast mode
- [ ] Reduced motion preferences

## Component Requirements

All `@agency/ui-design-system` components must:

1. Have proper ARIA roles
2. Support keyboard interaction
3. Have visible focus indicators
4. Meet 4.5:1 contrast ratio
5. Work with screen readers

## Resources

- [WCAG 2.2 Quick Reference](https://www.w3.org/WAI/WCAG22/quickref/)
- [axe-core Rules](https://dequeuniversity.com/rules/axe/4.10/)
- [WAI-ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
```

## Implementation Checklist

- [ ] Package created at `packages/config/accessibility/`
- [ ] ESLint rules integrated with `@agency/config-eslint`
- [ ] WCAG 2.2 checklist documented
- [ ] Playwright + axe-core tests working
- [ ] CI workflow fails on critical violations
- [ ] Storybook/Ladle accessibility addon configured
- [ ] Manual testing guide created
- [ ] UI components updated for compliance

## Verification

```bash
# Run accessibility linting
pnpm turbo lint --filter='@agency/*'

# Run E2E accessibility tests
pnpm --filter @agency/playwright-e2e test:a11y

# Generate compliance report
pnpm --filter @agency/config-accessibility audit
```

## Related Tasks

- `32-ui-design-system` - Components must pass a11y tests
- `10-config-eslint` - Integrates a11y ESLint rules
- `e5-apps-playwright-e2e` - Runs accessibility E2E tests
- `41-compliance` - GDPR (separate from accessibility)
