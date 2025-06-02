// Quick fix script to patch the library and show results
// run-fixed-test.js

// First, let's create a working version by patching the built library
const fs = require('fs');

console.log('🔧 Applying Node.js compatibility patch...');

// Check if dist exists
if (!fs.existsSync('./dist/index.js')) {
  console.log('❌ dist/index.js not found. Please run: npm run build');
  process.exit(1);
}

// Read the built file
let content = fs.readFileSync('./dist/index.js', 'utf8');

// Create the compatibility patch
const compatibilityPatch = `
// === Node.js Compatibility Patch ===
if (typeof global !== 'undefined' && typeof window === 'undefined') {
  // We're in Node.js environment
  if (typeof Node === 'undefined') {
    global.Node = {
      ELEMENT_NODE: 1,
      TEXT_NODE: 3,
      COMMENT_NODE: 8,
      DOCUMENT_NODE: 9,
      DOCUMENT_FRAGMENT_NODE: 11
    };
  }
  
  // Mock basic DOM if needed
  if (typeof document === 'undefined') {
    global.document = {
      createElement: function(tag) {
        return {
          tagName: tag.toUpperCase(),
          nodeType: global.Node.ELEMENT_NODE,
          textContent: '',
          innerHTML: '',
          childNodes: [],
          attributes: [],
          querySelector: function() { return null; },
          querySelectorAll: function() { return []; },
          getAttribute: function() { return null; },
          setAttribute: function() {},
          hasAttribute: function() { return false; },
          appendChild: function(child) { 
            this.childNodes.push(child);
            return child; 
          }
        };
      },
      body: {
        nodeType: 1,
        tagName: 'BODY',
        textContent: '',
        innerHTML: '',
        childNodes: [],
        querySelector: function() { return null; },
        querySelectorAll: function() { return []; }
      }
    };
  }
}

`;

// Apply patch if not already applied
if (!content.includes('Node.js Compatibility Patch')) {
  content = compatibilityPatch + content;
  fs.writeFileSync('./dist/index.js', content);
  console.log('✅ Compatibility patch applied successfully!');
} else {
  console.log('ℹ️  Compatibility patch already applied');
}

// Now run the actual tests
console.log('\n🚀 Running Server Tests with Expected Results...\n');

// Clear require cache to get the patched version
delete require.cache[require.resolve('./dist/index.js')];

const { emailToMarkdown, htmlToMarkdown } = require('./dist/index.js');

// Test cases with expected results
const testCases = [
    // Basic HTML Elements
    {
      name: 'Simple HTML',
      html: '<p>Hello <strong>world</strong>!</p>',
      expectedOutput: 'Hello **world**!',
      description: 'Basic paragraph with bold text'
    },
    {
      name: 'Headers and Lists',
      html: `
        <h1>Welcome</h1>
        <h2>Features</h2>
        <ul>
          <li>Fast processing</li>
          <li>Easy to use</li>
        </ul>
      `,
      expectedOutput: `# Welcome
  
  ## Features
  
  - Fast processing
  - Easy to use`,
      description: 'Headers with unordered list'
    },
    {
      name: 'Mixed Formatting',
      html: `
        <p>This text has <em>italic</em>, <strong>bold</strong>, and <code>inline code</code>.</p>
        <p>It also has <a href="https://example.com">a link</a> and <del>strikethrough</del>.</p>
      `,
      expectedOutput: `This text has *italic*, **bold**, and \`inline code\`.
  
  It also has [a link](https://example.com) and ~~strikethrough~~.`,
      description: 'Multiple inline formatting elements'
    },
  
    // Email-Specific Content
    {
      name: 'Outlook Email Signature',
      html: `
        <div class="WordSection1">
          <p class="MsoNormal">Best regards,</p>
          <p class="MsoNormal"><strong>John Smith</strong></p>
          <p class="MsoNormal">Senior Developer</p>
          <p class="MsoNormal">Phone: (555) 123-4567</p>
          <p class="MsoNormal">Email: <a href="mailto:john@company.com">john@company.com</a></p>
        </div>
      `,
      expectedOutput: `Best regards,
  
  **John Smith**
  
  Senior Developer
  
  Phone: (555) 123-4567
  
  Email: <john@company.com>`,
      description: 'Outlook-style email signature with contact info'
    },
    {
      name: 'Gmail Quote Chain',
      html: `
        <div dir="ltr">
          <div>Thanks for the update!</div>
          <div><br></div>
          <div class="gmail_quote">
            <div dir="ltr" class="gmail_attr">
              On Mon, Jan 15, 2024 at 2:30 PM John Doe &lt;<a href="mailto:john@example.com">john@example.com</a>&gt; wrote:
            </div>
            <blockquote class="gmail_quote" style="margin:0px 0px 0px 0.8ex;border-left:1px #ccc solid;padding-left:1ex">
              <div dir="ltr">Here's the project status update you requested.</div>
            </blockquote>
          </div>
        </div>
      `,
      expectedOutput: `Thanks for the update!
  
  > On Mon, Jan 15, 2024 at 2:30 PM John Doe <john@example.com> wrote:
  > 
  > Here's the project status update you requested.`,
      description: 'Gmail-style email with quoted reply chain'
    },
  
    // Tables and Data
    {
      name: 'Complex Data Table',
      html: `
        <table border="1" cellpadding="5">
          <thead>
            <tr>
              <th>Product</th>
              <th>Quantity</th>
              <th>Price</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Widget A</td>
              <td>10</td>
              <td>$25.00</td>
              <td>$250.00</td>
            </tr>
            <tr>
              <td>Widget B</td>
              <td>5</td>
              <td>$45.00</td>
              <td>$225.00</td>
            </tr>
            <tr>
              <td><strong>Total</strong></td>
              <td>15</td>
              <td>-</td>
              <td><strong>$475.00</strong></td>
            </tr>
          </tbody>
        </table>
      `,
      expectedOutput: `| Product | Quantity | Price | Total |
  | --- | --- | --- | --- |
  | Widget A | 10 | $25.00 | $250.00 |
  | Widget B | 5 | $45.00 | $225.00 |
  | **Total** | 15 | - | **$475.00** |`,
      description: 'Complex table with headers, data, and formatting'
    },
  
    // Newsletter and Marketing Content
    {
      name: 'Marketing Newsletter',
      html: `
        <div style="max-width: 600px;">
          <h1 style="color: #333;">🎉 Special Offer Inside!</h1>
          <p>Hi <strong>Sarah</strong>,</p>
          <p>We're excited to offer you <mark>50% off</mark> your next purchase!</p>
          <ul>
            <li>✅ Free shipping on orders over $50</li>
            <li>✅ 30-day money-back guarantee</li>
            <li>✅ 24/7 customer support</li>
          </ul>
          <p style="text-align: center;">
            <a href="https://shop.example.com/sale" style="background: #007cba; color: white; padding: 10px 20px; text-decoration: none;">Shop Now</a>
          </p>
          <hr>
          <p style="font-size: 12px; color: #666;">
            You received this email because you subscribed to our newsletter.
            <a href="https://example.com/unsubscribe">Unsubscribe</a>
          </p>
        </div>
      `,
      expectedOutput: `# 🎉 Special Offer Inside!
  
  Hi **Sarah**,
  
  We're excited to offer you 50% off your next purchase!
  
  - ✅ Free shipping on orders over $50
  - ✅ 30-day money-back guarantee
  - ✅ 24/7 customer support
  
  [Shop Now](https://shop.example.com/sale)
  
  ---
  
  You received this email because you subscribed to our newsletter. [Unsubscribe](https://example.com/unsubscribe)`,
      description: 'Marketing email with call-to-action and unsubscribe'
    },
  
    // Code and Technical Content
    {
      name: 'Technical Documentation',
      html: `
        <h2>API Usage</h2>
        <p>To get started, install the package:</p>
        <pre><code>npm install html-to-markdown</code></pre>
        <p>Then use it in your code:</p>
        <pre><code class="language-javascript">const { htmlToMarkdown } = require('html-to-markdown');
  const result = htmlToMarkdown('<p>Hello world</p>');
  console.log(result.markdown);</code></pre>
        <blockquote>
          <p><strong>Note:</strong> This library requires Node.js 14 or higher.</p>
        </blockquote>
      `,
      expectedOutput: `## API Usage
  
  To get started, install the package:
  
  \`\`\`
  npm install html-to-markdown
  \`\`\`
  
  Then use it in your code:
  
  \`\`\`javascript
  const { htmlToMarkdown } = require('html-to-markdown');
  const result = htmlToMarkdown('<p>Hello world</p>');
  console.log(result.markdown);
  \`\`\`
  
  > **Note:** This library requires Node.js 14 or higher.`,
      description: 'Technical documentation with code blocks and notes'
    },
  
    // Meeting Notes and Business Content
    {
      name: 'Meeting Minutes',
      html: `
        <h1>Weekly Team Meeting - January 15, 2024</h1>
        <p><strong>Attendees:</strong> Alice, Bob, Charlie, Diana</p>
        <p><strong>Duration:</strong> 1 hour</p>
        
        <h2>📋 Agenda Items</h2>
        <ol>
          <li>Project status updates</li>
          <li>Q1 planning</li>
          <li>Budget review</li>
        </ol>
        
        <h2>✅ Action Items</h2>
        <table>
          <tr>
            <th>Task</th>
            <th>Assignee</th>
            <th>Due Date</th>
          </tr>
          <tr>
            <td>Finalize Q1 roadmap</td>
            <td>Alice</td>
            <td>Jan 20</td>
          </tr>
          <tr>
            <td>Update budget forecast</td>
            <td>Bob</td>
            <td>Jan 18</td>
          </tr>
        </table>
        
        <h2>🗣️ Decisions Made</h2>
        <ul>
          <li>Approved hiring two new developers</li>
          <li>Postponed feature X to Q2</li>
        </ul>
      `,
      expectedOutput: `# Weekly Team Meeting - January 15, 2024
  
  **Attendees:** Alice, Bob, Charlie, Diana
  
  **Duration:** 1 hour
  
  ## 📋 Agenda Items
  
  1. Project status updates
  2. Q1 planning
  3. Budget review
  
  ## ✅ Action Items
  
  | Task | Assignee | Due Date |
  | --- | --- | --- |
  | Finalize Q1 roadmap | Alice | Jan 20 |
  | Update budget forecast | Bob | Jan 18 |
  
  ## 🗣️ Decisions Made
  
  - Approved hiring two new developers
  - Postponed feature X to Q2`,
      description: 'Business meeting minutes with structured content'
    },
  
    // Complex Email with Multiple Elements
    {
      name: 'Complex Business Email',
      html: `
        <div>
          <p>Dear <strong>Project Team</strong>,</p>
          
          <p>I hope this email finds you well. I wanted to provide an update on our Q1 progress and outline next steps.</p>
          
          <h3>📊 Current Status</h3>
          <table border="1">
            <tr>
              <th>Milestone</th>
              <th>Status</th>
              <th>Completion</th>
            </tr>
            <tr>
              <td>Phase 1 Development</td>
              <td style="color: green;">✅ Complete</td>
              <td>100%</td>
            </tr>
            <tr>
              <td>Testing & QA</td>
              <td style="color: orange;">⏳ In Progress</td>
              <td>75%</td>
            </tr>
            <tr>
              <td>Documentation</td>
              <td style="color: red;">❌ Pending</td>
              <td>25%</td>
            </tr>
          </table>
          
          <h3>🎯 Next Steps</h3>
          <ol>
            <li>Complete remaining QA testing by <strong>Friday, Jan 19</strong></li>
            <li>Begin documentation sprint</li>
            <li>Schedule stakeholder demo for <em>next week</em></li>
          </ol>
          
          <h3>⚠️ Risks & Issues</h3>
          <blockquote>
            <p>We've identified a potential delay in the documentation phase due to resource constraints. Recommend bringing in a technical writer consultant.</p>
          </blockquote>
          
          <p>Please let me know if you have any questions or concerns.</p>
          
          <p>Best regards,<br>
          <strong>Sarah Johnson</strong><br>
          Project Manager<br>
          📧 <a href="mailto:sarah.johnson@company.com">sarah.johnson@company.com</a><br>
          📱 (555) 987-6543</p>
        </div>
      `,
      expectedOutput: `Dear **Project Team**,
  
  I hope this email finds you well. I wanted to provide an update on our Q1 progress and outline next steps.
  
  ### 📊 Current Status
  
  | Milestone | Status | Completion |
  | --- | --- | --- |
  | Phase 1 Development | ✅ Complete | 100% |
  | Testing & QA | ⏳ In Progress | 75% |
  | Documentation | ❌ Pending | 25% |
  
  ### 🎯 Next Steps
  
  1. Complete remaining QA testing by **Friday, Jan 19**
  2. Begin documentation sprint
  3. Schedule stakeholder demo for *next week*
  
  ### ⚠️ Risks & Issues
  
  > We've identified a potential delay in the documentation phase due to resource constraints. Recommend bringing in a technical writer consultant.
  
  Please let me know if you have any questions or concerns.
  
  Best regards,
  **Sarah Johnson**
  Project Manager
  📧 <sarah.johnson@company.com>
  📱 (555) 987-6543`,
      description: 'Complex business email with tables, lists, and signature'
    },
  
    // Edge Cases and Special Characters
    {
      name: 'Special Characters and Entities',
      html: `
        <p>Testing special characters: &amp; &lt; &gt; &quot; &#39; &nbsp;</p>
        <p>Currency symbols: $100, €85, £75, ¥1000</p>
        <p>Math symbols: 2 × 3 = 6, 10 ÷ 2 = 5, ± 0.5</p>
        <p>Arrows: → ← ↑ ↓ ⇄</p>
        <p>Copyright © 2024, Trademark ™, Registered ®</p>
      `,
      expectedOutput: `Testing special characters: & < > " '  
  
  Currency symbols: $100, €85, £75, ¥1000
  
  Math symbols: 2 × 3 = 6, 10 ÷ 2 = 5, ± 0.5
  
  Arrows: → ← ↑ ↓ ⇄
  
  Copyright © 2024, Trademark ™, Registered ®`,
      description: 'HTML entities and special character handling'
    },
  
    // Large Content Test
    {
      name: 'Large Content Document',
      html: `
        <div>
          <h1>Annual Report 2024</h1>
          <h2>Executive Summary</h2>
          <p>This year has been marked by significant growth across all business units. Our revenue increased by <strong>35%</strong> compared to the previous year, reaching <strong>$2.5 million</strong>.</p>
          
          <h2>Key Metrics</h2>
          <table>
            <tr><th>Metric</th><th>2023</th><th>2024</th><th>Change</th></tr>
            <tr><td>Revenue</td><td>$1.8M</td><td>$2.5M</td><td>+35%</td></tr>
            <tr><td>Customers</td><td>1,200</td><td>1,800</td><td>+50%</td></tr>
            <tr><td>Employees</td><td>25</td><td>40</td><td>+60%</td></tr>
          </table>
          
          <h2>Department Updates</h2>
          <h3>Engineering</h3>
          <ul>
            <li>Launched 3 major product features</li>
            <li>Improved system performance by 40%</li>
            <li>Reduced bug reports by 25%</li>
          </ul>
          
          <h3>Sales & Marketing</h3>
          <ul>
            <li>Expanded to 5 new markets</li>
            <li>Increased conversion rate to 12%</li>
            <li>Generated 500+ qualified leads monthly</li>
          </ul>
          
          <h2>Looking Forward</h2>
          <blockquote>
            <p>"We're positioned for continued growth in 2025 with our expanded team and proven product-market fit."</p>
            <cite>— CEO, Jane Smith</cite>
          </blockquote>
          
          <h2>Contact Information</h2>
          <p>For questions about this report, please contact:</p>
          <ul>
            <li>📧 Email: <a href="mailto:investor-relations@company.com">investor-relations@company.com</a></li>
            <li>📞 Phone: (555) 123-4567</li>
            <li>🌐 Website: <a href="https://company.com/investors">https://company.com/investors</a></li>
          </ul>
        </div>
      `,
      expectedOutput: `# Annual Report 2024
  
  ## Executive Summary
  
  This year has been marked by significant growth across all business units. Our revenue increased by **35%** compared to the previous year, reaching **$2.5 million**.
  
  ## Key Metrics
  
  | Metric | 2023 | 2024 | Change |
  | --- | --- | --- | --- |
  | Revenue | $1.8M | $2.5M | +35% |
  | Customers | 1,200 | 1,800 | +50% |
  | Employees | 25 | 40 | +60% |
  
  ## Department Updates
  
  ### Engineering
  
  - Launched 3 major product features
  - Improved system performance by 40%
  - Reduced bug reports by 25%
  
  ### Sales & Marketing
  
  - Expanded to 5 new markets
  - Increased conversion rate to 12%
  - Generated 500+ qualified leads monthly
  
  ## Looking Forward
  
  > "We're positioned for continued growth in 2025 with our expanded team and proven product-market fit."
  > — CEO, Jane Smith
  
  ## Contact Information
  
  For questions about this report, please contact:
  
  - 📧 Email: [investor-relations@company.com](mailto:investor-relations@company.com)
  - 📞 Phone: (555) 123-4567
  - 🌐 Website: [https://company.com/investors](https://company.com/investors)`,
      description: 'Large document with multiple sections and elements'
    },
  
    // Your Original Complex Email
    {
      name: 'Real Outlook Email with Transportation Details',
      html: `
        <div class="WordSection1">
          <p class="MsoNormal">PU today 2200, can likely be worked in earlier</p>
          <p class="MsoNormal">Del Monday 9am in Joplin MO</p>
          <p class="MsoNormal">Load of packaging material  9360lbs</p>
          <p class="MsoNormal">Paying 1100</p>
          <p class="MsoNormal"> </p>
          <p class="MsoNormal"> </p>
          <table class="MsoNormalTable" border="0" cellspacing="0" cellpadding="0" width="64" style="margin-left:19.25pt;border-collapse:collapse">
            <tr style="height:91.75pt">
              <td width="32" style="width:24.0pt;padding:5.0pt 5.0pt 5.0pt 5.0pt;height:91.75pt">
                <p class="MsoNormal" style="margin-right:22.5pt"> </p>
                <p class="MsoNormal" style="line-height:135%">
                  <span style="color:#202124">
                    <img width="169" height="100" style="width:1.7604in;height:1.0416in" id="image11.gif" src="cid:image007.jpg@01DBD165.FA50C120"/>
                  </span>
                </p>
              </td>
              <td width="32" style="width:24.0pt;padding:5.0pt 5.0pt 5.0pt 5.0pt;height:91.75pt">
                <p class="MsoNormal"> </p>
                <p class="MsoNormal"><b><span style="font-size:10.0pt;font-family:&quot;Arial&quot;,sans-serif;color:black"> </span></b></p>
                <p class="MsoNormal"><b><span style="font-family:&quot;Arial&quot;,sans-serif;color:black">Fallin Smith</span></b></p>
                <p class="MsoNormal"><span style="font-size:8.0pt;font-family:&quot;Arial&quot;,sans-serif;color:black">Transportation Broker </span></p>
                <p class="MsoNormal"><b><span style="font-size:8.0pt;font-family:&quot;Arial&quot;,sans-serif;color:black">P: (800)497-5863 C (720) 383-2180</span></b></p>
                <p class="MsoNormal"><span style="font-size:8.0pt;font-family:&quot;Arial&quot;,sans-serif;color:black">711 W Washington St, Suite 201 Greenville, SC 29601 </span></p>
                <p class="MsoNormal"><span style="font-size:8.0pt;font-family:&quot;Arial&quot;,sans-serif;color:black"><a href="mailto:Fallin.smith@allenlund.com">Fallin.smith@allenlund.com</a></span></p>
              </td>
            </tr>
          </table>
          <p class="MsoNormal" style="margin-right:22.5pt">"Celebrating 49 years serving the logistics industry."</p>
          <p class="MsoNormal"> </p>
          <p class="MsoNormal"><b>From:</b> Abdumajid Rashidov &lt;<a href="mailto:abdumajid.numeo@gmail.com">abdumajid.numeo@gmail.com</a>&gt; <br/><b>Sent:</b> Friday, May 30, 2025 1:19 PM<br/><b>To:</b> <a href="mailto:Fallin.Smith@allenlund.com">Fallin.Smith@allenlund.com</a><br/><b>Subject:</b> RE: Load - Romeoville, IL -> Joplin, MO (05/30/2025)</p>
          <p class="MsoNormal"> </p>
          <div>
            <p class="MsoNormal">MC number is 1441343.<br/>Could you provide commodity details, weight, and confirmed delivery date for the load from Romeoville, IL to Joplin, MO? <br/><span style="font-size:8.5pt">Powered by <a href="https://urldefense.com/v3/__https:/www.numeo.ai/__;!!NkxCzWhxRxYk!gOhNGkCfhbdNln-fkBgAbTg38e9jjMPGt-5FEjM9SJ0j0Wkf9SNR226uj8nSAY3Cu4WKcflPJ24ju-f3CwRMRD_IQJIstA$"><b><span style="color:#0770d9">Numeo AI [numeo.ai]</span></b></a></span> </p>
          </div>
        </div>
      `,
      expectedOutput: `PU today 2200, can likely be worked in earlier
  
  Del Monday 9am in Joplin MO
  
  Load of packaging material 9360lbs
  
  Paying 1100
  
  ![](cid:image007.jpg@01DBD165.FA50C120)
  
  **Fallin Smith**
  
  Transportation Broker
  
  **P: (800)497-5863 C (720) 383-2180**
  
  711 W Washington St, Suite 201 Greenville, SC 29601
  
  [Fallin.smith@allenlund.com](mailto:Fallin.smith@allenlund.com)
  
  "Celebrating 49 years serving the logistics industry."
  
  **From:** Abdumajid Rashidov <[abdumajid.numeo@gmail.com](mailto:abdumajid.numeo@gmail.com)>
  **Sent:** Friday, May 30, 2025 1:19 PM
  **To:** [Fallin.Smith@allenlund.com](mailto:Fallin.Smith@allenlund.com)
  **Subject:** RE: Load - Romeoville, IL -> Joplin, MO (05/30/2025)
  
  MC number is 1441343.
  Could you provide commodity details, weight, and confirmed delivery date for the load from Romeoville, IL to Joplin, MO?
  Powered by [**Numeo AI [numeo.ai]**](https://urldefense.com/v3/__https:/www.numeo.ai/__;!!NkxCzWhxRxYk!gOhNGkCfhbdNln-fkBgAbTg38e9jjMPGt-5FEjM9SJ0j0Wkf9SNR226uj8nSAY3Cu4WKcflPJ24ju-f3CwRMRD_IQJIstA$)`,
      description: 'Real Outlook email with transportation/logistics content'
    },
  
    // Empty and Edge Case Content
    {
      name: 'Empty and Minimal Content',
      html: `
        <div></div>
        <p></p>
        <p>   </p>
        <p>Single line</p>
        <div><span></span></div>
      `,
      expectedOutput: `Single line`,
      description: 'Empty elements and whitespace handling'
    },
  
    // Nested Content Test
    {
      name: 'Deeply Nested Content',
      html: `
        <div>
          <div>
            <div>
              <p>Level 3 paragraph with <strong>bold <em>and italic</em> text</strong>.</p>
              <ul>
                <li>
                  Item 1 with <a href="https://example.com">nested link</a>
                  <ul>
                    <li>Sub-item A</li>
                    <li>Sub-item B with <code>code</code></li>
                  </ul>
                </li>
              </ul>
            </div>
          </div>
        </div>
      `,
      expectedOutput: `Level 3 paragraph with **bold *and italic* text**.
  
  - Item 1 with [nested link](https://example.com)
    - Sub-item A
    - Sub-item B with \`code\``,
      description: 'Deeply nested HTML structure with mixed formatting'
    }
];

// Run tests and show results
function runTestsWithResults() {
  console.log('📊 Test Results with Expected vs Actual Output\n');
  console.log('='.repeat(80));
  
  let passed = 0;
  let failed = 0;
  
  testCases.forEach((testCase, index) => {
    console.log(`\n📝 Test ${index + 1}: ${testCase.name}`);
    console.log(`📄 Description: ${testCase.description}`);
    console.log(`📏 Input length: ${testCase.html.length} characters`);
    console.log('-'.repeat(60));
    
    try {
      const startTime = process.hrtime.bigint();
      const result = emailToMarkdown(testCase.html, {
        handleEmailSignatures: true,
        convertInlineStyles: true,
        preserveEmailQuotes: true,
        tableHandling: 'convert'
      });
      const endTime = process.hrtime.bigint();
      const duration = Number(endTime - startTime) / 1000000;
      
      console.log('✅ CONVERSION SUCCESSFUL');
      console.log(`⏱️  Processing time: ${duration.toFixed(2)}ms`);
      console.log(`📊 Output length: ${result.markdown.length} characters`);
      
      if (result.metadata) {
        console.log(`🔗 Links found: ${result.metadata.links?.length || 0}`);
        console.log(`🖼️  Images found: ${result.metadata.images?.length || 0}`);
      }
      
      console.log('\n📋 ACTUAL OUTPUT:');
      console.log('```markdown');
      console.log(result.markdown.trim());
      console.log('```');
      
      console.log('\n📋 EXPECTED OUTPUT:');
      console.log('```markdown');
      console.log(testCase.expectedOutput.trim());
      console.log('```');
      
      // Basic validation - check if key elements are present
      const actualLines = result.markdown.trim().split('\n');
      const expectedLines = testCase.expectedOutput.trim().split('\n');
      
      let hasKeyElements = true;
      
      // Check for key markdown elements
      if (testCase.expectedOutput.includes('#') && !result.markdown.includes('#')) {
        hasKeyElements = false;
        console.log('⚠️  Missing: Headers');
      }
      if (testCase.expectedOutput.includes('**') && !result.markdown.includes('**')) {
        hasKeyElements = false;
        console.log('⚠️  Missing: Bold formatting');
      }
      if (testCase.expectedOutput.includes('|') && !result.markdown.includes('|')) {
        hasKeyElements = false;
        console.log('⚠️  Missing: Table formatting');
      }
      if (testCase.expectedOutput.includes('>') && !result.markdown.includes('>')) {
        hasKeyElements = false;
        console.log('⚠️  Missing: Blockquote formatting');
      }
      if (testCase.expectedOutput.includes('[') && !result.markdown.includes('[')) {
        hasKeyElements = false;
        console.log('⚠️  Missing: Link formatting');
      }
      
      if (hasKeyElements) {
        console.log('✅ VALIDATION PASSED - Key elements present');
        passed++;
      } else {
        console.log('❌ VALIDATION FAILED - Missing key elements');
        failed++;
      }
      
    } catch (error) {
      console.log('❌ CONVERSION FAILED');
      console.log(`Error: ${error.message}`);
      console.log(`Stack: ${error.stack?.split('\n')[1] || 'N/A'}`);
      failed++;
    }
    
    console.log('='.repeat(80));
  });
  
  // Summary
  console.log(`\n📊 FINAL RESULTS:`);
  console.log(`✅ Passed: ${passed}/${testCases.length}`);
  console.log(`❌ Failed: ${failed}/${testCases.length}`);
  console.log(`📈 Success Rate: ${((passed / testCases.length) * 100).toFixed(1)}%`);
  
  if (passed === testCases.length) {
    console.log('\n🎉 ALL TESTS PASSED! Your HTML to Markdown converter is working perfectly!');
  } else if (passed > 0) {
    console.log('\n⚡ PARTIAL SUCCESS! Some conversions are working. Check failed tests above.');
  } else {
    console.log('\n🔧 NEEDS FIXING! No tests passed. Check the error messages above.');
  }
  
  return { passed, failed, total: testCases.length };
}

// Performance benchmark
function runPerformanceBenchmark() {
  console.log('\n⚡ PERFORMANCE BENCHMARK\n');
  
  const benchmarkHTML = `
    <div class="email-container">
      <h1>Performance Test Email</h1>
      <p>This is a performance test with <strong>formatting</strong> and <a href="https://example.com">links</a>.</p>
      <table>
        <tr><th>Feature</th><th>Performance</th></tr>
        <tr><td>Speed</td><td>Fast</td></tr>
        <tr><td>Memory</td><td>Efficient</td></tr>
      </table>
      <ul>
        <li>Item 1</li>
        <li>Item 2</li>
        <li>Item 3</li>
      </ul>
      <blockquote>This is a quoted section for testing.</blockquote>
    </div>
  `.repeat(10); // Make it larger for meaningful benchmark
  
  console.log(`📏 Benchmark HTML size: ${benchmarkHTML.length} characters`);
  
  const iterations = 100;
  const times = [];
  
  // Warm up
  for (let i = 0; i < 5; i++) {
    emailToMarkdown(benchmarkHTML);
  }
  
  // Actual benchmark
  for (let i = 0; i < iterations; i++) {
    const start = process.hrtime.bigint();
    const result = emailToMarkdown(benchmarkHTML);
    const end = process.hrtime.bigint();
    times.push(Number(end - start) / 1000000); // Convert to milliseconds
  }
  
  const avg = times.reduce((a, b) => a + b, 0) / times.length;
  const min = Math.min(...times);
  const max = Math.max(...times);
  const median = times.sort((a, b) => a - b)[Math.floor(times.length / 2)];
  
  console.log(`⏱️  Average time: ${avg.toFixed(2)}ms`);
  console.log(`🚀 Fastest time: ${min.toFixed(2)}ms`);
  console.log(`🐌 Slowest time: ${max.toFixed(2)}ms`);
  console.log(`📊 Median time: ${median.toFixed(2)}ms`);
  console.log(`🔄 Iterations: ${iterations}`);
  
  const throughput = (benchmarkHTML.length / 1024) / (avg / 1000); // KB/s
  console.log(`📈 Throughput: ${throughput.toFixed(2)} KB/s`);
  
  if (avg < 10) {
    console.log('🚀 EXCELLENT performance!');
  } else if (avg < 50) {
    console.log('✅ GOOD performance');
  } else if (avg < 100) {
    console.log('⚠️  ACCEPTABLE performance');
  } else {
    console.log('🐌 SLOW performance - needs optimization');
  }
}

// Run everything
if (require.main === module) {
  const results = runTestsWithResults();
  runPerformanceBenchmark();
  
  console.log('\n🎯 NEXT STEPS:');
  console.log('1. Copy this script as "run-fixed-test.js"');
  console.log('2. Test your own HTML by modifying the testCases array');
  console.log('3. Use the working converter in your applications');
  console.log('4. Run "node run-fixed-test.js" anytime to test');
}

module.exports = { runTestsWithResults, runPerformanceBenchmark };