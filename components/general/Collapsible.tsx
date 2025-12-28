import ThemeText from "@/components/general/ThemeText";
import { useThemeContext } from "@/contexts/ThemeContext";
import { Topic } from "@/types/topic";
import { RefObject, useEffect, useState } from "react";
import { LayoutChangeEvent, Pressable, StyleProp, StyleSheet, View, ViewStyle } from "react-native";
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";

interface CollapsibleProps {
  ref?: RefObject<View>;
  topic: Topic;
  header: React.ReactNode;
  defaultOpen?: boolean;
  navHeader?: boolean;
  centerHeader?: boolean;
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
  childrenStyle?: StyleProp<ViewStyle>;
  externalControl?: boolean;
  isOpen?: boolean;
  requestOpen?: () => void;
  requestClose?: () => void;
  decoupleContent?: boolean;
}

export default function Collapsible(
  { 
    ref,
    topic, 
    header, 
    defaultOpen = true, 
    navHeader = false, 
    centerHeader = false,
    style, 
    children, 
    childrenStyle = {},
    externalControl = false,
    isOpen,
    requestOpen,
    requestClose,
    decoupleContent = false,
  }: CollapsibleProps) {
    
  const [internalIsOpen, setInternalIsOpen] = useState<boolean>(isOpen ?? defaultOpen);
  const [isHovering, setIsHovering] = useState<boolean>(false);
  const [titleWidth, setTitleWidth] = useState<number>(0);
  const [titleContainerWidth, setTitleContainerWidth] = useState<number>(0);
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

  const handleTitleContainerLayout = (event: LayoutChangeEvent) => {
    const measuredWidth = event.nativeEvent.layout.width;
    if (decoupleContent && (titleContainerWidth === undefined || titleContainerWidth === 0)) {
      setTitleContainerWidth(measuredWidth);
    }
  };

  const handleTitleLayout = (event: LayoutChangeEvent) => {
    const measuredWidth = event.nativeEvent.layout.width + (centerHeader ? 42 : 10);
    if (titleWidth === undefined || titleWidth === 0) {
      setTitleWidth(measuredWidth);
    }
    if (!internalIsOpen) {
      width.value = measuredWidth;
    }
  };

  const handleLayout = (event: LayoutChangeEvent) => {
    const measuredHeight = event.nativeEvent.layout.height;
    const measuredWidth = event.nativeEvent.layout.width;
    setContentHeight(measuredHeight);
    setContentWidth(measuredWidth);

    if (internalIsOpen) {
      height.value = measuredHeight;
      if (!decoupleContent) {
        width.value = measuredWidth;
      }
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
      toOpen 
        ? (decoupleContent ? titleContainerWidth : contentWidth)
        : titleWidth, 
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
    alignItems: decoupleContent ? "center" : "flex-start",
  }));

  const titleContainerStyle: ViewStyle = {
    backgroundColor: navHeader 
      ? (internalIsOpen && isHovering) ? accentColor + "80" : (internalIsOpen ? accentColor : (isHovering ? accentColor : backgroundColor))
      : isHovering ? accentColor : backgroundColor,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    borderBottomLeftRadius: centerHeader && !internalIsOpen ? 10 : 0,
    borderBottomRightRadius: internalIsOpen ? 0 : 10,
    paddingHorizontal: centerHeader ? 5 : 0,
  };

  const icon = <ThemeText type="default" style={styles.icon}>{internalIsOpen ? "▲" : "▼"}</ThemeText>

  return (
    <Animated.View ref={ref} style={[style, { backgroundColor }]}>
      <Pressable 
        style={titleContainerStyle}
        onLayout={handleTitleContainerLayout}
        onPress={handleTouch}
        onHoverIn={() => { setIsHovering(true); }}
        onHoverOut={() => { setIsHovering(false); }}
        onTouchStart={() => { setIsHovering(true); }}
        onTouchEnd={() => { setIsHovering(false); }}
        onTouchCancel={() => { setIsHovering(false); }}
      >
        {centerHeader 
         ? (<View style={[styles.title, { justifyContent: "center", paddingLeft: centerHeader ? 0 : 5 }]}>
            {navHeader && icon}
            <View onLayout={handleTitleLayout}>
              {header}
            </View>
            {!navHeader && icon}
          </View>)
         : (<View style={[styles.title, { justifyContent: "flex-start", paddingLeft: centerHeader ? 0 : 5 }]}>
            <View onLayout={handleTitleLayout}>
              {navHeader ? icon : header}
            </View>
            {navHeader ? header : icon}
          </View>)}
        <Animated.View style={animatedTitleBarStyle} /> 
      </Pressable>
      <Animated.View style={[animatedContentStyle]}>
        <View 
          onLayout={handleLayout} 
          style={[
            styles.contentContainer, 
            { pointerEvents: internalIsOpen ? "auto" : "none" },
            childrenStyle
          ]}
        >
          {children}
        </View>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
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