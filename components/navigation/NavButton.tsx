import { useThemeContext } from "@/contexts/ThemeContext";
import { parseRoute } from "@/utils/routeParsing";
import { Pressable, StyleSheet } from "react-native";
import NavLink from "./NavLink";

interface NavButtonProps {
  route: string;
  onPress?: () => void;
}

export default function NavButton({ route, onPress }: NavButtonProps) {
  const parsedRoute = parseRoute(route);
  if (!parsedRoute) {
    return null;
  }
  const { getThemeColor } = useThemeContext();
  const backgroundColor = getThemeColor("shade", parsedRoute.topic);
  const borderColor = getThemeColor("secondary");

  return (
    <Pressable style={[styles.button, { backgroundColor, borderColor }]}>
      <NavLink style={styles.link} route={route} colorByTopic={false} usePreview={false} onPress={onPress} />
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