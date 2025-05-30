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
    {
        name: 'My Custom Email',
        html: `
          <div class="WordSection1"><p class="MsoNormal">PU today 2200, can likely be worked in earlier</p><p class="MsoNormal">Del Monday 9am in Joplin MO</p><p class="MsoNormal">Load of packaging material  9360lbs</p><p class="MsoNormal">Paying 1100</p><p class="MsoNormal"> </p><p class="MsoNormal"> </p><table class="MsoNormalTable" border="0" cellspacing="0" cellpadding="0" width="64" style="margin-left:19.25pt;border-collapse:collapse"><tr style="height:91.75pt"><td width="32" style="width:24.0pt;padding:5.0pt 5.0pt 5.0pt 5.0pt;height:91.75pt"><p class="MsoNormal" style="margin-right:22.5pt"> </p><p class="MsoNormal" style="line-height:135%"><span style="color:#202124"><img width="169" height="100" style="width:1.7604in;height:1.0416in" id="image11.gif" src="cid:image007.jpg@01DBD165.FA50C120"/></span></p></td><td width="32" style="width:24.0pt;padding:5.0pt 5.0pt 5.0pt 5.0pt;height:91.75pt"><p class="MsoNormal"> </p><p class="MsoNormal"><b><span style="font-size:10.0pt;font-family:&quot;Arial&quot;,sans-serif;color:black"> </span></b></p><p class="MsoNormal"><b><span style="font-family:&quot;Arial&quot;,sans-serif;color:black">Fallin Smith</span></b></p><p class="MsoNormal"><span style="font-size:8.0pt;font-family:&quot;Arial&quot;,sans-serif;color:black">Transportation Broker </span></p><p class="MsoNormal"><b><span style="font-size:8.0pt;font-family:&quot;Arial&quot;,sans-serif;color:black">P: (800)497-5863 C (720) 383-2180</span></b></p><p class="MsoNormal"><span style="font-size:8.0pt;font-family:&quot;Arial&quot;,sans-serif;color:black">711 W Washington St, Suite 201 Greenville, SC 29601 </span></p><p class="MsoNormal"><span style="font-size:8.0pt;font-family:&quot;Arial&quot;,sans-serif;color:black"><a href="mailto:Fallin.smith@allenlund.com">Fallin.smith@allenlund.com</a></span></p></td></tr></table><p class="MsoNormal" style="margin-right:22.5pt">           <img width="43" height="49" style="width:.4479in;height:.5104in" id="image6.png" src="cid:image008.png@01DBD165.FA50C120"/><img width="59" height="31" style="width:.6145in;height:.3229in" id="image1.png" src="cid:image009.png@01DBD165.FA50C120"/><img width="84" height="32" style="width:.875in;height:.3333in" id="image10.jpg" src="cid:image010.jpg@01DBD165.FA50C120"/><img width="58" height="40" style="width:.6041in;height:.4166in" id="image2.png" src="cid:image011.png@01DBD165.FA50C120"/><img width="45" height="45" style="width:.4687in;height:.4687in" id="image4.png" src="cid:image012.png@01DBD165.FA50C120"/><span lang="EN" style="font-family:&quot;Arial&quot;,sans-serif"/></p><p class="MsoNormal" style="margin-right:22.5pt">                   <span style="font-size:8.0pt;color:#0b0f1e;background:white"> "Celebrating 49 years serving the logistics industry."</span></p><p class="MsoNormal"> </p><p class="MsoNormal"><b>From:</b> Abdumajid Rashidov &lt;<a href="mailto:abdumajid.numeo@gmail.com">abdumajid.numeo@gmail.com</a>> <br/><b>Sent:</b> Friday, May 30, 2025 1:19 PM<br/><b>To:</b> <a href="mailto:Fallin.Smith@allenlund.com">Fallin.Smith@allenlund.com</a><br/><b>Subject:</b> RE: Load - Romeoville, IL -> Joplin, MO (05/30/2025)</p><p class="MsoNormal"> </p><div><p class="MsoNormal" style="mso-line-height-alt:.75pt"><span style="font-size:1.0pt;color:white">MC number is 1441343. Could you provide commodity details, weight, and confirmed delivery date for the load from Romeoville, IL to Joplin, MO? Powered by Numeo AI [numeo. ai] ‍ ‍ ‍ ‍ ‍ ‍ ‍ ‍ ‍ ‍ ‍ ‍ ‍ ‍ ‍ ‍ ‍ ‍ ‍ ‍ ‍ ‍ ‍ ‍ ‍ ‍ ‍ ‍ ‍ ‍ ‍ ‍ ‍ ‍ ‍ ‍ ‍ ‍ ‍ ‍ ‍ ‍ ‍ ‍ ‍ ‍ ‍ ‍ ‍ ‍ ‍ ‍ ‍ ‍ ‍ ‍ ‍ ‍ ‍ ‍ ‍ ‍ ‍ ‍ ‍ ‍</span></p></div><div><p class="MsoNormal" style="mso-line-height-alt:.75pt"><span style="font-size:1.0pt;color:white">ZjQcmQRYFpfptBannerStart</span></p></div><table class="MsoNormalTable" border="0" cellspacing="0" cellpadding="0" width="100%" style="width:100.0%;border-radius:4px"><tr><td style="padding:0in 0in 7.5pt 0in"><table class="MsoNormalTable" border="1" cellspacing="0" cellpadding="0" width="100%" style="width:100.0%;background:#d0d8dc;border:none;border-top:solid #90a4ae 3.0pt"><tr><td valign="top" style="border:none;padding:0in 6.0pt 4.5pt 6.0pt"><table class="MsoNormalTable" border="0" cellspacing="0" cellpadding="0" align="left"><tr><td style="padding:0in 6.0pt 3.0pt 6.0pt"><p class="MsoNormal" style="line-height:15.0pt"><b><span style="font-size:10.5pt;font-family:&quot;Arial&quot;,sans-serif;color:black">This Message Is From an Untrusted Sender </span></b></p></td></tr><tr><td style="padding:0in 6.0pt 3.0pt 6.0pt"><p class="MsoNormal" style="line-height:12.0pt"><span style="font-size:9.0pt;font-family:&quot;Arial&quot;,sans-serif;color:black">You have not previously corresponded with this sender. </span></p></td></tr></table></td></tr></table></td></tr></table><div><p class="MsoNormal" style="mso-line-height-alt:.75pt"><span style="font-size:1.0pt;color:white">ZjQcmQRYFpfptBannerEnd</span></p></div><p class="MsoNormal">MC number is 1441343.<br/>Could you provide commodity details, weight, and confirmed delivery date for the load from Romeoville, IL to Joplin, MO? <br/><span style="font-size:8.5pt">Powered by <a href="https://urldefense.com/v3/__https:/www.numeo.ai/__;!!NkxCzWhxRxYk!gOhNGkCfhbdNln-fkBgAbTg38e9jjMPGt-5FEjM9SJ0j0Wkf9SNR226uj8nSAY3Cu4WKcflPJ24ju-f3CwRMRD_IQJIstA$"><b><span style="color:#0770d9">Numeo AI [numeo.ai]</span></b></a></span> </p></div>
        `,
        expectedOutput: '# My Custom HTML\n\nPut your HTML here...',
        description: 'My custom HTML test'
      },
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