import { Ionicons } from "@expo/vector-icons";
import { useState, type ComponentProps, type ReactNode } from "react";
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type StyleProp,
  type TextInputProps,
  type ViewStyle,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, radius } from "@/lib/theme";
import type { Option } from "@/lib/constants";

export type IconName = ComponentProps<typeof Ionicons>["name"];

export function Button({
  title,
  onPress,
  variant = "primary",
  icon,
  loading,
  disabled,
  style,
}: {
  title: string;
  onPress?: () => void;
  variant?: "primary" | "secondary" | "ghost" | "danger" | "whatsapp";
  icon?: IconName;
  loading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const bg = {
    primary: colors.primary,
    secondary: colors.elevated,
    ghost: "transparent",
    danger: "rgba(239,68,68,0.14)",
    whatsapp: colors.whatsapp,
  }[variant];
  const fg = variant === "danger" ? colors.danger : variant === "ghost" ? colors.primary : colors.text;
  const inactive = disabled || loading;
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      disabled={inactive}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: bg, opacity: inactive ? 0.5 : pressed ? 0.8 : 1 },
        variant === "secondary" && { borderWidth: 1, borderColor: colors.border },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={fg} />
      ) : (
        <>
          {icon && <Ionicons name={icon} size={18} color={fg} />}
          <Text style={[styles.buttonText, { color: fg }]}>{title}</Text>
        </>
      )}
    </Pressable>
  );
}

export function Field({ label, error, style, ...props }: TextInputProps & { label?: string; error?: string }) {
  return (
    <View style={{ gap: 6 }}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TextInput
        placeholderTextColor={colors.textFaint}
        selectionColor={colors.primary}
        style={[styles.input, props.multiline && { minHeight: 110, textAlignVertical: "top" }, style]}
        {...props}
      />
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

export function Chip({ label, active, onPress, icon }: { label: string; active?: boolean; onPress?: () => void; icon?: IconName }) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.chip, active && { backgroundColor: colors.primarySoft, borderColor: colors.primary }]}
    >
      {icon && <Ionicons name={icon} size={14} color={active ? colors.primaryLight : colors.textMuted} />}
      <Text style={[styles.chipText, active && { color: colors.primaryLight }]}>{label}</Text>
    </Pressable>
  );
}

// Tap-to-open picker for long option lists (brands, cities).
export function Select({
  label,
  value,
  options,
  onChange,
  placeholder = "Choisir…",
  allowClear,
  searchable,
}: {
  label?: string;
  value: string;
  options: Option[];
  onChange: (value: string) => void;
  placeholder?: string;
  allowClear?: boolean;
  searchable?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const current = options.find((o) => o.value === value);
  const filtered = query
    ? options.filter((o) => o.label.toLowerCase().includes(query.toLowerCase()))
    : options;

  return (
    <View style={{ gap: 6 }}>
      {label && <Text style={styles.label}>{label}</Text>}
      <Pressable style={[styles.input, styles.selectRow]} onPress={() => setOpen(true)}>
        <Text style={{ color: current ? colors.text : colors.textFaint, fontSize: 15 }}>
          {current?.label ?? placeholder}
        </Text>
        <Ionicons name="chevron-down" size={18} color={colors.textMuted} />
      </Pressable>
      <Modal visible={open} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setOpen(false)}>
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={["top", "bottom"]}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{label ?? "Choisir"}</Text>
            <Pressable onPress={() => setOpen(false)} hitSlop={12}>
              <Ionicons name="close" size={26} color={colors.text} />
            </Pressable>
          </View>
          {searchable && (
            <View style={{ paddingHorizontal: 16, paddingBottom: 8 }}>
              <Field placeholder="Rechercher…" value={query} onChangeText={setQuery} autoCorrect={false} />
            </View>
          )}
          <FlatList
            data={allowClear ? [{ label: "Tous", value: "" }, ...filtered] : filtered}
            keyExtractor={(o) => o.value || "__all"}
            keyboardShouldPersistTaps="handled"
            renderItem={({ item }) => (
              <Pressable
                style={({ pressed }) => [styles.optionRow, pressed && { backgroundColor: colors.surface2 }]}
                onPress={() => {
                  onChange(item.value);
                  setQuery("");
                  setOpen(false);
                }}
              >
                <Text style={{ color: colors.text, fontSize: 16 }}>{item.label}</Text>
                {item.value === value && <Ionicons name="checkmark" size={20} color={colors.primary} />}
              </Pressable>
            )}
          />
        </SafeAreaView>
      </Modal>
    </View>
  );
}

export function Card({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function SectionTitle({ children }: { children: ReactNode }) {
  return <Text style={styles.sectionTitle}>{children}</Text>;
}

export function Loading() {
  return (
    <View style={styles.center}>
      <ActivityIndicator size="large" color={colors.primary} />
    </View>
  );
}

export function EmptyState({
  icon,
  title,
  message,
  action,
}: {
  icon: IconName;
  title: string;
  message?: string;
  action?: { label: string; onPress: () => void };
}) {
  return (
    <View style={[styles.center, { padding: 32, gap: 12 }]}>
      <View style={styles.emptyIcon}>
        <Ionicons name={icon} size={32} color={colors.primary} />
      </View>
      <Text style={{ color: colors.text, fontSize: 18, fontWeight: "700", textAlign: "center" }}>{title}</Text>
      {message && <Text style={{ color: colors.textMuted, textAlign: "center", lineHeight: 20 }}>{message}</Text>}
      {action && <Button title={action.label} onPress={action.onPress} style={{ marginTop: 8, alignSelf: "stretch" }} />}
    </View>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <EmptyState
      icon="cloud-offline-outline"
      title="Oups…"
      message={message}
      action={onRetry ? { label: "Réessayer", onPress: onRetry } : undefined}
    />
  );
}

export const styles = StyleSheet.create({
  button: {
    minHeight: 50,
    borderRadius: radius.md,
    paddingHorizontal: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  buttonText: { fontSize: 16, fontWeight: "700" },
  label: { color: colors.textMuted, fontSize: 13, fontWeight: "600" },
  input: {
    backgroundColor: colors.surface2,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: 14,
    paddingVertical: 13,
    color: colors.text,
    fontSize: 15,
  },
  selectRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  errorText: { color: colors.danger, fontSize: 13 },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  chipText: { color: colors.textMuted, fontSize: 14, fontWeight: "600" },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
  },
  sectionTitle: { color: colors.text, fontSize: 17, fontWeight: "800", marginBottom: 10 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  emptyIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
  },
  modalTitle: { color: colors.text, fontSize: 20, fontWeight: "800" },
  optionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 15,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
});
