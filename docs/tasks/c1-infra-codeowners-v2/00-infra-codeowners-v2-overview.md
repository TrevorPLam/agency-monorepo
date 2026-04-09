# C1 Infra Codeowners V2


## Purpose
Enforce automatic review requests from the correct domain owners when shared packages change. GitHub automatically requests CODEOWNERS for review when matching files change in a PR.


## Dependencies
- `00-foundation` - for repository structure
- The current package task families indexed in `docs/tasks/README.md` - define what needs ownership
