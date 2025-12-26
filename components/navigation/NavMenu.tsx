import { ReactNodePage } from "@/types/page";
import { StyleProp, StyleSheet, View, ViewStyle } from "react-native";
import ThemeText from "../general/ThemeText";
import ThemeView from "../general/ThemeView";
import NavButton from "./NavButton";
import NavSection from "./NavSection";
import QuickAccessIcon from "./QuickAccessIcon";

interface NavMenuProps {
  style?: StyleProp<ViewStyle>;
}

const tempPages: ReactNodePage[] = [
  {
    title: "Character 1",
    topic: "characters",
    route: "/characters",
    snippet: <ThemeText>Characters</ThemeText>,
    content: <ThemeText>Characters content</ThemeText>,
  },
  {
    title: "Character 2",
    topic: "characters",
    route: "/characters",
    snippet: <ThemeText>Characters</ThemeText>,
    content: <ThemeText>Characters content</ThemeText>,
  },
  {
    title: "Character 3",
    topic: "characters",
    route: "/characters",
    snippet: <ThemeText>Characters</ThemeText>,
    content: <ThemeText>Characters content</ThemeText>,
  },
  {
    title: "Equipment 1",
    topic: "equipment",
    route: "/equipment",
    snippet: <ThemeText>Equipment</ThemeText>,
    content: <ThemeText>Equipment content</ThemeText>,
  },
  {
    title: "Equipment 2 w/ long title",
    topic: "equipment",
    route: "/equipment",
    snippet: <ThemeText>Equipment</ThemeText>,
    content: <ThemeText>Equipment content</ThemeText>,
  },
  {
    title: "Equipment 3",
    topic: "equipment",
    route: "/equipment",
    snippet: <ThemeText>Equipment</ThemeText>,
    content: <ThemeText>Equipment content</ThemeText>,
  },
];

export default function NavMenu({ style }: NavMenuProps) {

  const handlePress = (page: ReactNodePage) => {
    console.log(page.title + " pressed");
  }

  return (
    <ThemeView style={[styles.container, style]}>
      <QuickAccessIcon onPress={() => {}} />
      <View style={styles.sectionsContainer}>
        <View style={styles.sectionContainer}>
          <NavSection
            style={styles.section}
            topic="characters"
            defaultOpen={false}
          >
            <NavButton page={tempPages[0]} onPress={handlePress} />
            <NavButton page={tempPages[1]} onPress={handlePress} />
            <NavButton page={tempPages[2]} onPress={handlePress} />
          </NavSection>
        </View>
        <View style={styles.sectionContainer}>
          <NavSection
            style={styles.section}
            topic="equipment"
            defaultOpen={false}
          >
            <NavButton page={tempPages[3]} onPress={handlePress} />
            <NavButton page={tempPages[4]} onPress={handlePress} />
            <NavButton page={tempPages[5]} onPress={handlePress} />
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