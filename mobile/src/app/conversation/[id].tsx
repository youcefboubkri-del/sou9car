import { Ionicons } from "@expo/vector-icons";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Alert, AppState, FlatList, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ErrorState, Loading } from "@/components/ui";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { clockTime, formatPrice } from "@/lib/format";
import { colors, radius } from "@/lib/theme";
import type { ConversationDetail, Message } from "@/lib/types";
import { useApi } from "@/lib/useApi";

const POLL_MS = 5000;

export default function ConversationScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const { data, setData, error, loading, reload, silentRefresh } = useApi<ConversationDetail>(`/api/conversations/${id}`);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const listRef = useRef<FlatList<Message>>(null);

  // No websocket on the backend yet: poll while the screen is open and the app is foregrounded.
  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | null = setInterval(() => void silentRefresh(), POLL_MS);
    const sub = AppState.addEventListener("change", (state) => {
      if (state === "active" && !timer) {
        void silentRefresh();
        timer = setInterval(() => void silentRefresh(), POLL_MS);
      } else if (state !== "active" && timer) {
        clearInterval(timer);
        timer = null;
      }
    });
    return () => {
      if (timer) clearInterval(timer);
      sub.remove();
    };
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) return <Loading />;
  if (error || !data) return <ErrorState message={error ?? "Conversation introuvable"} onRetry={reload} />;

  const { conversation, listing } = data;
  const other = conversation.buyerId === user?.id ? conversation.seller : conversation.buyer;
  const messages = [...conversation.messages].reverse(); // newest first for the inverted list

  async function send() {
    const content = text.trim();
    if (!content || sending || !data) return;
    setSending(true);
    try {
      const { message } = await api<{ message: Message }>(`/api/conversations/${id}`, { method: "POST", body: { content } });
      setText("");
      setData({ ...data, conversation: { ...data.conversation, messages: [...data.conversation.messages, message] } });
      listRef.current?.scrollToOffset({ offset: 0, animated: true });
    } catch (e) {
      Alert.alert("Envoi impossible", (e as Error).message);
    } finally {
      setSending(false);
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={["bottom"]}>
      <Stack.Screen options={{ title: other.name }} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined} keyboardVerticalOffset={90}>
        {listing && (
          <Pressable style={styles.listingBar} onPress={() => router.push(`/listing/${listing.id}`)}>
            <Ionicons name="car-sport" size={18} color={colors.primary} />
            <Text style={{ color: colors.text, fontWeight: "600", flex: 1 }} numberOfLines={1}>
              {listing.brand} {listing.model} {listing.year}
            </Text>
            <Text style={{ color: colors.primary, fontWeight: "800" }}>{formatPrice(listing.price)}</Text>
            <Ionicons name="chevron-forward" size={16} color={colors.textFaint} />
          </Pressable>
        )}
        <FlatList
          ref={listRef}
          data={messages}
          inverted
          keyExtractor={(m) => m.id}
          contentContainerStyle={{ padding: 16, gap: 8, flexGrow: 1 }}
          renderItem={({ item }) => {
            const mine = item.senderId === user?.id;
            return (
              <View style={[styles.bubble, mine ? styles.mine : styles.theirs]}>
                <Text style={{ color: colors.text, fontSize: 15, lineHeight: 20 }}>{item.content}</Text>
                <Text style={[styles.time, mine && { color: "rgba(255,255,255,0.75)" }]}>
                  {clockTime(item.createdAt)}
                  {mine && item.readAt ? " · Lu" : ""}
                </Text>
              </View>
            );
          }}
          ListEmptyComponent={
            <View style={{ flex: 1, alignItems: "center", justifyContent: "center", transform: [{ scaleY: -1 }] }}>
              <Text style={{ color: colors.textMuted, textAlign: "center" }}>
                Dites bonjour à {other.name} 👋{"\n"}Posez vos questions sur le véhicule.
              </Text>
            </View>
          }
        />
        <View style={styles.composer}>
          <TextInput
            value={text}
            onChangeText={setText}
            placeholder="Votre message…"
            placeholderTextColor={colors.textFaint}
            selectionColor={colors.primary}
            style={styles.input}
            multiline
            maxLength={2000}
          />
          <Pressable
            onPress={send}
            disabled={!text.trim() || sending}
            style={[styles.send, (!text.trim() || sending) && { opacity: 0.4 }]}
            accessibilityLabel="Envoyer"
          >
            <Ionicons name="send" size={18} color="#fff" />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  listingBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 12,
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  bubble: { maxWidth: "80%", paddingHorizontal: 14, paddingVertical: 9, borderRadius: 18, gap: 3 },
  mine: { alignSelf: "flex-end", backgroundColor: colors.primary, borderBottomRightRadius: 4 },
  theirs: { alignSelf: "flex-start", backgroundColor: colors.elevated, borderBottomLeftRadius: 4 },
  time: { color: colors.textFaint, fontSize: 11, alignSelf: "flex-end" },
  composer: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  input: {
    flex: 1,
    maxHeight: 120,
    minHeight: 44,
    backgroundColor: colors.surface2,
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    color: colors.text,
    fontSize: 15,
  },
  send: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
});
