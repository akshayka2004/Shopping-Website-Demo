"use client";

import React from "react";
import Link from "next/link";
import {
  ArrowRight,
  Minus,
  Plus,
  ShoppingBag,
  Trash2,
  ShieldCheck,
} from "lucide-react";
import { formatPrice, siteConfig } from "@/config/site";
import { useStore } from "@/context/StoreContext";

export default function CartPage() {
  const {
    cart,
    updateCartQuantity,
    removeFromCart,
    clearCart,
    cartSubtotal,
    shippingFee,
    cartTotal,
  } = useStore();

  if (cart.length === 0) {
    return (
      <div
        data-testid="empty-cart-container"
        className="max-w-3xl mx-auto px-4 py-20 text-center space-y-5"
      >
        <div className="w-16 h-16 rounded-full bg-stone-100 flex items-center justify-center mx-auto text-stone-500">
          <ShoppingBag className="h-7 w-7" />
        </div>
        <h1 className="text-3xl font-serif text-stone-900">
          Your Shopping Cart is Empty
        </h1>
        <p className="text-sm text-stone-500 max-w-md mx-auto">
          Explore our curated collection of organic cotton essentials, pure
          linen shirting, and tailored outerwear.
        </p>
        <div className="pt-2">
          <Link
            href="/shop"
            data-testid="empty-cart-shop-link"
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-lg bg-stone-900 text-white text-sm font-medium hover:bg-stone-800 transition-colors"
          >
            Explore Collection
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    );
  }

  const remainingForFreeShipping = Math.max(
    0,
    siteConfig.freeShippingThreshold - cartSubtotal
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="flex items-center justify-between border-b border-stone-200 pb-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-brand-700">
            Order Review
          </p>
          <h1
            data-testid="cart-page-heading"
            className="text-3xl font-serif text-stone-900 mt-1"
          >
            Shopping Cart
          </h1>
        </div>
        <button
          type="button"
          data-testid="clear-cart-button"
          onClick={clearCart}
          className="text-xs font-medium text-stone-500 hover:text-red-700 underline"
        >
          Clear Cart
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Cart Line Items */}
        <div className="lg:col-span-8 space-y-4">
          {remainingForFreeShipping > 0 ? (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-900">
              Add{" "}
              <span className="font-semibold">
                {formatPrice(remainingForFreeShipping)}
              </span>{" "}
              more to unlock{" "}
              <span className="font-semibold">
                Complimentary Express Shipping
              </span>
              .
            </div>
          ) : (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-xs text-emerald-900 font-medium">
              ✓ Your order qualifies for Complimentary Express Shipping!
            </div>
          )}

          <div className="bg-white rounded-2xl border border-stone-200 divide-y divide-stone-200">
            {cart.map((item) => (
              <div
                key={item.variantId}
                data-testid={`cart-item-${item.variantId}`}
                className="p-5 flex flex-col sm:flex-row items-start sm:items-center gap-5"
              >
                <Link
                  href={`/product/${item.productSlug}`}
                  className="w-24 h-28 rounded-lg overflow-hidden bg-stone-100 shrink-0 border border-stone-200"
                >
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                </Link>

                <div className="flex-1 space-y-1">
                  <Link
                    href={`/product/${item.productSlug}`}
                    className="text-base font-medium text-stone-900 hover:text-brand-700"
                  >
                    {item.title}
                  </Link>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-stone-500">
                    <span>
                      Size:{" "}
                      <strong className="text-stone-800">{item.size}</strong>
                    </span>
                    <span>•</span>
                    <span className="inline-flex items-center gap-1">
                      Colour:{" "}
                      <strong className="text-stone-800">{item.color}</strong>
                    </span>
                    <span>•</span>
                    <span className="font-mono text-[11px]">
                      SKU: {item.sku}
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-stone-900 pt-1">
                    {formatPrice(item.price)} each
                  </p>
                </div>

                {/* Quantity Controls */}
                <div className="flex items-center gap-4 self-end sm:self-center">
                  <div className="flex items-center border border-stone-300 rounded-lg">
                    <button
                      type="button"
                      data-testid={`cart-qty-minus-${item.variantId}`}
                      onClick={() =>
                        updateCartQuantity(item.variantId, item.quantity - 1)
                      }
                      disabled={item.quantity <= 1}
                      className="p-2 text-stone-600 hover:text-stone-950 disabled:opacity-40"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span
                      data-testid={`cart-qty-val-${item.variantId}`}
                      className="w-8 text-center text-xs font-semibold"
                    >
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      data-testid={`cart-qty-plus-${item.variantId}`}
                      onClick={() =>
                        updateCartQuantity(item.variantId, item.quantity + 1)
                      }
                      disabled={item.quantity >= item.maxStock}
                      className="p-2 text-stone-600 hover:text-stone-950 disabled:opacity-40"
                      aria-label="Increase quantity"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <div className="min-w-[85px] text-right">
                    <p
                      data-testid={`cart-line-total-${item.variantId}`}
                      className="text-sm font-semibold text-stone-900"
                    >
                      {formatPrice(item.price * item.quantity)}
                    </p>
                  </div>

                  <button
                    type="button"
                    data-testid={`cart-remove-${item.variantId}`}
                    onClick={() => removeFromCart(item.variantId)}
                    className="p-2 text-stone-400 hover:text-red-600 transition-colors"
                    aria-label="Remove item"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Order Summary Sidebar */}
        <div className="lg:col-span-4">
          <div
            data-testid="cart-order-summary"
            className="bg-white rounded-2xl border border-stone-200 p-6 space-y-5 sticky top-24 shadow-sm"
          >
            <h2 className="text-lg font-serif text-stone-900 border-b border-stone-200 pb-3">
              Order Summary
            </h2>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-stone-600">
                <span>Subtotal</span>
                <span
                  data-testid="cart-subtotal"
                  className="font-medium text-stone-900"
                >
                  {formatPrice(cartSubtotal)}
                </span>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>Standard Delivery</span>
                <span data-testid="cart-shipping" className="font-medium">
                  {shippingFee === 0 ? (
                    <span className="text-emerald-700 font-semibold">FREE</span>
                  ) : (
                    formatPrice(shippingFee)
                  )}
                </span>
              </div>
              <div className="border-t border-stone-200 pt-3 flex justify-between text-base font-semibold text-stone-900">
                <span>Order Total</span>
                <span data-testid="cart-total">{formatPrice(cartTotal)}</span>
              </div>
            </div>

            <Link
              href="/checkout"
              data-testid="proceed-to-checkout-btn"
              className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-6 rounded-lg bg-stone-900 text-white text-sm font-medium hover:bg-stone-800 transition-colors"
            >
              Proceed to Secure Checkout
              <ArrowRight className="h-4 w-4" />
            </Link>

            <div className="pt-2 flex items-center justify-center gap-2 text-xs text-stone-500">
              <ShieldCheck className="h-4 w-4 text-emerald-700" />
              <span>Razorpay Verified Checkout & Stock Protection</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

