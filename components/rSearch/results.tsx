'use client';

import { useState } from 'react';
import type { ImgHTMLAttributes } from 'react';
import Markdown from 'react-markdown';
import { useToast } from "@/hooks/use-toast";
import jsPDF from 'jspdf';

// Image component with error handling
const ImageWithFallback = ({ ...props }: ImgHTMLAttributes<HTMLImageElement>) => {
  const [hasError, setHasError] = useState(false);
  
  if (hasError) {
    return null; // Don't render anything if image failed to load
  }

  return (
    <img 
      {...props} 
      alt={props.alt || ''} 
      className="rounded-lg mx-auto" // Removed w-full h-auto to preserve native dimensions
      onError={() => setHasError(true)}
    />
  );
};

// Helper function to parse inline markdown formatting
const parseInlineMarkdown = (text: string) => {
  const tokens: Array<{ text: string; bold: boolean; italic: boolean; link?: string; code: boolean }> = [];
  let current = '';
  let i = 0;
  
  while (i < text.length) {
    const char = text[i];
    
    // Handle code spans first (highest priority)
    if (char === '`') {
      if (current) {
        tokens.push({ text: current, bold: false, italic: false, code: false });
        current = '';
      }
      
      // Find closing backtick
      let j = i + 1;
      let codeContent = '';
      while (j < text.length && text[j] !== '`') {
        codeContent += text[j];
        j++;
      }
      
      if (j < text.length) {
        tokens.push({ text: codeContent, bold: false, italic: false, code: true });
        i = j + 1;
        continue;
      }
    }
    
    // Handle links [text](url)
    if (char === '[') {
      if (current) {
        tokens.push({ text: current, bold: false, italic: false, code: false });
        current = '';
      }
      
      // Find closing bracket and parentheses
      let j = i + 1;
      let linkText = '';
      while (j < text.length && text[j] !== ']') {
        linkText += text[j];
        j++;
      }
      
      if (j < text.length && text[j + 1] === '(') {
        let k = j + 2;
        let linkUrl = '';
        while (k < text.length && text[k] !== ')') {
          linkUrl += text[k];
          k++;
        }
        
        if (k < text.length) {
          tokens.push({ text: linkText, bold: false, italic: false, link: linkUrl, code: false });
          i = k + 1;
          continue;
        }
      }
    }
    
    // Handle bold **text**
    if (char === '*' && text[i + 1] === '*') {
      if (current) {
        tokens.push({ text: current, bold: false, italic: false, code: false });
        current = '';
      }
      
      // Find closing **
      let j = i + 2;
      let boldContent = '';
      while (j < text.length - 1 && !(text[j] === '*' && text[j + 1] === '*')) {
        boldContent += text[j];
        j++;
      }
      
      if (j < text.length - 1) {
        tokens.push({ text: boldContent, bold: true, italic: false, code: false });
        i = j + 2;
        continue;
      }
    }
    
    // Handle italic *text*
    if (char === '*' && text[i + 1] !== '*' && (i === 0 || text[i - 1] !== '*')) {
      if (current) {
        tokens.push({ text: current, bold: false, italic: false, code: false });
        current = '';
      }
      
      // Find closing *
      let j = i + 1;
      let italicContent = '';
      while (j < text.length && text[j] !== '*') {
        italicContent += text[j];
        j++;
      }
      
      if (j < text.length) {
        tokens.push({ text: italicContent, bold: false, italic: true, code: false });
        i = j + 1;
        continue;
      }
    }
    
    current += char;
    i++;
  }
  
  if (current) {
    tokens.push({ text: current, bold: false, italic: false, code: false });
  }
  
  return tokens;
};

// Helper function to render formatted text in PDF
const renderFormattedText = (pdf: jsPDF, tokens: ReturnType<typeof parseInlineMarkdown>, x: number, y: number, maxWidth: number) => {
  let currentX = x;
  const lines: string[] = [''];
  const lineFormats: Array<Array<{ text: string; bold: boolean; italic: boolean; link?: string; code: boolean }>> = [[]];
  
  // Process tokens and handle line wrapping
  for (const token of tokens) {
    const words = token.text.split(' ');
    
    for (let i = 0; i < words.length; i++) {
      const word = words[i] + (i < words.length - 1 ? ' ' : '');
      const testLine = lines[lines.length - 1] + word;
      
      // Set font for width measurement
      if (token.bold) {
        pdf.setFont('times', 'bold');
      } else if (token.italic) {
        pdf.setFont('times', 'italic');
      } else {
        pdf.setFont('times', 'normal');
      }
      
      const lineWidth = pdf.getTextWidth(testLine);
      
      if (lineWidth > maxWidth && lines[lines.length - 1] !== '') {
        // Start new line
        lines.push(word);
        lineFormats.push([{ ...token, text: word }]);
      } else {
        // Add to current line
        lines[lines.length - 1] = testLine;
        if (lineFormats[lineFormats.length - 1].length === 0) {
          lineFormats[lineFormats.length - 1].push({ ...token, text: word });
        } else {
          lineFormats[lineFormats.length - 1].push({ ...token, text: word });
        }
      }
    }
  }
  
  // Render each line with proper formatting
  let currentY = y;
  for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
    currentX = x;
    const lineTokens = lineFormats[lineIndex];
    
    for (const token of lineTokens) {
      // Set font style
      if (token.code) {
        pdf.setFont('courier', 'normal');
        pdf.setFontSize(10);
      } else if (token.bold) {
        pdf.setFont('times', 'bold');
        pdf.setFontSize(11);
      } else if (token.italic) {
        pdf.setFont('times', 'italic');
        pdf.setFontSize(11);
      } else {
        pdf.setFont('times', 'normal');
        pdf.setFontSize(11);
      }
      
      // Add link indicator if present
      let displayText = token.text;
      if (token.link) {
        displayText += ` (${token.link})`;
      }
      
      pdf.text(displayText, currentX, currentY);
      currentX += pdf.getTextWidth(displayText);
    }
    
    currentY += 6; // Line height
  }
  
  return currentY;
};

// Helper function to parse and render tables
const renderTable = (pdf: jsPDF, tableContent: string, x: number, y: number, maxWidth: number) => {
  const lines = tableContent.split('\n').filter(line => line.trim());
  if (lines.length < 2) return y;
  
  // Parse table structure
  const rows: string[][] = [];
  for (const line of lines) {
    if (line.includes('---')) continue; // Skip separator lines
    const cells = line.split('|').map(cell => cell.trim()).filter(cell => cell);
    if (cells.length > 0) {
      rows.push(cells);
    }
  }
  
  if (rows.length === 0) return y;
  
  // Calculate column widths
  const numCols = Math.max(...rows.map(row => row.length));
  const colWidth = maxWidth / numCols;
  
  let currentY = y;
  
  // Render table
  for (let rowIndex = 0; rowIndex < rows.length; rowIndex++) {
    const row = rows[rowIndex];
    const isHeader = rowIndex === 0;
    
    // Set font for header or body
    if (isHeader) {
      pdf.setFont('times', 'bold');
      pdf.setFontSize(10);
    } else {
      pdf.setFont('times', 'normal');
      pdf.setFontSize(10);
    }
    
    // Render cells
    for (let colIndex = 0; colIndex < row.length; colIndex++) {
      const cellX = x + colIndex * colWidth;
      const cellText = row[colIndex];
      
      // Add cell border
      pdf.rect(cellX, currentY - 4, colWidth, 8);
      
      // Add cell text
      const wrappedText = pdf.splitTextToSize(cellText, colWidth - 2);
      pdf.text(wrappedText, cellX + 1, currentY);
    }
    
    currentY += 8;
  }
  
  return currentY + 5;
};

// Function to generate PDF from markdown content
const generatePDF = async (markdownContent: string, searchTerm: string) => {
  const pdf = new jsPDF('p', 'mm', 'a4');
  
  // Set Times New Roman font (use built-in times)
  pdf.setFont('times', 'normal');
  
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - 2 * margin;
  
  let currentY = margin;
  
  try {
    // Add logo at the top
    const logoImg = new Image();
    logoImg.crossOrigin = 'anonymous';
    
    await new Promise((resolve, reject) => {
      logoImg.onload = resolve;
      logoImg.onerror = reject;
      logoImg.src = '/logo.png';
    });
    
    // Calculate logo dimensions (maintain aspect ratio)
    const logoAspectRatio = logoImg.width / logoImg.height;
    const logoHeight = 15; // 15mm height
    const logoWidth = logoHeight * logoAspectRatio;
    
    // Center the logo
    const logoX = (pageWidth - logoWidth) / 2;
    pdf.addImage(logoImg, 'PNG', logoX, currentY, logoWidth, logoHeight);
    currentY += logoHeight + 10;
    
  } catch (error) {
    console.warn('Could not load logo, continuing without it:', error);
    // Add text-based header instead
    pdf.setFontSize(18);
    pdf.setFont('times', 'bold');
    const titleText = 'rSearch Results';
    const titleWidth = pdf.getTextWidth(titleText);
    pdf.text(titleText, (pageWidth - titleWidth) / 2, currentY);
    currentY += 15;
  }
  
  // Add search term as title
  pdf.setFontSize(16);
  pdf.setFont('times', 'bold');
  const searchText = `Search: ${searchTerm}`;
  const lines = pdf.splitTextToSize(searchText, contentWidth);
  pdf.text(lines, margin, currentY);
  currentY += lines.length * 8 + 10;
  
  // Add a line separator
  pdf.setLineWidth(0.5);
  pdf.line(margin, currentY, pageWidth - margin, currentY);
  currentY += 10;
  
  // Process markdown content
  const cleanContent = markdownContent.replace(/content:/g, '');
  const contentLines = cleanContent.split('\n');
  
  // Check for table content
  let inTable = false;
  let tableContent = '';
  
  for (let i = 0; i < contentLines.length; i++) {
    const line = contentLines[i];
    
    // Check if we need a new page
    if (currentY > pageHeight - margin) {
      pdf.addPage();
      currentY = margin;
    }
    
    // Handle table detection
    if (line.includes('|') && line.trim() !== '') {
      if (!inTable) {
        inTable = true;
        tableContent = '';
      }
      tableContent += line + '\n';
      continue;
    } else if (inTable) {
      // End of table
      currentY = renderTable(pdf, tableContent, margin, currentY, contentWidth);
      inTable = false;
      tableContent = '';
    }
    
    if (line.trim() === '') {
      currentY += 5; // Add space for empty lines
      continue;
    }
    
    // Handle headers
    if (line.startsWith('# ')) {
      pdf.setFontSize(16);
      pdf.setFont('times', 'bold');
      const headerText = line.replace('# ', '');
      const headerLines = pdf.splitTextToSize(headerText, contentWidth);
      pdf.text(headerLines, margin, currentY);
      currentY += headerLines.length * 8 + 8;
    } else if (line.startsWith('## ')) {
      pdf.setFontSize(14);
      pdf.setFont('times', 'bold');
      const headerText = line.replace('## ', '');
      const headerLines = pdf.splitTextToSize(headerText, contentWidth);
      pdf.text(headerLines, margin, currentY);
      currentY += headerLines.length * 7 + 6;
    } else if (line.startsWith('### ')) {
      pdf.setFontSize(12);
      pdf.setFont('times', 'bold');
      const headerText = line.replace('### ', '');
      const headerLines = pdf.splitTextToSize(headerText, contentWidth);
      pdf.text(headerLines, margin, currentY);
      currentY += headerLines.length * 6 + 5;
    } else if (line.startsWith('- ') || line.startsWith('* ')) {
      // Handle bullet points with inline formatting
      const bulletText = line.replace(/^[*-] /, '');
      const tokens = parseInlineMarkdown(bulletText);
      pdf.setFont('times', 'normal');
      pdf.setFontSize(11);
      pdf.text('•', margin + 5, currentY);
      currentY = renderFormattedText(pdf, tokens, margin + 10, currentY, contentWidth - 10);
      currentY += 3;
    } else if (line.match(/^\d+\. /)) {
      // Handle numbered lists with inline formatting
      const match = line.match(/^(\d+\. )(.*)/);
      if (match) {
        const [, number, text] = match;
        const tokens = parseInlineMarkdown(text);
        pdf.setFont('times', 'normal');
        pdf.setFontSize(11);
        pdf.text(number, margin + 5, currentY);
        currentY = renderFormattedText(pdf, tokens, margin + 15, currentY, contentWidth - 15);
        currentY += 3;
      }
    } else if (line.startsWith('> ')) {
      // Handle blockquotes with inline formatting
      const quoteText = line.replace('> ', '');
      const tokens = parseInlineMarkdown(quoteText);
      pdf.setFont('times', 'italic');
      currentY = renderFormattedText(pdf, tokens, margin + 10, currentY, contentWidth - 10);
      currentY += 3;
    } else if (line.startsWith('```')) {
      // Handle code blocks
      pdf.setFont('courier', 'normal');
      pdf.setFontSize(10);
      i++; // Skip opening ```
      while (i < contentLines.length && !contentLines[i].startsWith('```')) {
        if (currentY > pageHeight - margin) {
          pdf.addPage();
          currentY = margin;
        }
        pdf.text(contentLines[i], margin + 5, currentY);
        currentY += 5;
        i++;
      }
      currentY += 5;
    } else {
      // Handle regular paragraphs with inline formatting
      const tokens = parseInlineMarkdown(line);
      currentY = renderFormattedText(pdf, tokens, margin, currentY, contentWidth);
      currentY += 5;
    }
    
    // Reset font
    pdf.setFont('times', 'normal');
    pdf.setFontSize(11);
  }
  
  // Handle remaining table if file ends with one
  if (inTable) {
    currentY = renderTable(pdf, tableContent, margin, currentY, contentWidth);
  }
  
  // Add footer with generation date
  const date = new Date().toLocaleDateString();
  pdf.setFontSize(8);
  pdf.setFont('times', 'normal');
  pdf.text(`Generated on ${date} by rSearch`, margin, pageHeight - 10);
  
  // Save the PDF
  pdf.save('rSearch-response.pdf');
};

interface ResultsProps {
  isAiLoading: boolean;
  aiResponse: string | null;
  aiError: string | null;
  isAiComplete: boolean;
  searchResults: {
    peopleAlsoAsk?: {
      question: string;
      snippet: string;
      link: string;
    }[];
    relatedSearches?: {
      query: string;
    }[];
  } | null;
  mode: string;
  generateSearchId: (query: string, mode: string) => string;
  getWebsiteName: (url: string) => string;
  searchTerm: string;
}

export default function Results({ 
  isAiLoading,
  aiResponse,
  aiError,
  isAiComplete,
  searchResults,
  mode,
  generateSearchId,
  getWebsiteName,
  searchTerm
}: ResultsProps) {
  const { toast } = useToast()

  return (
    <div className="w-full">
      <div className="prose prose-orange max-w-none space-y-8 overflow-x-hidden w-full max-w-[95vw] md:max-w-full">
        {/* AI Response Section */}
        {isAiLoading && !aiResponse && (
          <div className="bg-orange-50/50 rounded-lg p-6">
            <div className="space-y-3">
              <div className="h-4 bg-orange-100/50 rounded w-3/4 animate-pulse" />
              <div className="h-4 bg-orange-100/50 rounded w-1/2 animate-pulse" />
              <div className="h-4 bg-orange-100/50 rounded w-2/3 animate-pulse" />
            </div>
          </div>
        )}
        
        {aiError && (
          <div className="bg-orange-50/50 rounded-lg p-6 text-center">
            <p className="text-orange-600">Sorry, we could not generate an AI response.</p>
            <p className="text-sm text-orange-500 mt-2">{aiError}</p>
          </div>
        )}
        
        {aiResponse && (
          <>
            {/* AI Response */}
            <div className="rounded-lg p-6 shadow-sm w-full max-w-[95vw] md:max-w-full">
              <div className="prose prose-orange max-w-none overflow-x-hidden w-full max-w-[95vw] md:max-w-full">
                <Markdown
                  components={{
                    h1: ({...props}) => (
                      <h1 {...props} className="text-2xl font-bold text-orange-600  mb-4" />
                    ),
                    h2: ({...props}) => (
                      <h2 {...props} className="text-xl font-bold text-orange-600  mt-6 mb-3" />
                    ),
                    h3: ({...props}) => (
                      <h3 {...props} className="text-lg font-bold text-orange-600  mt-4 mb-2" />
                    ),
                    h4: ({...props}) => (
                      <h4 {...props} className="text-base font-bold text-orange-600  mt-4 mb-2" />
                    ),
                    h5: ({...props}) => (
                      <h5 {...props} className="text-base font-bold text-orange-600  mt-4 mb-2" />
                    ),
                    h6: ({...props}) => (
                      <h6 {...props} className="text-base font-bold text-orange-600  mt-4 mb-2" />
                    ),
                    table: ({...props}) => (
                      <div className="overflow-x-auto">
                        <table {...props} className="min-w-full divide-y divide-gray-200 border border-gray-200" />
                      </div>
                    ),
                    thead: ({...props}) => (
                      <thead {...props} className="bg-orange-50" />
                    ),
                    tbody: ({...props}) => (
                      <tbody {...props} className="bg-white divide-y divide-gray-200" />
                    ),
                    tr: ({...props}) => (
                      <tr {...props} className="hover:bg-orange-50/50 transition-colors" />
                    ),
                    th: ({...props}) => (
                      <th {...props} className="px-6 py-3 text-left text-sm font-semibold text-orange-600" />
                    ),
                    td: ({...props}) => (
                      <td {...props} className="px-6 py-4 text-sm text-gray-700 whitespace-normal" />
                    ),
                    img: ImageWithFallback,
                    p: ({children, ...props}) => {
                      // Get text content from React children
                      const content = Array.isArray(children) 
                        ? children
                            .map(child => {
                              if (typeof child === 'string') return child;
                              if (child && typeof child === 'object' && 'props' in child) {
                                return child.props.children || '';
                              }
                              return '';
                            })
                            .join('')
                        : children?.toString() || '';
                      
                      // Check if content looks like a table
                      if (content.includes('|')) {
                        const lines = content.split('\n').filter(line => line.trim());
                        
                        // Only process as table if we have header and separator rows
                        if (lines.length >= 2 && lines[1].includes('-')) {
                          // Parse table rows, excluding separator row
                          const tableRows = lines
                            .filter(line => !line.includes('---'))
                            .map(line => {
                              // Split by | and clean each cell
                              const cells = line.split('|')
                                .map(cell => cell.trim())
                                .filter(cell => cell);
                              
                              // Return null if no valid cells (helps filter empty rows)
                              return cells.length > 0 ? cells : null;
                            })
                            .filter((row): row is string[] => row !== null);

                          if (tableRows.length > 0) {
                            return (
                              <div className="overflow-x-auto my-4">
                                <table className="min-w-full divide-y divide-gray-200 border border-gray-200">
                                  <thead className="bg-orange-50">
                                    <tr>
                                      {tableRows[0].map((header) => (
                                        <th key={`header-${header}`} className="px-6 py-3 text-left text-sm font-semibold text-orange-600">
                                          {header}
                                        </th>
                                      ))}
                                    </tr>
                                  </thead>
                                  <tbody className="bg-white divide-y divide-gray-200">
                                    {tableRows.slice(1).map((row) => (
                                      <tr key={`row-${row.join('-')}`} className="hover:bg-orange-50/50 transition-colors">
                                        {row.map((cell) => (
                                          <td key={`cell-${cell}`} className="px-6 py-4 text-sm text-gray-700 whitespace-normal">
                                            {cell}
                                          </td>
                                        ))}
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            );
                          }
                        }
                      }
                      
                      // Regular paragraph
                      return <p {...props} className="text-gray-700 mb-4 leading-relaxed">{children}</p>;
                    },
                    ul: ({...props}) => (
                      <ul {...props} className="list-disc pl-6 mb-4 space-y-2 marker:text-orange-500" />
                    ),
                    ol: ({...props}) => (
                      <ol {...props} className="list-decimal pl-6 mb-4 space-y-2 marker:text-orange-500" />
                    ),
                    li: ({...props}) => (
                      <li {...props} className="text-gray-700" />
                    ),
                    a: ({...props}) => (
                      <a 
                        {...props} 
                        className="text-orange-600 hover:text-orange-700 font-medium underline decoration-orange-200 hover:decoration-orange-500 transition-colors"
                        target="_blank"
                        rel="noopener noreferrer"
                      />
                    ),
                    blockquote: ({...props}) => (
                      <blockquote {...props} className="border-l-4 border-orange-200 pl-4 italic my-4 text-gray-600" />
                    ),
                    strong: ({...props}) => (
                      <strong {...props} className="font-bold text-orange-600" />
                    ),
                    em: ({...props}) => (
                      <em {...props} className="italic text-orange-600/90 font-semibold" />
                    ),
                    pre: ({...props}) => (
                      <pre {...props} className="bg-orange-50 text-orange-600 rounded px-1.5 py-0.5 text-sm font-mono" />
                    ),
                    code: ({...props}) => (
                      <code {...props} className="bg-orange-50 text-orange-600 rounded px-1.5 py-0.5 text-sm font-mono" />
                    ),
                  }}
                >
                  {aiResponse.replace(/content:/g, '')}
                </Markdown>
              </div>
              <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-orange-100">
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(aiResponse.replace(/content:/g, ''));
                  }}
                  className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                >
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    width="20" 
                    height="20" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                    aria-label="Copy to clipboard"
                    role="img"
                  >
                    <title>Copy to clipboard</title>
                    <rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      await generatePDF(aiResponse, searchTerm);
                      toast({
                        title: "PDF Downloaded!",
                        description: "Your rSearch response has been saved as a PDF",
                        duration: 3000,
                      });
                    } catch (error) {
                      console.error('Error generating PDF:', error);
                      toast({
                        title: "Error",
                        description: "Failed to generate PDF. Please try again.",
                        duration: 3000,
                      });
                    }
                  }}
                  className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                >
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    width="20" 
                    height="20" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                    aria-label="Download PDF"
                    role="img"
                  >
                    <title>Download PDF</title>
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const url = window.location.href;
                    navigator.clipboard.writeText(url);
                    toast({
                      title: "Link copied!",
                      description: "URL has been copied to clipboard",
                      duration: 2000,
                    });
                  }}
                  className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                  aria-label="Share article"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none" 
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    role="img"
                  >
                    <title>Share article</title>
                    <circle cx="18" cy="5" r="3"/>
                    <circle cx="6" cy="12" r="3"/>
                    <circle cx="18" cy="19" r="3"/>
                    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
                    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
                  </svg>
                </button>
              </div>
            </div>
          </>
        )}

        {/* Search Results Sections */}
        {isAiComplete && searchResults && (
            <div className="space-y-8">
            {/* People Also Ask */}
            {searchResults.peopleAlsoAsk && searchResults.peopleAlsoAsk.length > 0 && (
                  <div className="pt-8">
                    <h2 className="text-xl  text-orange-600 mb-4">People Also Ask</h2>
                    <div className="space-y-3">
                      {searchResults.peopleAlsoAsk.map((item) => (
                        <div 
                          key={`paa-${item.question}`}
                          className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
                        >
                          <button
                            type="button"
                            onClick={() => {
                              window.location.href = `/rsearch/${generateSearchId(item.question, mode)}?q=${encodeURIComponent(item.question)}&mode=${mode}`;
                            }}
                            className="w-full text-left"
                          >
                            <h3 className="text-base font-medium text-gray-900 mb-2">
                              {item.question}
                            </h3>
                            <p className="text-sm text-gray-600 line-clamp-2">
                              {item.snippet}
                            </p>
                            <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
                              <div className="relative flex-none">
                                <div className="relative overflow-hidden rounded-full">
                                  <img
                                    src={(() => {
                                      try {
                                        const url = new URL(item.link);
                                        return `https://www.google.com/s2/favicons?sz=128&domain=${url.hostname}`;
                                      } catch {
                                        // Return a default favicon if URL is invalid
                                        return '/globe.svg';
                                      }
                                    })()}
                                    alt={`Favicon for ${getWebsiteName(item.link)}`}
                                    width="16"
                                    height="16"
                                    className="relative block w-4 h-4"
                                  />
                                </div>
                              </div>
                              <span>{getWebsiteName(item.link)}</span>
                            </div>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Related Searches */}
                {searchResults.relatedSearches && searchResults.relatedSearches.length > 0 && (
                  <div className="pt-8">
                    <h2 className="text-xl  text-orange-600 mb-4">Related Searches</h2>
                    <div className="flex flex-wrap gap-2">
                      {searchResults.relatedSearches.map((item) => (
                        <button
                          type="button"
                          key={`rs-${item.query}`}
                          onClick={() => {
                            window.location.href = `/rsearch/${generateSearchId(item.query, mode)}?q=${encodeURIComponent(item.query)}&mode=${mode}`;
                          }}
                          className="px-4 py-2 rounded-full bg-orange-600 hover:bg-orange-700 text-white text-sm font-medium transition-colors"
                        >
                          {item.query}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
          </div>
        )}

        {/* Loading State */}
        {!aiResponse && !aiError && !searchResults && (
          <div className="bg-orange-50/50 rounded-lg p-6 text-center">
            <p className="text-orange-600">Preparing your results...</p>
          </div>
        )}
      </div>
    </div>
  );
}
