export class StringBuilder {
    private parts: string[] = [];
    
    append(str: string): void {
      if (str) this.parts.push(str);
    }
    
    toString(): string {
      if (this.parts.length === 0) return '';
      if (this.parts.length === 1) return this.parts[0];
      return this.parts.join('');
    }
    
    clear(): void {
      this.parts.length = 0;
    }
    
    get length(): number {
      return this.parts.reduce((total, part) => total + part.length, 0);
    }
  }