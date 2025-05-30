// src/core/sanitizer.ts

import { ConversionOptions } from '../types';

export interface SanitizationOptions {
  allowedTags?: string[];
  forbiddenTags?: string[];
  allowedAttributes?: Record<string, string[]>;
  removeEmptyElements?: boolean;
  preserveWhitespace?: boolean;
  removeComments?: boolean;
  removeScripts?: boolean;
  removeStyles?: boolean;
  fixMalformedHTML?: boolean;
}

export class Sanitizer {
  private options: SanitizationOptions;

  constructor(conversionOptions: ConversionOptions) {
    this.options = {
      allowedTags: conversionOptions.keepElements,
      forbiddenTags: conversionOptions.ignoreElements,
      allowedAttributes: {
        'a': ['href', 'title', 'target'],
        'img': ['src', 'alt', 'title', 'width', 'height'],
        'table': ['border', 'cellpadding', 'cellspacing', 'width'],
        'td': ['colspan', 'rowspan', 'align', 'valign'],
        'th': ['colspan', 'rowspan', 'align', 'valign'],
        '*': ['id', 'class', 'style', 'dir', 'lang']
      },
      removeEmptyElements: true,
      preserveWhitespace: conversionOptions.preserveWhitespace || false,
      removeComments: true,
      removeScripts: true,
      removeStyles: false, // Keep for email style processing
      fixMalformedHTML: true
    };
  }

  public sanitize(html: string): string {
    let sanitized = html;

    // Remove or clean dangerous elements
    if (this.options.removeScripts) {
      sanitized = this.removeScripts(sanitized);
    }

    if (this.options.removeComments) {
      sanitized = this.removeComments(sanitized);
    }

    // Fix common HTML issues
    if (this.options.fixMalformedHTML) {
      sanitized = this.fixMalformedHTML(sanitized);
    }

    // Clean up whitespace
    if (!this.options.preserveWhitespace) {
      sanitized = this.normalizeWhitespace(sanitized);
    }

    // Remove forbidden tags
    if (this.options.forbiddenTags) {
      sanitized = this.removeForbiddenTags(sanitized);
    }

    // Remove empty elements
    if (this.options.removeEmptyElements) {
      sanitized = this.removeEmptyElements(sanitized);
    }

    return sanitized;
  }

  private removeScripts(html: string): string {
    // Remove script tags and their content
    return html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  }

  private removeComments(html: string): string {
    // Remove HTML comments but preserve conditional comments for Outlook
    return html.replace(/<!--(?!\[if)[\s\S]*?-->/g, '');
  }

  private fixMalformedHTML(html: string): string {
    let fixed = html;

    // Fix unclosed tags (basic heuristic)
    const selfClosingTags = ['br', 'hr', 'img', 'input', 'meta', 'link', 'area', 'base', 'col', 'embed', 'source', 'track', 'wbr'];
    
    selfClosingTags.forEach(tag => {
      // Ensure self-closing tags are properly closed
      const regex = new RegExp(`<${tag}([^>]*?)(?<!/)>`, 'gi');
      fixed = fixed.replace(regex, `<${tag}$1 />`);
    });

    // Fix common entity issues
    fixed = fixed.replace(/&(?![a-zA-Z][a-zA-Z0-9]*;|#[0-9]+;|#x[0-9a-fA-F]+;)/g, '&amp;');

    // Fix quotes in attributes
    fixed = fixed.replace(/(\w+)=([^"'\s>]+)(?=\s|>)/g, '$1="$2"');

    // Remove duplicate whitespace in attributes
    fixed = fixed.replace(/\s+/g, ' ');

    return fixed;
  }

  private normalizeWhitespace(html: string): string {
    let normalized = html;

    // Normalize line breaks
    normalized = normalized.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

    // Remove excessive whitespace but preserve structure
    normalized = normalized.replace(/\n\s*\n\s*\n/g, '\n\n');

    // Normalize spaces within text but preserve intentional formatting
    normalized = normalized.replace(/[ \t]+/g, ' ');

    // Trim whitespace around block elements
    normalized = normalized.replace(/>\s+</g, '><');

    return normalized.trim();
  }

  private removeForbiddenTags(html: string): string {
    if (!this.options.forbiddenTags || this.options.forbiddenTags.length === 0) {
      return html;
    }

    let result = html;
    
    this.options.forbiddenTags.forEach(tag => {
      // Remove opening and closing tags but keep content
      const regex = new RegExp(`<\\/?${tag}\\b[^>]*>`, 'gi');
      result = result.replace(regex, '');
    });

    return result;
  }

  private removeEmptyElements(html: string): string {
    let result = html;
    let changed = true;

    // Keep iterating until no more empty elements are found
    while (changed) {
      const before = result;
      
      // Remove empty tags (but preserve self-closing tags and br/hr)
      result = result.replace(/<(?!br|hr|img|input|meta|link|area|base|col|embed|source|track|wbr)([a-zA-Z][a-zA-Z0-9]*)\b[^>]*>\s*<\/\1>/gi, '');
      
      // Remove elements that only contain whitespace
      result = result.replace(/<([a-zA-Z][a-zA-Z0-9]*)\b[^>]*>[\s\n\r]*<\/\1>/gi, '');
      
      changed = before !== result;
    }

    return result;
  }

  public sanitizeAttributes(element: Element): void {
    if (!this.options.allowedAttributes) {
      return;
    }

    const tagName = element.tagName.toLowerCase();
    const allowedForTag = this.options.allowedAttributes[tagName] || [];
    const allowedGlobal = this.options.allowedAttributes['*'] || [];
    const allowedAttributes = [...allowedForTag, ...allowedGlobal];

    // Remove attributes not in the allowed list
    const attributesToRemove: string[] = [];
    
    for (let i = 0; i < element.attributes.length; i++) {
      const attr = element.attributes[i];
      if (!allowedAttributes.includes(attr.name)) {
        attributesToRemove.push(attr.name);
      }
    }

    attributesToRemove.forEach(attrName => {
      element.removeAttribute(attrName);
    });
  }

  public isValidElement(element: Element): boolean {
    const tagName = element.tagName.toLowerCase();

    // Check against forbidden tags
    if (this.options.forbiddenTags?.includes(tagName)) {
      return false;
    }

    // Check against allowed tags (if specified)
    if (this.options.allowedTags && !this.options.allowedTags.includes(tagName)) {
      return false;
    }

    return true;
  }

  public preProcessEmailHTML(html: string): string {
    let processed = html;

    // Remove email client specific artifacts
    processed = this.removeEmailClientArtifacts(processed);

    // Clean up email-specific formatting
    processed = this.cleanEmailFormatting(processed);

    // Handle base64 encoded content
    processed = this.handleBase64Content(processed);

    return processed;
  }

  private removeEmailClientArtifacts(html: string): string {
    let cleaned = html;

    // Remove Gmail-specific elements that don't add value
    cleaned = cleaned.replace(/<div class="gmail_extra">[\s\S]*?<\/div>/gi, '');
    
    // Remove Yahoo-specific artifacts
    cleaned = cleaned.replace(/<div class="yahoo_quoted">[\s\S]*?<\/div>/gi, '');

    // Remove tracking pixels
    cleaned = cleaned.replace(/<img[^>]*width="1"[^>]*height="1"[^>]*>/gi, '');
    cleaned = cleaned.replace(/<img[^>]*height="1"[^>]*width="1"[^>]*>/gi, '');

    // Remove empty font tags (common in email)
    cleaned = cleaned.replace(/<font[^>]*>\s*<\/font>/gi, '');

    return cleaned;
  }

  private cleanEmailFormatting(html: string): string {
    let cleaned = html;

    // Convert non-breaking spaces in email content
    cleaned = cleaned.replace(/&nbsp;/g, ' ');

    // Clean up excessive line breaks in email
    cleaned = cleaned.replace(/(<br\s*\/?>\s*){3,}/gi, '<br><br>');

    // Remove email client specific CSS
    cleaned = cleaned.replace(/mso-[^;:]+:[^;]+;?/gi, '');
    cleaned = cleaned.replace(/-webkit-[^;:]+:[^;]+;?/gi, '');

    return cleaned;
  }

  private handleBase64Content(html: string): string {
    // Handle base64 encoded images (preserve them as-is for now)
    // Could be extended to extract and reference separately
    return html;
  }

  public postProcessMarkdown(markdown: string): string {
    let processed = markdown;

    // Remove excessive blank lines
    processed = processed.replace(/\n{4,}/g, '\n\n\n');

    // Clean up spacing around headers
    processed = processed.replace(/\n+(#{1,6}\s)/g, '\n\n$1');
    processed = processed.replace(/(#{1,6}\s[^\n]+)\n+/g, '$1\n\n');

    // Clean up list formatting
    processed = processed.replace(/\n+(\s*[-*+]\s)/g, '\n$1');

    // Fix spacing around blockquotes
    processed = processed.replace(/\n+(>\s)/g, '\n\n$1');

    // Remove trailing whitespace
    processed = processed.replace(/[ \t]+$/gm, '');

    // Ensure file ends with single newline
    processed = processed.replace(/\n*$/, '\n');

    return processed;
  }
}