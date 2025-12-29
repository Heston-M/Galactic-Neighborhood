# Google Docs Parser Implementation Guide

## Overview

This guide provides technical details for implementing a parser that converts Google Docs into `JsonPage` format.

## Prerequisites

1. **Google Cloud Project Setup**
   - Create a project in Google Cloud Console
   - Enable Google Docs API
   - Create OAuth 2.0 credentials or Service Account
   - Share the Google Doc with the service account email (if using service account)

2. **Dependencies**
   ```bash
   npm install googleapis
   # or
   npm install @google-cloud/docs
   ```

## Google Docs API Document Structure

The Google Docs API returns documents in a structured JSON format:

```typescript
interface GoogleDoc {
  body: {
    content: Array<StructuralElement>
  }
}

interface StructuralElement {
  paragraph?: Paragraph
  table?: Table
  sectionBreak?: SectionBreak
  tableOfContents?: TableOfContents
}

interface Paragraph {
  elements: Array<ParagraphElement>
  paragraphStyle?: ParagraphStyle
  bullet?: Bullet
}

interface ParagraphElement {
  textRun?: TextRun
  pageBreak?: PageBreak
  columnBreak?: ColumnBreak
  footnoteReference?: FootnoteReference
  horizontalRule?: HorizontalRule
  equation?: Equation
}

interface TextRun {
  content: string
  textStyle?: TextStyle
}

interface Table {
  rows: Array<TableRow>
  tableRows: number
  columns: number
  suggestedInsertionIds?: string[]
  suggestedDeletionIds?: string[]
}

interface TableRow {
  cells: Array<TableCell>
  suggestedInsertionIds?: string[]
  suggestedDeletionIds?: string[]
}

interface TableCell {
  content: Array<StructuralElement>
  tableCellStyle?: TableCellStyle
}
```

## Document Structure

### Chapter and Topic Mapping

The document is divided into chapters, where each chapter title is a Header Level 1 (H1) in the Google Doc. You'll need to manually configure a mapping of chapter titles to topics.

```typescript
// Configuration: Map chapter titles to topics
const chapterTopicMap: Record<string, Topic> = {
  "Chapter 1: Introduction": "general",
  "Chapter 2: Character Creation": "characters",
  "Chapter 3: Equipment": "equipment",
  "Chapter 4: Magic": "magic",
  "Chapter 5: Combat Rules": "rules",
  // ... add all chapter titles here
};

function getTopicForChapter(chapterTitle: string): Topic {
  return chapterTopicMap[chapterTitle] || "general";
}
```

## Key Detection Patterns

### Page Boundary Detection

**Important**: In this document, Google Doc heading levels 1, 2, and 3 all designate new pages. They do NOT map to our `headingLevel` field.

```typescript
function isPageBoundary(paragraph: Paragraph): boolean {
  const style = paragraph.paragraphStyle?.namedStyleType;
  
  // H1, H2, H3 all create new pages
  if (style?.startsWith('HEADING_1') || 
      style?.startsWith('HEADING_2') || 
      style?.startsWith('HEADING_3')) {
    return true;
  }
  
  return false;
}
```

### Heading Level Detection

Our `headingLevel` field is determined by formatting, not Google Doc heading styles:

- **headingLevel = 1**: Underlined text (remove trailing underscores after space)
- **headingLevel = 2**: Text with fontSize = 11

```typescript
function detectHeadingLevel(paragraph: Paragraph): { level: 1 | 2 | null } {
  // Check for underlined text (headingLevel = 1)
  const hasUnderline = paragraph.elements.some(
    el => el.textRun?.textStyle?.underline === true
  );
  
  if (hasUnderline) {
    return { level: 1 };
  }
  
  // Check for fontSize = 11 (headingLevel = 2)
  const hasFontSize11 = paragraph.elements.some(
    el => el.textRun?.textStyle?.fontSize?.magnitude === 11
  );
  
  if (hasFontSize11) {
    return { level: 2 };
  }
  
  return { level: null };
}

function cleanUnderlinedText(text: string): string {
  // Remove trailing underscores after a space
  // Pattern: "text __" or "text ___" etc.
  return text.replace(/\s+_+$/, '').trim();
}
```

### List Detection

Lists can appear in two forms:
1. **Simple list components** - standard Google Docs lists
2. **1x1 tables containing lists** - must extract list and disregard table

```typescript
function detectListType(paragraph: Paragraph): 'bullet' | 'number' | null {
  if (paragraph.bullet) {
    // Check list style from document's lists
    // Google Docs API provides list styles separately
    // You'll need to check the document's lists collection
    return paragraph.bullet.listId ? 'bullet' : 'number';
  }
  return null;
}

function extractListFromParagraph(paragraph: Paragraph): string[] {
  const items: string[] = [];
  const text = extractTextFromParagraph(paragraph);
  
  if (text.trim()) {
    items.push(text);
  }
  
  return items;
}

function isListInTable(table: Table): boolean {
  // Check if table is 1x1 and contains list content
  return table.tableRows === 1 && table.columns === 1;
}

function extractListFrom1x1Table(table: Table): { 
  listType: 'bullet' | 'number', 
  items: string[] 
} | null {
  if (!isListInTable(table)) {
    return null;
  }
  
  const cell = table.rows[0]?.cells[0];
  if (!cell) return null;
  
  // Check if cell content is a list
  const listItems: string[] = [];
  
  for (const element of cell.content) {
    if (element.paragraph) {
      const listType = detectListType(element.paragraph);
      if (listType) {
        const text = extractTextFromParagraph(element.paragraph);
        if (text.trim()) {
          listItems.push(text);
        }
      }
    }
  }
  
  if (listItems.length > 0) {
    // Determine list type from first item
    const firstPara = cell.content.find(el => el.paragraph)?.paragraph;
    const listType = firstPara ? detectListType(firstPara) : 'bullet';
    
    return {
      listType: listType || 'bullet',
      items: listItems,
    };
  }
  
  return null;
}
```

### Table Extraction

**Important Rules:**
- Table headers are always bold text
- Do NOT estimate column widths or wrappable columns (leave these fields out)
- Check for special table types: Notes (1x2), Lists (1x1), Damage Tables (flipped)

```typescript
function isCellBold(cell: TableCell): boolean {
  // Check if any text in the cell is bold
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

function isDamageTable(table: Table): boolean {
  // Damage tables are the only flipped tables
  // They have headers in the left column (first column)
  // Check if left column cells are bold (indicating headers)
  let leftColumnBoldCount = 0;
  let totalLeftCells = 0;
  
  for (const row of table.rows) {
    if (row.cells[0]) {
      totalLeftCells++;
      if (isCellBold(row.cells[0])) {
        leftColumnBoldCount++;
      }
    }
  }
  
  // If most left column cells are bold, it's likely a damage table
  // This is a heuristic - you may need to refine based on actual document
  return totalLeftCells > 0 && leftColumnBoldCount / totalLeftCells > 0.5;
}

function extractTable(table: Table, doc: GoogleDoc): TableInfo | null {
  // Check for 1x1 table with list (extract list, ignore table)
  const listData = extractListFrom1x1Table(table);
  if (listData) {
    return null; // Signal to extract as list instead
  }
  
  // Check for note table (1 column, 2 rows)
  if (table.columns === 1 && table.tableRows === 2) {
    return null; // Signal to extract as note instead
  }
  
  // Check for damage table (flipped - headers in left column)
  const isDamage = isDamageTable(table);
  
  const rows: string[][] = [];
  const headers: string[] = [];
  let tableTitle: string | undefined;
  let damageTableOutput: string | undefined;
  
  if (isDamage) {
    // Damage tables are flipped - headers in left column
    // First row might be a title (not bold) or first header row (bold)
    const firstRow = table.rows[0];
    let startRowIndex = 0;
    
    if (firstRow) {
      const firstLeftCell = firstRow.cells[0];
      
      if (firstLeftCell) {
        const firstLeftText = extractTextFromElements(firstLeftCell.content);
        const isFirstLeftBold = isCellBold(firstLeftCell);
        
        if (!isFirstLeftBold) {
          // First row, left cell not bold - this is the table title
          tableTitle = firstLeftText;
          startRowIndex = 1; // Skip title row
        }
      }
    }
    
    // Find the uppermost header (first bold cell in left column after title)
    // This becomes damageTableOutput
    for (let rowIndex = startRowIndex; rowIndex < table.rows.length; rowIndex++) {
      const row = table.rows[rowIndex];
      if (!row || !row.cells[0]) continue;
      
      const leftCell = row.cells[0];
      if (isCellBold(leftCell)) {
        damageTableOutput = extractTextFromElements(leftCell.content);
        startRowIndex = rowIndex;
        break;
      }
    }
    
    // Extract headers from right column (starting from header row)
    if (startRowIndex < table.rows.length) {
      const headerRow = table.rows[startRowIndex];
      if (headerRow) {
        // Right column cells in header row are the column headers
        for (let colIndex = 1; colIndex < headerRow.cells.length; colIndex++) {
          const cell = headerRow.cells[colIndex];
          if (cell) {
            headers.push(extractTextFromElements(cell.content));
          }
        }
      }
    }
    
    // Extract data rows (left column = row headers, right columns = data)
    for (let rowIndex = startRowIndex + 1; rowIndex < table.rows.length; rowIndex++) {
      const row = table.rows[rowIndex];
      if (!row) continue;
      
      const rowData: string[] = [];
      // Skip left column (row header), collect data from right columns
      for (let colIndex = 1; colIndex < row.cells.length; colIndex++) {
        const cell = row.cells[colIndex];
        if (cell) {
          rowData.push(extractTextFromElements(cell.content));
        }
      }
      
      if (rowData.length > 0) {
        rows.push(rowData);
      }
    }
    
    return {
      title: tableTitle,
      headers: headers.length > 0 ? headers : ['Die Roll'],
      rows: rows,
      flipTable: true,
      isDamageTable: true,
      damageTableOutput: damageTableOutput || '',
      // Do NOT include columnWidths or wrappableColumns
    };
  } else {
    // Regular table - headers are bold text in first row
    table.rows.forEach((row, rowIndex) => {
      const rowData: string[] = [];
      
      row.cells.forEach((cell) => {
        const cellText = extractTextFromElements(cell.content);
        const isBold = isCellBold(cell);
        
        if (rowIndex === 0) {
          // First row - check if bold (header) or not (title)
          if (isBold) {
            headers.push(cellText);
          } else if (!tableTitle && cellText.trim()) {
            // First non-bold cell in first row might be table title
            tableTitle = cellText;
          }
        } else {
          rowData.push(cellText);
        }
      });
      
      if (rowIndex > 0 && rowData.length > 0) {
        rows.push(rowData);
      }
    });
    
    return {
      title: tableTitle,
      headers: headers.length > 0 ? headers : [],
      rows: rows,
      // Do NOT include columnWidths or wrappableColumns
      flipTable: false,
      isDamageTable: false,
    };
  }
}
```

## Parser Architecture

### Main Parser Function

```typescript
async function parseGoogleDocToPages(
  documentId: string,
  chapterTopicMap: Record<string, Topic>
): Promise<JsonPage[]> {
  const doc = await fetchGoogleDoc(documentId);
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
        // Save previous page
        if (currentPage) {
          pages.push({
            ...currentPage,
            sections: currentSections,
          } as JsonPage);
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
          route: generateRoute(title),
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
          // Collect all aspects that follow this headingLevel = 2
          // They might span multiple paragraphs, so keep checking
          const allAspects: Array<{ name: string; value: string }> = [...aspects];
          
          // Add all aspects as a single aspects section
          currentSections.push({
            type: 'aspects',
            aspectsInfo: allAspects,
          });
          lastHeadingLevel2 = false; // Reset after finding aspects
          continue;
        }
      }
      
      // Check for lists
      const listType = detectListType(element.paragraph);
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
        currentSections.push({
          type: 'note',
          noteInfo,
        });
        lastHeadingLevel2 = false;
        continue;
      }
      
      // Check for 1x1 table with list
      const listData = extractListFrom1x1Table(element.table);
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
        currentSections.push({
          type: 'table',
          tableInfo,
        });
      }
      lastHeadingLevel2 = false;
    }
  }
  
  // Don't forget the last page
  if (currentPage) {
    pages.push({
      ...currentPage,
      sections: currentSections,
    } as JsonPage);
  }
  
  return pages;
}
```

## Helper Functions

### Text Extraction

```typescript
function extractTextFromParagraph(paragraph: Paragraph): string {
  return paragraph.elements
    .map(el => el.textRun?.content || '')
    .join('')
    .trim();
}

function extractTextFromElements(elements: StructuralElement[]): string {
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
```

### Route Generation

```typescript
function generateRoute(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
```

### Text Extraction with Formatting

```typescript
function extractTextFromParagraph(paragraph: Paragraph): string {
  return paragraph.elements
    .map(el => el.textRun?.content || '')
    .join('')
    .trim();
}

function extractTextFromElements(elements: StructuralElement[]): string {
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

function extractTextWithFormatting(element: ParagraphElement): {
  text: string;
  isBold: boolean;
  isItalic: boolean;
  isUnderlined: boolean;
  fontSize?: number;
} {
  const textRun = element.textRun;
  return {
    text: textRun?.content || '',
    isBold: textRun?.textStyle?.bold === true,
    isItalic: textRun?.textStyle?.italic === true,
    isUnderlined: textRun?.textStyle?.underline === true,
    fontSize: textRun?.textStyle?.fontSize?.magnitude,
  };
}
```

**Note**: Column widths and wrappable columns are NOT extracted - these fields should be omitted from the output and filled in manually.

## Special Cases

### Aspects Detection

**Rules:**
- Aspects are always **bold and italic** text
- Always follow `headingLevel = 2` headers (fontSize = 11)
- Format: Usually "Name: Value" separated by colon and space
- Some aspects have no name (single bold+italic text) - set name to empty string

```typescript
function isBoldAndItalic(element: ParagraphElement): boolean {
  const textStyle = element.textRun?.textStyle;
  return textStyle?.bold === true && textStyle?.italic === true;
}

function detectAspects(paragraph: Paragraph): Array<{ name: string; value: string }> | null {
  // Check if paragraph contains bold and italic text
  const hasBoldItalic = paragraph.elements.some(isBoldAndItalic);
  
  if (!hasBoldItalic) {
    return null;
  }
  
  const aspects: Array<{ name: string; value: string }> = [];
  
  // Process each element that is bold and italic
  for (const element of paragraph.elements) {
    if (isBoldAndItalic(element)) {
      const text = element.textRun?.content || '';
      const trimmedText = text.trim();
      
      if (!trimmedText) continue;
      
      // Check if text contains colon (name: value format)
      if (trimmedText.includes(':')) {
        // Split by colon - name before, value after
        const colonIndex = trimmedText.indexOf(':');
        const name = trimmedText.substring(0, colonIndex).trim();
        const value = trimmedText.substring(colonIndex + 1).trim();
        
        aspects.push({ name, value });
      } else {
        // No colon - single value, no name
        aspects.push({ name: '', value: trimmedText });
      }
    }
  }
  
  return aspects.length > 0 ? aspects : null;
}

// Track when we encounter a headingLevel = 2 to look for aspects
let lastHeadingLevel2 = false;

function shouldLookForAspects(paragraph: Paragraph): boolean {
  const headingLevel = detectHeadingLevel(paragraph);
  if (headingLevel === 2) {
    lastHeadingLevel2 = true;
    return false; // This is the heading itself
  }
  
  // Look for aspects after headingLevel = 2
  if (lastHeadingLevel2) {
    const aspects = detectAspects(paragraph);
    if (aspects) {
      lastHeadingLevel2 = false; // Reset after finding aspects
      return true;
    }
  }
  
  return false;
}
```

### Notes Detection

**Rules:**
- Notes are tables with exactly **1 column and 2 rows**
- First row content = `noteTitle`
- Second row content = `noteContent`

```typescript
function extractNoteFromTable(table: Table): NoteInfo | null {
  // Notes are 1 column, 2 rows
  if (table.columns !== 1 || table.tableRows !== 2) {
    return null;
  }
  
  const firstRow = table.rows[0];
  const secondRow = table.rows[1];
  
  if (!firstRow || !secondRow || !firstRow.cells[0] || !secondRow.cells[0]) {
    return null;
  }
  
  const noteTitle = extractTextFromElements(firstRow.cells[0].content);
  const noteContent = extractTextFromElements(secondRow.cells[0].content);
  
  return {
    noteTitle: noteTitle.trim(),
    noteContent: noteContent.trim(),
  };
}
```

## Error Handling

```typescript
class ParserError extends Error {
  constructor(
    message: string,
    public element: any,
    public originalError?: Error
  ) {
    super(message);
    this.name = 'ParserError';
  }
}

function safeParse<T>(
  fn: () => T,
  errorMessage: string,
  element: any
): T | null {
  try {
    return fn();
  } catch (error) {
    console.error(`${errorMessage}:`, error);
    // Log for manual review
    return null;
  }
}
```

## Validation

```typescript
function validateJsonPage(page: Partial<JsonPage>): page is JsonPage {
  return (
    typeof page.title === 'string' &&
    typeof page.topic === 'string' &&
    typeof page.route === 'string' &&
    (page.sections === undefined || Array.isArray(page.sections))
  );
}

function validateAndFixPages(pages: Partial<JsonPage>[]): JsonPage[] {
  return pages
    .filter(validateJsonPage)
    .map(page => ({
      ...page,
      sections: page.sections || [],
    }));
}
```

## Configuration File

Create a configuration file for chapter-to-topic mapping:

```typescript
// config/chapterTopics.ts
import { Topic } from '@/types/topic';

export const chapterTopicMap: Record<string, Topic> = {
  // Add your chapter titles here and map them to topics
  "Introduction": "general",
  "Character Creation": "characters",
  "Equipment": "equipment",
  "Magic": "magic",
  "Combat": "rules",
  // ... add all chapters
};

export function getTopicForChapter(chapterTitle: string): Topic {
  return chapterTopicMap[chapterTitle] || "general";
}
```

## Next Steps

1. **Set up authentication** - Choose OAuth2 or Service Account
2. **Create chapter topic map** - Fill in `chapterTopicMap` with all chapter titles
3. **Test with sample document** - Extract a small section first
4. **Implement basic parser** - Page boundaries, headings, text
5. **Add table handling** - Regular tables, notes, lists in tables, damage tables
6. **Add aspects detection** - Bold+italic text following headingLevel 2
7. **Create validation** - Ensure output matches JsonPage type
8. **Add error reporting** - Log issues for manual review
9. **Iterate and refine** - Improve accuracy based on results
10. **Manual review** - Fill in column widths and wrappable columns

## Testing Strategy

1. Start with a small, well-formatted section
2. Verify heading detection accuracy
3. Test table extraction with various table types
4. Check list detection (bulleted and numbered)
5. Validate output against JsonPage type
6. Compare with manual conversion to measure accuracy

## Manual Review Process

Even with a good parser, some manual review will be needed:

1. **Configure chapter topics** - Fill in the chapter-to-topic mapping
2. **Review extracted pages** - Check page boundaries (H1/H2/H3 detection)
3. **Verify heading levels** - Check underlined text (level 1) and fontSize 11 (level 2)
4. **Verify table structure** - Ensure headers (bold text) and rows are correct
5. **Add table metadata** - Manually fill in `columnWidths` and `wrappableColumns` (not extracted)
6. **Check damage tables** - Verify `flipTable` and `damageTableOutput` are correct
7. **Validate aspects** - Ensure bold+italic text following headingLevel 2 is correct
8. **Review notes** - Check 1x2 table detection accuracy
9. **Check lists** - Verify 1x1 table list extraction
10. **Fix routes** - Ensure URLs are correct

### Fields Requiring Manual Input

- `tableInfo.columnWidths` - Not extracted, must be filled manually
- `tableInfo.wrappableColumns` - Not extracted, must be filled manually
- `chapterTopicMap` - Must be configured before parsing

Create a review checklist and track accuracy metrics to improve the parser over time.

