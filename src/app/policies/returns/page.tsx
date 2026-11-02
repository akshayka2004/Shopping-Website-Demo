import React from "react";

export default function ReturnsPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-6">
      <div className="border-b border-stone-200 pb-4">
        <p className="text-xs font-semibold uppercase tracking-widest text-brand-700">
          Store Policies
        </p>
        <h1 className="text-3xl font-serif text-stone-900 mt-1">
          Returns, Exchanges & Cancellations Policy
        </h1>
      </div>

      <div className="bg-white rounded-2xl border border-stone-200 p-8 space-y-5 text-sm text-stone-700 leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-base font-semibold text-stone-900">
            1. 14-Day Return & Size Exchange Window
          </h2>
          <p>
            Unworn, unwashed garments with original tags and packaging intact
            may be returned or exchanged for a different size within 14 days of
            delivery.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-stone-900">
            2. Order Cancellations
          </h2>
          <p>
            Orders may be cancelled prior to shipment by contacting our Client
            Care team. When an order is cancelled, reserved variant stock is
            automatically restored to inventory.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-stone-900">
            3. Refund Processing
          </h2>
          <p>
            Approved refunds are credited back to the original payment method
            within 5–7 business days after quality inspection at our studio.
          </p>
        </section>
      </div>
    </div>
  );
}

