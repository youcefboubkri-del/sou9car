import { router, useFocusEffect } from "expo-router";
import { useCallback, useEffect, useRef } from "react";
import { FlatList, RefreshControl, View } from "react-native";
import { AuthGate } from "@/components/AuthGate";
import { CarCard } from "@/components/CarCard";
import { EmptyState, ErrorState, Loading } from "@/components/ui";
import { useFavorites } from "@/lib/favorites";
import { colors } from "@/lib/theme";
import type { ListingCard } from "@/lib/types";
import { useApi } from "@/lib/useApi";

export default function FavoritesScreen() {
  return (
    <AuthGate icon="heart-outline" title="Vos favoris" message="Connectez-vous pour sauvegarder les voitures qui vous plaisent.">
      <FavoritesList />
    </AuthGate>
  );
}

function FavoritesList() {
  const { ids, version } = useFavorites();
  const { data, error, loading, refreshing, refresh, reload, silentRefresh } = useApi<{ listings: ListingCard[] }>(
    "/api/favorites?expand=1"
  );

  // Refetch when a favorite is toggled anywhere, and when the tab regains focus.
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    void silentRefresh();
  }, [version]); // eslint-disable-line react-hooks/exhaustive-deps
  useFocusEffect(
    useCallback(() => {
      void silentRefresh();
    }, []) // eslint-disable-line react-hooks/exhaustive-deps
  );

  if (loading) return <Loading />;
  if (error) return <ErrorState message={error} onRetry={reload} />;

  // Hide un-favorited cards immediately, before the refetch lands.
  const listings = (data?.listings ?? []).filter((l) => ids.has(l.id));

  return (
    <FlatList
      data={listings}
      keyExtractor={(l) => l.id}
      renderItem={({ item }) => <CarCard listing={item} />}
      ItemSeparatorComponent={() => <View style={{ height: 14 }} />}
      contentContainerStyle={{ padding: 16, flexGrow: 1 }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={colors.primary} />}
      ListEmptyComponent={
        <EmptyState
          icon="heart-outline"
          title="Aucun favori"
          message="Touchez le cœur sur une annonce pour la retrouver ici."
          action={{ label: "Parcourir les annonces", onPress: () => router.navigate("/") }}
        />
      }
    />
  );
}
