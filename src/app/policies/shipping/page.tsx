import React from "react";
import { siteConfig, formatPrice } from "@/config/site";

export default function ShippingPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-6">
      <div className="border-b border-stone-200 pb-4">
        <p className="text-xs font-semibold uppercase tracking-widest text-brand-700">
          Store Policies
        </p>
        <h1 className="text-3xl font-serif text-stone-900 mt-1">
          Shipping & Delivery Policy
        </h1>
      </div>

      <div className="bg-white rounded-2xl border border-stone-200 p-8 space-y-5 text-sm text-stone-700 leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-base font-semibold text-stone-900">
            1. Nationwide Delivery Rates
          </h2>
          <p>
            We offer complimentary express shipping across India on all orders
            totalling{" "}
            <strong>{formatPrice(siteConfig.freeShippingThreshold)}</strong> or
            above. For orders below{" "}
            {formatPrice(siteConfig.freeShippingThreshold)}, a flat standard
            shipping charge of{" "}
            <strong>{formatPrice(siteConfig.standardShippingFee)}</strong> is
            applied at checkout.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-stone-900">
            2. Order Processing & Dispatch Timelines
          </h2>
          <p>
            Orders placed before 2:00 PM IST Monday through Saturday are
            processed and quality-checked within 24–48 business hours. Once
            dispatched, metropolitan deliveries typically arrive within 2–4
            business days, and rest-of-India deliveries arrive within 4–7
            business days.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-stone-900">
            3. Order Tracking & Status Updates
          </h2>
          <p>
            Customers can inspect real-time order fulfilment status
            (Confirmed, Processing, Shipped, Delivered) at any time from the My
            Account order history screen.
          </p>
        </section>
      </div>
    </div>
  );
}

