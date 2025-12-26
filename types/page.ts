import { Topic } from "./topic";

export type ReactNodePage = {
  title: string;
  topic: Topic;
  route: string;
  snippet?: React.ReactNode;
  content?: React.ReactNode;
}

export type JsonPage = {
  id: string;
  title: string;
  topic: Topic;
  route: string;
  sections?: Array<{
    type: "text" | "heading" | "aspects" | "list" | "table" |  "note";
    text?: string;
    headingLevel?: 1 | 2;
    aspects?: Array<{
      name: string;
      value: string;
    }>;
    listType?: "bullet" | "number";
    listItems?: Array<string>;
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
    noteTitle?: string;
    noteContent?: string;
  }>;
}