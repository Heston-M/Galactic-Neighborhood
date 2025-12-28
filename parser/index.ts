import { getTopicForChapter } from './config';
import {
  detectAspects,
  detectHeadingLevel,
  detectListType,
  extractListFrom1x1Table,
  extractListFromParagraph,
  extractNoteFromTable,
  extractTable,
  isPageBoundary,
} from './extractors';
import { extractDocumentId, fetchGoogleDoc } from './googleDocsClient';
import { GoogleDoc } from './types/googleDocs';
import { JsonPage } from './types/page';
import { Topic } from './types/topic';
import {
  cleanUnderlinedText,
  extractTextFromParagraph,
  generateRoute
} from './utils';

/**
 * Parse a Google Doc into JsonPage array
 * 
 * @param documentIdOrUrl - Google Doc ID or full URL
 * @returns Array of JsonPage objects
 */
export async function parseGoogleDocToPages(
  documentIdOrUrl: string
): Promise<JsonPage[]> {
  const documentId = extractDocumentId(documentIdOrUrl);
  const doc = await fetchGoogleDoc(documentId);
  
  return parseDocument(doc);
}

/**
 * Check if a page has any content
 */
function hasContent(page: Partial<JsonPage> & { sections?: JsonPage['sections'] }): boolean {
  if (!page.sections || page.sections.length === 0) {
    return false;
  }
  
  // Check if any section has actual content
  return page.sections.some(section => {
    if (section.type === 'text' && section.text?.trim()) {
      return true;
    }
    if (section.type === 'heading' && section.text?.trim()) {
      return true;
    }
    if (section.type === 'aspects' && section.aspectsInfo && section.aspectsInfo.length > 0) {
      return true;
    }
    if (section.type === 'list' && section.listInfo?.listItems && section.listInfo.listItems.length > 0) {
      return true;
    }
    if (section.type === 'table' && section.tableInfo) {
      // Table has content if it has headers or rows
      return (section.tableInfo.headers && section.tableInfo.headers.length > 0) ||
             (section.tableInfo.rows && section.tableInfo.rows.length > 0);
    }
    if (section.type === 'note' && (section.noteInfo?.noteTitle?.trim() || section.noteInfo?.noteContent?.trim())) {
      return true;
    }
    return false;
  });
}

/**
 * Parse a GoogleDoc object into JsonPage array
 */
export function parseDocument(doc: GoogleDoc): JsonPage[] {
  const pages: JsonPage[] = [];
  let currentPage: Partial<JsonPage> | null = null;
  let currentSections: JsonPage['sections'] = [];
  let currentTopic: Topic = "general";
  let lastHeadingLevel2 = false;
  
  for (const element of doc.body.content) {
    // Handle paragraphs
    if (element.paragraph) {
      // Check if this is a page boundary (H1, H2, or H3 in Google Doc)
      if (isPageBoundary(element.paragraph)) {
        // Save previous page (only if it has content)
        if (currentPage) {
          const pageToAdd = {
            ...currentPage,
            sections: currentSections,
          } as JsonPage;
          
          if (hasContent(pageToAdd)) {
            pages.push(pageToAdd);
          }
        }
        
        // Check if this is a chapter title (H1)
        const style = element.paragraph.paragraphStyle?.namedStyleType;
        if (style?.startsWith('HEADING_1')) {
          const chapterTitle = extractTextFromParagraph(element.paragraph);
          currentTopic = getTopicForChapter(chapterTitle);
        }
        
        // Start new page - use the paragraph text as page title
        const title = extractTextFromParagraph(element.paragraph);
        currentPage = {
          title,
          topic: currentTopic,
          route: generateRoute(title, currentTopic),
        };
        currentSections = [];
        lastHeadingLevel2 = false;
        continue;
      }
      
      // Check for our headingLevel = 1 (underlined text)
      const headingLevel = detectHeadingLevel(element.paragraph);
      if (headingLevel === 1) {
        let text = extractTextFromParagraph(element.paragraph);
        text = cleanUnderlinedText(text); // Remove trailing underscores
        currentSections.push({
          type: 'heading',
          headingLevel: 1,
          text,
        });
        lastHeadingLevel2 = false;
        continue;
      }
      
      // Check for our headingLevel = 2 (fontSize = 11)
      if (headingLevel === 2) {
        const text = extractTextFromParagraph(element.paragraph);
        currentSections.push({
          type: 'heading',
          headingLevel: 2,
          text,
        });
        lastHeadingLevel2 = true; // Next paragraph might be aspects
        continue;
      }
      
      // Check for aspects (bold+italic, following headingLevel = 2)
      if (lastHeadingLevel2) {
        const aspects = detectAspects(element.paragraph);
        if (aspects && aspects.length > 0) {
          currentSections.push({
            type: 'aspects',
            aspectsInfo: aspects,
          });
          lastHeadingLevel2 = false;
          continue;
        }
      }
      
      // Check for lists
      const listType = detectListType(element.paragraph, doc);
      if (listType) {
        const items = extractListFromParagraph(element.paragraph);
        if (items.length > 0) {
          currentSections.push({
            type: 'list',
            listInfo: {
              listType,
              listItems: items,
            },
          });
        }
        lastHeadingLevel2 = false;
        continue;
      }
      
      // Regular paragraph text
      const text = extractTextFromParagraph(element.paragraph);
      if (text.trim()) {
        currentSections.push({
          type: 'text',
          text,
        });
      }
      lastHeadingLevel2 = false;
    }
    
    // Handle tables
    if (element.table) {
      // Check for note table first (1 column, 2 rows)
      const noteInfo = extractNoteFromTable(element.table);
      if (noteInfo) {
        currentSections.push(noteInfo);
        lastHeadingLevel2 = false;
        continue;
      }
      
      // Check for 1x1 table with list
      const listData = extractListFrom1x1Table(element.table, doc);
      if (listData) {
        currentSections.push({
          type: 'list',
          listInfo: {
            listType: listData.listType,
            listItems: listData.items,
          },
        });
        lastHeadingLevel2 = false;
        continue;
      }
      
      // Regular table extraction
      const tableInfo = extractTable(element.table, doc);
      if (tableInfo) {
        currentSections.push(tableInfo);
      } else {
        console.warn('Table extraction returned null. Table had', element.table.rows, 'rows,', element.table.tableRows?.length || 0, 'tableRows');
      }
      lastHeadingLevel2 = false;
    }
  }
  
  // Don't forget the last page (only if it has content)
  if (currentPage) {
    const pageToAdd = {
      ...currentPage,
      sections: currentSections,
    } as JsonPage;
    
    if (hasContent(pageToAdd)) {
      pages.push(pageToAdd);
    }
  }
  
  return pages;
}

/**
 * Export pages to JSON file
 */
export async function exportPagesToFile(
  pages: JsonPage[],
  outputPath: string
): Promise<void> {
  const fs = await import('fs/promises');
  await fs.writeFile(outputPath, JSON.stringify(pages, null, 2), 'utf-8');
}

/**
 * Main entry point for CLI usage
 */
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.error('Usage: ts-node parser/index.ts <document-id-or-url> [output-file]');
    console.error('');
    console.error('Example:');
    console.error('  ts-node parser/index.ts https://docs.google.com/document/d/ABC123/edit output.json');
    process.exit(1);
  }
  
  const documentIdOrUrl = args[0];
  const outputFile = args[1] || 'parsed-pages.json';
  
  parseGoogleDocToPages(documentIdOrUrl)
    .then(async (pages) => {
      console.log(`Parsed ${pages.length} pages`);
      await exportPagesToFile(pages, outputFile);
      console.log(`Exported to ${outputFile}`);
    })
    .catch((error) => {
      console.error('Error parsing document:', error);
      process.exit(1);
    });
}

