// src/index.ts

import { HTMLToMDParser } from './core/parser';
import { ConversionOptions, ConversionResult } from './types';

/**
 * Main export class for HTML to Markdown conversion
 * Optimized for email content extraction
 */
export class HTMLToMarkdownExtractor {
  private parser: HTMLToMDParser;
  private static readonly MAX_BATCH_SIZE = 100;

  constructor(options: ConversionOptions = {}) {
    this.parser = new HTMLToMDParser(options);
  }

  public async convertBatch(htmlArray: string[]): Promise<ConversionResult[]> {
    const results: ConversionResult[] = [];
    
    // Process in smaller batches to prevent memory accumulation
    for (let i = 0; i < htmlArray.length; i += HTMLToMarkdownExtractor.MAX_BATCH_SIZE) {
      const batch = htmlArray.slice(i, i + HTMLToMarkdownExtractor.MAX_BATCH_SIZE);
      
      const batchResults = batch.map(html => {
        try {
          return this.convert(html);
        } catch (error) {
          return {
            markdown: '',
            metadata: { errors: [(error as Error).message] }
          };
        }
      });
      
      results.push(...batchResults);
      
      // Force garbage collection between batches if available
      if (global.gc) {
        global.gc();
      }
      
      // Yield control to prevent blocking
      await new Promise(resolve => setImmediate(resolve));
    }
    
    return results;
  }

  /**
   * Convert HTML string to Markdown
   * @param html - HTML string to convert
   * @returns ConversionResult with markdown and metadata
   */
  public convert(html: string): ConversionResult {
    if (!html || typeof html !== 'string') {
      throw new Error('Invalid HTML input: must be a non-empty string');
    }

    return this.parser.convert(html);
  }

  /**
   * Convert HTML to Markdown with custom options for this conversion
   * @param html - HTML string to convert
   * @param options - Conversion options for this specific conversion
   * @returns ConversionResult with markdown and metadata
   */
  public convertWithOptions(html: string, options: ConversionOptions): ConversionResult {
    const tempParser = new HTMLToMDParser(options);
    return tempParser.convert(html);
  }

  public dispose(): void {
    // Clean up any resources
    if (this.parser) {
      (this.parser as any).cleanup?.();
    }
  }
}

/**
 * Convenience function for quick HTML to Markdown conversion
 * @param html - HTML string to convert
 * @param options - Optional conversion options
 * @returns ConversionResult with markdown and metadata
 */
export function htmlToMarkdown(html: string, options: ConversionOptions = {}): ConversionResult {
  const extractor = new HTMLToMarkdownExtractor(options);
  return extractor.convert(html);
}

/**
 * Convenience function specifically for email HTML conversion
 * Uses optimized settings for email content
 * @param emailHtml - Email HTML string to convert
 * @param options - Optional conversion options (will be merged with email defaults)
 * @returns ConversionResult with markdown and metadata
 */
export function emailToMarkdown(emailHtml: string, options: ConversionOptions = {}): ConversionResult {
    
  const cleanedHtml = removeMemoryIntensiveElements(emailHtml);

  const emailOptions: ConversionOptions = {
    preserveEmailHeaders: true,
    handleEmailSignatures: true,
    convertInlineStyles: true,
    preserveEmailQuotes: true,
    handleOutlookSpecific: true,
    tableHandling: 'convert',
    linkStyle: 'inlined',
    trimWhitespace: true,
    ...options // User options override defaults
  };

  const extractor = new HTMLToMarkdownExtractor(emailOptions);
  return extractor.convert(cleanedHtml);
}

function removeMemoryIntensiveElements(html: string): string {
    return html
      // Remove large embedded images
      .replace(/<img[^>]*src="data:image\/[^"]{1000,}"[^>]*>/gi, '[Large embedded image removed]')
      // Remove excessive style blocks
      .replace(/<style[^>]*>[\s\S]{5000,}?<\/style>/gi, '')
      // Remove long script blocks
      .replace(/<script[^>]*>[\s\S]{1000,}?<\/script>/gi, '')
      // Limit very long attribute values
      .replace(/(\w+)="[^"]{1000,}"/g, '$1="[Long attribute truncated]"');
}

// Export types for users
export * from './types';

// Export main classes for advanced usage
export { HTMLToMDParser } from './core/parser';
export { EmailRules } from './rules/email-rules';
export { BaseRules } from './rules/base-rules';
export { DOMUtils } from './utils/dom-utils';
export { TextUtils } from './utils/text-utils';
export { EmailUtils } from './utils/email-utils';

// Default export
export default HTMLToMarkdownExtractor;