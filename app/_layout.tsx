import LoadingOverlay from "@/components/general/LoadingOverlay";
import NavMenu from "@/components/navigation/NavMenu";
import NavContextProvider from "@/contexts/NavContext";
import ThemeContextProvider from "@/contexts/ThemeContext";
import { Stack } from "expo-router";
import { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";

export default function RootLayout() {
  const [loadingVisible, setLoadingVisible] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setLoadingVisible(false);
    }, 2000);
  }, [loadingVisible]);

  return (
    <ThemeContextProvider>
      <NavContextProvider>
        <NavMenu style={styles.navMenu} />
        <View style={styles.contentContainer}>
          <LoadingOverlay 
            visible={loadingVisible} 
            targetTopic="general" 
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