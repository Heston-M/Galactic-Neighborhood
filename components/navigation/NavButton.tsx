import { useThemeContext } from "@/contexts/ThemeContext";
import { ReactNodePage } from "@/types/page";
import { Pressable, StyleSheet } from "react-native";
import NavLink from "./NavLink";

interface NavButtonProps {
  page: ReactNodePage;
  onPress: (page: ReactNodePage) => void;
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
      <NavLink style={styles.link} page={page} colorByTopic={false} usePreview={false} onPress={onPress} />
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