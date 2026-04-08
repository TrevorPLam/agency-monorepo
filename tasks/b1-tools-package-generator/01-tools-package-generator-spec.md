# B1 Tools Package Generator Specification

## Files
```
tools/
└── generators/
    └── new-package.sh
```

### `tools/generators/new-package.sh`
```bash
#!/bin/bash

# ============================================
# Agency Monorepo - New Package Generator
# ============================================

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# ============================================
# Input Validation
# ============================================

if [ $# -lt 2 ]; then
    echo -e "${RED}Usage: $0 <domain> <package-name>${NC}"
    echo ""
    echo "Domains: config, core, ui, data, auth, communication, testing"
    echo "Package name: without @agency/ prefix"
    echo ""
    echo "Examples:"
    echo "  $0 core validation-utils"
    echo "  $0 ui data-table"
    echo "  $0 data analytics-client"
    exit 1
fi

DOMAIN=$1
PACKAGE_NAME=$2
FULL_NAME="@agency/${PACKAGE_NAME}"
PACKAGE_DIR="packages/${DOMAIN}/${PACKAGE_NAME}"

# ============================================
# Validate Domain
# ============================================

VALID_DOMAINS=("config" "core" "ui" "data" "auth" "communication" "testing")
if [[ ! " ${VALID_DOMAINS[@]} " =~ " ${DOMAIN} " ]]; then
    echo -e "${RED}Error: Invalid domain '${DOMAIN}'${NC}"
    echo "Valid domains: ${VALID_DOMAINS[*]}"
    exit 1
fi

# ============================================
# Check for Existing Package
# ============================================

if [ -d "$PACKAGE_DIR" ]; then
    echo -e "${RED}Error: Package directory ${PACKAGE_DIR} already exists${NC}"
    exit 1
fi

echo -e "${YELLOW}Creating package: ${FULL_NAME}${NC}"
echo "Location: ${PACKAGE_DIR}"

# ============================================
# Create Directory Structure
# ============================================

mkdir -p "${PACKAGE_DIR}/src"

# ============================================
# Create package.json
# ============================================

cat > "${PACKAGE_DIR}/package.json" << EOF
{
  "name": "${FULL_NAME}",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "exports": {
    ".": "./src/index.ts"
  },
  "dependencies": {},
  "devDependencies": {
    "@agency/config-eslint": "workspace:*",
    "@agency/config-typescript": "workspace:*"
  },
  "publishConfig": {
    "access": "restricted"
  }
}
EOF

# ============================================
# Create tsconfig.json
# ============================================

cat > "${PACKAGE_DIR}/tsconfig.json" << EOF
{
  "extends": "@agency/config-typescript/library",
  "compilerOptions": {
    "baseUrl": ".",
    "outDir": "./dist"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
EOF

# ============================================
# Create src/index.ts
# ============================================

cat > "${PACKAGE_DIR}/src/index.ts" << 'EOF'
// TODO: Export your package's public API
// export { something } from "./something";
EOF

# ============================================
# Create README.md
# ============================================

cat > "${PACKAGE_DIR}/README.md" << EOF
# ${FULL_NAME}

TODO: Describe this package's purpose.

## Purpose

TODO: What problem does this package solve?

## Consumers

TODO: Which apps/packages use this?

## Usage

\`\`\`ts
import { something } from "${FULL_NAME}";
\`\`\`

## When to Build

TODO: Under what conditions should this package be created?
See [ARCHITECTURE.md](../../ARCHITECTURE.md) for guidance.
EOF

# ============================================
# Add Domain-Specific Templates
# ============================================

case $DOMAIN in
    core)
        # Core packages should be dependency-light
        cat > "${PACKAGE_DIR}/src/index.ts" << 'EOF'
// Pure functions only - no React, no DB, no I/O
// export { utility } from "./utility";
EOF
        ;;
    ui)
        # UI packages need React dependencies
        cat > "${PACKAGE_DIR}/package.json" << EOF
{
  "name": "${FULL_NAME}",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "exports": {
    ".": "./src/index.ts"
  },
  "dependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0"
  },
  "devDependencies": {
    "@agency/config-eslint": "workspace:*",
    "@agency/config-typescript": "workspace:*",
    "@types/react": "latest"
  },
  "publishConfig": {
    "access": "restricted"
  }
}
EOF
        ;;
    data)
        # Data packages might need DB dependencies
        cat > "${PACKAGE_DIR}/package.json" << EOF
{
  "name": "${FULL_NAME}",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "exports": {
    ".": "./src/index.ts"
  },
  "dependencies": {
    "@agency/core-types": "workspace:*"
  },
  "devDependencies": {
    "@agency/config-eslint": "workspace:*",
    "@agency/config-typescript": "workspace:*"
  },
  "publishConfig": {
    "access": "restricted"
  }
}
EOF
        ;;
    auth)
        # Auth packages need specific dependencies
        cat > "${PACKAGE_DIR}/package.json" << EOF
{
  "name": "${FULL_NAME}",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "exports": {
    ".": "./src/index.ts"
  },
  "dependencies": {
    "@agency/core-types": "workspace:*"
  },
  "devDependencies": {
    "@agency/config-eslint": "workspace:*",
    "@agency/config-typescript": "workspace:*"
  },
  "publishConfig": {
    "access": "restricted"
  }
}
EOF
        ;;
esac

# ============================================
# Output Summary
# ============================================

echo ""
echo -e "${GREEN}Successfully created package: ${FULL_NAME}${NC}"
echo ""
echo "Files created:"
ls -la "${PACKAGE_DIR}"
echo ""
echo "Next steps:"
echo "  1. Define the package's purpose in README.md"
echo "  2. Update exports in package.json"
echo "  3. Implement src/index.ts"
echo "  4. Run pnpm install to link workspace"
echo "  5. Add tests"
echo ""
echo "Remember: A package exists only when two or more consumers share code."
