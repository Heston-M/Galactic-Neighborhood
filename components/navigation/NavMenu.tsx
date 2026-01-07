import Collapsible from "@/components/general/Collapsible";
import ThemeText from "@/components/general/ThemeText";
import ThemeView from "@/components/general/ThemeView";
import NavSection from "@/components/navigation/NavSection";
import QuickAccessIcon from "@/components/navigation/QuickAccessIcon";
import { useNavContext } from "@/contexts/NavContext";
import { useThemeContext } from "@/contexts/ThemeContext";
import { StyleProp, StyleSheet, useWindowDimensions, View, ViewStyle } from "react-native";

const screenWidthThreshold = 750; // px

interface NavMenuProps {
  style?: StyleProp<ViewStyle>;
}

export default function NavMenu({ style }: NavMenuProps) {
  const screenWidth = useWindowDimensions().width;
  const wideScreenContent = screenWidth > screenWidthThreshold;

  const { getThemeColor } = useThemeContext();
  const backgroundColor = getThemeColor("primary");
  const borderColor = getThemeColor("secondary");

  const { routeSet, menuOpen, setMenuOpen } = useNavContext();

  const menuSectionsContent = (
    routeSet && routeSet.subsets && routeSet.subsets.length > 0 ? 
    <NavSection
      routeSet={routeSet}
      level={0}
      topStyle={wideScreenContent ? styles.sectionsContainerWide : [styles.sectionsContainerNarrow, { borderColor }]}
      style={styles.section}
    />
    : null
  );

  return (
    <ThemeView style={[styles.container, style]}>
      <QuickAccessIcon onPress={() => {}} />
      {routeSet && routeSet.subsets && routeSet.subsets.length > 0 
      ? wideScreenContent 
        ? menuSectionsContent
        : <View style={styles.menuCollapsibleContainer}>
            <Collapsible
              style={styles.menu}
              childrenStyle={{ padding: 0, backgroundColor }}
              topic="general"
              header={<ThemeText type="subheader" topic="general">Menu</ThemeText>}
              defaultOpen={false}
              centerHeader={true}
              isOpen={menuOpen}
              requestOpen={() => { setMenuOpen(true); }}
              requestClose={() => { setMenuOpen(false); }}
            >
              {menuSectionsContent}
            </Collapsible>
          </View>
      : <ThemeText type="subheader" topic="general">One moment...</ThemeText>}
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