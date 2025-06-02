import { ConversionOptions } from '../types';
import { BaseRules } from '../rules/base-rules';
import { EmailRules } from '../rules/email-rules';
import { CustomRules } from '../rules/custom-rules';
import { TextUtils } from '../utils/text-utils';
import { DOMUtils } from '../utils/dom-utils';

// Server-side node type constants - no dependency on browser globals
const SERVER_NODE_TYPES = {
  ELEMENT_NODE: 1,
  TEXT_NODE: 3,
  COMMENT_NODE: 8,
  DOCUMENT_NODE: 9,
  DOCUMENT_FRAGMENT_NODE: 11
} as const;

export class Converter {
  private options: ConversionOptions;
  private baseRules: BaseRules;
  private emailRules: EmailRules;
  private customRules: CustomRules;
  private textUtils: TextUtils;
  private domUtils: DOMUtils;
  private linkReferences: Map<string, { url: string; title?: string }>;
  private linkCounter: number;
  private readonly nodeTypes = SERVER_NODE_TYPES;
  private processedNodes = new WeakSet(); // Prevent infinite loops

  constructor(options: ConversionOptions) {
    this.options = options;
    this.baseRules = new BaseRules(options);
    this.emailRules = new EmailRules(options);
    this.customRules = new CustomRules(options.customRules || []);
    this.textUtils = new TextUtils();
    this.domUtils = new DOMUtils();
    this.linkReferences = new Map();
    this.linkCounter = 1;
  }

  public convertNode(node: any, isEmailContent: boolean = false): string {
    // Prevent infinite loops and memory issues
    if (this.processedNodes.has(node)) {
      return '';
    }
    this.processedNodes.add(node);

    // Use our server-side node type constants
    if (node.nodeType === this.nodeTypes.TEXT_NODE) {
      return this.convertTextNode(node);
    }

    if (node.nodeType === this.nodeTypes.ELEMENT_NODE) {
      return this.convertElementNode(node, isEmailContent);
    }

    if (node.nodeType === this.nodeTypes.COMMENT_NODE) {
      return '';
    }

    return '';
  }

  private convertTextNode(textNode: any): string {
    let text = textNode.textContent || '';

    // FIXED: Whitespace handling based on preserveWhitespace option
    if (!this.options.preserveWhitespace) {
      // Normal mode: collapse multiple spaces to single space
      text = text.replace(/[ \t]+/g, ' ');
      
      const parent = textNode.parentElement;
      if (parent && this.isBlockElement(parent)) {
        text = text.replace(/^\s+|\s+$/g, '');
      }
    } else {
      // Preserve mode: keep all whitespace as-is
      // Don't modify the text at all
    }

    // Only escape if there's actual content and not in preserve mode
    if (!text || (this.options.preserveWhitespace && /^\s*$/.test(text))) {
      return text; // Return as-is if empty or just whitespace in preserve mode
    }

    // Don't escape text in preserve whitespace mode to avoid artifacts
    return this.options.preserveWhitespace ? text : this.textUtils.escapeMarkdown(text);
  }

  private convertElementNode(element: any, isEmailContent: boolean): string {
    const tagName = element.tagName?.toLowerCase() || 'div';

    if (this.options.ignoreElements?.includes(tagName)) {
      return '';
    }

    // Process children first to get content
    const childContent = this.processChildren(element, isEmailContent);

    // Apply rules in order of precedence
    const customRule = this.customRules.getRule(tagName);
    if (customRule) {
      return this.applyRule(customRule, element, childContent);
    }

    if (isEmailContent) {
      const emailRule = this.emailRules.getRule(tagName);
      if (emailRule) {
        return this.applyRule(emailRule, element, childContent);
      }
    }

    const baseRule = this.baseRules.getRule(tagName);
    if (baseRule) {
      return this.applyRule(baseRule, element, childContent);
    }

    // Default: return child content
    return childContent;
  }

  private applyRule(rule: any, element: any, childContent: string): string {
    try {
      return rule.apply(element, childContent);
    } catch (error) {
      console.warn(`Error applying rule for ${element.tagName}:`, error);
      return childContent;
    }
  }

  private processChildren(element: any, isEmailContent: boolean): string {
    const children = element.childNodes || [];
    const results: string[] = [];

    for (let i = 0; i < children.length; i++) {
      const child = children[i];
      
      // Skip if already processed
      if (this.processedNodes.has(child)) {
        continue;
      }
      
      const converted = this.convertNode(child, isEmailContent);
      
      if (converted) {
        // Add spacing between inline elements if needed (but not in preserve whitespace mode)
        if (!this.options.preserveWhitespace && i > 0 && this.needsSpacing(children[i - 1], child)) {
          results.push(' ');
        }
        results.push(converted);
      }
    }

    return results.join('');
  }

  private needsSpacing(prevNode: any, currentNode: any): boolean {
    if (prevNode.nodeType === this.nodeTypes.ELEMENT_NODE && 
        currentNode.nodeType === this.nodeTypes.ELEMENT_NODE) {
      
      const prevIsInline = this.isInlineElement(prevNode);
      const currentIsInline = this.isInlineElement(currentNode);
      
      return prevIsInline && currentIsInline;
    }
    
    return false;
  }

  private isBlockElement(element: any): boolean {
    const blockElements = [
      'div', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'blockquote', 'pre', 'ul', 'ol', 'li', 'table',
      'tr', 'td', 'th', 'thead', 'tbody', 'tfoot',
      'section', 'article', 'header', 'footer', 'main',
      'aside', 'nav', 'form', 'fieldset', 'hr'
    ];
    
    const tagName = element.tagName?.toLowerCase() || '';
    return blockElements.includes(tagName);
  }

  private isInlineElement(element: any): boolean {
    const inlineElements = [
      'span', 'a', 'strong', 'b', 'em', 'i', 'u', 's',
      'strike', 'del', 'ins', 'mark', 'small', 'sub',
      'sup', 'code', 'kbd', 'samp', 'var', 'abbr',
      'acronym', 'cite', 'dfn', 'time', 'img'
    ];
    
    const tagName = element.tagName?.toLowerCase() || '';
    return inlineElements.includes(tagName);
  }

  public reset(): void {
    this.linkReferences.clear();
    this.linkCounter = 1;
    this.processedNodes = new WeakSet();
  }

  public setOptions(options: ConversionOptions): void {
    this.options = { ...this.options, ...options };
  }
  
  public cleanup(): void {
    this.linkReferences.clear();
    this.linkCounter = 1;
    this.processedNodes = new WeakSet();
    
    // Clear rule caches
    if (this.baseRules?.clearCache) {
      this.baseRules.clearCache();
    }
    
    // Clear text utils cache
    if (TextUtils.clearRegexCache) {
      TextUtils.clearRegexCache();
    }
  }
}