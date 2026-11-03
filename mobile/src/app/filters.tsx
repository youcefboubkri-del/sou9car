import { router } from "expo-router";
import { useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button, Chip, Field, Select } from "@/components/ui";
import { CAR_BRANDS, FUEL_TYPES, MOROCCAN_CITIES, SORT_OPTIONS, TRANSMISSIONS } from "@/lib/constants";
import { EMPTY_FILTERS, useFilters, type Filters } from "@/lib/filters";
import { colors } from "@/lib/theme";

const brandOptions = CAR_BRANDS.map((b) => ({ label: b, value: b }));
const cityOptions = MOROCCAN_CITIES.map((c) => ({ label: c, value: c }));
const digits = (v: string) => v.replace(/[^\d]/g, "");

export default function FiltersScreen() {
  const { filters, setFilters } = useFilters();
  const [draft, setDraft] = useState<Filters>(filters);
  const set = (key: keyof Filters, value: string) => setDraft((d) => ({ ...d, [key]: value }));
  const toggle = (key: keyof Filters, value: string) => set(key, draft[key] === value ? "" : value);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={["bottom"]}>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 22 }} keyboardShouldPersistTaps="handled">
        <Group title="Trier par">
          <View style={styles.wrap}>
            {SORT_OPTIONS.map((o) => (
              <Chip key={o.value} label={o.label} active={draft.sort === o.value} onPress={() => set("sort", o.value)} />
            ))}
          </View>
        </Group>

        <Select label="Marque" value={draft.brand} options={brandOptions} onChange={(v) => set("brand", v)} allowClear searchable placeholder="Toutes les marques" />
        <Select label="Ville" value={draft.city} options={cityOptions} onChange={(v) => set("city", v)} allowClear searchable placeholder="Tout le Maroc" />

        <Group title="Prix (DH)">
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Field placeholder="Min" keyboardType="number-pad" value={draft.minPrice} onChangeText={(v) => set("minPrice", digits(v))} />
            </View>
            <View style={{ flex: 1 }}>
              <Field placeholder="Max" keyboardType="number-pad" value={draft.maxPrice} onChangeText={(v) => set("maxPrice", digits(v))} />
            </View>
          </View>
        </Group>

        <Group title="Année">
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Field placeholder="De" keyboardType="number-pad" maxLength={4} value={draft.minYear} onChangeText={(v) => set("minYear", digits(v))} />
            </View>
            <View style={{ flex: 1 }}>
              <Field placeholder="À" keyboardType="number-pad" maxLength={4} value={draft.maxYear} onChangeText={(v) => set("maxYear", digits(v))} />
            </View>
          </View>
        </Group>

        <Field label="Kilométrage max" placeholder="ex. 150000" keyboardType="number-pad" value={draft.maxMileage} onChangeText={(v) => set("maxMileage", digits(v))} />

        <Group title="Carburant">
          <View style={styles.wrap}>
            {FUEL_TYPES.map((o) => (
              <Chip key={o.value} label={o.label} active={draft.fuelType === o.value} onPress={() => toggle("fuelType", o.value)} />
            ))}
          </View>
        </Group>

        <Group title="Boîte de vitesses">
          <View style={styles.wrap}>
            {TRANSMISSIONS.map((o) => (
              <Chip key={o.value} label={o.label} active={draft.transmission === o.value} onPress={() => toggle("transmission", o.value)} />
            ))}
          </View>
        </Group>
      </ScrollView>

      <View style={styles.footer}>
        <Button title="Réinitialiser" variant="secondary" style={{ flex: 1 }} onPress={() => setDraft({ ...EMPTY_FILTERS, q: draft.q })} />
        <Button
          title="Voir les résultats"
          style={{ flex: 1.4 }}
          onPress={() => {
            setFilters(draft);
            router.back();
          }}
        />
      </View>
    </SafeAreaView>
  );
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={{ gap: 10 }}>
      <Text style={styles.groupTitle}>{title}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  row: { flexDirection: "row", gap: 10 },
  groupTitle: { color: colors.textMuted, fontSize: 13, fontWeight: "600" },
  footer: {
    flexDirection: "row",
    gap: 10,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.background,
  },
});
