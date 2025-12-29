import { Topic } from "@/types/topic";
import { StyleProp, StyleSheet, ViewStyle } from "react-native";
import Collapsible from "../general/Collapsible";
import ThemeText from "../general/ThemeText";

interface NavSectionProps {
  topic: Topic;
  header?: React.ReactNode;
  forceToggle?: number;
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

export default function NavSection({ topic, header, forceToggle, children, style }: NavSectionProps) {
  return (
    <Collapsible 
      topic={topic} 
      header={header ?? <ThemeText type="subheader" topic={topic}>{topic.charAt(0).toUpperCase() + topic.slice(1)}</ThemeText>} 
      defaultOpen={false} 
      forceToggle={forceToggle}
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