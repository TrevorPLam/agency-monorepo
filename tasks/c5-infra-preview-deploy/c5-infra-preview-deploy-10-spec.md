# c5-infra-preview-deploy: Implementation Specification

## Task Header

| Field | Value |
|-------|-------|
| **State** | `conditional` — Package-controlled, opt-in only |
| **Trigger** | Apps require preview deployments for PR review |
| **Minimum Consumers** | 1+ apps needing preview URLs |
| **Dependencies** | Vercel OR Netlify, GitHub Actions |
| **Exit Criteria** | Preview deploys working on PRs |
| **Implementation Authority** | `REPO-STATE.md` — Conditional; requires explicit need |
| **Version Authority** | `DEPENDENCY.md` — repository toolchain baseline; provider examples remain validation-based |
| **Supersedes** | n/a |
| **Superseded by** | n/a |

**Cross-references:**
- Decision status: `DECISION-STATUS.md` — Preview deploy `open`
- Note: Conditional; only needed for apps with visual review requirements

## Files
```
.github/
└── workflows/
    └── preview.yml
```

### `.github/workflows/preview.yml`
```yaml
name: Preview Deployment

on:
  pull_request:
    types: [opened, synchronize, reopened]

concurrency:
  group: preview-${{ github.ref }}
  cancel-in-progress: true

env:
  NODE_VERSION: "24"
  PNPM_VERSION: "10.33.0"

jobs:
  # ============================================
  # Build all apps
  # ============================================
  build:
    name: Build Apps
    runs-on: ubuntu-latest
    timeout-minutes: 15
    steps:
      - name: Checkout
        uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Setup pnpm
        uses: pnpm/action-setup@v3
        with:
          version: ${{ env.PNPM_VERSION }}

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: pnpm

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Build affected apps
        run: pnpm turbo build --filter=[origin/main...HEAD]

      - name: Upload build artifacts
        uses: actions/upload-artifact@v4
        with:
          name: preview-builds
          path: |
            apps/*/.next
            !**/node_modules
          retention-days: 1

  # ============================================
  # Deploy Agency Website Preview
  # ============================================
  deploy-agency-website:
    name: Deploy Agency Website
    needs: build
    runs-on: ubuntu-latest
    if: contains(github.event.pull_request.labels.*.name, 'preview:agency-website') || contains(github.event.pull_request.changed_files, 'apps/agency-website/')
    timeout-minutes: 10
    steps:
      - name: Download build artifacts
        uses: actions/download-artifact@v4
        with:
          name: preview-builds
          path: apps/

      - name: Deploy to Vercel (Preview)
        uses: vercel/action-deploy@v1
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_AGENCY_WEBSITE_PROJECT_ID }}
          working-directory: ./apps/agency-website

  # ============================================
  # Deploy Internal Tools Preview
  # ============================================
  deploy-crm:
    name: Deploy CRM
    needs: build
    runs-on: ubuntu-latest
    if: contains(github.event.pull_request.labels.*.name, 'preview:crm') || contains(github.event.pull_request.changed_files, 'apps/internal-tools/crm/')
    timeout-minutes: 10
    steps:
      - name: Download build artifacts
        uses: actions/download-artifact@v4
        with:
          name: preview-builds

      - name: Deploy CRM to Vercel
        uses: vercel/action-deploy@v1
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_CRM_PROJECT_ID }}
          working-directory: ./apps/internal-tools/crm

  # ============================================
  # Comment with Preview URLs
  # ============================================
  comment:
    name: Comment Preview URLs
    needs: [deploy-agency-website, deploy-crm]
    runs-on: ubuntu-latest
    if: always() && (needs.deploy-agency-website.result == 'success' || needs.deploy-crm.result == 'success')
    steps:
      - name: Comment PR
        uses: actions/github-script@v7
        with:
          script: |
            const { data: comments } = await github.rest.issues.listComments({
              owner: context.repo.owner,
              repo: context.repo.repo,
              issue_number: context.issue.number,
            });
            
            const botComment = comments.find(comment => 
              comment.user.type === 'Bot' && 
              comment.body.includes('Preview Deployments')
            );
            
            const body = `## Preview Deployments
            
            | App | Status | URL |
            |-----|--------|-----|
            ${needs.deploy-agency-website.result === 'success' ? '| Agency Website | Ready | [View Preview](https://agency-website-git-${context.payload.pull_request.head.ref.replace(/\//g, '-')}.vercel.app) |' : ''}
            ${needs.deploy-crm.result === 'success' ? '| CRM | Ready | [View Preview](https://crm-git-${context.payload.pull_request.head.ref.replace(/\//g, '-')}.vercel.app) |' : ''}
            
            Built from commit: \`${context.sha.substring(0, 7)}\`
            `;
            
            if (botComment) {
              await github.rest.issues.updateComment({
                owner: context.repo.owner,
                repo: context.repo.repo,
                comment_id: botComment.id,
                body: body
              });
            } else {
              await github.rest.issues.createComment({
                owner: context.repo.owner,
                repo: context.repo.repo,
                issue_number: context.issue.number,
                body: body
              });
            }
```


## Required Secrets

| Secret | Source |
|--------|--------|
| `VERCEL_TOKEN` | Vercel → Settings → Tokens |
| `VERCEL_ORG_ID` | Vercel project settings |
| `VERCEL_*_PROJECT_ID` | Per-project in Vercel |


## Usage

1. **Label-based deployment**:
   - Add label `preview:agency-website` to deploy agency site
   - Add label `preview:crm` to deploy CRM

2. **Auto-deployment**:
   - Apps auto-deploy if their files changed in PR


## Implementation Checklist

- [ ] File placed at `.github/workflows/preview.yml`
- [ ] Vercel tokens configured
- [ ] Projects linked to Vercel
- [ ] Test PR with preview label created
