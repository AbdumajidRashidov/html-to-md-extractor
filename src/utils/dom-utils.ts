const SERVER_NODE_TYPES = {
  ELEMENT_NODE: 1,
  TEXT_NODE: 3,
  COMMENT_NODE: 8,
  DOCUMENT_NODE: 9
} as const;

export class DOMUtils {
  private nodeTypes = SERVER_NODE_TYPES;

  parseHTML(html: string): any {
    // Try JSDOM first
    if (this.isJSDOMAvailable()) {
      return this.parseWithJSDOM(html);
    }
    
    // Fallback to basic parsing
    return this.parseWithBasicParser(html);
  }

  private isJSDOMAvailable(): boolean {
    try {
      require.resolve('jsdom');
      return true;
    } catch {
      return false;
    }
  }

  private parseWithJSDOM(html: string): any {
    const { JSDOM } = require('jsdom');
    const dom = new JSDOM(html);
    return dom.window.document;
  }

  private parseWithBasicParser(html: string): any {
    // Create a minimal document structure
    const textContent = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    
    return {
      body: {
        nodeType: this.nodeTypes.ELEMENT_NODE,
        tagName: 'BODY',
        textContent: textContent,
        innerHTML: html,
        childNodes: [{
          nodeType: this.nodeTypes.TEXT_NODE,
          textContent: textContent,
          parentNode: null,
          parentElement: null
        }],
        querySelector: () => null,
        querySelectorAll: () => [],
        getAttribute: () => null,
        hasAttribute: () => false
      },
      querySelector: () => null,
      querySelectorAll: () => []
    };
  }

  getTextContent(element: any): string {
    return element.textContent || element.innerText || '';
  }

  hasAttribute(element: any, attr: string): boolean {
    return element.hasAttribute ? element.hasAttribute(attr) : false;
  }

  getAttribute(element: any, attr: string): string | null {
    return element.getAttribute ? element.getAttribute(attr) : null;
  }

  isElementNode(node: any): boolean {
    return node.nodeType === this.nodeTypes.ELEMENT_NODE;
  }

  isTextNode(node: any): boolean {
    return node.nodeType === this.nodeTypes.TEXT_NODE;
  }
}
