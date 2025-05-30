// src/rules/email-rules.ts

import { ConversionOptions } from '../types';

export interface Rule {
  apply(element: Element, childContent: string): string;
}

export class EmailRules {
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
    // Email signature handling
    this.rules.set('div', {
      apply: (element: Element, childContent: string) => {
        // Detect email signatures
        if (this.isEmailSignature(element)) {
          return this.options.handleEmailSignatures ? 
            `\n\n---\n${childContent}\n` : '';
        }

        // Detect quoted email content
        if (this.isQuotedContent(element)) {
          return this.options.preserveEmailQuotes ? 
            this.formatQuotedContent(childContent) : '';
        }

        // Handle Outlook-specific divs
        if (this.isOutlookDiv(element)) {
          return this.handleOutlookDiv(element, childContent);
        }

        return childContent;
      }
    });

    // Email table handling (common in email layouts)
    this.rules.set('table', {
      apply: (element: Element, childContent: string) => {
        if (this.isLayoutTable(element)) {
          // Layout tables should be converted to divs
          return childContent;
        }

        if (this.options.tableHandling === 'preserve') {
          return this.convertToMarkdownTable(element);
        } else if (this.options.tableHandling === 'remove') {
          return '';
        }

        return this.convertToMarkdownTable(element);
      }
    });

    // Handle email-specific spans (often used for styling)
    this.rules.set('span', {
      apply: (element: Element, childContent: string) => {
        const style = element.getAttribute('style') || '';
        
        // Convert common email styles
        if (this.options.convertInlineStyles) {
          if (style.includes('font-weight: bold') || style.includes('font-weight:bold')) {
            return `**${childContent}**`;
          }
          
          if (style.includes('font-style: italic') || style.includes('font-style:italic')) {
            return `*${childContent}*`;
          }

          if (style.includes('text-decoration: underline')) {
            return `<u>${childContent}</u>`;
          }

          if (style.includes('color:') && this.isImportantColor(style)) {
            return `<mark>${childContent}</mark>`;
          }
        }

        return childContent;
      }
    });

    // Handle font tags (common in older emails)
    this.rules.set('font', {
      apply: (element: Element, childContent: string) => {
        const color = element.getAttribute('color');
        const size = element.getAttribute('size');
        
        if (color && this.isImportantColor(`color: ${color}`)) {
          return `<mark>${childContent}</mark>`;
        }

        return childContent;
      }
    });

    // Handle email-specific links (mailto, etc.)
    this.rules.set('a', {
      apply: (element: Element, childContent: string) => {
        const href = element.getAttribute('href');
        
        if (!href) return childContent;

        // Handle mailto links
        if (href.startsWith('mailto:')) {
          const email = href.replace('mailto:', '');
          return childContent === email ? 
            `<${email}>` : `[${childContent}](${href})`;
        }

        // Handle phone links
        if (href.startsWith('tel:')) {
          return childContent;
        }

        // Regular links
        if (this.options.linkStyle === 'inlined') {
          return `[${childContent}](${href})`;
        }

        return childContent;
      }
    });

    // Handle blockquotes (email replies)
    this.rules.set('blockquote', {
      apply: (element: Element, childContent: string) => {
        // Email clients often use blockquotes for replies
        const lines = childContent.split('\n');
        const quotedLines = lines.map(line => 
          line.trim() ? `> ${line}` : '>'
        );
        return `\n${quotedLines.join('\n')}\n`;
      }
    });

    // Handle pre-formatted text (common in technical emails)
    this.rules.set('pre', {
      apply: (element: Element, childContent: string) => {
        if (this.options.codeBlockStyle === 'fenced') {
          return `\n${this.options.fence}\n${childContent}\n${this.options.fence}\n`;
        } else {
          const lines = childContent.split('\n');
          const indentedLines = lines.map(line => `    ${line}`);
          return `\n${indentedLines.join('\n')}\n`;
        }
      }
    });
  }

  private isEmailSignature(element: Element): boolean {
    const classes = element.getAttribute('class') || '';
    const id = element.getAttribute('id') || '';
    const textContent = element.textContent || '';

    // Common signature indicators
    const signatureIndicators = [
      'signature', 'sig', 'email-signature', 'footer',
      'sent from', 'regards', 'best regards', 'sincerely'
    ];

    return signatureIndicators.some(indicator => 
      classes.toLowerCase().includes(indicator) ||
      id.toLowerCase().includes(indicator) ||
      textContent.toLowerCase().includes(indicator)
    );
  }

  private isQuotedContent(element: Element): boolean {
    const classes = element.getAttribute('class') || '';
    const style = element.getAttribute('style') || '';
    
    // Common quoted content indicators
    return classes.includes('quoted') ||
           classes.includes('gmail_quote') ||
           classes.includes('yahoo_quoted') ||
           style.includes('border-left') ||
           element.getAttribute('dir') === 'ltr';
  }

  private formatQuotedContent(content: string): string {
    const lines = content.split('\n');
    const quotedLines = lines.map(line => 
      line.trim() ? `> ${line}` : '>'
    );
    return `\n${quotedLines.join('\n')}\n`;
  }

  private isOutlookDiv(element: Element): boolean {
    const classes = element.getAttribute('class') || '';
    return classes.includes('WordSection') ||
           classes.includes('MsoNormal') ||
           element.getAttribute('style')?.includes('mso-') || false;
  }

  private handleOutlookDiv(element: Element, childContent: string): string {
    // Remove Outlook-specific formatting but preserve content
    return childContent;
  }

  private isLayoutTable(element: Element): boolean {
    // Detect if table is used for layout rather than data
    const role = element.getAttribute('role');
    const cellpadding = element.getAttribute('cellpadding');
    const cellspacing = element.getAttribute('cellspacing');
    
    return role === 'presentation' ||
           (cellpadding === '0' && cellspacing === '0') ||
           !this.hasDataTableStructure(element);
  }

  private hasDataTableStructure(table: Element): boolean {
    const headers = table.querySelectorAll('th');
    const rows = table.querySelectorAll('tr');
    
    // If it has headers and multiple rows, likely a data table
    return headers.length > 0 && rows.length > 1;
  }

  private convertToMarkdownTable(table: Element): string {
    const rows = table.querySelectorAll('tr');
    if (rows.length === 0) return '';

    let markdown = '\n';
    let hasHeaders = false;

    rows.forEach((row, index) => {
      const cells = row.querySelectorAll('td, th');
      const cellContents = Array.from(cells).map(cell => {
        const content = cell.textContent?.trim() || '';
        return content.replace(/\|/g, '\\|'); // Escape pipes
      });

      // Check if first row contains headers
      if (index === 0 && row.querySelector('th')) {
        hasHeaders = true;
      }

      markdown += `| ${cellContents.join(' | ')} |\n`;

      // Add separator after headers
      if (index === 0 && (hasHeaders || this.shouldTreatAsHeaders(cellContents))) {
        const separator = cellContents.map(() => '---').join(' | ');
        markdown += `| ${separator} |\n`;
      }
    });

    return markdown + '\n';
  }

  private shouldTreatAsHeaders(cellContents: string[]): boolean {
    // Heuristic: if cells are short and contain typical header words
    return cellContents.every(content => 
      content.length < 50 && 
      /^[A-Z][a-z\s]*$/.test(content.trim())
    );
  }

  private isImportantColor(style: string): boolean {
    // Only highlight truly important colors (red, warning colors)
    const importantColors = ['red', '#ff0000', '#dc3545', '#d9534f'];
    return importantColors.some(color => 
      style.toLowerCase().includes(color.toLowerCase())
    );
  }
}