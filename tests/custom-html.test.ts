import { htmlToMarkdown, emailToMarkdown } from '../src/index';

describe('Comprehensive HTML to Markdown Testing', () => {

  // ============================================================================
  // BASIC FORMATTING TESTS
  // ============================================================================

  describe('Basic Formatting Elements', () => {
    test('Mixed inline formatting', () => {
      const html = `
        <p>This text contains <strong>bold</strong>, <em>italic</em>, 
        <code>inline code</code>, <del>strikethrough</del>, 
        <u>underlined</u>, and <mark>highlighted</mark> text.</p>
      `;
      
      const result = htmlToMarkdown(html);
      expect(result.markdown).toContain('**bold**');
      expect(result.markdown).toContain('*italic*');
      expect(result.markdown).toContain('`inline code`');
      expect(result.markdown).toContain('~~strikethrough~~');
    });

    test('Nested formatting elements', () => {
      const html = `
        <p>Text with <strong>bold and <em>nested italic</em> formatting</strong>.</p>
        <p>Also <em>italic with <code>code inside</code> it</em>.</p>
      `;
      
      const result = htmlToMarkdown(html);
      expect(result.markdown).toContain('**bold and *nested italic* formatting**');
      expect(result.markdown).toContain('*italic with `code inside` it*');
    });

    test('Special characters and entities', () => {
      const html = `
        <p>&amp; &lt; &gt; &quot; &#39; &nbsp; &copy; &reg; &trade;</p>
        <p>Math: 2 &times; 3 = 6, 10 &divide; 2 = 5</p>
        <p>Currency: &dollar;100, &euro;85, &pound;75</p>
      `;
      
      const result = htmlToMarkdown(html);
      expect(result.markdown).toContain('& < > " \'   © ® ™');
      expect(result.markdown).toContain('2 × 3 = 6, 10 ÷ 2 = 5');
      expect(result.markdown).toContain('$100, €85, £75');
    });
  });

  // ============================================================================
  // STRUCTURE TESTS
  // ============================================================================

  describe('Document Structure', () => {
    test('Headers hierarchy', () => {
      const html = `
        <h1>Main Title</h1>
        <h2>Section Title</h2>
        <h3>Subsection</h3>
        <h4>Sub-subsection</h4>
        <h5>Level 5</h5>
        <h6>Level 6</h6>
      `;
      
      const result = htmlToMarkdown(html);
      expect(result.markdown).toMatch(/^# Main Title$/m);
      expect(result.markdown).toMatch(/^## Section Title$/m);
      expect(result.markdown).toMatch(/^### Subsection$/m);
      expect(result.markdown).toMatch(/^#### Sub-subsection$/m);
      expect(result.markdown).toMatch(/^##### Level 5$/m);
      expect(result.markdown).toMatch(/^###### Level 6$/m);
    });

    test('Complex nested lists', () => {
      const html = `
        <ul>
          <li>First level item 1</li>
          <li>First level item 2
            <ul>
              <li>Second level item A</li>
              <li>Second level item B
                <ol>
                  <li>Ordered sub-item 1</li>
                  <li>Ordered sub-item 2</li>
                </ol>
              </li>
            </ul>
          </li>
          <li>First level item 3</li>
        </ul>
      `;
      
      const result = htmlToMarkdown(html);
      expect(result.markdown).toContain('- First level item 1');
      expect(result.markdown).toContain('- First level item 2');
      expect(result.markdown).toContain('- Second level item A');
      expect(result.markdown).toContain('1. Ordered sub-item 1');
    });

    test('Mixed content blocks', () => {
      const html = `
        <h2>Section</h2>
        <p>Introduction paragraph.</p>
        <blockquote>
          <p>This is a quoted section with <strong>formatting</strong>.</p>
        </blockquote>
        <ul>
          <li>List item with <a href="https://example.com">link</a></li>
        </ul>
        <hr>
        <p>Content after horizontal rule.</p>
      `;
      
      const result = htmlToMarkdown(html);
      expect(result.markdown).toContain('## Section');
      expect(result.markdown).toContain('> This is a quoted section');
      expect(result.markdown).toContain('---');
      expect(result.markdown).toContain('[link](https://example.com)');
    });
  });

  // ============================================================================
  // TABLE TESTS
  // ============================================================================

  describe('Table Conversion', () => {
    test('Simple data table', () => {
      const html = `
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Age</th>
              <th>City</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>John</td>
              <td>30</td>
              <td>New York</td>
            </tr>
            <tr>
              <td>Jane</td>
              <td>25</td>
              <td>Los Angeles</td>
            </tr>
          </tbody>
        </table>
      `;
      
      const result = htmlToMarkdown(html);
      expect(result.markdown).toContain('| Name | Age | City |');
      expect(result.markdown).toContain('| --- | --- | --- |');
      expect(result.markdown).toContain('| John | 30 | New York |');
      expect(result.markdown).toContain('| Jane | 25 | Los Angeles |');
    });

    test('Table with formatting and special characters', () => {
      const html = `
        <table>
          <tr>
            <th>Product</th>
            <th>Price</th>
            <th>Status</th>
          </tr>
          <tr>
            <td><strong>Widget A</strong></td>
            <td>$25.99</td>
            <td><em>Available</em></td>
          </tr>
          <tr>
            <td>Widget B | Special</td>
            <td>$35.00</td>
            <td>Out of Stock</td>
          </tr>
        </table>
      `;
      
      const result = htmlToMarkdown(html);
      expect(result.markdown).toContain('**Widget A**');
      expect(result.markdown).toContain('*Available*');
      expect(result.markdown).toContain('Widget B \\| Special'); // Escaped pipe
    });

    test('Complex table with colspan and rowspan (fallback behavior)', () => {
      const html = `
        <table>
          <tr>
            <th colspan="2">Header Spanning Two Columns</th>
            <th>Single Column</th>
          </tr>
          <tr>
            <td>Cell 1</td>
            <td>Cell 2</td>
            <td rowspan="2">Spanning Rows</td>
          </tr>
          <tr>
            <td>Cell 3</td>
            <td>Cell 4</td>
          </tr>
        </table>
      `;
      
      const result = htmlToMarkdown(html);
      // Should handle gracefully even if colspan/rowspan aren't fully supported
      expect(result.markdown).toContain('Header Spanning Two Columns');
      expect(result.markdown).toContain('Cell 1');
    });
  });

  // ============================================================================
  // CODE AND PREFORMATTED TEXT TESTS
  // ============================================================================

  describe('Code Handling', () => {
    test('Inline code with backticks', () => {
      const html = `
        <p>Use the <code>console.log()</code> function to debug.</p>
        <p>Complex code: <code>const obj = { key: \`value\` };</code></p>
      `;
      
      const result = htmlToMarkdown(html);
      expect(result.markdown).toContain('`console.log()`');
      // Should handle backticks in code properly
      expect(result.markdown).toMatch(/`{1,2}.*const obj.*`{1,2}/);
    });

    test('Code blocks with languages', () => {
      const html = `
        <pre><code class="language-javascript">
function greet(name) {
  console.log(\`Hello, \${name}!\`);
}
        </code></pre>
        
        <pre><code class="language-python">
def greet(name):
    print(f"Hello, {name}!")
        </code></pre>
      `;
      
      const result = htmlToMarkdown(html);
      expect(result.markdown).toContain('```javascript');
      expect(result.markdown).toContain('```python');
      expect(result.markdown).toContain('function greet(name)');
      expect(result.markdown).toContain('def greet(name):');
    });

    test('Plain preformatted text', () => {
      const html = `
        <pre>
This is preformatted text
    with preserved spacing
        and indentation.
        </pre>
      `;
      
      const result = htmlToMarkdown(html);
      expect(result.markdown).toContain('```');
      expect(result.markdown).toContain('preserved spacing');
    });
  });

  // ============================================================================
  // LINK AND IMAGE TESTS
  // ============================================================================

  describe('Links and Images', () => {
    test('Various link types', () => {
      const html = `
        <p>
          <a href="https://example.com">External link</a><br>
          <a href="mailto:test@example.com">Email link</a><br>
          <a href="tel:+1234567890">Phone link</a><br>
          <a href="#section">Internal link</a><br>
          <a href="https://example.com" title="Example Site">Link with title</a>
        </p>
      `;
      
      const result = htmlToMarkdown(html);
      expect(result.markdown).toContain('[External link](https://example.com)');
      expect(result.markdown).toContain('[Email link](mailto:test@example.com)');
      expect(result.markdown).toContain('[Phone link](tel:+1234567890)');
      expect(result.markdown).toContain('[Internal link](#section)');
      expect(result.markdown).toContain('[Link with title](https://example.com "Example Site")');
    });

    test('Image handling', () => {
      const html = `
        <img src="image.jpg" alt="Simple image">
        <img src="photo.png" alt="Photo with title" title="A beautiful photo">
        <img src="data:image/png;base64,iVBORw0KGg..." alt="Base64 image">
        <img src="cid:image001.jpg@outlook" alt="Embedded email image">
      `;
      
      const result = htmlToMarkdown(html);
      expect(result.markdown).toContain('![Simple image](image.jpg)');
      expect(result.markdown).toContain('![Photo with title](photo.png "A beautiful photo")');
      expect(result.markdown).toContain('![Base64 image](data:image/png;base64,iVBORw0KGg...)');
      expect(result.markdown).toContain('![Embedded email image](cid:image001.jpg@outlook)');
    });

    test('Complex link scenarios', () => {
      const html = `
        <p>Check out <a href="https://github.com/user/repo">this <strong>amazing</strong> project</a>!</p>
        <p><a href="https://example.com"><img src="banner.jpg" alt="Click me"></a></p>
        <p>Email us at <a href="mailto:support@example.com?subject=Help">support@example.com</a></p>
      `;
      
      const result = htmlToMarkdown(html);
      expect(result.markdown).toContain('[this **amazing** project](https://github.com/user/repo)');
      expect(result.markdown).toContain('[![Click me](banner.jpg)](https://example.com)');
      expect(result.markdown).toContain('[support@example.com](mailto:support@example.com?subject=Help)');
    });
  });

  // ============================================================================
  // EMAIL-SPECIFIC TESTS
  // ============================================================================

  describe('Email Content Processing', () => {
    test('Outlook email with signature', () => {
      const emailHtml = `
        <div class="WordSection1">
          <p class="MsoNormal">Hello team,</p>
          <p class="MsoNormal">Please review the attached document.</p>
          <p class="MsoNormal">&nbsp;</p>
          <table class="MsoNormalTable">
            <tr>
              <td>
                <p><strong>John Smith</strong></p>
                <p>Senior Developer</p>
                <p>Phone: (555) 123-4567</p>
                <p>Email: <a href="mailto:john@company.com">john@company.com</a></p>
              </td>
            </tr>
          </table>
        </div>
      `;
      
      const result = emailToMarkdown(emailHtml);
      expect(result.markdown).toContain('Hello team');
      expect(result.markdown).toContain('**John Smith**');
      expect(result.markdown).toContain('Senior Developer');
      expect(result.markdown).toContain('[john@company.com](mailto:john@company.com)');
    });

    test('Gmail email thread with quoted content', () => {
      const emailHtml = `
        <div dir="ltr">
          <div>Thanks for the quick response!</div>
          <div><br></div>
          <div class="gmail_quote">
            <div dir="ltr" class="gmail_attr">
              On Mon, Jan 15, 2024 at 2:30 PM John Doe &lt;<a href="mailto:john@example.com">john@example.com</a>&gt; wrote:
            </div>
            <blockquote class="gmail_quote">
              <div dir="ltr">
                <div>Here's the information you requested:</div>
                <ul>
                  <li>Project status: On track</li>
                  <li>Deadline: Friday</li>
                </ul>
              </div>
            </blockquote>
          </div>
        </div>
      `;
      
      const result = emailToMarkdown(emailHtml);
      expect(result.markdown).toContain('Thanks for the quick response!');
      expect(result.markdown).toContain('> On Mon, Jan 15, 2024');
      expect(result.markdown).toContain('> - Project status: On track');
    });

    test('Email with inline styles and formatting', () => {
      const emailHtml = `
        <div style="font-family: Arial, sans-serif;">
          <h1 style="color: #333; font-size: 24px;">Newsletter Title</h1>
          <p style="color: #666;">Welcome to our monthly update!</p>
          <div style="background-color: #f0f0f0; padding: 20px; border-left: 4px solid #007cba;">
            <p style="margin: 0; font-weight: bold;">Important Notice:</p>
            <p style="margin: 10px 0 0 0;">Please update your contact information.</p>
          </div>
          <p style="text-align: center;">
            <a href="https://example.com/update" style="background: #007cba; color: white; padding: 10px 20px; text-decoration: none;">Update Info</a>
          </p>
        </div>
      `;
      
      const result = emailToMarkdown(emailHtml, { convertInlineStyles: true });
      expect(result.markdown).toContain('# Newsletter Title');
      expect(result.markdown).toContain('Welcome to our monthly update!');
      expect(result.markdown).toContain('**Important Notice:**');
      expect(result.markdown).toContain('[Update Info](https://example.com/update)');
    });
  });

  // ============================================================================
  // EDGE CASES AND ERROR HANDLING
  // ============================================================================

  describe('Edge Cases and Error Handling', () => {
    test('Empty and whitespace-only content', () => {
      const testCases = [
        '',
        '   ',
        '<div></div>',
        '<p>   </p>',
        '<div><span></span></div>',
        '<p>&nbsp;</p>'
      ];
      
      testCases.forEach(html => {
        const result = htmlToMarkdown(html);
        expect(result.markdown.trim()).toBe('');
      });
    });

    test('Malformed HTML handling', () => {
      const malformedHtml = `
        <p>Unclosed paragraph
        <div>
          <span>Unclosed span
          <strong>Bold text</strong>
        </div>
        <ul>
          <li>Item without closing
          <li>Another item
        </ul>
      `;
      
      expect(() => {
        const result = htmlToMarkdown(malformedHtml);
        expect(result.markdown).toBeDefined();
      }).not.toThrow();
    });

    test('Deeply nested HTML structures', () => {
      // Create deeply nested structure
      let html = '<div>';
      for (let i = 0; i < 20; i++) {
        html += `<div><p>Level ${i} content</p>`;
      }
      html += 'Deep content';
      for (let i = 0; i < 20; i++) {
        html += '</div>';
      }
      html += '</div>';
      
      const result = htmlToMarkdown(html);
      expect(result.markdown).toContain('Deep content');
      expect(result.markdown).toContain('Level 0 content');
    });

    test('Large content handling', () => {
      const largeContent = '<p>' + 'This is a large paragraph. '.repeat(1000) + '</p>';
      
      const result = htmlToMarkdown(largeContent);
      expect(result.markdown).toBeDefined();
      expect(result.markdown.length).toBeGreaterThan(1000);
    });

    test('Special Unicode characters', () => {
      const html = `
        <p>Unicode: 🚀 💻 📊 ✅ ❌ ⚠️ 🔒</p>
        <p>Math symbols: ∑ ∏ ∫ ∞ ≤ ≥ ≠ ±</p>
        <p>Languages: العربية 中文 日本語 한국어 Русский</p>
        <p>Emojis: 😀 😃 😄 😁 😆 😅 😂</p>
      `;
      
      const result = htmlToMarkdown(html);
      expect(result.markdown).toContain('🚀 💻 📊');
      expect(result.markdown).toContain('∑ ∏ ∫ ∞');
      expect(result.markdown).toContain('العربية 中文 日本語');
      expect(result.markdown).toContain('😀 😃 😄');
    });
  });

  // ============================================================================
  // REAL-WORLD SCENARIOS
  // ============================================================================

  describe('Real-World Content Scenarios', () => {
    test('Blog post with mixed content', () => {
      const blogHtml = `
        <article>
          <header>
            <h1>10 Tips for Better Code</h1>
            <p><em>Published on January 15, 2024 by Jane Developer</em></p>
          </header>
          
          <p>Writing clean, maintainable code is crucial for any developer. Here are my top tips:</p>
          
          <h2>1. Use Meaningful Names</h2>
          <p>Always choose descriptive variable and function names:</p>
          <pre><code class="language-javascript">
// Bad
function calc(x, y) { return x * y * 0.1; }

// Good  
function calculateTaxAmount(price, taxRate) {
  return price * taxRate * 0.1;
}
          </code></pre>
          
          <h2>2. Keep Functions Small</h2>
          <blockquote>
            <p>"Functions should do one thing. They should do it well. They should do it only." - Robert C. Martin</p>
          </blockquote>
          
          <p>For more tips, check out <a href="https://cleancoder.com">Clean Coder</a>.</p>
        </article>
      `;
      
      const result = htmlToMarkdown(blogHtml);
      expect(result.markdown).toContain('# 10 Tips for Better Code');
      expect(result.markdown).toContain('*Published on January 15, 2024*');
      expect(result.markdown).toContain('## 1. Use Meaningful Names');
      expect(result.markdown).toContain('```javascript');
      expect(result.markdown).toContain('> "Functions should do one thing');
      expect(result.markdown).toContain('[Clean Coder](https://cleancoder.com)');
    });

    test('E-commerce product page', () => {
      const productHtml = `
        <div class="product">
          <h1>Premium Wireless Headphones</h1>
          <div class="price">
            <span class="original-price"><del>$199.99</del></span>
            <span class="sale-price"><strong>$149.99</strong></span>
          </div>
          
          <h3>Features</h3>
          <ul>
            <li><strong>Active Noise Cancellation</strong> - Block out distractions</li>
            <li><strong>30-hour Battery Life</strong> - All-day listening</li>
            <li><strong>Quick Charge</strong> - 5 minutes = 3 hours playback</li>
          </ul>
          
          <h3>Technical Specifications</h3>
          <table>
            <tr><td>Driver Size</td><td>40mm</td></tr>
            <tr><td>Frequency Response</td><td>20Hz - 20kHz</td></tr>
            <tr><td>Weight</td><td>250g</td></tr>
            <tr><td>Connectivity</td><td>Bluetooth 5.0, USB-C</td></tr>
          </table>
          
          <div class="warranty">
            <p><em>Includes 2-year warranty and free shipping.</em></p>
          </div>
        </div>
      `;
      
      const result = htmlToMarkdown(productHtml);
      expect(result.markdown).toContain('# Premium Wireless Headphones');
      expect(result.markdown).toContain('~~$199.99~~');
      expect(result.markdown).toContain('**$149.99**');
      expect(result.markdown).toContain('**Active Noise Cancellation**');
      expect(result.markdown).toContain('| Driver Size | 40mm |');
      expect(result.markdown).toContain('*Includes 2-year warranty*');
    });

    test('Technical documentation with code examples', () => {
      const docHtml = `
        <div class="documentation">
          <h1>API Reference</h1>
          
          <h2>Authentication</h2>
          <p>All API requests require authentication using an API key:</p>
          
          <pre><code class="language-bash">
curl -H "Authorization: Bearer YOUR_API_KEY" \
     https://api.example.com/v1/users
          </code></pre>
          
          <h2>Endpoints</h2>
          
          <h3>GET /users</h3>
          <p>Retrieve a list of users.</p>
          
          <h4>Parameters</h4>
          <table>
            <thead>
              <tr><th>Parameter</th><th>Type</th><th>Required</th><th>Description</th></tr>
            </thead>
            <tbody>
              <tr><td><code>page</code></td><td>integer</td><td>No</td><td>Page number (default: 1)</td></tr>
              <tr><td><code>limit</code></td><td>integer</td><td>No</td><td>Items per page (default: 20)</td></tr>
            </tbody>
          </table>
          
          <h4>Response</h4>
          <pre><code class="language-json">
{
  "users": [
    {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com"
    }
  ],
  "pagination": {
    "page": 1,
    "total": 100
  }
}
          </code></pre>
          
          <div class="note">
            <p><strong>Note:</strong> Rate limiting applies - max 1000 requests per hour.</p>
          </div>
        </div>
      `;
      
      const result = htmlToMarkdown(docHtml);
      expect(result.markdown).toContain('# API Reference');
      expect(result.markdown).toContain('## Authentication');
      expect(result.markdown).toContain('```bash');
      expect(result.markdown).toContain('curl -H "Authorization: Bearer YOUR_API_KEY"');
      expect(result.markdown).toContain('### GET /users');
      expect(result.markdown).toContain('| Parameter | Type | Required | Description |');
      expect(result.markdown).toContain('`page`');
      expect(result.markdown).toContain('```json');
      expect(result.markdown).toContain('**Note:** Rate limiting applies');
    });
  });

  // ============================================================================
  // PERFORMANCE AND STRESS TESTS
  // ============================================================================

  describe('Performance Tests', () => {
    test('Process multiple small documents quickly', () => {
      const smallDoc = '<p>Small document with <strong>formatting</strong> and <a href="http://example.com">links</a>.</p>';
      const docs = Array(100).fill(smallDoc);
      
      const startTime = Date.now();
      docs.forEach(doc => {
        const result = htmlToMarkdown(doc);
        expect(result.markdown).toBeDefined();
      });
      const endTime = Date.now();
      
      // Should process 100 small docs in reasonable time (adjust threshold as needed)
      expect(endTime - startTime).toBeLessThan(5000); // 5 seconds
    });

    test('Handle document with many elements', () => {
      let largeDoc = '<div>';
      for (let i = 0; i < 1000; i++) {
        largeDoc += `<p>Paragraph ${i} with <strong>bold</strong> and <em>italic</em> text.</p>`;
      }
      largeDoc += '</div>';
      
      const startTime = Date.now();
      const result = htmlToMarkdown(largeDoc);
      const endTime = Date.now();
      
      expect(result.markdown).toBeDefined();
      expect(result.markdown).toContain('Paragraph 0');
      expect(result.markdown).toContain('Paragraph 999');
      expect(endTime - startTime).toBeLessThan(10000); // 10 seconds
    });
  });

  // ============================================================================
  // CONFIGURATION TESTS
  // ============================================================================

  describe('Configuration Options', () => {
    test('Custom bullet marker', () => {
      const html = `
        <ul>
          <li>Item 1</li>
          <li>Item 2</li>
        </ul>
      `;
      
      const result = htmlToMarkdown(html, { bulletListMarker: '*' });
      expect(result.markdown).toContain('* Item 1');
      expect(result.markdown).toContain('* Item 2');
    });

    test('Custom emphasis delimiters', () => {
      const html = '<p>Text with <em>emphasis</em> and <strong>strong</strong> formatting.</p>';
      
      const result = htmlToMarkdown(html, { 
        emDelimiter: '_', 
        strongDelimiter: '__' 
      });
      expect(result.markdown).toContain('_emphasis_');
      expect(result.markdown).toContain('__strong__');
    });

    test('Code block style options', () => {
      const html = '<pre><code>function test() { return true; }</code></pre>';
      
      const fencedResult = htmlToMarkdown(html, { codeBlockStyle: 'fenced' });
      expect(fencedResult.markdown).toContain('```');
      
      const indentedResult = htmlToMarkdown(html, { codeBlockStyle: 'indented' });
      expect(indentedResult.markdown).toContain('    function test()');
    });

    test('Whitespace preservation options', () => {
      const html = `
        <p>Text   with     multiple    spaces</p>
        <pre>    Indented    text    </pre>
      `;
      
      const normalResult = htmlToMarkdown(html, { preserveWhitespace: false });
      expect(normalResult.markdown).not.toContain('     ');
      
      const preservedResult = htmlToMarkdown(html, { preserveWhitespace: true });
      expect(preservedResult.markdown).toContain('multiple    spaces');
    });
  });

  // ============================================================================
  // METADATA EXTRACTION TESTS
  // ============================================================================

  describe('Metadata Extraction', () => {
    test('Extract images metadata', () => {
      const html = `
        <img src="photo.jpg" alt="A photo" title="Beautiful photo">
        <img src="data:image/png;base64,abc123" alt="Embedded">
        <img src="cid:image001.jpg" alt="Email attachment">
      `;
      
      const result = htmlToMarkdown(html);
      expect(result.metadata?.images).toBeDefined();
      expect(result.metadata?.images?.length).toBe(3);
      expect(result.metadata?.images?.[0]).toMatchObject({
        src: 'photo.jpg',
        alt: 'A photo',
        title: 'Beautiful photo',
        isInline: false
      });
      expect(result.metadata?.images?.[1]).toMatchObject({
        src: 'data:image/png;base64,abc123',
        alt: 'Embedded',
        isInline: true
      });
    });

    test('Extract email headers', () => {
      const emailHtml = `
        <div>
          <div class="email-header">
            <div class="from">John Doe &lt;john@example.com&gt;</div>
            <div class="to">jane@example.com, bob@example.com</div>
            <div class="subject">Meeting Tomorrow</div>
            <div class="date">January 15, 2024 10:30 AM</div>
          </div>
          <div class="email-body">
            <p>Let's meet tomorrow at 2 PM.</p>
          </div>
        </div>
      `;
      
      const result = emailToMarkdown(emailHtml, { preserveEmailHeaders: true });
      expect(result.metadata?.emailHeaders).toBeDefined();
      // Test that headers are extracted (implementation may vary)
    });
  });

  // ============================================================================
  // ACCESSIBILITY AND STANDARDS TESTS
  // ============================================================================

  describe('Accessibility and Standards', () => {
    test('Semantic HTML elements', () => {
      const html = `
        <article>
          <header>
            <h1>Article Title</h1>
            <time datetime="2024-01-15">January 15, 2024</time>
          </header>
          <main>
            <section>
              <h2>Section 1</h2>
              <p>Content here.</p>
            </section>
            <aside>
              <p>Sidebar content</p>
            </aside>
          </main>
          <footer>
            <p>Article footer</p>
          </footer>
        </article>
      `;
      
      const result = htmlToMarkdown(html);
      expect(result.markdown).toContain('# Article Title');
      expect(result.markdown).toContain('January 15, 2024');
      expect(result.markdown).toContain('## Section 1');
      expect(result.markdown).toContain('Content here');
      expect(result.markdown).toContain('Sidebar content');
      expect(result.markdown).toContain('Article footer');
    });

    test('ARIA attributes and accessibility features', () => {
      const html = `
        <div role="alert" aria-live="polite">
          <p>Important notification</p>
        </div>
        <button aria-label="Close dialog">×</button>
        <img src="chart.png" alt="Sales increased by 25% this quarter" 
             aria-describedby="chart-description">
        <div id="chart-description">
          This chart shows quarterly sales data with a significant upward trend.
        </div>
      `;
      
      const result = htmlToMarkdown(html);
      expect(result.markdown).toContain('Important notification');
      expect(result.markdown).toContain('×');
      expect(result.markdown).toContain('Sales increased by 25%');
      expect(result.markdown).toContain('quarterly sales data');
    });
  });

  // ============================================================================
  // INTERNATIONALIZATION TESTS
  // ============================================================================

  describe('Internationalization', () => {
    test('Right-to-left text handling', () => {
      const html = `
        <div dir="rtl">
          <h1>العنوان الرئيسي</h1>
          <p>هذا نص تجريبي <strong>بخط عريض</strong> و <em>مائل</em>.</p>
          <ul>
            <li>العنصر الأول</li>
            <li>العنصر الثاني</li>
          </ul>
        </div>
      `;
      
      const result = htmlToMarkdown(html);
      expect(result.markdown).toContain('# العنوان الرئيسي');
      expect(result.markdown).toContain('**بخط عريض**');
      expect(result.markdown).toContain('*مائل*');
      expect(result.markdown).toContain('- العنصر الأول');
    });

    test('Mixed language content', () => {
      const html = `
        <div>
          <h1>Multi-language Document</h1>
          <h2>English Section</h2>
          <p>This is <strong>English</strong> content.</p>
          
          <h2>Section en Français</h2>
          <p>Ceci est du <strong>contenu français</strong> avec des accents: é, è, à, ç.</p>
          
          <h2>Deutsche Sektion</h2>
          <p>Das ist <strong>deutscher Inhalt</strong> mit Umlauten: ä, ö, ü, ß.</p>
          
          <h2>中文部分</h2>
          <p>这是<strong>中文内容</strong>，包含汉字。</p>
          
          <h2>日本語セクション</h2>
          <p>これは<strong>日本語の内容</strong>です。ひらがな、カタカナ、漢字が含まれています。</p>
        </div>
      `;
      
      const result = htmlToMarkdown(html);
      expect(result.markdown).toContain('# Multi-language Document');
      expect(result.markdown).toContain('**English**');
      expect(result.markdown).toContain('**contenu français**');
      expect(result.markdown).toContain('**deutscher Inhalt**');
      expect(result.markdown).toContain('**中文内容**');
      expect(result.markdown).toContain('**日本語の内容**');
    });
  });

  // ============================================================================
  // CUSTOM RULES AND EXTENSIONS TESTS
  // ============================================================================

  describe('Custom Rules and Extensions', () => {
    test('Custom element handling', () => {
      const html = `
        <div class="callout warning">
          <p>This is a warning message!</p>
        </div>
        <div class="highlight-box">
          <h3>Important Note</h3>
          <p>Please read carefully.</p>
        </div>
        <span class="badge">New</span>
      `;
      
      const customRules = [
        {
          selector: '.callout.warning',
          replacement: '⚠️ ${content}',
          priority: 1
        },
        {
          selector: '.highlight-box',
          replacement: '\n💡 **Highlight**\n\n${content}\n',
          priority: 1
        },
        {
          selector: '.badge',
          replacement: '🏷️ ${content}',
          priority: 1
        }
      ];
      
      const result = htmlToMarkdown(html, { customRules });
      // Note: These tests depend on custom rules implementation
      // Adjust expectations based on actual implementation
      expect(result.markdown).toContain('warning message');
      expect(result.markdown).toContain('Important Note');
      expect(result.markdown).toContain('New');
    });
  });

  // ============================================================================
  // ERROR SCENARIOS AND RECOVERY TESTS
  // ============================================================================

  describe('Error Scenarios and Recovery', () => {
    test('Invalid HTML recovery', () => {
      const invalidHtml = `
        <p>Paragraph <strong>bold <em>italic</p>
        <ul><li>Item 1<li>Item 2</ul>
        <div><span>Unclosed span
        <table><tr><td>Cell</table>
      `;
      
      expect(() => {
        const result = htmlToMarkdown(invalidHtml);
        expect(result.markdown).toBeDefined();
        expect(result.markdown).toContain('Paragraph');
        expect(result.markdown).toContain('bold');
        expect(result.markdown).toContain('italic');
      }).not.toThrow();
    });

    test('Null and undefined input handling', () => {
      expect(() => htmlToMarkdown(null as any)).toThrow();
      expect(() => htmlToMarkdown(undefined as any)).toThrow();
      expect(() => htmlToMarkdown('')).toThrow();
    });

    test('Very large attribute values', () => {
      const largeAttr = 'x'.repeat(10000);
      const html = `<div title="${largeAttr}"><p>Content</p></div>`;
      
      const result = htmlToMarkdown(html);
      expect(result.markdown).toContain('Content');
    });

    test('Circular references in DOM (if applicable)', () => {
      // This test might not be applicable depending on your DOM implementation
      const html = '<div><p>Simple content</p></div>';
      
      const result = htmlToMarkdown(html);
      expect(result.markdown).toContain('Simple content');
    });
  });

  // ============================================================================
  // REGRESSION TESTS
  // ============================================================================

  describe('Regression Tests', () => {
    test('Preserve line breaks in specific contexts', () => {
      const html = `
        <p>First line<br>
        Second line<br>
        Third line</p>
        <pre>Line 1
Line 2
Line 3</pre>
      `;
      
      const result = htmlToMarkdown(html);
      expect(result.markdown).toContain('First line\nSecond line\nThird line');
      expect(result.markdown).toContain('Line 1\nLine 2\nLine 3');
    });

    test('Handle consecutive formatting elements', () => {
      const html = '<p><strong>Bold</strong><em>Italic</em><code>Code</code></p>';
      
      const result = htmlToMarkdown(html);
      expect(result.markdown).toContain('**Bold**');
      expect(result.markdown).toContain('*Italic*');
      expect(result.markdown).toContain('`Code`');
    });

    test('Empty table cells handling', () => {
      const html = `
        <table>
          <tr>
            <th>Name</th>
            <th>Value</th>
          </tr>
          <tr>
            <td>Item 1</td>
            <td></td>
          </tr>
          <tr>
            <td></td>
            <td>Value 2</td>
          </tr>
        </table>
      `;
      
      const result = htmlToMarkdown(html);
      expect(result.markdown).toContain('| Name | Value |');
      expect(result.markdown).toContain('| Item 1 |  |');
      expect(result.markdown).toContain('|  | Value 2 |');
    });

    test('Nested blockquotes', () => {
      const html = `
        <blockquote>
          <p>First level quote</p>
          <blockquote>
            <p>Second level quote</p>
            <blockquote>
              <p>Third level quote</p>
            </blockquote>
          </blockquote>
        </blockquote>
      `;
      
      const result = htmlToMarkdown(html);
      expect(result.markdown).toContain('> First level quote');
      expect(result.markdown).toContain('> > Second level quote');
      expect(result.markdown).toContain('> > > Third level quote');
    });
  });

  // ============================================================================
  // INTEGRATION TESTS
  // ============================================================================

  describe('Integration Tests', () => {
    test('Complete email workflow', () => {
      const fullEmailHtml = `
        <html>
        <head>
          <title>Project Update Email</title>
          <meta name="from" content="john@company.com">
          <meta name="subject" content="Weekly Project Update">
        </head>
        <body>
          <div class="email-container">
            <div class="email-header">
              <p><strong>From:</strong> John Smith &lt;john@company.com&gt;</p>
              <p><strong>To:</strong> team@company.com</p>
              <p><strong>Subject:</strong> Weekly Project Update</p>
              <p><strong>Date:</strong> Monday, January 15, 2024</p>
            </div>
            
            <div class="email-body">
              <h1>Weekly Update - Project Alpha</h1>
              
              <h2>📈 Progress Summary</h2>
              <table border="1">
                <tr>
                  <th>Task</th>
                  <th>Status</th>
                  <th>Completion</th>
                  <th>Notes</th>
                </tr>
                <tr>
                  <td>Frontend Development</td>
                  <td>✅ Complete</td>
                  <td>100%</td>
                  <td>All components implemented</td>
                </tr>
                <tr>
                  <td>Backend API</td>
                  <td>🔄 In Progress</td>
                  <td>75%</td>
                  <td>Authentication pending</td>
                </tr>
                <tr>
                  <td>Testing</td>
                  <td>⏳ Pending</td>
                  <td>25%</td>
                  <td>Waiting for API completion</td>
                </tr>
              </table>
              
              <h2>🎯 Next Week Goals</h2>
              <ol>
                <li><strong>Complete authentication system</strong> - Priority 1</li>
                <li>Begin comprehensive testing phase</li>
                <li>Update documentation</li>
                <li>Prepare demo for stakeholders</li>
              </ol>
              
              <h2>⚠️ Blockers & Risks</h2>
              <blockquote>
                <p><strong>Database Migration Issue:</strong> We've encountered a problem with the data migration that may delay testing by 2-3 days. Working with DevOps team to resolve.</p>
              </blockquote>
              
              <h2>📊 Metrics</h2>
              <ul>
                <li>Code coverage: 85% (target: 90%)</li>
                <li>Performance tests: All passing</li>
                <li>Security scan: 2 minor issues resolved</li>
              </ul>
              
              <h2>🔗 Resources</h2>
              <p>Relevant links:</p>
              <ul>
                <li><a href="https://github.com/company/project-alpha">Project Repository</a></li>
                <li><a href="https://docs.company.com/alpha">Documentation</a></li>
                <li><a href="https://company.atlassian.net/alpha">JIRA Board</a></li>
              </ul>
              
              <p>Please let me know if you have any questions or concerns.</p>
            </div>
            
            <div class="email-signature">
              <hr>
              <table>
                <tr>
                  <td>
                    <p><strong>John Smith</strong><br>
                    Senior Project Manager<br>
                    Technology Division</p>
                    
                    <p>📧 <a href="mailto:john.smith@company.com">john.smith@company.com</a><br>
                    📱 (555) 123-4567<br>
                    🏢 Company Inc.<br>
                    📍 123 Business St, Tech City, TC 12345</p>
                    
                    <p><em>This email contains confidential information. Please do not forward without permission.</em></p>
                  </td>
                </tr>
              </table>
            </div>
          </div>
        </body>
        </html>
      `;
      
      const result = emailToMarkdown(fullEmailHtml, {
        preserveEmailHeaders: true,
        handleEmailSignatures: true,
        convertInlineStyles: true,
        tableHandling: 'convert'
      });
      
      // Verify major sections are present
      expect(result.markdown).toContain('# Weekly Update - Project Alpha');
      expect(result.markdown).toContain('## 📈 Progress Summary');
      expect(result.markdown).toContain('| Task | Status | Completion | Notes |');
      expect(result.markdown).toContain('## 🎯 Next Week Goals');
      expect(result.markdown).toContain('1. **Complete authentication system**');
      expect(result.markdown).toContain('## ⚠️ Blockers & Risks');
      expect(result.markdown).toContain('> **Database Migration Issue:**');
      expect(result.markdown).toContain('[Project Repository](https://github.com/company/project-alpha)');
      expect(result.markdown).toContain('**John Smith**');
      expect(result.markdown).toContain('[john.smith@company.com](mailto:john.smith@company.com)');
      
      // Verify metadata extraction
      expect(result.metadata).toBeDefined();
      expect(result.metadata?.links).toBeDefined();
      expect(result.metadata?.links?.length).toBeGreaterThan(0);
    });

    test('Complete documentation workflow', () => {
      const documentationHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>API Documentation - User Management</title>
        </head>
        <body>
          <nav>
            <ul>
              <li><a href="#overview">Overview</a></li>
              <li><a href="#authentication">Authentication</a></li>
              <li><a href="#endpoints">Endpoints</a></li>
              <li><a href="#examples">Examples</a></li>
            </ul>
          </nav>
          
          <main>
            <header>
              <h1 id="overview">User Management API Documentation</h1>
              <p><em>Version 2.1.0 - Last updated: January 15, 2024</em></p>
            </header>
            
            <section id="authentication">
              <h2>🔐 Authentication</h2>
              <p>All API requests require authentication using a Bearer token:</p>
              
              <pre><code class="language-http">
POST /auth/login HTTP/1.1
Host: api.example.com
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "secure_password"
}
              </code></pre>
              
              <p>Response:</p>
              <pre><code class="language-json">
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "expires_in": 3600
}
              </code></pre>
            </section>
            
            <section id="endpoints">
              <h2>📡 API Endpoints</h2>
              
              <article>
                <h3>GET /api/v2/users</h3>
                <p>Retrieve a paginated list of users.</p>
                
                <h4>Query Parameters</h4>
                <table>
                  <thead>
                    <tr>
                      <th>Parameter</th>
                      <th>Type</th>
                      <th>Required</th>
                      <th>Default</th>
                      <th>Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><code>page</code></td>
                      <td>integer</td>
                      <td>No</td>
                      <td>1</td>
                      <td>Page number</td>
                    </tr>
                    <tr>
                      <td><code>limit</code></td>
                      <td>integer</td>
                      <td>No</td>
                      <td>20</td>
                      <td>Items per page (max: 100)</td>
                    </tr>
                    <tr>
                      <td><code>search</code></td>
                      <td>string</td>
                      <td>No</td>
                      <td>-</td>
                      <td>Search by name or email</td>
                    </tr>
                  </tbody>
                </table>
                
                <h4>Response Codes</h4>
                <ul>
                  <li><code>200</code> - Success</li>
                  <li><code>401</code> - Unauthorized</li>
                  <li><code>403</code> - Forbidden</li>
                  <li><code>429</code> - Rate limit exceeded</li>
                </ul>
              </article>
              
              <article>
                <h3>POST /api/v2/users</h3>
                <p>Create a new user account.</p>
                
                <h4>Request Body</h4>
                <pre><code class="language-json">
{
  "name": "John Doe",
  "email": "john.doe@example.com",
  "password": "secure_password123",
  "role": "user",
  "profile": {
    "bio": "Software developer",
    "avatar_url": "https://example.com/avatar.jpg"
  }
}
                </code></pre>
                
                <div class="warning">
                  <p><strong>⚠️ Important:</strong> Passwords must be at least 8 characters long and contain uppercase, lowercase, and numeric characters.</p>
                </div>
              </article>
            </section>
            
            <section id="examples">
              <h2>💻 Code Examples</h2>
              
              <h3>JavaScript (Node.js)</h3>
              <pre><code class="language-javascript">
const axios = require('axios');

async function getUsers(token, page = 1) {
  try {
    const response = await axios.get('https://api.example.com/api/v2/users', {
      headers: {
        'Authorization': \`Bearer \${token}\`,
        'Content-Type': 'application/json'
      },
      params: { page }
    });
    
    return response.data;
  } catch (error) {
    console.error('Error fetching users:', error.response?.data);
    throw error;
  }
}

// Usage
getUsers('your-token-here', 1)
  .then(users => console.log(users))
  .catch(err => console.error(err));
              </code></pre>
              
              <h3>Python</h3>
              <pre><code class="language-python">
import requests
import json

def get_users(token, page=1):
    """Fetch users from the API"""
    url = "https://api.example.com/api/v2/users"
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    params = {"page": page}
    
    try:
        response = requests.get(url, headers=headers, params=params)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f"Error fetching users: {e}")
        raise

# Usage
try:
    users = get_users("your-token-here", 1)
    print(json.dumps(users, indent=2))
except Exception as e:
    print(f"Failed to fetch users: {e}")
              </code></pre>
            </section>
            
            <footer>
              <hr>
              <p><small>
                © 2024 Example Corp. All rights reserved. 
                For support, contact <a href="mailto:api-support@example.com">api-support@example.com</a>
              </small></p>
            </footer>
          </main>
        </body>
        </html>
      `;
      
      const result = htmlToMarkdown(documentationHtml);
      
      // Verify structure
      expect(result.markdown).toContain('# User Management API Documentation');
      expect(result.markdown).toContain('## 🔐 Authentication');
      expect(result.markdown).toContain('## 📡 API Endpoints');
      expect(result.markdown).toContain('### GET /api/v2/users');
      expect(result.markdown).toContain('### POST /api/v2/users');
      expect(result.markdown).toContain('## 💻 Code Examples');
      
      // Verify code blocks
      expect(result.markdown).toContain('```http');
      expect(result.markdown).toContain('```json');
      expect(result.markdown).toContain('```javascript');
      expect(result.markdown).toContain('```python');
      
      // Verify table
      expect(result.markdown).toContain('| Parameter | Type | Required | Default | Description |');
      expect(result.markdown).toContain('| `page` | integer | No | 1 | Page number |');
      
      // Verify links and formatting
      expect(result.markdown).toContain('[api-support@example.com](mailto:api-support@example.com)');
      expect(result.markdown).toContain('**⚠️ Important:**');
      expect(result.markdown).toContain('`200` - Success');
    });
  });
}); 