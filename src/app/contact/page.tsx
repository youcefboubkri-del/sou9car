"use client";

import { MainLayout } from "@/components/layout/main-layout";
import { useState } from "react";
import { Mail, Phone, MapPin, Send, CheckCircle } from "lucide-react";

const contacts = [
  { icon: Mail, label: "Email", value: "support@sou9car.ma", href: "mailto:support@sou9car.ma" },
  { icon: Phone, label: "Téléphone", value: "+212 5XX-XXX-XXX", href: "tel:+212500000000" },
  { icon: MapPin, label: "Adresse", value: "Casablanca, Maroc", href: "#" },
];

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
  }

  return (
    <MainLayout>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-14">
          <span className="inline-block text-orange-500 font-semibold text-sm tracking-widest uppercase mb-4">Contactez-nous</span>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">On est là pour vous aider</h1>
          <p className="text-white/50 text-lg max-w-xl mx-auto">
            Une question, un problème avec une annonce, ou juste envie de discuter ? On répond généralement en moins de 24h.
          </p>
        </div>

        <div className="grid lg:grid-cols-5 gap-10">
          {/* Contact info */}
          <div className="lg:col-span-2 space-y-5">
            {contacts.map((c) => (
              <a
                key={c.label}
                href={c.href}
                className="flex items-center gap-4 p-5 bg-surface rounded-2xl border border-white/[0.08] shadow-sm hover:border-orange-500/25 hover:shadow-md transition-all group"
              >
                <div className="w-11 h-11 bg-orange-500/10 rounded-xl flex items-center justify-center group-hover:bg-orange-500/15 transition-colors">
                  <c.icon className="w-5 h-5 text-orange-500" />
                </div>
                <div>
                  <p className="text-xs text-white/40 font-medium uppercase tracking-wide">{c.label}</p>
                  <p className="text-white/90 font-semibold">{c.value}</p>
                </div>
              </a>
            ))}

            <div className="bg-[#0a0a0a] rounded-2xl p-6 text-white">
              <p className="font-bold text-lg mb-2">Horaires</p>
              <p className="text-white/50 text-sm">Lun – Ven : 9h00 – 18h00</p>
              <p className="text-white/50 text-sm">Sam : 10h00 – 14h00</p>
              <p className="text-white/50 text-sm mt-2">Délai de réponse : &lt; 24h</p>
            </div>
          </div>

          {/* Form */}
          <div className="lg:col-span-3">
            {submitted ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-16 bg-surface rounded-2xl border border-white/[0.08] shadow-sm">
                <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
                <h2 className="text-2xl font-bold text-white mb-2">Message envoyé !</h2>
                <p className="text-white/50">Nous vous répondrons dans les 24 heures.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="bg-surface rounded-2xl border border-white/[0.08] shadow-sm p-8 space-y-5">
                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-white/75 mb-1.5">Votre nom</label>
                    <input
                      required
                      type="text"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="Mohammed Alami"
                      className="w-full px-4 py-3 rounded-xl border border-white/10 focus:outline-none focus:ring-2 focus:ring-orange-400/30 focus:border-orange-400 text-sm transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white/75 mb-1.5">Email</label>
                    <input
                      required
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="you@example.com"
                      className="w-full px-4 py-3 rounded-xl border border-white/10 focus:outline-none focus:ring-2 focus:ring-orange-400/30 focus:border-orange-400 text-sm transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/75 mb-1.5">Sujet</label>
                  <select
                    value={form.subject}
                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-white/10 focus:outline-none focus:ring-2 focus:ring-orange-400/30 focus:border-orange-400 text-sm bg-surface transition-all"
                  >
                    <option value="">Choisissez un sujet</option>
                    <option value="listing">Problème avec une annonce</option>
                    <option value="account">Aide compte</option>
                    <option value="payment">Paiement / Escrow</option>
                    <option value="inspection">Réserver une inspection</option>
                    <option value="other">Autre</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/75 mb-1.5">Message</label>
                  <textarea
                    required
                    rows={5}
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    placeholder="Décrivez votre problème ou votre question..."
                    className="w-full px-4 py-3 rounded-xl border border-white/10 focus:outline-none focus:ring-2 focus:ring-orange-400/30 focus:border-orange-400 text-sm resize-none transition-all"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full inline-flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-400 text-white font-bold py-3.5 rounded-xl transition-all hover:scale-[1.02] shadow-lg shadow-orange-500/20"
                >
                  <Send className="w-4 h-4" />
                  Envoyer le message
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
