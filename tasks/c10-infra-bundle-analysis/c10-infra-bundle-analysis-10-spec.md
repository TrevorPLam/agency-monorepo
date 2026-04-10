# c10-infra-bundle-analysis: Implementation Specification

## Task Header

| Field | Value |
|-------|-------|
| **State** | `conditional` — Package-controlled, opt-in only |
| **Trigger** | App requires bundle size monitoring and budgets |
| **Minimum Consumers** | 1+ apps with performance budgets |
| **Dependencies** | @next/bundle-analyzer, webpack-bundle-analyzer |
| **Exit Criteria** | Bundle analysis integrated and monitoring sizes |
| **Implementation Authority** | `REPO-STATE.md` — Conditional; requires explicit performance need |
| **Version Authority** | `DEPENDENCY.md` — repository toolchain baseline and validated Next.js ecosystem pins |
| **Supersedes** | n/a |
| **Superseded by** | n/a |

**Cross-references:**
- Decision status: `DECISION-STATUS.md` — Bundle analysis `open`
- Note: Optional; performance monitoring tool

## What Bundle Analysis Checks

1. **Per-App Bundle Size**
   - JavaScript chunk sizes
   - CSS bundle size
   - Image/asset sizes

2. **Performance Budgets**
   - First Load JS threshold (e.g., 200KB)
   - Largest Contentful Paint impact
   - Third-party script weight

3. **Regression Detection**
   - Compare against main branch
   - Fail CI on budget violations
   - PR comments with size deltas

## Implementation

### CI Workflow

```yaml
# .github/workflows/ci.yml (addition)
jobs:
  bundle-analysis:
    name: Bundle Analysis
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v3
      - run: pnpm install
      - run: pnpm turbo build
      
      - name: Analyze bundles
        run: pnpm analyze
        
      - name: Upload bundle stats
        uses: actions/upload-artifact@v4
        with:
          name: bundle-analysis
          path: .bundle-analysis/
```

### Root package.json Scripts

```json
{
  "scripts": {
    "analyze": "turbo run analyze",
    "analyze:ci": "turbo run analyze:ci"
  }
}
```

### App-Level Configuration

```javascript
// apps/agency-website/next.config.js
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

module.exports = withBundleAnalyzer({
  // ...config
});
```

### Performance Budgets Config

```javascript
// budgets.config.js
module.exports = {
  budgets: [
    {
      path: '/',
      limit: '200kb',
      type: 'javascript',
    },
    {
      path: '/blog/*',
      limit: '250kb',
      type: 'javascript',
    },
  ],
};
```

## Critical Requirements

1. **CI Integration**
   - Run on every PR
   - Block merge on budget violations
   - Comment size deltas on PRs

2. **Local Analysis**
   - `pnpm analyze` command for local use
   - HTML report generation
   - Visualization of chunk composition

## Verification

```bash
pnpm analyze
# Opens bundle analyzer in browser
```
