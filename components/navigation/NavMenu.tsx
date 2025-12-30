import { useEffect, useState } from "react";
import { StyleProp, StyleSheet, View, ViewStyle } from "react-native";
import ThemeView from "../general/ThemeView";
import NavButton from "./NavButton";
import NavSection from "./NavSection";
import QuickAccessIcon from "./QuickAccessIcon";

interface NavMenuProps {
  setCloseMenu: number;
  style?: StyleProp<ViewStyle>;
  onMenuOpen: () => void;
}

const tempCharactersRoutes: string[] = [
  "/characters/backgrounds",
  "/characters/enhancement",
  "/characters/equipment",
  "/characters/skills",
];

const tempEquipmentRoutes: string[] = [
  "/equipment/enhancement",
  "/equipment/equipment",
  "/equipment/skills",
];

const tempMagicRoutes: string[] = [
  "/magic/magic",
  "/magic/skills",
];

const tempRulesRoutes: string[] = [
  "/rules/rules",
  "/rules/skills",
];

export default function NavMenu({ setCloseMenu, style, onMenuOpen }: NavMenuProps) {
  const [openSection, setOpenSection] = useState<string | null>(null);

  useEffect(() => {
    setOpenSection(prev => null);
  }, [setCloseMenu]);

  return (
    <ThemeView style={[styles.container, style]}>
      <QuickAccessIcon onPress={() => {}} />
      <View style={styles.sectionsContainer}>
        <View style={styles.sectionContainer}>
          <NavSection
            style={styles.section}
            topic="characters"
            isOpen={openSection === "characters"}
            onOpen={() => { setOpenSection("characters"); onMenuOpen(); }}
            onClose={() => { setOpenSection(null); }}
          >
            {tempCharactersRoutes.map((route) => (
              <NavButton key={route} route={route} onPress={() => { setOpenSection(null); }} />
            ))}
          </NavSection>
        </View>
        <View style={styles.sectionContainer}>
          <NavSection
            style={styles.section}
            topic="equipment"
            isOpen={openSection === "equipment"}
            onOpen={() => { setOpenSection("equipment"); onMenuOpen(); }}
            onClose={() => { setOpenSection(null); }}
          >
            {tempEquipmentRoutes.map((route) => (
              <NavButton key={route} route={route} onPress={() => { setOpenSection(null); }} />
            ))}
          </NavSection>
        </View>
        <View style={styles.sectionContainer}>
          <NavSection
            style={styles.section}
            topic="magic"
            isOpen={openSection === "magic"}
            onOpen={() => { setOpenSection("magic"); onMenuOpen(); }}
            onClose={() => { setOpenSection(null); }}
          >
            {tempMagicRoutes.map((route) => (
              <NavButton key={route} route={route} onPress={() => { setOpenSection(null); }} />
            ))}
          </NavSection>
        </View>
        <View style={styles.sectionContainer}>
          <NavSection
            style={styles.section}
            topic="rules"
            isOpen={openSection === "rules"}
            onOpen={() => { setOpenSection("rules"); onMenuOpen(); }}
            onClose={() => { setOpenSection(null); }}
          >
            {tempRulesRoutes.map((route) => (
              <NavButton key={route} route={route} onPress={() => { setOpenSection(null); }} />
            ))}
          </NavSection>
        </View>
      </View>
      <QuickAccessIcon onPress={() => {}} />
    </ThemeView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
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
    zIndex: 11,
  },
});