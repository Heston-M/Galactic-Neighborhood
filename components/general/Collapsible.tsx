import { useThemeContext } from "@/contexts/ThemeContext";
import { Topic } from "@/types/topic";
import { useEffect, useState } from "react";
import { LayoutChangeEvent, Pressable, StyleProp, StyleSheet, View, ViewStyle } from "react-native";
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import ThemeText from "../general/ThemeText";

interface CollapsibleProps {
  topic: Topic;
  header: React.ReactNode;
  defaultOpen?: boolean;
  forceToggle?: number;
  flipHeaderOrder?: boolean;
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
  childrenStyle?: StyleProp<ViewStyle>;
}

export default function Collapsible(
  { 
    topic, 
    header, 
    defaultOpen = true, 
    forceToggle, 
    flipHeaderOrder = false, 
    style, 
    children, 
    childrenStyle = {},
  }: CollapsibleProps) {
    
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [isHovering, setIsHovering] = useState(false);
  const [titleWidth, setTitleWidth] = useState(0);
  const [contentHeight, setContentHeight] = useState(0);
  const [contentWidth, setContentWidth] = useState(0);

  const { getThemeColor } = useThemeContext();
  const flattenedStyle = style ? StyleSheet.flatten(style) : null;
  const backgroundColor = flattenedStyle?.backgroundColor as string | undefined ?? getThemeColor("primary");
  const borderColor = flattenedStyle?.borderColor as string | undefined ?? getThemeColor("topic", topic);
  const accentColor = getThemeColor("shade", topic);

  const height = useSharedValue<number | undefined>(defaultOpen ? undefined : 0);
  const width = useSharedValue<number | undefined>(defaultOpen ? undefined : 32);
  const opacity = useSharedValue(defaultOpen ? 1 : 0);

  const handleTitleLayout = (event: LayoutChangeEvent) => {
    const measuredWidth = event.nativeEvent.layout.width + 10;
    if (titleWidth === undefined || titleWidth === 0) {
      setTitleWidth(measuredWidth);
    }
    if (!isOpen) {
      width.value = measuredWidth;
    }
  };

  const handleLayout = (event: LayoutChangeEvent) => {
    const measuredHeight = event.nativeEvent.layout.height;
    const measuredWidth = event.nativeEvent.layout.width;
    setContentHeight(measuredHeight);
    setContentWidth(measuredWidth);

    if (isOpen) {
      height.value = measuredHeight;
    }
    if (isOpen) {
      width.value = measuredWidth;
    }
  };

  useEffect(() => {
    if (forceToggle !== undefined) {
      toggle();
    }
  }, [forceToggle]);

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
      toOpen ? contentWidth + 1 : flipHeaderOrder ? 32 : titleWidth, 
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
          {flipHeaderOrder ? (<>
              <View onLayout={handleTitleLayout}>
                <ThemeText type="default" style={styles.icon}>{isOpen ? "▲" : "▼"}</ThemeText>
              </View>
              {header}
          </>) : (<>
              <View onLayout={handleTitleLayout}>
                {header}
              </View>
              <ThemeText type="default" style={styles.icon}>{isOpen ? "▲" : "▼"}</ThemeText>
          </>)}
        </Animated.View>
      </Pressable>
      <Animated.View style={[animatedContentStyle]}>
        <View 
          onLayout={handleLayout} 
          style={[styles.contentContainer, childrenStyle]}
          pointerEvents={isOpen ? "auto" : "none"}
        >
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
  icon: {
    fontSize: 16,
    paddingHorizontal: 4,
  },
  contentContainer: {
    padding: 10,
    overflow: "hidden",
  },
});