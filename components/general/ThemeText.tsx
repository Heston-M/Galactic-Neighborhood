import { useThemeContext } from "@/contexts/ThemeContext";
import { Topic } from "@/types/topic";
import { parseBoldText } from "@/utils/markdown";
import { StyleProp, StyleSheet, Text, TextStyle, View } from "react-native";

interface ThemeTextProps {
  children: React.ReactNode;
  style?: StyleProp<TextStyle>;
  type?: "default" | "title" | "header" | "subheader" | "caption";
  topic?: Topic;
  indent?: boolean;
  parseMarkdown?: boolean;
}

export default function ThemeText({ children, style, type = "default", topic = "general", indent = false, parseMarkdown = false }: ThemeTextProps) {
  
  const { getThemeColor } = useThemeContext();
  const textColor = topic ? getThemeColor("topic", topic) : getThemeColor("text");

  const parsedChildren = parseMarkdown ? parseBoldText(String(children)) : children;

  return (
    <View style={{ alignItems: "flex-start" }}>
      <Text style={[styles[type], style, { color: textColor }]}>
        {indent ? "\t" : ""}{parsedChildren}
      </Text>
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
    textAlign: "center",
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