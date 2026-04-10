# 60-auth-internal: Setup Guide

## Prerequisites

- Next.js 16+ app (internal tool)
- Clerk account (https://clerk.com)
- Environment variable management

## Installation

### 1. Install Package

```bash
pnpm add @agency/auth-internal
```

### 2. Configure Environment Variables

```bash
# .env.local
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/
```

### 3. Add Proxy/Middleware

For Next.js 16+:
```typescript
// proxy.ts
import { clerkMiddleware } from "@clerk/nextjs";

export default clerkMiddleware();

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
```

For Next.js ≤15:
```typescript
// middleware.ts
import { clerkMiddleware } from "@clerk/nextjs";

export default clerkMiddleware();

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
```

### 4. Add Provider to Layout

```tsx
// app/layout.tsx
import { ClerkProvider } from "@clerk/nextjs";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      {children}
    </ClerkProvider>
  );
}
```

### 5. Create Auth Pages

```tsx
// app/sign-in/[[...sign-in]]/page.tsx
import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return <SignIn />;
}
```

```tsx
// app/sign-up/[[...sign-up]]/page.tsx
import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return <SignUp />;
}
```

### 6. Add User Button to Layout

```tsx
// app/dashboard/layout.tsx
import { UserButton } from "@clerk/nextjs";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <header>
        <UserButton afterSignOutUrl="/" />
      </header>
      {children}
    </div>
  );
}
```

### 7. Protect API Routes

```typescript
// app/api/protected/route.ts
import { auth } from "@clerk/nextjs/server";

export async function GET() {
  const { userId } = await auth();
  
  if (!userId) {
    return new Response("Unauthorized", { status: 401 });
  }
  
  return Response.json({ userId });
}
```

## Role-Based Access

### Define Roles in Clerk Dashboard

1. Go to Clerk Dashboard → Users & Authentication → Roles
2. Create roles: `admin`, `manager`, `viewer`
3. Assign permissions to each role

### Check Roles in Code

```typescript
import { auth } from "@clerk/nextjs/server";

export async function GET() {
  const { userId, sessionClaims } = await auth();
  
  const role = sessionClaims?.metadata?.role;
  
  if (role !== "admin") {
    return new Response("Forbidden", { status: 403 });
  }
  
  return Response.json({ message: "Admin only data" });
}
```

## Client-Side Usage

```tsx
"use client";

import { useAuth, useUser } from "@clerk/nextjs";

export function Dashboard() {
  const { isLoaded, userId } = useAuth();
  const { user } = useUser();
  
  if (!isLoaded) return <div>Loading...</div>;
  if (!userId) return <div>Sign in to view</div>;
  
  return <div>Welcome, {user?.firstName}</div>;
}
```

## Testing in Development

1. Create test users in Clerk Dashboard
2. Use test mode credentials (bypasses email verification)
3. Test different roles by assigning in dashboard

## Production Checklist

- [ ] Production Clerk keys configured
- [ ] Authorized domains set in Clerk Dashboard
- [ ] Sign-in/up URLs match environment variables
- [ ] After-sign URLs redirect to appropriate pages
- [ ] Role permissions tested
