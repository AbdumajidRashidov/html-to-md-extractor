module.exports = {
    parser: '@typescript-eslint/parser',
    parserOptions: {
      ecmaVersion: 2020,
      sourceType: 'module',
      project: './tsconfig.json'
    },
    extends: [
      'eslint:recommended',
      '@typescript-eslint/recommended'
    ],
    rules: {
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': 'error',
      '@typescript-eslint/prefer-const': 'error',
      '@typescript-eslint/no-non-null-assertion': 'warn',
      'no-console': 'warn',
      'prefer-const': 'error',
      'no-var': 'error'
    },
    env: {
      node: true,
      browser: true,
      es6: true,
      jest: true
    },
    ignorePatterns: ['dist/', 'node_modules/', '*.js']
  };
  