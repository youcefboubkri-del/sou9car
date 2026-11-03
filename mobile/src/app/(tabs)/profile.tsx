import { Ionicons } from "@expo/vector-icons";
import Constants from "expo-constants";
import { router } from "expo-router";
import { Alert, Linking, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { AuthGate } from "@/components/AuthGate";
import { Card, type IconName } from "@/components/ui";
import { api, API_URL } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { colors } from "@/lib/theme";

const ROLE_LABELS: Record<string, string> = {
  BUYER: "Acheteur",
  SELLER: "Vendeur",
  INSPECTOR: "Inspecteur",
  ADMIN: "Administrateur",
};

export default function ProfileScreen() {
  return (
    <AuthGate icon="person-outline" title="Votre compte Sou9Car" message="Connectez-vous ou créez un compte gratuit.">
      <Profile />
    </AuthGate>
  );
}

function Profile() {
  const { user, logout } = useAuth();
  if (!user) return null;

  async function contactSupport() {
    try {
      const { conversation } = await api<{ conversation: { id: string } }>("/api/conversations", {
        method: "POST",
        body: { support: true },
      });
      router.push(`/conversation/${conversation.id}`);
    } catch (e) {
      Alert.alert("Support", (e as Error).message);
    }
  }

  return (
    <ScrollView contentContainerStyle={{ padding: 16, gap: 16 }}>
      <Card style={{ flexDirection: "row", alignItems: "center", gap: 14 }}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{user.name.charAt(0).toUpperCase()}</Text>
        </View>
        <View style={{ flex: 1, gap: 2 }}>
          <Text style={{ color: colors.text, fontSize: 19, fontWeight: "800" }}>{user.name}</Text>
          <Text style={{ color: colors.textMuted }}>{user.email}</Text>
          <Text style={{ color: colors.textFaint, fontSize: 13 }}>
            {ROLE_LABELS[user.role] ?? user.role}
            {user.city ? ` · ${user.city}` : ""}
            {user.phone ? ` · ${user.phone}` : ""}
          </Text>
        </View>
      </Card>

      <Card style={{ padding: 0 }}>
        <Row icon="car-outline" label="Mes annonces" onPress={() => router.push("/my-listings")} />
        <Row icon="add-circle-outline" label="Publier une annonce" onPress={() => router.navigate("/sell")} />
        <Row icon="heart-outline" label="Mes favoris" onPress={() => router.navigate("/favorites")} />
        <Row icon="chatbubbles-outline" label="Messages" onPress={() => router.navigate("/messages")} last />
      </Card>

      <Card style={{ padding: 0 }}>
        <Row icon="headset-outline" label="Contacter le support" onPress={contactSupport} />
        <Row icon="wallet-outline" label="Portefeuille & paiements" external onPress={() => Linking.openURL(`${API_URL}/wallet`)} />
        <Row icon="shield-checkmark-outline" label="Vérifier mon compte vendeur" external onPress={() => Linking.openURL(`${API_URL}/verify`)} />
        <Row icon="document-text-outline" label="Conditions d'utilisation" external onPress={() => Linking.openURL(`${API_URL}/terms`)} last />
      </Card>

      <Card style={{ padding: 0 }}>
        <Row
          icon="log-out-outline"
          label="Se déconnecter"
          danger
          last
          onPress={() =>
            Alert.alert("Déconnexion", "Voulez-vous vous déconnecter ?", [
              { text: "Annuler", style: "cancel" },
              { text: "Se déconnecter", style: "destructive", onPress: () => void logout() },
            ])
          }
        />
      </Card>

      <Text style={{ color: colors.textFaint, textAlign: "center", fontSize: 12 }}>
        Sou9Car v{Constants.expoConfig?.version ?? "1.0.0"}
      </Text>
    </ScrollView>
  );
}

function Row({
  icon,
  label,
  onPress,
  external,
  danger,
  last,
}: {
  icon: IconName;
  label: string;
  onPress: () => void;
  external?: boolean;
  danger?: boolean;
  last?: boolean;
}) {
  const color = danger ? colors.danger : colors.text;
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.row, !last && styles.rowBorder, pressed && { backgroundColor: colors.surface2 }]}
    >
      <Ionicons name={icon} size={21} color={danger ? colors.danger : colors.primary} />
      <Text style={{ color, fontSize: 16, flex: 1 }}>{label}</Text>
      {!danger && <Ionicons name={external ? "open-outline" : "chevron-forward"} size={18} color={colors.textFaint} />}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { color: colors.primary, fontSize: 24, fontWeight: "900" },
  row: { flexDirection: "row", alignItems: "center", gap: 14, paddingHorizontal: 16, paddingVertical: 15 },
  rowBorder: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
});
