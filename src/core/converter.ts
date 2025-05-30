// src/core/converter.ts

import { ConversionOptions, ConversionResult, ConversionRule } from '../types';
import { BaseRules } from '../rules/base-rules';
import { EmailRules } from '../rules/email-rules';
import { CustomRules } from '../rules/custom-rules';
import { TextUtils } from '../utils/text-utils';
import { DOMUtils } from '../utils/dom-utils';

export class Converter {
  private options: ConversionOptions;
  private baseRules: BaseRules;
  private emailRules: EmailRules;
  private customRules: CustomRules;
  private textUtils: TextUtils;
  private domUtils: DOMUtils;
  private linkReferences: Map<string, { url: string; title?: string }>;
  private linkCounter: number;

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

  public convertNode(node: Node, isEmailContent: boolean = false): string {
    if (node.nodeType === Node.TEXT_NODE) {
      return this.convertTextNode(node as Text);
    }

    if (node.nodeType === Node.ELEMENT_NODE) {
      return this.convertElementNode(node as Element, isEmailContent);
    }

    if (node.nodeType === Node.COMMENT_NODE) {
      return this.convertCommentNode(node as Comment);
    }

    return '';
  }

  private convertTextNode(textNode: Text): string {
    let text = textNode.textContent || '';

    // Handle whitespace based on options
    if (!this.options.preserveWhitespace) {
      // Normalize whitespace but preserve intentional line breaks
      text = text.replace(/[ \t]+/g, ' ');
      
      // Only trim if it's not significant whitespace
      const parent = textNode.parentElement;
      if (parent && this.isBlockElement(parent)) {
        text = text.replace(/^\s+|\s+$/g, '');
      }
    }

    // Escape markdown characters in text content
    return this.textUtils.escapeMarkdown(text);
  }

  private convertElementNode(element: Element, isEmailContent: boolean): string {
    const tagName = element.tagName.toLowerCase();

    // Skip ignored elements
    if (this.options.ignoreElements?.includes(tagName)) {
      return '';
    }

    // Apply custom rules first (highest priority)
    const customRule = this.customRules.getRule(tagName);
    if (customRule) {
      return this.applyRule(customRule, element);
    }

    // Apply email-specific rules for email content
    if (isEmailContent) {
      const emailRule = this.emailRules.getRule(tagName);
      if (emailRule) {
        return this.applyRule(emailRule, element);
      }
    }

    // Apply base rules
    const baseRule = this.baseRules.getRule(tagName);
    if (baseRule) {
      return this.applyRule(baseRule, element);
    }

    // Default: process children
    return this.processChildren(element, isEmailContent);
  }

  private convertCommentNode(comment: Comment): string {
    // Generally ignore comments, but could be extended for special handling
    return '';
  }

  private applyRule(rule: any, element: Element): string {
    const childContent = this.processChildren(element, false);
    return rule.apply(element, childContent);
  }

  private processChildren(element: Element, isEmailContent: boolean): string {
    let result = '';
    const children = Array.from(element.childNodes);

    for (let i = 0; i < children.length; i++) {
      const child = children[i];
      const converted = this.convertNode(child, isEmailContent);
      
      // Handle spacing between inline and block elements
      if (i > 0 && this.needsSpacing(children[i - 1], child)) {
        result += ' ';
      }
      
      result += converted;
    }

    return result;
  }

  private needsSpacing(prevNode: Node, currentNode: Node): boolean {
    // Add spacing logic between different node types
    if (prevNode.nodeType === Node.ELEMENT_NODE && 
        currentNode.nodeType === Node.ELEMENT_NODE) {
      const prevElement = prevNode as Element;
      const currentElement = currentNode as Element;
      
      const prevIsInline = this.isInlineElement(prevElement);
      const currentIsInline = this.isInlineElement(currentElement);
      
      // Space between inline elements
      return prevIsInline && currentIsInline;
    }
    
    return false;
  }

  private isBlockElement(element: Element): boolean {
    const blockElements = [
      'div', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'blockquote', 'pre', 'ul', 'ol', 'li', 'table',
      'tr', 'td', 'th', 'thead', 'tbody', 'tfoot',
      'section', 'article', 'header', 'footer', 'main',
      'aside', 'nav', 'form', 'fieldset', 'hr'
    ];
    
    return blockElements.includes(element.tagName.toLowerCase());
  }

  private isInlineElement(element: Element): boolean {
    const inlineElements = [
      'span', 'a', 'strong', 'b', 'em', 'i', 'u', 's',
      'strike', 'del', 'ins', 'mark', 'small', 'sub',
      'sup', 'code', 'kbd', 'samp', 'var', 'abbr',
      'acronym', 'cite', 'dfn', 'time', 'img'
    ];
    
    return inlineElements.includes(element.tagName.toLowerCase());
  }

  public generateLinkReference(url: string, title?: string): string {
    // For referenced link style
    const key = `${url}${title || ''}`;
    let reference = this.linkReferences.get(key);
    
    if (!reference) {
      reference = { url, title };
      this.linkReferences.set(key, reference);
    }
    
    return `[${this.linkCounter++}]`;
  }

  public getLinkReferences(): string {
    if (this.linkReferences.size === 0) {
      return '';
    }

    let references = '\n\n';
    let counter = 1;
    
    for (const [, { url, title }] of this.linkReferences) {
      references += `[${counter}]: ${url}`;
      if (title) {
        references += ` "${title}"`;
      }
      references += '\n';
      counter++;
    }
    
    return references;
  }

  public reset(): void {
    this.linkReferences.clear();
    this.linkCounter = 1;
  }

  public setOptions(options: ConversionOptions): void {
    this.options = { ...this.options, ...options };
    this.baseRules = new BaseRules(this.options);
    this.emailRules = new EmailRules(this.options);
    this.customRules = new CustomRules(this.options.customRules || []);
  }

  public getStatistics(): {
    elementsProcessed: number;
    linksFound: number;
    imagesFound: number;
  } {
    // Could be extended to track conversion statistics
    return {
      elementsProcessed: 0,
      linksFound: this.linkReferences.size,
      imagesFound: 0
    };
  }
}