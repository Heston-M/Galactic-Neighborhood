import { Topic } from "./topic";

export type Page = {
  title: string;
  topic: Topic;
  route: string;
  snippet?: React.ReactNode;
  content?: React.ReactNode;
}