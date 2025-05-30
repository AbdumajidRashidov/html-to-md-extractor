// src/utils/dom-utils.ts

export class DOMUtils {
    parseHTML(html: string): Document {
      if (typeof window !== 'undefined' && window.DOMParser) {
        // Browser environment
        const parser = new DOMParser();
        return parser.parseFromString(html, 'text/html');
      } else {
        // Node.js environment - use jsdom
        try {
          const { JSDOM } = require('jsdom');
          return new JSDOM(html).window.document;
        } catch {
          throw new Error('JSDOM is required for server-side HTML parsing');
        }
      }
    }
  
    getTextContent(element: Element): string {
      return element.textContent || element.innerHTML.replace(/<[^>]*>/g, '') || '';
    }
  
    hasAttribute(element: Element, attr: string): boolean {
      return element.hasAttribute(attr);
    }
  
    getAttribute(element: Element, attr: string): string | null {
      return element.getAttribute(attr);
    }
  
    isElementNode(node: Node): node is Element {
      return node.nodeType === Node.ELEMENT_NODE;
    }
  
    isTextNode(node: Node): node is Text {
      return node.nodeType === Node.TEXT_NODE;
    }
  
    getNodeDepth(node: Node): number {
      let depth = 0;
      let current = node.parentNode;
      
      while (current) {
        depth++;
        current = current.parentNode;
      }
      
      return depth;
    }
  
    findAncestor(element: Element, predicate: (el: Element) => boolean): Element | null {
      let current = element.parentElement;
      
      while (current) {
        if (predicate(current)) {
          return current;
        }
        current = current.parentElement;
      }
      
      return null;
    }
  
    getElementPath(element: Element): string {
      const path: string[] = [];
      let current: Element | null = element;
      
      while (current && current !== document.body) {
        const tagName = current.tagName.toLowerCase();
        const id = current.id ? `#${current.id}` : '';
        const classes = current.className ? `.${current.className.replace(/\s+/g, '.')}` : '';
        
        path.unshift(`${tagName}${id}${classes}`);
        current = current.parentElement;
      }
      
      return path.join(' > ');
    }
  
    removeElement(element: Element): void {
      if (element.parentNode) {
        element.parentNode.removeChild(element);
      }
    }
  
    replaceElement(oldElement: Element, newElement: Element): void {
      if (oldElement.parentNode) {
        oldElement.parentNode.replaceChild(newElement, oldElement);
      }
    }
  
    wrapElement(element: Element, wrapper: Element): void {
      if (element.parentNode) {
        element.parentNode.insertBefore(wrapper, element);
        wrapper.appendChild(element);
      }
    }
  }
  