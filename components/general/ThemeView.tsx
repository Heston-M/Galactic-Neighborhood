import { useThemeContext } from "@/contexts/ThemeContext";
import { RefObject } from "react";
import { LayoutChangeEvent, StyleProp, StyleSheet, View, ViewStyle } from "react-native";

interface ThemeViewProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  onLayout?: (event: LayoutChangeEvent) => void;
  ref?: RefObject<View | null>;
}

export default function ThemeView({ children, style, onLayout, ref }: ThemeViewProps) {
  const { getThemeColor } = useThemeContext();
  const flattenedStyle = style ? StyleSheet.flatten(style) : null;
  const backgroundColor = flattenedStyle?.backgroundColor as string | undefined ?? getThemeColor("primary");
  const borderColor = flattenedStyle?.borderColor as string | undefined ?? getThemeColor("secondary");
  
  return (
    <View ref={ref as RefObject<View>} style={[styles.container, style, { backgroundColor, borderColor }]} onLayout={onLayout}>
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