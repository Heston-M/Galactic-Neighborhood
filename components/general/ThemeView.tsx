import { useThemeContext } from "@/contexts/ThemeContext";
import { LayoutChangeEvent, StyleProp, StyleSheet, View, ViewStyle } from "react-native";

interface ThemeViewProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  onLayout?: (event: LayoutChangeEvent) => void;
}

export default function ThemeView({ children, style, onLayout }: ThemeViewProps) {
  const { getThemeColor } = useThemeContext();
  const flattenedStyle = style ? StyleSheet.flatten(style) : null;
  const backgroundColor = flattenedStyle?.backgroundColor as string | undefined ?? getThemeColor("primary");
  const borderColor = flattenedStyle?.borderColor as string | undefined ?? getThemeColor("secondary");
  
  return (
    <View style={[styles.container, style, { backgroundColor, borderColor }]} onLayout={onLayout}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    padding: 10,
  },
});