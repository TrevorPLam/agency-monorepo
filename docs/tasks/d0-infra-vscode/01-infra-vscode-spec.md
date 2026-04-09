# D0 Infra Vscode Specification

## Files

```
.vscode/
├── settings.json
├── extensions.json
└── launch.json
```

### `settings.json`
```json
{
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.formatOnSave": true,
  "editor.formatOnPaste": false,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit",
    "source.organizeImports": "explicit"
  },
  "editor.tabSize": 2,
  "editor.insertSpaces": true,
  "editor.detectIndentation": false,
  "editor.rulers": [100],
  "editor.wordWrap": "wordWrapColumn",
  "editor.wordWrapColumn": 100,
  "editor.bracketPairColorization.enabled": true,
  "editor.guides.bracketPairs": true,
  "editor.renderWhitespace": "boundary",
  "editor.trimAutoWhitespace": true,
  "files.trimTrailingWhitespace": true,
  "files.insertFinalNewline": true,
  "files.eol": "\n",
  "files.exclude": {
    "**/.git": true,
    "**/.DS_Store": true,
    "**/node_modules": true,
    "**/.next": true,
    "**/dist": true,
    "**/build": true,
    "**/.turbo": true,
    "**/.pnpm-store": true
  },
  "search.exclude": {
    "**/node_modules": true,
    "**/.next": true,
    "**/dist": true,
    "**/build": true,
    "**/.turbo": true,
    "**/coverage": true,
    "pnpm-lock.yaml": true
  },
  "typescript.tsdk": "node_modules/typescript/lib",
  "typescript.enablePromptUseWorkspaceTsdk": true,
  "typescript.preferences.importModuleSpecifier": "relative",
  "typescript.suggest.autoImports": true,
  "typescript.updateImportsOnFileMove.enabled": "always",
  "eslint.workingDirectories": [{"mode": "auto"}],
  "eslint.validate": [
    "javascript",
    "javascriptreact",
    "typescript",
    "typescriptreact"
  ],
  "tailwindCSS.experimental.classRegex": [
    ["clsx\\(([^)]*)\\)", "(?'[^']*'|\"[^\"]*\"|`[^`]*`|[\\w-]+)"],
    ["cn\\(([^)]*)\\)", "(?'[^']*'|\"[^\"]*\"|`[^`]*`|[\\w-]+)"],
    ["cva\\(([^)]*)\\)", "(?'[^']*'|\"[^\"]*\"|`[^`]*`|[\\w-]+)"]
  ],
  "tailwindCSS.includeLanguages": {
    "typescript": "javascript",
    "typescriptreact": "javascript"
  },
  "files.associations": {
    "*.css": "tailwindcss"
  },
  "emmet.includeLanguages": {
    "typescriptreact": "html"
  },
  "debug.javascript.autoAttachFilter": "smart",
  "debug.javascript.terminalOptions": {
    "skipFiles": ["<node_internals>/**"]
  }
}
```

### `extensions.json`
```json
{
  "recommendations": [
    "esbenp.prettier-vscode",
    "dbaeumer.vscode-eslint",
    "bradlc.vscode-tailwindcss",
    "ms-vscode.vscode-typescript-next",
    "formulahendry.auto-rename-tag",
    "christian-kohler.path-intellisense",
    "ms-vscode.vscode-json",
    "github.vscode-github-actions",
    "changepoint.vscode-pnpm",
    "yoavbls.pretty-ts-errors",
    "usernamehw.errorlens",
    "streetsidesoftware.code-spell-checker",
    "eamodio.gitlens",
    "github.copilot",
    "github.copilot-chat"
  ],
  "unwantedRecommendations": [
    "hookyqr.beautify",
    "ms-vscode.vscode-ember"
  ]
}
```

### `launch.json`
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Next.js: debug full stack",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/node_modules/.bin/next",
      "args": ["dev"],
      "cwd": "${workspaceFolder}/apps/agency-website",
      "console": "integratedTerminal",
      "internalConsoleOptions": "neverOpen",
      "serverReadyAction": {
        "pattern": "started server on .+, url: (https?://.+)",
        "uriFormat": "%s",
        "action": "debugWithChrome"
      }
    },
    {
      "name": "Debug Current Test File",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/node_modules/vitest/vitest.mjs",
      "args": ["run", "${relativeFile}"],
      "console": "integratedTerminal",
      "internalConsoleOptions": "neverOpen"
    },
    {
      "name": "Debug All Tests",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/node_modules/vitest/vitest.mjs",
      "args": ["run"],
      "console": "integratedTerminal",
      "internalConsoleOptions": "neverOpen"
    }
  ]
}
```


## Git Ignore for VS Code

Update root `.gitignore` (tracked in `00-foundation`):
```gitignore
.vscode/*
!.vscode/extensions.json
!.vscode/settings.json
!.vscode/launch.json
```

This allows team-shared settings while ignoring user-specific files.


## Key Configuration Details

### Formatting
- **Default Formatter**: Prettier (from `13-config-prettier`)
- **Format on Save**: Enabled
- **ESLint Fix on Save**: Enabled for auto-fixable issues
- **Organize Imports on Save**: Enabled

### TypeScript
- **Workspace TypeScript**: Uses project's TypeScript version
- **Auto Imports**: Enabled
- **Import Module Specifier**: Relative paths

### Search & Files
- **Excluded from Search**: node_modules, build outputs, lock files
- **File Exclusions**: Hidden in explorer sidebar
- **Line Endings**: LF (Unix-style)

### Tailwind CSS
- **Class Detection**: Works with `clsx`, `cn`, `cva` helpers
- **CSS Association**: .css files treated as Tailwind


## Verification

1. Open workspace in VS Code
2. Install recommended extensions (prompt should appear)
3. Create a test file with formatting issues
4. Save the file - should auto-format
5. Check TypeScript: `Cmd/Ctrl + Shift + P` → "TypeScript: Select TypeScript Version" → Use Workspace Version


## AI Agent Notes

When working in this monorepo:
1. Respect the 100-character line width
2. Use 2-space indentation
3. Use double quotes (not single)
4. Add trailing commas where valid
5. Format files before committing
