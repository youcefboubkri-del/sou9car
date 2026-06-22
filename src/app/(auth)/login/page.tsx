"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Car, Loader2, Shield, CheckCircle, Eye, EyeOff } from "lucide-react";
import { motion } from "framer-motion";

const perks = [
  "Vendeurs vérifiés &amp; annonces réelles",
  "Paiements sécurisés par escrow",
  "Rapports d'historique complets",
  "Réservation d'inspection professionnelle",
];

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      router.push("/listings");
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#0a0a0a] relative overflow-hidden flex-col justify-between p-12">
        {/* Glow */}
        <div className="absolute top-[-20%] right-[-10%] w-96 h-96 bg-orange-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-[-15%] left-[-10%] w-72 h-72 bg-orange-600/10 rounded-full blur-3xl pointer-events-none" />
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage: "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
            backgroundSize: "50px 50px",
          }}
        />

        <Link href="/" className="relative z-10 flex items-center gap-2.5 font-bold text-xl text-white">
          <div className="w-9 h-9 bg-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/30">
            <Car className="w-5 h-5 text-white" />
          </div>
          Sou9<span className="text-orange-500">Car</span>
        </Link>

        <div className="relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            <h2 className="text-4xl font-bold text-white mb-4 leading-tight">
              La façon la plus sûre<br />d&apos;acheter ou vendre au Maroc.
            </h2>
            <p className="text-white/40 text-lg mb-10">Rejoignez des milliers d&apos;acheteurs et vendeurs vérifiés.</p>

            <ul className="space-y-4">
              {perks.map((perk, i) => (
                <motion.li
                  key={perk}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.1, duration: 0.5 }}
                  className="flex items-center gap-3 text-white/70 text-sm"
                >
                  <CheckCircle className="w-5 h-5 text-orange-500 flex-shrink-0" />
                  {perk}
                </motion.li>
              ))}
            </ul>
          </motion.div>
        </div>

        <div className="relative z-10 flex items-center gap-3">
          <Shield className="w-5 h-5 text-orange-500" />
          <p className="text-white/30 text-xs">Vos données sont chiffrées et jamais revendues à des tiers.</p>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-background">
        <div className="w-full max-w-md">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl mb-8 lg:hidden">
            <div className="w-8 h-8 bg-orange-500 rounded-xl flex items-center justify-center">
              <Car className="w-5 h-5 text-white" />
            </div>
            Sou9<span className="text-orange-500">Car</span>
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="bg-surface rounded-3xl shadow-xl border border-white/[0.08] p-8"
          >
            <h1 className="text-2xl font-bold text-white mb-1">Bon retour</h1>
            <p className="text-white/40 text-sm mb-7">Connectez-vous à votre compte Sou9Car</p>

            {error && (
              <div className="bg-red-500/10 border border-red-500/25 text-red-300 text-sm rounded-xl p-3 mb-5">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/75 mb-1.5">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400/30 focus:border-orange-400 text-sm transition-all bg-white/[0.04] focus:bg-white/10"
                  placeholder="votre@email.com"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/75 mb-1.5">Mot de passe</label>
                <div className="relative">
                  <input
                    type={showPw ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400/30 focus:border-orange-400 text-sm transition-all bg-white/[0.04] focus:bg-white/10 pr-11"
                    placeholder="Entrez votre mot de passe"
                    required
                  />
                  <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/60">
                    {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-orange-500 hover:bg-orange-400 text-white font-bold py-3 rounded-xl transition-all hover:scale-[1.02] shadow-lg shadow-orange-500/20 disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-2 mt-2"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                Se connecter
              </button>
            </form>

            <p className="text-center text-sm text-white/40 mt-6">
              Pas de compte ?{" "}
              <Link href="/register" className="text-orange-500 font-semibold hover:text-orange-400">
                Créer un compte gratuit
              </Link>
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
