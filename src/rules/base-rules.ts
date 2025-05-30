// src/rules/base-rules.ts

import { ConversionOptions } from '../types';

export interface Rule {
  apply(element: Element, childContent: string): string;
}

export class BaseRules {
  private options: ConversionOptions;
  private rules: Map<string, Rule>;

  constructor(options: ConversionOptions) {
    this.options = options;
    this.rules = new Map();
    this.initializeRules();
  }

  public getRule(tagName: string): Rule | undefined {
    return this.rules.get(tagName);
  }

  private initializeRules(): void {
    // Headers
    for (let i = 1; i <= 6; i++) {
      this.rules.set(`h${i}`, {
        apply: (element: Element, childContent: string) => {
          const level = '#'.repeat(i);
          return `\n${level} ${childContent.trim()}\n\n`;
        }
      });
    }

    // Paragraphs
    this.rules.set('p', {
      apply: (element: Element, childContent: string) => {
        return `\n${childContent.trim()}\n\n`;
      }
    });

    // Line breaks
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
        return `${this.options.strongDelimiter}${childContent}${this.options.strongDelimiter}`;
      }
    });

    this.rules.set('b', {
      apply: (element: Element, childContent: string) => {
        return `${this.options.strongDelimiter}${childContent}${this.options.strongDelimiter}`;
      }
    });

    // Emphasis/Italic
    this.rules.set('em', {
      apply: (element: Element, childContent: string) => {
        return `${this.options.emDelimiter}${childContent}${this.options.emDelimiter}`;
      }
    });

    this.rules.set('i', {
      apply: (element: Element, childContent: string) => {
        return `${this.options.emDelimiter}${childContent}${this.options.emDelimiter}`;
      }
    });

    // Code
    this.rules.set('code', {
      apply: (element: Element, childContent: string) => {
        if (childContent.includes('`')) {
          return `\`\`${childContent}\`\``;
        }
        return `\`${childContent}\``;
      }
    });

    // Preformatted text
    this.rules.set('pre', {
      apply: (element: Element, childContent: string) => {
        const codeElement = element.querySelector('code');
        const language = codeElement?.getAttribute('class')?.replace('language-', '') || '';
        
        if (this.options.codeBlockStyle === 'fenced') {
          return `\n${this.options.fence}${language}\n${childContent}\n${this.options.fence}\n\n`;
        } else {
          const lines = childContent.split('\n');
          const indentedLines = lines.map(line => `    ${line}`);
          return `\n${indentedLines.join('\n')}\n\n`;
        }
      }
    });

    // Links
    this.rules.set('a', {
      apply: (element: Element, childContent: string) => {
        const href = element.getAttribute('href');
        const title = element.getAttribute('title');
        
        if (!href) return childContent;

        if (this.options.linkStyle === 'inlined') {
          if (title) {
            return `[${childContent}](${href} "${title}")`;
          }
          return `[${childContent}](${href})`;
        }

        // Referenced links (simplified implementation)
        return `[${childContent}](${href})`;
      }
    });

    // Images
    this.rules.set('img', {
      apply: (element: Element, childContent: string) => {
        const src = element.getAttribute('src') || '';
        const alt = element.getAttribute('alt') || '';
        const title = element.getAttribute('title');

        if (title) {
          return `![${alt}](${src} "${title}")`;
        }
        return `![${alt}](${src})`;
      }
    });

    // Lists
    this.rules.set('ul', {
      apply: (element: Element, childContent: string) => {
        return `\n${childContent}\n`;
      }
    });

    this.rules.set('ol', {
      apply: (element: Element, childContent: string) => {
        return `\n${childContent}\n`;
      }
    });

    this.rules.set('li', {
      apply: (element: Element, childContent: string) => {
        const parent = element.parentElement;
        const isOrdered = parent?.tagName.toLowerCase() === 'ol';
        
        if (isOrdered) {
          const siblings = Array.from(parent!.children);
          const index = siblings.indexOf(element) + 1;
          return `${index}. ${childContent.trim()}\n`;
        } else {
          return `${this.options.bulletListMarker} ${childContent.trim()}\n`;
        }
      }
    });

    // Blockquotes
    this.rules.set('blockquote', {
      apply: (element: Element, childContent: string) => {
        const lines = childContent.trim().split('\n');
        const quotedLines = lines.map(line => 
          line.trim() ? `> ${line}` : '>'
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

    // Table rows and cells are handled within table conversion
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
        // Add some spacing for block-level divs
        return `${childContent}\n`;
      }
    });

    // Spans (inline containers)
    this.rules.set('span', {
      apply: (element: Element, childContent: string) => childContent
    });

    // Deleted text
    this.rules.set('del', {
      apply: (element: Element, childContent: string) => {
        return `~~${childContent}~~`;
      }
    });

    this.rules.set('s', {
      apply: (element: Element, childContent: string) => {
        return `~~${childContent}~~`;
      }
    });

    // Inserted text
    this.rules.set('ins', {
      apply: (element: Element, childContent: string) => {
        return `<ins>${childContent}</ins>`;
      }
    });

    // Underlined text
    this.rules.set('u', {
      apply: (element: Element, childContent: string) => {
        return `<u>${childContent}</u>`;
      }
    });

    // Small text
    this.rules.set('small', {
      apply: (element: Element, childContent: string) => {
        return `<small>${childContent}</small>`;
      }
    });

    // Subscript and superscript
    this.rules.set('sub', {
      apply: (element: Element, childContent: string) => {
        return `<sub>${childContent}</sub>`;
      }
    });

    this.rules.set('sup', {
      apply: (element: Element, childContent: string) => {
        return `<sup>${childContent}</sup>`;
      }
    });
  }

  private convertTable(table: Element): string {
    const rows = table.querySelectorAll('tr');
    if (rows.length === 0) return '';

    let markdown = '\n';
    let hasHeaders = false;

    rows.forEach((row, rowIndex) => {
      const cells = row.querySelectorAll('td, th');
      const cellContents: string[] = [];

      cells.forEach(cell => {
        let content = this.getCellContent(cell);
        content = content.replace(/\|/g, '\\|'); // Escape pipes
        content = content.replace(/\n/g, ' '); // Replace newlines with spaces
        cellContents.push(content.trim());
      });

      if (cellContents.length === 0) return;

      // Check if this row has headers
      if (rowIndex === 0 && row.querySelector('th')) {
        hasHeaders = true;
      }

      // Add the row
      markdown += `| ${cellContents.join(' | ')} |\n`;

      // Add separator after header row
      if (rowIndex === 0 && (hasHeaders || this.looksLikeHeaders(cellContents))) {
        const separator = cellContents.map(() => '---').join(' | ');
        markdown += `| ${separator} |\n`;
      }
    });

    return markdown + '\n';
  }

  private getCellContent(cell: Element): string {
    // Get text content and preserve some basic formatting
    let content = '';
    
    for (const node of Array.from(cell.childNodes)) {
      if (node.nodeType === Node.TEXT_NODE) {
        content += node.textContent || '';
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        const element = node as Element;
        const tagName = element.tagName.toLowerCase();
        
        // Preserve some formatting in tables
        if (tagName === 'strong' || tagName === 'b') {
          content += `**${element.textContent}**`;
        } else if (tagName === 'em' || tagName === 'i') {
          content += `*${element.textContent}*`;
        } else if (tagName === 'code') {
          content += `\`${element.textContent}\``;
        } else {
          content += element.textContent || '';
        }
      }
    }

    return content;
  }

  private looksLikeHeaders(cellContents: string[]): boolean {
    // Heuristic: cells that are short and look like headers
    return cellContents.every(content => {
      const trimmed = content.trim();
      return trimmed.length > 0 && 
             trimmed.length < 50 && 
             /^[A-Z]/.test(trimmed);
    });
  }
}