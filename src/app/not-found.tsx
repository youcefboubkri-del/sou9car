import Link from "next/link";
import { Car, Search, Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center px-4 relative overflow-hidden">
      {/* Glow blobs */}
      <div className="absolute top-[-20%] right-[-10%] w-96 h-96 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-20%] left-[-10%] w-80 h-80 bg-orange-600/8 rounded-full blur-3xl pointer-events-none" />
      <div
        className="absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage: "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      <div className="relative z-10 text-center">
        {/* Logo */}
        <Link href="/" className="inline-flex items-center gap-2.5 font-bold text-xl text-white mb-12">
          <div className="w-9 h-9 bg-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/30">
            <Car className="w-5 h-5 text-white" />
          </div>
          Sou9<span className="text-orange-500">Car</span>
        </Link>

        <p className="text-8xl font-black text-white/5 mb-0 leading-none select-none">404</p>
        <div className="-mt-4">
          <h1 className="text-3xl font-bold text-white mb-3">Page introuvable</h1>
          <p className="text-white/40 text-lg mb-10 max-w-sm mx-auto">
            Cette page n&apos;existe pas ou a été supprimée. Revenons sur la bonne voie.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-white/10 border border-white/15 text-white font-semibold px-6 py-3 rounded-xl hover:bg-white/15 transition-all"
          >
            <Home className="w-4 h-4" /> Accueil
          </Link>
          <Link
            href="/listings"
            className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-400 text-white font-bold px-6 py-3 rounded-xl shadow-lg shadow-orange-500/30 transition-all"
          >
            <Search className="w-4 h-4" /> Parcourir les voitures
          </Link>
        </div>
      </div>
    </div>
  );
}
