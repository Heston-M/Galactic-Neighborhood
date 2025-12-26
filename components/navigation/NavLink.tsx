import { useThemeContext } from "@/contexts/ThemeContext";
import { ReactNodePage } from "@/types/page";
import { useState } from "react";
import { Pressable, StyleProp, TextStyle } from "react-native";
import ThemeText from "../general/ThemeText";


interface NavLinkProps {
  page: ReactNodePage;
  style?: StyleProp<TextStyle>;
  colorByTopic?: boolean;
  usePreview?: boolean;
  onPress: (page: ReactNodePage) => void;
}

export default function NavLink({ page, style, colorByTopic = true, usePreview = true, onPress }: NavLinkProps) {
  const [hover, setHover] = useState(false);
  
  const { getThemeColor } = useThemeContext();
  const textColor = getThemeColor("text" , colorByTopic ? page.topic : undefined);
  const shadeColor = getThemeColor("shade", colorByTopic ? page.topic : undefined);

  /**
   * When hover is true, fetch and display the page's snippet
   */

  const handlePress = () => {
    onPress(page);
  }

  return (
    <Pressable 
      onPress={handlePress}
      onHoverIn={() => { setHover(true); }}
      onHoverOut={() => { setHover(false); }}
      onPressIn={() => { setHover(true); }}
      onPressOut={() => { setHover(false); }}
    >
      <ThemeText type="default" style={[style, { color: hover ? shadeColor : textColor, fontWeight: "bold", textDecorationLine: hover ? "underline" : "none" }]}>{page.title}</ThemeText>
    </Pressable>
  );
}