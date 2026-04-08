# B0 Tools App Generator Specification

## Files
```
tools/
└── generators/
    └── new-app.sh
```

### `tools/generators/new-app.sh`
```bash
#!/bin/bash

# ============================================
# Agency Monorepo - New App Generator
# ============================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# ============================================
# Input Validation
# ============================================

if [ $# -lt 2 ]; then
    echo -e "${RED}Usage: $0 <app-type> <app-name>${NC}"
    echo ""
    echo "App types:"
    echo "  client-site    - Client-facing website"
    echo "  internal-tool  - Internal agency tool"
    echo "  portal         - Client portal with auth"
    echo ""
    echo "Examples:"
    echo "  $0 client-site acme-corp"
    echo "  $0 internal-tool analytics-dashboard"
    exit 1
fi

APP_TYPE=$1
APP_NAME=$2
APP_DIR=""
APP_DISPLAY_NAME=$(echo "$APP_NAME" | sed 's/-/ /g' | sed 's/\b\w/\u&/g')

# ============================================
# Determine Target Directory
# ============================================

case $APP_TYPE in
    client-site)
        APP_DIR="apps/client-sites/${APP_NAME}"
        ;;
    internal-tool)
        APP_DIR="apps/internal-tools/${APP_NAME}"
        ;;
    portal)
        APP_DIR="apps/client-sites/${APP_NAME}-portal"
        ;;
    # 2026 Marketing-First Templates
    docs-site)
        APP_DIR="apps/docs"
        ;;
    email-preview)
        APP_DIR="apps/email-preview"
        ;;
    marketing-site)
        APP_DIR="apps/client-sites/${APP_NAME}"
        ;;
    studio)
        APP_DIR="apps/studio"
        ;;
    api)
        APP_DIR="apps/api"
        ;;
    *)
        echo -e "${RED}Error: Unknown app type '${APP_TYPE}'${NC}"
        exit 1
        ;;
esac

# ============================================
# Check for Existing Directory
# ============================================

if [ -d "$APP_DIR" ]; then
    echo -e "${RED}Error: Directory ${APP_DIR} already exists${NC}"
    exit 1
fi

echo -e "${YELLOW}Creating ${APP_TYPE}: ${APP_NAME}${NC}"
echo "Target: ${APP_DIR}"

# ============================================
# Create Directory Structure
# ============================================

mkdir -p "${APP_DIR}/src/app"
mkdir -p "${APP_DIR}/src/components"
mkdir -p "${APP_DIR}/src/lib"

# ============================================
# Create package.json
# ============================================

cat > "${APP_DIR}/package.json" << EOF
{
  "name": "@agency/${APP_NAME}",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "next": "16.2.2",
    "react": "19.2.4",
    "react-dom": "19.2.4",
    "@agency/config-tailwind": "workspace:*",
    "@agency/config-typescript": "workspace:*",
    "@agency/core-types": "workspace:*",
    "@agency/ui-theme": "workspace:*",
    "@agency/ui-design-system": "workspace:*",
    "@agency/ui-icons": "workspace:*"
  },
  "devDependencies": {
    "@agency/config-eslint": "workspace:*",
    "@types/node": "latest",
    "@types/react": "latest",
    "typescript": "6.0.0"
  }
}
EOF

# ============================================
# Create tsconfig.json
# ============================================

cat > "${APP_DIR}/tsconfig.json" << EOF
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
EOF

# ============================================
# Create tailwind.config.ts
# ============================================

cat > "${APP_DIR}/tailwind.config.ts" << 'EOF'
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "../../packages/ui/**/*.{ts,tsx}",
  ],
  theme: {},
  plugins: [],
};

export default config;
EOF

# ============================================
# Create postcss.config.mjs
# ============================================

cat > "${APP_DIR}/postcss.config.mjs" << 'EOF'
/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};

export default config;
EOF

# ============================================
# Create next.config.mjs
# ============================================

cat > "${APP_DIR}/next.config.mjs" << 'EOF'
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
};

export default nextConfig;
EOF

# ============================================
# Create src/app/globals.css
# ============================================

cat > "${APP_DIR}/src/app/globals.css" << 'EOF'
@tailwind base;
@tailwind components;
@tailwind utilities;

@import "@agency/ui-theme/theme.css";

@source "../../../packages/ui/**/*.{ts,tsx}";
EOF

# ============================================
# Create src/app/layout.tsx
# ============================================

cat > "${APP_DIR}/src/app/layout.tsx" << EOF
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "${APP_DISPLAY_NAME}",
  description: "${APP_DISPLAY_NAME} - Built with Agency Monorepo",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
EOF

# ============================================
# Create src/app/page.tsx
# ============================================

cat > "${APP_DIR}/src/app/page.tsx" << 'EOF'
import { Button } from "@agency/ui-design-system/button";
import { Card } from "@agency/ui-design-system/card";

export default function Home() {
  return (
    <main className="min-h-screen p-8">
      <h1 className="text-2xl font-bold mb-4">Welcome</h1>
      <Card>
        <p className="mb-4">Your new app is ready.</p>
        <Button>Get Started</Button>
      </Card>
    </main>
  );
}
EOF

# ============================================
# Create src/lib/cn.ts
# ============================================

cat > "${APP_DIR}/src/lib/cn.ts" << 'EOF'
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
EOF

# ============================================
# Create .env.example
# ============================================

cat > "${APP_DIR}/.env.example" << EOF
# ${APP_DISPLAY_NAME} Environment Variables

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Database (if needed)
# DATABASE_URL=

# Auth (if needed)
# NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
# CLERK_SECRET_KEY=
EOF

# ============================================
# Create .gitignore
# ============================================

cat > "${APP_DIR}/.gitignore" << 'EOF'
# Dependencies
node_modules/

# Build
.next/
out/
dist/

# Environment
.env
.env.local
.env.*.local

# Debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Misc
.DS_Store
*.pem
EOF

# ============================================
# Create README.md
# ============================================

cat > "${APP_DIR}/README.md" << EOF
# ${APP_DISPLAY_NAME}

${APP_TYPE} built with the Agency Monorepo.

## Development

\`\`\`bash
pnpm dev
\`\`\`

## Build

\`\`\`bash
pnpm build
\`\`\`

## Environment Variables

Copy \`.env.example\` to \`.env.local\` and fill in values.

## Structure

- \`src/app/\` - Next.js App Router pages
- \`src/components/\` - React components
- \`src/lib/\` - Utility functions
EOF

# ============================================
# Create eslint.config.mjs
# ============================================

cat > "${APP_DIR}/eslint.config.mjs" << 'EOF'
import config from "@agency/config-eslint/next";

export default [...config];
EOF

# ============================================
# Output Summary
# ============================================

echo ""
echo -e "${GREEN}Successfully created ${APP_TYPE}: ${APP_NAME}${NC}"
echo ""
echo "Files created:"
find "${APP_DIR}" -type f | head -20
echo ""
echo "Next steps:"
echo "  1. cd ${APP_DIR}"
echo "  2. pnpm install"
echo "  3. cp .env.example .env.local"
echo "  4. pnpm dev"
echo ""
echo "Add to root turbo.json if needed."
```


## Usage

```bash
# Make executable
chmod +x tools/generators/new-app.sh

# Create client site
./tools/generators/new-app.sh client-site acme-corp

# Create internal tool
./tools/generators/new-app.sh internal-tool project-tracker

# Create client portal
./tools/generators/new-app.sh portal client-name

# 2026 Marketing-First Templates

# Create docs site (internal documentation)
./tools/generators/new-app.sh docs-site docs

# Create email preview app
./tools/generators/new-app.sh email-preview email-preview

# Create marketing site (with full marketing stack)
./tools/generators/new-app.sh marketing-site client-brand

# Create Sanity Studio app
./tools/generators/new-app.sh studio studio

# Create API app (shared endpoints)
./tools/generators/new-app.sh api api
```

## Template Specifications (2026)

### docs-site Template

Generates `apps/docs` with:
- MDX content rendering from `tasks/`
- Full-text search capability
- Navigation from content directory
- Self-contained (no app imports)
- `src/app/env.ts` with search config

### email-preview Template

Generates `apps/email-preview` with:
- Template gallery from `@agency/email-templates`
- Responsive preview (desktop/mobile)
- Variable editor UI
- Test send functionality
- Access protection (auth required in prod)

### marketing-site Template

Generates client sites with full marketing stack:
- SEO, analytics, lead capture pre-configured
- `@agency/seo` for metadata
- `@agency/analytics` for tracking
- `@agency/lead-capture` for forms
- `src/app/env.ts` with all marketing env vars
- Performance budgets enforced

### studio Template

Generates `apps/studio` with:
- Sanity Studio embedded
- Schema imports from `@agency/data-cms`
- Brand-specific customization hooks
- Self-contained deployment

### api Template

Generates `apps/api` with:
- Shared service endpoints
- Rate limiting configured
- Auth middleware (Clerk/Better Auth)
- No frontend, API-only routes


## Implementation Checklist

- [ ] File placed at `tools/generators/new-app.sh`
- [ ] Made executable with `chmod +x`
- [ ] Tested by creating a sample app
- [ ] Documented in `docs/onboarding/new-contributor.md`
