// tests/fixtures/sample-emails.ts
export const GMAIL_EMAIL = `
<div dir="ltr">
  <div>Hi John,</div>
  <div><br></div>
  <div>Thanks for your message about the <b>quarterly report</b>. I've attached the latest version.</div>
  <div><br></div>
  <div>Key highlights:</div>
  <ul>
    <li>Revenue increased by 15%</li>
    <li>Customer satisfaction at 94%</li>
    <li>New product launch successful</li>
  </ul>
  <div><br></div>
  <div>Let me know if you have any questions.</div>
  <div><br></div>
  <div>Best regards,</div>
  <div>Sarah</div>
</div>
<div class="gmail_quote">
  <div dir="ltr" class="gmail_attr">
    On Tue, Jan 16, 2024 at 2:30 PM John Doe &lt;<a href="mailto:john@company.com">john@company.com</a>&gt; wrote:<br>
  </div>
  <blockquote class="gmail_quote" style="margin:0px 0px 0px 0.8ex;border-left:1px solid rgb(204,204,204);padding-left:1ex">
    <div dir="ltr">
      <div>Hi Sarah,</div>
      <div><br></div>
      <div>Could you please send me the quarterly report when you get a chance?</div>
      <div><br></div>
      <div>Thanks!</div>
    </div>
  </blockquote>
</div>
`;

export const OUTLOOK_EMAIL = `
<html xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
<meta http-equiv=Content-Type content="text/html; charset=utf-8">
<meta name=Generator content="Microsoft Word 15">
</head>
<body lang=EN-US link="#0563C1" vlink="#954F72">
<div class=WordSection1>
  <p class=MsoNormal>Dear Team,<o:p></o:p></p>
  <p class=MsoNormal><o:p>&nbsp;</o:p></p>
  <p class=MsoNormal>Please review the attached <b>project timeline</b> and provide your feedback by <span style='color:red'>Friday EOD</span>.<o:p></o:p></p>
  <p class=MsoNormal><o:p>&nbsp;</o:p></p>
  <table class=MsoTableGrid border=1 cellspacing=0 cellpadding=0>
    <tr>
      <td width=142 valign=top>
        <p class=MsoNormal><b>Phase</b><o:p></o:p></p>
      </td>
      <td width=142 valign=top>
        <p class=MsoNormal><b>Duration</b><o:p></o:p></p>
      </td>
      <td width=142 valign=top>
        <p class=MsoNormal><b>Owner</b><o:p></o:p></p>
      </td>
    </tr>
    <tr>
      <td width=142 valign=top>
        <p class=MsoNormal>Planning<o:p></o:p></p>
      </td>
      <td width=142 valign=top>
        <p class=MsoNormal>2 weeks<o:p></o:p></p>
      </td>
      <td width=142 valign=top>
        <p class=MsoNormal>Alice<o:p></o:p></p>
      </td>
    </tr>
  </table>
  <p class=MsoNormal><o:p>&nbsp;</o:p></p>
  <p class=MsoNormal>Best regards,<o:p></o:p></p>
  <p class=MsoNormal>Project Manager<o:p></o:p></p>
</div>
</body>
</html>
`;
export const COMPLEX_EMAIL_WITH_IMAGES = `
<div>
  <p>Please find our company overview below:</p>
  <table width="600" cellpadding="10" cellspacing="0" style="border:1px solid #ccc;">
    <tr>
      <td>
        <img src="cid:logo@company.com" alt="Company Logo" width="200">
      </td>
      <td>
        <h2>Company Name Inc.</h2>
        <p>Leading the industry since 2010</p>
      </td>
    </tr>
  </table>
  
  <h3>Our Services</h3>
  <div style="background-color: #f5f5f5; padding: 15px; margin: 10px 0;">
    <ul>
      <li><strong>Consulting</strong> - Expert advice for your business</li>
      <li><strong>Development</strong> - Custom software solutions</li>
      <li><strong>Support</strong> - 24/7 technical assistance</li>
    </ul>
  </div>
  
  <p>Contact us at <a href="mailto:info@company.com">info@company.com</a> or visit our website at <a href="https://company.com">company.com</a>.</p>
  
  <div class="signature">
    <p>--<br>
    John Smith<br>
    Sales Director<br>
    <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==" alt="Small signature image" width="16" height="16">
    Company Name Inc.<br>
    Phone: (555) 123-4567</p>
  </div>
</div>
`;
// examples/browser-usage.html
export const BROWSER_EXAMPLE = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>HTML to Markdown Converter - Browser Example</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .container { max-width: 1200px; margin: 0 auto; }
        .input-section, .output-section { margin-bottom: 20px; }
        textarea { width: 100%; height: 200px; font-family: monospace; }
        button { padding: 10px 20px; background: #007cba; color: white; border: none; cursor: pointer; }
        button:hover { background: #005a87; }
        .options { margin: 10px 0; }
        .options label { display: inline-block; margin-right: 15px; }
    </style>
</head>
<body>
    <div class="container">
        <h1>HTML to Markdown Converter</h1>
        
        <div class="input-section">
            <h2>HTML Input</h2>
            <textarea id="htmlInput" placeholder="Paste your HTML here...">
<div class="email-content">
    <h1>Welcome to Our Newsletter</h1>
    <p>This is a <strong>sample email</strong> with <em>various formatting</em>.</p>
    
    <h2>Key Features</h2>
    <ul>
        <li>Email-optimized conversion</li>
        <li>Table support</li>
        <li>Custom styling</li>
    </ul>
    
    <table border="1">
        <tr>
            <th>Feature</th>
            <th>Supported</th>
        </tr>
        <tr>
            <td>Headers</td>
            <td>✓</td>
        </tr>
        <tr>
            <td>Links</td>
            <td>✓</td>
        </tr>
    </table>
    
    <p>Visit our website at <a href="https://example.com">example.com</a></p>
    
    <div class="signature">
        <p>Best regards,<br>The Team</p>
    </div>
</div>
            </textarea>
            
            <div class="options">
                <h3>Conversion Options</h3>
                <label><input type="checkbox" id="emailMode" checked> Email Mode</label>
                <label><input type="checkbox" id="preserveHeaders" checked> Preserve Email Headers</label>
                <label><input type="checkbox" id="handleSignatures" checked> Handle Signatures</label>
                <label><input type="checkbox" id="convertStyles" checked> Convert Inline Styles</label>
                <label><input type="checkbox" id="preserveQuotes" checked> Preserve Quotes</label>
                <br>
                <label>Table Handling: 
                    <select id="tableHandling">
                        <option value="convert">Convert</option>
                        <option value="preserve">Preserve</option>
                        <option value="remove">Remove</option>
                    </select>
                </label>
                <label>Link Style: 
                    <select id="linkStyle">
                        <option value="inlined">Inlined</option>
                        <option value="referenced">Referenced</option>
                    </select>
                </label>
            </div>
            
            <button onclick="convertHTML()">Convert to Markdown</button>
        </div>
        
        <div class="output-section">
            <h2>Markdown Output</h2>
            <textarea id="markdownOutput" readonly></textarea>
            
            <h3>Metadata</h3>
            <pre id="metadataOutput"></pre>
            
            <button onclick="copyToClipboard()">Copy Markdown</button>
        </div>
    </div>

    <script type="module">
        import { HTMLToMarkdownExtractor, emailToMarkdown, htmlToMarkdown } from './dist/index.esm.js';
        
        window.convertHTML = function() {
            const html = document.getElementById('htmlInput').value;
            
            if (!html.trim()) {
                alert('Please enter some HTML to convert');
                return;
            }
            
            try {
                const options = {
                    preserveEmailHeaders: document.getElementById('preserveHeaders').checked,
                    handleEmailSignatures: document.getElementById('handleSignatures').checked,
                    convertInlineStyles: document.getElementById('convertStyles').checked,
                    preserveEmailQuotes: document.getElementById('preserveQuotes').checked,
                    tableHandling: document.getElementById('tableHandling').value,
                    linkStyle: document.getElementById('linkStyle').value
                };
                
                let result;
                if (document.getElementById('emailMode').checked) {
                    result = emailToMarkdown(html, options);
                } else {
                    result = htmlToMarkdown(html, options);
                }
                
                document.getElementById('markdownOutput').value = result.markdown;
                document.getElementById('metadataOutput').textContent = 
                    JSON.stringify(result.metadata, null, 2);
                    
            } catch (error) {
                alert('Conversion failed: ' + error.message);
                console.error('Conversion error:', error);
            }
        };
        
        window.copyToClipboard = function() {
            const output = document.getElementById('markdownOutput');
            output.select();
            document.execCommand('copy');
            alert('Markdown copied to clipboard!');
        };
        
        // Convert on page load
        convertHTML();
    </script>
</body>
</html>
`;

// examples/node-usage.js
export const NODE_EXAMPLE = `
const { HTMLToMarkdownExtractor, emailToMarkdown, htmlToMarkdown } = require('html-to-md-extractor');
const fs = require('fs');
const path = require('path');

// Example 1: Basic usage
function basicExample() {
    console.log('=== Basic HTML to Markdown Conversion ===');
    
    const html = \`
        <h1>Sample Document</h1>
        <p>This is a paragraph with <strong>bold</strong> and <em>italic</em> text.</p>
        <ul>
            <li>First item</li>
            <li>Second item</li>
        </ul>
        <a href="https://example.com">External link</a>
    \`;
    
    const result = htmlToMarkdown(html);
    console.log('Markdown output:');
    console.log(result.markdown);
    console.log('\\nMetadata:', result.metadata);
}

// Example 2: Email conversion
function emailExample() {
    console.log('\\n=== Email Conversion ===');
    
    const emailHtml = fs.readFileSync(path.join(__dirname, 'sample-email.html'), 'utf8');
    
    const result = emailToMarkdown(emailHtml, {
        preserveEmailHeaders: true,
        handleEmailSignatures: true,
        convertInlineStyles: true,
        tableHandling: 'convert'
    });
    
    console.log('Email converted to markdown:');
    console.log(result.markdown);
    
    if (result.metadata?.emailHeaders) {
        console.log('\\nEmail headers found:');
        console.log(result.metadata.emailHeaders);
    }
    
    if (result.metadata?.images?.length) {
        console.log('\\nImages found:', result.metadata.images.length);
    }
    
    if (result.metadata?.links?.length) {
        console.log('Links found:', result.metadata.links.length);
    }
}

// Example 3: Batch processing
async function batchProcessing() {
    console.log('\\n=== Batch Processing ===');
    
    const extractor = new HTMLToMarkdownExtractor({
        handleEmailSignatures: true,
        convertInlineStyles: true,
        tableHandling: 'convert',
        linkStyle: 'inlined'
    });
    
    const inputDir = './html-files';
    const outputDir = './markdown-files';
    
    // Ensure output directory exists
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }
    
    // Process all HTML files in input directory
    const files = fs.readdirSync(inputDir).filter(file => file.endsWith('.html'));
    
    for (const file of files) {
        try {
            const htmlContent = fs.readFileSync(path.join(inputDir, file), 'utf8');
            const result = extractor.convert(htmlContent);
            
            const outputFile = file.replace('.html', '.md');
            fs.writeFileSync(path.join(outputDir, outputFile), result.markdown);
            
            console.log(\`Converted \${file} -> \${outputFile}\`);
            
        } catch (error) {
            console.error(\`Failed to convert \${file}:\`, error.message);
        }
    }
}

// Example 4: Custom rules
function customRulesExample() {
    console.log('\\n=== Custom Rules Example ===');
    
    const customExtractor = new HTMLToMarkdownExtractor({
        customRules: [
            {
                selector: 'mark',
                replacement: '==\${content}==',
                priority: 1
            },
            {
                selector: '.warning',
                replacement: '⚠️ **Warning:** \${content}',
                priority: 2
            },
            {
                selector: '.info',
                replacement: (content, element, options) => {
                    const icon = element.getAttribute('data-icon') || 'ℹ️';
                    return \`\${icon} \${content}\`;
                },
                priority: 2
            }
        ]
    });
    
    const htmlWithCustomElements = \`
        <p>This text has <mark>highlighted content</mark>.</p>
        <div class="warning">This is a warning message!</div>
        <div class="info" data-icon="🔔">This is an info message with custom icon.</div>
    \`;
    
    const result = customExtractor.convert(htmlWithCustomElements);
    console.log('Custom rules output:');
    console.log(result.markdown);
}

// Example 5: Error handling and validation
function errorHandlingExample() {
    console.log('\\n=== Error Handling Example ===');
    
    const problematicHtml = \`
        <html>
            <body>
                <p>Unclosed paragraph
                <div>Nested content
                    <img src="broken-image.jpg" alt="Broken image">
                </div>
                <script>alert('This will be removed');</script>
            </body>
        </html>
    \`;
    
    try {
        const result = htmlToMarkdown(problematicHtml);
        console.log('Successfully converted problematic HTML:');
        console.log(result.markdown);
        
        if (result.metadata?.errors?.length) {
            console.log('\\nWarnings during conversion:');
            result.metadata.errors.forEach(error => console.log(\`- \${error}\`));
        }
        
    } catch (error) {
        console.error('Conversion failed:', error.message);
    }
}

// Run all examples
if (require.main === module) {
    basicExample();
    emailExample();
    batchProcessing();
    customRulesExample();
    errorHandlingExample();
}

module.exports = {
    basicExample,
    emailExample,
    batchProcessing,
    customRulesExample,
    errorHandlingExample
};
`;

// examples/sample-email.html
export const SAMPLE_EMAIL_FILE = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Sample Email</title>
</head>
<body>
    <div class="email-container">
        <div class="email-header">
            <p><strong>From:</strong> sarah.johnson@company.com</p>
            <p><strong>To:</strong> team@company.com</p>
            <p><strong>Subject:</strong> Quarterly Review Meeting</p>
            <p><strong>Date:</strong> January 15, 2024 at 2:30 PM</p>
        </div>
        
        <div class="email-body">
            <p>Hi Team,</p>
            
            <p>I hope this email finds you well. I wanted to reach out regarding our upcoming <strong>quarterly review meeting</strong> scheduled for next Friday.</p>
            
            <h2>Agenda Items</h2>
            <ol>
                <li>Q4 Performance Review</li>
                <li>Budget Planning for Q1</li>
                <li>New Project Initiatives</li>
                <li>Team Goal Setting</li>
            </ol>
            
            <h3>Required Documents</h3>
            <p>Please prepare the following documents before the meeting:</p>
            <ul>
                <li>Individual performance reports</li>
                <li>Project status updates</li>
                <li>Budget proposals</li>
            </ul>
            
            <table border="1" cellpadding="5" cellspacing="0">
                <thead>
                    <tr>
                        <th>Team Member</th>
                        <th>Presentation Time</th>
                        <th>Topic</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>Alice Johnson</td>
                        <td>10 minutes</td>
                        <td>Marketing Campaign Results</td>
                    </tr>
                    <tr>
                        <td>Bob Wilson</td>
                        <td>15 minutes</td>
                        <td>Product Development Update</td>
                    </tr>
                    <tr>
                        <td>Carol Davis</td>
                        <td>10 minutes</td>
                        <td>Customer Feedback Analysis</td>
                    </tr>
                </tbody>
            </table>
            
            <p>The meeting will be held in <em>Conference Room A</em> from <strong>9:00 AM to 11:00 AM</strong>.</p>
            
            <p>If you have any questions or concerns, please don't hesitate to reach out to me at <a href="mailto:sarah.johnson@company.com">sarah.johnson@company.com</a> or call me at <a href="tel:+15551234567">(555) 123-4567</a>.</p>
            
            <p>Looking forward to a productive meeting!</p>
        </div>
        
        <div class="email-signature">
            <p>Best regards,</p>
            <p><strong>Sarah Johnson</strong><br>
            Project Manager<br>
            Company Name Inc.<br>
            Phone: (555) 123-4567<br>
            Email: <a href="mailto:sarah.johnson@company.com">sarah.johnson@company.com</a></p>
        </div>
    </div>
</body>
</html>
`;
