import tsParser from '@typescript-eslint/parser';
import tsPlugin from '@typescript-eslint/eslint-plugin';

export default [
  // Base JavaScript rules (ESLint 9.x built-in)
  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
    },
    rules: {
      // Basic JavaScript rules
      'no-unused-vars': 'error',
      'no-console': 'warn',
      'prefer-const': 'error',
      'no-var': 'error',
    },
  },
  
  // TypeScript configuration
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
    },
    rules: {
      // TypeScript recommended rules
      ...tsPlugin.configs.recommended.rules,
      
      // Additional TypeScript rules for strictness
      '@typescript-eslint/no-unused-vars': 'error',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/prefer-const': 'error',
      '@typescript-eslint/no-var-requires': 'error',
    },
  },
  
  // Package boundary enforcement
  {
    rules: {
      'no-restricted-imports': ['error', {
        zones: [
          // Prevent core packages from importing from higher domains
          {
            target: './packages/core/**/*',
            from: [
              './packages/ui/**/*',
              './packages/data/**/*', 
              './packages/auth/**/*',
              './packages/communication/**/*',
              './packages/marketing/**/*'
            ],
            message: 'Core packages may only import from config domain, not from higher-level domains',
          },
          
          // Prevent UI packages from importing from data/auth/communication domains
          {
            target: './packages/ui/**/*',
            from: [
              './packages/data/**/*',
              './packages/auth/**/*',
              './packages/communication/**/*',
              './packages/marketing/**/*'
            ],
            message: 'UI packages may only import from config and core domains',
          },
          
          // Prevent data packages from importing from auth/communication domains
          {
            target: './packages/data/**/*',
            from: [
              './packages/auth/**/*',
              './packages/communication/**/*',
              './packages/marketing/**/*'
            ],
            message: 'Data packages may only import from config, core, and ui domains',
          },
          
          // Prevent auth packages from importing from communication domains
          {
            target: './packages/auth/**/*',
            from: [
              './packages/communication/**/*',
              './packages/marketing/**/*'
            ],
            message: 'Auth packages may only import from config, core, ui, and data domains',
          },
          
          // Prevent any package from importing from apps
          {
            target: './packages/**/*',
            from: './apps/**/*',
            message: 'Packages may never import from applications - this violates package boundaries',
          },
          
          // Prevent importing from internal src/ paths across packages
          {
            target: './packages/**/*',
            from: './packages/**/src/**',
            message: 'Do not import from internal src/ paths across packages - use package exports instead',
          },
          
          // Prevent relative imports across package boundaries
          {
            target: './packages/**/*',
            from: [
              '../packages/**/*',
              '../../packages/**/*'
            ],
            message: 'Use workspace package imports instead of relative paths across packages',
          },
        ],
      }],
    },
  },
  
  // Common file patterns and ignores
  {
    ignores: [
      'node_modules/**',
      'dist/**',
      'build/**',
      '.next/**',
      '.turbo/**',
      'coverage/**',
      '*.config.js',
      '*.config.ts',
    ],
  },
];
