"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  CheckCircle2,
  Package,
  ArrowRight,
  MapPin,
  CreditCard,
} from "lucide-react";
import { formatPrice } from "@/config/site";
import { Order } from "@/types/store";

export default function OrderConfirmationPage() {
  const params = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadOrder() {
      try {
        const res = await fetch(`/api/orders/${params.id}`, {
          cache: "no-store",
        });
        if (res.ok) {
          const data = await res.json();
          setOrder(data.order);
        }
      } finally {
        setLoading(false);
      }
    }
    if (params.id) loadOrder();
  }, [params.id]);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center text-sm text-stone-500">
        Loading your order confirmation...
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-4">
        <h1 className="text-2xl font-serif text-stone-900">Order Not Found</h1>
        <Link
          href="/shop"
          className="inline-block px-6 py-3 bg-stone-900 text-white text-sm rounded-lg"
        >
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div
      data-testid="order-confirmation-page"
      className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8"
    >
      <div className="bg-white rounded-2xl border border-stone-200 p-8 text-center space-y-4 shadow-sm">
        <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto">
          <CheckCircle2 className="h-8 w-8" />
        </div>
        <p className="text-xs font-semibold uppercase tracking-widest text-emerald-800">
          Order Confirmed
        </p>
        <h1 className="text-3xl font-serif text-stone-900">
          Thank You for Your Order, {order.customerName.split(" ")[0]}!
        </h1>
        <p className="text-sm text-stone-600 max-w-lg mx-auto">
          Your order reference is{" "}
          <strong
            data-testid="confirmed-order-number"
            className="text-stone-900 font-mono"
          >
            {order.orderNumber}
          </strong>
          . We have recorded your order and our studio fulfilment team is
          preparing your garments.
        </p>
      </div>

      {/* Order Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-stone-200 p-6 space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-stone-500">
            <MapPin className="h-4 w-4" />
            Delivery Address
          </div>
          <div className="text-sm text-stone-800 space-y-1">
            <p className="font-semibold">{order.shippingAddress.fullName}</p>
            <p>{order.shippingAddress.addressLine1}</p>
            {order.shippingAddress.addressLine2 && (
              <p>{order.shippingAddress.addressLine2}</p>
            )}
            <p>
              {order.shippingAddress.city}, {order.shippingAddress.state}{" "}
              {order.shippingAddress.postalCode}
            </p>
            <p className="text-xs text-stone-500 pt-1">
              Phone: {order.shippingAddress.phone} • Email:{" "}
              {order.shippingAddress.email}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-stone-200 p-6 space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-stone-500">
            <CreditCard className="h-4 w-4" />
            Payment & Fulfilment Status
          </div>
          <div className="text-sm space-y-2">
            <div className="flex justify-between">
              <span className="text-stone-500">Payment Method:</span>
              <span className="font-medium text-stone-900">
                {order.paymentMethod}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-500">Payment Status:</span>
              <span
                data-testid="confirmed-payment-status"
                className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                  order.paymentStatus === "PAID"
                    ? "bg-emerald-100 text-emerald-900"
                    : "bg-amber-100 text-amber-900"
                }`}
              >
                {order.paymentStatus}
              </span>
            </div>
            {order.paymentReference && (
              <div className="flex justify-between">
                <span className="text-stone-500">Payment Ref:</span>
                <span
                  data-testid="confirmed-payment-ref"
                  className="font-mono text-xs text-stone-800"
                >
                  {order.paymentReference}
                </span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-stone-500">Fulfilment Status:</span>
              <span
                data-testid="confirmed-fulfilment-status"
                className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-stone-900 text-white"
              >
                {order.fulfilmentStatus}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Ordered Items */}
      <div className="bg-white rounded-2xl border border-stone-200 p-6 space-y-4">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-stone-500 border-b border-stone-100 pb-3">
          <Package className="h-4 w-4" />
          Ordered Garments
        </div>

        <div className="divide-y divide-stone-100">
          {order.items.map((item) => (
            <div
              key={item.id}
              className="py-3.5 flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-4">
                <img
                  src={item.image}
                  alt={item.productName}
                  className="w-14 h-16 rounded-lg object-cover border border-stone-200"
                />
                <div>
                  <p className="text-sm font-medium text-stone-900">
                    {item.productName}
                  </p>
                  <p className="text-xs text-stone-500">
                    Size: {item.size} • Colour: {item.color} • Qty:{" "}
                    {item.quantity}
                  </p>
                </div>
              </div>
              <p className="text-sm font-semibold text-stone-900">
                {formatPrice(item.lineTotal)}
              </p>
            </div>
          ))}
        </div>

        <div className="border-t border-stone-200 pt-4 space-y-2 text-sm">
          <div className="flex justify-between text-stone-600">
            <span>Subtotal</span>
            <span>{formatPrice(order.subtotal)}</span>
          </div>
          <div className="flex justify-between text-stone-600">
            <span>Shipping</span>
            <span>
              {order.shippingFee === 0
                ? "FREE"
                : formatPrice(order.shippingFee)}
            </span>
          </div>
          <div className="flex justify-between text-base font-semibold text-stone-900 pt-2 border-t border-stone-100">
            <span>Total Amount</span>
            <span data-testid="confirmed-total-amount">
              {formatPrice(order.totalAmount)}
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-4">
        <Link
          href="/account"
          data-testid="view-order-history-link"
          className="px-6 py-3 rounded-lg bg-stone-900 text-white text-sm font-medium hover:bg-stone-800 transition-colors"
        >
          View Order History
        </Link>
        <Link
          href="/shop"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-stone-300 bg-white text-stone-800 text-sm font-medium hover:border-stone-900 transition-colors"
        >
          Continue Shopping
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}

