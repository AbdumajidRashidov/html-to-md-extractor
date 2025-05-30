// tests/setup.ts
import 'jsdom/lib/jsdom/living/generated/utils';
import { beforeEach, afterEach, jest } from '@jest/globals';

// Mock console for testing
const originalConsole = { ...console };

beforeEach(() => {
  // Reset mocks before each test
  jest.clearAllMocks();
  
  // Setup console mocks
  global.console = {
    ...originalConsole,
    warn: jest.fn(),
    error: jest.fn(),
    log: jest.fn()
  } as Console;
});

afterEach(() => {
  // Restore original console after tests
  global.console = originalConsole;
});