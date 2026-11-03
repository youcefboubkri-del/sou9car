import { Link, router } from "expo-router";
import { useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from "react-native";
import { Button, Field } from "@/components/ui";
import { useAuth } from "@/lib/auth";
import { colors } from "@/lib/theme";

export default function LoginScreen() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit() {
    if (!email || !password) return setError("Email et mot de passe requis.");
    setLoading(true);
    setError("");
    try {
      await login(email, password);
      router.back();
    } catch (e) {
      const msg = (e as Error).message;
      setError(msg === "Invalid email or password" ? "Email ou mot de passe incorrect." : msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView contentContainerStyle={{ padding: 20, gap: 16 }} keyboardShouldPersistTaps="handled">
        <View style={{ marginBottom: 8 }}>
          <Text style={{ color: colors.text, fontSize: 26, fontWeight: "900" }}>Bon retour 👋</Text>
          <Text style={{ color: colors.textMuted, marginTop: 4 }}>Connectez-vous pour contacter les vendeurs et publier vos annonces.</Text>
        </View>
        <Field
          label="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          autoComplete="email"
          keyboardType="email-address"
          textContentType="emailAddress"
          placeholder="vous@exemple.com"
        />
        <Field
          label="Mot de passe"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoComplete="password"
          textContentType="password"
          placeholder="••••••••"
          onSubmitEditing={submit}
          returnKeyType="go"
        />
        {error ? <Text style={{ color: colors.danger }}>{error}</Text> : null}
        <Button title="Se connecter" onPress={submit} loading={loading} />
        <View style={{ flexDirection: "row", justifyContent: "center", gap: 6, marginTop: 8 }}>
          <Text style={{ color: colors.textMuted }}>Pas encore de compte ?</Text>
          <Link href="/register" replace style={{ color: colors.primary, fontWeight: "700" }}>
            S&apos;inscrire
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
