// tests/setup.ts (Fixed with proper DOM mocking and Node constants)

// Mock console methods
global.console = {
  ...console,
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn()
};

// Define DOM Node types for testing - this is the key fix!
enum NodeType {
  ELEMENT_NODE = 1,
  TEXT_NODE = 3,
  COMMENT_NODE = 8,
  DOCUMENT_NODE = 9,
  DOCUMENT_FRAGMENT_NODE = 11
}

// Create global Node object that was missing
(global as any).Node = {
  ELEMENT_NODE: NodeType.ELEMENT_NODE,
  TEXT_NODE: NodeType.TEXT_NODE,
  COMMENT_NODE: NodeType.COMMENT_NODE,
  DOCUMENT_NODE: NodeType.DOCUMENT_NODE,
  DOCUMENT_FRAGMENT_NODE: NodeType.DOCUMENT_FRAGMENT_NODE
};

// Mock Text node
class MockText {
  nodeType = NodeType.TEXT_NODE;
  textContent: string;
  parentElement: any = null;
  parentNode: any = null;

  constructor(text: string) {
    this.textContent = text;
  }
}

// Mock Comment node
class MockComment {
  nodeType = NodeType.COMMENT_NODE;
  textContent: string;
  parentElement: any = null;
  parentNode: any = null;

  constructor(text: string) {
    this.textContent = text;
  }
}

// Mock Element
class MockElement {
  nodeType = NodeType.ELEMENT_NODE;
  tagName: string;
  textContent: string = '';
  innerHTML: string = '';
  attributes: any[] = [];
  childNodes: any[] = [];
  children: any[] = [];
  parentElement: any = null;
  parentNode: any = null;
  style: any = {};
  classList: any = {
    contains: jest.fn(() => false),
    add: jest.fn(),
    remove: jest.fn()
  };

  constructor(tagName: string = 'div') {
    this.tagName = tagName.toUpperCase();
  }

  querySelector = jest.fn((selector: string) => {
    // Simple querySelector mock - find first matching element by tag name
    const tag = selector.toLowerCase();
    for (const child of this.childNodes) {
      if (child.nodeType === NodeType.ELEMENT_NODE && 
          child.tagName?.toLowerCase() === tag) {
        return child;
      }
    }
    return null;
  });

  querySelectorAll = jest.fn((selector: string) => {
    // Simple querySelectorAll mock
    const results: any[] = [];
    const tag = selector.toLowerCase().replace(/\[.*\]/, ''); // Remove attribute selectors
    
    const findMatching = (element: any) => {
      if (element.nodeType === NodeType.ELEMENT_NODE) {
        if (tag === '*' || element.tagName?.toLowerCase() === tag || 
            selector.includes(element.tagName?.toLowerCase())) {
          results.push(element);
        }
        if (element.childNodes) {
          element.childNodes.forEach(findMatching);
        }
      }
    };
    
    findMatching(this);
    return results;
  });

  getAttribute = jest.fn((attr: string) => {
    const found = this.attributes.find((a: any) => a.name === attr);
    return found ? found.value : null;
  });

  setAttribute = jest.fn((name: string, value: string) => {
    const existing = this.attributes.find((a: any) => a.name === name);
    if (existing) {
      existing.value = value;
    } else {
      this.attributes.push({ name, value });
    }
  });

  hasAttribute = jest.fn((attr: string) => {
    return this.attributes.some((a: any) => a.name === attr);
  });

  removeAttribute = jest.fn((attr: string) => {
    this.attributes = this.attributes.filter((a: any) => a.name !== attr);
  });

  appendChild = jest.fn((child: any) => {
    this.childNodes.push(child);
    if (child.nodeType === NodeType.ELEMENT_NODE) {
      this.children.push(child);
    }
    child.parentNode = this;
    child.parentElement = this;
    return child;
  });

  removeChild = jest.fn((child: any) => {
    const index = this.childNodes.indexOf(child);
    if (index > -1) {
      this.childNodes.splice(index, 1);
    }
    const childIndex = this.children.indexOf(child);
    if (childIndex > -1) {
      this.children.splice(childIndex, 1);
    }
    child.parentNode = null;
    child.parentElement = null;
    return child;
  });
}

// Mock Document
class MockDocument extends MockElement {
  nodeType: any = NodeType.DOCUMENT_NODE;
  body: MockElement;
  documentElement: MockElement;

  constructor() {
    super('document');
    this.body = new MockElement('body');
    this.documentElement = new MockElement('html');
    this.documentElement.appendChild(this.body);
  }

  createElement = jest.fn((tagName: string) => new MockElement(tagName));
  createTextNode = jest.fn((text: string) => new MockText(text));
  createComment = jest.fn((text: string) => new MockComment(text));

  querySelector = jest.fn((selector: string) => {
    return this.body.querySelector(selector);
  });

  querySelectorAll = jest.fn((selector: string) => {
    return this.body.querySelectorAll(selector);
  });
}

// Mock DOMParser with better HTML parsing
class MockDOMParser {
  parseFromString(html: string, mimeType: string = 'text/html'): MockDocument {
    const doc = new MockDocument();
    
    // Enhanced HTML parsing that creates a proper structure
    this.parseHTMLIntoDocument(html, doc);
    
    return doc;
  }

  private parseHTMLIntoDocument(html: string, doc: MockDocument) {
    // Simple regex-based HTML parsing for testing
    // This creates actual element nodes with proper structure
    
    // Remove comments and scripts first
    html = html.replace(/<!--[\s\S]*?-->/g, '');
    html = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
    html = html.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
    
    // Find body content
    const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
    let bodyContent = bodyMatch ? bodyMatch[1] : html;
    
    // Parse the HTML structure into elements
    this.parseElements(bodyContent, doc.body);
    
    // Set text content for the body
    doc.body.textContent = this.extractTextContent(bodyContent);
    doc.body.innerHTML = bodyContent;
  }

  private parseElements(html: string, parent: MockElement) {
    // Simple parsing - find tags and create elements
    const tagRegex = /<(\w+)([^>]*)>([^<]*(?:<(?!\1)[^<]*)*)<\/\1>/g;
    let match;
    
    while ((match = tagRegex.exec(html)) !== null) {
      const [, tagName, attributes, content] = match;
      const element = new MockElement(tagName);
      
      // Parse attributes
      this.parseAttributes(attributes, element);
      
      // Set content
      element.textContent = this.extractTextContent(content);
      element.innerHTML = content;
      
      // Parse child elements recursively
      this.parseElements(content, element);
      
      parent.appendChild(element);
    }
    
    // Handle self-closing tags
    const selfClosingRegex = /<(\w+)([^>]*?)\/>/g;
    while ((match = selfClosingRegex.exec(html)) !== null) {
      const [, tagName, attributes] = match;
      const element = new MockElement(tagName);
      this.parseAttributes(attributes, element);
      parent.appendChild(element);
    }
    
    // Handle text nodes
    const textContent = html.replace(/<[^>]*>/g, '').trim();
    if (textContent && parent.childNodes.length === 0) {
      const textNode = new MockText(textContent);
      parent.appendChild(textNode);
    }
  }

  private parseAttributes(attrString: string, element: MockElement) {
    const attrRegex = /(\w+)=["']([^"']*)["']/g;
    let match;
    
    while ((match = attrRegex.exec(attrString)) !== null) {
      const [, name, value] = match;
      element.setAttribute(name, value);
    }
  }

  private extractTextContent(html: string): string {
    return html.replace(/<[^>]*>/g, '').trim();
  }
}

// Set up global mocks
(global as any).document = new MockDocument();
(global as any).window = {
  document: new MockDocument(),
  DOMParser: MockDOMParser
};
(global as any).DOMParser = MockDOMParser;

// Mock JSDOM with better structure
jest.mock('jsdom', () => ({
  JSDOM: jest.fn().mockImplementation((html: string) => {
    const parser = new MockDOMParser();
    const doc = parser.parseFromString(html);
    return {
      window: {
        document: doc,
        DOMParser: MockDOMParser
      }
    };
  })
}));

// Additional Element constructor for any direct Element usage
(global as any).Element = MockElement;
(global as any).Text = MockText;
(global as any).Comment = MockComment;
(global as any).Document = MockDocument;