// src/types/index.ts

export interface ConversionOptions {
    // Basic options
    preserveWhitespace?: boolean;
    trimWhitespace?: boolean;
    bulletListMarker?: string;
    codeBlockStyle?: 'indented' | 'fenced';
    fence?: string;
    emDelimiter?: string;
    strongDelimiter?: string;
    linkStyle?: 'inlined' | 'referenced';
    linkReferenceStyle?: 'full' | 'collapsed' | 'shortcut';
    
    // Email-specific options
    preserveEmailHeaders?: boolean;
    handleEmailSignatures?: boolean;
    convertInlineStyles?: boolean;
    preserveEmailQuotes?: boolean;
    handleOutlookSpecific?: boolean;
    extractPlainTextFallback?: boolean;
    
    // Advanced options
    customRules?: ConversionRule[];
    ignoreElements?: string[];
    keepElements?: string[];
    baseUrl?: string;
    
    // Table handling
    tableHandling?: 'preserve' | 'convert' | 'remove';
    maxTableWidth?: number;
  }
  
  export interface ConversionRule {
    selector: string;
    replacement: string | ReplacementFunction;
    priority?: number;
  }
  
  export type ReplacementFunction = (
    content: string,
    node: Element,
    options: ConversionOptions
  ) => string;
  
  export interface ConversionResult {
    markdown: string;
    metadata?: {
      title?: string;
      emailHeaders?: EmailHeaders;
      images?: ImageInfo[];
      links?: LinkInfo[];
      errors?: string[];
    };
  }
  
  export interface EmailHeaders {
    from?: string;
    to?: string[];
    cc?: string[];
    bcc?: string[];
    subject?: string;
    date?: string;
    messageId?: string;
  }
  
  export interface ImageInfo {
    src: string;
    alt?: string;
    title?: string;
    isInline?: boolean;
  }
  
  export interface LinkInfo {
    href: string;
    text: string;
    title?: string;
    isEmail?: boolean;
  }
  
  export interface ParsedNode {
    tagName: string;
    textContent: string;
    attributes: Record<string, string>;
    children: ParsedNode[];
    parent?: ParsedNode;
  }
  
  export interface EmailContext {
    isEmailContent: boolean;
    hasEmailHeaders: boolean;
    hasSignature: boolean;
    hasQuotedContent: boolean;
    clientType?: 'outlook' | 'gmail' | 'thunderbird' | 'apple' | 'other';
  }