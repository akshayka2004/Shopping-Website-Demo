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
        className="max-w-3xl mx-auto px-4 py-16 sm:py-20 text-center space-y-4 sm:space-y-5"
      >
        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-stone-100 flex items-center justify-center mx-auto text-stone-500">
          <ShoppingBag className="h-6 w-6 sm:h-7 sm:w-7" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-serif text-stone-900">
          Your Shopping Cart is Empty
        </h1>
        <p className="text-xs sm:text-sm text-stone-500 max-w-md mx-auto">
          Explore our curated collection of organic cotton essentials, pure
          linen shirting, and tailored outerwear.
        </p>
        <div className="pt-2">
          <Link
            href="/shop"
            data-testid="empty-cart-shop-link"
            className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-lg bg-stone-900 text-white text-sm font-medium hover:bg-stone-800 transition-colors min-h-[44px]"
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
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-6 sm:space-y-8">
      <div className="flex items-center justify-between border-b border-stone-200 pb-4 sm:pb-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-brand-700">
            Order Review
          </p>
          <h1
            data-testid="cart-page-heading"
            className="text-2xl sm:text-3xl font-serif text-stone-900 mt-0.5 sm:mt-1"
          >
            Shopping Cart ({cart.reduce((s, i) => s + i.quantity, 0)})
          </h1>
        </div>
        <button
          type="button"
          data-testid="clear-cart-button"
          onClick={clearCart}
          className="text-xs font-medium text-stone-500 hover:text-red-700 underline p-2 min-h-[44px] flex items-center"
        >
          Clear Cart
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-10">
        {/* Cart Line Items */}
        <div className="lg:col-span-8 space-y-3 sm:space-y-4">
          {remainingForFreeShipping > 0 ? (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 sm:p-4 text-xs text-amber-900">
              Add{" "}
              <strong className="font-semibold">
                {formatPrice(remainingForFreeShipping)}
              </strong>{" "}
              more to unlock{" "}
              <strong className="font-semibold">
                Complimentary Express Shipping
              </strong>
              .
            </div>
          ) : (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 sm:p-4 text-xs text-emerald-900 font-medium">
              ✓ Your order qualifies for Complimentary Express Shipping!
            </div>
          )}

          <div className="bg-white rounded-2xl border border-stone-200 divide-y divide-stone-200 shadow-sm overflow-hidden">
            {cart.map((item) => (
              <div
                key={item.variantId}
                data-testid={`cart-item-${item.variantId}`}
                className="p-4 sm:p-5 flex flex-col gap-3.5"
              >
                <div className="flex items-start gap-3.5">
                  <Link
                    href={`/product/${item.productSlug}`}
                    className="w-20 h-24 sm:w-24 sm:h-28 rounded-lg overflow-hidden bg-stone-100 shrink-0 border border-stone-200"
                  >
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                  </Link>

                  <div className="flex-1 min-w-0 space-y-1">
                    <Link
                      href={`/product/${item.productSlug}`}
                      className="text-sm sm:text-base font-medium text-stone-900 hover:text-brand-700 truncate block"
                    >
                      {item.title}
                    </Link>
                    <div className="flex flex-wrap items-center gap-1.5 sm:gap-2.5 text-xs text-stone-500">
                      <span>
                        Size:{" "}
                        <strong className="text-stone-800">{item.size}</strong>
                      </span>
                      <span>•</span>
                      <span>
                        Colour:{" "}
                        <strong className="text-stone-800">{item.color}</strong>
                      </span>
                    </div>
                    <p className="text-xs text-stone-400 font-mono">
                      SKU: {item.sku}
                    </p>
                    <p className="text-xs sm:text-sm font-semibold text-stone-900 pt-0.5">
                      {formatPrice(item.price)}
                    </p>
                  </div>
                </div>

                {/* Quantity Controls & Line Total Row */}
                <div className="flex items-center justify-between pt-2 border-t border-stone-100">
                  <div className="flex items-center border border-stone-300 rounded-lg min-h-[40px]">
                    <button
                      type="button"
                      data-testid={`cart-qty-minus-${item.variantId}`}
                      onClick={() =>
                        updateCartQuantity(item.variantId, item.quantity - 1)
                      }
                      disabled={item.quantity <= 1}
                      className="p-2.5 text-stone-600 hover:text-stone-950 disabled:opacity-40 min-h-[40px] min-w-[36px] flex items-center justify-center"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span
                      data-testid={`cart-qty-val-${item.variantId}`}
                      className="w-7 text-center text-xs font-semibold"
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
                      className="p-2.5 text-stone-600 hover:text-stone-950 disabled:opacity-40 min-h-[40px] min-w-[36px] flex items-center justify-center"
                      aria-label="Increase quantity"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <div className="flex items-center gap-4">
                    <p
                      data-testid={`cart-line-total-${item.variantId}`}
                      className="text-sm font-semibold text-stone-900"
                    >
                      {formatPrice(item.price * item.quantity)}
                    </p>

                    <button
                      type="button"
                      data-testid={`cart-remove-${item.variantId}`}
                      onClick={() => removeFromCart(item.variantId)}
                      className="p-2 text-stone-400 hover:text-red-600 transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center"
                      aria-label="Remove item"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Order Summary Sidebar */}
        <div className="lg:col-span-4">
          <div
            data-testid="cart-order-summary"
            className="bg-white rounded-2xl border border-stone-200 p-5 sm:p-6 space-y-4 sm:space-y-5 sticky top-24 shadow-sm"
          >
            <h2 className="text-base sm:text-lg font-serif text-stone-900 border-b border-stone-200 pb-3">
              Order Summary
            </h2>

            <div className="space-y-3 text-xs sm:text-sm">
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
              <div className="border-t border-stone-200 pt-3 flex justify-between text-sm sm:text-base font-semibold text-stone-900">
                <span>Order Total</span>
                <span data-testid="cart-total">{formatPrice(cartTotal)}</span>
              </div>
            </div>

            <Link
              href="/checkout"
              data-testid="proceed-to-checkout-btn"
              className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-6 rounded-lg bg-stone-900 text-white text-sm font-semibold hover:bg-stone-800 active:bg-stone-950 transition-colors min-h-[44px] shadow-sm"
            >
              Proceed to Secure Checkout
              <ArrowRight className="h-4 w-4" />
            </Link>

            <div className="pt-1 flex items-center justify-center gap-1.5 text-[11px] sm:text-xs text-stone-500">
              <ShieldCheck className="h-4 w-4 text-emerald-700 shrink-0" />
              <span>Razorpay Verified Checkout & Stock Protection</span>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Mobile Checkout Bar (< lg screens, above bottom nav) */}
      <div
        data-testid="mobile-sticky-checkout-bar"
        className="fixed bottom-[56px] left-0 right-0 z-30 lg:hidden bg-white/95 backdrop-blur-md border-t border-stone-200 p-3 shadow-lg flex items-center justify-between gap-3"
      >
        <div>
          <p className="text-[11px] text-stone-500">Total Payable</p>
          <p className="text-base font-bold text-stone-900">
            {formatPrice(cartTotal)}
          </p>
        </div>
        <Link
          href="/checkout"
          data-testid="mobile-sticky-checkout-btn"
          className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 bg-stone-900 text-white text-xs font-semibold rounded-lg shrink-0 min-h-[40px] shadow-sm"
        >
          Checkout
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}
