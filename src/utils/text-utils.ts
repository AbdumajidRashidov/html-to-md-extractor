// src/utils/text-utils.ts

export class TextUtils {
  private static regexCache = new Map<string, RegExp>();
  
  escapeMarkdown(text: string): string {
      if (!text) return text;
      
      // Much more conservative escaping - only escape what's absolutely necessary
      // Don't escape in contexts where it's clearly not needed
      let escaped = text;
      
      // Only escape these characters when they could interfere with markdown parsing
      // But be very selective about when to escape
      
      // Escape backslashes first
      escaped = escaped.replace(/\\/g, '\\\\');
      
      // Only escape asterisks if they're not part of intended bold/italic
      if (!escaped.includes('**') && !escaped.includes('*')) {
          escaped = escaped.replace(/\*/g, '\\*');
      }
      
      // Only escape underscores if they're not part of intended formatting
      if (!escaped.includes('__') && !escaped.includes('_')) {
          escaped = escaped.replace(/_/g, '\\_');
      }
      
      // Only escape backticks if not part of code blocks
      if (!escaped.includes('```') && !escaped.includes('`')) {
          escaped = escaped.replace(/`/g, '\\`');
      }
      
      // Be very selective about other characters
      // Only escape if they're at the start of a line or could cause issues
      escaped = escaped.replace(/^#/gm, '\\#');
      escaped = escaped.replace(/^>/gm, '\\>');
      escaped = escaped.replace(/^\+/gm, '\\+');
      escaped = escaped.replace(/^-/gm, '\\-');
      escaped = escaped.replace(/^\*/gm, '\\*');
      escaped = escaped.replace(/^\d+\./gm, (match) => match.replace('.', '\\.'));
      
      return escaped;
  }

  private getCachedRegex(pattern: string, flags?: string): RegExp {
      const key = `${pattern}|${flags || ''}`;
      let regex = TextUtils.regexCache.get(key);
      
      if (!regex) {
        regex = new RegExp(pattern, flags);
        TextUtils.regexCache.set(key, regex);
      }
      
      return regex;
  }

  static clearRegexCache(): void {
      TextUtils.regexCache.clear();
  }

  unescapeMarkdown(text: string): string {
    if (!text) return text;
    
    // Remove escape characters
    return text.replace(/\\([\\`*_{}[\]()#+\-.!|~])/g, '$1');
  }

  decodeHTMLEntities(html: string): string {
    const entities: Record<string, string> = {
      '&amp;': '&',
      '&lt;': '<',
      '&gt;': '>',
      '&quot;': '"',
      '&#39;': "'",
      '&apos;': "'",
      '&nbsp;': ' ',
      '&hellip;': '...',
      '&mdash;': '—',
      '&ndash;': '–',
      '&rsquo;': "'",
      '&lsquo;': "'",
      '&rdquo;': '"',
      '&ldquo;': '"',
      '&copy;': '©',
      '&reg;': '®',
      '&trade;': '™',
      '&sect;': '§',
      '&para;': '¶',
      '&dagger;': '†',
      '&Dagger;': '‡',
      '&bull;': '•',
      '&prime;': '′',
      '&Prime;': '″',
      '&oline;': '‾',
      '&frasl;': '⁄',
      '&weierp;': '℘',
      '&image;': 'ℑ',
      '&real;': 'ℜ',
      '&alefsym;': 'ℵ'
    };

    let decoded = html;
    
    // Replace named entities
    for (const [entity, replacement] of Object.entries(entities)) {
      decoded = decoded.replace(new RegExp(entity, 'g'), replacement);
    }

    // Handle numeric entities (decimal)
    decoded = decoded.replace(/&#(\d+);/g, (match, num) => {
      const code = parseInt(num, 10);
      return code > 0 && code <= 1114111 ? String.fromCharCode(code) : match;
    });

    // Handle hex entities
    decoded = decoded.replace(/&#x([0-9a-f]+);/gi, (match, hex) => {
      const code = parseInt(hex, 16);
      return code > 0 && code <= 1114111 ? String.fromCharCode(code) : match;
    });

    return decoded;
  }

  encodeHTMLEntities(text: string): string {
    const entities: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    };

    return text.replace(/[&<>"']/g, char => entities[char] || char);
  }

  fixMarkdownFormatting(markdown: string): string {
    let fixed = markdown;

    // Fix spacing around headers
    fixed = fixed.replace(/^(#{1,6})\s*(.+)$/gm, '$1 $2');

    // Don't mess with existing list formatting
    // fixed = fixed.replace(/^(\s*)[-*+]\s+/gm, '$1- ');
    
    // Fix emphasis spacing - be more careful
    fixed = fixed.replace(/\*\*([^*\n]+)\*\*/g, '**$1**');
    fixed = fixed.replace(/(?<!\*)\*([^*\n]+)\*(?!\*)/g, '*$1*');

    // Fix code block fencing
    fixed = fixed.replace(/```(\w*)\n([\s\S]*?)\n```/g, '```$1\n$2\n```');

    // Remove trailing spaces
    fixed = fixed.replace(/[ \t]+$/gm, '');

    // Fix multiple consecutive newlines
    fixed = fixed.replace(/\n{4,}/g, '\n\n\n');

    // Ensure proper spacing around block elements
    fixed = fixed.replace(/\n(#{1,6}\s)/g, '\n\n$1');
    fixed = fixed.replace(/(#{1,6}\s[^\n]+)\n(?!\n)/g, '$1\n\n');

    return fixed;
  }

  normalizeWhitespace(text: string): string {
    return text
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n')
      .replace(/[ \t]+/g, ' ')
      .replace(/\n\s*\n/g, '\n\n')
      .trim();
  }

  truncateText(text: string, maxLength: number, suffix: string = '...'): string {
    if (text.length <= maxLength) {
      return text;
    }
    
    return text.slice(0, maxLength - suffix.length) + suffix;
  }

  slugify(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  capitalize(text: string): string {
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
  }

  isWhitespaceOnly(text: string): boolean {
    return /^\s*$/.test(text);
  }

  countWords(text: string): number {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  }

  extractUrls(text: string): string[] {
    const urlRegex = /https?:\/\/[^\s<>"]+/g;
    return text.match(urlRegex) || [];
  }

  extractEmails(text: string): string[] {
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
    return text.match(emailRegex) || [];
  }

  removeExcessiveSpacing(text: string): string {
    return text
      .replace(/[ \t]{2,}/g, ' ')
      .replace(/\n[ \t]*/g, '\n')
      .replace(/\n{3,}/g, '\n\n');
  }

  indentText(text: string, spaces: number = 2): string {
    const indent = ' '.repeat(spaces);
    return text.split('\n').map(line => indent + line).join('\n');
  }

  wrapText(text: string, width: number = 80): string {
    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = '';

    for (const word of words) {
      if (currentLine.length + word.length + 1 <= width) {
        currentLine += (currentLine ? ' ' : '') + word;
      } else {
        if (currentLine) {
          lines.push(currentLine);
        }
        currentLine = word;
      }
    }

    if (currentLine) {
      lines.push(currentLine);
    }

    return lines.join('\n');
  }
}