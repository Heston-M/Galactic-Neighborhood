import { assetPaths } from "@/constants/assetPaths";

export const iconFields = Object.keys(assetPaths["light"]["icons"]) as (keyof typeof assetPaths["light"]["icons"])[];

export interface ThemeIcon {
  field: (typeof iconFields)[number];
}