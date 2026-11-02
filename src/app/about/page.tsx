import React from "react";
import Link from "next/link";
import { ArrowRight, Sparkles, ShieldCheck, HeartHandshake } from "lucide-react";
import { siteConfig } from "@/config/site";

export default function AboutPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      {/* Hero */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
        <div className="lg:col-span-6 space-y-5">
          <p className="text-xs font-semibold uppercase tracking-widest text-brand-700">
            Our Story & Philosophy
          </p>
          <h1
            data-testid="about-heading"
            className="text-3xl sm:text-5xl font-serif text-stone-900 leading-tight"
          >
            Elevated Everyday Wardrobe Essentials.
          </h1>
          <p className="text-base text-stone-600 leading-relaxed">
            {siteConfig.name} was founded on a simple conviction: everyday
            clothing should combine architectural tailoring with breathable,
            long-lasting natural fabrics. Instead of chasing fleeting seasonal
            trends, we focus on refining the foundational silhouettes you reach
            for every day.
          </p>
          <div className="pt-2">
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-stone-900 text-white text-sm font-medium hover:bg-stone-800"
            >
              Explore the Collection
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
        <div className="lg:col-span-6 rounded-2xl overflow-hidden border border-stone-200 aspect-[16/10] bg-stone-100">
          <img
            src="/images/banners/about-studio.jpg"
            alt="Atelier Véra Design Studio"
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white p-8 rounded-2xl border border-stone-200 space-y-3">
          <Sparkles className="h-6 w-6 text-brand-700" />
          <h2 className="text-xl font-serif text-stone-900">
            Certified Natural Fibres
          </h2>
          <p className="text-sm text-stone-600 leading-relaxed">
            We partner with mills supplying GOTS-certified organic ring-spun
            cotton, long-staple European flax linen, and extra-fine Australian
            merino wool.
          </p>
        </div>

        <div className="bg-white p-8 rounded-2xl border border-stone-200 space-y-3">
          <ShieldCheck className="h-6 w-6 text-brand-700" />
          <h2 className="text-xl font-serif text-stone-900">
            Precision Tailoring
          </h2>
          <p className="text-sm text-stone-600 leading-relaxed">
            Every pattern is graded and wear-tested across multiple body types,
            featuring reinforced seams, French stitching, and natural horn or
            mother-of-pearl buttons.
          </p>
        </div>

        <div className="bg-white p-8 rounded-2xl border border-stone-200 space-y-3">
          <HeartHandshake className="h-6 w-6 text-brand-700" />
          <h2 className="text-xl font-serif text-stone-900">
            Responsible Small-Batch Production
          </h2>
          <p className="text-sm text-stone-600 leading-relaxed">
            We produce in measured batches to eliminate deadstock waste and
            ensure every garment passes a multi-point quality inspection before
            dispatch.
          </p>
        </div>
      </div>
    </div>
  );
}

