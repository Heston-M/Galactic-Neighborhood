import { PageTableName } from "./database";
import { Topic } from "./topic";

export type ReactNodePage = {
  title: string;
  topic: Topic;
  route: string;
  snippet?: React.ReactNode;
  content?: React.ReactNode;
}

export type JsonPage = {
  title: string;
  topic: Topic;
  route: string;
  sections?: Array<{
    type: "text" | "heading" | "aspects" | "list" | "table" |  "note";
    text?: string;
    headingLevel?: 1 | 2;
    aspectsInfo?: Array<{
      name: string;
      value: string;
    }>;
    listInfo?: {
      listType?: "bullet" | "number";
      listItems?: Array<string>;
    };
    tableInfo?: {
      title?: string;
      headers?: Array<string>;
      rows?: Array<Array<string>>;
      columnAlignments?: Array<"flex-start" | "center" | "flex-end">;
      columnWidths?: Array<number>;
      wrappableColumns?: Array<boolean>;
      flipTable?: boolean;
      checkerboard?: boolean;
      isDamageTable?: boolean;
      damageTableOutput?: string;
    }
    noteInfo?: {
      noteTitle?: string;
      noteContent?: string;
    };
  }>;
}

export const pageTableMap: Record<Topic, PageTableName> = {
  general: 'general_pages',
  characters: 'character_option_pages',
  equipment: 'equipment_pages',
  magic: 'magic_pages',
  rules: 'rules_pages',
}