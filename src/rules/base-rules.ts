// src/rules/base-rules.ts

import { ConversionOptions } from '../types';

// Server-side node type constants
const SERVER_NODE_TYPES = {
  ELEMENT_NODE: 1,
  TEXT_NODE: 3,
  COMMENT_NODE: 8,
  DOCUMENT_NODE: 9,
  DOCUMENT_FRAGMENT_NODE: 11
} as const;

export interface Rule {
  apply(element: Element, childContent: string): string;
}

export class BaseRules {
  private options: ConversionOptions;
  private rules: Map<string, Rule>;
  private ruleCache = new Map<string, any>();
  private readonly nodeTypes = SERVER_NODE_TYPES;

  constructor(options: ConversionOptions) {
    this.options = options;
    this.rules = new Map();
    this.initializeRules();
  }

   public getRule(tagName: string): any {
    if (this.ruleCache.has(tagName)) {
      return this.ruleCache.get(tagName);
    }
    
    const rule = this.rules.get(tagName);
    this.ruleCache.set(tagName, rule);
    return rule;
  }

  public clearCache(): void {
    this.ruleCache.clear();
  }

  private initializeRules(): void {
    // Headers
    for (let i = 1; i <= 6; i++) {
      this.rules.set(`h${i}`, {
        apply: (element: Element, childContent: string) => {
          const level = '#'.repeat(i);
          const content = childContent.trim();
          return `\n${level} ${content}\n\n`;
        }
      });
    }

    // Paragraphs
    this.rules.set('p', {
      apply: (element: Element, childContent: string) => {
        const content = childContent.trim();
        if (!content) return '';
        return `\n${content}\n\n`;
      }
    });

    // Line breaks - FIXED: Now properly preserves line breaks
    this.rules.set('br', {
      apply: (element: Element, childContent: string) => {
        return '\n';
      }
    });

    // Horizontal rules
    this.rules.set('hr', {
      apply: (element: Element, childContent: string) => {
        return '\n---\n\n';
      }
    });

    // Strong/Bold
    this.rules.set('strong', {
      apply: (element: Element, childContent: string) => {
        if (!childContent.trim()) return '';
        return `${this.options.strongDelimiter}${childContent.trim()}${this.options.strongDelimiter}`;
      }
    });

    this.rules.set('b', {
      apply: (element: Element, childContent: string) => {
        if (!childContent.trim()) return '';
        return `${this.options.strongDelimiter}${childContent.trim()}${this.options.strongDelimiter}`;
      }
    });

    // Emphasis/Italic
    this.rules.set('em', {
      apply: (element: Element, childContent: string) => {
        if (!childContent.trim()) return '';
        return `${this.options.emDelimiter}${childContent.trim()}${this.options.emDelimiter}`;
      }
    });

    this.rules.set('i', {
      apply: (element: Element, childContent: string) => {
        if (!childContent.trim()) return '';
        return `${this.options.emDelimiter}${childContent.trim()}${this.options.emDelimiter}`;
      }
    });

    // Code
    this.rules.set('code', {
      apply: (element: Element, childContent: string) => {
        if (!childContent.trim()) return '';
        const content = childContent.trim();
        
        // Check if this is inside a pre block - if so, don't add backticks
        let parent = element.parentElement;
        while (parent) {
          if (parent.tagName?.toLowerCase() === 'pre') {
            return content; // Return raw content, pre will handle formatting
          }
          parent = parent.parentElement;
        }
        
        if (content.includes('`')) {
          return `\`\`${content}\`\``;
        }
        return `\`${content}\``;
      }
    });

    // Preformatted text - FIXED: Now properly handles indented vs fenced
    this.rules.set('pre', {
      apply: (element: Element, childContent: string) => {
        const content = childContent.trim();
        if (!content) return '';
        
        // Check for language
        const codeElement = element.querySelector ? element.querySelector('code') : null;
        let language = '';
        
        if (codeElement?.getAttribute) {
          const className = codeElement.getAttribute('class') || '';
          const match = className.match(/language-(\w+)/);
          if (match) {
            language = match[1];
          }
        }
        
        if (this.options.codeBlockStyle === 'indented') {
          // Indented style: each line gets 4 spaces
          const lines = content.split('\n');
          const indentedLines = lines.map(line => `    ${line}`);
          return `\n${indentedLines.join('\n')}\n\n`;
        } else {
          // Fenced style (default)
          return `\n\`\`\`${language}\n${content}\n\`\`\`\n\n`;
        }
      }
    });

    // Links
    this.rules.set('a', {
      apply: (element: Element, childContent: string) => {
        const href = element.getAttribute ? element.getAttribute('href') : null;
        const title = element.getAttribute ? element.getAttribute('title') : null;
        
        if (!href) return childContent;
        if (!childContent.trim()) return '';

        // Handle mailto links specially
        if (href.startsWith('mailto:')) {
          const email = href.replace('mailto:', '').split('?')[0]; // Remove query params
          // If link text is the same as email, use angle brackets
          if (childContent.trim() === email) {
            return `<${email}>`;
          }
        }

        if (this.options.linkStyle === 'inlined') {
          if (title) {
            return `[${childContent.trim()}](${href} "${title}")`;
          }
          return `[${childContent.trim()}](${href})`;
        }

        return `[${childContent.trim()}](${href})`;
      }
    });

    // Images
    this.rules.set('img', {
      apply: (element: Element, childContent: string) => {
        const src = element.getAttribute ? (element.getAttribute('src') || '') : '';
        const alt = element.getAttribute ? (element.getAttribute('alt') || '') : '';
        const title = element.getAttribute ? element.getAttribute('title') : null;

        if (title) {
          return `![${alt}](${src} "${title}")`;
        }
        return `![${alt}](${src})`;
      }
    });

    // Lists
    this.rules.set('ul', {
      apply: (element: Element, childContent: string) => {
        const content = childContent.trim();
        if (!content) return '';
        return `\n${content}\n`;
      }
    });

    this.rules.set('ol', {
      apply: (element: Element, childContent: string) => {
        const content = childContent.trim();
        if (!content) return '';
        return `\n${content}\n`;
      }
    });

    this.rules.set('li', {
      apply: (element: Element, childContent: string) => {
        const content = childContent.trim();
        if (!content) return '';
        
        const parent = element.parentElement;
        const isOrdered = parent?.tagName?.toLowerCase() === 'ol';
        
        if (isOrdered && parent) {
          const siblings = parent.children ? Array.from(parent.children) : [];
          const index = siblings.indexOf(element) + 1;
          return `${index}. ${content}\n`;
        } else {
          // Use the configured bullet marker
          const marker = this.options.bulletListMarker || '-';
          return `${marker} ${content}\n`;
        }
      }
    });

    // Blockquotes - FIXED: Now properly handles nested blockquotes
    this.rules.set('blockquote', {
      apply: (element: Element, childContent: string) => {
        const content = childContent.trim();
        if (!content) return '';
        
        // Count nesting level by checking parent blockquotes
        let nestingLevel = 0;
        let parent = element.parentElement;
        while (parent) {
          if (parent.tagName?.toLowerCase() === 'blockquote') {
            nestingLevel++;
          }
          parent = parent.parentElement;
        }
        
        const prefix = '> '.repeat(nestingLevel + 1);
        const lines = content.split('\n');
        const quotedLines = lines.map(line => 
          line.trim() ? `${prefix}${line}` : prefix.trim()
        );
        return `\n${quotedLines.join('\n')}\n\n`;
      }
    });

    // Tables
    this.rules.set('table', {
      apply: (element: Element, childContent: string) => {
        return this.convertTable(element);
      }
    });

    this.rules.set('tr', {
      apply: (element: Element, childContent: string) => childContent
    });

    this.rules.set('td', {
      apply: (element: Element, childContent: string) => childContent
    });

    this.rules.set('th', {
      apply: (element: Element, childContent: string) => childContent
    });

    // Divs (generic containers)
    this.rules.set('div', {
      apply: (element: Element, childContent: string) => {
        const content = childContent.trim();
        if (!content) return '';
        return `${content}\n`;
      }
    });

    // Spans (inline containers)
    this.rules.set('span', {
      apply: (element: Element, childContent: string) => childContent
    });

    // Deleted text
    this.rules.set('del', {
      apply: (element: Element, childContent: string) => {
        if (!childContent.trim()) return '';
        return `~~${childContent.trim()}~~`;
      }
    });

    this.rules.set('s', {
      apply: (element: Element, childContent: string) => {
        if (!childContent.trim()) return '';
        return `~~${childContent.trim()}~~`;
      }
    });

    // Inserted text
    this.rules.set('ins', {
      apply: (element: Element, childContent: string) => {
        if (!childContent.trim()) return '';
        return `<ins>${childContent.trim()}</ins>`;
      }
    });

    // Underlined text
    this.rules.set('u', {
      apply: (element: Element, childContent: string) => {
        if (!childContent.trim()) return '';
        return `<u>${childContent.trim()}</u>`;
      }
    });

    // Small text
    this.rules.set('small', {
      apply: (element: Element, childContent: string) => {
        if (!childContent.trim()) return '';
        return `<small>${childContent.trim()}</small>`;
      }
    });

    // Subscript and superscript
    this.rules.set('sub', {
      apply: (element: Element, childContent: string) => {
        if (!childContent.trim()) return '';
        return `<sub>${childContent.trim()}</sub>`;
      }
    });

    this.rules.set('sup', {
      apply: (element: Element, childContent: string) => {
        if (!childContent.trim()) return '';
        return `<sup>${childContent.trim()}</sup>`;
      }
    });
  }

  private convertTable(table: any): string {
    if (!table.querySelectorAll) return '';
    
    const rows = table.querySelectorAll('tr');
    if (rows.length === 0) return '';

    let markdown = '\n';
    let hasHeaders = false;

    for (let rowIndex = 0; rowIndex < rows.length; rowIndex++) {
      const row = rows[rowIndex];
      const cells = row.querySelectorAll ? row.querySelectorAll('td, th') : [];
      const cellContents: string[] = [];

      for (let cellIndex = 0; cellIndex < cells.length; cellIndex++) {
        const cell = cells[cellIndex];
        let content = this.getCellContent(cell);
        content = content.replace(/\|/g, '\\|'); // Escape pipes
        content = content.replace(/\n/g, ' '); // Replace newlines with spaces
        content = content.trim();
        
        // FIXED: Handle empty cells properly - use single space instead of multiple spaces
        cellContents.push(content || ' ');
      }

      if (cellContents.length === 0) continue;

      // Check if this row has headers
      if (rowIndex === 0 && row.querySelector && row.querySelector('th')) {
        hasHeaders = true;
      }

      // Add the row - FIXED: Single space for empty cells
      const cellsFormatted = cellContents.map(cell => cell === ' ' ? ' ' : cell);
      markdown += `| ${cellsFormatted.join(' | ')} |\n`;

      // Add separator after header row
      if (rowIndex === 0 && (hasHeaders || this.looksLikeHeaders(cellContents))) {
        const separator = cellContents.map(() => '---').join(' | ');
        markdown += `| ${separator} |\n`;
      }
    }

    return markdown + '\n';
  }

  private getCellContent(cell: any): string {
    let content = '';
    
    const childNodes = cell.childNodes || [];
    for (let i = 0; i < childNodes.length; i++) {
      const node = childNodes[i];
      if (node.nodeType === this.nodeTypes.TEXT_NODE) {
        content += node.textContent || '';
      } else if (node.nodeType === this.nodeTypes.ELEMENT_NODE) {
        const element = node;
        const tagName = element.tagName?.toLowerCase() || '';
        
        // Preserve some formatting in tables
        if (tagName === 'strong' || tagName === 'b') {
          content += `**${element.textContent || ''}**`;
        } else if (tagName === 'em' || tagName === 'i') {
          content += `*${element.textContent || ''}*`;
        } else if (tagName === 'code') {
          content += `\`${element.textContent || ''}\``;
        } else {
          content += element.textContent || '';
        }
      }
    }

    return content;
  }

  private looksLikeHeaders(cellContents: string[]): boolean {
    return cellContents.every(content => {
      const trimmed = content.trim();
      return trimmed.length > 0 && 
             trimmed.length < 50 && 
             /^[A-Z]/.test(trimmed);
    });
  }
}