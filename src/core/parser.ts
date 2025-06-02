// src/core/parser.ts

import { ConversionOptions, ConversionResult, EmailContext, ParsedNode } from '../types';
import { EmailRules } from '../rules/email-rules';
import { BaseRules } from '../rules/base-rules';
import { DOMUtils } from '../utils/dom-utils';
import { EmailUtils } from '../utils/email-utils';
import { TextUtils } from '../utils/text-utils';
import { Converter } from './converter';

export class HTMLToMDParser {
  private options: ConversionOptions;
  private emailContext: EmailContext;
  private baseRules: BaseRules;
  private emailRules: EmailRules;
  private domUtils: DOMUtils;
  private emailUtils: EmailUtils;
  private textUtils: TextUtils;

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
    this.emailContext = this.initializeEmailContext();
  }

  private converterInstance?: Converter;
  public convert(html: string): ConversionResult {
    try {
      // Sanitize and prepare HTML
      const cleanedHtml = this.preprocessHTML(html);
      
      // Parse HTML into DOM
      const document = this.domUtils.parseHTML(cleanedHtml);
      
      // Detect email context
      this.emailContext = this.emailUtils.detectEmailContext(document as unknown as Document);
      
      // Extract metadata
      const metadata = this.extractMetadata(document as unknown as Document);
      
      // Convert to markdown
      const markdown = this.processDocument(document as unknown as Document);
      
      // Post-process markdown
      const finalMarkdown = this.postProcess(markdown as string);

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
    if (this.converterInstance) {
      this.converterInstance.cleanup();
    }
    // Clear any other accumulated state
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
    
    // Normalize whitespace in HTML
    processed = processed.replace(/\s+/g, ' ').trim();

    return processed;
  }

  private processDocument(document: Document): string {
    const body = document.body || document.documentElement;
    return this.processNode(body);
  }

  private processNode(node: Node): string {
    if (node.nodeType === Node.TEXT_NODE) {
      return this.processTextNode(node as Text);
    }

    if (node.nodeType === Node.ELEMENT_NODE) {
      return this.processElementNode(node as Element);
    }

    return '';
  }

  private processTextNode(textNode: Text): string {
    let text = textNode.textContent || '';
    
    if (!this.options.preserveWhitespace) {
      text = text.replace(/\s+/g, ' ');
    }

    return this.textUtils.escapeMarkdown(text);
  }

  private processElementNode(element: Element): string {
    const tagName = element.tagName.toLowerCase();
    
    // Check if element should be ignored
    if (this.options.ignoreElements?.includes(tagName)) {
      return '';
    }

    // Apply email-specific rules first
    if (this.emailContext.isEmailContent) {
      const emailRule = this.emailRules.getRule(tagName);
      if (emailRule) {
        return emailRule.apply(element, this.processChildren(element));
      }
    }

    // Apply base conversion rules
    const baseRule = this.baseRules.getRule(tagName);
    if (baseRule) {
      return baseRule.apply(element, this.processChildren(element));
    }

    // Default: return children content
    return this.processChildren(element);
  }

  private processChildren(element: Element): string {
    let result = '';
    
    for (const child of Array.from(element.childNodes)) {
      result += this.processNode(child);
    }

    return result;
  }

  private extractMetadata(document: Document): any {
    const metadata: any = {};

    // Extract title
    const titleElement = document.querySelector('title');
    if (titleElement) {
      metadata.title = titleElement.textContent?.trim();
    }

    // Extract email headers if present
    if (this.options.preserveEmailHeaders && this.emailContext.hasEmailHeaders) {
      metadata.emailHeaders = this.emailUtils.extractEmailHeaders(document);
    }

    // Extract images
    metadata.images = this.extractImages(document);
    
    // Extract links
    metadata.links = this.extractLinks(document);

    return metadata;
  }

  private extractImages(document: Document): any[] {
    const images: any[] = [];
    const imgElements = document.querySelectorAll('img');

    imgElements.forEach(img => {
      images.push({
        src: img.getAttribute('src') || '',
        alt: img.getAttribute('alt') || '',
        title: img.getAttribute('title') || '',
        isInline: this.emailUtils.isInlineImage(img)
      });
    });

    return images;
  }

  private extractLinks(document: Document): any[] {
    const links: any[] = [];
    const linkElements = document.querySelectorAll('a[href]');

    linkElements.forEach(link => {
      const href = link.getAttribute('href') || '';
      links.push({
        href,
        text: link.textContent?.trim() || '',
        title: link.getAttribute('title') || '',
        isEmail: href.startsWith('mailto:')
      });
    });

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