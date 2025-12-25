import { useThemeContext } from "@/contexts/ThemeContext";
import { Page } from "@/types/page";
import { useState } from "react";
import { Pressable, StyleProp, TextStyle } from "react-native";
import ThemeText from "../general/ThemeText";


interface NavLinkProps {
  page: Page;
  style?: StyleProp<TextStyle>;
  usePreview?: boolean;
  onPress: (page: Page) => void;
}

export default function NavLink({ page, style, usePreview = true, onPress }: NavLinkProps) {
  const [hover, setHover] = useState(false);
  
  const { getThemeColor } = useThemeContext();
  const textColor = getThemeColor("text");

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
    >
      <ThemeText type="default" style={[style, { color: textColor, textDecorationLine: hover ? "underline" : "none" }]}>{page.title}</ThemeText>
    </Pressable>
  );
}