# e1-apps-crm: Implementation Specification

## Task Header

| Field | Value |
|-------|-------|
| **State** | `conditional` — Package-controlled, opt-in only |
| **Trigger** | Agency requires internal CRM system |
| **Minimum Consumers** | 1 (internal tool) |
| **Dependencies** | Next.js 16.2.3, React 19.2.5, `@agency/data-db`, `@agency/auth-internal` |
| **Exit Criteria** | CRM app deployed and used by agency team |
| **Implementation Authority** | `REPO-STATE.md` — Conditional; requires explicit business need |
| **Version Authority** | `DEPENDENCY.md` §2, §5 — Next.js 16.2.3, Clerk 7.0.12 |
| **Superseded by** | n/a |

**Cross-references:**
- Decision status: `DECISION-STATUS.md` — CRM app `open`
- Version pins: `DEPENDENCY.md` §2, §5
- Architecture: `ARCHITECTURE.md` — Apps layer
- Tenant isolation: `docs/standards/tenant-isolation-data-governance.md` if CRM touches client-owned data
- Dependency-truth policy: `docs/standards/dependency-truth.md`
- Note: Conditional; depends on agency operational needs

## Files

```
apps/internal-tools/crm/
├── package.json
├── next.config.mjs
├── tsconfig.json
├── tailwind.config.ts
├── postcss.config.mjs
├── middleware.ts
├── .env.example
├── .env.local
├── README.md
└── src/
    ├── app/
    │   ├── layout.tsx
    │   ├── page.tsx
    │   ├── clients/
    │   │   └── page.tsx
    │   ├── projects/
    │   │   └── page.tsx
    │   ├── invoices/
    │   │   └── page.tsx
    │   └── api/
    │       └── webhooks/
    │           └── clerk.ts
    ├── components/
    │   ├── dashboard-shell.tsx
    │   ├── navigation.tsx
    │   ├── client-table.tsx
    │   └── project-board.tsx
    ├── lib/
    │   ├── db.ts
    │   ├── auth.ts
    │   └── utils.ts
    └── types/
        └── index.ts
```

### `package.json`
```json
{
  "name": "@agency/crm",
  "version": "0.1.0",
  "private": true,
  "description": "Customer Relationship Management - Internal tool",
  "scripts": {
    "dev": "next dev --port 3001",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "typecheck": "tsc --noEmit",
    "clean": "rm -rf .next"
  },
  "dependencies": {
    "next": "16.2.3",
    "react": "19.2.5",
    "react-dom": "19.2.5",
    "@agency/config-tailwind": "workspace:*",
    "@agency/config-typescript": "workspace:*",
    "@agency/core-types": "workspace:*",
    "@agency/core-utils": "workspace:*",
    "@agency/core-constants": "workspace:*",
    "@agency/core-hooks": "workspace:*",
    "@agency/ui-theme": "workspace:*",
    "@agency/ui-icons": "workspace:*",
    "@agency/ui-design-system": "workspace:*",
    "@agency/data-db": "workspace:*",
    "@agency/auth-internal": "workspace:*",
    "@clerk/nextjs": "7.0.12"
  },
  "devDependencies": {
    "@agency/config-eslint": "workspace:*",
    "@agency/config-prettier": "workspace:*",
    "@types/node": "25.5.2",
    "@types/react": "19.2.14",
    "@types/react-dom": "19.2.3",
    "typescript": "6.0.0"
  },
  "prettier": "@agency/config-prettier"
}
```

### `next.config.mjs`
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: [
    "@agency/ui-design-system",
    "@agency/ui-icons",
    "@agency/ui-theme",
    "@agency/core-utils",
    "@agency/core-types",
    "@agency/data-db",
    "@agency/auth-internal",
  ],
  experimental: {
    typedRoutes: true,
  },
  async redirects() {
    return [
      {
        source: "/",
        destination: "/clients",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
```

### `middleware.ts`
```typescript
import { authMiddleware } from "@agency/auth-internal/middleware";

export default authMiddleware({
  publicRoutes: ["/api/webhooks/clerk"],
  ignoredRoutes: ["/api/webhooks/(.*)"],
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
```

### `tsconfig.json`
```json
{
  "extends": "@agency/config-typescript/nextjs",
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

### `tailwind.config.ts`
```typescript
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "../../packages/ui/design-system/src/**/*.{js,ts,jsx,tsx,mdx}",
    "../../packages/ui/icons/src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  presets: [],
};

export default config;
```

### `.env.example`
```bash
# Database
DATABASE_URL="postgresql://user:pass@localhost:5432/agency_crm"

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/clients
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/clients

# App
NEXT_PUBLIC_APP_URL="http://localhost:3001"
```

### `src/app/layout.tsx`
```typescript
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@agency/auth-internal/clerk";
import { DashboardShell } from "@/components/dashboard-shell";
import "@agency/ui-theme/theme.css";
import "@agency/ui-design-system/styles.css";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Agency CRM",
  description: "Customer Relationship Management",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={inter.className}>
          <DashboardShell>{children}</DashboardShell>
        </body>
      </html>
    </ClerkProvider>
  );
}
```

### `src/app/page.tsx`
```typescript
import { redirect } from "next/navigation";

export default function HomePage() {
  redirect("/clients");
}
```

### `src/app/clients/page.tsx`
```typescript
import { auth } from "@agency/auth-internal";
import { clientQueries } from "@agency/data-db/queries";
import { ClientTable } from "@/components/client-table";
import { Button } from "@agency/ui-design-system/button";

export default async function ClientsPage() {
  const { userId } = await auth();
  
  if (!userId) {
    throw new Error("Unauthorized");
  }
  
  const clients = await clientQueries.getAll();
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Clients</h1>
        <Button>Add Client</Button>
      </div>
      <ClientTable clients={clients} />
    </div>
  );
}
```

### `src/components/dashboard-shell.tsx`
```typescript
"use client";

import { useState } from "react";
import { UserButton } from "@agency/auth-internal/clerk";
import { Navigation } from "./navigation";

interface DashboardShellProps {
  children: React.ReactNode;
}

export function DashboardShell({ children }: DashboardShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? "w-64" : "w-16"
        } transition-all duration-300 border-r bg-card`}
      >
        <div className="p-4">
          <h2 className={`font-bold ${sidebarOpen ? "block" : "hidden"}`}>
            Agency CRM
          </h2>
        </div>
        <Navigation collapsed={!sidebarOpen} />
      </aside>
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 border-b bg-card flex items-center justify-between px-6">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-accent rounded-md"
          >
            {/* Toggle icon */}
            <span className="sr-only">Toggle sidebar</span>
          </button>
          <UserButton afterSignOutUrl="/sign-in" />
        </header>
        
        {/* Content */}
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
```

### `src/lib/db.ts`
```typescript
import { createDbClient } from "@agency/data-db";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is required");
}

export const db = createDbClient(process.env.DATABASE_URL);
```


## Feature Requirements

### Phase 1: Basic CRUD
- [ ] Client list with pagination
- [ ] Add new client form
- [ ] Edit client details
- [ ] Client detail page

### Phase 2: Projects
- [ ] Projects linked to clients
- [ ] Project status tracking
- [ ] Project board view (kanban)

### Phase 3: Invoices
- [ ] Create invoices for clients
- [ ] Invoice status (draft, sent, paid)
- [ ] Invoice PDF generation

### Phase 4: Reporting
- [ ] Revenue dashboard
- [ ] Client activity timeline
- [ ] Export to CSV


## Testing Checklist

- [ ] Authentication works (Clerk)
- [ ] Database queries work
- [ ] UI components render correctly
- [ ] Forms validate input
- [ ] Navigation works between pages
- [ ] Responsive on mobile
- [ ] Dark mode support (if implemented)


## Deployment

1. Create Vercel project linked to this app
2. Set environment variables in Vercel dashboard
3. Connect to Neon database
4. Run migrations before first deploy
5. Deploy and verify
