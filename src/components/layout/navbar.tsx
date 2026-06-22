"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Car, Menu, X, User, Heart, LogOut, Zap, Shield, Building2, ClipboardCheck, Wallet, MessageCircle, CalendarCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useT } from "@/lib/i18n";

interface NavbarProps {
  user?: {
    id: string;
    name: string;
    email: string;
    role: string;
  } | null | undefined;
}

export function Navbar({ user }: NavbarProps) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const { lang, setLang, t } = useT();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Poll unread message count every 15s when logged in
  useEffect(() => {
    if (!user) return;
    const fetchUnread = () =>
      fetch("/api/conversations")
        .then((r) => r.json())
        .then((d) => {
          const total = (d.conversations ?? []).reduce(
            (sum: number, c: { unreadCount: number }) => sum + c.unreadCount, 0
          );
          setUnreadCount(total);
        })
        .catch(() => {});
    fetchUnread();
    const interval = setInterval(fetchUnread, 15000);
    return () => clearInterval(interval);
  }, [user]);

  const links = [
    { href: "/listings", label: t.nav_browse },
    { href: "/listings/create", label: t.nav_sell },
    { href: "/estimateur", label: t.nav_estimateur },
    { href: "/blog", label: t.nav_blog },
  ];

  const LangToggle = () => (
    <button
      onClick={() => setLang(lang === "fr" ? "ar" : "fr")}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/20 hover:border-orange-500/50 transition-all bg-white/[0.04] hover:bg-white/[0.08]"
    >
      <span className={`flex items-center gap-1 text-xs font-bold transition-all ${lang === "fr" ? "text-white" : "text-white/35"}`}>
        <span className="text-base leading-none">🇫🇷</span>
        <span>FR</span>
      </span>
      <span className="text-white/20 text-xs">|</span>
      <span className={`flex items-center gap-1 text-xs font-bold transition-all ${lang === "ar" ? "text-white" : "text-white/35"}`}>
        <span className="text-base leading-none">🇲🇦</span>
        <span>عر</span>
      </span>
    </button>
  );

  return (
    <motion.nav
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "sticky top-0 z-50 transition-all duration-500",
        scrolled
          ? "bg-black/80 backdrop-blur-xl border-b border-white/10 shadow-lg shadow-black/30"
          : "bg-transparent border-b border-white/5"
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 font-bold text-xl group">
            <motion.div
              whileHover={{ rotate: [0, -10, 10, 0], scale: 1.1 }}
              transition={{ duration: 0.4 }}
              className="w-8 h-8 bg-orange-500 rounded-xl flex items-center justify-center shadow-md shadow-orange-500/30"
            >
              <Car className="w-5 h-5 text-white" />
            </motion.div>
            <span className="text-white">Sou9<span className="text-orange-500">Car</span></span>
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-1">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "relative px-4 py-2 rounded-xl text-sm font-medium transition-colors",
                  pathname === link.href
                    ? "text-orange-500"
                    : "text-white/50 hover:text-white hover:bg-white/5"
                )}
              >
                {link.label}
                {pathname === link.href && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="absolute inset-0 bg-orange-500/10 rounded-xl -z-10 border border-orange-500/20"
                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
                  />
                )}
              </Link>
            ))}
          </div>

          {/* Desktop auth */}
          <div className="hidden md:flex items-center gap-3">
            <LangToggle />
            {user ? (
              <div className="relative">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-white/[0.06] transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center text-sm font-bold shadow-md shadow-orange-500/25">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm font-medium text-white/75">{user.name}</span>
                </motion.button>

                <AnimatePresence>
                  {profileOpen && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setProfileOpen(false)} />
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.95 }}
                        transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                        className="absolute right-0 mt-2 w-56 bg-surface rounded-2xl shadow-xl border border-white/[0.08] py-2 z-20"
                      >
                        <div className="px-4 py-2 border-b border-white/[0.08]">
                          <p className="text-sm font-semibold text-white">{user.name}</p>
                          <p className="text-xs text-white/40">{user.email}</p>
                        </div>
                        <Link href="/dashboard" className="flex items-center gap-2 px-4 py-2.5 text-sm text-white/75 hover:bg-orange-500/10 hover:text-orange-400 transition-colors" onClick={() => setProfileOpen(false)}>
                          <User className="w-4 h-4" /> {t.nav_dashboard}
                        </Link>
                        {(user.role === "ADMIN" || user.role === "INSPECTOR") && (
                          <Link href="/inspector" className="flex items-center gap-2 px-4 py-2.5 text-sm text-white/75 hover:bg-orange-500/10 hover:text-orange-400 transition-colors" onClick={() => setProfileOpen(false)}>
                            <ClipboardCheck className="w-4 h-4" /> Panneau inspecteur
                          </Link>
                        )}
                        {user.role === "ADMIN" && (
                          <Link href="/admin" className="flex items-center gap-2 px-4 py-2.5 text-sm text-white/75 hover:bg-orange-500/10 hover:text-orange-400 transition-colors" onClick={() => setProfileOpen(false)}>
                            <Shield className="w-4 h-4" /> {t.nav_admin}
                          </Link>
                        )}
                        <Link href="/messages" className="flex items-center gap-2 px-4 py-2.5 text-sm text-white/75 hover:bg-orange-500/10 hover:text-orange-400 transition-colors" onClick={() => setProfileOpen(false)}>
                          <MessageCircle className="w-4 h-4" />
                          {t.nav_messages}
                          {unreadCount > 0 && (
                            <span className="ml-auto bg-orange-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                              {unreadCount}
                            </span>
                          )}
                        </Link>
                        <Link href="/favorites" className="flex items-center gap-2 px-4 py-2.5 text-sm text-white/75 hover:bg-orange-500/10 hover:text-orange-400 transition-colors" onClick={() => setProfileOpen(false)}>
                          <Heart className="w-4 h-4" /> {t.nav_favorites}
                        </Link>
                        <div className="border-t border-white/[0.08] my-1" />
                        <p className="px-4 py-1 text-xs font-bold text-white/40 uppercase tracking-widest">Outils vendeur</p>
                        <Link href="/boost" className="flex items-center gap-2 px-4 py-2.5 text-sm text-white/75 hover:bg-orange-500/10 hover:text-orange-400 transition-colors" onClick={() => setProfileOpen(false)}>
                          <Zap className="w-4 h-4" /> {t.footer_boost}
                        </Link>
                        <Link href="/verify" className="flex items-center gap-2 px-4 py-2.5 text-sm text-white/75 hover:bg-orange-500/10 hover:text-orange-400 transition-colors" onClick={() => setProfileOpen(false)}>
                          <Shield className="w-4 h-4" /> {t.nav_verify}
                        </Link>
                        <Link href="/dealership" className="flex items-center gap-2 px-4 py-2.5 text-sm text-white/75 hover:bg-orange-500/10 hover:text-orange-400 transition-colors" onClick={() => setProfileOpen(false)}>
                          <Building2 className="w-4 h-4" /> Compte concessionnaire
                        </Link>
                        <Link href="/inspections" className="flex items-center gap-2 px-4 py-2.5 text-sm text-white/75 hover:bg-orange-500/10 hover:text-orange-400 transition-colors" onClick={() => setProfileOpen(false)}>
                          <ClipboardCheck className="w-4 h-4" /> Inspections
                        </Link>
                        <Link href="/reservations" className="flex items-center gap-2 px-4 py-2.5 text-sm text-white/75 hover:bg-orange-500/10 hover:text-orange-400 transition-colors" onClick={() => setProfileOpen(false)}>
                          <CalendarCheck className="w-4 h-4" /> {t.nav_reservations}
                        </Link>
                        <Link href="/escrow" className="flex items-center gap-2 px-4 py-2.5 text-sm text-white/75 hover:bg-orange-500/10 hover:text-orange-400 transition-colors" onClick={() => setProfileOpen(false)}>
                          <Wallet className="w-4 h-4" /> {t.nav_escrow}
                        </Link>
                        <Link href="/wallet" className="flex items-center gap-2 px-4 py-2.5 text-sm text-white/75 hover:bg-orange-500/10 hover:text-orange-400 transition-colors" onClick={() => setProfileOpen(false)}>
                          <Wallet className="w-4 h-4" /> Solde & Portefeuille
                        </Link>
                        <div className="border-t border-white/[0.08] my-1" />
                        <button
                          onClick={async () => { await fetch("/api/auth/logout", { method: "POST" }); window.location.href = "/"; }}
                          className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-red-500 hover:bg-red-500/10 transition-colors"
                        >
                          <LogOut className="w-4 h-4" /> {t.nav_logout}
                        </button>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login" className="text-sm font-medium text-white/60 hover:text-white px-3 py-2 rounded-xl hover:bg-white/5 transition-colors">
                  {t.nav_login}
                </Link>
                <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
                  <Link
                    href="/register"
                    className="text-sm font-bold bg-orange-500 hover:bg-orange-400 text-white px-5 py-2.5 rounded-xl shadow-md shadow-orange-500/25 hover:shadow-orange-500/40 transition-all"
                  >
                    {t.nav_register}
                  </Link>
                </motion.div>
              </div>
            )}
          </div>

          {/* Mobile hamburger */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            className="md:hidden p-2 rounded-xl hover:bg-white/[0.06] transition-colors"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <AnimatePresence mode="wait">
              {menuOpen ? (
                <motion.div key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}>
                  <X className="w-6 h-6" />
                </motion.div>
              ) : (
                <motion.div key="menu" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.2 }}>
                  <Menu className="w-6 h-6" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="md:hidden overflow-hidden border-t border-white/10 bg-black/90 backdrop-blur-xl"
          >
            <div className="px-4 py-3 space-y-1">
              {links.map((link, i) => (
                <motion.div
                  key={link.href}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.06 }}
                >
                  <Link
                    href={link.href}
                    className={cn(
                      "block px-4 py-2.5 rounded-xl text-sm font-medium transition-colors",
                      pathname === link.href ? "bg-orange-500/10 text-orange-500" : "text-white/75 hover:bg-white/[0.04]"
                    )}
                    onClick={() => setMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}
              <div className="border-t border-white/[0.08] pt-2 mt-2 space-y-1">
                {/* Mobile lang toggle */}
                <div className="px-4 py-2">
                  <LangToggle />
                </div>
                {user ? (
                  <>
                    <Link href="/dashboard" className="block px-4 py-2.5 text-sm text-white/75 hover:bg-white/[0.04] rounded-xl" onClick={() => setMenuOpen(false)}>{t.nav_dashboard}</Link>
                    <Link href="/messages" className="flex items-center justify-between px-4 py-2.5 text-sm text-white/75 hover:bg-white/[0.04] rounded-xl" onClick={() => setMenuOpen(false)}>
                      <span className="flex items-center gap-2"><MessageCircle className="w-4 h-4" /> {t.nav_messages}</span>
                      {unreadCount > 0 && <span className="bg-orange-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">{unreadCount}</span>}
                    </Link>
                    <Link href="/favorites" className="block px-4 py-2.5 text-sm text-white/75 hover:bg-white/[0.04] rounded-xl" onClick={() => setMenuOpen(false)}>{t.nav_favorites}</Link>
                    <p className="px-4 pt-2 pb-1 text-xs font-bold text-white/40 uppercase tracking-widest">Outils vendeur</p>
                    <Link href="/boost" className="block px-4 py-2.5 text-sm text-white/75 hover:bg-white/[0.04] rounded-xl" onClick={() => setMenuOpen(false)}><span className="flex items-center gap-2"><Zap className="w-4 h-4" /> {t.footer_boost}</span></Link>
                    <Link href="/verify" className="block px-4 py-2.5 text-sm text-white/75 hover:bg-white/[0.04] rounded-xl" onClick={() => setMenuOpen(false)}><span className="flex items-center gap-2"><Shield className="w-4 h-4" /> {t.nav_verify}</span></Link>
                    <Link href="/dealership" className="block px-4 py-2.5 text-sm text-white/75 hover:bg-white/[0.04] rounded-xl" onClick={() => setMenuOpen(false)}><span className="flex items-center gap-2"><Building2 className="w-4 h-4" /> Compte concessionnaire</span></Link>
                    <Link href="/inspections" className="block px-4 py-2.5 text-sm text-white/75 hover:bg-white/[0.04] rounded-xl" onClick={() => setMenuOpen(false)}><span className="flex items-center gap-2"><ClipboardCheck className="w-4 h-4" /> Inspections</span></Link>
                    <Link href="/reservations" className="block px-4 py-2.5 text-sm text-white/75 hover:bg-white/[0.04] rounded-xl" onClick={() => setMenuOpen(false)}><span className="flex items-center gap-2"><CalendarCheck className="w-4 h-4" /> {t.nav_reservations}</span></Link>
                    <Link href="/escrow" className="block px-4 py-2.5 text-sm text-white/75 hover:bg-white/[0.04] rounded-xl" onClick={() => setMenuOpen(false)}><span className="flex items-center gap-2"><Wallet className="w-4 h-4" /> {t.nav_escrow}</span></Link>
                    <Link href="/wallet" className="block px-4 py-2.5 text-sm text-white/75 hover:bg-white/[0.04] rounded-xl" onClick={() => setMenuOpen(false)}><span className="flex items-center gap-2"><Wallet className="w-4 h-4" /> Solde & Portefeuille</span></Link>
                    <button onClick={async () => { await fetch("/api/auth/logout", { method: "POST" }); window.location.href = "/"; }} className="block w-full text-left px-4 py-2.5 text-sm text-red-500 hover:bg-red-500/10 rounded-xl">{t.nav_logout}</button>
                  </>
                ) : (
                  <>
                    <Link href="/login" className="block px-4 py-2.5 text-sm text-white/75 hover:bg-white/[0.04] rounded-xl" onClick={() => setMenuOpen(false)}>{t.nav_login}</Link>
                    <Link href="/register" className="block px-4 py-2.5 text-sm font-bold text-white bg-orange-500 rounded-xl text-center" onClick={() => setMenuOpen(false)}>{t.nav_register}</Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
