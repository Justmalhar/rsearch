import jsPDF from 'jspdf';
import type { SearchResult } from '@/types/search';

// Color scheme
const COLORS = {
  primary: '#ea580c', // Orange-600
  secondary: '#000000', // Black
  text: '#1f2937', // Gray-800
  accent: '#fb923c', // Orange-400
  muted: '#6b7280', // Gray-500
  background: '#fff7ed', // Orange-50
  border: '#fed7aa', // Orange-200
};

// Font configurations
const FONTS = {
  heading: { family: 'times', style: 'bold' as const },
  body: { family: 'times', style: 'normal' as const },
  italic: { family: 'times', style: 'italic' as const },
  code: { family: 'courier', style: 'normal' as const },
};

// Spacing and layout
const LAYOUT = {
  margin: 20,
  lineHeight: 6,
  paragraphSpacing: 8,
  sectionSpacing: 12,
  headerSpacing: 10,
};

interface TextToken {
  text: string;
  type: 'normal' | 'bold' | 'italic' | 'code' | 'link';
  url?: string;
}

interface HeadingElement {
  type: 'heading';
  level?: number;
  content: string;
}

interface ParagraphElement {
  type: 'paragraph';
  content: TextToken[];
}

interface ListElement {
  type: 'list';
  content: string[];
  ordered?: boolean;
}

interface BlockquoteElement {
  type: 'blockquote';
  content: TextToken[];
}

interface CodeBlockElement {
  type: 'code_block';
  content: string[];
}

interface TableElement {
  type: 'table';
  content: string[][];
}

interface HRElement {
  type: 'hr';
  content: string;
}

type MarkdownElement = HeadingElement | ParagraphElement | ListElement | BlockquoteElement | CodeBlockElement | TableElement | HRElement;

class PDFMarkdownRenderer {
  private pdf: jsPDF;
  private currentY: number;
  private pageWidth: number;
  private pageHeight: number;
  private contentWidth: number;

  constructor() {
    this.pdf = new jsPDF('p', 'mm', 'a4');
    this.pageWidth = this.pdf.internal.pageSize.getWidth();
    this.pageHeight = this.pdf.internal.pageSize.getHeight();
    this.contentWidth = this.pageWidth - 2 * LAYOUT.margin;
    this.currentY = LAYOUT.margin;
  }

  // Parse inline markdown tokens
  private parseInlineTokens(text: string): TextToken[] {
    const tokens: TextToken[] = [];
    let current = '';
    let i = 0;

    while (i < text.length) {
      const char = text[i];

      // Handle code spans `code`
      if (char === '`') {
        if (current) {
          tokens.push({ text: current, type: 'normal' });
          current = '';
        }
        
        let j = i + 1;
        let code = '';
        while (j < text.length && text[j] !== '`') {
          code += text[j];
          j++;
        }
        
        if (j < text.length) {
          tokens.push({ text: code, type: 'code' });
          i = j + 1;
          continue;
        }
      }

      // Handle links [text](url)
      if (char === '[') {
        if (current) {
          tokens.push({ text: current, type: 'normal' });
          current = '';
        }
        
        let j = i + 1;
        let linkText = '';
        while (j < text.length && text[j] !== ']') {
          linkText += text[j];
          j++;
        }
        
        if (j < text.length && text[j + 1] === '(') {
          let k = j + 2;
          let url = '';
          while (k < text.length && text[k] !== ')') {
            url += text[k];
            k++;
          }
          
          if (k < text.length) {
            tokens.push({ text: linkText, type: 'link', url });
            i = k + 1;
            continue;
          }
        }
      }

      // Handle bold **text**
      if (char === '*' && text[i + 1] === '*') {
        if (current) {
          tokens.push({ text: current, type: 'normal' });
          current = '';
        }
        
        let j = i + 2;
        let bold = '';
        while (j < text.length - 1 && !(text[j] === '*' && text[j + 1] === '*')) {
          bold += text[j];
          j++;
        }
        
        if (j < text.length - 1) {
          tokens.push({ text: bold, type: 'bold' });
          i = j + 2;
          continue;
        }
      }

      // Handle italic *text*
      if (char === '*' && text[i + 1] !== '*' && (i === 0 || text[i - 1] !== '*')) {
        if (current) {
          tokens.push({ text: current, type: 'normal' });
          current = '';
        }
        
        let j = i + 1;
        let italic = '';
        while (j < text.length && text[j] !== '*') {
          italic += text[j];
          j++;
        }
        
        if (j < text.length) {
          tokens.push({ text: italic, type: 'italic' });
          i = j + 1;
          continue;
        }
      }

      current += char;
      i++;
    }

    if (current) {
      tokens.push({ text: current, type: 'normal' });
    }

    return tokens;
  }

  // Parse markdown content into structured elements
  private parseMarkdown(content: string): MarkdownElement[] {
    const lines = content.split('\n');
    const elements: MarkdownElement[] = [];
    let i = 0;

    while (i < lines.length) {
      const line = lines[i].trim();

      if (!line) {
        i++;
        continue;
      }

      // Headers
      if (line.startsWith('#')) {
        const level = line.match(/^#+/)?.[0].length || 1;
        const text = line.replace(/^#+\s*/, '');
        elements.push({
          type: 'heading',
          level: Math.min(level, 6),
          content: text
        });
        i++;
        continue;
      }

      // Code blocks
      if (line.startsWith('```')) {
        const codeLines: string[] = [];
        i++; // Skip opening ```
        while (i < lines.length && !lines[i].trim().startsWith('```')) {
          codeLines.push(lines[i]);
          i++;
        }
        elements.push({
          type: 'code_block',
          content: codeLines
        });
        i++; // Skip closing ```
        continue;
      }

      // Tables
      if (line.includes('|')) {
        const tableRows: string[][] = [];
        while (i < lines.length && lines[i].includes('|')) {
          const row = lines[i].split('|')
            .map(cell => cell.trim())
            .filter(cell => cell && !cell.match(/^-+$/));
          if (row.length > 0) {
            tableRows.push(row);
          }
          i++;
        }
        if (tableRows.length > 0) {
          elements.push({
            type: 'table',
            content: tableRows
          });
        }
        continue;
      }

      // Lists
      if (line.match(/^[\*\-\+]\s/) || line.match(/^\d+\.\s/)) {
        const listItems: string[] = [];
        const isOrdered = line.match(/^\d+\.\s/) !== null;
        
        while (i < lines.length) {
          const listLine = lines[i].trim();
          if (listLine.match(/^[\*\-\+]\s/) || listLine.match(/^\d+\.\s/)) {
            const text = listLine.replace(/^[\*\-\+\d]+\.\s*/, '');
            listItems.push(text);
            i++;
          } else if (listLine === '') {
            i++;
            break;
          } else {
            break;
          }
        }
        
        elements.push({
          type: 'list',
          content: listItems,
          ordered: isOrdered
        });
        continue;
      }

      // Blockquotes
      if (line.startsWith('>')) {
        const text = line.replace(/^>\s*/, '');
        elements.push({
          type: 'blockquote',
          content: this.parseInlineTokens(text)
        });
        i++;
        continue;
      }

      // Horizontal rules
      if (line.match(/^-{3,}$/)) {
        elements.push({ type: 'hr', content: '' });
        i++;
        continue;
      }

      // Regular paragraphs
      const tokens = this.parseInlineTokens(line);
      elements.push({
        type: 'paragraph',
        content: tokens
      });
      i++;
    }

    return elements;
  }

  // Check if new page is needed
  private checkPageBreak(neededHeight: number): void {
    if (this.currentY + neededHeight > this.pageHeight - LAYOUT.margin) {
      this.pdf.addPage();
      this.currentY = LAYOUT.margin;
    }
  }

  // Add logo header
  private async addHeader(searchTerm: string): Promise<void> {
    try {
      const logoImg = new Image();
      logoImg.crossOrigin = 'anonymous';
      
      await new Promise((resolve, reject) => {
        logoImg.onload = resolve;
        logoImg.onerror = reject;
        logoImg.src = '/logo.png';
      });
      
      const logoHeight = 12;
      const logoWidth = logoHeight * (logoImg.width / logoImg.height);
      const logoX = (this.pageWidth - logoWidth) / 2;
      
      this.pdf.addImage(logoImg, 'PNG', logoX, this.currentY, logoWidth, logoHeight);
      this.currentY += logoHeight + 8;
      
    } catch {
      // Fallback text header
      this.pdf.setFontSize(18);
      this.pdf.setFont(FONTS.heading.family, FONTS.heading.style);
      this.pdf.setTextColor(COLORS.primary);
      const title = 'rSearch Results';
      const titleWidth = this.pdf.getTextWidth(title);
      this.pdf.text(title, (this.pageWidth - titleWidth) / 2, this.currentY);
      this.currentY += 15;
    }

    // Search term title
    this.pdf.setFontSize(14);
    this.pdf.setFont(FONTS.heading.family, FONTS.heading.style);
    this.pdf.setTextColor(COLORS.secondary);
    const searchText = `Search Query: ${searchTerm}`;
    this.pdf.text(searchText, LAYOUT.margin, this.currentY);
    this.currentY += LAYOUT.headerSpacing;

    // Separator line
    this.pdf.setDrawColor(COLORS.primary);
    this.pdf.setLineWidth(0.5);
    this.pdf.line(LAYOUT.margin, this.currentY, this.pageWidth - LAYOUT.margin, this.currentY);
    this.currentY += LAYOUT.sectionSpacing;
  }

  // Render formatted text tokens
  private renderTokens(tokens: TextToken[], x: number, maxWidth: number): number {
    let currentX = x;
    let maxY = this.currentY;

    for (const token of tokens) {
      // Set font based on token type
      switch (token.type) {
        case 'bold':
          this.pdf.setFont(FONTS.heading.family, FONTS.heading.style);
          this.pdf.setTextColor(COLORS.secondary);
          this.pdf.setFontSize(11);
          break;
        case 'italic':
          this.pdf.setFont(FONTS.italic.family, FONTS.italic.style);
          this.pdf.setTextColor(COLORS.text);
          this.pdf.setFontSize(11);
          break;
        case 'code':
          this.pdf.setFont(FONTS.code.family, FONTS.code.style);
          this.pdf.setTextColor(COLORS.primary);
          this.pdf.setFontSize(10);
          break;
        case 'link':
          this.pdf.setFont(FONTS.body.family, FONTS.body.style);
          this.pdf.setTextColor(COLORS.primary);
          this.pdf.setFontSize(11);
          break;
        default:
          this.pdf.setFont(FONTS.body.family, FONTS.body.style);
          this.pdf.setTextColor(COLORS.text);
          this.pdf.setFontSize(11);
      }

      let displayText = token.text;
      if (token.type === 'link' && token.url) {
        displayText = `${token.text} (${token.url})`;
      }

      const words = displayText.split(' ');
      
      for (let i = 0; i < words.length; i++) {
        const word = words[i] + (i < words.length - 1 ? ' ' : '');
        const wordWidth = this.pdf.getTextWidth(word);
        
        // Check if word fits on current line
        if (currentX + wordWidth > x + maxWidth && currentX > x) {
          // Start new line
          currentX = x;
          maxY += LAYOUT.lineHeight;
          this.checkPageBreak(LAYOUT.lineHeight);
        }
        
        this.pdf.text(word, currentX, maxY);
        currentX += wordWidth;
      }
    }

    return maxY;
  }

  // Render heading
  private renderHeading(text: string, level: number): void {
    const sizes = [18, 16, 14, 12, 11, 10];
    const spacing = [12, 10, 8, 6, 4, 4];
    
    this.checkPageBreak(spacing[level - 1] + 10);
    
    this.pdf.setFontSize(sizes[level - 1]);
    this.pdf.setFont(FONTS.heading.family, FONTS.heading.style);
    this.pdf.setTextColor(level === 1 ? COLORS.primary : COLORS.secondary);
    
    const lines = this.pdf.splitTextToSize(text, this.contentWidth);
    this.pdf.text(lines, LAYOUT.margin, this.currentY);
    
    this.currentY += lines.length * LAYOUT.lineHeight + spacing[level - 1];
  }

  // Render paragraph
  private renderParagraph(tokens: TextToken[]): void {
    this.checkPageBreak(LAYOUT.lineHeight * 2);
    const endY = this.renderTokens(tokens, LAYOUT.margin, this.contentWidth);
    this.currentY = endY + LAYOUT.paragraphSpacing;
  }

  // Render list
  private renderList(items: string[], ordered: boolean = false): void {
    this.checkPageBreak(items.length * LAYOUT.lineHeight);
    
    items.forEach((item: string, index: number) => {
      const bullet = ordered ? `${index + 1}.` : '•';
      const tokens = this.parseInlineTokens(item);
      
      // Render bullet/number
      this.pdf.setFont(FONTS.body.family, FONTS.body.style);
      this.pdf.setTextColor(COLORS.primary);
      this.pdf.setFontSize(11);
      this.pdf.text(bullet, LAYOUT.margin + 5, this.currentY);
      
      // Render item content
      const endY = this.renderTokens(tokens, LAYOUT.margin + 15, this.contentWidth - 15);
      this.currentY = endY + LAYOUT.lineHeight;
    });
    
    this.currentY += LAYOUT.paragraphSpacing;
  }

  // Render blockquote
  private renderBlockquote(tokens: TextToken[]): void {
    this.checkPageBreak(LAYOUT.lineHeight * 2);
    
    // Draw left border
    this.pdf.setDrawColor(COLORS.accent);
    this.pdf.setLineWidth(2);
    this.pdf.line(LAYOUT.margin + 5, this.currentY - 3, LAYOUT.margin + 5, this.currentY + LAYOUT.lineHeight + 3);
    
    const endY = this.renderTokens(tokens, LAYOUT.margin + 15, this.contentWidth - 15);
    this.currentY = endY + LAYOUT.paragraphSpacing;
  }

  // Render code block
  private renderCodeBlock(lines: string[]): void {
    const totalHeight = lines.length * LAYOUT.lineHeight + 10;
    this.checkPageBreak(totalHeight);
    
    // Background
    this.pdf.setFillColor(250, 250, 250);
    this.pdf.rect(LAYOUT.margin, this.currentY - 5, this.contentWidth, totalHeight, 'F');
    
    // Border
    this.pdf.setDrawColor(COLORS.border);
    this.pdf.setLineWidth(0.5);
    this.pdf.rect(LAYOUT.margin, this.currentY - 5, this.contentWidth, totalHeight);
    
    // Code content
    this.pdf.setFont(FONTS.code.family, FONTS.code.style);
    this.pdf.setTextColor(COLORS.text);
    this.pdf.setFontSize(10);
    
    lines.forEach((line: string, index: number) => {
      this.pdf.text(line, LAYOUT.margin + 5, this.currentY + (index * LAYOUT.lineHeight));
    });
    
    this.currentY += totalHeight + LAYOUT.paragraphSpacing;
  }

  // Render table
  private renderTable(rows: string[][]): void {
    if (rows.length === 0) return;
    
    const cellHeight = 8;
    const tableHeight = rows.length * cellHeight + 5;
    this.checkPageBreak(tableHeight);
    
    const colWidth = this.contentWidth / rows[0].length;
    
    rows.forEach((row: string[], rowIndex: number) => {
      const isHeader = rowIndex === 0;
      const rowY = this.currentY + (rowIndex * cellHeight);
      
      // Row background
      if (isHeader) {
        this.pdf.setFillColor(254, 215, 170); // Orange-200
        this.pdf.rect(LAYOUT.margin, rowY - 3, this.contentWidth, cellHeight, 'F');
      }
      
      row.forEach((cell: string, colIndex: number) => {
        const cellX = LAYOUT.margin + (colIndex * colWidth);
        
        // Cell border
        this.pdf.setDrawColor(COLORS.border);
        this.pdf.setLineWidth(0.5);
        this.pdf.rect(cellX, rowY - 3, colWidth, cellHeight);
        
        // Cell text
        this.pdf.setFont(FONTS.body.family, isHeader ? FONTS.heading.style : FONTS.body.style);
        this.pdf.setTextColor(isHeader ? COLORS.primary : COLORS.text);
        this.pdf.setFontSize(10);
        
        const cellText = this.pdf.splitTextToSize(cell, colWidth - 4);
        this.pdf.text(cellText, cellX + 2, rowY + 2);
      });
    });
    
    this.currentY += tableHeight + LAYOUT.paragraphSpacing;
  }

  // Render horizontal rule
  private renderHR(): void {
    this.checkPageBreak(10);
    this.pdf.setDrawColor(COLORS.accent);
    this.pdf.setLineWidth(1);
    this.pdf.line(LAYOUT.margin, this.currentY, this.pageWidth - LAYOUT.margin, this.currentY);
    this.currentY += LAYOUT.sectionSpacing;
  }

  // Add sources section
  private addSources(sources: SearchResult[], getWebsiteName: (url: string) => string): void {
    if (!sources || sources.length === 0) return;
    
    // Add some spacing before sources
    this.currentY += LAYOUT.sectionSpacing;
    
    // Sources heading
    this.renderHeading('Sources', 2);
    
    // Render each source
    sources.forEach((source, index) => {
      const sourceNumber = index + 1;
      const websiteName = getWebsiteName(source.link);
      
      // Source number and title
      this.pdf.setFont(FONTS.body.family, FONTS.body.style);
      this.pdf.setTextColor(COLORS.text);
      this.pdf.setFontSize(11);
      
      const sourceText = `${sourceNumber}. ${source.title}`;
      const sourceLines = this.pdf.splitTextToSize(sourceText, this.contentWidth);
      
      this.checkPageBreak(sourceLines.length * LAYOUT.lineHeight + 15);
      
      this.pdf.text(sourceLines, LAYOUT.margin, this.currentY);
      this.currentY += sourceLines.length * LAYOUT.lineHeight + 2;
      
      // Website name
      this.pdf.setFont(FONTS.body.family, FONTS.body.style);
      this.pdf.setTextColor(COLORS.muted);
      this.pdf.setFontSize(9);
      this.pdf.text(websiteName, LAYOUT.margin + 5, this.currentY);
      this.currentY += LAYOUT.lineHeight;
      
      // URL
      this.pdf.setFont(FONTS.body.family, FONTS.body.style);
      this.pdf.setTextColor(COLORS.primary);
      this.pdf.setFontSize(9);
      const urlLines = this.pdf.splitTextToSize(source.link, this.contentWidth - 5);
      this.pdf.text(urlLines, LAYOUT.margin + 5, this.currentY);
      this.currentY += urlLines.length * LAYOUT.lineHeight + 8;
    });
  }

  // Add footer
  private addFooter(): void {
    const date = new Date().toLocaleDateString();
    this.pdf.setFontSize(8);
    this.pdf.setFont(FONTS.body.family, FONTS.body.style);
    this.pdf.setTextColor(COLORS.muted);
    this.pdf.text(`Generated on ${date} by rSearch`, LAYOUT.margin, this.pageHeight - 10);
  }

  // Main render method
  public async generatePDF(content: string, searchTerm: string, sources?: SearchResult[], getWebsiteName?: (url: string) => string): Promise<void> {
    // Add header
    await this.addHeader(searchTerm);
    
    // Parse and render content
    const elements = this.parseMarkdown(content);
    
    for (const element of elements) {
      switch (element.type) {
        case 'heading': {
          const headingElement = element as HeadingElement;
          this.renderHeading(headingElement.content, headingElement.level || 1);
          break;
        }
        case 'paragraph': {
          const paragraphElement = element as ParagraphElement;
          this.renderParagraph(paragraphElement.content);
          break;
        }
        case 'list': {
          const listElement = element as ListElement;
          this.renderList(listElement.content, listElement.ordered);
          break;
        }
        case 'blockquote': {
          const blockquoteElement = element as BlockquoteElement;
          this.renderBlockquote(blockquoteElement.content);
          break;
        }
        case 'code_block': {
          const codeBlockElement = element as CodeBlockElement;
          this.renderCodeBlock(codeBlockElement.content);
          break;
        }
        case 'table': {
          const tableElement = element as TableElement;
          this.renderTable(tableElement.content);
          break;
        }
        case 'hr':
          this.renderHR();
          break;
      }
    }
    
    // Add sources section if provided
    if (sources && getWebsiteName) {
      this.addSources(sources, getWebsiteName);
    }
    
    // Add footer
    this.addFooter();
    
    // Save PDF
    this.pdf.save('rSearch-response.pdf');
  }
}

// Export function
export const generateMarkdownPDF = async (content: string, searchTerm: string, sources?: SearchResult[], getWebsiteName?: (url: string) => string): Promise<void> => {
  const renderer = new PDFMarkdownRenderer();
  await renderer.generatePDF(content, searchTerm, sources, getWebsiteName);
};