// src/core/parser.ts

import { ConversionOptions, ConversionResult, EmailContext, ParsedNode } from '../types';
import { EmailRules } from '../rules/email-rules';
import { BaseRules } from '../rules/base-rules';
import { DOMUtils } from '../utils/dom-utils';
import { EmailUtils } from '../utils/email-utils';
import { TextUtils } from '../utils/text-utils';
import { Converter } from './converter';

// Server-side node type constants - no dependency on browser globals
const SERVER_NODE_TYPES = {
  ELEMENT_NODE: 1,
  TEXT_NODE: 3,
  COMMENT_NODE: 8,
  DOCUMENT_NODE: 9,
  DOCUMENT_FRAGMENT_NODE: 11
} as const;

export class HTMLToMDParser {
  private options: ConversionOptions;
  private emailContext: EmailContext;
  private baseRules: BaseRules;
  private emailRules: EmailRules;
  private domUtils: DOMUtils;
  private emailUtils: EmailUtils;
  private textUtils: TextUtils;
  private readonly nodeTypes = SERVER_NODE_TYPES;
  private converter: Converter;

  constructor(options: ConversionOptions = {}) {
    this.options = {
      preserveWhitespace: false,
      trimWhitespace: true,
      bulletListMarker: '-',
      codeBlockStyle: 'fenced',
      fence: '```',
      emDelimiter: '*',
      strongDelimiter: '**',
      linkStyle: 'inlined',
      linkReferenceStyle: 'full',
      preserveEmailHeaders: true,
      handleEmailSignatures: true,
      convertInlineStyles: true,
      preserveEmailQuotes: true,
      handleOutlookSpecific: true,
      extractPlainTextFallback: false,
      tableHandling: 'convert',
      maxTableWidth: 120,
      ...options
    };

    this.domUtils = new DOMUtils();
    this.emailUtils = new EmailUtils();
    this.textUtils = new TextUtils();
    this.baseRules = new BaseRules(this.options);
    this.emailRules = new EmailRules(this.options);
    this.converter = new Converter(this.options);
    this.emailContext = this.initializeEmailContext();
  }

  public convert(html: string): ConversionResult {
    try {
      // Sanitize and prepare HTML
      const cleanedHtml = this.preprocessHTML(html);
      
      // Parse HTML into DOM
      const document = this.domUtils.parseHTML(cleanedHtml);
      
      // Detect email context
      this.emailContext = this.emailUtils.detectEmailContext(document as unknown as Document);
      
      // Extract metadata BEFORE converting (so DOM is still intact)
      const metadata = this.extractMetadata(document);
      
      // Convert to markdown using the converter
      const markdown = this.converter.convertNode(document.body || document, this.emailContext.isEmailContent);
      
      // Post-process markdown
      const finalMarkdown = this.postProcess(markdown);

      return {
        markdown: finalMarkdown,
        metadata
      };
    } catch (error: any) {
      throw new Error(`HTML to Markdown conversion failed: ${error.message}`);
    }
    finally {
        this.cleanup();
    }
  }

  private cleanup(): void {
    if (this.converter) {
      this.converter.cleanup();
    }
    this.emailContext = this.initializeEmailContext();
  }

  private preprocessHTML(html: string): string {
    let processed = html;

    // Remove script and style tags
    processed = processed.replace(/<(script|style)[^>]*>[\s\S]*?<\/\1>/gi, '');
    
    // Handle Outlook-specific elements
    if (this.options.handleOutlookSpecific) {
      processed = this.emailUtils.processOutlookHTML(processed);
    }

    // Convert common HTML entities
    processed = this.textUtils.decodeHTMLEntities(processed);
    
    // Only normalize whitespace if not preserving it
    if (!this.options.preserveWhitespace) {
      processed = processed.replace(/\s+/g, ' ').trim();
    }

    return processed;
  }

  private extractMetadata(document: any): any {
    const metadata: any = {};

    // Extract title
    const titleElement = this.findElement(document, 'title');
    if (titleElement) {
      metadata.title = titleElement.textContent?.trim();
    }

    // Extract email headers if present
    if (this.options.preserveEmailHeaders && this.emailContext.hasEmailHeaders) {
      metadata.emailHeaders = this.emailUtils.extractEmailHeaders(document);
    }

    // Extract images - FIXED: Now properly searches through the document
    metadata.images = this.extractImages(document);
    
    // Extract links - FIXED: Now properly searches through the document
    metadata.links = this.extractLinks(document);

    return metadata;
  }

  private findElement(document: any, tagName: string): any {
    // Try document.querySelector first
    if (document.querySelector) {
      return document.querySelector(tagName);
    }
    
    // Fallback: search through document tree
    const searchElement = (element: any): any => {
      if (element.tagName?.toLowerCase() === tagName.toLowerCase()) {
        return element;
      }
      
      const children = element.childNodes || element.children || [];
      for (let i = 0; i < children.length; i++) {
        const found = this.searchElement(children[i]);
        if (found) return found;
      }
      
      return null;
    };
    
    return searchElement(document);
  }

  private searchElement(element: any): any {
    if (!element || element.nodeType !== this.nodeTypes.ELEMENT_NODE) {
      return null;
    }
    
    const children = element.childNodes || element.children || [];
    for (let i = 0; i < children.length; i++) {
      const result = this.searchElement(children[i]);
      if (result) return result;
    }
    
    return null;
  }

  private findAllElements(document: any, tagName: string): any[] {
    const results: any[] = [];
    
    // Try document.querySelectorAll first
    if (document.querySelectorAll) {
      const elements = document.querySelectorAll(tagName);
      for (let i = 0; i < elements.length; i++) {
        results.push(elements[i]);
      }
      return results;
    }
    
    // Fallback: search through document tree
    const searchElements = (element: any) => {
      if (element.tagName?.toLowerCase() === tagName.toLowerCase()) {
        results.push(element);
      }
      
      const children = element.childNodes || element.children || [];
      for (let i = 0; i < children.length; i++) {
        searchElements(children[i]);
      }
    };
    
    searchElements(document);
    return results;
  }

  private extractImages(document: any): any[] {
    const images: any[] = [];
    const imgElements = this.findAllElements(document, 'img');

    for (let i = 0; i < imgElements.length; i++) {
      const img = imgElements[i];
      images.push({
        src: img.getAttribute ? (img.getAttribute('src') || '') : '',
        alt: img.getAttribute ? (img.getAttribute('alt') || '') : '',
        title: img.getAttribute ? (img.getAttribute('title') || '') : '',
        isInline: this.emailUtils.isInlineImage(img)
      });
    }

    return images;
  }

  private extractLinks(document: any): any[] {
    const links: any[] = [];
    const linkElements = this.findAllElements(document, 'a');

    for (let i = 0; i < linkElements.length; i++) {
      const link = linkElements[i];
      const href = link.getAttribute ? (link.getAttribute('href') || '') : '';
      if (href) { // Only include links with href
        links.push({
          href,
          text: link.textContent?.trim() || '',
          title: link.getAttribute ? (link.getAttribute('title') || '') : '',
          isEmail: href.startsWith('mailto:')
        });
      }
    }

    return links;
  }

  private postProcess(markdown: string): string {
    let processed = markdown;

    // Remove excessive blank lines
    processed = processed.replace(/\n{3,}/g, '\n\n');

    // Trim whitespace if enabled
    if (this.options.trimWhitespace) {
      processed = processed.trim();
    }

    // Fix markdown formatting issues
    processed = this.textUtils.fixMarkdownFormatting(processed);

    return processed;
  }

  private initializeEmailContext(): EmailContext {
    return {
      isEmailContent: false,
      hasEmailHeaders: false,
      hasSignature: false,
      hasQuotedContent: false,
      clientType: 'other'
    };
  }
}