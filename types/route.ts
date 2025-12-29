import { Topic } from "@/types/topic";

export type Route = {
  topic: Topic;
  subtopic?: string;
  pageName: string;
}