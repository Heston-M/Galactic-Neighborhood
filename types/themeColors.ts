import { colors, headerColors, shadeColors } from "@/constants/colors";

export const colorFields = Object.keys(colors["light"]) as (keyof typeof colors["light"])[];
export const headerFields = Object.keys(headerColors["light"]) as (keyof typeof headerColors["light"])[];
export const shadeFields = Object.keys(shadeColors["light"]) as (keyof typeof shadeColors["light"])[];

export interface ThemeColor {
  field: (typeof colorFields)[number] | "header" | "shade";
  topic?: (typeof headerFields)[number] | (typeof shadeFields)[number] | undefined;
}