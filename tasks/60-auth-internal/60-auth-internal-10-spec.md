# 60-auth-internal: Implementation Specification

## Task Header

| Field | Value |
|-------|-------|
| **State** | `conditional` — Package-controlled, opt-in only |
| **Trigger** | Internal tool requires authentication |
| **Minimum Consumers** | 1+ internal tools needing auth |
| **Dependencies** | Clerk 7.0.12 |
| **Exit Criteria** | Auth package exported and integrated in at least one internal tool |
| **Implementation Authority** | `REPO-STATE.md` — Conditional; requires explicit app-level opt-in |
| **Version Authority** | `DEPENDENCY.md` §5 — Clerk 7.0.12 |
| **Supersedes** | n/a |
| **Superseded by** | n/a |

**Cross-references:**
- Decision status: `DECISION-STATUS.md` — Clerk `leaning` (preferred for internal tools)
- Version pins: `DEPENDENCY.md` §5
- Architecture: `ARCHITECTURE.md` — Auth layer section
- Tenant isolation: `docs/standards/tenant-isolation-data-governance.md` for internal tools that touch client-owned data
- Dependency-truth policy: `docs/standards/dependency-truth.md`
- Note: Internal tools use Clerk; defer to Task 61 for portal auth, and keep any client-owned data access aligned with `a5`

## Files
```
packages/auth/internal/
├── package.json
├── tsconfig.json
├── README.md
└── src/
    ├── index.ts
    ├── middleware.ts
    ├── session.ts
    └── roles.ts
```

### `package.json`
```json
{
  "name": "@agency/auth-internal",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "exports": {
    ".": "./src/index.ts",
    "./middleware": "./src/middleware.ts",
    "./session": "./src/session.ts",
    "./roles": "./src/roles.ts"
  },
  "dependencies": {
    "@agency/core-types": "workspace:*",
    "@clerk/nextjs": "7.0.12"
  },
  "devDependencies": {
    "@agency/config-typescript": "workspace:*"
  },
  "publishConfig": { "access": "restricted" }
}
```

### `src/middleware.ts`
```ts
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/crm(.*)",
  "/invoicing(.*)"
]);

export default clerkMiddleware((auth, req) => {
  if (isProtectedRoute(req)) {
    auth().protect();
  }
});

export const config = {
  matcher: ["/((?!_next|.*\\..*).*)"]
};
```

### `src/session.ts`
```ts
import { auth } from "@clerk/nextjs/server";
import type { UserRole } from "./roles";

export async function getCurrentUser() {
  const session = auth();
  const userId = (await session).userId;
  
  if (!userId) return null;
  
  return {
    id: userId,
    // Fetch additional user data from your database
  };
}

export async function requireRole(role: UserRole) {
  const user = await getCurrentUser();
  // Implement role checking logic
  return user;
}
```

### `src/roles.ts`
```ts
export const userRoles = ["admin", "manager", "developer", "viewer"] as const;

export type UserRole = typeof userRoles[number];

export const roleHierarchy: Record<UserRole, number> = {
  admin: 4,
  manager: 3,
  developer: 2,
  viewer: 1
};

export function hasRole(userRole: UserRole, requiredRole: UserRole): boolean {
  return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
}
```

## Verification

```bash
# Type check
pnpm --filter @agency/auth-internal typecheck

# Test middleware
pnpm --filter @agency/auth-internal test
```
