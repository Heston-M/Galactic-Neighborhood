import { Topic } from "@/types/topic";
import { StyleProp, StyleSheet, ViewStyle } from "react-native";
import Collapsible from "../general/Collapsible";
import ThemeText from "../general/ThemeText";

interface NavSectionProps {
  topic: Topic;
  header?: React.ReactNode;
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

export default function NavSection({ topic, header, children, style }: NavSectionProps) {
  return (
    <Collapsible 
      topic={topic} 
      header={header ?? <ThemeText type="subheader" topic={topic}>{topic.charAt(0).toUpperCase() + topic.slice(1)}</ThemeText>} 
      defaultOpen={false} 
      flipHeaderOrder={true} 
      style={style} 
      childrenStyle={styles.contentContainer}
    >
      {children}
    </Collapsible>
  );
}

const styles = StyleSheet.create({
  contentContainer: {
    position: "absolute",
    padding: 0,
  },
});