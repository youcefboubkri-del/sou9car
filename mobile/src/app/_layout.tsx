import { DarkTheme, Stack, ThemeProvider } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AuthProvider } from "@/lib/auth";
import { FavoritesProvider } from "@/lib/favorites";
import { FiltersProvider } from "@/lib/filters";
import { colors } from "@/lib/theme";

const theme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: colors.primary,
    background: colors.background,
    card: colors.surface,
    text: colors.text,
    border: colors.border,
  },
};

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <ThemeProvider value={theme}>
        <AuthProvider>
          <FavoritesProvider>
            <FiltersProvider>
              <StatusBar style="light" />
              <Stack
                screenOptions={{
                  headerStyle: { backgroundColor: colors.background },
                  headerTintColor: colors.text,
                  headerTitleStyle: { fontWeight: "700" },
                  headerBackButtonDisplayMode: "minimal",
                  contentStyle: { backgroundColor: colors.background },
                }}
              >
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen name="listing/[id]" options={{ title: "", headerTransparent: true }} />
                <Stack.Screen name="conversation/[id]" options={{ title: "Conversation" }} />
                <Stack.Screen name="my-listings" options={{ title: "Mes annonces" }} />
                <Stack.Screen name="filters" options={{ title: "Filtres", presentation: "modal" }} />
                <Stack.Screen name="login" options={{ title: "Connexion", presentation: "modal" }} />
                <Stack.Screen name="register" options={{ title: "Créer un compte", presentation: "modal" }} />
              </Stack>
            </FiltersProvider>
          </FavoritesProvider>
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
