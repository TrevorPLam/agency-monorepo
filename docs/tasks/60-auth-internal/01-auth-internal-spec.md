# 60-auth-internal: Implementation Specification

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
    "@clerk/nextjs": "7.0.8"
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
