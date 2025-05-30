# Contributing to HTML to Markdown Extractor

Thank you for your interest in contributing to this project! Here are some guidelines to help you get started.

## Development Setup

1. Fork and clone the repository
2. Install dependencies: `npm install`
3. Run tests: `npm test`
4. Build the project: `npm run build`

## Project Structure

```
src/
├── core/           # Core conversion logic
├── rules/          # Conversion rules (base, email, custom)
├── utils/          # Utility functions
├── types/          # TypeScript definitions
└── index.ts        # Main exports

tests/              # Test files
examples/           # Usage examples
```

## Development Commands

```bash
npm run build       # Build the library
npm run build:watch # Build in watch mode
npm test           # Run tests
npm run test:watch # Run tests in watch mode
npm run test:coverage # Generate coverage report
npm run lint       # Run ESLint
npm run lint:fix   # Fix linting issues
```

## Adding New Features

1. **Email Client Support**: Add detection logic in `EmailUtils.detectClientType()`
2. **Custom Rules**: Extend the rules system in `rules/custom-rules.ts`
3. **HTML Elements**: Add conversion rules in `rules/base-rules.ts`
4. **Email Features**: Add email-specific handling in `rules/email-rules.ts`

## Testing

- Write tests for new features
- Ensure all existing tests pass
- Test with real-world email samples
- Add integration tests for complex scenarios

## Code Style

- Follow TypeScript best practices
- Use meaningful variable and function names
- Add JSDoc comments for public APIs
- Follow the existing code structure

## Pull Request Process

1. Create a feature branch from `develop`
2. Make your changes with tests
3. Ensure all tests pass and linting is clean
4. Update documentation if needed
5. Submit a pull request with a clear description

## Reporting Issues

When reporting bugs, please include:
- HTML input that causes the issue
- Expected vs actual markdown output
- Environment details (Node.js version, browser, etc.)
- Steps to reproduce

## Questions?

Feel free to open an issue for questions or discussion!

# LICENSE
MIT License

Copyright (c) 2024 HTML to Markdown Extractor Contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.