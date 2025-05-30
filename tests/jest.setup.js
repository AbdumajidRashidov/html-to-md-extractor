// tests/jest.setup.js
import 'jest-environment-jsdom';

// Mock console methods to avoid noise in tests
global.console = {
  ...console,
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Setup DOM globals that might be missing
Object.defineProperty(window, 'DOMParser', {
  writable: true,
  value: jest.fn().mockImplementation(() => ({
    parseFromString: jest.fn().mockReturnValue({
      body: document.createElement('body'),
      querySelector: jest.fn(),
      querySelectorAll: jest.fn().mockReturnValue([])
    })
  }))
});

// Mock Node.js specific modules for browser tests
jest.mock('jsdom', () => ({
  JSDOM: jest.fn().mockImplementation((html) => ({
    window: {
      document: {
        body: document.createElement('body'),
        querySelector: jest.fn(),
        querySelectorAll: jest.fn().mockReturnValue([])
      }
    }
  }))
}));