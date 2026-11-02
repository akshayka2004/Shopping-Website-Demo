import React from "react";
import { siteConfig } from "@/config/site";

export default function TermsPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-6">
      <div className="border-b border-stone-200 pb-4">
        <p className="text-xs font-semibold uppercase tracking-widest text-brand-700">
          Store Policies
        </p>
        <h1 className="text-3xl font-serif text-stone-900 mt-1">
          Terms & Conditions of Service
        </h1>
      </div>

      <div className="bg-white rounded-2xl border border-stone-200 p-8 space-y-5 text-sm text-stone-700 leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-base font-semibold text-stone-900">
            1. Overview
          </h2>
          <p>
            By accessing or placing an order on the {siteConfig.name} online
            storefront, you agree to be bound by these Terms of Service and our
            operational policies.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-stone-900">
            2. Product Pricing & Stock Availability
          </h2>
          <p>
            All prices are listed in Indian Rupees (INR) inclusive of applicable
            taxes. Product availability and variant stock are verified on the
            server prior to order confirmation to prevent accidental
            overselling.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-stone-900">
            3. Governing Law
          </h2>
          <p>
            These terms are governed by the laws of India, with exclusive
            jurisdiction in the courts of Mumbai, Maharashtra.
          </p>
        </section>
      </div>
    </div>
  );
}

