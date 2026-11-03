import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { Alert, Pressable, StyleSheet, type StyleProp, type ViewStyle } from "react-native";
import { useAuth } from "@/lib/auth";
import { useFavorites } from "@/lib/favorites";
import { colors } from "@/lib/theme";

export function FavoriteButton({ listingId, style }: { listingId: string; style?: StyleProp<ViewStyle> }) {
  const { user } = useAuth();
  const { isFavorite, toggle } = useFavorites();
  const active = isFavorite(listingId);

  async function onPress() {
    if (!user) {
      router.push("/login");
      return;
    }
    void Haptics.selectionAsync().catch(() => {});
    try {
      await toggle(listingId);
    } catch (e) {
      Alert.alert("Favoris", (e as Error).message);
    }
  }

  return (
    <Pressable
      onPress={onPress}
      hitSlop={8}
      accessibilityRole="button"
      accessibilityLabel={active ? "Retirer des favoris" : "Ajouter aux favoris"}
      style={[styles.btn, style]}
    >
      <Ionicons name={active ? "heart" : "heart-outline"} size={20} color={active ? colors.danger : "#fff"} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(0,0,0,0.55)",
    alignItems: "center",
    justifyContent: "center",
  },
});
