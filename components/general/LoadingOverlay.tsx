import { useThemeContext } from "@/contexts/ThemeContext";
import { useEffect, useState } from "react";
import { DimensionValue, Easing, StyleSheet } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withSequence, withTiming } from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";
import ThemeText from "./ThemeText";

interface LoadingOverlayProps {
  visible: boolean;
  targetTopic?: "general" | "characters" | "equipment" | "magic" | "rules";
  onDoneAnimating: () => void;
}

export default function LoadingOverlay({ visible, targetTopic = "general", onDoneAnimating }: LoadingOverlayProps) {
  const { getThemeColor } = useThemeContext();
  const primaryColor = getThemeColor("primary");
  const borderColor = getThemeColor("secondary");

  const [width, setWidth] = useState("100%");
  const [height, setHeight] = useState("100%");

  const characterColor = getThemeColor("header", "characters");
  const equipmentColor = getThemeColor("header", "equipment");
  const magicColor = getThemeColor("header", "magic");
  const rulesColor = getThemeColor("header", "rules");
  const colors = new Map<string, string>([
    ["general", borderColor],
    ["characters", characterColor],
    ["equipment", equipmentColor],
    ["magic", magicColor],
    ["rules", rulesColor],
  ]);

  const rotation = useSharedValue(0);
  const borderRadius = useSharedValue(0);
  const fillColor = useSharedValue(primaryColor);
  const opacity = useSharedValue(visible ? 1 : 0);

  useEffect(() => {
    rotation.value = withRepeat(
      withTiming(360, { 
        duration: 2000,
        easing: Easing.linear,
      }), 
      -1,
      false
    );
    borderRadius.value = withRepeat(
      withSequence(
        withTiming(20, { duration: 2000 }), 
        withTiming(0, { duration: 2000 }),
      ),
      -1,
      false
    );
    fillColor.value = withRepeat(
      withSequence(
        withTiming(colors.get(targetTopic) || borderColor, { duration: 2000 }),
        withTiming(primaryColor, { duration: 2000 }),
      ),
      -1,
      false
    );
  }, []);

  useEffect(() => {
    if (visible) {
      setWidth("100%");
      setHeight("100%");
    }
    opacity.value = withTiming(
      visible ? 1 : 0, 
      { 
        duration: 500 
      },
      (finished) => {
        if (!visible && finished) {
          scheduleOnRN(setWidth, "0%");
          scheduleOnRN(setHeight, "0%");
        }
      }
    );
  }, [visible]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
    borderRadius: borderRadius.value,
    backgroundColor: fillColor.value,
  }));

  const animatedOpacityStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View 
      style={[styles.container, animatedOpacityStyle, { 
        backgroundColor: primaryColor,
        width: width as DimensionValue,
        height: height as DimensionValue,
      }]}>
      <Animated.View style={[styles.loading, animatedStyle, { borderColor }]} />
      <ThemeText>Loading...</ThemeText>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    left: 0,
    gap: 10,
    zIndex: 1000,
    alignItems: "center",
    justifyContent: "center",
  },
  loading: {
    width: 40,
    height: 40,
    borderWidth: 2,
  },
});