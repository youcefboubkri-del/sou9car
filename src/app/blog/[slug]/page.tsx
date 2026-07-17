import type { Metadata } from "next";
import { MainLayout } from "@/components/layout/main-layout";
import Link from "next/link";
import { notFound } from "next/navigation";
import { blogPosts } from "@/lib/blog-posts";
import { ArrowLeft, Calendar, Clock } from "lucide-react";
import Script from "next/script";

export async function generateStaticParams() {
  return blogPosts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = blogPosts.find((p) => p.slug === slug);
  if (!post) return {};
  return {
    title: `${post.title} — Sou9Car Blog`,
    description: post.excerpt + " " + post.excerptAr,
    keywords: post.keywords,
    alternates: { canonical: `https://sou9car.ma/blog/${slug}` },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = blogPosts.find((p) => p.slug === slug);
  if (!post) notFound();

  const related = blogPosts
    .filter((p) => p.slug !== slug && p.category === post.category)
    .slice(0, 2);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt,
    author: { "@type": "Organization", name: "Sou9Car" },
    publisher: {
      "@type": "Organization",
      name: "Sou9Car",
      url: "https://sou9car.ma",
    },
    datePublished: post.date,
    inLanguage: "fr",
    about: { "@type": "Thing", name: "Voitures occasion Maroc" },
    keywords: post.keywords,
  };

  return (
    <MainLayout>
      <Script
        id={`jsonld-${slug}`}
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="max-w-3xl mx-auto px-4 py-10">
        {/* Back */}
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-sm text-white/40 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Retour au blog
        </Link>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/20">
              {post.category}
            </span>
            <span className="text-white/30 text-xs flex items-center gap-1">
              <Calendar className="w-3 h-3" /> {post.date}
            </span>
            <span className="text-white/30 text-xs flex items-center gap-1">
              <Clock className="w-3 h-3" /> {post.readTime} min de lecture
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white leading-tight mb-2">
            {post.title}
          </h1>
          <p
            className="text-white/40 text-base font-medium mb-4"
            dir="rtl"
          >
            {post.titleAr}
          </p>
          <p className="text-white/60 text-base leading-relaxed border-l-2 border-orange-500/40 pl-4">
            {post.excerpt}
          </p>
        </div>

        {/* Article content */}
        <div
          className="prose prose-invert prose-orange max-w-none text-white/80 leading-relaxed
            prose-h2:text-white prose-h2:text-xl prose-h2:font-bold prose-h2:mt-8 prose-h2:mb-4
            prose-h3:text-white/90 prose-h3:font-semibold prose-h3:mt-6 prose-h3:mb-3
            prose-p:text-white/70 prose-p:leading-relaxed prose-p:mb-4
            prose-ul:text-white/70 prose-li:mb-1
            prose-strong:text-white prose-strong:font-semibold
            prose-a:text-orange-400 prose-a:no-underline hover:prose-a:underline
            prose-blockquote:border-orange-500 prose-blockquote:text-white/50"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* CTA */}
        <div className="mt-10 bg-orange-500/10 border border-orange-500/25 rounded-2xl p-6 text-center">
          <p className="text-white font-bold text-lg mb-1">
            Prêt à acheter ou vendre en toute sécurité ?
          </p>
          <p className="text-white/50 text-sm mb-4">
            Rejoignez Sou9Car — la marketplace auto la plus fiable du Maroc.
          </p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Link
              href="/listings"
              className="px-5 py-2.5 bg-orange-500 hover:bg-orange-400 text-white font-bold rounded-xl text-sm transition-colors"
            >
              Parcourir les annonces
            </Link>
            <Link
              href="/listings/create"
              className="px-5 py-2.5 border border-orange-500/40 text-orange-400 font-bold rounded-xl text-sm hover:bg-orange-500/10 transition-colors"
            >
              Publier une annonce
            </Link>
          </div>
        </div>

        {/* Related */}
        {related.length > 0 && (
          <div className="mt-10">
            <h3 className="text-white font-bold mb-4">Articles similaires</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              {related.map((r) => (
                <Link
                  key={r.slug}
                  href={`/blog/${r.slug}`}
                  className="bg-surface border border-white/[0.08] rounded-xl p-4 hover:border-orange-500/30 transition-all group"
                >
                  <p className="text-white font-semibold text-sm group-hover:text-orange-400 transition-colors leading-snug">
                    {r.title}
                  </p>
                  <p className="text-white/30 text-xs mt-2 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {r.readTime} min
                  </p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
