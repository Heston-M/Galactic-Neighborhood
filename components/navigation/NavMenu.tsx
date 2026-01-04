import { useNavContext } from "@/contexts/NavContext";
import { useThemeContext } from "@/contexts/ThemeContext";
import { Topic } from "@/types/topic";
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

  const { routeSet } = useNavContext();

  const [menuOpen, setMenuOpen] = useState<boolean>(false);
  const [openSection, setOpenSection] = useState<string | null>(null);

  useEffect(() => {
    setOpenSection(null);
    setMenuOpen(false);
  }, [setCloseMenu]);

  const menuSectionsContent = routeSet && routeSet.subsets && routeSet.subsets.length > 0 ? (
    <View style={wideScreenContent 
      ? styles.sectionsContainerWide
      : [styles.sectionsContainerNarrow, { borderColor }]}>
      {routeSet.subsets.map((topic) => (
        <NavSection
          style={styles.section}
          key={topic.name}
          topic={topic.name as Topic}
          isOpen={openSection === topic.name}
          onOpen={() => { setOpenSection(topic.name); onMenuOpen(); }}
          onClose={() => { setOpenSection(null); }}
        >
          { topic.subsets && topic.subsets.length > 0 && topic.subsets.map((subset) => (
            <View key={subset.name} style={{ marginLeft: 32 }}>
              <NavSection
                topic={topic.name as Topic}
                isOpen={false}
                onOpen={() => {}}
                onClose={() => {}}
              >
                {subset.routes && subset.routes.length > 0 && subset.routes.map((route) => (
                  <NavButton key={route.pageName} route={route} onPress={() => { setOpenSection(null); }} />
                ))}
              </NavSection>
            </View>
          ))}
          {topic.routes && topic.routes.length > 0 && topic.routes.map((route) => (
            <NavButton key={route.pageName} route={route} onPress={() => { setOpenSection(null); }} />
          ))}
        </NavSection>
      ))}  
    </View>
  ) : <ThemeText type="subheader" topic="general">One moment...</ThemeText>;

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
    gap: 10,
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
    zIndex: 11,
  },
});