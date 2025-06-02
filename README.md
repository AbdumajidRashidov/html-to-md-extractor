# HTML to Markdown Extractor

[![npm version](https://badge.fury.io/js/@abdumajid%2Fhtml-to-md-extractor.svg)](https://badge.fury.io/js/@abdumajid%2Fhtml-to-md-extractor)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/%3C%2F%3E-TypeScript-%230074c1.svg)](http://www.typescriptlang.org/)

Advanced HTML to Markdown converter with **email-specific optimizations**. Perfect for processing email content, newsletters, and complex HTML documents into clean, readable Markdown.

## ✨ Features

- 🎯 **Email-optimized**: Special handling for Outlook, Gmail, and other email clients
- 📧 **Email signatures**: Automatic detection and formatting of email signatures
- 📋 **Table conversion**: Smart table to Markdown conversion
- 🎨 **Inline styles**: Converts inline CSS styles to Markdown formatting
- 📝 **Custom rules**: Extensible rule system for custom HTML elements
- 🚀 **TypeScript**: Full TypeScript support with comprehensive type definitions
- ⚡ **Performance**: Optimized for large documents and batch processing
- 🔧 **Configurable**: Extensive options for customizing output format

## 🚀 Quick Start

```bash
npm install @abdumajid/html-to-md-extractor
```

```javascript
const { emailToMarkdown } = require('@abdumajid/html-to-md-extractor');

const emailHtml = `
  <div class="email-content">
    <h1>Welcome!</h1>
    <p>Hello <strong>John</strong>,</p>
    <p>Thanks for joining our <em>newsletter</em>!</p>
    <div class="signature">
      <p>Best regards,<br>The Team</p>
    </div>
  </div>
`;

const result = emailToMarkdown(emailHtml);
console.log(result.markdown);
```

**Output:**
```markdown
# Welcome!

Hello **John**,

Thanks for joining our *newsletter*!

---
Best regards,
The Team
```

## 📖 Documentation

### Basic Usage

```javascript
const { htmlToMarkdown, emailToMarkdown } = require('@abdumajid/html-to-md-extractor');

// For general HTML
const result1 = htmlToMarkdown('<p>Hello <strong>world</strong>!</p>');

// For email HTML (with email-specific optimizations)
const result2 = emailToMarkdown(emailHtml, {
  handleEmailSignatures: true,
  convertInlineStyles: true,
  tableHandling: 'convert'
});
```

### TypeScript Support

```typescript
import { 
  emailToMarkdown, 
  ConversionOptions, 
  ConversionResult 
} from '@abdumajid/html-to-md-extractor';

const options: ConversionOptions = {
  handleEmailSignatures: true,
  preserveEmailQuotes: true,
  tableHandling: 'convert'
};

const result: ConversionResult = emailToMarkdown(html, options);
```

## 📊 Real-World Examples

### Outlook Email Processing

```javascript
const outlookEmail = `
  <div class="WordSection1">
    <p class="MsoNormal">PU today 2200, can likely be worked in earlier</p>
    <p class="MsoNormal">Del Monday 9am in Joplin MO</p>
    <p class="MsoNormal">Load of packaging material 9360lbs</p>
    <p class="MsoNormal">Paying 1100</p>
    <table class="MsoNormalTable" border="0">
      <tr>
        <td><b>Fallin Smith</b></td>
      </tr>
      <tr>
        <td>Transportation Broker</td>
      </tr>
    </table>
  </div>
`;

const result = emailToMarkdown(outlookEmail, {
  handleOutlookSpecific: true,
  handleEmailSignatures: true
});
```

### Newsletter/Marketing Email

```javascript
const newsletter = `
  <div style="max-width: 600px;">
    <h1>🎉 Special Offer!</h1>
    <p>Hi <strong>Sarah</strong>,</p>
    <p>Get <mark>50% off</mark> your next purchase!</p>
    <table border="1">
      <tr><th>Product</th><th>Price</th></tr>
      <tr><td>Widget A</td><td>$25.00</td></tr>
    </table>
    <p><a href="https://shop.com/sale">Shop Now</a></p>
  </div>
`;

const result = emailToMarkdown(newsletter);
```

### Batch Processing

```javascript
const { HTMLToMarkdownExtractor } = require('@abdumajid/html-to-md-extractor');

const extractor = new HTMLToMarkdownExtractor({
  handleEmailSignatures: true
});

// Process multiple emails efficiently
const emailBatch = [email1, email2, email3, /* ... */];
const results = await extractor.convertBatch(emailBatch);

extractor.dispose(); // Clean up resources
```

## ⚙️ Configuration Options

```typescript
interface ConversionOptions {
  // Basic formatting
  preserveWhitespace?: boolean;        // Default: false
  trimWhitespace?: boolean;            // Default: true
  bulletListMarker?: string;           // Default: '-'
  codeBlockStyle?: 'indented' | 'fenced'; // Default: 'fenced'
  strongDelimiter?: string;           // Default: '**'
  emDelimiter?: string;               // Default: '*'
  linkStyle?: 'inlined' | 'referenced'; // Default: 'inlined'
  
  // Email-specific options
  preserveEmailHeaders?: boolean;      // Default: true
  handleEmailSignatures?: boolean;     // Default: true
  convertInlineStyles?: boolean;       // Default: true
  preserveEmailQuotes?: boolean;       // Default: true
  handleOutlookSpecific?: boolean;     // Default: true
  
  // Table handling
  tableHandling?: 'preserve' | 'convert' | 'remove'; // Default: 'convert'
  
  // Advanced customization
  customRules?: ConversionRule[];
  ignoreElements?: string[];
  keepElements?: string[];
}
```

## 🔧 Advanced Usage

### Custom Rules

```javascript
const { RuleBuilder } = require('@abdumajid/html-to-md-extractor');

const customRule = RuleBuilder.create()
  .forSelector('mark')
  .withReplacement('==${content}==')
  .withPriority(2)
  .build();

const result = htmlToMarkdown(html, {
  customRules: [customRule]
});
```

### Email Context Detection

```javascript
const { EmailUtils } = require('@abdumajid/html-to-md-extractor');

const emailUtils = new EmailUtils();
const context = emailUtils.detectEmailContext(document);

console.log({
  isEmail: context.isEmailContent,
  hasSignature: context.hasSignature,
  clientType: context.clientType // 'outlook', 'gmail', etc.
});
```

## 🌐 Browser Support

Works in both Node.js and browsers:

```html
<script type="module">
  import { emailToMarkdown } from 'https://unpkg.com/@abdumajid/html-to-md-extractor@latest/dist/index.esm.js';
  
  const result = emailToMarkdown(html);
  console.log(result.markdown);
</script>
```

## 📦 API Reference

### Main Functions

- `htmlToMarkdown(html, options?)` - Convert general HTML to Markdown
- `emailToMarkdown(html, options?)` - Convert email HTML with optimizations

### Classes

- `HTMLToMarkdownExtractor` - Main converter class for advanced usage
- `EmailUtils` - Email-specific utilities
- `RuleBuilder` - Builder for custom conversion rules

### Types

- `ConversionOptions` - Configuration interface
- `ConversionResult` - Result with markdown and metadata
- `EmailHeaders` - Extracted email header information

## 🔄 Migration Guide

### From v0.x to v1.x

```javascript
// Old way
const converter = require('html-to-md-extractor');
const result = converter.convert(html);

// New way
const { emailToMarkdown } = require('@abdumajid/html-to-md-extractor');
const result = emailToMarkdown(html);
```

## 🚀 Performance

- **Fast**: Processes typical emails in < 10ms
- **Memory efficient**: Optimized for large documents
- **Batch processing**: Handle thousands of emails efficiently
- **Caching**: Intelligent rule and regex caching

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Setup

```bash
git clone https://github.com/abdumajidRashidov/html-to-md-extractor.git
cd html-to-md-extractor
npm install
npm test
npm run build
```

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🔗 Related Projects

- [turndown](https://github.com/domchristie/turndown) - General HTML to Markdown converter
- [node-html-markdown](https://github.com/crosstype/node-html-markdown) - Another HTML to Markdown library
- [html2md](https://github.com/stonehippo/html2md) - Simple HTML to Markdown converter

## 🆘 Support

- 📖 [Documentation](https://github.com/abdumajidRashidov/html-to-md-extractor#readme)
- 🐛 [Issues](https://github.com/abdumajidRashidov/html-to-md-extractor/issues)
- 💬 [Discussions](https://github.com/abdumajidRashidov/html-to-md-extractor/discussions)

---

**Made with ❤️ for better email and HTML processing**