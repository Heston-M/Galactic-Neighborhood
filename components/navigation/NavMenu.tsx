import { useState } from "react";
import { StyleProp, StyleSheet, View, ViewStyle } from "react-native";
import ThemeView from "../general/ThemeView";
import NavButton from "./NavButton";
import NavSection from "./NavSection";
import QuickAccessIcon from "./QuickAccessIcon";

interface NavMenuProps {
  style?: StyleProp<ViewStyle>;
}

const tempRoutes: string[] = [
  "/characters/backgrounds",
  "/characters/enhancement",
  "/characters/equipment",
  "/characters/skills",
  "/equipment/enhancement",
  "/equipment/equipment",
  "/equipment/skills",
];

export default function NavMenu({ style }: NavMenuProps) {

  const [sectionForceToggle, setSectionForceToggle] = useState<{[key: string]: number}>({});

  const handleForceToggle = (topic: string) => {
    setSectionForceToggle({ ...sectionForceToggle, [topic]: (sectionForceToggle[topic] ?? 0) + 1 });
  }

  return (
    <ThemeView style={[styles.container, style]}>
      <QuickAccessIcon onPress={() => {}} />
      <View style={styles.sectionsContainer}>
        <View style={styles.sectionContainer}>
          <NavSection
            forceToggle={sectionForceToggle["characters"]}
            style={styles.section}
            topic="characters"
          >
            <NavButton route={tempRoutes[0]} onPress={() => { handleForceToggle("characters"); }} />
            <NavButton route={tempRoutes[1]} onPress={() => { handleForceToggle("characters"); }} />
            <NavButton route={tempRoutes[2]} onPress={() => { handleForceToggle("characters"); }} />
            <NavButton route={tempRoutes[3]} onPress={() => { handleForceToggle("characters"); }} />
          </NavSection>
        </View>
        <View style={styles.sectionContainer}>
          <NavSection
            forceToggle={sectionForceToggle["equipment"]}
            style={styles.section}
            topic="equipment"
          >
            <NavButton route={tempRoutes[4]} onPress={() => { handleForceToggle("equipment"); }} />
            <NavButton route={tempRoutes[5]} onPress={() => { handleForceToggle("equipment"); }} />
            <NavButton route={tempRoutes[6]} onPress={() => { handleForceToggle("equipment"); }} />
          </NavSection>
        </View>
      </View>
    </ThemeView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    gap: 10,
  },
  sectionsContainer: {
    flexDirection: "row",
    height: "100%",
  },
  sectionContainer: {
    minWidth: 150,
    height: "100%",
    alignItems: "center",
  },
  section: {
    position: "absolute",
    width: "100%",
    top: 0,
    zIndex: 901,
  },
});