import Collapsible from "@/components/general/Collapsible";
import ThemeText from "@/components/general/ThemeText";
import NavButton from "@/components/navigation/NavButton";
import { useNavContext } from "@/contexts/NavContext";
import { useThemeContext } from "@/contexts/ThemeContext";
import { Route, RouteSet } from "@/types/route";
import { parseNameText } from "@/utils/markdown";
import { findTopic } from "@/utils/routeParsing";
import { useEffect, useState } from "react";
import { StyleProp, StyleSheet, View, ViewStyle } from "react-native";

interface NavSectionProps {
  routeSet: RouteSet;
  level?: number;
  topStyle?: StyleProp<ViewStyle>;
  style?: StyleProp<ViewStyle>;
}

export default function NavSection({ routeSet, level = -1, topStyle, style }: NavSectionProps) {
  const [openSubset, setOpenSubset] = useState<string | null>(null);

  const { getThemeColor } = useThemeContext();
  const backgroundColor = getThemeColor("primary");

  const { menuOpen } = useNavContext();

  useEffect(() => {
    if (!menuOpen) {
      setOpenSubset(null);
    }
  }, [menuOpen]);

  return (
    routeSet.subsets && routeSet.subsets.length > 0 ? (
    <View style={topStyle}>
      {routeSet.subsets.map((subset: RouteSet) => (
        <Collapsible 
          key={subset.name}
          topic={findTopic(subset)} 
          header={<ThemeText type="subheader" topic={findTopic(subset)} style={{ fontSize: 20 - (level * 2) }}>{parseNameText(subset.name)} </ThemeText>} 
          defaultOpen={openSubset === subset.name} 
          flipHeaderOrder={true} 
          style={style} 
          childrenStyle={[styles.contentContainer, { backgroundColor }]}
          externalControl={true}
          isOpen={openSubset === subset.name}
          requestOpen={() => { setOpenSubset(subset.name); }}
          requestClose={() => { setOpenSubset(null); }}
        >
          {subset.subsets && subset.subsets.length > 0 && (
            <View style={{ marginTop: 5, marginLeft: 32 }}>
              {subset.subsets.map((subsubset: RouteSet) => (
                <NavSection
                  key={subsubset.name}
                  routeSet={subset}
                  level={level + 1}
                />
              ))}
            </View>
          )}
          {subset.routes && subset.routes.length > 0 && subset.routes.map((route: Route) => (
            <NavButton key={route.pageName} route={route} onPress={() => { setOpenSubset(null); }} />
          ))}
        </Collapsible>
      ))}
    </View>
    ) : null
  );
}

const styles = StyleSheet.create({
  contentContainer: {
    position: "absolute",
    width: "100%",
    padding: 0,
  },
});