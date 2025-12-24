import ThemeContextProvider from "@/contexts/UserContext";
import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <ThemeContextProvider>
      <Stack />
    </ThemeContextProvider>
  );
}
