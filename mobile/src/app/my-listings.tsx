import { router, useFocusEffect } from "expo-router";
import { useCallback } from "react";
import { FlatList, RefreshControl, Text, View } from "react-native";
import { AuthGate } from "@/components/AuthGate";
import { CarCard } from "@/components/CarCard";
import { EmptyState, ErrorState, Loading } from "@/components/ui";
import { useAuth } from "@/lib/auth";
import { colors } from "@/lib/theme";
import type { ListingsResponse } from "@/lib/types";
import { useApi } from "@/lib/useApi";

const STATUS_LABELS: Record<string, string> = {
  ACTIVE: "En ligne",
  PENDING: "En attente de validation",
  SOLD: "Vendue",
  HIDDEN: "Masquée",
  REJECTED: "Refusée",
};

export default function MyListingsScreen() {
  return (
    <AuthGate icon="car-outline" title="Mes annonces" message="Connectez-vous pour gérer vos annonces.">
      <MyListings />
    </AuthGate>
  );
}

function MyListings() {
  const { user } = useAuth();
  const { data, error, loading, refreshing, refresh, reload, silentRefresh } = useApi<ListingsResponse>(
    user ? `/api/listings?sellerId=${user.id}&limit=50` : null
  );

  // Pick up status changes / deletions made on the detail screen.
  useFocusEffect(
    useCallback(() => {
      void silentRefresh();
    }, []) // eslint-disable-line react-hooks/exhaustive-deps
  );

  if (loading) return <Loading />;
  if (error) return <ErrorState message={error} onRetry={reload} />;

  return (
    <FlatList
      data={data?.listings ?? []}
      keyExtractor={(l) => l.id}
      contentContainerStyle={{ padding: 16, flexGrow: 1 }}
      ItemSeparatorComponent={() => <View style={{ height: 18 }} />}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={colors.primary} />}
      renderItem={({ item }) => (
        <View style={{ gap: 6 }}>
          <Text style={{ color: item.status === "ACTIVE" ? colors.success : colors.textMuted, fontWeight: "700", fontSize: 13 }}>
            ● {STATUS_LABELS[item.status] ?? item.status} · {item.views} vues
          </Text>
          <CarCard listing={item} />
        </View>
      )}
      ListEmptyComponent={
        <EmptyState
          icon="car-outline"
          title="Aucune annonce"
          message="Publiez votre première annonce en quelques minutes."
          action={{ label: "Vendre ma voiture", onPress: () => router.navigate("/sell") }}
        />
      }
    />
  );
}
