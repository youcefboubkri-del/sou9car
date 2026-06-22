"use client";

import { useState } from "react";
import { Heart } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";

interface FavoriteButtonProps {
  listingId: string;
  initialFavorited?: boolean;
  className?: string;
}

export function FavoriteButton({ listingId, initialFavorited = false, className = "" }: FavoriteButtonProps) {
  const [favorited, setFavorited] = useState(initialFavorited);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function toggle(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (loading) return;
    setLoading(true);

    try {
      const res = await fetch(`/api/favorites/${listingId}`, { method: "POST" });
      if (res.status === 401) {
        router.push("/login");
        return;
      }
      const data = await res.json();
      setFavorited(data.favorited);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }

  return (
    <motion.button
      onClick={toggle}
      whileTap={{ scale: 0.85 }}
      className={`relative flex items-center justify-center w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm shadow-md hover:bg-white/15 transition-colors ${className}`}
      aria-label={favorited ? "Remove from saved" : "Save car"}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={favorited ? "filled" : "empty"}
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.5, opacity: 0 }}
          transition={{ duration: 0.15 }}
        >
          <Heart
            className={`w-4 h-4 transition-colors ${
              favorited ? "fill-red-500 text-red-500" : "text-white/40"
            } ${loading ? "opacity-50" : ""}`}
          />
        </motion.div>
      </AnimatePresence>
    </motion.button>
  );
}
