module.exports = {
    root: true,
    parser: '@typescript-eslint/parser',
    plugins: ['@typescript-eslint'],
    extends: [
      'eslint:recommended',
      '@typescript-eslint/recommended',
    ],
    parserOptions: {
      ecmaVersion: 2020,
      sourceType: 'module',
    },
    env: {
      node: true,
      es6: true,
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    },
    ignorePatterns: [
      'dist/',
      'node_modules/',
      'coverage/',
      '*.js',
    ],
    overrides: [
      {
        files: ['**/*.test.ts'],
        env: { jest: true },
        rules: {
          '@typescript-eslint/no-explicit-any': 'off',
        },
      },
    ],
  };