import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Alert, FlatList, Linking, Platform, Pressable, ScrollView, Share, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { FavoriteButton } from "@/components/FavoriteButton";
import { Button, Card, ErrorState, Loading, SectionTitle } from "@/components/ui";
import { api, API_URL, imageUrl } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import {
  AIR_CONDITIONING,
  BODY_TYPES,
  CONDITIONS,
  DRIVE_TYPES,
  FUEL_TYPES,
  PLATFORM_PHONE,
  TRANSMISSIONS,
  labelOf,
} from "@/lib/constants";
import { formatMileage, formatPrice, timeAgo, toInternational } from "@/lib/format";
import { colors, radius } from "@/lib/theme";
import type { ListingDetail } from "@/lib/types";
import { useApi } from "@/lib/useApi";

export default function ListingScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const { data, error, loading, reload, setData } = useApi<{ listing: ListingDetail }>(`/api/listings/${id}`);
  const { width } = useWindowDimensions();
  const [imageIndex, setImageIndex] = useState(0);
  const [contacting, setContacting] = useState(false);

  if (loading) return <Loading />;
  if (error || !data) return <ErrorState message={error ?? "Annonce introuvable"} onRetry={reload} />;

  const l = data.listing;
  const isOwner = user?.id === l.sellerId;
  const verified = l.seller.sellerVerification?.status === "APPROVED";
  const shareUrl = `${API_URL}/listings/${l.id}`;

  const specs: [string, string | undefined | null][] = [
    ["Année", String(l.year)],
    ["Kilométrage", formatMileage(l.mileage)],
    ["Carburant", labelOf(FUEL_TYPES, l.fuelType)],
    ["Boîte", labelOf(TRANSMISSIONS, l.transmission)],
    ["Carrosserie", labelOf(BODY_TYPES, l.bodyType)],
    ["État", labelOf(CONDITIONS, l.condition)],
    ["Transmission", labelOf(DRIVE_TYPES, l.driveType)],
    ["Puissance", l.performanceHp ? `${l.performanceHp} ch` : l.power],
    ["Moteur", l.engineSize],
    ["Consommation", l.fuelConsumption],
    ["Couleur", l.color],
    ["Intérieur", l.interior],
    ["Portes", l.doors?.toString()],
    ["Places", l.seats?.toString()],
    ["Climatisation", labelOf(AIR_CONDITIONING, l.airConditioning)],
    ["Propriétaires", l.numberOfOwners?.toString()],
    ["1ère immatriculation", l.firstRegistration],
  ];

  const tags = [
    l.hasWarranty && "Garantie",
    l.isImport && "Importée",
    l.isVintage && "Collection",
    l.isDamaged && "Accidentée",
    l.creditEnabled && "Crédit possible",
  ].filter(Boolean) as string[];

  function whatsapp() {
    const phone = toInternational(l.seller.phone || PLATFORM_PHONE);
    const text = `Bonjour, je suis intéressé par l'annonce Sou9Car :\n🚗 ${l.brand} ${l.model} ${l.year}\n💰 ${formatPrice(l.price)}\n📍 ${l.city}\n${shareUrl}`;
    void Linking.openURL(`https://wa.me/${phone}?text=${encodeURIComponent(text)}`);
  }

  async function message() {
    if (!user) return router.push("/login");
    setContacting(true);
    try {
      const { conversation } = await api<{ conversation: { id: string } }>("/api/conversations", {
        method: "POST",
        body: { sellerId: l.sellerId, listingId: l.id },
      });
      router.push(`/conversation/${conversation.id}`);
    } catch (e) {
      Alert.alert("Message", (e as Error).message);
    } finally {
      setContacting(false);
    }
  }

  async function setStatus(status: "SOLD" | "ACTIVE") {
    try {
      const { listing } = await api<{ listing: ListingDetail }>(`/api/listings/${l.id}`, { method: "PUT", body: { status } });
      setData({ listing: { ...l, status: listing.status } });
    } catch (e) {
      Alert.alert("Erreur", (e as Error).message);
    }
  }

  function confirmDelete() {
    Alert.alert("Supprimer l'annonce ?", "Cette action est définitive.", [
      { text: "Annuler", style: "cancel" },
      {
        text: "Supprimer",
        style: "destructive",
        onPress: async () => {
          try {
            await api(`/api/listings/${l.id}`, { method: "DELETE" });
            router.back();
          } catch (e) {
            Alert.alert("Erreur", (e as Error).message);
          }
        },
      },
    ]);
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Stack.Screen
        options={{
          headerRight: () => (
            <View style={{ flexDirection: "row", gap: 8, paddingRight: Platform.OS === "web" ? 12 : 0 }}>
              <Pressable
                style={styles.headerBtn}
                onPress={() => Share.share({ message: `${l.brand} ${l.model} ${l.year} — ${formatPrice(l.price)}\n${shareUrl}` })}
                accessibilityLabel="Partager"
              >
                <Ionicons name="share-outline" size={20} color="#fff" />
              </Pressable>
              <FavoriteButton listingId={l.id} />
            </View>
          ),
        }}
      />
      <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
        <View>
          <FlatList
            data={l.images.length ? l.images : [{ id: "none", url: "", order: 0 }]}
            keyExtractor={(img) => img.id}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(e) => setImageIndex(Math.round(e.nativeEvent.contentOffset.x / width))}
            renderItem={({ item }) => (
              <Image
                source={imageUrl(item.url)}
                style={{ width, height: width * 0.75, backgroundColor: colors.surface2 }}
                contentFit="cover"
                transition={200}
              />
            )}
          />
          {l.images.length > 1 && (
            <View style={styles.counter}>
              <Text style={styles.counterText}>
                {imageIndex + 1}/{l.images.length}
              </Text>
            </View>
          )}
          {l.status === "SOLD" && (
            <View style={styles.soldBanner}>
              <Text style={styles.soldText}>VENDU</Text>
            </View>
          )}
        </View>

        <View style={{ padding: 16, gap: 16 }}>
          <View style={{ gap: 6 }}>
            <Text style={styles.title}>
              {l.brand} {l.model} {l.year}
            </Text>
            <Text style={styles.price}>{formatPrice(l.price)}</Text>
            <View style={styles.metaRow}>
              <Ionicons name="location-outline" size={14} color={colors.textMuted} />
              <Text style={styles.meta}>{l.city}</Text>
              <Text style={styles.meta}>·</Text>
              <Text style={styles.meta}>{timeAgo(l.createdAt)}</Text>
              <Text style={styles.meta}>·</Text>
              <Ionicons name="eye-outline" size={14} color={colors.textMuted} />
              <Text style={styles.meta}>{l.views}</Text>
            </View>
            {tags.length > 0 && (
              <View style={styles.tags}>
                {tags.map((t) => (
                  <View key={t} style={styles.tag}>
                    <Text style={styles.tagText}>{t}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>

          {l.creditEnabled && l.creditMonths ? (
            <Card style={{ borderColor: colors.primary, backgroundColor: colors.primarySoft }}>
              <Text style={{ color: colors.primaryLight, fontWeight: "700" }}>Crédit disponible</Text>
              <Text style={{ color: colors.text, marginTop: 4 }}>
                {l.creditDownPayment ? `Apport ${formatPrice(l.creditDownPayment)} · ` : ""}
                {l.creditMonths} mois
                {l.creditInterestRate ? ` · ${l.creditInterestRate}%` : " · 0%"}
              </Text>
            </Card>
          ) : null}

          <Card>
            <SectionTitle>Caractéristiques</SectionTitle>
            <View style={styles.specGrid}>
              {specs
                .filter(([, v]) => v)
                .map(([k, v]) => (
                  <View key={k} style={styles.spec}>
                    <Text style={styles.specLabel}>{k}</Text>
                    <Text style={styles.specValue}>{v}</Text>
                  </View>
                ))}
            </View>
          </Card>

          {l.description ? (
            <Card>
              <SectionTitle>Description</SectionTitle>
              <Text style={{ color: colors.textMuted, lineHeight: 22 }}>{l.description}</Text>
            </Card>
          ) : null}

          {l.vehicleHistory && (
            <Card>
              <SectionTitle>Historique</SectionTitle>
              <Text style={styles.historyRow}>VIN : {l.vehicleHistory.vinNumber}</Text>
              {l.vehicleHistory.importedFrom && <Text style={styles.historyRow}>Importée de : {l.vehicleHistory.importedFrom}</Text>}
              <Text style={styles.historyRow}>
                Kilométrage {l.vehicleHistory.mileageVerified ? "vérifié ✓" : "non vérifié"}
              </Text>
            </Card>
          )}

          <Card>
            <SectionTitle>Vendeur</SectionTitle>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
              <View style={styles.avatar}>
                {l.seller.avatarUrl ? (
                  <Image source={imageUrl(l.seller.avatarUrl)} style={StyleSheet.absoluteFill} />
                ) : (
                  <Text style={styles.avatarText}>{l.seller.name.charAt(0).toUpperCase()}</Text>
                )}
              </View>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                  <Text style={{ color: colors.text, fontWeight: "700", fontSize: 16 }}>{l.seller.name}</Text>
                  {verified && <Ionicons name="shield-checkmark" size={16} color={colors.success} />}
                </View>
                <Text style={{ color: colors.textMuted, fontSize: 13 }}>
                  {verified ? "Vendeur vérifié · " : ""}Membre depuis {new Date(l.seller.createdAt).getFullYear()}
                </Text>
              </View>
            </View>
          </Card>

          {isOwner && (
            <Card style={{ gap: 10 }}>
              <SectionTitle>Gérer mon annonce</SectionTitle>
              {l.status === "SOLD" ? (
                <Button title="Remettre en vente" variant="secondary" icon="refresh" onPress={() => setStatus("ACTIVE")} />
              ) : (
                <Button title="Marquer comme vendue" variant="secondary" icon="checkmark-done" onPress={() => setStatus("SOLD")} />
              )}
              <Button title="Supprimer l'annonce" variant="danger" icon="trash-outline" onPress={confirmDelete} />
            </Card>
          )}

          <View style={styles.safety}>
            <Ionicons name="shield-outline" size={18} color={colors.textMuted} />
            <Text style={{ color: colors.textMuted, flex: 1, fontSize: 13, lineHeight: 18 }}>
              Ne versez jamais d&apos;argent avant d&apos;avoir vu le véhicule. Utilisez le paiement sécurisé Sou9Car.
            </Text>
          </View>
        </View>
      </ScrollView>

      {!isOwner && (
        <SafeAreaView edges={["bottom"]} style={styles.bottomBar}>
          <Button title="Message" icon="chatbubble-outline" variant="secondary" style={{ flex: 1 }} loading={contacting} onPress={message} />
          {l.seller.phone ? (
            <Button
              title="Appeler"
              icon="call-outline"
              variant="secondary"
              style={{ flex: 1 }}
              onPress={() => Linking.openURL(`tel:${l.seller.phone}`)}
            />
          ) : null}
          <Button title="WhatsApp" icon="logo-whatsapp" variant="whatsapp" style={{ flex: 1.2 }} onPress={whatsapp} />
        </SafeAreaView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  headerBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(0,0,0,0.55)",
    alignItems: "center",
    justifyContent: "center",
  },
  counter: {
    position: "absolute",
    bottom: 12,
    right: 12,
    backgroundColor: "rgba(0,0,0,0.6)",
    borderRadius: radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  counterText: { color: "#fff", fontSize: 12, fontWeight: "700" },
  soldBanner: {
    position: "absolute",
    bottom: 12,
    left: 12,
    backgroundColor: colors.danger,
    borderRadius: radius.sm,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  soldText: { color: "#fff", fontWeight: "900", letterSpacing: 1 },
  title: { color: colors.text, fontSize: 24, fontWeight: "800" },
  price: { color: colors.primary, fontSize: 26, fontWeight: "900" },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 5, flexWrap: "wrap" },
  meta: { color: colors.textMuted, fontSize: 13 },
  tags: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 4 },
  tag: { backgroundColor: colors.elevated, borderRadius: radius.pill, paddingHorizontal: 10, paddingVertical: 4 },
  tagText: { color: colors.text, fontSize: 12, fontWeight: "600" },
  specGrid: { flexDirection: "row", flexWrap: "wrap", rowGap: 14 },
  spec: { width: "50%", paddingRight: 8 },
  specLabel: { color: colors.textFaint, fontSize: 12 },
  specValue: { color: colors.text, fontSize: 15, fontWeight: "600", marginTop: 2 },
  historyRow: { color: colors.textMuted, marginBottom: 4 },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  avatarText: { color: colors.primary, fontSize: 20, fontWeight: "800" },
  safety: {
    flexDirection: "row",
    gap: 10,
    padding: 14,
    borderRadius: radius.md,
    backgroundColor: colors.surface2,
  },
  bottomBar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
});
