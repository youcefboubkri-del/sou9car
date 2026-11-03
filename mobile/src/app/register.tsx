import { Link, router } from "expo-router";
import { useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from "react-native";
import { Button, Field, Select } from "@/components/ui";
import { useAuth } from "@/lib/auth";
import { MOROCCAN_CITIES } from "@/lib/constants";
import { colors } from "@/lib/theme";

const cityOptions = MOROCCAN_CITIES.map((c) => ({ label: c, value: c }));

export default function RegisterScreen() {
  const { register } = useAuth();
  const [form, setForm] = useState({ name: "", email: "", phone: "", city: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const set = (k: keyof typeof form) => (v: string) => setForm((f) => ({ ...f, [k]: v }));

  async function submit() {
    if (!form.name.trim() || !form.email.trim() || !form.password) return setError("Nom, email et mot de passe requis.");
    if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) return setError("Adresse email invalide.");
    if (form.password.length < 8) return setError("Le mot de passe doit contenir au moins 8 caractères.");
    setLoading(true);
    setError("");
    try {
      await register({
        name: form.name.trim(),
        email: form.email,
        password: form.password,
        phone: form.phone.trim() || undefined,
        city: form.city || undefined,
      });
      router.back();
    } catch (e) {
      const msg = (e as Error).message;
      setError(msg === "Email already registered" ? "Cet email est déjà utilisé." : msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView contentContainerStyle={{ padding: 20, gap: 16 }} keyboardShouldPersistTaps="handled">
        <Text style={{ color: colors.textMuted }}>Gratuit. Publiez votre annonce en quelques minutes.</Text>
        <Field label="Nom complet" value={form.name} onChangeText={set("name")} autoComplete="name" textContentType="name" />
        <Field
          label="Email"
          value={form.email}
          onChangeText={set("email")}
          autoCapitalize="none"
          autoComplete="email"
          keyboardType="email-address"
          textContentType="emailAddress"
        />
        <Field
          label="Téléphone (optionnel)"
          value={form.phone}
          onChangeText={set("phone")}
          keyboardType="phone-pad"
          autoComplete="tel"
          textContentType="telephoneNumber"
          placeholder="06 00 00 00 00"
        />
        <Select label="Ville (optionnel)" value={form.city} options={cityOptions} onChange={set("city")} searchable />
        <Field
          label="Mot de passe"
          value={form.password}
          onChangeText={set("password")}
          secureTextEntry
          autoComplete="new-password"
          textContentType="newPassword"
          placeholder="8 caractères minimum"
        />
        {error ? <Text style={{ color: colors.danger }}>{error}</Text> : null}
        <Button title="Créer mon compte" onPress={submit} loading={loading} />
        <View style={{ flexDirection: "row", justifyContent: "center", gap: 6, marginTop: 8 }}>
          <Text style={{ color: colors.textMuted }}>Déjà inscrit ?</Text>
          <Link href="/login" replace style={{ color: colors.primary, fontWeight: "700" }}>
            Se connecter
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
