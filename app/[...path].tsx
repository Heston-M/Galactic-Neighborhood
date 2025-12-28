import ThemeScrollView from "@/components/general/ThemeScrollView";
import ThemeView from "@/components/general/ThemeView";
import PageRenderer from "@/components/rules/PageRenderer";
import { useNavContext } from "@/contexts/NavContext";
import { StyleSheet } from "react-native";

export default function Page() {
  const { currentPage } = useNavContext();

  return (
    <ThemeScrollView>
      <ThemeView style={styles.plate}>
        <PageRenderer page={currentPage} />
      </ThemeView>
    </ThemeScrollView>
  );
}

const styles = StyleSheet.create({
  plate: {
    width: "90%",
    maxHeight: "100%",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 100,
    gap: 10,
  },
});