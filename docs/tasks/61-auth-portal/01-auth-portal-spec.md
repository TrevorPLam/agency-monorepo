# 61-auth-portal: Implementation Specification

## Task Header

| Field | Value |
|-------|-------|
| **State** | `conditional` — Package-controlled, opt-in only |
| **Trigger** | First client portal requiring authentication |
| **Minimum Consumers** | 1+ client portals needing auth |
| **Dependencies** | `better-auth@1.6.2`, `@better-auth/drizzle-adapter@1.6.2` |
| **Exit Criteria** | Auth package exported and integrated in at least one client portal |
| **Implementation Authority** | `REPO-STATE.md` — Conditional; requires explicit app-level opt-in |
| **Version Authority** | `DEPENDENCY.md` §5 — Better Auth 1.6.2 |
| **Supersedes** | n/a |
| **Superseded by** | n/a |

## Cross-references

- Decision status: `DECISION-STATUS.md` — Better Auth `leaning` (preferred for client portals)
- Version pins: `DEPENDENCY.md` §10
- Architecture: `ARCHITECTURE.md` — Auth layer section
- Scope boundary: `@agency/auth-portal` standardizes the Better Auth portal lane only; alternative providers require a separate ADR and must not be bundled as a default fallback surface

## Files
```
packages/auth/portal/
├── package.json
├── tsconfig.json
├── README.md
└── src/
    ├── index.ts
    ├── auth.ts
    ├── client.ts
    └── types.ts
```

### `package.json`
```json
{
  "name": "@agency/auth-portal",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "exports": {
    ".": "./src/index.ts",
    "./auth": "./src/auth.ts",
    "./client": "./src/client.ts",
    "./types": "./src/types.ts"
  },
  "dependencies": {
    "@agency/core-types": "workspace:*",
    "@agency/data-db": "workspace:*",
    "better-auth": "1.6.2",
    "@better-auth/drizzle-adapter": "1.6.2"
  },
  "devDependencies": {
    "@agency/config-eslint": "workspace:*",
    "@agency/config-typescript": "workspace:*"
  },
  "publishConfig": { "access": "restricted" }
}
```

### `src/auth.ts` (Better Auth - Primary)
```ts
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import type { DatabaseClient } from "@agency/data-db";

export function createAuth(db: DatabaseClient) {
  return betterAuth({
    database: drizzleAdapter(db, { provider: "pg" }),
    emailAndPassword: { enabled: true },
    // Better Auth 1.6.x: Experimental joins for 2-3x performance improvement
    experimental: { joins: true },
    plugins: [
      // Enable as needed: twoFactor(), passkey(), organization()
      // Note: oidc-provider is deprecated starting in 1.6.0 - use @better-auth/oauth-provider instead
    ]
  });
}

export type AuthInstance = ReturnType<typeof createAuth>;
```

### `src/client.ts` (Better Auth Client)
```ts
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL
});

export type AuthClient = typeof authClient;
```

### `src/types.ts`
```ts
export interface PortalUser {
  id: string;
  email: string;
  emailVerified: boolean;
  name?: string;
  image?: string;
}

export interface PortalSession {
  user: PortalUser;
  session: {
    id: string;
    expiresAt: Date;
    ipAddress?: string;
    userAgent?: string;
  };
}
```

### `src/index.ts`
```ts
export { createAuth, type AuthInstance } from "./auth";
export { authClient, type AuthClient } from "./client";
export type { PortalUser, PortalSession } from "./types";
```

### README
```md
# @agency/auth-portal
Authentication for client portals with Better Auth.

## Provider Strategy
- **Portal default**: Better Auth with Drizzle adapter and app-owned database
- **Optional plugins**: 2FA, passkeys, organization support, RBAC when a portal explicitly needs them
- **Out of scope for this package**: Supabase Auth, Auth.js, or WorkOS wrappers as bundled fallback providers

## Usage - Better Auth (Default)

### Server
```ts
import { createAuth } from "@agency/auth-portal/auth";
import { createDbClient } from "@agency/data-db";
const auth = createAuth(createDbClient(process.env.DATABASE_URL!));
```

### Client
```tsx
import { authClient } from "@agency/auth-portal/client";
await authClient.signIn.email({ email, password });
```

## Boundary Rules

- The shared portal-auth package exposes one provider lane: Better Auth.
- Alternative providers are escalation decisions, not runtime toggles hidden behind one package surface.
- If a portal needs a materially different auth stack, create a new ADR and treat that as a separate package or app-level decision.

## Environment Variables

### Better Auth
- `DATABASE_URL` - For Better Auth's Drizzle adapter
- `BETTER_AUTH_SECRET`
- `BETTER_AUTH_URL` or `NEXT_PUBLIC_APP_URL`

## Escalation Path

If enterprise SSO/SCIM is needed:
1. Add the required Better Auth plugin first if the gap is feature-level.
2. If the gap is provider-level, write an ADR for a distinct auth lane instead of extending `@agency/auth-portal` with fallback wrappers.
```
