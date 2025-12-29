import { Paragraph, ParagraphElement, StructuralElement } from './types/googleDocs';

/**
 * Extract plain text from a paragraph, preserving formatting for bold text at start.
 * 
 * If a paragraph starts with bold text that ends with a sentence (., !, or ?),
 * it will be wrapped with ** markers. This applies to:
 * - Regular paragraph text
 * - List items
 * - Any text extracted from paragraphs
 * 
 * Example: "Bold text. Normal text..." becomes "**Bold text.** Normal text..."
 */
export function extractTextFromParagraph(paragraph: Paragraph): string {
  // Check if paragraph starts with bold text (after any leading whitespace)
  if (paragraph.elements.length > 0) {
    // Find the first non-whitespace element and check if it's bold
    let firstBoldIndex = -1;
    
    for (let i = 0; i < paragraph.elements.length; i++) {
      const element = paragraph.elements[i];
      const content = element.textRun?.content || '';
      const isBold = element.textRun?.textStyle?.bold === true;
      
      // If it's just whitespace, collect it as leading whitespace
      if (!content.trim()) {
        continue;
      }
      
      // Found first non-whitespace element
      if (isBold) {
        firstBoldIndex = i;
        break;
      } else {
        // First non-whitespace is not bold, so no bold formatting
        break;
      }
    }
    
    if (firstBoldIndex >= 0) {
      // Find where the bold text ends (first sentence ending with . ! or ?)
      let boldText = '';
      let boldEndIndex = -1;
      let foundSentenceEnd = false;
      
      for (let i = firstBoldIndex; i < paragraph.elements.length; i++) {
        const element = paragraph.elements[i];
        const isBold = element.textRun?.textStyle?.bold === true;
        
        if (!isBold) {
          // Found non-bold text, stop collecting bold text
          break;
        }
        
        const content = element.textRun?.content || '';
        boldText += content;
        
        // Check if this content ends a sentence (period, question mark, exclamation)
        // Look for sentence-ending punctuation followed by optional whitespace
        if (/[.!?]\s*$/.test(content)) {
          boldEndIndex = i;
          foundSentenceEnd = true;
          break;
        }
      }
      
      // If we found bold text that ends with a sentence, wrap it with **
      if (foundSentenceEnd && boldText.trim()) {
        // Extract the rest of the paragraph (everything after the bold sentence)
        const restOfParagraph = paragraph.elements
          .slice(boldEndIndex + 1)
          .map(el => el.textRun?.content || '')
          .join('')
          .trim();
        
        // Trim the bold text and wrap it with **
        const trimmedBold = boldText.trim();
        const formattedBold = `**${trimmedBold}**`;
        
        // Combine bold text and rest (leading whitespace is removed)
        return restOfParagraph 
          ? `${formattedBold} ${restOfParagraph}`
          : formattedBold;
      }
    }
  }
  
  // Default: extract plain text without formatting
  return paragraph.elements
    .map(el => el.textRun?.content || '')
    .join('')
    .trim();
}

/**
 * Extract text from an array of structural elements
 */
export function extractTextFromElements(elements: StructuralElement[]): string {
  return elements
    .map(el => {
      if (el.paragraph) {
        return extractTextFromParagraph(el.paragraph);
      }
      return '';
    })
    .join(' ')
    .trim();
}

/**
 * Generate a route from a title and topic
 */
export function generateRoute(title: string, topic: string): string {
  const titleSlug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  
  // Add topic prefix: "topic/title-slug"
  return `${topic}/${titleSlug}`;
}

/**
 * Clean underlined text by removing trailing underscores after a space
 */
export function cleanUnderlinedText(text: string): string {
  // Remove trailing underscores after a space
  // Pattern: "text __" or "text ___" etc.
  return text.replace(/\s+_+$/, '').trim();
}

/**
 * Check if a paragraph element is bold and italic
 */
export function isBoldAndItalic(element: ParagraphElement): boolean {
  const textStyle = element.textRun?.textStyle;
  return textStyle?.bold === true && textStyle?.italic === true;
}

/**
 * Check if a cell contains bold text
 */
export function isCellBold(cell: { content: StructuralElement[] }): boolean {
  for (const element of cell.content) {
    if (element.paragraph) {
      const hasBold = element.paragraph.elements.some(
        el => el.textRun?.textStyle?.bold === true
      );
      if (hasBold) return true;
    }
  }
  return false;
}

