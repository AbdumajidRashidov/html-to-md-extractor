// tests/setup.ts (Fixed with proper DOM mocking)
// Mock console methods
global.console = {
  ...console,
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn()
};

// Define DOM Node types for testing
enum NodeType {
  ELEMENT_NODE = 1,
  TEXT_NODE = 3,
  COMMENT_NODE = 8,
  DOCUMENT_NODE = 9
}


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

  querySelector = jest.fn(() => null);
  querySelectorAll = jest.fn(() => []);
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
}

// Mock DOMParser
class MockDOMParser {
  parseFromString(html: string, mimeType: string = 'text/html'): MockDocument {
    const doc = new MockDocument();
    
    // Simple HTML parsing simulation
    if (html.includes('<body>')) {
      const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
      if (bodyMatch) {
        doc.body.innerHTML = bodyMatch[1];
        doc.body.textContent = bodyMatch[1].replace(/<[^>]+>/g, '');
      }
    } else {
      // If no body tag, treat entire content as body content
      doc.body.innerHTML = html;
      doc.body.textContent = html.replace(/<[^>]+>/g, '');
    }
    
    return doc;
  }
}

// Set up global mocks
(global as any).Node = Node;
(global as any).document = new MockDocument();
(global as any).window = {
  document: new MockDocument(),
  DOMParser: MockDOMParser
};
(global as any).DOMParser = MockDOMParser;

// Mock JSDOM
jest.mock('jsdom', () => ({
  JSDOM: jest.fn().mockImplementation((html: string) => {
    const doc = new MockDocument();
    if (html) {
      doc.body.innerHTML = html;
      doc.body.textContent = html.replace(/<[^>]+>/g, '');
    }
    return {
      window: {
        document: doc,
        DOMParser: MockDOMParser
      }
    };
  })
}));