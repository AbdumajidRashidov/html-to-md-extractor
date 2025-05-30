// quick-patch.js - Patches the built library for immediate testing
const fs = require('fs');
const path = require('path');

console.log('🔧 Patching built library for Node.js compatibility...');

// Check if dist directory exists
if (!fs.existsSync('./dist')) {
  console.log('❌ dist directory not found. Run: npm run build');
  process.exit(1);
}

// Patch for Node.js compatibility
const nodeCompatibilityPatch = `
// Node.js compatibility patch
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
  
  // Set up minimal DOM globals if not present
  if (typeof document === 'undefined') {
    global.document = {
      createElement: function(tag) {
        return {
          tagName: tag.toUpperCase(),
          nodeType: global.Node.ELEMENT_NODE,
          textContent: '',
          innerHTML: '',
          childNodes: [],
          querySelector: function() { return null; },
          querySelectorAll: function() { return []; },
          getAttribute: function() { return null; },
          setAttribute: function() {},
          hasAttribute: function() { return false; },
          appendChild: function(child) { return child; }
        };
      },
      body: {
        nodeType: global.Node.ELEMENT_NODE,
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

try {
  // Read the main built file
  const mainFile = './dist/index.js';
  if (fs.existsSync(mainFile)) {
    let content = fs.readFileSync(mainFile, 'utf8');
    
    // Check if already patched
    if (!content.includes('Node.js compatibility patch')) {
      // Add patch at the beginning
      content = nodeCompatibilityPatch + '\n' + content;
      fs.writeFileSync(mainFile, content);
      console.log('✅ Patched dist/index.js');
    } else {
      console.log('ℹ️  dist/index.js already patched');
    }
  }

  // Also patch ESM version if it exists
  const esmFile = './dist/index.esm.js';
  if (fs.existsSync(esmFile)) {
    let content = fs.readFileSync(esmFile, 'utf8');
    
    if (!content.includes('Node.js compatibility patch')) {
      content = nodeCompatibilityPatch + '\n' + content;
      fs.writeFileSync(esmFile, content);
      console.log('✅ Patched dist/index.esm.js');
    } else {
      console.log('ℹ️  dist/index.esm.js already patched');
    }
  }

  console.log('🎉 Patching complete! Now try: node quick-test.js');
  
} catch (error) {
  console.error('❌ Patching failed:', error.message);
  process.exit(1);
}

// Create a simple test to verify the patch works
console.log('\n🧪 Testing the patch...');

try {
  // Clear require cache
  delete require.cache[require.resolve('./dist/index.js')];
  
  const { htmlToMarkdown } = require('./dist/index.js');
  const result = htmlToMarkdown('<p>Test</p>');
  
  console.log('✅ Patch successful! Basic conversion works.');
  console.log('Result:', result.markdown);
  
} catch (error) {
  console.log('❌ Patch test failed:', error.message);
  console.log('You may need to rebuild: npm run build');
}