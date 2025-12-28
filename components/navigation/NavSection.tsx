import Collapsible from "@/components/general/Collapsible";
import ThemeText from "@/components/general/ThemeText";
import NavButton from "@/components/navigation/NavButton";
import NavLink from "@/components/navigation/NavLink";
import { useNavContext } from "@/contexts/NavContext";
import { useThemeContext } from "@/contexts/ThemeContext";
import { Route, RouteSet } from "@/types/route";
import { parseNameText } from "@/utils/markdown";
import { findTopic } from "@/utils/routeParsing";
import { RefObject, useEffect, useRef, useState } from "react";
import { StyleProp, StyleSheet, View, ViewStyle } from "react-native";

interface NavSectionProps {
  routeSet: RouteSet;
  level?: number;
  topStyle?: StyleProp<ViewStyle>;
  style?: StyleProp<ViewStyle>;
  wide?: boolean;
}

export default function NavSection({ routeSet, level = -1, topStyle, style, wide = false }: NavSectionProps) {
  const { getThemeColor } = useThemeContext();
  const backgroundColor = getThemeColor("primary");
  const borderColor = getThemeColor("secondary");

  const [topWidth, setTopWidth] = useState<number>(0);

  const { menuOpen, setMenuOpen } = useNavContext();
  const [openSubset, setOpenSubset] = useState<string | null>(null);

  useEffect(() => {
    if (!menuOpen) {
      setOpenSubset(null);
    }
  }, [menuOpen]);

  // These refs are used to measure the x offset of each section relative to the parent, so each dropdown is centered.
  const refs = Array.from({ length: routeSet.subsets?.length ?? 0 }, () => useRef<View>(null));
  const [sectionOffsets, setSectionOffsets] = useState<Array<number>>([]);

  useEffect(() => {
    for (let i = 0; i < refs.length; i++) {
      if (refs[i]) {
        refs[i].current?.measure((fx) => {
          setSectionOffsets(prev => [...prev, fx]);
        });
      }
    }
  }, []);

  const topContentContainer: ViewStyle = {
    position: "absolute",
    flex: 1,
    top: 10,
    width: topWidth,
    padding: 0,
    borderWidth: 1,
  };

  return (
    routeSet.subsets && routeSet.subsets.length > 0 ? (
    <View style={topStyle} onLayout={(event) => level === 0 && setTopWidth(event.nativeEvent.layout.width)}>
      {routeSet.subsets.map((subset: RouteSet, index: number) => (
        <Collapsible 
          ref={refs[index] as RefObject<View>}
          key={subset.name}
          topic={findTopic(subset)} 
          header={
            subset.rootPage 
            ? <NavLink 
                route={subset.rootPage}
                text={parseNameText(subset.rootPage.pageName)}
                colorByTopic={false}
                usePreview={false}
                onPress={() => { setOpenSubset(null); }}
                style={{ fontSize: 20 - (level * 2) }}
              />
            : <ThemeText type="subheader" topic={findTopic(subset)} style={{ fontSize: 20 - (level * 2) }}>{parseNameText(subset.name)} </ThemeText>} 
          defaultOpen={openSubset === subset.name} 
          navHeader={true} 
          style={style} 
          childrenStyle={[ 
            wide && level === 0 ? topContentContainer : styles.contentContainer, 
            wide && level === 0 && sectionOffsets.length > index && { left: -sectionOffsets[index] },
            { backgroundColor, borderColor }
          ]}
          externalControl={true}
          isOpen={openSubset === subset.name}
          requestOpen={() => { 
            setOpenSubset(subset.name); 
            if (wide && level === 0) setMenuOpen(true); 
          }}
          requestClose={() => { 
            setOpenSubset(null); 
            if (wide && level === 0) setMenuOpen(false); 
          }}
          decoupleContent={wide && level === 0 ? true : false }
        >
          {subset.subsets && subset.subsets.length > 0 && (
            <View style={{ marginVertical: 3, marginLeft: 32 }}>
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
    borderLeftWidth: 1,
    borderRightWidth: 1,
  },
});