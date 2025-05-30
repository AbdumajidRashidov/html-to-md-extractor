// src/utils/email-utils.ts

import { EmailContext, EmailHeaders } from '../types';

export class EmailUtils {
  detectEmailContext(document: Document): EmailContext {
    const context: EmailContext = {
      isEmailContent: false,
      hasEmailHeaders: false,
      hasSignature: false,
      hasQuotedContent: false,
      clientType: 'other'
    };

    // Detect email content indicators
    const emailIndicators = [
      '[id*="gmail"]', '[class*="gmail"]',
      '[id*="outlook"]', '[class*="outlook"]', '[class*="mso"]',
      '[class*="yahoo"]', '[id*="yahoo"]',
      '[class*="signature"]', '[class*="quoted"]',
      'blockquote[type="cite"]',
      '[class*="email"]', '[id*="email"]'
    ];

    context.isEmailContent = emailIndicators.some(selector => 
      document.querySelector(selector) !== null
    );

    // Additional heuristics for email detection
    if (!context.isEmailContent) {
      context.isEmailContent = this.detectEmailByContent(document);
    }

    // Detect email headers
    context.hasEmailHeaders = this.hasEmailHeaders(document);

    // Detect signature
    context.hasSignature = this.hasSignature(document);

    // Detect quoted content
    context.hasQuotedContent = this.hasQuotedContent(document);

    // Detect client type
    context.clientType = this.detectClientType(document) as EmailContext['clientType'];

    return context;
  }

  private detectEmailByContent(document: Document): boolean {
    const bodyText = document.body?.textContent?.toLowerCase() || '';
    
    // Common email phrases
    const emailPhrases = [
      'from:', 'to:', 'subject:', 'sent from', 'best regards',
      'sincerely', 'kind regards', 'thanks', 'forwarded message',
      'original message', 'reply to', 'cc:', 'bcc:'
    ];

    return emailPhrases.some(phrase => bodyText.includes(phrase));
  }

  private hasEmailHeaders(document: Document): boolean {
    const headerSelectors = [
      '[id*="header"]', '[class*="header"]',
      '[class*="from"]', '[class*="to"]', '[class*="subject"]',
      '[class*="date"]', '[class*="sender"]'
    ];

    if (headerSelectors.some(selector => document.querySelector(selector))) {
      return true;
    }

    // Check for structured email data
    const metaTags = document.querySelectorAll('meta[name*="email"], meta[property*="email"]');
    return metaTags.length > 0;
  }

  private hasSignature(document: Document): boolean {
    const signatureSelectors = [
      '[class*="signature"]', '[id*="signature"]',
      '[class*="sig"]', '[id*="sig"]',
      '[class*="footer"]', '[id*="footer"]'
    ];

    if (signatureSelectors.some(selector => document.querySelector(selector))) {
      return true;
    }

    // Heuristic: look for signature patterns in text
    const bodyText = document.body?.textContent || '';
    const signaturePatterns = [
      /best regards,?\s*\n/i,
      /sincerely,?\s*\n/i,
      /kind regards,?\s*\n/i,
      /sent from my \w+/i,
      /--\s*\n/
    ];

    return signaturePatterns.some(pattern => pattern.test(bodyText));
  }

  private hasQuotedContent(document: Document): boolean {
    const quotedSelectors = [
      'blockquote', '[class*="quoted"]', '[class*="gmail_quote"]',
      '[class*="yahoo_quoted"]', '[dir="ltr"]', '[class*="quote"]',
      '[id*="quote"]'
    ];

    if (quotedSelectors.some(selector => document.querySelector(selector))) {
      return true;
    }

    // Check for quoted text patterns
    const bodyText = document.body?.textContent || '';
    return /^>\s/m.test(bodyText) || /wrote:$/m.test(bodyText);
  }

  private detectClientType(document: Document): string {
    const detectionRules = [
      { type: 'gmail', selectors: ['[class*="gmail"]', '[id*="gmail"]'] },
      { type: 'outlook', selectors: ['[class*="outlook"]', '[class*="mso"]', '.WordSection'] },
      { type: 'yahoo', selectors: ['[class*="yahoo"]', '[id*="yahoo"]'] },
      { type: 'apple', selectors: ['[class*="apple"]', '[id*="applemail"]'] },
      { type: 'thunderbird', selectors: ['[class*="thunderbird"]', '[class*="moz"]'] }
    ];

    for (const rule of detectionRules) {
      if (rule.selectors.some(selector => document.querySelector(selector))) {
        return rule.type;
      }
    }

    // Check meta tags for client information
    const generator = document.querySelector('meta[name="generator"]')?.getAttribute('content')?.toLowerCase();
    if (generator) {
      if (generator.includes('outlook')) return 'outlook';
      if (generator.includes('apple')) return 'apple';
      if (generator.includes('thunderbird')) return 'thunderbird';
    }

    return 'other';
  }

  extractEmailHeaders(document: Document): EmailHeaders {
    const headers: EmailHeaders = {};

    // Try structured approach first
    headers.from = this.extractHeaderValue(document, ['from', 'sender']);
    headers.subject = this.extractHeaderValue(document, ['subject']);
    headers.date = this.extractHeaderValue(document, ['date', 'sent']);

    // Extract recipients
    const to = this.extractHeaderValue(document, ['to', 'recipient']);
    if (to) headers.to = this.parseEmailList(to);

    const cc = this.extractHeaderValue(document, ['cc']);
    if (cc) headers.cc = this.parseEmailList(cc);

    const bcc = this.extractHeaderValue(document, ['bcc']);
    if (bcc) headers.bcc = this.parseEmailList(bcc);

    // Try to extract from text content if structured approach failed
    if (!headers.from && !headers.subject) {
      this.extractHeadersFromText(document, headers);
    }

    return headers;
  }

  private extractHeaderValue(document: Document, fieldNames: string[]): string | undefined {
    for (const fieldName of fieldNames) {
      // Try class-based selectors
      let element = document.querySelector(`[class*="${fieldName}"]`);
      if (element) return element.textContent?.trim();

      // Try id-based selectors
      element = document.querySelector(`[id*="${fieldName}"]`);
      if (element) return element.textContent?.trim();

      // Try data attributes
      element = document.querySelector(`[data-${fieldName}]`);
      if (element) return element.getAttribute(`data-${fieldName}`)?.trim();
    }

    return undefined;
  }

  private parseEmailList(emailString: string): string[] {
    return emailString
      .split(/[,;]/)
      .map(email => email.trim().replace(/[<>]/g, ''))
      .filter(email => email.includes('@'));
  }

  private extractHeadersFromText(document: Document, headers: EmailHeaders): void {
    const text = document.body?.textContent || '';
    
    // Common email header patterns
    const patterns = [
      { field: 'from', regex: /from:\s*([^\n]+)/i },
      { field: 'to', regex: /to:\s*([^\n]+)/i },
      { field: 'subject', regex: /subject:\s*([^\n]+)/i },
      { field: 'date', regex: /date:\s*([^\n]+)/i },
      { field: 'sent', regex: /sent:\s*([^\n]+)/i }
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern.regex);
      if (match) {
        const value = match[1].trim();
        if (pattern.field === 'from' && !headers.from) {
          headers.from = value;
        } else if (pattern.field === 'to' && !headers.to) {
          headers.to = this.parseEmailList(value);
        } else if (pattern.field === 'subject' && !headers.subject) {
          headers.subject = value;
        } else if ((pattern.field === 'date' || pattern.field === 'sent') && !headers.date) {
          headers.date = value;
        }
      }
    }
  }

  processOutlookHTML(html: string): string {
    let processed = html;

    // Remove XML declarations and namespaces
    processed = processed.replace(/<\?xml[^>]*>/gi, '');
    processed = processed.replace(/xmlns:[^=]*="[^"]*"/gi, '');

    // Convert Outlook-specific elements
    processed = processed.replace(/<o:p[^>]*>/gi, '<p>');
    processed = processed.replace(/<\/o:p>/gi, '</p>');

    // Remove Outlook conditional comments
    processed = processed.replace(/<!--\[if[^>]*>[\s\S]*?<!\[endif\]-->/gi, '');

    // Remove MSO styles but keep structure
    processed = processed.replace(/\bmso-[^;:]+:[^;]+;?/gi, '');
    processed = processed.replace(/\b-webkit-[^;:]+:[^;]+;?/gi, '');

    // Clean up WordSection divs
    processed = processed.replace(/<div[^>]*class="?WordSection\d*"?[^>]*>/gi, '<div>');

    // Convert MsoNormal paragraphs
    processed = processed.replace(/<p[^>]*class="?MsoNormal"?[^>]*>/gi, '<p>');

    // Remove empty MSO elements
    processed = processed.replace(/<span[^>]*mso[^>]*>\s*<\/span>/gi, '');

    return processed;
  }

  isInlineImage(img: Element): boolean {
    const src = img.getAttribute('src') || '';
    
    // CID (Content-ID) references
    if (src.startsWith('cid:')) return true;
    
    // Data URLs (base64 encoded)
    if (src.startsWith('data:')) return true;
    
    // Blob URLs
    if (src.startsWith('blob:')) return true;
    
    // Check for Outlook-specific inline references
    if (src.includes('image001') || src.includes('image002')) return true;
    
    return false;
  }

  extractQuotedContent(element: Element): { content: string; attribution?: string } {
    const content = element.textContent?.trim() || '';
    
    // Try to find attribution (e.g., "On [date], [person] wrote:")
    const attributionPatterns = [
      /On .+?, .+ wrote:/i,
      /From: .+/i,
      /.+ wrote:/i,
      /Sent from .+/i
    ];

    let attribution: string | undefined;
    
    for (const pattern of attributionPatterns) {
      const match = content.match(pattern);
      if (match) {
        attribution = match[0];
        break;
      }
    }

    return { content, attribution };
  }

  cleanEmailSignature(signature: string): string {
    let cleaned = signature;
    
    // Remove common signature delimiters
    cleaned = cleaned.replace(/^--\s*$/gm, '');
    cleaned = cleaned.replace(/^_+$/gm, '');
    
    // Clean up excessive spacing
    cleaned = cleaned.replace(/\n{3,}/g, '\n\n');
    cleaned = cleaned.trim();
    
    return cleaned;
  }

  parseEmailAddress(emailString: string): { name?: string; email: string } {
    // Handle formats like "John Doe <john@example.com>" or "john@example.com"
    const match = emailString.match(/^(.+?)\s*<([^>]+)>$/) || 
                  emailString.match(/^([^@]+@[^@]+)$/);
    
    if (match) {
      if (match.length === 3) {
        return { name: match[1].trim(), email: match[2].trim() };
      } else {
        return { email: match[1].trim() };
      }
    }
    
    return { email: emailString.trim() };
  }
}