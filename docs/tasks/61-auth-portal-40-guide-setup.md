# 61-auth-portal: Setup Guide

## Prerequisites

- Next.js 16+ app (client portal)
- `@agency/data-db` package configured with Drizzle
- Neon or Supabase database connection

## Installation

### 1. Install Package

```bash
pnpm add @agency/auth-portal
```

### 2. Configure Environment Variables

Better Auth (Default):
```bash
# .env.local
BETTER_AUTH_SECRET=openssl rand -base64 32
BETTER_AUTH_URL=https://portal.agency.com
DATABASE_URL=postgresql://...
AUTH_PROVIDER=better
```

Supabase Auth (Fallback):
```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://...supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_KEY=eyJ...
AUTH_PROVIDER=supabase
```

### 3. Generate Better Auth Schema

The command below is allowed **tool-only CLI usage**. It does not change the runtime version pins governed by `DEPENDENCY.md`.

```bash
# Generate Drizzle schema for Better Auth tables
npx auth@latest generate

# Or run Drizzle migration
pnpm --filter @agency/data-db drizzle:generate
pnpm --filter @agency/data-db drizzle:migrate
```

### 4. Create Auth API Route

```typescript
// app/api/auth/[...all]/route.ts
import { auth } from "@agency/auth-portal/auth";
import { createDbClient } from "@agency/data-db";

const db = createDbClient(process.env.DATABASE_URL);
const authHandler = auth.handler;

export { authHandler as GET, authHandler as POST };
```

### 5. Add Auth Provider

```tsx
// app/layout.tsx
import { authClient } from "@agency/auth-portal/client";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  );
}
```

### 6. Create Sign-In Page

```tsx
// app/sign-in/page.tsx
"use client";

import { authClient } from "@agency/auth-portal/client";
import { useState } from "react";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  const handleSignIn = async () => {
    await authClient.signIn.email({
      email,
      password,
      callbackURL: "/dashboard"
    });
  };
  
  return (
    <div>
      <input 
        type="email" 
        value={email} 
        onChange={(e) => setEmail(e.target.value)} 
        placeholder="Email"
      />
      <input 
        type="password" 
        value={password} 
        onChange={(e) => setPassword(e.target.value)} 
        placeholder="Password"
      />
      <button onClick={handleSignIn}>Sign In</button>
    </div>
  );
}
```

## Multi-Tenant Organization Setup

### Enable Organization Plugin

```typescript
// packages/auth/portal/src/auth.ts
import { betterAuth } from "better-auth";
import { organization } from "better-auth/plugins";

export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: "pg" }),
  plugins: [
    organization({
      // Each agency client = one organization
      allowUserToCreateOrganization: false // Only admins create orgs
    })
  ]
});
```

### Create Organization for New Client

```typescript
// When onboarding new agency client
await auth.api.createOrganization({
  name: "Client Company Name",
  slug: "client-company"
});
```

### Client-Side Organization Switch

```tsx
"use client";

import { authClient } from "@agency/auth-portal/client";

export function OrganizationSwitcher() {
  const { data: organizations } = authClient.useListOrganizations();
  
  return (
    <select onChange={(e) => authClient.setActiveOrganization(e.target.value)}>
      {organizations?.map((org) => (
        <option key={org.id} value={org.id}>{org.name}</option>
      ))}
    </select>
  );
}
```

## Session Validation

### Server-Side

```typescript
// app/api/protected/route.ts
import { auth } from "@agency/auth-portal/auth";
import { headers } from "next/headers";

export async function GET() {
  const session = await auth.api.getSession({
    headers: headers()
  });
  
  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }
  
  // Access user and organization
  const { user, organization } = session;
  
  return Response.json({ userId: user.id, orgId: organization?.id });
}
```

### Client-Side

```tsx
"use client";

import { authClient } from "@agency/auth-portal/client";

export function Dashboard() {
  const { data: session } = authClient.useSession();
  
  if (!session) return <div>Loading...</div>;
  
  return <div>Welcome, {session.user.email}</div>;
}
```

## Passkey Setup (Optional)

### Enable Passkey Plugin

```typescript
import { passkey } from "better-auth/plugins";

export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: "pg" }),
  plugins: [
    passkey()
  ]
});
```

### Register Passkey

```tsx
"use client";

import { authClient } from "@agency/auth-portal/client";

export function PasskeyButton() {
  const registerPasskey = async () => {
    await authClient.passkey.register();
  };
  
  return <button onClick={registerPasskey}>Add Passkey</button>;
}
```

## Testing

### Test User Creation

```typescript
// Seed script
await auth.api.signUpEmail({
  email: "test@example.com",
  password: "password123",
  name: "Test User"
});
```

### Organization Testing

```typescript
// Create test organization
await auth.api.createOrganization({
  name: "Test Client",
  slug: "test-client"
});
```

## Migration from Better Auth 1.5.x to 1.6.x

### Update Dependencies

```bash
pnpm up better-auth@1.6.2
pnpm add @better-auth/drizzle-adapter@1.6.2
```

### Update Import

```typescript
// Old
import { drizzleAdapter } from "better-auth/adapters/drizzle";

// New
import { drizzleAdapter } from "@better-auth/drizzle-adapter";
```

### Review Session Freshness

If you relied on `session.freshAge` extending with activity, update your config:

```typescript
// To disable freshness checking
{
  session: { freshAge: 0 }
}
```

### Enable Experimental Joins (Optional)

```typescript
{
  experimental: { joins: true }
}
```

## Production Checklist

- [ ] `BETTER_AUTH_SECRET` is cryptographically random (32+ bytes)
- [ ] `BETTER_AUTH_URL` matches production domain
- [ ] Database migrations applied
- [ ] Session table has proper indexes
- [ ] Organization plugin configured for multi-tenancy
- [ ] Rate limiting configured for auth endpoints
- [ ] Passkey plugin enabled if required by client contract
