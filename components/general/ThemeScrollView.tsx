import { useThemeContext } from "@/contexts/ThemeContext";
import { ScrollView, StyleProp, StyleSheet, ViewStyle } from "react-native";

interface ThemeScrollViewProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

export default function ThemeScrollView({ children, style }: ThemeScrollViewProps) {
  const { getThemeColor } = useThemeContext();
  const backgroundColor = getThemeColor("background");
  
  return (
    <ScrollView 
      contentContainerStyle={[styles.container, style]}
      style={[styles.scrollView, { backgroundColor }]}
    >
      {children}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    height: "100%",
    width: "100%",
    borderWidth: 0,
  },
  container: {
    justifyContent: "center",
    alignItems: "center",
  },
});