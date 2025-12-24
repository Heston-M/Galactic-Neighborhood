import { colors } from "@/constants/colors";
import { colorFields, ThemeColor } from "@/types/themeColors";
import { storage } from "@/utils/storage";
import { createContext, useContext, useEffect, useState } from "react";
import { useColorScheme } from "react-native";

type ContextShape = {
  theme: "light" | "dark";
  preference: "light" | "dark" | "system" | null;
  setPreference: (theme: "light" | "dark" | "system") => void;
  getThemeColor: (field: ThemeColor["field"], topic?: ThemeColor["topic"]) => string;
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
  const getThemeColor = (field: ThemeColor["field"], topic?: ThemeColor["topic"]) => {
    let colorValue = "";
    
    if (colorFields.includes(field as (typeof colorFields)[number])) {
      if (field === "headers" || field === "shades") {
        colorValue = colors[theme][field as (typeof colorFields)[number]][topic as keyof typeof colors[typeof theme][(typeof colorFields)[number]]];
      } else {
        colorValue = colors[theme][field as (typeof colorFields)[number]] as string;
      }
    } else {
      throw new Error(`Invalid field: ${field}`);
    }
    return colorValue;
  }

  return (
    <ThemeContext.Provider value={{ theme, preference, setPreference, getThemeColor }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useThemeContext() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useThemeContext must be used within a ThemeContextProvider");
  return context;
}