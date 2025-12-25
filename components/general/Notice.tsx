import { useThemeContext } from "@/contexts/ThemeContext";
import { Image, Pressable, StyleSheet, View } from "react-native";
import ThemeText from "./ThemeText";

interface NoticeProps {
  children: React.ReactNode;
  visible: boolean;
  onPress?: () => void;
  onClose?: () => void;
}

export default function Notice({ children, visible, onPress, onClose }: NoticeProps) {
  const { getThemeColor, getThemeIcon } = useThemeContext();
  const backgroundColor = getThemeColor("alert");

  return (
    visible ? 
      <Pressable 
        style={[styles.container, { backgroundColor }]} 
        onPress={onPress}
        disabled={onPress === undefined}
      >
        <View style={styles.content}>
          <ThemeText>{children}</ThemeText>
        </View>
        {onClose && <Pressable style={styles.closeButton} onPress={onClose}>
          <Image source={getThemeIcon("close")} style={styles.closeIcon} />
        </Pressable>}
      </Pressable>
    : null
  )
}

const styles = StyleSheet.create({
  container: {
    maxWidth: "90%",
    minWidth: 100,
    minHeight: 30,
    padding: 5,
    borderRadius: 5,
    borderWidth: 1,
  },
  content: {
    marginRight: 30,
  },
  closeButton: {
    position: "absolute",
    right: 0,
    top: 0,
    width: 30,
    height: 30,
  },
  closeIcon: {
    width: 30,
    height: 30,
  },
});