# 61-auth-portal/00-package: Portal Auth (Better Auth)

## Purpose
Authentication for client-facing portals. **Primary**: Better Auth for full control and zero per-MAU cost. **Fallback**: Supabase Auth when client prefers managed solution or unified backend. Supports 2FA, passkeys, RBAC, and organizations.

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
    "./auth-better": "./src/auth.ts",
    "./auth-supabase": "./src/supabase-auth.ts",
    "./client": "./src/client.ts",
    "./client-better": "./src/client.ts",
    "./client-supabase": "./src/supabase-client.ts",
    "./types": "./src/types.ts"
  },
  "dependencies": {
    "@agency/core-types": "workspace:*",
    "@agency/data-db": "workspace:*",
    "better-auth": "1.6.0",
    "@supabase/supabase-js": "2.49.0"
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
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import type { DatabaseClient } from "@agency/data-db";

export function createAuth(db: DatabaseClient) {
  return betterAuth({
    database: drizzleAdapter(db, { provider: "pg" }),
    emailAndPassword: { enabled: true },
    plugins: [
      // Enable as needed: twoFactor(), passkey(), organization()
    ]
  });
}

export type AuthInstance = ReturnType<typeof createAuth>;
```

### `src/supabase-auth.ts` (Supabase Auth - Fallback)
```ts
import { createClient, SupabaseClient } from "@supabase/supabase-js";

export type SupabaseAuthConfig = {
  url: string;
  anonKey: string;
};

export function createSupabaseAuth(config: SupabaseAuthConfig): SupabaseClient {
  return createClient(config.url, config.anonKey);
}

export type AuthInstance = SupabaseClient;

// Helper to check if a portal should use Supabase instead of Better Auth
export function shouldUseSupabaseAuth(): boolean {
  return process.env.AUTH_PROVIDER_PORTAL === "supabase";
}
```

### `src/client.ts` (Better Auth Client)
```ts
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL
});

export type AuthClient = typeof authClient;
```

### `src/supabase-client.ts` (Supabase Auth Client)
```ts
import { createClient } from "@supabase/supabase-js";

export const supabaseClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export type AuthClient = typeof supabaseClient;

// Auth helpers matching Better Auth API for easier switching
export async function signInWithEmail(email: string, password: string) {
  const { data, error } = await supabaseClient.auth.signInWithPassword({
    email,
    password
  });
  return { data, error };
}

export async function signUpWithEmail(email: string, password: string) {
  const { data, error } = await supabaseClient.auth.signUp({
    email,
    password
  });
  return { data, error };
}

export async function signOut() {
  const { error } = await supabaseClient.auth.signOut();
  return { error };
}
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
Authentication for client portals with dual-provider support.

## Provider Strategy
- **Primary**: Better Auth - Self-hosted, zero per-MAU cost, full data ownership
- **Fallback**: Supabase Auth - Managed, unified with Supabase backend, larger free tier

## Usage - Better Auth (Default)

### Server
```ts
import { createAuth } from "@agency/auth-portal/auth";
import { createDbClient } from "@agency/data-db";
const auth = createAuth(createDbClient(process.env.DATABASE_URL));
```

### Client
```tsx
import { authClient } from "@agency/auth-portal/client";
await authClient.signIn.email({ email, password });
```

## Usage - Supabase Auth (Fallback)

### Server
```ts
import { createSupabaseAuth } from "@agency/auth-portal/auth-supabase";
const auth = createSupabaseAuth({
  url: process.env.SUPABASE_URL!,
  anonKey: process.env.SUPABASE_ANON_KEY!
});
```

### Client
```tsx
import { signInWithEmail, signUpWithEmail } from "@agency/auth-portal/client-supabase";
const { data, error } = await signInWithEmail(email, password);
```

## Provider Selection per Portal

Each client portal can independently choose its auth provider:

```ts
// In your portal app's configuration
const authProvider = process.env.AUTH_PROVIDER || "better"; // "better" | "supabase"
```

## When to Use Each Provider

| Scenario | Recommended Provider | Why |
|----------|---------------------|-----|
| Default client portals | Better Auth | Zero per-MAU cost, data ownership |
| Client wants managed auth | Supabase Auth | Less infrastructure to maintain |
| Using Supabase database | Supabase Auth | Unified backend, RLS integration |
| High-scale portal (10k+ MAU) | Better Auth | Cost savings at scale |
| Need 2FA/passkeys quickly | Better Auth | Built-in plugins |
| Enterprise SSO required | WorkOS | Neither Better Auth nor Supabase Auth |

## Environment Variables

### Better Auth (Default)
- `AUTH_PROVIDER=better` (or omit)
- `DATABASE_URL` - For Better Auth's Drizzle adapter

### Supabase Auth
- `AUTH_PROVIDER=supabase`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_KEY` (server-side)

## Escalation Path

If enterprise SSO/SCIM is needed:
1. Better Auth → WorkOS (if self-hosted control still desired)
2. Supabase Auth → WorkOS (if willing to add third vendor)
3. Either → Auth0 (if fully managed preferred despite cost)

## Migration Between Providers

To migrate a portal from one auth provider to another:
1. Export user credentials (hashed passwords won't transfer)
2. Email users to reset passwords on new system
3. Update portal's AUTH_PROVIDER env var
4. Deploy with new configuration
```
