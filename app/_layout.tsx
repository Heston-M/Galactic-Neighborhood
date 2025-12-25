import NavMenu from "@/components/navigation/NavMenu";
import ThemeContextProvider from "@/contexts/ThemeContext";
import { Stack } from "expo-router";
import { StyleSheet, View } from "react-native";

export default function RootLayout() {
  return (
    <ThemeContextProvider>
      <NavMenu style={styles.navMenu} />
      <View style={styles.contentContainer}>
        <Stack 
          screenOptions={{
            headerShown: false,
          }}
        />
      </View>
    </ThemeContextProvider>
  );
}

const styles = StyleSheet.create({
  navMenu: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 50,
    zIndex: 900,
  },
  contentContainer: {
    position: "absolute",
    top: 50,
    left: 0,
    right: 0,
    bottom: 0,
  },
});