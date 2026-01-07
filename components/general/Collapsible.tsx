import ThemeText from "@/components/general/ThemeText";
import { useThemeContext } from "@/contexts/ThemeContext";
import { Topic } from "@/types/topic";
import { useEffect, useState } from "react";
import { LayoutChangeEvent, Pressable, StyleProp, StyleSheet, View, ViewStyle } from "react-native";
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";

interface CollapsibleProps {
  topic: Topic;
  header: React.ReactNode;
  defaultOpen?: boolean;
  flipHeaderOrder?: boolean;
  centerHeader?: boolean;
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
  childrenStyle?: StyleProp<ViewStyle>;
  externalControl?: boolean;
  isOpen?: boolean;
  requestOpen?: () => void;
  requestClose?: () => void;
}

export default function Collapsible(
  { 
    topic, 
    header, 
    defaultOpen = true, 
    flipHeaderOrder = false, 
    centerHeader = false,
    style, 
    children, 
    childrenStyle = {},
    externalControl = false,
    isOpen,
    requestOpen,
    requestClose,
  }: CollapsibleProps) {
    
  const [internalIsOpen, setInternalIsOpen] = useState<boolean>(isOpen ?? defaultOpen);
  const [isHovering, setIsHovering] = useState<boolean>(false);
  const [titleWidth, setTitleWidth] = useState<number>(0);
  const [contentHeight, setContentHeight] = useState<number>(0);
  const [contentWidth, setContentWidth] = useState<number>(0);

  const { getThemeColor } = useThemeContext();
  const flattenedStyle = style ? StyleSheet.flatten(style) : null;
  const backgroundColor = flattenedStyle?.backgroundColor as string | undefined ?? getThemeColor("primary");
  const borderColor = flattenedStyle?.borderColor as string | undefined ?? getThemeColor("topic", topic);
  const accentColor = getThemeColor("shade", topic);

  const height = useSharedValue<number | undefined>(defaultOpen ? undefined : 0);
  const width = useSharedValue<number | undefined>(defaultOpen ? undefined : 32);
  const opacity = useSharedValue(defaultOpen ? 1 : 0);

  const handleTitleLayout = (event: LayoutChangeEvent) => {
    const measuredWidth = event.nativeEvent.layout.width + (centerHeader ? 42 : 10);
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

  const handleTouch = () => {
    if (externalControl) {
      if (internalIsOpen) {
        requestClose?.();
      } else {
        requestOpen?.();
      }
    } else {
      toggle();
    }
  }

  const toggle = () => {
    const toOpen = !internalIsOpen;
    setInternalIsOpen(toOpen);

    height.value = withTiming(
      toOpen ? contentHeight : 0, 
      { 
        duration: 300,
        easing: Easing.ease,
      }
    );
    width.value = withTiming(
      toOpen ? contentWidth : titleWidth, 
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
    return toOpen;
  }

  useEffect(() => {
    if (externalControl && isOpen !== undefined) {
      if (isOpen !== internalIsOpen) {
        toggle();
      }
    }
  }, [externalControl, isOpen]);

  const animatedTitleBarStyle = useAnimatedStyle(() => ({
    width: width.value,
    alignSelf: centerHeader ? "center" : "flex-start",
    borderBottomWidth: 2,
    borderColor,
    zIndex: 902,
  }));

  const animatedContentStyle = useAnimatedStyle(() => ({
    height: height.value,
    opacity: opacity.value,
  }));

  const icon = <ThemeText type="default" style={styles.icon}>{internalIsOpen ? "▲" : "▼"}</ThemeText>

  return (
    <Animated.View style={[style, { backgroundColor }]}>
      <Pressable 
        style={[
          styles.titleContainer, 
          { backgroundColor: isHovering ? accentColor : backgroundColor 
            , borderBottomLeftRadius: centerHeader && !internalIsOpen ? 10 : 0
            , borderBottomRightRadius: internalIsOpen ? 0 : 10
            , paddingHorizontal: centerHeader ? 5 : 0
          }]}
        onPress={handleTouch}
        onHoverIn={() => { setIsHovering(true); }}
        onHoverOut={() => { setIsHovering(false); }}
        onTouchStart={() => { setIsHovering(true); }}
        onTouchEnd={() => { setIsHovering(false); }}
        onTouchCancel={() => { setIsHovering(false); }}
      >
        {centerHeader 
         ? (<View style={[styles.title, { justifyContent: "center", paddingLeft: centerHeader ? 0 : 5 }]}>
            {flipHeaderOrder && icon}
            <View onLayout={handleTitleLayout}>
              {header}
            </View>
            {!flipHeaderOrder && icon}
          </View>)
         : (<View style={[styles.title, { justifyContent: "flex-start", paddingLeft: centerHeader ? 0 : 5 }]}>
            <View onLayout={handleTitleLayout}>
              {flipHeaderOrder ? icon : header}
            </View>
            {flipHeaderOrder ? header : icon}
          </View>)}
        <Animated.View style={animatedTitleBarStyle} /> 
      </Pressable>
      <Animated.View style={[animatedContentStyle]}>
        <View 
          onLayout={handleLayout} 
          style={[styles.contentContainer, childrenStyle]}
          pointerEvents={internalIsOpen ? "auto" : "none"}
        >
          {children}
        </View>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  title: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
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