import { useThemeContext } from "@/contexts/ThemeContext";
import { Route } from "@/types/route";
import { Pressable, StyleSheet } from "react-native";
import NavLink from "./NavLink";

interface NavButtonProps {
  route: Route;
  onPress?: () => void;
}

export default function NavButton({ route, onPress }: NavButtonProps) {
  const text = route.pageName.charAt(0).toUpperCase() + route.pageName.slice(1);
  const { getThemeColor } = useThemeContext();
  const backgroundColor = getThemeColor("shade", route.topic);
  const borderColor = getThemeColor("secondary");

  return (
    <Pressable style={[styles.button, { backgroundColor, borderColor }]}>
      <NavLink 
        style={styles.link} 
        route={route} 
        text={text}
        colorByTopic={false} 
        usePreview={false} 
        onPress={onPress} 
      />
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