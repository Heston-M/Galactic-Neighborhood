import LoadingOverlay from "@/components/general/LoadingOverlay";
import NavMenu from "@/components/navigation/NavMenu";
import NavContextProvider from "@/contexts/NavContext";
import ThemeContextProvider from "@/contexts/ThemeContext";
import { Stack } from "expo-router";
import { StyleSheet, View } from "react-native";

export default function RootLayout() {

  return (
    <ThemeContextProvider>
      <NavContextProvider>
        <NavMenu style={styles.navMenu} />
        <View style={styles.contentContainer}>
          <LoadingOverlay 
            onDoneAnimating={() => {}} 
          />
          <Stack 
            screenOptions={{
              headerShown: false,
            }}
          />
        </View>
      </NavContextProvider>
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