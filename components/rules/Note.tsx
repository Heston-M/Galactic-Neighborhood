import { useThemeContext } from "@/contexts/ThemeContext";
import { Topic } from "@/types/topic";
import { StyleProp, StyleSheet, ViewStyle } from "react-native";
import ThemeText from "../general/ThemeText";
import ThemeView from "../general/ThemeView";

interface NoteProps {
  title?: React.ReactNode;
  content: React.ReactNode;
  topic?: Topic;
  style?: StyleProp<ViewStyle>;
}

export default function Note({ title, content, topic = "general", style }: NoteProps) {
  const { getThemeColor } = useThemeContext();
  const backgroundColor = getThemeColor("shade", topic);
  const borderColor = getThemeColor("secondary");

  return (
    <ThemeView style={[styles.note, { backgroundColor, borderColor }, style]}>
      {title && <ThemeText type="subheader" topic={"general"} style={[styles.noteTitle, {  }]}>{title}</ThemeText>}
      {content}
    </ThemeView>
  )
}

const styles = StyleSheet.create({
  note: {
    padding: 10,
    borderWidth: 2,
    alignItems: "flex-start",
  },
  noteTitle: {
    fontWeight: "bold",
  },
})