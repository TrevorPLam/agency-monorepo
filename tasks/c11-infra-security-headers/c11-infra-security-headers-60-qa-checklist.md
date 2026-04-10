# c11-infra-security-headers: QA Checklist

- [ ] Shared header policy is defined in one reviewed location.
- [ ] CSP starts from restrictive defaults.
- [ ] Any `unsafe-inline` or `unsafe-eval` allowance is documented with a reason.
- [ ] Dev, preview, and production origin differences are explicit.
- [ ] Public app flows still work with the policy enabled.
- [ ] `curl -I` or equivalent confirms expected headers are emitted.
- [ ] CSP evaluation has been run against the target app.
- [ ] CMS preview, analytics, auth, and email-related origins are only allowed when needed.
- [ ] App-level extensions do not bypass the shared base policy.
- [ ] Follow-up risks or temporary exceptions are documented.
