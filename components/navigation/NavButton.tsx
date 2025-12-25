import { useThemeContext } from "@/contexts/ThemeContext";
import { Page } from "@/types/page";
import { Pressable, StyleSheet } from "react-native";
import NavLink from "./NavLink";

interface NavButtonProps {
  page: Page;
  onPress: (page: Page) => void;
}

export default function NavButton({ page, onPress }: NavButtonProps) {
  const { getThemeColor } = useThemeContext();
  const backgroundColor = getThemeColor("shade", page.topic);
  const borderColor = getThemeColor("secondary");

  const handlePress = () => {
    onPress(page);
  }

  return (
    <Pressable style={[styles.button, { backgroundColor, borderColor }]} onPress={handlePress}>
      <NavLink style={styles.link} page={page} usePreview={false} onPress={onPress} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: "100%",
    borderWidth: 1,
    padding: 5,
  },
  link: {
    textAlign: "center",
  },
});