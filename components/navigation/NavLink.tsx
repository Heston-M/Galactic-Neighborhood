import { useNavContext } from "@/contexts/NavContext";
import { useThemeContext } from "@/contexts/ThemeContext";
import { parseRoute } from "@/utils/routeParsing";
import { useState } from "react";
import { Pressable, StyleProp, TextStyle } from "react-native";
import ThemeText from "../general/ThemeText";

interface NavLinkProps {
  route: string;
  text?: string;
  style?: StyleProp<TextStyle>;
  colorByTopic?: boolean;
  usePreview?: boolean;
  onPress?: () => void;
}

export default function NavLink({ route, text, style, colorByTopic = true, usePreview = true, onPress }: NavLinkProps) {
  const [hover, setHover] = useState(false);
  const parsedRoute = parseRoute(route);

  const { getThemeColor } = useThemeContext();
  const textColor = getThemeColor("text" , colorByTopic ? parsedRoute?.topic : undefined);
  const shadeColor = getThemeColor("shade", colorByTopic ? parsedRoute?.topic : undefined);

  const { navigateTo } = useNavContext();

  /**
   * When hover is true, fetch and display the page's snippet
   */

  const handlePress = () => {
    if (!parsedRoute) {
      return;
    }
    navigateTo(parsedRoute);
    onPress?.();
  }

  return (
    <Pressable 
      onPress={handlePress}
      onHoverIn={() => { setHover(true); }}
      onHoverOut={() => { setHover(false); }}
      onPressIn={() => { setHover(true); }}
      onPressOut={() => { setHover(false); }}
    >
      <ThemeText type="default" style={[style, { color: hover ? shadeColor : textColor, fontWeight: "bold", textDecorationLine: hover ? "underline" : "none" }]}>
        {text ?? parsedRoute?.pageName ?? "Unknown Page"}
      </ThemeText>
    </Pressable>
  );
}