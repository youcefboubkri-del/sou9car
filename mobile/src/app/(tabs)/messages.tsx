import { router, useFocusEffect } from "expo-router";
import { useCallback } from "react";
import { FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from "react-native";
import { AuthGate } from "@/components/AuthGate";
import { EmptyState, ErrorState, Loading } from "@/components/ui";
import { useAuth } from "@/lib/auth";
import { timeAgo } from "@/lib/format";
import { colors } from "@/lib/theme";
import type { ConversationSummary } from "@/lib/types";
import { useApi } from "@/lib/useApi";

export default function MessagesScreen() {
  return (
    <AuthGate icon="chatbubbles-outline" title="Messagerie" message="Connectez-vous pour discuter avec les vendeurs et acheteurs.">
      <ConversationList />
    </AuthGate>
  );
}

function ConversationList() {
  const { user } = useAuth();
  const { data, error, loading, refreshing, refresh, reload, silentRefresh } = useApi<{ conversations: ConversationSummary[] }>(
    "/api/conversations"
  );

  useFocusEffect(
    useCallback(() => {
      void silentRefresh();
    }, []) // eslint-disable-line react-hooks/exhaustive-deps
  );

  if (loading) return <Loading />;
  if (error) return <ErrorState message={error} onRetry={reload} />;

  // Most recent activity first (API sorts by conversation creation).
  const conversations = [...(data?.conversations ?? [])].sort((a, b) => {
    const ta = a.messages[0]?.createdAt ?? a.createdAt;
    const tb = b.messages[0]?.createdAt ?? b.createdAt;
    return tb.localeCompare(ta);
  });

  return (
    <FlatList
      data={conversations}
      keyExtractor={(c) => c.id}
      contentContainerStyle={{ flexGrow: 1 }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={colors.primary} />}
      renderItem={({ item }) => {
        const other = item.buyerId === user?.id ? item.seller : item.buyer;
        const last = item.messages[0];
        const unread = item.unreadCount > 0;
        return (
          <Pressable
            onPress={() => router.push(`/conversation/${item.id}`)}
            style={({ pressed }) => [styles.row, pressed && { backgroundColor: colors.surface }]}
          >
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{other.name.charAt(0).toUpperCase()}</Text>
            </View>
            <View style={{ flex: 1, gap: 3 }}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", gap: 8 }}>
                <Text style={[styles.name, unread && { fontWeight: "800" }]} numberOfLines={1}>
                  {other.name}
                </Text>
                <Text style={styles.time}>{timeAgo(last?.createdAt ?? item.createdAt)}</Text>
              </View>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                <Text style={[styles.preview, unread && { color: colors.text }]} numberOfLines={1}>
                  {last ? `${last.senderId === user?.id ? "Vous : " : ""}${last.content}` : item.listingId ? "Nouvelle conversation" : "Support Sou9Car"}
                </Text>
                {unread && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{item.unreadCount}</Text>
                  </View>
                )}
              </View>
            </View>
          </Pressable>
        );
      }}
      ListEmptyComponent={
        <EmptyState
          icon="chatbubbles-outline"
          title="Aucune conversation"
          message="Contactez un vendeur depuis une annonce pour démarrer une discussion."
        />
      }
    />
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { color: colors.primary, fontSize: 20, fontWeight: "800" },
  name: { color: colors.text, fontSize: 16, fontWeight: "600", flex: 1 },
  time: { color: colors.textFaint, fontSize: 12 },
  preview: { color: colors.textMuted, fontSize: 14, flex: 1 },
  badge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 6,
  },
  badgeText: { color: "#fff", fontSize: 11, fontWeight: "800" },
});
