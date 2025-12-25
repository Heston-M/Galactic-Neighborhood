import { useThemeContext } from "@/contexts/ThemeContext";
import { StyleProp, StyleSheet, Text, View, ViewStyle } from "react-native";

interface ListProps {
  children: React.ReactNode;
  type?: "bullet" | "number";
  style?: StyleProp<ViewStyle>;
}

export default function List({ children, type = "bullet", style }: ListProps) {
  const { getThemeColor } = useThemeContext();
  const markColor = getThemeColor("header", "characters");

  return (
    <View style={style}>
      {Array.isArray(children) ? children.map((child, index) => (
        <View key={index} style={styles.row}>
          <View style={styles.index}>
            {type === "bullet" && <View style={[styles.bullet, { backgroundColor: markColor }]} />}
            {type === "number" && <Text style={[styles.number, { color: markColor }]}>{index + 1}.</Text>}
          </View>
          <View style={styles.content}>
            {child}
          </View>
        </View>
      )) : (
        <View style={styles.row}>
          <View style={styles.index}>
            {type === "bullet" && <View style={[styles.bullet, { backgroundColor: markColor }]} />}
            {type === "number" && <Text style={[styles.number, { color: markColor }]}>{1}.</Text>}
          </View>
          <View style={styles.content}>
            {children}
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  index: {
    minWidth: 25,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 10,
  },
  bullet: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  number: {
    fontSize: 16,
    fontWeight: "bold",
  },
  content: {
    alignItems: "flex-start",
  },
});