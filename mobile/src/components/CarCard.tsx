import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { imageUrl } from "@/lib/api";
import { FUEL_TYPES, TRANSMISSIONS, labelOf } from "@/lib/constants";
import { formatMileage, formatPrice } from "@/lib/format";
import { colors, radius } from "@/lib/theme";
import type { ListingCard } from "@/lib/types";
import { FavoriteButton } from "./FavoriteButton";

export function CarCard({ listing }: { listing: ListingCard }) {
  const sold = listing.status === "SOLD";
  return (
    <Pressable
      onPress={() => router.push(`/listing/${listing.id}`)}
      style={({ pressed }) => [styles.card, pressed && { opacity: 0.9, transform: [{ scale: 0.99 }] }]}
    >
      <View>
        <Image
          source={imageUrl(listing.thumbnail)}
          style={styles.image}
          contentFit="cover"
          transition={200}
          placeholder={{ blurhash: "L03[%0IU00~q00xu00Rj00%M~qWB" }}
        />
        <View style={styles.badges}>
          {listing.isFeatured && (
            <View style={[styles.badge, { backgroundColor: colors.primary }]}>
              <Ionicons name="flash" size={11} color="#fff" />
              <Text style={styles.badgeText}>À la une</Text>
            </View>
          )}
          {sold && (
            <View style={[styles.badge, { backgroundColor: colors.danger }]}>
              <Text style={styles.badgeText}>Vendu</Text>
            </View>
          )}
          {listing.creditEnabled && !sold && (
            <View style={[styles.badge, { backgroundColor: "rgba(0,0,0,0.6)" }]}>
              <Text style={styles.badgeText}>Crédit</Text>
            </View>
          )}
        </View>
        <FavoriteButton listingId={listing.id} style={styles.fav} />
      </View>
      <View style={styles.body}>
        <Text style={styles.title} numberOfLines={1}>
          {listing.brand} {listing.model}
        </Text>
        <Text style={styles.price}>{formatPrice(listing.price)}</Text>
        <View style={styles.metaRow}>
          <Meta icon="calendar-outline" text={String(listing.year)} />
          <Meta icon="speedometer-outline" text={formatMileage(listing.mileage)} />
          <Meta icon="water-outline" text={labelOf(FUEL_TYPES, listing.fuelType) ?? ""} />
        </View>
        <View style={styles.metaRow}>
          <Meta icon="location-outline" text={listing.city} />
          <Meta icon="cog-outline" text={labelOf(TRANSMISSIONS, listing.transmission) ?? ""} />
        </View>
      </View>
    </Pressable>
  );
}

function Meta({ icon, text }: { icon: keyof typeof Ionicons.glyphMap; text: string }) {
  return (
    <View style={styles.meta}>
      <Ionicons name={icon} size={13} color={colors.textFaint} />
      <Text style={styles.metaText} numberOfLines={1}>
        {text}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden",
  },
  image: { width: "100%", aspectRatio: 16 / 10, backgroundColor: colors.surface2 },
  badges: { position: "absolute", top: 10, left: 10, flexDirection: "row", gap: 6 },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.pill,
  },
  badgeText: { color: "#fff", fontSize: 11, fontWeight: "700" },
  fav: { position: "absolute", top: 8, right: 8 },
  body: { padding: 14, gap: 6 },
  title: { color: colors.text, fontSize: 17, fontWeight: "700" },
  price: { color: colors.primary, fontSize: 19, fontWeight: "800" },
  metaRow: { flexDirection: "row", gap: 14, flexWrap: "wrap" },
  meta: { flexDirection: "row", alignItems: "center", gap: 4 },
  metaText: { color: colors.textMuted, fontSize: 13 },
});
