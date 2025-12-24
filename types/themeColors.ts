import { colors } from "@/constants/colors";

type LightColors = typeof colors["light"];
type TopicKeys = keyof LightColors["headers"];

export const colorFields = Object.keys(colors["light"]) as (keyof LightColors)[];

export interface ThemeColor {
  field: (typeof colorFields)[number];
  topic?: TopicKeys;
}