import { assetPaths } from "@/constants/assetPaths";
import { colors, topicColors } from "@/constants/colors";
import { colorFields, ThemeColor } from "@/types/themeColors";
import { ThemeIcon } from "@/types/themeIcons";
import { Topic } from "@/types/topic";
import { storage } from "@/utils/storage";
import { createContext, useContext, useEffect, useState } from "react";
import { ImageSourcePropType, useColorScheme } from "react-native";

type ContextShape = {
  theme: "light" | "dark";
  preference: "light" | "dark" | "system" | null;
  setPreference: (theme: "light" | "dark" | "system") => void;
  getThemeColor: (field: ThemeColor["field"], topic?: Topic) => string;
  getThemeIcon: (icon: ThemeIcon["field"]) => ImageSourcePropType;
}

const ThemeContext = createContext<ContextShape | undefined>(undefined);

export default function ThemeContextProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [preference, setPreference] = useState<"light" | "dark" | "system" | null>(null);

  const systemTheme = useColorScheme() === "dark" ? "dark" : "light";

  useEffect(() => {
    if (preference === "system" || preference === null) {
      setTheme(systemTheme);
    } else {
      setTheme(preference);
    }
    if (preference !== null) {
      storage.set<"light" | "dark" | "system">("themePreference", preference);
    }
  }, [preference]);

  useEffect(() => {
    storage.get<"light" | "dark" | "system">("themePreference").then((value) => {
      if (value) {
        setPreference(value);
      }
    });
  }, []);

  /**
   * @description
   * Gets the color for a given field within the theme
   * @param color - The field to get the color for
   * @returns The color string
   */
  const getThemeColor = (field: ThemeColor["field"], topic?: Topic) => {
    let colorValue = "";
    
    if (colorFields.includes(field as (typeof colorFields)[number]) || field === "topic" || field === "shade") {
      if (field === "topic") {
        colorValue = topic ? topicColors[theme === "dark" ? "light" : "dark"][topic as keyof typeof topicColors[typeof theme]] : topicColors[theme === "dark" ? "light" : "dark"]["general"];
      } else if (field === "shade") {
        colorValue = topic ? topicColors[theme][topic as keyof typeof topicColors[typeof theme]] : topicColors[theme]["general"];
      } else {
        colorValue = colors[theme][field as keyof typeof colors[typeof theme]];
      }
    } else {
      throw new Error(`Invalid field: ${field}`);
    }
    return colorValue;
  }

  const getThemeIcon = (icon: ThemeIcon["field"]) => {
    return assetPaths[theme].icons[icon];
  }

  return (
    <ThemeContext.Provider value={{ theme, preference, setPreference, getThemeColor, getThemeIcon }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useThemeContext() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useThemeContext must be used within a ThemeContextProvider");
  return context;
}