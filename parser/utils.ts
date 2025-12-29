import { Paragraph, ParagraphElement, StructuralElement } from './types/googleDocs';

/**
 * Extract plain text from a paragraph
 */
export function extractTextFromParagraph(paragraph: Paragraph): string {
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

