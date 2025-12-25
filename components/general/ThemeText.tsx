import { useThemeContext } from "@/contexts/ThemeContext";
import { Topic } from "@/types/topic";
import { StyleProp, StyleSheet, Text, TextStyle, View } from "react-native";

interface ThemeTextProps {
  children: React.ReactNode;
  style?: StyleProp<TextStyle>;
  type?: "default" | "title" | "header" | "subheader" | "caption";
  topic?: Topic;
}

export default function ThemeText({ children, style, type = "default", topic = "general" }: ThemeTextProps) {
  
  const { getThemeColor } = useThemeContext();
  const textColor = getThemeColor("text", topic);

  return (
    <View style={{ alignItems: type === "header" ? "flex-start" : "center" }}>
      <Text style={[styles[type], style, { color: textColor }]}>
        {children}
      </Text>
      {type === "header" && <View style={[styles.headerSeparator, { backgroundColor: textColor }]} />}
    </View>
  );
}

const styles = StyleSheet.create({
  default: {
    fontSize: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
  },
  header: {
    textAlign: "left",
    fontSize: 24,
    fontWeight: "bold",
  },
  subheader: {
    fontSize: 20,
  },
  caption: {
    fontSize: 12,
    fontStyle: "italic",
  },
  headerSeparator: {
    height: 2,
    width: "100%",
  },
});