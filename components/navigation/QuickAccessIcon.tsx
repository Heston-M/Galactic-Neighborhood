import { useThemeContext } from "@/contexts/ThemeContext";
import { Image } from "expo-image";
import { useState } from "react";
import { Pressable, StyleSheet } from "react-native";

interface QuickAccessIconProps {
  onPress: () => void;
}

export default function QuickAccessIcon({ onPress }: QuickAccessIconProps) {
  const [hover, setHover] = useState(false);
  const [QAshown, setQAshown] = useState(false);
  
  const { getThemeIcon, getThemeColor } = useThemeContext();
  const borderColor = getThemeColor("secondary");
  const bookmarkIcon = getThemeIcon("bookmark");
  const bookOpenIcon = getThemeIcon("bookOpen");

  return (
    <Pressable 
        style={styles.quickAccessIconContainer} 
        onPress={() => setQAshown(!QAshown)}
        onHoverIn={() => setHover(true)}
        onHoverOut={() => setHover(false)}
      >
        {!QAshown && <Image source={bookmarkIcon} style={[styles.bookmarkIcon, { borderWidth: hover ? 2 : 0, borderColor }]} />}
        {QAshown && <Image source={bookOpenIcon} style={[styles.bookOpenIcon, { borderWidth: hover ? 2 : 0, borderColor }]} />}
      </Pressable>
  )
}

const styles = StyleSheet.create({
  quickAccessIconContainer: {
    width: 50,
    height: 50,
    alignItems: "center",
    justifyContent: "center",
  },
  bookmarkIcon: {
    width: 40,
    height: 40,
  },
  bookOpenIcon: {
    width: 50,
    height: 40,
  },
})