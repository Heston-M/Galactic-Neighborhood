import Notice from "@/components/general/Notice";
import ThemeScrollView from "@/components/general/ThemeScrollView";
import ThemeView from "@/components/general/ThemeView";
import PageRenderer from "@/components/rules/PageRenderer";
import tempPages from "@/constants/tempPages.json";
import { JsonPage } from "@/types/page";
import { useState } from "react";
import { StyleSheet } from "react-native";

export default function Index() {
  const [noticeVisible, setNoticeVisible] = useState(true);
  const [noticeMessage, setNoticeMessage] = useState("This is a notice, like a warning or an alert.");

  const pages: JsonPage[] = tempPages as JsonPage[];

  return (
    <ThemeScrollView>
      <ThemeView style={styles.plate}>
        <Notice 
          visible={noticeVisible}
          onPress={() => setNoticeVisible(false)}
          onClose={() => setNoticeVisible(false)}
        >
          {noticeMessage}
        </Notice>
        {pages.map((page) => (
          <PageRenderer key={page.route} page={page} />
        ))}
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