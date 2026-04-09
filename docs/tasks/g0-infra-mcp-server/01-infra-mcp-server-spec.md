# g0-infra-mcp-server: Implementation Specification

## Task Header

| Field | Value |
|-------|-------|
| **State** | `conditional` — Package-controlled, opt-in only |
| **Trigger** | Team requires AI context server for monorepo operations |
| **Minimum Consumers** | 1 (internal tooling) |
| **Dependencies** | Node.js 20.9.0, TypeScript 6.0, MCP SDK |
| **Exit Criteria** | MCP server deployed and serving context |
| **Implementation Authority** | `REPO-STATE.md` — Conditional; requires explicit tooling need |
| **Version Authority** | `DEPENDENCY.md` §1 — Node.js 20.9.0, TypeScript 6.0 |
| **Superseded by** | n/a |

**Cross-references:**
- Decision status: `DECISION-STATUS.md` — MCP server `open`
- Version pins: `DEPENDENCY.md` §1
- Note: Conditional; advanced tooling for AI-assisted development

## Files

```
tools/mcp-server/
├── package.json
├── tsconfig.json
├── README.md
├── src/
│   ├── index.ts               # MCP server initialization
│   ├── server.ts              # Server implementation
│   ├── tools/
│   │   ├── repository.ts      # Repo structure exploration
│   │   ├── packages.ts        # Package documentation
│   │   ├── dependencies.ts    # Dependency analysis
│   │   ├── agents-rules.ts    # AGENTS.md access
│   │   └── refactor.ts        # Automated refactoring
│   └── types.ts               # TypeScript types
├── bin/
│   └── mcp-server.ts          # CLI entry point
└── config/
    └── cursor.json            # Cursor IDE integration
```

### `package.json`

```json
{
  "name": "@agency/tools-mcp-server",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "bin": {
    "agency-mcp": "./bin/mcp-server.ts"
  },
  "exports": {
    ".": "./src/index.ts",
    "./server": "./src/server.ts",
    "./tools": "./src/tools/index.ts"
  },
  "dependencies": {
    "@modelcontextprotocol/sdk": "^1.0.0",
    "@agency/core-types": "workspace:*",
    "@agency/core-utils": "workspace:*",
    "fast-glob": "^3.3.0",
    "zod": "^3.23.0"
  },
  "devDependencies": {
    "@agency/config-eslint": "workspace:*",
    "@agency/config-typescript": "workspace:*",
    "@types/node": "^20.0.0"
  },
  "scripts": {
    "start": "tsx bin/mcp-server.ts",
    "dev": "tsx watch bin/mcp-server.ts"
  },
  "publishConfig": { "access": "restricted" }
}
```

### `src/index.ts`

```typescript
// MCP Server initialization and exports

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { registerRepositoryTools } from './tools/repository.js';
import { registerPackageTools } from './tools/packages.js';
import { registerDependencyTools } from './tools/dependencies.js';
import { registerAgentsRulesTools } from './tools/agents-rules.js';
import { registerRefactorTools } from './tools/refactor.js';

export interface ServerConfig {
  name: string;
  version: string;
  repositoryRoot: string;
}

export async function createMcpServer(config: ServerConfig): Promise<McpServer> {
  const server = new McpServer({
    name: config.name,
    version: config.version,
  });

  // Register all tool categories
  registerRepositoryTools(server, config.repositoryRoot);
  registerPackageTools(server, config.repositoryRoot);
  registerDependencyTools(server, config.repositoryRoot);
  registerAgentsRulesTools(server, config.repositoryRoot);
  registerRefactorTools(server, config.repositoryRoot);

  return server;
}

export async function startServer(config: ServerConfig): Promise<void> {
  const server = await createMcpServer(config);
  const transport = new StdioServerTransport();
  
  console.error(`MCP Server '${config.name}' v${config.version} starting...`);
  console.error(`Repository root: ${config.repositoryRoot}`);
  
  await server.connect(transport);
  
  console.error('MCP Server connected and ready');
}

// Export tool modules for direct use
export * from './tools/repository.js';
export * from './tools/packages.js';
export * from './tools/dependencies.js';
export * from './tools/agents-rules.js';
export * from './tools/refactor.js';
```

### `src/server.ts`

```typescript
// Production MCP server runner

import { startServer } from './index.js';

const config = {
  name: 'agency-monorepo',
  version: '0.1.0',
  repositoryRoot: process.cwd(),
};

startServer(config).catch((error) => {
  console.error('Failed to start MCP server:', error);
  process.exit(1);
});
```

### `src/tools/repository.ts`

```typescript
// Repository structure exploration tools

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { execSync } from 'child_process';
import fs from 'fs/promises';
import path from 'path';
import glob from 'fast-glob';

export function registerRepositoryTools(server: McpServer, repoRoot: string): void {
  // Tool: Get repository structure
  server.tool(
    'get_repository_structure',
    'Get high-level monorepo structure: apps, packages, tools directories',
    {},
    async () => {
      const structure = await analyzeRepositoryStructure(repoRoot);
      return {
        content: [{
          type: 'text',
          text: JSON.stringify(structure, null, 2),
        }],
      };
    }
  );

  // Tool: List packages in a directory
  server.tool(
    'list_packages',
    'List all packages in a specific directory (apps, packages, tools)',
    {
      directory: z.enum(['apps', 'packages', 'tools']).describe('Directory to list'),
    },
    async ({ directory }) => {
      const packages = await listPackages(repoRoot, directory);
      return {
        content: [{
          type: 'text',
          text: JSON.stringify(packages, null, 2),
        }],
      };
    }
  );

  // Tool: Get file tree
  server.tool(
    'get_file_tree',
    'Get file tree for a specific package or path',
    {
      packagePath: z.string().describe('Relative path (e.g., "packages/ui/design-system")'),
      depth: z.number().optional().default(3).describe('Maximum depth to traverse'),
    },
    async ({ packagePath, depth }) => {
      const tree = await getFileTree(repoRoot, packagePath, depth);
      return {
        content: [{
          type: 'text',
          text: JSON.stringify(tree, null, 2),
        }],
      };
    }
  );

  // Tool: Search files
  server.tool(
    'search_files',
    'Search for files matching a glob pattern',
    {
      pattern: z.string().describe('Glob pattern (e.g., "**/*.spec.ts")'),
      directory: z.string().optional().describe('Starting directory'),
    },
    async ({ pattern, directory }) => {
      const searchPath = directory ? path.join(repoRoot, directory) : repoRoot;
      const files = await glob(pattern, { cwd: searchPath, onlyFiles: true });
      return {
        content: [{
          type: 'text',
          text: JSON.stringify(files, null, 2),
        }],
      };
    }
  );

  // Tool: Read file
  server.tool(
    'read_file',
    'Read contents of a specific file',
    {
      filePath: z.string().describe('Relative file path'),
    },
    async ({ filePath }) => {
      const fullPath = path.join(repoRoot, filePath);
      const content = await fs.readFile(fullPath, 'utf-8');
      return {
        content: [{
          type: 'text',
          text: content,
        }],
      };
    }
  );

  // Tool: Get git status
  server.tool(
    'get_git_status',
    'Get current git status and recent commits',
    {},
    async () => {
      const status = execSync('git status --porcelain', { cwd: repoRoot, encoding: 'utf-8' });
      const recentCommits = execSync('git log --oneline -10', { cwd: repoRoot, encoding: 'utf-8' });
      
      return {
        content: [{
          type: 'text',
          text: `Git Status:\n${status || 'Clean'}\n\nRecent Commits:\n${recentCommits}`,
        }],
      };
    }
  );
}

// Helper functions
async function analyzeRepositoryStructure(repoRoot: string) {
  const structure = {
    apps: [] as string[],
    packages: [] as string[],
    tools: [] as string[],
    docs: [] as string[],
  };

  // Check for standard directories
  const dirs = ['apps', 'packages', 'tools', 'docs'];
  for (const dir of dirs) {
    const dirPath = path.join(repoRoot, dir);
    try {
      const stat = await fs.stat(dirPath);
      if (stat.isDirectory()) {
        const entries = await fs.readdir(dirPath, { withFileTypes: true });
        structure[dir as keyof typeof structure] = entries
          .filter(e => e.isDirectory())
          .map(e => e.name);
      }
    } catch {
      // Directory doesn't exist
    }
  }

  return structure;
}

async function listPackages(repoRoot: string, directory: string) {
  const dirPath = path.join(repoRoot, directory);
  const packages: Array<{
    name: string;
    packageName?: string;
    description?: string;
    version?: string;
  }> = [];

  try {
    const entries = await fs.readdir(dirPath, { withFileTypes: true });
    
    for (const entry of entries) {
      if (!entry.isDirectory()) continue;

      const packageJsonPath = path.join(dirPath, entry.name, 'package.json');
      try {
        const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf-8'));
        packages.push({
          name: entry.name,
          packageName: packageJson.name,
          description: packageJson.description,
          version: packageJson.version,
        });
      } catch {
        packages.push({ name: entry.name });
      }
    }
  } catch {
    // Directory doesn't exist
  }

  return packages;
}

async function getFileTree(repoRoot: string, packagePath: string, maxDepth: number) {
  const fullPath = path.join(repoRoot, packagePath);
  
  async function buildTree(dir: string, depth: number): Promise<any> {
    if (depth > maxDepth) return { truncated: true };

    const entries = await fs.readdir(dir, { withFileTypes: true });
    const tree: Record<string, any> = {};

    for (const entry of entries) {
      if (entry.name.startsWith('.') || entry.name === 'node_modules') continue;

      if (entry.isDirectory()) {
        tree[entry.name] = await buildTree(path.join(dir, entry.name), depth + 1);
      } else {
        tree[entry.name] = 'file';
      }
    }

    return tree;
  }

  return buildTree(fullPath, 0);
}
```

### `src/tools/packages.ts`

```typescript
// Package documentation and API tools

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import fs from 'fs/promises';
import path from 'path';

export function registerPackageTools(server: McpServer, repoRoot: string): void {
  // Tool: Get package details
  server.tool(
    'get_package_details',
    'Get detailed information about a specific package',
    {
      packageName: z.string().describe('Package directory name (e.g., "ui-design-system")'),
      directory: z.enum(['apps', 'packages', 'tools']).default('packages'),
    },
    async ({ packageName, directory }) => {
      const details = await getPackageDetails(repoRoot, directory, packageName);
      return {
        content: [{
          type: 'text',
          text: JSON.stringify(details, null, 2),
        }],
      };
    }
  );

  // Tool: Get package exports
  server.tool(
    'get_package_exports',
    'Get public API exports from a package',
    {
      packageName: z.string().describe('Package name or path'),
      directory: z.enum(['apps', 'packages', 'tools']).default('packages'),
    },
    async ({ packageName, directory }) => {
      const exports = await getPackageExports(repoRoot, directory, packageName);
      return {
        content: [{
          type: 'text',
          text: JSON.stringify(exports, null, 2),
        }],
      };
    }
  );

  // Tool: Read package README
  server.tool(
    'read_package_readme',
    'Read the README.md for a specific package',
    {
      packageName: z.string().describe('Package directory name'),
      directory: z.enum(['apps', 'packages', 'tools']).default('packages'),
    },
    async ({ packageName, directory }) => {
      const readmePath = path.join(repoRoot, directory, packageName, 'README.md');
      try {
        const content = await fs.readFile(readmePath, 'utf-8');
        return {
          content: [{
            type: 'text',
            text: content,
          }],
        };
      } catch {
        return {
          content: [{
            type: 'text',
            text: `README.md not found for ${directory}/${packageName}`,
          }],
          isError: true,
        };
      }
    }
  );

  // Tool: Find package by export
  server.tool(
    'find_package_by_export',
    'Find which package provides a specific export',
    {
      exportPath: z.string().describe('Export path to search for (e.g., "@agency/ui-design-system/button")'),
    },
    async ({ exportPath }) => {
      const packageName = exportPath.split('/')[0].replace('@agency/', '');
      const subPath = exportPath.split('/').slice(1).join('/');
      
      // Search for package
      const found = await findPackageByName(repoRoot, packageName);
      
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            packageName,
            subPath,
            found: !!found,
            location: found,
          }, null, 2),
        }],
      };
    }
  );

  // Tool: List package dependencies
  server.tool(
    'get_package_dependencies',
    'Get dependencies and devDependencies of a package',
    {
      packageName: z.string().describe('Package directory name'),
      directory: z.enum(['apps', 'packages', 'tools']).default('packages'),
    },
    async ({ packageName, directory }) => {
      const deps = await getPackageDependencies(repoRoot, directory, packageName);
      return {
        content: [{
          type: 'text',
          text: JSON.stringify(deps, null, 2),
        }),
      };
    }
  );
}

// Helper functions
async function getPackageDetails(repoRoot: string, directory: string, packageName: string) {
  const packagePath = path.join(repoRoot, directory, packageName);
  const packageJsonPath = path.join(packagePath, 'package.json');
  
  try {
    const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf-8'));
    
    // Count source files
    const srcPath = path.join(packagePath, 'src');
    let fileCount = 0;
    try {
      const srcFiles = await fs.readdir(srcPath, { recursive: true });
      fileCount = srcFiles.filter((f: any) => f.name?.endsWith('.ts') || f.name?.endsWith('.tsx')).length;
    } catch {
      // No src directory
    }

    return {
      name: packageJson.name,
      version: packageJson.version,
      description: packageJson.description,
      type: packageJson.type,
      exports: packageJson.exports,
      dependencies: Object.keys(packageJson.dependencies || {}),
      devDependencies: Object.keys(packageJson.devDependencies || {}),
      fileCount,
      hasReadme: await fileExists(path.join(packagePath, 'README.md')),
      hasTests: await fileExists(path.join(packagePath, 'test')) || 
                await fileExists(path.join(packagePath, '__tests__')),
    };
  } catch (error) {
    return { error: `Failed to read package: ${error}` };
  }
}

async function getPackageExports(repoRoot: string, directory: string, packageName: string) {
  const packagePath = path.join(repoRoot, directory, packageName);
  const packageJsonPath = path.join(packagePath, 'package.json');
  
  try {
    const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf-8'));
    return {
      exports: packageJson.exports || { '.': packageJson.main || './src/index.ts' },
      types: packageJson.types,
      main: packageJson.main,
      module: packageJson.module,
    };
  } catch {
    return { exports: {} };
  }
}

async function findPackageByName(repoRoot: string, packageName: string) {
  const directories = ['packages', 'apps', 'tools'];
  
  for (const dir of directories) {
    const dirPath = path.join(repoRoot, dir);
    try {
      const entries = await fs.readdir(dirPath, { withFileTypes: true });
      for (const entry of entries) {
        if (!entry.isDirectory()) continue;
        
        const packageJsonPath = path.join(dirPath, entry.name, 'package.json');
        try {
          const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf-8'));
          if (packageJson.name === `@agency/${packageName}` || entry.name === packageName) {
            return `${dir}/${entry.name}`;
          }
        } catch {
          continue;
        }
      }
    } catch {
      continue;
    }
  }
  
  return null;
}

async function getPackageDependencies(repoRoot: string, directory: string, packageName: string) {
  const packageJsonPath = path.join(repoRoot, directory, packageName, 'package.json');
  
  try {
    const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf-8'));
    
    const workspaceDeps = Object.keys(packageJson.dependencies || {})
      .filter(dep => dep.startsWith('@agency/'));
    const externalDeps = Object.keys(packageJson.dependencies || {})
      .filter(dep => !dep.startsWith('@agency/'));
    
    return {
      workspaceDependencies: workspaceDeps,
      externalDependencies: externalDeps,
      devDependencies: Object.keys(packageJson.devDependencies || {}),
      peerDependencies: Object.keys(packageJson.peerDependencies || {}),
    };
  } catch {
    return { error: 'Failed to read package.json' };
  }
}

async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}
```

### `src/tools/agents-rules.ts`

```typescript
// AGENTS.md rules and constraints access

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import fs from 'fs/promises';
import path from 'path';

export function registerAgentsRulesTools(server: McpServer, repoRoot: string): void {
  // Tool: Get AI Agent Rules
  server.tool(
    'get_agents_rules',
    'Get the complete AGENTS.md rules for the monorepo',
    {},
    async () => {
      const agentsPath = path.join(repoRoot, 'docs', 'AGENTS.md');
      try {
        const content = await fs.readFile(agentsPath, 'utf-8');
        return {
          content: [{
            type: 'text',
            text: content,
          }],
        };
      } catch {
        return {
          content: [{
            type: 'text',
            text: 'AGENTS.md not found. Create at docs/AGENTS.md',
          }],
          isError: true,
        };
      }
    }
  );

  // Tool: Get package-specific rules
  server.tool(
    'get_package_rules',
    'Get specific rules for working with a package',
    {
      packageName: z.string().describe('Package name (e.g., "core-utils")'),
    },
    async ({ packageName }) => {
      const rules = await extractPackageRules(repoRoot, packageName);
      return {
        content: [{
          type: 'text',
          text: JSON.stringify(rules, null, 2),
        }],
      };
    }
  );

  // Tool: Validate change against rules
  server.tool(
    'validate_change',
    'Validate a proposed change against AGENTS.md rules',
    {
      packageName: z.string().describe('Package being modified'),
      changeType: z.enum(['add', 'remove', 'modify']).describe('Type of change'),
      importPath: z.string().optional().describe('New import path (if adding import)'),
      exportName: z.string().optional().describe('Export name (if modifying API)'),
    },
    async ({ packageName, changeType, importPath, exportName }) => {
      const validation = await validateChange(repoRoot, {
        packageName,
        changeType,
        importPath,
        exportName,
      });
      
      return {
        content: [{
          type: 'text',
          text: JSON.stringify(validation, null, 2),
        }],
      };
    }
  );
}

// Helper functions
async function extractPackageRules(repoRoot: string, packageName: string) {
  const agentsPath = path.join(repoRoot, 'docs', 'AGENTS.md');
  
  try {
    const content = await fs.readFile(agentsPath, 'utf-8');
    
    // Parse rules related to this package
    const rules: string[] = [];
    const lines = content.split('\n');
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Check if line mentions this package
      if (line.toLowerCase().includes(packageName.toLowerCase())) {
        // Get context (heading + rule)
        const contextStart = Math.max(0, i - 3);
        const context = lines.slice(contextStart, i + 1).join('\n');
        rules.push(context);
      }
    }

    // Get general rules that apply to all packages
    const generalRules = extractGeneralRules(content);

    return {
      packageSpecificRules: rules,
      generalRules,
      architectureRules: extractArchitectureRules(content),
    };
  } catch {
    return { error: 'Failed to read AGENTS.md' };
  }
}

function extractGeneralRules(content: string): string[] {
  const rules: string[] = [];
  
  // Extract rules from common sections
  const rulePatterns = [
    /## Change Rules[\s\S]*?(?=##|$)/,
    /## Import Rules[\s\S]*?(?=##|$)/,
    /## Reading Requirements[\s\S]*?(?=##|$)/,
  ];
  
  for (const pattern of rulePatterns) {
    const match = content.match(pattern);
    if (match) {
      rules.push(match[0].slice(0, 2000)); // Limit length
    }
  }
  
  return rules;
}

function extractArchitectureRules(content: string): string[] {
  const rules: string[] = [];
  
  // Extract dependency flow rules
  const flowMatch = content.match(/dependency flow[\s\S]*?\./i);
  if (flowMatch) rules.push(flowMatch[0]);
  
  // Extract boundary enforcement
  const boundaryMatch = content.match(/No package may ever import[\s\S]*?\./i);
  if (boundaryMatch) rules.push(boundaryMatch[0]);
  
  return rules;
}

async function validateChange(
  repoRoot: string,
  params: {
    packageName: string;
    changeType: string;
    importPath?: string;
    exportName?: string;
  }
): Promise<{ valid: boolean; violations: string[] }> {
  const violations: string[] = [];
  
  // Rule: Check import path if provided
  if (params.importPath) {
    // Check for forbidden patterns
    if (params.importPath.includes('../apps/')) {
      violations.push('Packages cannot import from apps');
    }
    if (params.importPath.includes('src/') && !params.importPath.includes('/src/')) {
      violations.push('Import should use public exports, not internal src paths');
    }
  }
  
  // Rule: Check package naming for changeset requirements
  if (params.changeType !== 'modify' && params.exportName) {
    violations.push('Adding/removing exports requires changeset entry');
  }
  
  // Get package info
  const packageDetails = await getPackageDomain(repoRoot, params.packageName);
  
  // Rule: Check if package is high-risk
  const highRiskPackages = ['config', 'database', 'auth', 'ui-design-system'];
  if (highRiskPackages.some(rp => params.packageName.includes(rp))) {
    violations.push(`Package ${params.packageName} is high-risk - requires extra review`);
  }
  
  return {
    valid: violations.length === 0,
    violations,
  };
}

async function getPackageDomain(repoRoot: string, packageName: string): Promise<string | null> {
  // Find package and determine its domain
  const packagesDir = path.join(repoRoot, 'packages');
  
  try {
    const domains = await fs.readdir(packagesDir, { withFileTypes: true });
    for (const domain of domains) {
      if (!domain.isDirectory()) continue;
      
      const domainPath = path.join(packagesDir, domain.name);
      const packages = await fs.readdir(domainPath, { withFileTypes: true });
      
      if (packages.some(p => p.name === packageName)) {
        return domain.name;
      }
    }
  } catch {
    return null;
  }
  
  return null;
}
```

### `src/tools/refactor.ts`

```typescript
// Automated refactoring and migration tools

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import fs from 'fs/promises';
import path from 'path';
import glob from 'fast-glob';

export function registerRefactorTools(server: McpServer, repoRoot: string): void {
  // Tool: Find usages of an export
  server.tool(
    'find_usages',
    'Find all usages of a specific export across the monorepo',
    {
      exportName: z.string().describe('Export name to search for'),
      packageName: z.string().describe('Package that exports this (e.g., "@agency/core-utils")'),
    },
    async ({ exportName, packageName }) => {
      const usages = await findExportUsages(repoRoot, packageName, exportName);
      return {
        content: [{
          type: 'text',
          text: JSON.stringify(usages, null, 2),
        }],
      };
    }
  );

  // Tool: Analyze import patterns
  server.tool(
    'analyze_imports',
    'Analyze import patterns for a package to identify violations',
    {
      packageName: z.string().describe('Package to analyze'),
    },
    async ({ packageName }) => {
      const analysis = await analyzePackageImports(repoRoot, packageName);
      return {
        content: [{
          type: 'text',
          text: JSON.stringify(analysis, null, 2),
        }],
      };
    }
  );

  // Tool: Generate migration plan
  server.tool(
    'generate_migration_plan',
    'Generate a migration plan for API changes',
    {
      packageName: z.string().describe('Package with breaking changes'),
      oldExport: z.string().describe('Old export name being removed'),
      newExport: z.string().optional().describe('New export name (if renaming)'),
    },
    async ({ packageName, oldExport, newExport }) => {
      const plan = await generateMigrationPlan(repoRoot, packageName, oldExport, newExport);
      return {
        content: [{
          type: 'text',
          text: JSON.stringify(plan, null, 2),
        }],
      };
    }
  );
}

// Helper functions
async function findExportUsages(repoRoot: string, packageName: string, exportName: string) {
  const usages: Array<{
    file: string;
    line: number;
    column: number;
    importType: 'named' | 'namespace' | 'default';
    context: string;
  }> = [];

  // Search for imports
  const importPatterns = [
    `from ['"]${packageName}['"]`,
    `from ['"]${packageName}/`,
  ];

  // Search TypeScript files
  const files = await glob('**/*.{ts,tsx}', { 
    cwd: repoRoot, 
    ignore: ['**/node_modules/**', '**/.next/**', '**/dist/**'],
  });

  for (const file of files) {
    const filePath = path.join(repoRoot, file);
    const content = await fs.readFile(filePath, 'utf-8');
    const lines = content.split('\n');

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Check for import statements
      const importMatch = line.match(new RegExp(`from ['"](${packageName}[^'"]*)['"]`));
      if (importMatch) {
        // Check if this line or nearby lines contain the export name
        const context = lines.slice(Math.max(0, i - 2), Math.min(lines.length, i + 3)).join('\n');
        
        if (context.includes(exportName)) {
          usages.push({
            file,
            line: i + 1,
            column: line.indexOf(exportName) + 1,
            importType: line.includes(`{ ${exportName} }`) ? 'named' : 
                       line.includes(`* as`) ? 'namespace' : 'default',
            context: line.trim(),
          });
        }
      }
    }
  }

  return {
    exportName,
    packageName,
    totalUsages: usages.length,
    usages: usages.slice(0, 50), // Limit results
  };
}

async function analyzePackageImports(repoRoot: string, packageName: string) {
  const violations: string[] = [];
  const imports: Array<{ source: string; target: string; line: string }> = [];

  // Find the package
  const packagePath = await findPackagePath(repoRoot, packageName);
  if (!packagePath) {
    return { error: 'Package not found' };
  }

  // Read all source files
  const srcPath = path.join(packagePath, 'src');
  const files = await glob('**/*.{ts,tsx}', { cwd: srcPath });

  for (const file of files) {
    const content = await fs.readFile(path.join(srcPath, file), 'utf-8');
    const lines = content.split('\n');

    for (const line of lines) {
      // Check for workspace imports
      const importMatch = line.match(/from ['"]@agency\/([^'"]+)['"]/);
      if (importMatch) {
        const importedPackage = importMatch[1];
        imports.push({
          source: packageName,
          target: importedPackage,
          line: line.trim(),
        });

        // Check for violations
        const sourceDomain = getPackageDomain(packageName);
        const targetDomain = getPackageDomain(importedPackage);

        if (sourceDomain && targetDomain) {
          const isValid = isValidDependencyFlow(sourceDomain, targetDomain);
          if (!isValid) {
            violations.push(`Invalid import: ${packageName} (${sourceDomain}) cannot import from ${importedPackage} (${targetDomain})`);
          }
        }
      }

      // Check for src imports
      if (line.includes('../') && line.includes('/src/')) {
        violations.push(`Internal src import detected: ${line.trim()}`);
      }
    }
  }

  return {
    packageName,
    totalImports: imports.length,
    violations,
    imports: imports.slice(0, 20),
  };
}

async function generateMigrationPlan(
  repoRoot: string,
  packageName: string,
  oldExport: string,
  newExport?: string
): Promise<{
  summary: string;
  steps: string[];
  affectedFiles: string[];
  estimatedEffort: string;
}> {
  const usages = await findExportUsages(repoRoot, `@agency/${packageName}`, oldExport);
  
  const steps: string[] = [];
  
  if (newExport) {
    // Renaming scenario
    steps.push(`1. Add new export '${newExport}' alongside '${oldExport}' in ${packageName}`);
    steps.push(`2. Mark '${oldExport}' as @deprecated with migration note`);
    steps.push(`3. Update ${usages.totalUsages} usages to use '${newExport}'`);
    steps.push(`4. Create changeset with 'major' classification`);
    steps.push(`5. Wait one release cycle`);
    steps.push(`6. Remove '${oldExport}' in next major version`);
  } else {
    // Removal scenario
    steps.push(`1. Search for all usages of '${oldExport}' (${usages.totalUsages} found)`);
    steps.push(`2. Determine if usages can be replaced or if code needs refactoring`);
    steps.push(`3. Notify all CODEOWNERS of affected packages`);
    steps.push(`4. Create migration guide in CHANGELOG.md`);
    steps.push(`5. Update or remove usages in each consuming package`);
    steps.push(`6. Create changeset with 'major' classification`);
    steps.push(`7. Merge only after all usages updated`);
  }

  const affectedFiles = usages.usages.map(u => u.file);

  return {
    summary: newExport 
      ? `Renaming '${oldExport}' to '${newExport}' in @agency/${packageName}`
      : `Removing '${oldExport}' from @agency/${packageName}`,
    steps,
    affectedFiles: [...new Set(affectedFiles)],
    estimatedEffort: usages.totalUsages > 20 ? 'High (1-2 weeks)' : 
                    usages.totalUsages > 5 ? 'Medium (2-3 days)' : 
                    'Low (few hours)',
  };
}

// Helper functions
async function findPackagePath(repoRoot: string, packageName: string): Promise<string | null> {
  const dirs = ['packages', 'apps', 'tools'];
  
  for (const dir of dirs) {
    const dirPath = path.join(repoRoot, dir);
    const entries = await fs.readdir(dirPath, { withFileTypes: true });
    
    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      
      const packageJsonPath = path.join(dirPath, entry.name, 'package.json');
      try {
        const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf-8'));
        if (packageJson.name === `@agency/${packageName}` || entry.name === packageName) {
          return path.join(dirPath, entry.name);
        }
      } catch {
        continue;
      }
    }
  }
  
  return null;
}

function getPackageDomain(packageName: string): string | null {
  // Extract domain from package name
  const domainMap: Record<string, string> = {
    'config': 'config',
    'core': 'core',
    'ui': 'ui',
    'data': 'data',
    'auth': 'auth',
    'communication': 'communication',
    'testing': 'testing',
  };

  for (const [key, value] of Object.entries(domainMap)) {
    if (packageName.includes(key)) return value;
  }

  return null;
}

function isValidDependencyFlow(source: string, target: string): boolean {
  // Valid flow: config/core -> data/auth/communication/ui -> apps
  const hierarchy = ['config', 'core', 'data', 'auth', 'communication', 'ui'];
  
  const sourceIndex = hierarchy.indexOf(source);
  const targetIndex = hierarchy.indexOf(target);
  
  if (sourceIndex === -1 || targetIndex === -1) return true; // Unknown domains
  
  // Can only import from same or lower level
  return targetIndex <= sourceIndex;
}
```

### `bin/mcp-server.ts`

```typescript
#!/usr/bin/env tsx
// MCP Server CLI entry point

import { startServer } from '../src/index.js';

const config = {
  name: 'agency-monorepo',
  version: process.env.npm_package_version || '0.1.0',
  repositoryRoot: process.cwd(),
};

startServer(config).catch((error) => {
  console.error('Failed to start MCP server:', error);
  process.exit(1);
});
```

### `config/cursor.json`

```json
{
  "name": "Agency Monorepo",
  "description": "MCP server for agency monorepo context",
  "command": "npx",
  "args": ["tsx", "./tools/mcp-server/bin/mcp-server.ts"],
  "env": {
    "NODE_ENV": "development"
  },
  "tools": [
    "get_repository_structure",
    "list_packages",
    "get_file_tree",
    "read_file",
    "get_package_details",
    "get_package_exports",
    "read_package_readme",
    "get_agents_rules",
    "validate_change",
    "find_usages",
    "generate_migration_plan"
  ]
}
```

### README

```markdown
# @agency/tools-mcp-server

Model Context Protocol (MCP) server for exposing agency monorepo context to AI tools.

## Quick Start

### 1. Install

```bash
pnpm install
```

### 2. Start the server

```bash
pnpm start
# Or in development mode with watch
pnpm dev
```

### 3. Configure Cursor IDE

Add to Cursor settings:

```json
{
  "mcpServers": {
    "agency-monorepo": {
      "command": "npx",
      "args": ["tsx", "./tools/mcp-server/bin/mcp-server.ts"],
      "cwd": "${workspaceFolder}"
    }
  }
}
```

Or copy `config/cursor.json` to your Cursor MCP config directory.

### 4. Configure Windsurf

Add to `.windsurfrc` or Windsurf settings:

```json
{
  "mcp": {
    "servers": [{
      "name": "agency-monorepo",
      "command": "npx tsx ./tools/mcp-server/bin/mcp-server.ts"
    }]
  }
}
```

## Available Tools

### Repository Exploration

- `get_repository_structure` - Get high-level monorepo structure
- `list_packages` - List all packages in a directory
- `get_file_tree` - Get file tree for a package
- `search_files` - Search for files by pattern
- `read_file` - Read contents of a specific file
- `get_git_status` - Get git status and recent commits

### Package Information

- `get_package_details` - Get detailed package information
- `get_package_exports` - Get public API exports
- `read_package_readme` - Read package documentation
- `find_package_by_export` - Find package providing an export
- `get_package_dependencies` - Get workspace and external dependencies

### AI Agent Rules

- `get_agents_rules` - Get complete AGENTS.md
- `get_package_rules` - Get rules for specific package
- `validate_change` - Validate proposed changes against rules

### Refactoring Support

- `find_usages` - Find all usages of an export
- `analyze_imports` - Analyze import patterns and violations
- `generate_migration_plan` - Generate plan for API changes

## Example Usage

### In Cursor Chat

```
@mcp get_package_details {"packageName": "ui-design-system"}
```

```
@mcp find_usages {"packageName": "core-utils", "exportName": "formatDate"}
```

```
@mcp validate_change {"packageName": "data-db", "changeType": "modify", "importPath": "../apps/crm"}
```

### Programmatic Usage

```typescript
import { createMcpServer } from '@agency/tools-mcp-server';

const server = await createMcpServer({
  name: 'custom-instance',
  version: '1.0.0',
  repositoryRoot: '/path/to/repo',
});

// Use with any MCP transport
```

## Tool Categories

### 1. Repository Context
Understand monorepo structure without parsing files manually.

### 2. Package Discovery
Find packages by exports, understand dependencies, read documentation.

### 3. Rule Enforcement
Validate changes against AGENTS.md before implementation.

### 4. Refactoring Assistant
Find usages, detect violations, plan migrations.

## Benefits

- **Reduced Token Usage** - AI tools get structured context, not raw files
- **Consistency** - Same context across Cursor, Windsurf, Claude Desktop
- **Accuracy** - Direct access to package.json exports, not guessing
- **Governance** - Automated rule checking prevents architectural violations

## Extending

Add new tools by creating files in `src/tools/`:

```typescript
export function registerCustomTools(server: McpServer, repoRoot: string): void {
  server.tool('my_tool', 'Description', schema, async (params) => {
    // Implementation
  });
}
```

Then register in `src/index.ts`.

## Architecture

```
AI Tool (Cursor/Windsurf)
    |
    v
MCP Client
    |
    v
MCP Server (this package)
    |
    +-- Repository Tools
    +-- Package Tools
    +-- Rules Tools
    +-- Refactor Tools
```

## Resources

- [Model Context Protocol Spec](https://modelcontextprotocol.io/)
- [MCP TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk)
- [Vercel MCP Guide](https://vercel.com/docs/mcp)
```

## Implementation Checklist

- [ ] Package created at `tools/mcp-server/`
- [ ] MCP server starts without errors
- [ ] All tools respond correctly
- [ ] Cursor IDE integration configured
- [ ] Windsurf integration configured
- [ ] AGENTS.md rules exposed through tools
- [ ] Refactoring tools tested with real packages
- [ ] Team documentation created

## Verification

```bash
# Start server
pnpm --filter @agency/tools-mcp-server start

# Test with MCP inspector (if available)
npx @modelcontextprotocol/inspector node bin/mcp-server.ts

# In Cursor: test @mcp get_repository_structure
```

## Related Tasks

- `a0-docs-agents` - AGENTS.md content this server exposes
- `c14-infra-workspace-boundaries` - Dependency enforcement rules
- `b4-tools-content-pipeline` - AI content integration
- `10-config-eslint` - Import rules validation
