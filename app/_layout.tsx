import LoadingOverlay from "@/components/general/LoadingOverlay";
import NavMenu from "@/components/navigation/NavMenu";
import NavContextProvider from "@/contexts/NavContext";
import ThemeContextProvider from "@/contexts/ThemeContext";
import { Stack } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";

export default function RootLayout() {
  const [menuOpen, setMenuOpen] = useState<boolean>(false);
  const [closeMenu, setCloseMenu] = useState<number>(0);

  return (
    <ThemeContextProvider>
      <NavContextProvider>
        <NavMenu setCloseMenu={closeMenu} style={styles.navMenu} onMenuOpen={() => { setMenuOpen(true); }} />
        {menuOpen && <Pressable
          style={styles.contentCoverer}
          onPress={() => { setMenuOpen(false); setCloseMenu(prev => prev + 1); }}
        />}
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
    zIndex: 10,
  },
  contentCoverer: {
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