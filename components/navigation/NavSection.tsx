import { useThemeContext } from "@/contexts/ThemeContext";
import { Topic } from "@/types/topic";
import { useState } from "react";
import { LayoutChangeEvent, Pressable, StyleProp, StyleSheet, View, ViewStyle } from "react-native";
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import ThemeText from "../general/ThemeText";

interface NavSectionProps {
  topic: Topic;
  children: React.ReactNode;
  defaultOpen?: boolean;
  style?: StyleProp<ViewStyle>;
}

export default function NavSection({ topic, children, defaultOpen = false, style }: NavSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [isHovering, setIsHovering] = useState(false);
  const [contentHeight, setContentHeight] = useState(0);
  const [contentWidth, setContentWidth] = useState(0);

  const { getThemeColor } = useThemeContext();
  const flattenedStyle = style ? StyleSheet.flatten(style) : null;
  const backgroundColor = flattenedStyle?.backgroundColor as string | undefined ?? getThemeColor("primary");
  const borderColor = flattenedStyle?.borderColor as string | undefined ?? getThemeColor("secondary");
  const accentColor = getThemeColor("shade", topic);

  const height = useSharedValue(0);
  const width = useSharedValue(32);
  const opacity = useSharedValue(0);

  const handleLayout = (event: LayoutChangeEvent) => {
    const measuredHeight = event.nativeEvent.layout.height;
    const measuredWidth = event.nativeEvent.layout.width;
    setContentHeight(measuredHeight);
    setContentWidth(measuredWidth);

    if (isOpen && height.value === 0) {
      height.value = measuredHeight;
    }
    if (isOpen && width.value === 0) {
      width.value = measuredWidth;
    }
  };

  const toggle = () => {
    const toOpen = !isOpen;
    setIsOpen(toOpen);

    height.value = withTiming(
      toOpen ? contentHeight : 0, 
      { 
        duration: 300,
        easing: Easing.ease,
      }
    );
    width.value = withTiming(
      toOpen ? contentWidth + 1 : 32, 
      { 
        duration: 300,
        easing: Easing.ease,
      }
    );
    opacity.value = withTiming(
      toOpen ? 1 : 0, 
      { 
        duration: 300,
        easing: Easing.ease,
      }
    );
  }

  const animatedTitleBarStyle = useAnimatedStyle(() => ({
    width: width.value,
    borderBottomWidth: 2,
    borderColor,
    zIndex: 902,
  }));

  const animatedContentStyle = useAnimatedStyle(() => ({
    height: height.value,
    opacity: opacity.value,
    overflow: "hidden",
    borderWidth: 1,
    borderBottomWidth: 3,
    borderColor,
  }));

  return (
    <Animated.View style={[style, { backgroundColor }]}>
      <Pressable 
        style={[styles.titleContainer, { backgroundColor: isHovering ? accentColor : backgroundColor }]}
        onPress={toggle}
        onHoverIn={() => { setIsHovering(true); }}
        onHoverOut={() => { setIsHovering(false); }}
      >
        <Animated.View style={[styles.title, animatedTitleBarStyle]}> 
          <ThemeText type="default">{isOpen ? " ▲" : " ▼"}</ThemeText>
          <ThemeText type="subheader" topic={topic}>{topic.charAt(0).toUpperCase() + topic.slice(1)}</ThemeText>
        </Animated.View>
      </Pressable>
      <Animated.View style={animatedContentStyle}>
        <View onLayout={handleLayout}>
          {children}
        </View>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    borderRadius: 10,
  },
  title: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    gap: 10,
    paddingLeft: 5,
  },
});