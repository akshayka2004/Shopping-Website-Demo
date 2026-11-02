import React from "react";
import Link from "next/link";
import { ArrowRight, Truck, RefreshCw, ShieldCheck, Sparkles } from "lucide-react";
import { readDb } from "@/lib/db";
import { siteConfig, formatPrice } from "@/config/site";
import { ProductCard } from "@/components/ProductCard";

export const dynamic = "force-dynamic";

export default function HomePage() {
  const db = readDb();
  const activeProducts = db.products.filter((p) => p.isActive);
  const featuredProducts = activeProducts
    .filter((p) => p.isFeatured)
    .slice(0, 6);
  const activeCategories = db.categories.filter((c) => c.isActive);

  return (
    <div className="space-y-12 sm:space-y-16 pb-12 sm:pb-16">
      {/* Hero Banner - Mobile First */}
      <section className="relative bg-stone-900 text-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 lg:py-24 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
          <div className="lg:col-span-6 space-y-4 sm:space-y-6 z-10 text-center lg:text-left">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-[11px] sm:text-xs uppercase tracking-widest text-stone-200">
              <Sparkles className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-amber-300" />
              Autumn / Winter Collection
            </span>
            <h1
              data-testid="hero-heading"
              className="text-3xl sm:text-5xl lg:text-6xl font-serif font-normal tracking-tight leading-[1.14] sm:leading-[1.12]"
            >
              Thoughtfully Tailored Everyday Clothing.
            </h1>
            <p className="text-sm sm:text-lg text-stone-300 max-w-xl mx-auto lg:mx-0 leading-relaxed">
              Crafted from organic heavyweight cotton, European flax linen, and
              extra-fine merino wool. Designed for effortless movement and
              enduring comfort.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 pt-2">
              <Link
                href="/shop"
                data-testid="hero-shop-cta"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-lg bg-white text-stone-950 font-semibold text-sm hover:bg-stone-200 active:bg-stone-300 transition-colors min-h-[44px]"
              >
                Explore Collection
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/shop?category=outerwear"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg border border-white/30 text-white font-medium text-sm hover:bg-white/10 active:bg-white/20 transition-colors min-h-[44px]"
              >
                Shop Outerwear
              </Link>
            </div>
          </div>

          <div className="lg:col-span-6 order-first lg:order-last">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-white/10 aspect-[16/10] sm:aspect-[16/10] bg-stone-800">
              <img
                src="/images/banners/hero-main.jpg"
                alt="Atelier Véra Seasonal Collection"
                className="w-full h-full object-cover object-center"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Value Propositions - 2x2 Grid on Mobile */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 bg-white p-4 sm:p-8 rounded-2xl border border-stone-200/80 shadow-sm">
          <div className="flex flex-col sm:flex-row items-start gap-2.5 sm:gap-4 p-2 sm:p-0">
            <div className="p-2 sm:p-2.5 rounded-lg bg-stone-100 text-stone-900 shrink-0">
              <Truck className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
            <div>
              <h2 className="text-xs sm:text-sm font-semibold text-stone-900">
                Complimentary Shipping
              </h2>
              <p className="text-[11px] sm:text-xs text-stone-500 mt-0.5 sm:mt-1">
                Free over {formatPrice(siteConfig.freeShippingThreshold)}.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-start gap-2.5 sm:gap-4 p-2 sm:p-0">
            <div className="p-2 sm:p-2.5 rounded-lg bg-stone-100 text-stone-900 shrink-0">
              <Sparkles className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
            <div>
              <h2 className="text-xs sm:text-sm font-semibold text-stone-900">
                Organic Fibres
              </h2>
              <p className="text-[11px] sm:text-xs text-stone-500 mt-0.5 sm:mt-1">
                GOTS organic cotton & flax linen.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-start gap-2.5 sm:gap-4 p-2 sm:p-0">
            <div className="p-2 sm:p-2.5 rounded-lg bg-stone-100 text-stone-900 shrink-0">
              <RefreshCw className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
            <div>
              <h2 className="text-xs sm:text-sm font-semibold text-stone-900">
                14-Day Easy Returns
              </h2>
              <p className="text-[11px] sm:text-xs text-stone-500 mt-0.5 sm:mt-1">
                Hassle-free exchanges across India.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-start gap-2.5 sm:gap-4 p-2 sm:p-0">
            <div className="p-2 sm:p-2.5 rounded-lg bg-stone-100 text-stone-900 shrink-0">
              <ShieldCheck className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
            <div>
              <h2 className="text-xs sm:text-sm font-semibold text-stone-900">
                Secure Checkout
              </h2>
              <p className="text-[11px] sm:text-xs text-stone-500 mt-0.5 sm:mt-1">
                Verified Razorpay UPI & Cards.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Shop by Category - 2-Column on Mobile */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 sm:space-y-8">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-brand-700">
              Curated Wardrobe
            </p>
            <h2 className="text-2xl sm:text-3xl font-serif text-stone-900 mt-1">
              Shop by Category
            </h2>
          </div>
          <Link
            href="/shop"
            className="inline-flex items-center gap-1 text-xs sm:text-sm font-medium text-stone-900 hover:text-brand-700 shrink-0"
          >
            <span className="hidden sm:inline">View Full</span> Catalogue
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          {activeCategories.map((cat) => (
            <Link
              key={cat.id}
              href={`/shop?category=${cat.slug}`}
              data-testid={`category-card-${cat.slug}`}
              className="group relative rounded-xl overflow-hidden aspect-[4/5] bg-stone-200 border border-stone-200 shadow-sm active:scale-[0.98] transition-transform"
            >
              <img
                src={cat.image}
                alt={cat.name}
                className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent flex flex-col justify-end p-3.5 sm:p-6 text-white">
                <h3 className="text-base sm:text-xl font-serif font-medium leading-tight">
                  {cat.name}
                </h3>
                <p className="text-[11px] sm:text-xs text-stone-200 line-clamp-2 mt-0.5 sm:mt-1 hidden sm:block">
                  {cat.description}
                </p>
                <span className="inline-flex items-center gap-1 text-[11px] sm:text-xs font-semibold uppercase tracking-wider mt-2 text-amber-200">
                  Explore
                  <ArrowRight className="h-3 w-3" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products - 2-Column on Mobile */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 sm:space-y-8">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-brand-700">
              Signature Pieces
            </p>
            <h2 className="text-2xl sm:text-3xl font-serif text-stone-900 mt-1">
              Featured Arrivals
            </h2>
          </div>
          <Link
            href="/shop"
            className="inline-flex items-center gap-1 text-xs sm:text-sm font-medium text-stone-900 hover:text-brand-700 shrink-0"
          >
            View All ({activeProducts.length})
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* Editorial Brand Banner - Clean Vertical on Mobile */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl overflow-hidden bg-brand-900 text-white grid grid-cols-1 lg:grid-cols-12 items-center">
          <div className="lg:col-span-6 p-6 sm:p-12 lg:p-16 space-y-4 sm:space-y-5 text-center sm:text-left">
            <p className="text-xs uppercase tracking-widest text-amber-300 font-semibold">
              Craftsmanship & Philosophy
            </p>
            <h2 className="text-2xl sm:text-4xl font-serif leading-tight">
              Designed in Our Studio for Seasons, Not Trends.
            </h2>
            <p className="text-xs sm:text-base text-stone-300 leading-relaxed">
              Every garment in our collection undergoes rigorous pattern testing
              and fabric pre-shrinking so your favourite shirt, trouser, or knit
              fits just as impeccably years from now as it does on day one.
            </p>
            <div className="pt-2">
              <Link
                href="/about"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-white text-stone-900 text-sm font-medium hover:bg-stone-100 transition-colors min-h-[44px] w-full sm:w-auto"
              >
                Read Our Story
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
          <div className="lg:col-span-6 h-56 sm:h-72 lg:h-full min-h-[220px]">
            <img
              src="/images/banners/about-studio.jpg"
              alt="Our Design Atelier"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </section>
    </div>
  );
}
