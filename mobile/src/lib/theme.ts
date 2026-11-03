// Mirrors the web app's palette (src/app/globals.css).
export const colors = {
  background: "#050509",
  surface: "#0d0d15",
  surface2: "#12121c",
  elevated: "#181824",
  border: "rgba(255,255,255,0.08)",
  borderStrong: "rgba(255,255,255,0.16)",
  text: "#ffffff",
  textMuted: "rgba(255,255,255,0.6)",
  textFaint: "rgba(255,255,255,0.4)",
  primary: "#f97316",
  primaryLight: "#fb923c",
  primarySoft: "rgba(249,115,22,0.14)",
  success: "#22c55e",
  danger: "#ef4444",
  whatsapp: "#25D366",
};

export const radius = { sm: 8, md: 12, lg: 16, xl: 24, pill: 999 };

export const spacing = (n: number) => n * 4;
