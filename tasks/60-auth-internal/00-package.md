# 60-auth-internal/00-package: Internal Auth (Clerk)

## Purpose
Authentication configuration for internal tools. **Primary**: Clerk for fastest DX. **Fallback**: Supabase Auth when bundling with Supabase backend. Centralizes SDK imports, middleware patterns, and typed session utilities.

## Files
packages/auth/internal/
├── package.json
├── tsconfig.json
├── README.md
└── src/
    ├── index.ts
    ├── clerk.ts
    ├── middleware.ts
    └── types.ts
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
    "./clerk": "./src/clerk.ts",
    "./supabase": "./src/supabase.ts",
    "./middleware": "./src/middleware.ts",
    "./types": "./src/types.ts"
  },
  "dependencies": {
    "@agency/core-types": "workspace:*",
    "@clerk/nextjs": "7.0.8",
    "@supabase/supabase-js": "2.49.0"
  },
  "devDependencies": {
    "@agency/config-eslint": "workspace:*",
    "@agency/config-typescript": "workspace:*"
  },
  "publishConfig": { "access": "restricted" }
}
```

### `src/clerk.ts` (Primary Provider)
```ts
import { clerkClient, currentUser } from "@clerk/nextjs/server";
export { clerkClient, currentUser };
```

### `src/supabase.ts` (Fallback Provider)
```ts
import { createClient } from "@supabase/supabase-js";

export function createSupabaseAdminClient() {
  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!
  );
}

export function createSupabaseClient(supabaseAccessToken?: string) {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    supabaseAccessToken ? {
      global: {
        headers: {
          Authorization: `Bearer ${supabaseAccessToken}`
        }
      }
    } : undefined
  );
}

export async function getCurrentUser(supabaseAccessToken?: string) {
  const supabase = createSupabaseClient(supabaseAccessToken);
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) return null;
  return user;
}
```

### `src/middleware.ts`
```ts
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher(["/login", "/signup", "/api/webhook"]);

export const authMiddleware = clerkMiddleware(async (auth, req) => {
  if (!isPublicRoute(req)) {
    await auth.protect();
  }
});

export { createRouteMatcher };
```

### `src/types.ts`
```ts
import type { User } from "@clerk/nextjs/server";

export type AuthUser = User;

export interface SessionContext {
  userId: string | null;
  orgId: string | null;
  isAuthenticated: boolean;
}
```

### `src/index.ts`
```ts
export { clerkClient, currentUser } from "./clerk";
export { authMiddleware, createRouteMatcher } from "./middleware";
export type { AuthUser, SessionContext } from "./types";
```

### README
```md
# @agency/auth-internal
Authentication for internal tools with dual-provider support.

## Provider Strategy
- **Primary**: Clerk - Fastest DX, best Next.js integration
- **Fallback**: Supabase Auth - When using Supabase as database, unified backend

## Usage - Clerk (Default)
```ts
// middleware.ts
export { authMiddleware as middleware } from "@agency/auth-internal/middleware";

// app/page.tsx
import { currentUser } from "@agency/auth-internal/clerk";
const user = await currentUser();
```

## Usage - Supabase Auth (Explicit)
```ts
// middleware.ts - custom implementation using Supabase
import { createSupabaseClient } from "@agency/auth-internal/supabase";

// app/page.tsx
import { getCurrentUser } from "@agency/auth-internal/supabase";
const user = await getCurrentUser();
```

## Provider Selection
Set in environment:
- `AUTH_PROVIDER=clerk` (default) or `AUTH_PROVIDER=supabase`

## When to Use Each Provider

| Scenario | Recommended Provider | Why |
|----------|---------------------|-----|
| Default internal tools | Clerk | Faster setup, better UI components |
| Using Supabase database | Supabase Auth | Unified backend, single vendor |
| Multiple internal apps | Clerk | Consistent auth experience |
| Budget-conscious startup | Supabase Auth | Bundled with generous free tier |

## Required Env Vars

### Clerk Mode (Default)
- `AUTH_PROVIDER=clerk` (or omit)
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`

### Supabase Mode
- `AUTH_PROVIDER=supabase`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_KEY` (server-side only)

## Migration Path
If Clerk pricing becomes prohibitive or you want to unify with Supabase:
1. Export user data from Clerk
2. Import to Supabase Auth
3. Update environment variables
4. Update imports from `/clerk` to `/supabase`
```
