// simple-test.js - Test your custom HTML easily
console.log('🚀 Simple HTML to Markdown Tester');
console.log('='.repeat(40));

// Your custom HTML goes here - modify this!
const YOUR_CUSTOM_HTML = `
<div class="email-container">
  <h1>🎉 Welcome Email</h1>
  
  <p>Hi <strong>John Doe</strong>,</p>
  
  <p>Welcome to our platform! Here's what you can do:</p>
  
  <ul>
    <li>✅ Create your first project</li>
    <li>📊 View your dashboard</li>
    <li>👥 Invite team members</li>
  </ul>
  
  <h2>Quick Stats</h2>
  <table border="1">
    <tr>
      <th>Feature</th>
      <th>Status</th>
      <th>Action</th>
    </tr>
    <tr>
      <td>Profile</td>
      <td style="color: green;">Complete</td>
      <td><a href="/profile">View</a></td>
    </tr>
    <tr>
      <td>First Project</td>
      <td style="color: orange;">Pending</td>
      <td><a href="/create">Create Now</a></td>
    </tr>
  </table>
  
  <blockquote style="border-left: 3px solid #007cba; padding-left: 15px;">
    <p><em>"Success is not final, failure is not fatal: it is the courage to continue that counts."</em></p>
  </blockquote>
  
  <h3>Need Help?</h3>
  <p>Contact us:</p>
  <ul>
    <li>📧 <a href="mailto:support@example.com">support@example.com</a></li>
    <li>💬 <a href="https://chat.example.com">Live Chat</a></li>
    <li>📚 <a href="https://docs.example.com">Documentation</a></li>
  </ul>
  
  <div class="signature">
    <p>Best regards,<br>
    <strong>Sarah Johnson</strong><br>
    Customer Success Manager<br>
    <a href="mailto:sarah@example.com">sarah@example.com</a></p>
    
    <p><small>Example Company | Making work easier since 2020</small></p>
  </div>
</div>
`;

// Test function
function testHTML(html, name = 'Custom HTML') {
  console.log(`\n📧 Testing: ${name}`);
  console.log('📝 Input HTML:');
  console.log(html.substring(0, 200) + '...');
  console.log(`\n(Full HTML is ${html.length} characters)`);
  
  try {
    const { emailToMarkdown } = require('./dist/index.js');
    
    const startTime = Date.now();
    const result = emailToMarkdown(html, {
      handleEmailSignatures: true,
      convertInlineStyles: true,
      preserveEmailQuotes: true,
      tableHandling: 'convert',
      linkStyle: 'inlined'
    });
    const endTime = Date.now();
    
    console.log('\n✅ CONVERSION SUCCESSFUL!');
    console.log(`⏱️  Time taken: ${endTime - startTime}ms`);
    console.log('\n📄 MARKDOWN OUTPUT:');
    console.log('-'.repeat(40));
    console.log(result.markdown);
    console.log('-'.repeat(40));
    
    if (result.metadata) {
      console.log('\n📊 METADATA:');
      console.log(`- Images found: ${result.metadata.images?.length || 0}`);
      console.log(`- Links found: ${result.metadata.links?.length || 0}`);
      if (result.metadata.links && result.metadata.links.length > 0) {
        console.log('  Links:');
        result.metadata.links.forEach((link, i) => {
          console.log(`    ${i + 1}. ${link.text} -> ${link.href}`);
        });
      }
      if (result.metadata.errors?.length) {
        console.log(`- Errors: ${result.metadata.errors.length}`);
        result.metadata.errors.forEach(error => console.log(`  • ${error}`));
      }
    }
    
  } catch (error) {
    console.log('\n❌ CONVERSION FAILED!');
    console.log('Error:', error.message);
    
    if (error.message.includes('Node is not defined')) {
      console.log('\n💡 Try running: node quick-patch.js');
    } else if (error.message.includes('Cannot find module')) {
      console.log('\n💡 Try running: npm run build');
    }
  }
}

// Test some predefined examples
const examples = [
  {
    name: 'Simple Email',
    html: '<div><h1>Hello</h1><p>Welcome to our <strong>service</strong>!</p></div>'
  },
  {
    name: 'Newsletter',
    html: `
      <div style="max-width: 600px;">
        <h1>Weekly Newsletter</h1>
        <p>Dear subscriber,</p>
        <h2>This Week's Highlights</h2>
        <ul>
          <li>New product launch</li>
          <li>Customer success story</li>
          <li>Upcoming webinar</li>
        </ul>
        <p>Best regards,<br>The Team</p>
      </div>
    `
  }
];

// Run tests
if (require.main === module) {
  // Test your custom HTML
  testHTML(YOUR_CUSTOM_HTML, 'Your Custom HTML');
  
  // Test predefined examples
  examples.forEach(example => {
    testHTML(example.html, example.name);
  });
  
  console.log('\n🎉 All tests completed!');
  console.log('\n💡 To test your own HTML:');
  console.log('1. Edit the YOUR_CUSTOM_HTML variable in this file');
  console.log('2. Run: node simple-test.js');
  console.log('3. Check the markdown output above');
}

module.exports = { testHTML, YOUR_CUSTOM_HTML };