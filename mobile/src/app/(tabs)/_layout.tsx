import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router/tabs";
import type { ColorValue } from "react-native";
import type { IconName } from "@/components/ui";
import { colors } from "@/lib/theme";

function icon(name: IconName, focusedName: IconName) {
  function TabIcon({ color, focused, size }: { color: ColorValue; focused: boolean; size: number }) {
    return <Ionicons name={focused ? focusedName : name} color={color as string} size={size} />;
  }
  return TabIcon;
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.text,
        headerTitleStyle: { fontWeight: "800" },
        headerShadowVisible: false,
        tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.border },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textFaint,
        sceneStyle: { backgroundColor: colors.background },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: "Annonces", headerShown: false, tabBarIcon: icon("car-sport-outline", "car-sport") }}
      />
      <Tabs.Screen name="favorites" options={{ title: "Favoris", tabBarIcon: icon("heart-outline", "heart") }} />
      <Tabs.Screen name="sell" options={{ title: "Vendre", tabBarIcon: icon("add-circle-outline", "add-circle") }} />
      <Tabs.Screen
        name="messages"
        options={{ title: "Messages", tabBarIcon: icon("chatbubbles-outline", "chatbubbles") }}
      />
      <Tabs.Screen name="profile" options={{ title: "Profil", tabBarIcon: icon("person-outline", "person") }} />
    </Tabs>
  );
}
