import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router } from "expo-router";
import { useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
  type ScrollViewInstance,
} from "react-native";
import { AuthGate } from "@/components/AuthGate";
import { Button, Card, Chip, Field, Select } from "@/components/ui";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import {
  BODY_TYPES,
  CAR_BRANDS,
  CONDITIONS,
  FUEL_TYPES,
  MOROCCAN_CITIES,
  TRANSMISSIONS,
  labelOf,
  type Option,
} from "@/lib/constants";
import { formatMileage, formatPrice } from "@/lib/format";
import { MAX_PAYLOAD_BYTES, MAX_PHOTOS, pickPhotos, type Photo } from "@/lib/photos";
import { colors, radius } from "@/lib/theme";

const brandOptions = CAR_BRANDS.map((b) => ({ label: b, value: b }));
const cityOptions = MOROCCAN_CITIES.map((c) => ({ label: c, value: c }));
const digits = (v: string) => v.replace(/[^\d]/g, "");
const STEPS = ["Véhicule", "Photos", "Prix & détails"];
const CURRENT_YEAR = new Date().getFullYear();

type Form = {
  brand: string;
  model: string;
  year: string;
  mileage: string;
  fuelType: string;
  transmission: string;
  bodyType: string;
  condition: string;
  price: string;
  city: string;
  description: string;
  hasWarranty: boolean;
  isImport: boolean;
  isDamaged: boolean;
  creditEnabled: boolean;
};

export default function SellScreen() {
  return (
    <AuthGate icon="add-circle-outline" title="Vendez votre voiture" message="Connectez-vous pour publier une annonce gratuitement.">
      <SellForm />
    </AuthGate>
  );
}

function SellForm() {
  const { user } = useAuth();
  const initial: Form = {
    brand: "",
    model: "",
    year: "",
    mileage: "",
    fuelType: "DIESEL",
    transmission: "MANUAL",
    bodyType: "SEDAN",
    condition: "GOOD",
    price: "",
    city: user?.city && MOROCCAN_CITIES.includes(user.city) ? user.city : "Casablanca",
    description: "",
    hasWarranty: false,
    isImport: false,
    isDamaged: false,
    creditEnabled: false,
  };
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<Form>(initial);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [processing, setProcessing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const scrollRef = useRef<ScrollViewInstance>(null);

  const set = <K extends keyof Form>(key: K, value: Form[K]) => setForm((f) => ({ ...f, [key]: value }));
  const payloadBytes = photos.reduce((n, p) => n + p.bytes, 0);

  function validate(s: number): string {
    if (s === 0) {
      if (!form.brand) return "Choisissez la marque.";
      if (!form.model.trim()) return "Indiquez le modèle.";
      const y = Number(form.year);
      if (!y || y < 1950 || y > CURRENT_YEAR + 1) return `Année invalide (1950–${CURRENT_YEAR + 1}).`;
      if (form.mileage === "") return "Indiquez le kilométrage.";
    }
    if (s === 1) {
      if (photos.length === 0) return "Ajoutez au moins une photo.";
      if (payloadBytes > MAX_PAYLOAD_BYTES) return "Photos trop lourdes : retirez-en une ou deux.";
    }
    if (s === 2) {
      const p = Number(form.price);
      if (!p || p < 1000) return "Indiquez un prix valide (en DH).";
    }
    return "";
  }

  function next() {
    const msg = validate(step);
    setError(msg);
    if (msg) return;
    setStep((s) => s + 1);
    scrollRef.current?.scrollTo({ y: 0, animated: false });
  }

  async function addPhotos(source: "library" | "camera") {
    setProcessing(true);
    try {
      const added = await pickPhotos(source, MAX_PHOTOS - photos.length);
      setPhotos((prev) => [...prev, ...added].slice(0, MAX_PHOTOS));
      setError("");
    } catch (e) {
      Alert.alert("Photos", (e as Error).message);
    } finally {
      setProcessing(false);
    }
  }

  async function submit() {
    for (const s of [0, 1, 2]) {
      const msg = validate(s);
      if (msg) {
        setStep(s);
        setError(msg);
        return;
      }
    }
    setSubmitting(true);
    setError("");
    try {
      const { listing } = await api<{ listing: { id: string } }>("/api/listings", {
        method: "POST",
        body: {
          ...form,
          model: form.model.trim(),
          title: `${form.brand} ${form.model.trim()} ${form.year}`,
          description: form.description.trim(),
          images: photos.map((p) => p.dataUrl),
        },
      });
      setForm(initial);
      setPhotos([]);
      setStep(0);
      router.push(`/listing/${listing.id}`);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined} keyboardVerticalOffset={100}>
      <View style={styles.stepper}>
        {STEPS.map((label, i) => (
          <View key={label} style={{ flex: 1, gap: 6 }}>
            <View style={[styles.stepBar, i <= step && { backgroundColor: colors.primary }]} />
            <Text style={[styles.stepLabel, i === step && { color: colors.text }]}>{label}</Text>
          </View>
        ))}
      </View>

      <ScrollView ref={scrollRef} contentContainerStyle={{ padding: 16, gap: 18, paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
        {step === 0 && (
          <>
            <Select label="Marque *" value={form.brand} options={brandOptions} onChange={(v) => set("brand", v)} searchable />
            <Field label="Modèle *" value={form.model} onChangeText={(v) => set("model", v)} placeholder="ex. Clio, Golf, Tucson" />
            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <Field
                  label="Année *"
                  value={form.year}
                  onChangeText={(v) => set("year", digits(v))}
                  keyboardType="number-pad"
                  maxLength={4}
                  placeholder={String(CURRENT_YEAR - 3)}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Field
                  label="Kilométrage *"
                  value={form.mileage}
                  onChangeText={(v) => set("mileage", digits(v))}
                  keyboardType="number-pad"
                  placeholder="ex. 85000"
                />
              </View>
            </View>
            <ChipGroup label="Carburant" options={FUEL_TYPES} value={form.fuelType} onChange={(v) => set("fuelType", v)} />
            <ChipGroup label="Boîte de vitesses" options={TRANSMISSIONS} value={form.transmission} onChange={(v) => set("transmission", v)} />
            <ChipGroup label="Carrosserie" options={BODY_TYPES} value={form.bodyType} onChange={(v) => set("bodyType", v)} />
            <ChipGroup label="État" options={CONDITIONS} value={form.condition} onChange={(v) => set("condition", v)} />
          </>
        )}

        {step === 1 && (
          <>
            <Text style={{ color: colors.textMuted, lineHeight: 20 }}>
              Les annonces avec de belles photos se vendent plus vite. Ajoutez jusqu&apos;à {MAX_PHOTOS} photos : extérieur, intérieur, compteur.
            </Text>
            <View style={styles.photoGrid}>
              {photos.map((p, i) => (
                <View key={p.uri} style={styles.photoCell}>
                  <Image source={p.uri} style={StyleSheet.absoluteFill} contentFit="cover" />
                  {i === 0 && (
                    <View style={styles.coverBadge}>
                      <Text style={{ color: "#fff", fontSize: 10, fontWeight: "800" }}>COUVERTURE</Text>
                    </View>
                  )}
                  <Pressable
                    style={styles.removePhoto}
                    hitSlop={6}
                    onPress={() => setPhotos((prev) => prev.filter((x) => x.uri !== p.uri))}
                    accessibilityLabel="Retirer la photo"
                  >
                    <Ionicons name="close" size={14} color="#fff" />
                  </Pressable>
                </View>
              ))}
              {processing && (
                <View style={[styles.photoCell, styles.photoAdd]}>
                  <ActivityIndicator color={colors.primary} />
                </View>
              )}
            </View>
            {photos.length < MAX_PHOTOS && (
              <View style={styles.row}>
                <Button title="Galerie" icon="images-outline" variant="secondary" style={{ flex: 1 }} onPress={() => addPhotos("library")} disabled={processing} />
                <Button title="Appareil photo" icon="camera-outline" variant="secondary" style={{ flex: 1 }} onPress={() => addPhotos("camera")} disabled={processing} />
              </View>
            )}
            <Text style={{ color: colors.textFaint, fontSize: 12 }}>
              {photos.length}/{MAX_PHOTOS} photos · {(payloadBytes / 1024 / 1024).toFixed(1)} Mo
            </Text>
          </>
        )}

        {step === 2 && (
          <>
            <Field
              label="Prix (DH) *"
              value={form.price}
              onChangeText={(v) => set("price", digits(v))}
              keyboardType="number-pad"
              placeholder="ex. 145000"
            />
            <Select label="Ville *" value={form.city} options={cityOptions} onChange={(v) => set("city", v)} searchable />
            <Field
              label="Description"
              value={form.description}
              onChangeText={(v) => set("description", v)}
              multiline
              placeholder="Entretien, options, raison de la vente…"
              maxLength={3000}
            />
            <Card style={{ gap: 4, paddingVertical: 8 }}>
              <Toggle label="Sous garantie" value={form.hasWarranty} onChange={(v) => set("hasWarranty", v)} />
              <Toggle label="Véhicule importé" value={form.isImport} onChange={(v) => set("isImport", v)} />
              <Toggle label="Véhicule accidenté" value={form.isDamaged} onChange={(v) => set("isDamaged", v)} />
              <Toggle label="Crédit possible" value={form.creditEnabled} onChange={(v) => set("creditEnabled", v)} />
            </Card>

            <Card style={{ gap: 6 }}>
              <Text style={{ color: colors.textMuted, fontSize: 13, fontWeight: "600" }}>Récapitulatif</Text>
              <Text style={{ color: colors.text, fontSize: 18, fontWeight: "800" }}>
                {form.brand} {form.model} {form.year}
              </Text>
              <Text style={{ color: colors.primary, fontSize: 18, fontWeight: "800" }}>
                {form.price ? formatPrice(Number(form.price)) : "— DH"}
              </Text>
              <Text style={{ color: colors.textMuted }}>
                {formatMileage(Number(form.mileage || 0))} · {labelOf(FUEL_TYPES, form.fuelType)} · {labelOf(TRANSMISSIONS, form.transmission)} · {form.city}
              </Text>
              <Text style={{ color: colors.textMuted }}>{photos.length} photo(s)</Text>
            </Card>
          </>
        )}

        {error ? <Text style={{ color: colors.danger }}>{error}</Text> : null}

        <View style={styles.row}>
          {step > 0 && (
            <Button
              title="Retour"
              variant="secondary"
              style={{ flex: 1 }}
              onPress={() => {
                setError("");
                setStep((s) => s - 1);
              }}
            />
          )}
          {step < STEPS.length - 1 ? (
            <Button title="Continuer" style={{ flex: 2 }} onPress={next} disabled={processing} />
          ) : (
            <Button title="Publier l'annonce" icon="rocket-outline" style={{ flex: 2 }} onPress={submit} loading={submitting} />
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function ChipGroup({ label, options, value, onChange }: { label: string; options: Option[]; value: string; onChange: (v: string) => void }) {
  return (
    <View style={{ gap: 8 }}>
      <Text style={{ color: colors.textMuted, fontSize: 13, fontWeight: "600" }}>{label}</Text>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
        {options.map((o) => (
          <Chip key={o.value} label={o.label} active={value === o.value} onPress={() => onChange(o.value)} />
        ))}
      </View>
    </View>
  );
}

function Toggle({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 6 }}>
      <Text style={{ color: colors.text, fontSize: 15 }}>{label}</Text>
      <Switch value={value} onValueChange={onChange} trackColor={{ true: colors.primary, false: colors.elevated }} thumbColor="#fff" />
    </View>
  );
}

const styles = StyleSheet.create({
  stepper: { flexDirection: "row", gap: 8, paddingHorizontal: 16, paddingTop: 8, paddingBottom: 4 },
  stepBar: { height: 4, borderRadius: 2, backgroundColor: colors.elevated },
  stepLabel: { color: colors.textFaint, fontSize: 12, fontWeight: "600" },
  row: { flexDirection: "row", gap: 10 },
  photoGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  photoCell: {
    width: "31.5%",
    aspectRatio: 1,
    borderRadius: radius.md,
    overflow: "hidden",
    backgroundColor: colors.surface2,
  },
  photoAdd: { alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: colors.border, borderStyle: "dashed" },
  coverBadge: {
    position: "absolute",
    left: 6,
    bottom: 6,
    backgroundColor: colors.primary,
    borderRadius: 4,
    paddingHorizontal: 5,
    paddingVertical: 2,
  },
  removePhoto: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "rgba(0,0,0,0.65)",
    alignItems: "center",
    justifyContent: "center",
  },
});
