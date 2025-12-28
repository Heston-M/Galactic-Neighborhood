import { useNavContext } from "@/contexts/NavContext";
import { Pressable, StyleProp, ViewStyle } from "react-native";

interface ScreenCoverProps {
  style?: StyleProp<ViewStyle>;
}

export default function ScreenCover({ style }: ScreenCoverProps) {
  const { menuOpen, setMenuOpen } = useNavContext();

  return (
    menuOpen && (
      <Pressable
        style={style}
        onPress={() => { setMenuOpen(false); }}
      />
    )
  );
}