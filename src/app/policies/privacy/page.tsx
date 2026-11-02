import React from "react";
import { siteConfig } from "@/config/site";

export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-6">
      <div className="border-b border-stone-200 pb-4">
        <p className="text-xs font-semibold uppercase tracking-widest text-brand-700">
          Store Policies
        </p>
        <h1 className="text-3xl font-serif text-stone-900 mt-1">
          Privacy & Data Handling Policy
        </h1>
      </div>

      <div className="bg-white rounded-2xl border border-stone-200 p-8 space-y-5 text-sm text-stone-700 leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-base font-semibold text-stone-900">
            1. Minimal Data Collection
          </h2>
          <p>
            {siteConfig.name} collects only the personal information strictly
            necessary to process orders, fulfil deliveries, and manage your
            customer account (Name, Email, Telephone Number, and Shipping
            Address).
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-stone-900">
            2. Payment Security
          </h2>
          <p>
            Online payments are processed through Razorpay. Card numbers, UPI
            PINs, and banking credentials are never stored on our application
            servers; only verified payment reference IDs and statuses are
            recorded.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-stone-900">
            3. Session & Authentication Security
          </h2>
          <p>
            Account passwords are salted and cryptographically hashed.
            Authenticated sessions use signed JWT tokens stored in HTTP-only
            cookies.
          </p>
        </section>
      </div>
    </div>
  );
}

