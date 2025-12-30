import { Topic } from "@/types/topic";
import { useEffect, useRef, useState } from "react";
import { StyleProp, StyleSheet, ViewStyle } from "react-native";
import Collapsible from "../general/Collapsible";
import ThemeText from "../general/ThemeText";

interface NavSectionProps {
  topic: Topic;
  header?: React.ReactNode;
  centerHeader?: boolean;
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
}

export default function NavSection({ topic, header, centerHeader = false, children, style, isOpen, onOpen, onClose }: NavSectionProps) {
  const [collapsibleSetOpen, setCollapsibleSetOpen] = useState(0);
  const [collapsibleSetClose, setCollapsibleSetClose] = useState(0);
  const prevIsOpenRef = useRef<boolean | undefined>(undefined);

  // When nav menu sets isOpen, toggle the collapsible if it isn't already in the desired state
  useEffect(() => {
    if (prevIsOpenRef.current === undefined) {
      prevIsOpenRef.current = isOpen;
      return;
    }

    if (prevIsOpenRef.current !== isOpen) {
      if (isOpen) {
        setCollapsibleSetOpen(prev => prev + 1);
      } else {
        setCollapsibleSetClose(prev => prev + 1);
      }
      prevIsOpenRef.current = isOpen;
    }
  }, [isOpen]);
  
  return (
    <Collapsible 
      topic={topic} 
      header={header ?? <ThemeText type="subheader" topic={topic}>{topic.charAt(0).toUpperCase() + topic.slice(1)}</ThemeText>} 
      defaultOpen={isOpen} 
      flipHeaderOrder={true} 
      centerHeader={centerHeader}
      style={style} 
      childrenStyle={styles.contentContainer}
      externalControl={true}
      setOpen={collapsibleSetOpen}
      setClose={collapsibleSetClose}
      onOpen={onOpen}
      onClose={onClose}
    >
      {children}
    </Collapsible>
  );
}

const styles = StyleSheet.create({
  contentContainer: {
    position: "absolute",
    width: "100%",
    padding: 0,
  },
});