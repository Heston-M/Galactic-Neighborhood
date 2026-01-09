import LoadingOverlay from "@/components/general/LoadingOverlay";
import ScreenCover from "@/components/general/ScreenCover";
import NavMenu from "@/components/navigation/NavMenu";
import CacheContextProvider from "@/contexts/CacheContext";
import NavContextProvider from "@/contexts/NavContext";
import ThemeContextProvider from "@/contexts/ThemeContext";
import { Stack } from "expo-router";
import { StyleSheet, View } from "react-native";

export default function RootLayout() {
  return (
    <CacheContextProvider>
      <ThemeContextProvider>
        <NavContextProvider>
          <NavMenu style={styles.navMenu} />
          <ScreenCover style={styles.screenCover} />
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
    </CacheContextProvider>
  );
}

const styles = StyleSheet.create({
  navMenu: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 50,
    zIndex: 10,
  },
  screenCover: {
    position: "absolute",
    top: 50,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9,
  },
  contentContainer: {
    position: "absolute",
    top: 50,
    left: 0,
    right: 0,
    bottom: 0,
  },
});