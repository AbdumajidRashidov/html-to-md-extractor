// tests/manual-test.ts

import { htmlToMarkdown, emailToMarkdown, HTMLToMarkdownExtractor, ConversionOptions } from '../src/index';

// Function to test any HTML you want
function testCustomHTML() {
  console.log('='.repeat(60));
  console.log('CUSTOM HTML TO MARKDOWN TESTER');
  console.log('='.repeat(60));

  // Test 1: Your custom HTML here
  const yourCustomHTML = `
    <div class="email-content">
      <h1>Welcome to Our Service!</h1>
      
      <p>Dear <strong>Valued Customer</strong>,</p>
      
      <p>We're excited to have you on board! Here's what you can expect:</p>
      
      <blockquote style="border-left: 3px solid #007cba; padding-left: 15px;">
        <p><em>"Exceptional service and support every step of the way."</em></p>
      </blockquote>
      
      <h2>Next Steps</h2>
      <ol>
        <li>Verify your email address</li>
        <li>Complete your profile</li>
        <li>Explore our features</li>
      </ol>
      
      <table style="border-collapse: collapse; width: 100%;">
        <tr style="background-color: #f5f5f5;">
          <th style="border: 1px solid #ddd; padding: 8px;">Feature</th>
          <th style="border: 1px solid #ddd; padding: 8px;">Benefit</th>
        </tr>
        <tr>
          <td style="border: 1px solid #ddd; padding: 8px;">Dashboard</td>
          <td style="border: 1px solid #ddd; padding: 8px;">Real-time insights</td>
        </tr>
        <tr>
          <td style="border: 1px solid #ddd; padding: 8px;">Reports</td>
          <td style="border: 1px solid #ddd; padding: 8px;">Detailed analytics</td>
        </tr>
      </table>
      
      <p>Need help? Contact us at <a href="mailto:support@company.com">support@company.com</a></p>
      
      <div class="signature">
        <p>Best regards,<br>
        <strong>The Support Team</strong><br>
        Company Name Inc.</p>
      </div>
    </div>
  `;

  console.log('\n📝 INPUT HTML:');
  console.log(yourCustomHTML);

  console.log('\n🔄 CONVERTING...');
  const result = emailToMarkdown(yourCustomHTML, {
    preserveEmailHeaders: true,
    handleEmailSignatures: true,
    convertInlineStyles: true,
    preserveEmailQuotes: true,
    tableHandling: 'convert',
    linkStyle: 'inlined'
  });

  console.log('\\n✅ OUTPUT MARKDOWN:');
  console.log(result.markdown);

  console.log('\\n📊 METADATA:');
  console.log(JSON.stringify(result.metadata, null, 2));

  // Test different configurations
  console.log('\\n' + '='.repeat(60));
  console.log('TESTING DIFFERENT CONFIGURATIONS');
  console.log('='.repeat(60));

  const configs = [
    {
      name: 'Minimal Config',
      options: {}
    },
    {
      name: 'Email Optimized',
      options: {
        handleEmailSignatures: true,
        convertInlineStyles: true,
        preserveEmailQuotes: true
      }
    },
    {
      name: 'Table Focused',
      options: {
        tableHandling: 'convert',
        linkStyle: 'referenced'
      }
    }
  ];

  configs.forEach(config => {
    console.log(`\n--- ${config.name} ---`);
    const testResult = htmlToMarkdown(yourCustomHTML, config.options as ConversionOptions);
    console.log(testResult.markdown.substring(0, 200) + '...');
  });
}

// Run the test
if (require.main === module) {
  testCustomHTML();
}

export { testCustomHTML };