// jest.config.js
module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'jest-environment-jsdom',
    roots: ['<rootDir>/src', '<rootDir>/tests'],
    testMatch: [
      '**/__tests__/**/*.ts',
      '**/?(*.)+(spec|test).ts'
    ],
    collectCoverageFrom: [
      'src/**/*.ts',
      '!src/**/*.d.ts',
      '!src/index.ts',
      '!src/types/index.ts'
    ],
    coverageDirectory: 'coverage',
    coverageReporters: ['text', 'lcov', 'html', 'json'],
    setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
    transform: {
      '^.+\\.(ts|tsx)$': ['ts-jest', {
        tsconfig: {
          compilerOptions: {
            target: 'es2018',
            module: 'commonjs',
            moduleResolution: 'node',
            lib: ['es2018', 'dom'],
            declaration: false,
            sourceMap: true,
            removeComments: true,
            strict: true,
            esModuleInterop: true,
            skipLibCheck: true,
            forceConsistentCasingInFileNames: true,
            resolveJsonModule: true,
            allowSyntheticDefaultImports: true,
            types: ['jest', 'node', 'jsdom']
          }
        }
      }]
    },
    testTimeout: 10000,
    verbose: true,
    // Setup DOM globals
    setupFiles: ['<rootDir>/tests/jest.setup.js']
  };