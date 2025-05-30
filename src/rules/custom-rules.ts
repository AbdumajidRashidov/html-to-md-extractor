// src/rules/custom-rules.ts

import { ConversionRule, ReplacementFunction, ConversionOptions } from '../types';

export interface Rule {
  apply(element: Element, childContent: string): string;
  priority: number;
}

export class CustomRules {
  private rules: Map<string, Rule[]>;
  private globalRules: Rule[];

  constructor(customRules: ConversionRule[] = []) {
    this.rules = new Map();
    this.globalRules = [];
    this.initializeRules(customRules);
  }

  public getRule(tagName: string): Rule | undefined {
    const tagRules = this.rules.get(tagName) || [];
    const allRules = [...tagRules, ...this.globalRules];
    
    if (allRules.length === 0) {
      return undefined;
    }

    // Sort by priority (higher priority first)
    allRules.sort((a, b) => (b.priority || 0) - (a.priority || 0));
    
    return allRules[0];
  }

  public addRule(rule: ConversionRule): void {
    const compiledRule = this.compileRule(rule);
    
    if (rule.selector === '*') {
      this.globalRules.push(compiledRule);
    } else {
      // Parse selector to get tag name (simplified)
      const tagName = this.parseSelector(rule.selector);
      if (!this.rules.has(tagName)) {
        this.rules.set(tagName, []);
      }
      this.rules.get(tagName)!.push(compiledRule);
    }
  }

  public removeRule(selector: string): void {
    if (selector === '*') {
      this.globalRules = [];
    } else {
      const tagName = this.parseSelector(selector);
      this.rules.delete(tagName);
    }
  }

  public clearRules(): void {
    this.rules.clear();
    this.globalRules = [];
  }

  private initializeRules(customRules: ConversionRule[]): void {
    customRules.forEach(rule => this.addRule(rule));
  }

  private compileRule(rule: ConversionRule): Rule {
    return {
      apply: (element: Element, childContent: string) => {
        if (typeof rule.replacement === 'string') {
          return this.processStringReplacement(rule.replacement, element, childContent);
        } else {
          // It's a function
          return rule.replacement(childContent, element, {} as ConversionOptions);
        }
      },
      priority: rule.priority || 0
    };
  }

  private processStringReplacement(replacement: string, element: Element, childContent: string): string {
    let result = replacement;

    // Replace placeholders in string templates
    result = result.replace(/\$\{content\}/g, childContent);
    result = result.replace(/\$\{text\}/g, element.textContent || '');
    
    // Replace attribute placeholders
    result = result.replace(/\$\{(\w+)\}/g, (match, attrName) => {
      return element.getAttribute(attrName) || '';
    });

    return result;
  }

  private parseSelector(selector: string): string {
    // Simplified selector parsing - just get the tag name
    // Could be extended to support more complex selectors
    const match = selector.match(/^([a-zA-Z][a-zA-Z0-9]*)/);
    return match ? match[1].toLowerCase() : selector.toLowerCase();
  }
}

// Predefined custom rules for common use cases
export class PredefinedCustomRules {
  public static getHighlightRules(): ConversionRule[] {
    return [
      {
        selector: 'mark',
        replacement: '==${content}==',
        priority: 1
      },
      {
        selector: '.highlight',
        replacement: '**${content}**',
        priority: 1
      },
      {
        selector: '.warning',
        replacement: '⚠️ ${content}',
        priority: 1
      },
      {
        selector: '.info',
        replacement: 'ℹ️ ${content}',
        priority: 1
      },
      {
        selector: '.success',
        replacement: '✅ ${content}',
        priority: 1
      },
      {
        selector: '.error',
        replacement: '❌ ${content}',
        priority: 1
      }
    ];
  }

  public static getCodeRules(): ConversionRule[] {
    return [
      {
        selector: '.language-javascript',
        replacement: (content, element, options) => {
          return `\n\`\`\`javascript\n${content}\n\`\`\`\n`;
        },
        priority: 2
      },
      {
        selector: '.language-typescript',
        replacement: (content, element, options) => {
          return `\n\`\`\`typescript\n${content}\n\`\`\`\n`;
        },
        priority: 2
      },
      {
        selector: '.language-python',
        replacement: (content, element, options) => {
          return `\n\`\`\`python\n${content}\n\`\`\`\n`;
        },
        priority: 2
      },
      {
        selector: '.inline-code',
        replacement: '`${content}`',
        priority: 1
      }
    ];
  }

  public static getSocialMediaRules(): ConversionRule[] {
    return [
      {
        selector: '.tweet',
        replacement: (content, element, options) => {
          const author = element.getAttribute('data-author') || 'Unknown';
          const date = element.getAttribute('data-date') || '';
          return `\n> 🐦 **${author}** ${date}\n> \n> ${content.replace(/\n/g, '\n> ')}\n`;
        },
        priority: 2
      },
      {
        selector: '.facebook-post',
        replacement: (content, element, options) => {
          const author = element.getAttribute('data-author') || 'Unknown';
          return `\n📘 **${author}**\n\n${content}\n`;
        },
        priority: 2
      }
    ];
  }

  public static getEmailSpecificRules(): ConversionRule[] {
    return [
      {
        selector: '.email-header',
        replacement: (content, element, options) => {
          return `📧 **Email Header**\n\n${content}\n\n---\n`;
        },
        priority: 3
      },
      {
        selector: '.email-attachment',
        replacement: (content, element, options) => {
          const filename = element.getAttribute('data-filename') || 'attachment';
          const size = element.getAttribute('data-size') || '';
          return `📎 **${filename}** ${size ? `(${size})` : ''}\n`;
        },
        priority: 2
      },
      {
        selector: '.email-forward',
        replacement: (content, element, options) => {
          return `\n📨 **Forwarded Message**\n\n${content}\n`;
        },
        priority: 2
      },
      {
        selector: '.email-reply',
        replacement: (content, element, options) => {
          return `\n↩️ **Reply**\n\n${content}\n`;
        },
        priority: 2
      },
      {
        selector: '.confidential',
        replacement: '🔒 **CONFIDENTIAL**: ${content}',
        priority: 3
      }
    ];
  }

  public static getDocumentRules(): ConversionRule[] {
    return [
      {
        selector: '.footnote',
        replacement: (content, element, options) => {
          const id = element.getAttribute('id') || Math.random().toString(36).substr(2, 9);
          return `[^${id}]: ${content}\n`;
        },
        priority: 1
      },
      {
        selector: '.footnote-ref',
        replacement: (content, element, options) => {
          const ref = element.getAttribute('href') || '';
          const id = ref.replace('#', '');
          return `[^${id}]`;
        },
        priority: 1
      },
      {
        selector: '.bibliography',
        replacement: (content, element, options) => {
          return `\n## References\n\n${content}\n`;
        },
        priority: 2
      },
      {
        selector: '.author',
        replacement: '**Author**: ${content}',
        priority: 1
      },
      {
        selector: '.date',
        replacement: '**Date**: ${content}',
        priority: 1
      }
    ];
  }

  public static getLayoutRules(): ConversionRule[] {
    return [
      {
        selector: '.sidebar',
        replacement: (content, element, options) => {
          const lines = content.split('\n');
          const sidebarContent = lines.map(line => `> ${line}`).join('\n');
          return `\n**Sidebar**\n${sidebarContent}\n`;
        },
        priority: 1
      },
      {
        selector: '.callout',
        replacement: (content, element, options) => {
          return `\n💡 **Note**\n\n${content}\n`;
        },
        priority: 1
      },
      {
        selector: '.alert',
        replacement: (content, element, options) => {
          const type = element.getAttribute('data-type') || 'info';
          const icons: Record<string, string> = {
            'info': 'ℹ️',
            'warning': '⚠️',
            'error': '❌',
            'success': '✅'
          };
          return `\n${icons[type] || 'ℹ️'} **Alert**\n\n${content}\n`;
        },
        priority: 2
      },
      {
        selector: '.card',
        replacement: (content, element, options) => {
          const title = element.getAttribute('data-title') || '';
          return `\n📋 ${title ? `**${title}**\n\n` : ''}${content}\n`;
        },
        priority: 1
      }
    ];
  }

  public static getAllPredefinedRules(): ConversionRule[] {
    return [
      ...this.getHighlightRules(),
      ...this.getCodeRules(),
      ...this.getSocialMediaRules(),
      ...this.getEmailSpecificRules(),
      ...this.getDocumentRules(),
      ...this.getLayoutRules()
    ];
  }
}

// Rule builder utility for creating custom rules easily
export class RuleBuilder {
  private rule: Partial<ConversionRule> = {};

  public static create(): RuleBuilder {
    return new RuleBuilder();
  }

  public forSelector(selector: string): RuleBuilder {
    this.rule.selector = selector;
    return this;
  }

  public withReplacement(replacement: string | ReplacementFunction): RuleBuilder {
    this.rule.replacement = replacement;
    return this;
  }

  public withPriority(priority: number): RuleBuilder {
    this.rule.priority = priority;
    return this;
  }

  public build(): ConversionRule {
    if (!this.rule.selector || !this.rule.replacement) {
      throw new Error('Selector and replacement are required');
    }
    
    return this.rule as ConversionRule;
  }
}