"use client";

import Link from "next/link";
import { MapPin, Fuel, Gauge, ArrowRight, Car, Zap } from "lucide-react";
import { formatPrice, formatMileage, timeAgo } from "@/lib/utils";
import { motion, useMotionValue, useTransform, useSpring, useInView } from "framer-motion";
import { useRef } from "react";
import { FavoriteButton } from "@/components/ui/favorite-button";
import { useT } from "@/lib/i18n";

interface ListingCard {
  id: string;
  title: string;
  brand: string;
  model: string;
  year: number;
  mileage: number;
  price: number;
  fuelType: string;
  transmission: string;
  bodyType: string;
  city: string;
  thumbnail: string | null;
  createdAt: string;
  isFavorited?: boolean;
  isFeatured?: boolean;
  status?: string;
}

function proxyImg(url: string | null) {
  if (!url) return null;
  if (url.startsWith("/")) return url;
  return `/api/img?url=${encodeURIComponent(url)}`;
}

export function CarCard({ listing, index = 0 }: { listing: ListingCard; index?: number }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const inView = useInView(cardRef, { once: true, margin: "-60px" });
  const { t } = useT();

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateX = useSpring(useTransform(mouseY, [-100, 100], [8, -8]), { stiffness: 200, damping: 25 });
  const rotateY = useSpring(useTransform(mouseX, [-100, 100], [-8, 8]), { stiffness: 200, damping: 25 });
  const shadowX = useTransform(mouseX, [-100, 100], [-8, 8]);
  const shadowY = useTransform(mouseY, [-100, 100], [-8, 8]);

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect) return;
    mouseX.set(e.clientX - rect.left - rect.width / 2);
    mouseY.set(e.clientY - rect.top - rect.height / 2);
  }

  function handleMouseLeave() {
    mouseX.set(0);
    mouseY.set(0);
  }

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 50 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: (index % 6) * 0.08, ease: [0.22, 1, 0.36, 1] }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
        perspective: 800,
        boxShadow: useTransform(
          [shadowX, shadowY],
          ([x, y]) => `${x}px ${(y as number) + 8}px 32px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06)`
        ) as unknown as string,
      }}
      className="group relative rounded-2xl bg-surface border border-white/10 overflow-hidden cursor-pointer"
    >
      <Link href={`/listings/${listing.id}`} className="block">
        {/* Image */}
        <div className="h-52 bg-white/[0.06] relative overflow-hidden">
          {listing.thumbnail ? (
            <motion.img
              src={proxyImg(listing.thumbnail)!}
              alt={listing.title}
              className="w-full h-full object-cover"
              whileHover={{ scale: 1.08 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-white/[0.04] to-white/[0.08]">
              <div className="text-center">
                <Car className="w-12 h-12 mx-auto mb-2 text-white/15" />
                <span className="text-sm text-white/40">{t.card_no_photo}</span>
              </div>
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* SOLD overlay */}
          {listing.status === "SOLD" && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
              <div className="bg-red-600 text-white font-black text-xl px-6 py-2 rounded-xl rotate-[-8deg] shadow-2xl tracking-widest border-2 border-white/30">
                SOLD
              </div>
            </div>
          )}

          {/* Top-right: favorite + transmission */}
          <div className="absolute top-3 right-3 flex items-center gap-1.5">
            <FavoriteButton listingId={listing.id} initialFavorited={listing.isFavorited} />
            <div className="bg-black/55 backdrop-blur-sm px-2.5 py-1 rounded-lg text-xs font-bold text-white shadow-sm">
              {listing.transmission === "AUTOMATIC" ? t.card_auto : t.card_manual}
            </div>
          </div>

          {/* Year + featured badge */}
          <div className="absolute top-3 left-3 flex flex-col gap-1">
            <div className="bg-orange-500 px-2.5 py-1 rounded-lg text-xs font-bold text-white shadow-sm">
              {listing.year}
            </div>
            {listing.isFeatured && (
              <div className="bg-yellow-400 px-2.5 py-1 rounded-lg text-xs font-bold text-yellow-900 shadow-sm flex items-center gap-1">
                <Zap className="w-3 h-3" /> À la une
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-5">
          <h3 className="font-bold text-lg text-white truncate group-hover:text-orange-500 transition-colors">
            {listing.brand} {listing.model}
          </h3>

          <p className="text-2xl font-extrabold text-orange-500 mt-1">
            {formatPrice(listing.price)}
          </p>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 mt-3 text-sm text-white/50">
            <span className="flex items-center gap-1.5">
              <Gauge className="w-3.5 h-3.5 text-white/40" />
              {formatMileage(listing.mileage)}
            </span>
            <span className="flex items-center gap-1.5">
              <Fuel className="w-3.5 h-3.5 text-white/40" />
              {listing.fuelType}
            </span>
            <span className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-white/40" />
              {listing.city}
            </span>
          </div>

          <div className="mt-4 pt-4 border-t border-white/[0.08] flex items-center justify-between">
            <span className="text-xs text-white/40">{timeAgo(new Date(listing.createdAt))}</span>
            <motion.span
              className="flex items-center gap-1 text-sm font-semibold text-orange-500"
              whileHover={{ x: 4 }}
              transition={{ duration: 0.2 }}
            >
              {t.card_details} <ArrowRight className="w-3.5 h-3.5" />
            </motion.span>
          </div>
        </div>
      </Link>

      {/* Bottom glow line */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-500"
        initial={{ scaleX: 0 }}
        whileHover={{ scaleX: 1 }}
        transition={{ duration: 0.3 }}
      />
    </motion.div>
  );
}
