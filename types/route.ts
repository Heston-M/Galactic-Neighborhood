import { Topic } from "@/types/topic";

export type Route = {
  topic: Topic;
  subtopic?: string;
  pageName: string;
}

export type RouteSet = {
  name: string;
  subsets?: RouteSet[];
  routes: Route[];
}