import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { ActivityIndicator, FlatList, Pressable, RefreshControl, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { CarCard } from "@/components/CarCard";
import { EmptyState, ErrorState, Chip, Loading } from "@/components/ui";
import { api } from "@/lib/api";
import { BODY_TYPES, SORT_OPTIONS, labelOf } from "@/lib/constants";
import { activeFilterCount, EMPTY_FILTERS, filtersToQuery, useFilters } from "@/lib/filters";
import { colors, radius } from "@/lib/theme";
import type { ListingCard, ListingsResponse } from "@/lib/types";

export default function BrowseScreen() {
  const { filters, setFilters } = useFilters();
  const [search, setSearch] = useState(filters.q);
  const [prevQ, setPrevQ] = useState(filters.q);
  // Results are tagged with the query they answer; `loading` = no results yet for the current query.
  const query = filtersToQuery(filters, 1);
  const [result, setResult] = useState<{ query: string | null; items: ListingCard[]; total: number; page: number; totalPages: number; error: string | null }>(
    { query: null, items: [], total: 0, page: 1, totalPages: 1, error: null }
  );
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const requestId = useRef(0);

  // Keep the search box in sync if filters are reset elsewhere (adjust-state-during-render pattern).
  if (filters.q !== prevQ) {
    setPrevQ(filters.q);
    setSearch(filters.q);
  }

  const fetchPage = useCallback(
    (p: number, mode: "replace" | "append" | "refresh") => {
      const id = ++requestId.current;
      const key = filtersToQuery(filters, 1);
      return api<ListingsResponse>(`/api/listings?${filtersToQuery(filters, p)}`)
        .then((res) => {
          if (id !== requestId.current) return; // a newer search superseded this one
          setResult((prev) => ({
            query: key,
            items:
              mode === "append" && prev.query === key
                ? [...prev.items, ...res.listings.filter((l) => !prev.items.some((x) => x.id === l.id))]
                : res.listings,
            total: res.total,
            page: res.page,
            totalPages: res.totalPages,
            error: null,
          }));
        })
        .catch((e: Error) => {
          if (id !== requestId.current) return;
          // A failed "load more" keeps the list; a failed first load shows the error.
          setResult((prev) => (mode === "append" && prev.query === key ? prev : { ...prev, query: key, items: [], error: e.message }));
        })
        .finally(() => {
          // Each mode clears its own spinner, even if a newer request superseded it.
          if (mode === "append") setLoadingMore(false);
          if (mode === "refresh") setRefreshing(false);
        });
    },
    [filters]
  );

  useEffect(() => {
    void fetchPage(1, "replace");
  }, [fetchPage]);

  const loading = result.query !== query;
  const { items, total, page, totalPages, error } = result;
  const retry = () => {
    setResult((r) => ({ ...r, query: null }));
    void fetchPage(1, "replace");
  };

  const count = activeFilterCount(filters);
  const setFilter = (key: keyof typeof filters, value: string) => setFilters({ ...filters, [key]: value });

  const header = (
    <View style={{ gap: 14, paddingBottom: 14 }}>
      <View>
        <Text style={styles.brand}>
          Sou9<Text style={{ color: colors.primary }}>Car</Text>
        </Text>
        <Text style={styles.tagline}>Achetez et vendez votre voiture au Maroc</Text>
      </View>

      <View style={{ flexDirection: "row", gap: 10 }}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={18} color={colors.textFaint} />
          <TextInput
            value={search}
            onChangeText={setSearch}
            onSubmitEditing={() => setFilter("q", search)}
            returnKeyType="search"
            placeholder="Marque, modèle…"
            placeholderTextColor={colors.textFaint}
            selectionColor={colors.primary}
            style={styles.searchInput}
            autoCorrect={false}
          />
          {search ? (
            <Pressable
              hitSlop={10}
              onPress={() => {
                setSearch("");
                setFilter("q", "");
              }}
            >
              <Ionicons name="close-circle" size={18} color={colors.textFaint} />
            </Pressable>
          ) : null}
        </View>
        <Pressable style={styles.filterBtn} onPress={() => router.push("/filters")} accessibilityLabel="Filtres">
          <Ionicons name="options-outline" size={22} color={colors.text} />
          {count > 0 && (
            <View style={styles.filterBadge}>
              <Text style={styles.filterBadgeText}>{count}</Text>
            </View>
          )}
        </Pressable>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
        <Chip label="Tous" active={!filters.bodyType} onPress={() => setFilter("bodyType", "")} />
        {BODY_TYPES.map((b) => (
          <Chip
            key={b.value}
            label={b.label}
            active={filters.bodyType === b.value}
            onPress={() => setFilter("bodyType", filters.bodyType === b.value ? "" : b.value)}
          />
        ))}
      </ScrollView>

      {!loading && !error && (
        <View style={styles.resultsRow}>
          <Text style={styles.resultsText}>
            {total} annonce{total > 1 ? "s" : ""}
          </Text>
          <Text style={styles.resultsText}>{labelOf(SORT_OPTIONS, filters.sort)}</Text>
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={["top"]}>
      <FlatList
        data={loading || error ? [] : items}
        keyExtractor={(l) => l.id}
        renderItem={({ item }) => <CarCard listing={item} />}
        ItemSeparatorComponent={() => <View style={{ height: 14 }} />}
        ListHeaderComponent={header}
        contentContainerStyle={{ padding: 16, paddingBottom: 32, flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => {
              setRefreshing(true);
              void fetchPage(1, "refresh");
            }} tintColor={colors.primary} />
        }
        onEndReachedThreshold={0.5}
        onEndReached={() => {
          if (loading || loadingMore || page >= totalPages) return;
          setLoadingMore(true);
          void fetchPage(page + 1, "append");
        }}
        ListEmptyComponent={
          loading ? (
            <Loading />
          ) : error ? (
            <ErrorState message={error} onRetry={retry} />
          ) : (
            <EmptyState
              icon="car-outline"
              title="Aucune annonce trouvée"
              message="Essayez d'élargir vos critères de recherche."
              action={count || filters.q ? { label: "Réinitialiser les filtres", onPress: () => setFilters(EMPTY_FILTERS) } : undefined}
            />
          )
        }
        ListFooterComponent={loadingMore ? <ActivityIndicator style={{ marginTop: 16 }} color={colors.primary} /> : undefined}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  brand: { color: colors.text, fontSize: 30, fontWeight: "900", letterSpacing: -0.5 },
  tagline: { color: colors.textMuted, fontSize: 14, marginTop: 2 },
  searchBox: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: colors.surface2,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
    height: 48,
  },
  searchInput: { flex: 1, color: colors.text, fontSize: 15, height: "100%" },
  filterBtn: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    backgroundColor: colors.surface2,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  filterBadge: {
    position: "absolute",
    top: -4,
    right: -4,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  filterBadgeText: { color: "#fff", fontSize: 11, fontWeight: "800" },
  resultsRow: { flexDirection: "row", justifyContent: "space-between" },
  resultsText: { color: colors.textMuted, fontSize: 13 },
});
