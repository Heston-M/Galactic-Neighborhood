import {
  GoogleDoc,
  Paragraph,
  Table,
  TableCell,
  TableRow
} from './types/googleDocs';
import { JsonPage } from './types/page';
import {
  extractTextFromElements,
  extractTextFromParagraph,
  isBoldAndItalic,
  isCellBold
} from './utils';

/**
 * Check if a paragraph is a page boundary (H1, H2, or H3 in Google Doc)
 */
export function isPageBoundary(paragraph: Paragraph): boolean {
  const style = paragraph.paragraphStyle?.namedStyleType;
  
  return !!(
    style?.startsWith('HEADING_1') ||
    style?.startsWith('HEADING_2') ||
    style?.startsWith('HEADING_3')
  );
}

/**
 * Detect heading level based on formatting:
 * - headingLevel = 1: Underlined text
 * - headingLevel = 2: Text with fontSize = 11
 */
export function detectHeadingLevel(paragraph: Paragraph): 1 | 2 | null {
  // Check for underlined text (headingLevel = 1)
  const hasUnderline = paragraph.elements.some(
    el => el.textRun?.textStyle?.underline === true
  );
  
  if (hasUnderline) {
    return 1;
  }
  
  // Check for fontSize = 11 (headingLevel = 2)
  const hasFontSize11 = paragraph.elements.some(
    el => el.textRun?.textStyle?.fontSize?.magnitude === 11
  );
  
  if (hasFontSize11) {
    return 2;
  }
  
  return null;
}

/**
 * Detect list type from paragraph
 */
export function detectListType(paragraph: Paragraph, doc?: GoogleDoc): 'bullet' | 'number' | null {
  if (!paragraph.bullet) {
    return null;
  }
  
  // Check list style from document's lists collection
  if (doc?.lists && paragraph.bullet.listId) {
    const list = doc.lists[paragraph.bullet.listId];
    // This is a simplified check - you may need to refine based on actual list structure
    // Typically bullet lists have different styling than numbered lists
  }
  
  // Default to bullet if we can't determine
  // You may need to refine this based on your document's list structure
  return 'bullet';
}

/**
 * Extract list items from a paragraph
 */
export function extractListFromParagraph(paragraph: Paragraph): string[] {
  const items: string[] = [];
  const text = extractTextFromParagraph(paragraph);
  
  if (text.trim()) {
    items.push(text);
  }
  
  return items;
}

/**
 * Check if table is 1x1
 */
export function isListInTable(table: Table): boolean {
  const rows = getTableRows(table);
  if (rows.length === 0) {
    return false;
  }
  
  return (table.rows === 1 || rows.length === 1) && 
         (table.columns === 1 || (rows[0]?.tableCells?.length === 1));
}

/**
 * Extract list from a 1x1 table
 */
export function extractListFrom1x1Table(
  table: Table, 
  doc?: GoogleDoc
): { listType: 'bullet' | 'number'; items: string[] } | null {
  if (!isListInTable(table)) {
    return null;
  }
  
  const rows = getTableRows(table);
  if (rows.length === 0 || !rows[0]) {
    return null;
  }
  
  const cell = rows[0].tableCells?.[0];
  if (!cell) return null;
  
  const listItems: string[] = [];
  let detectedListType: 'bullet' | 'number' | null = null;
  
  for (const element of cell.content) {
    if (element.paragraph) {
      const listType = detectListType(element.paragraph, doc);
      if (listType) {
        if (!detectedListType) {
          detectedListType = listType;
        }
        const text = extractTextFromParagraph(element.paragraph);
        if (text.trim()) {
          listItems.push(text);
        }
      }
    }
  }
  
  if (listItems.length > 0) {
    return {
      listType: detectedListType || 'bullet',
      items: listItems,
    };
  }
  
  return null;
}

/**
 * Get table rows array, handling different API response structures
 */
function getTableRows(table: Table): TableRow[] {
  // The Google Docs API returns rows in table.tableRows (not table.rows!)
  // table.rows is a number (count), table.tableRows is the array
  if (table.tableRows && Array.isArray(table.tableRows)) {
    return table.tableRows;
  }
  
  // Fallback: return empty array if tableRows is not available
  return [];
}

/**
 * Check if table is a damage table (flipped - headers in left column)
 */
export function isDamageTable(table: Table): boolean {
  // Damage tables are the only flipped tables
  // They have headers in the left column (first column)
  
  const rows = getTableRows(table);
  if (rows.length === 0) {
    return false;
  }
  
  let leftColumnBoldCount = 0;
  let totalLeftCells = 0;
  
  for (const row of rows) {
    if (row && row.tableCells && Array.isArray(row.tableCells) && row.tableCells[0]) {
      totalLeftCells++;
      if (isCellBold(row.tableCells[0])) {
        leftColumnBoldCount++;
      }
    }
  }
  
  // If most left column cells are bold, it's likely a damage table
  return totalLeftCells > 0 && leftColumnBoldCount / totalLeftCells > 0.5;
}

/**
 * Type for a JsonPage section
 */
type JsonPageSection = NonNullable<JsonPage['sections']>[number];

/**
 * Extract table information
 */
export function extractTable(
  table: Table, 
  doc?: GoogleDoc
): (JsonPageSection & { type: 'table' }) | null {
  // Check for 1x1 table with list (extract list, ignore table)
  const listData = extractListFrom1x1Table(table, doc);
  if (listData) {
    return null; // Signal to extract as list instead
  }
  
  const tableRows = getTableRows(table);
  if (tableRows.length === 0) {
    return null;
  }
  
  // Check for note table (1 column, 2 rows) - must be checked before other table processing
  // Notes are always 1 column and exactly 2 rows
  const isNoteTable = (table.columns === 1 && table.rows === 2) || 
                      (tableRows.length === 2 && tableRows[0]?.tableCells?.length === 1 && tableRows[1]?.tableCells?.length === 1);
  
  if (isNoteTable) {
    return null; // Signal to extract as note instead (handled in index.ts)
  }
  
  const isDamage = isDamageTable(table);
  const rows: string[][] = [];
  const headers: string[] = [];
  let tableTitle: string | undefined;
  let damageTableOutput: string | undefined;
  
  if (isDamage) {
    // Damage tables are flipped - headers in left column
    const firstRow = tableRows[0];
    let startRowIndex = 0;
    
    if (firstRow) {
      const firstLeftCell = firstRow.tableCells?.[0];
      
      if (firstLeftCell) {
        const firstLeftText = extractTextFromElements(firstLeftCell.content);
        const isFirstLeftBold = isCellBold(firstLeftCell);
        
        if (!isFirstLeftBold) {
          // First row, left cell not bold - this is the table title
          tableTitle = firstLeftText;
          startRowIndex = 1;
        }
      }
    }
    
    // Find the uppermost header (first bold cell in left column after title)
    for (let rowIndex = startRowIndex; rowIndex < tableRows.length; rowIndex++) {
      const row = tableRows[rowIndex];
      if (!row || !row.tableCells?.[0]) continue;
      
      const leftCell = row.tableCells[0];
      if (isCellBold(leftCell)) {
        damageTableOutput = extractTextFromElements(leftCell.content);
        startRowIndex = rowIndex;
        break;
      }
    }
    
    // Extract headers from right column (starting from header row)
    if (startRowIndex < tableRows.length) {
      const headerRow = tableRows[startRowIndex];
      if (headerRow && headerRow.tableCells) {
        for (let colIndex = 1; colIndex < headerRow.tableCells.length; colIndex++) {
          const cell = headerRow.tableCells[colIndex];
          if (cell) {
            headers.push(extractTextFromElements(cell.content));
          }
        }
      }
    }
    
    // Extract data rows
    for (let rowIndex = startRowIndex + 1; rowIndex < tableRows.length; rowIndex++) {
      const row = tableRows[rowIndex];
      if (!row || !row.tableCells) continue;
      
      const rowData: string[] = [];
      for (let colIndex = 1; colIndex < row.tableCells.length; colIndex++) {
        const cell = row.tableCells[colIndex];
        if (cell) {
          rowData.push(extractTextFromElements(cell.content));
        }
      }
      
      if (rowData.length > 0) {
        rows.push(rowData);
      }
    }
    
    return {
      type: 'table',
      tableInfo: {
        title: tableTitle,
        headers: headers.length > 0 ? headers : ['Die Roll'],
        rows: rows,
        flipTable: true,
        isDamageTable: true,
        damageTableOutput: damageTableOutput || '',
      },
    };
  } else {
    // Regular table - double-check it's not a note (should have been caught earlier, but be safe)
    // Notes are 1 column, 2 rows - skip title detection for these
    const isNoteTable = (table.columns === 1 && table.rows === 2) || 
                        (tableRows.length === 2 && 
                         tableRows[0]?.tableCells?.length === 1 && 
                         tableRows[1]?.tableCells?.length === 1);
    
    if (isNoteTable) {
      // This should have been caught by extractNoteFromTable, but if we get here, return null
      return null;
    }
    
    // Regular table - check if first row is a title row
    const firstRow = tableRows[0];
    let startRowIndex = 0;
    
    if (firstRow && firstRow.tableCells) {
      // Check if first row is a title row (spans all columns)
      // A title row can be:
      // 1. Has a single cell with text (merged cell spanning all columns)
      // 2. Has all cells with the same text
      // 3. Has text only in the first cell, remaining cells are empty
      const firstRowTexts = firstRow.tableCells.map(cell => extractTextFromElements(cell.content).trim());
      const firstRowHasBold = firstRow.tableCells.some(cell => isCellBold(cell));
      
      // If first row has no bold text and has title-like content, it's a title row
      if (!firstRowHasBold) {
        const nonEmptyTexts = firstRowTexts.filter(text => text);
        
        if (nonEmptyTexts.length > 0) {
          const firstText = nonEmptyTexts[0];
          
          // Check if it's a title row:
          // - Single cell with text (merged cell)
          // - All cells have the same text
          // - Only first cell has text, rest are empty
          const isTitleRow = nonEmptyTexts.length === 1 || 
                            (firstText && nonEmptyTexts.every(text => text === firstText)) ||
                            (firstRowTexts[0] && firstRowTexts.slice(1).every(text => !text || text.trim() === ''));
          
          if (isTitleRow) {
            // This is a title row - extract title and skip to next row for headers
            tableTitle = firstText;
            startRowIndex = 1;
          }
        }
      }
    }
    
    // Extract headers and data rows
    tableRows.forEach((row, rowIndex) => {
      if (!row.tableCells) return;
      
      const rowData: string[] = [];
      
      row.tableCells.forEach((cell: TableCell) => {
        const cellText = extractTextFromElements(cell.content);
        const isBold = isCellBold(cell);
        
        if (rowIndex === startRowIndex) {
          // This is the header row (first row if no title, second row if there's a title)
          if (isBold) {
            headers.push(cellText);
          }
        } else if (rowIndex > startRowIndex) {
          // Data rows
          rowData.push(cellText);
        }
      });
      
      if (rowIndex > startRowIndex && rowData.length > 0) {
        rows.push(rowData);
      }
    });
    
    return {
      type: 'table',
      tableInfo: {
        title: tableTitle,
        headers: headers.length > 0 ? headers : [],
        rows: rows,
        flipTable: false,
        isDamageTable: false,
      },
    };
  }
}

/**
 * Extract note from a 1 column, 2 row table
 */
export function extractNoteFromTable(table: Table): (JsonPageSection & { type: 'note' }) | null {
  const tableRows = getTableRows(table);
  
  // Notes are always 1 column and exactly 2 rows
  // Check both the table metadata and actual row structure
  const is1x2 = (table.columns === 1 && table.rows === 2) || 
                (tableRows.length === 2 && 
                 tableRows[0]?.tableCells?.length === 1 && 
                 tableRows[1]?.tableCells?.length === 1);
  
  if (!is1x2) {
    return null;
  }
  
  const firstRow = tableRows[0];
  const secondRow = tableRows[1];
  
  if (!firstRow || !secondRow) {
    return null;
  }
  
  // Get the first (and only) cell from each row
  const firstCell = firstRow.tableCells?.[0];
  const secondCell = secondRow.tableCells?.[0];
  
  if (!firstCell || !secondCell) {
    return null;
  }
  
  const noteTitle = extractTextFromElements(firstCell.content);
  const noteContent = extractTextFromElements(secondCell.content);
  
  // Return note even if content is empty (let the hasContent check filter it out if needed)
  return {
    type: 'note',
    noteInfo: {
      noteTitle: noteTitle.trim(),
      noteContent: noteContent.trim(),
    },
  };
}

/**
 * Detect aspects (bold and italic text)
 */
export function detectAspects(paragraph: Paragraph): Array<{ name: string; value: string }> | null {
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

