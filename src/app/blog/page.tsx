import type { Metadata } from "next";
import { MainLayout } from "@/components/layout/main-layout";
import Link from "next/link";
import { blogPosts } from "@/lib/blog-posts";
import { Calendar, Clock, ArrowRight, BookOpen } from "lucide-react";

export const metadata: Metadata = {
  title: "Blog Auto Maroc — Guides & Conseils Voiture | مدونة السيارات بالمغرب",
  description:
    "Guides, prix, conseils pour acheter ou vendre une voiture au Maroc. دليل شراء وبيع السيارات في المغرب. Évitez les arnaques, comparez les prix, importez en toute sécurité.",
  keywords:
    "blog voiture maroc, guide achat voiture maroc, conseil vente voiture maroc, prix voiture occasion maroc, مدونة سيارات المغرب, نصائح شراء سيارة المغرب",
  alternates: { canonical: "https://sou9car.ma/blog" },
};

export default function BlogPage() {
  const categories = ["Tous", "Guides", "Prix", "Conseils", "Villes"];

  return (
    <MainLayout>
      {/* Hero */}
      <div className="bg-[#0a0a0a] border-b border-white/5 py-10 px-4">
        <div className="max-w-5xl mx-auto">
          <p className="text-orange-500 text-xs font-bold uppercase tracking-widest mb-1">
            Blog
          </p>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <BookOpen className="w-7 h-7 text-orange-400" /> Guides & Conseils
            Auto Maroc
          </h1>
          <p className="text-white/40 mt-1 text-sm">
            Tout ce qu&apos;il faut savoir pour acheter, vendre ou importer une
            voiture au Maroc.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-10">
        {/* Category pills */}
        <div className="flex gap-2 flex-wrap mb-8">
          {categories.map((cat) => (
            <span
              key={cat}
              className="px-3 py-1.5 rounded-full text-xs font-semibold bg-white/[0.06] border border-white/10 text-white/60 hover:text-white hover:border-orange-500/40 cursor-pointer transition-all"
            >
              {cat}
            </span>
          ))}
        </div>

        {/* Articles grid */}
        <div className="grid md:grid-cols-2 gap-5">
          {blogPosts.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="group bg-surface border border-white/[0.08] rounded-2xl p-5 hover:border-orange-500/30 hover:shadow-lg hover:shadow-orange-500/5 transition-all"
            >
              <div className="flex items-center gap-2 mb-3">
                <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/20">
                  {post.category}
                </span>
                <span className="text-white/25 text-xs flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {post.readTime} min
                </span>
              </div>
              <h2 className="text-white font-bold text-base leading-snug mb-1 group-hover:text-orange-400 transition-colors">
                {post.title}
              </h2>
              <p className="text-white/40 text-xs mb-1 font-medium">
                {post.titleAr}
              </p>
              <p className="text-white/50 text-sm mt-3 leading-relaxed line-clamp-2">
                {post.excerpt}
              </p>
              <div className="flex items-center justify-between mt-4">
                <span className="text-white/25 text-xs flex items-center gap-1">
                  <Calendar className="w-3 h-3" /> {post.date}
                </span>
                <span className="text-orange-500 text-xs font-semibold flex items-center gap-1 group-hover:gap-2 transition-all">
                  Lire <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </MainLayout>
  );
}
