# D3 Infra Deployment Guide


## Purpose
Step-by-step guide for deploying applications with **dual-platform strategy**: Vercel (primary for Next.js) and Cloudflare (fallback for edge/cost optimization). Also covers Railway/Render for long-running workloads.


## Dependencies
- `00-foundation`
- `d2-infra-environment-mgmt` - for env vars
- `e1-apps-crm` - example internal deployment lane
