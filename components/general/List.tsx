import { useThemeContext } from "@/contexts/ThemeContext";
import { Topic } from "@/types/topic";
import { StyleProp, StyleSheet, Text, View, ViewStyle } from "react-native";

interface ListProps {
  children: React.ReactNode;
  type?: "bullet" | "number";
  topic?: Topic;
  style?: StyleProp<ViewStyle>;
}

export default function List({ children, type = "bullet", topic, style }: ListProps) {
  const { getThemeColor } = useThemeContext();
  const markColor = getThemeColor("topic", topic);

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
    alignItems: "flex-start",
  },
  index: {
    flex: 0,
    minWidth: 25,
    justifyContent: "flex-start",
    alignItems: "center",
    marginHorizontal: 10,
  },
  bullet: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 6,
  },
  number: {
    fontSize: 16,
    fontWeight: "bold",
  },
  content: {
    flex: 1,
    alignItems: "flex-start",
    flexWrap: "wrap",
  },
});