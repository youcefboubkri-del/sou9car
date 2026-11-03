import { router } from "expo-router";
import type { ReactNode } from "react";
import { useAuth } from "@/lib/auth";
import { EmptyState, Loading, type IconName } from "./ui";

// Renders children only when signed in; otherwise a prompt to log in.
export function AuthGate({ children, icon, title, message }: { children: ReactNode; icon: IconName; title: string; message: string }) {
  const { user, ready } = useAuth();
  if (!ready) return <Loading />;
  if (!user) {
    return <EmptyState icon={icon} title={title} message={message} action={{ label: "Se connecter", onPress: () => router.push("/login") }} />;
  }
  return <>{children}</>;
}
