import { colors, topicColors } from "@/constants/colors";
import { Topic } from "./topic";

export const colorFields = Object.keys(colors["light"]) as (keyof typeof colors["light"])[];
export const topicFields = Object.keys(topicColors["light"]) as (keyof typeof topicColors["light"])[];

export interface ThemeColor {
  field: (typeof colorFields)[number] | "topic" | "shade";
  topic?: Topic;
}