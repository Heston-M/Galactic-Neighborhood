import { useThemeContext } from "@/contexts/ThemeContext";
import { useEffect, useState } from "react";
import { StyleProp, StyleSheet, useWindowDimensions, View, ViewStyle } from "react-native";
import ThemeText from "../general/ThemeText";
import ThemeView from "../general/ThemeView";
import NavButton from "./NavButton";
import NavSection from "./NavSection";
import QuickAccessIcon from "./QuickAccessIcon";

const screenWidthThreshold = 700; // px
const sectionWidths = {
  "characters": 150,
  "equipment": 150,
  "magic": 110,
  "rules": 110,
};

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
  const screenWidth = useWindowDimensions().width;
  const wideScreenContent = screenWidth > screenWidthThreshold;

  const { getThemeColor } = useThemeContext();
  const borderColor = getThemeColor("secondary");

  const [menuOpen, setMenuOpen] = useState<boolean>(false);
  const [openSection, setOpenSection] = useState<string | null>(null);

  useEffect(() => {
    setOpenSection(null);
    setMenuOpen(false);
  }, [setCloseMenu]);

  const menuSectionsContent = (
    <View style={wideScreenContent ? styles.sectionsContainerWide : [styles.sectionsContainerNarrow, { borderColor }]}>
      <View style={{ minWidth: wideScreenContent ? sectionWidths.characters : undefined }}>
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
      <View style={{ minWidth: wideScreenContent ? sectionWidths.equipment : undefined }}>
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
      <View style={{ minWidth: wideScreenContent ? sectionWidths.magic : undefined }}>
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
      <View style={{ minWidth: wideScreenContent ? sectionWidths.rules : undefined }}>
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
  );

  return (
    <ThemeView style={[styles.container, style]}>
      <QuickAccessIcon onPress={() => {}} />
      {wideScreenContent 
      ? menuSectionsContent 
      : <View style={styles.menuCollapsibleContainer}>
          <NavSection
            style={styles.menu}
            topic="general"
            header={<ThemeText type="subheader" topic="general">Menu</ThemeText>}
            centerHeader={true}
            isOpen={menuOpen}
            onOpen={() => { setMenuOpen(true); onMenuOpen(); }}
            onClose={() => { setMenuOpen(false); }}
          >
            {menuSectionsContent}
          </NavSection>
        </View>
      }
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
  menuCollapsibleContainer: {
    flex: 1,
    height: "100%",
    flexDirection: "row",
    alignItems: "center",
  },
  menu: {
    position: "absolute",
    width: "100%",
    top: 0,
    zIndex: 11,
  },
  sectionsContainerWide: {
    flexDirection: "row",
    height: "100%",
  },
  sectionsContainerNarrow: {
    flex: 1,
    flexDirection: "column",
    paddingVertical: 5,
    borderWidth: 1,
    borderTopWidth: 0,
    borderBottomLeftRadius: 5,
    borderBottomRightRadius: 5,
    gap: 5,
  },
  section: {
    flex: 1,
    zIndex: 11,
  },
});