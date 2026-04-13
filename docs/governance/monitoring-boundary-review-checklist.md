# Monitoring Boundary Review Checklist

> Use this checklist before creating `@agency/monitoring` or `@agency/monitoring-rum`.

---

## 1) Launch-slice check

- [ ] Is the repo still in Milestone 1?
- [ ] If yes, can this need be handled by platform-native monitoring or app-local code?
- [ ] Is someone proposing a shared package only because target architecture already contains one?

If app-local or platform-native is still sufficient, keep it there.

---

## 2) Need classification

- [ ] Is this primarily performance visibility?
- [ ] Is this primarily browser-side field telemetry / RUM?
- [ ] Is this actually analytics rather than monitoring?
- [ ] Is this actually experimentation, replay, or feature-flag work rather than monitoring?

If the need is mixed or vague, separate the concern first.

---

## 3) Platform-native sufficiency check

- [ ] Would Vercel Speed Insights already answer the real question?
- [ ] Would framework-native web-vitals reporting already answer the real question?
- [ ] Would app-local client instrumentation be smaller and safer right now?
- [ ] Is external tooling being proposed before the built-in baseline has been tried?

If built-ins are still sufficient, do not create a shared package.

---

## 4) Shared-package trigger check

### For `@agency/monitoring`
- [ ] Is there a durable need for shared performance instrumentation or monitoring integration?
- [ ] Is the need real now rather than hypothetical?
- [ ] Can the package stay narrow without absorbing analytics or experimentation concerns?
- [ ] Is `@agency/monitoring` explicitly approved in `REPO-STATE.md`?

If any answer is no, do not create the package.

### For `@agency/monitoring-rum`
- [ ] Is there a durable need for shared browser-side field telemetry?
- [ ] Does the need exceed the platform-native baseline?
- [ ] Can the package stay narrow without absorbing analytics/session replay concerns?
- [ ] Is `@agency/monitoring-rum` explicitly approved in `REPO-STATE.md`?

If any answer is no, do not create the package.

---

## 5) Distortion check

- [ ] Would the proposed package mix performance monitoring with visitor analytics?
- [ ] Would the proposed package mix monitoring with experimentation or flags?
- [ ] Would the package require app-specific branches or vendor-specific conditionals to remain usable?
- [ ] Would the package become a generic observability dumping ground?

If any answer is yes, reject or redesign the package.

---

## 6) Dependency and boundary check

- [ ] Would the package depend only on allowed internal domains?
- [ ] Would the package avoid imports from apps?
- [ ] Can exports remain explicit and narrow?
- [ ] Would the package avoid circular dependencies?

If any answer is no, reject or redesign the package.

---

## 7) External-vendor check

- [ ] Is there a real reason to add an external observability vendor now?
- [ ] Is the platform-native baseline no longer sufficient?
- [ ] Is the added cost/setup/review burden justified by a concrete operational need?
- [ ] Is the vendor lane already allowed in `DEPENDENCY.md`?

If any answer is no, stop and escalate before adding the vendor.

---

## 8) Final reviewer decision

- [ ] Keep app-local
- [ ] Keep platform-native only
- [ ] Approve `@agency/monitoring`
- [ ] Approve `@agency/monitoring-rum`
- [ ] Reject
- [ ] Needs clarification

### Reason
Explain the decision in 3–5 sentences.