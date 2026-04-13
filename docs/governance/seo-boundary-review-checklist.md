# SEO Boundary Review Checklist

> Use this checklist before creating `@agency/seo` or moving SEO logic out of an app.

---

## 1) Consumer reality check

### Real consumers
- [ ] Are there at least 2 approved public-facing apps that need the same SEO capability now?
- [ ] Are both consumers real current consumers rather than hypothetical future reuse?
- [ ] Is one of the consumers more than just tests, stories, or route variants inside one app?

If any answer is no, keep the logic app-local.

---

## 2) Distortion check

### Shared API viability
- [ ] Can both consumers use the same API without brand-specific forks?
- [ ] Can both consumers use the same API without route-model-specific exceptions?
- [ ] Can both consumers use the same API without campaign-specific conditionals?
- [ ] Can both consumers use the same API without site-specific content branching?

If any answer is no, keep the logic app-local.

---

## 3) Scope check

### Narrow infrastructure only
- [ ] Is the proposed extraction limited to infrastructure such as metadata helpers, JSON-LD builders, sitemap helpers, robots helpers, or OG utility helpers?
- [ ] Does the proposal avoid page-level metadata content?
- [ ] Does the proposal avoid canonical decisions tied to one site’s routing?
- [ ] Does the proposal avoid branded OG composition?
- [ ] Does the proposal avoid campaign-specific SEO logic?

If any answer is no, the package is probably too broad.

---

## 4) Milestone and approval check

- [ ] Is the repo beyond the point where app-local SEO is the correct Milestone 1 default?
- [ ] Is `@agency/seo` explicitly approved in `REPO-STATE.md`?
- [ ] Is the relevant Topic 11 decision marked locked in `DECISION-STATUS.md`?
- [ ] Is the package trigger satisfied in `DEPENDENCY.md`?

If any answer is no, do not create the package.

---

## 5) Dependency and boundary check

- [ ] Would the package depend only on allowed external dependencies?
- [ ] Would the package depend only on allowed lower-level internal packages?
- [ ] Can the package expose a narrow API through explicit `exports`?
- [ ] Would the package avoid importing from apps?
- [ ] Would the package avoid circular dependencies?

If any answer is no, reject or redesign the package.

---

## 6) Native-platform check

- [ ] Could this SEO need be satisfied cleanly with native Next.js metadata, sitemap, robots, or OG image primitives inside the app?
- [ ] Would app-local implementation be smaller and safer right now?
- [ ] Is the package being proposed because of real reuse rather than because a shared package feels cleaner?

If app-local is still smaller and safer, keep it app-local.

---

## 7) Final outcome

### Reviewer decision
- [ ] Keep app-local
- [ ] Approved for shared-package proposal
- [ ] Rejected
- [ ] Needs clarification

### Reason
Explain the decision in 3–5 sentences.