/**
 * Google Docs API Type Definitions
 * These types represent the structure returned by the Google Docs API
 */

export interface GoogleDoc {
  documentId: string;
  title: string;
  body: {
    content: StructuralElement[];
  };
  lists?: Record<string, List>;
}

export interface StructuralElement {
  paragraph?: Paragraph;
  table?: Table;
  sectionBreak?: SectionBreak;
  tableOfContents?: TableOfContents;
  startIndex?: number;
  endIndex?: number;
}

export interface Paragraph {
  elements: ParagraphElement[];
  paragraphStyle?: ParagraphStyle;
  bullet?: Bullet;
}

export interface ParagraphElement {
  textRun?: TextRun;
  pageBreak?: PageBreak;
  columnBreak?: ColumnBreak;
  footnoteReference?: FootnoteReference;
  horizontalRule?: HorizontalRule;
  equation?: Equation;
}

export interface TextRun {
  content: string;
  textStyle?: TextStyle;
}

export interface TextStyle {
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  fontSize?: Size;
  foregroundColor?: Color;
  backgroundColor?: Color;
}

export interface Size {
  magnitude: number;
  unit?: string;
}

export interface Color {
  rgbColor?: {
    red?: number;
    green?: number;
    blue?: number;
  };
}

export interface ParagraphStyle {
  namedStyleType?: string;
  headingId?: string;
  backgroundColor?: Color;
  borderTop?: Border;
}

export interface Border {
  color?: Color;
  width?: Size;
}

export interface Bullet {
  listId: string;
  nestingLevel?: number;
}

export interface List {
  listProperties?: {
    nestingLevels?: Array<{
      paragraphStyle?: {
        namedStyleType?: string;
      };
    }>;
  };
}

export interface Table {
  rows: number; // Number of rows (not an array!)
  tableRows: TableRow[]; // Array of actual row data
  columns: number;
  tableStyle?: TableStyle;
  suggestedInsertionIds?: string[];
  suggestedDeletionIds?: string[];
}

export interface TableRow {
  startIndex?: number;
  endIndex?: number;
  tableCells: TableCell[]; // Note: it's "tableCells", not "cells"
  suggestedInsertionIds?: string[];
  suggestedDeletionIds?: string[];
}

export interface TableCell {
  startIndex?: number;
  endIndex?: number;
  content: StructuralElement[];
  tableCellStyle?: TableCellStyle;
}

export interface TableStyle {
  // Table style properties
}

export interface TableCellStyle {
  backgroundColor?: Color;
  borderTop?: Border;
  borderBottom?: Border;
  borderLeft?: Border;
  borderRight?: Border;
}

export interface SectionBreak {
  // Section break properties
}

export interface TableOfContents {
  // Table of contents properties
}

export interface PageBreak {
  // Page break properties
}

export interface ColumnBreak {
  // Column break properties
}

export interface FootnoteReference {
  // Footnote reference properties
}

export interface HorizontalRule {
  // Horizontal rule properties
}

export interface Equation {
  // Equation properties
}

