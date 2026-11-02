"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  CreditCard,
  Lock,
  ShieldCheck,
  Truck,
  AlertCircle,
  X,
  ChevronDown,
  ChevronUp,
  ShoppingBag,
} from "lucide-react";
import { formatPrice, siteConfig } from "@/config/site";
import { useStore } from "@/context/StoreContext";

interface RazorpayGatewayOrder {
  razorpayOrderId: string;
  amount: number;
  currency: string;
  keyId: string;
  sandboxSimulation: {
    simulatedPaymentId: string;
    testSignature: string;
  };
}

export default function CheckoutPage() {
  const router = useRouter();
  const { user, cart, cartSubtotal, shippingFee, cartTotal, clearCart } =
    useStore();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [addressLine1, setAddressLine1] = useState("");
  const [addressLine2, setAddressLine2] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [notes, setNotes] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"RAZORPAY" | "COD">(
    "RAZORPAY"
  );

  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [mobileSummaryOpen, setMobileSummaryOpen] = useState(false);

  // Razorpay Interactive Checkout Modal State
  const [gatewayModalOpen, setGatewayModalOpen] = useState(false);
  const [gatewayOrder, setGatewayOrder] =
    useState<RazorpayGatewayOrder | null>(null);
  const [selectedInstrument, setSelectedInstrument] = useState<
    "UPI" | "CARD" | "NETBANKING"
  >("UPI");

  useEffect(() => {
    if (user) {
      setFullName((prev) => prev || user.name);
      setEmail((prev) => prev || user.email);
      setPhone((prev) => prev || user.phone || "");
      const defAddr =
        user.addresses.find((a) => a.isDefault) || user.addresses[0];
      if (defAddr) {
        setAddressLine1((prev) => prev || defAddr.addressLine1);
        setAddressLine2((prev) => prev || defAddr.addressLine2 || "");
        setCity((prev) => prev || defAddr.city);
        setState((prev) => prev || defAddr.state);
        setPostalCode((prev) => prev || defAddr.postalCode);
      }
    }
  }, [user]);

  const validateFields = (): string | null => {
    if (!fullName.trim() || fullName.trim().length < 2) {
      return "Please enter the recipient's full name.";
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim() || !emailRegex.test(email.trim())) {
      return "Please enter a valid email address for order confirmation.";
    }
    const digitsOnlyPhone = phone.replace(/\D/g, "");
    if (digitsOnlyPhone.length < 10) {
      return "Please enter a valid 10-digit mobile number.";
    }
    if (!addressLine1.trim()) {
      return "Please enter your street address / building details.";
    }
    if (!city.trim() || !state.trim()) {
      return "Please enter both City and State.";
    }
    const pinRegex = /^\d{6}$/;
    if (!pinRegex.test(postalCode.trim())) {
      return "Please enter a valid 6-digit PIN / postal code.";
    }
    return null;
  };

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const validationError = validateFields();
    if (validationError) {
      setError(validationError);
      return;
    }

    if (cart.length === 0) {
      setError("Your cart is empty.");
      return;
    }

    if (paymentMethod === "RAZORPAY") {
      setSubmitting(true);
      try {
        const res = await fetch("/api/payments/razorpay", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "create-order",
            amount: cartTotal,
          }),
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || "Could not initialize payment gateway.");
          setSubmitting(false);
          return;
        }
        setGatewayOrder(data);
        setGatewayModalOpen(true);
      } catch {
        setError("Network error while connecting to payment gateway.");
      } finally {
        setSubmitting(false);
      }
    } else {
      await finalizeOrderSubmission();
    }
  };

  const finalizeOrderSubmission = async (razorpayDetails?: {
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature: string;
  }) => {
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shippingAddress: {
            fullName: fullName.trim(),
            email: email.trim(),
            phone: phone.trim(),
            addressLine1: addressLine1.trim(),
            addressLine2: addressLine2.trim(),
            city: city.trim(),
            state: state.trim(),
            postalCode: postalCode.trim(),
          },
          items: cart,
          paymentMethod,
          notes: notes.trim(),
          ...razorpayDetails,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setGatewayModalOpen(false);
        setError(data.error || "Failed to place order.");
        setSubmitting(false);
        return;
      }

      setGatewayModalOpen(false);
      clearCart();
      router.push(`/orders/${data.order.orderNumber}/confirmation`);
    } catch {
      setError("Unexpected error while submitting your order.");
      setSubmitting(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 sm:py-20 text-center space-y-4">
        <h1 className="text-2xl font-serif text-stone-900">
          No Items to Checkout
        </h1>
        <p className="text-xs sm:text-sm text-stone-500">
          Add garments to your shopping cart before proceeding to checkout.
        </p>
        <Link
          href="/shop"
          className="inline-block px-6 py-3 bg-stone-900 text-white text-sm font-medium rounded-lg"
        >
          Browse Catalogue
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-10">
      <div className="mb-6 sm:mb-8 border-b border-stone-200 pb-4">
        <p className="text-xs font-semibold uppercase tracking-widest text-brand-700">
          Encrypted Checkout
        </p>
        <h1
          data-testid="checkout-heading"
          className="text-2xl sm:text-3xl font-serif text-stone-900 mt-0.5 sm:mt-1"
        >
          Delivery & Payment
        </h1>
      </div>

      {/* Mobile Collapsible Order Summary Bar (< lg screens) */}
      <div className="lg:hidden mb-6 bg-white border border-stone-200 rounded-xl overflow-hidden shadow-sm">
        <button
          type="button"
          data-testid="mobile-summary-toggle"
          onClick={() => setMobileSummaryOpen(!mobileSummaryOpen)}
          className="w-full p-4 flex items-center justify-between text-left text-xs font-medium text-stone-800 bg-stone-50/70"
          aria-expanded={mobileSummaryOpen}
        >
          <span className="flex items-center gap-2">
            <ShoppingBag className="h-4 w-4 text-stone-600" />
            <span>
              {mobileSummaryOpen ? "Hide" : "Show"} order summary (
              {cart.reduce((s, i) => s + i.quantity, 0)} items)
            </span>
            {mobileSummaryOpen ? (
              <ChevronUp className="h-4 w-4 text-stone-400" />
            ) : (
              <ChevronDown className="h-4 w-4 text-stone-400" />
            )}
          </span>
          <span className="font-semibold text-stone-900 text-sm">
            {formatPrice(cartTotal)}
          </span>
        </button>

        {mobileSummaryOpen && (
          <div data-testid="mobile-summary-content" className="p-4 border-t border-stone-200 space-y-3 divide-y divide-stone-100">
            {cart.map((item) => (
              <div
                key={item.variantId}
                className="pt-2.5 first:pt-0 flex items-center gap-3"
              >
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-12 h-14 rounded object-cover border border-stone-200 shrink-0"
                />
                <div className="flex-1 min-w-0 text-xs">
                  <p className="font-medium text-stone-900 truncate">
                    {item.title}
                  </p>
                  <p className="text-stone-500">
                    {item.size} / {item.color} × {item.quantity}
                  </p>
                </div>
                <p className="text-xs font-semibold text-stone-900 shrink-0">
                  {formatPrice(item.price * item.quantity)}
                </p>
              </div>
            ))}
            <div className="pt-3 text-xs space-y-1.5 text-stone-600">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{formatPrice(cartSubtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery</span>
                <span>
                  {shippingFee === 0 ? "FREE" : formatPrice(shippingFee)}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div
          data-testid="checkout-error-banner"
          role="alert"
          className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-900 text-xs sm:text-sm flex items-center gap-2.5"
        >
          <AlertCircle className="h-5 w-5 text-red-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form
        onSubmit={handleCheckoutSubmit}
        noValidate
        className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-10"
      >
        {/* Left Form Column */}
        <div className="lg:col-span-7 space-y-6 sm:space-y-8">
          {/* Saved Addresses Quick Selector */}
          {user && user.addresses.length > 0 && (
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200 space-y-3">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-stone-500">
                Saved Delivery Addresses
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {user.addresses.map((addr) => (
                  <button
                    key={addr.id}
                    type="button"
                    onClick={() => {
                      setFullName(addr.fullName);
                      setPhone(addr.phone);
                      setAddressLine1(addr.addressLine1);
                      setAddressLine2(addr.addressLine2 || "");
                      setCity(addr.city);
                      setState(addr.state);
                      setPostalCode(addr.postalCode);
                    }}
                    className="text-left p-3 rounded-xl border border-stone-200 hover:border-stone-900 active:bg-stone-50 transition-colors text-xs space-y-0.5"
                  >
                    <p className="font-semibold text-stone-900">
                      {addr.label} — {addr.fullName}
                    </p>
                    <p className="text-stone-600 truncate">
                      {addr.addressLine1}, {addr.city} {addr.postalCode}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Contact & Shipping Details */}
          <div className="bg-white p-4 sm:p-8 rounded-2xl border border-stone-200 space-y-4 sm:space-y-5">
            <div className="flex items-center gap-2 border-b border-stone-100 pb-3">
              <Truck className="h-5 w-5 text-stone-700" />
              <h2 className="text-base sm:text-lg font-serif text-stone-900">
                1. Contact & Delivery Information
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-stone-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  data-testid="checkout-fullname"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Aarav Sharma"
                  required
                  className="w-full px-3.5 py-2.5 text-base sm:text-sm border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-900 min-h-[44px]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  data-testid="checkout-email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full px-3.5 py-2.5 text-base sm:text-sm border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-900 min-h-[44px]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">
                  Mobile Number (10 digits) *
                </label>
                <input
                  type="tel"
                  data-testid="checkout-phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="9820112233"
                  required
                  className="w-full px-3.5 py-2.5 text-base sm:text-sm border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-900 min-h-[44px]"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-stone-700 mb-1">
                  Address Line 1 (House No., Building, Street) *
                </label>
                <input
                  type="text"
                  data-testid="checkout-address1"
                  value={addressLine1}
                  onChange={(e) => setAddressLine1(e.target.value)}
                  placeholder="402 Palm Grove Apartments, 16th Road"
                  required
                  className="w-full px-3.5 py-2.5 text-base sm:text-sm border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-900 min-h-[44px]"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-stone-700 mb-1">
                  Address Line 2 (Locality / Landmark — Optional)
                </label>
                <input
                  type="text"
                  data-testid="checkout-address2"
                  value={addressLine2}
                  onChange={(e) => setAddressLine2(e.target.value)}
                  placeholder="Bandra West"
                  className="w-full px-3.5 py-2.5 text-base sm:text-sm border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-900 min-h-[44px]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">
                  City *
                </label>
                <input
                  type="text"
                  data-testid="checkout-city"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Mumbai"
                  required
                  className="w-full px-3.5 py-2.5 text-base sm:text-sm border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-900 min-h-[44px]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">
                  State *
                </label>
                <input
                  type="text"
                  data-testid="checkout-state"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  placeholder="Maharashtra"
                  required
                  className="w-full px-3.5 py-2.5 text-base sm:text-sm border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-900 min-h-[44px]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">
                  PIN Code (6 digits) *
                </label>
                <input
                  type="text"
                  data-testid="checkout-postalcode"
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  placeholder="400050"
                  maxLength={6}
                  required
                  className="w-full px-3.5 py-2.5 text-base sm:text-sm border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-900 min-h-[44px]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">
                  Country
                </label>
                <input
                  type="text"
                  value="India"
                  disabled
                  className="w-full px-3.5 py-2.5 text-base sm:text-sm border border-stone-200 rounded-lg bg-stone-100 text-stone-600 min-h-[44px]"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-stone-700 mb-1">
                  Delivery Instructions (Optional)
                </label>
                <input
                  type="text"
                  data-testid="checkout-notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Gate code or preferred delivery window"
                  className="w-full px-3.5 py-2.5 text-base sm:text-sm border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-900 min-h-[44px]"
                />
              </div>
            </div>
          </div>

          {/* Payment Method Selection */}
          <div className="bg-white p-4 sm:p-8 rounded-2xl border border-stone-200 space-y-4">
            <div className="flex items-center gap-2 border-b border-stone-100 pb-3">
              <CreditCard className="h-5 w-5 text-stone-700" />
              <h2 className="text-base sm:text-lg font-serif text-stone-900">
                2. Payment Gateway Selection
              </h2>
            </div>

            <div className="space-y-3">
              <label
                data-testid="payment-option-razorpay"
                className={`flex items-start gap-3 p-3.5 sm:p-4 rounded-xl border cursor-pointer transition-all min-h-[56px] ${
                  paymentMethod === "RAZORPAY"
                    ? "border-stone-900 bg-stone-50"
                    : "border-stone-200 hover:border-stone-400"
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  checked={paymentMethod === "RAZORPAY"}
                  onChange={() => setPaymentMethod("RAZORPAY")}
                  className="mt-1 h-4 w-4"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between flex-wrap gap-1">
                    <span className="text-xs sm:text-sm font-semibold text-stone-900">
                      Razorpay Secure (UPI, Cards, NetBanking)
                    </span>
                    <span className="text-[10px] sm:text-[11px] font-semibold px-2 py-0.5 rounded bg-blue-100 text-blue-900">
                      Instant Verification
                    </span>
                  </div>
                  <p className="text-[11px] sm:text-xs text-stone-500 mt-1">
                    Pay securely with UPI, Visa, Mastercard, RuPay, or NetBanking
                    with server-side HMAC signature verification.
                  </p>
                </div>
              </label>

              <label
                data-testid="payment-option-cod"
                className={`flex items-start gap-3 p-3.5 sm:p-4 rounded-xl border cursor-pointer transition-all min-h-[56px] ${
                  paymentMethod === "COD"
                    ? "border-stone-900 bg-stone-50"
                    : "border-stone-200 hover:border-stone-400"
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  checked={paymentMethod === "COD"}
                  onChange={() => setPaymentMethod("COD")}
                  className="mt-1 h-4 w-4"
                />
                <div className="flex-1">
                  <span className="text-xs sm:text-sm font-semibold text-stone-900">
                    Pay on Delivery (Cash / UPI at Doorstep)
                  </span>
                  <p className="text-[11px] sm:text-xs text-stone-500 mt-0.5">
                    Pay when your order arrives at your delivery address.
                  </p>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Right Order Summary Column (Desktop sticky, also shows on mobile) */}
        <div className="lg:col-span-5">
          <div className="bg-white p-5 sm:p-8 rounded-2xl border border-stone-200 space-y-5 sm:space-y-6 sticky top-24 shadow-sm">
            <h2 className="text-base sm:text-lg font-serif text-stone-900 border-b border-stone-200 pb-3">
              Order Summary ({cart.reduce((s, i) => s + i.quantity, 0)} items)
            </h2>

            <div className="space-y-3.5 max-h-72 overflow-y-auto pr-1 divide-y divide-stone-100">
              {cart.map((item) => (
                <div
                  key={item.variantId}
                  className="pt-2.5 first:pt-0 flex items-center gap-3"
                >
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-12 h-14 sm:w-14 sm:h-16 rounded-md object-cover bg-stone-100 border border-stone-200 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm font-medium text-stone-900 truncate">
                      {item.title}
                    </p>
                    <p className="text-[11px] sm:text-xs text-stone-500">
                      {item.size} / {item.color} × {item.quantity}
                    </p>
                  </div>
                  <p className="text-xs sm:text-sm font-semibold text-stone-900 shrink-0">
                    {formatPrice(item.price * item.quantity)}
                  </p>
                </div>
              ))}
            </div>

            <div className="border-t border-stone-200 pt-3.5 space-y-2 text-xs sm:text-sm">
              <div className="flex justify-between text-stone-600">
                <span>Subtotal</span>
                <span className="font-medium text-stone-900">
                  {formatPrice(cartSubtotal)}
                </span>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>Delivery Charges</span>
                <span className="font-medium">
                  {shippingFee === 0 ? (
                    <span className="text-emerald-700 font-semibold">FREE</span>
                  ) : (
                    formatPrice(shippingFee)
                  )}
                </span>
              </div>
              <div className="border-t border-stone-200 pt-2.5 flex justify-between text-base font-semibold text-stone-900">
                <span>Total Payable</span>
                <span data-testid="checkout-total-amount">
                  {formatPrice(cartTotal)}
                </span>
              </div>
            </div>

            <button
              type="submit"
              data-testid="submit-checkout-button"
              disabled={submitting}
              className="w-full py-4 px-6 rounded-lg bg-stone-900 text-white text-sm font-semibold hover:bg-stone-800 active:bg-stone-950 disabled:bg-stone-400 transition-colors flex items-center justify-center gap-2 min-h-[48px] shadow-sm"
            >
              <Lock className="h-4 w-4" />
              {submitting
                ? "Processing..."
                : paymentMethod === "RAZORPAY"
                ? `Proceed to Razorpay (${formatPrice(cartTotal)})`
                : `Place Order (${formatPrice(cartTotal)})`}
            </button>

            <div className="flex items-center justify-center gap-1.5 text-[11px] sm:text-xs text-stone-500">
              <ShieldCheck className="h-4 w-4 text-emerald-700 shrink-0" />
              <span>Server-side stock & price verification</span>
            </div>
          </div>
        </div>
      </form>

      {/* Razorpay Checkout Gateway Modal - Mobile Bottom Sheet / Modal */}
      {gatewayModalOpen && gatewayOrder && (
        <div
          data-testid="razorpay-gateway-modal"
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4"
        >
          <div className="bg-white rounded-t-2xl sm:rounded-2xl max-w-md w-full overflow-hidden shadow-2xl border border-stone-200 animate-in slide-in-from-bottom-4 sm:zoom-in-95 duration-200 max-h-[92vh] flex flex-col justify-between">
            {/* Gateway Header */}
            <div className="bg-[#072654] text-white p-4 sm:p-5 flex items-center justify-between shrink-0">
              <div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-emerald-400" />
                  <span className="font-semibold tracking-wide text-sm">
                    Razorpay Trusted Checkout
                  </span>
                </div>
                <p className="text-xs text-blue-200 mt-0.5 truncate max-w-[260px]">
                  Merchant: {siteConfig.name} • {gatewayOrder.razorpayOrderId}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setGatewayModalOpen(false)}
                className="text-blue-200 hover:text-white p-2 min-h-[44px] min-w-[44px] flex items-center justify-center"
                aria-label="Close Razorpay checkout"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-4 sm:p-6 space-y-4 sm:space-y-5 overflow-y-auto">
              <div className="flex items-center justify-between bg-stone-50 p-3 rounded-xl border border-stone-200 text-xs sm:text-sm">
                <div>
                  <p className="text-stone-500 text-[11px]">Customer</p>
                  <p className="font-medium text-stone-900 truncate max-w-[180px]">
                    {fullName} ({phone})
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-stone-500 text-[11px]">Amount</p>
                  <p className="text-base sm:text-lg font-bold text-stone-900">
                    {formatPrice(cartTotal)}
                  </p>
                </div>
              </div>

              <div className="space-y-1.5">
                <p className="text-xs font-semibold uppercase tracking-wider text-stone-500">
                  Select Payment Instrument
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {(["UPI", "CARD", "NETBANKING"] as const).map((inst) => (
                    <button
                      key={inst}
                      type="button"
                      onClick={() => setSelectedInstrument(inst)}
                      className={`py-3 px-2 rounded-lg text-xs font-semibold border min-h-[44px] transition-all ${
                        selectedInstrument === inst
                          ? "border-[#072654] bg-blue-50 text-[#072654] shadow-sm"
                          : "border-stone-200 text-stone-600 hover:border-stone-400"
                      }`}
                    >
                      {inst}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-700 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">
                    Sandbox Payment Ready ({selectedInstrument})
                  </p>
                  <p className="text-emerald-800 mt-0.5 text-[11px]">
                    Clicking &ldquo;Authorize &amp; Complete Payment&rdquo; will
                    sign the payment with HMAC-SHA256 and record the order.
                  </p>
                </div>
              </div>

              <button
                type="button"
                data-testid="razorpay-confirm-pay-btn"
                disabled={submitting}
                onClick={() =>
                  finalizeOrderSubmission({
                    razorpayOrderId: gatewayOrder.razorpayOrderId,
                    razorpayPaymentId:
                      gatewayOrder.sandboxSimulation.simulatedPaymentId,
                    razorpaySignature:
                      gatewayOrder.sandboxSimulation.testSignature,
                  })
                }
                className="w-full py-4 px-6 rounded-xl bg-[#072654] hover:bg-[#0a3575] active:bg-[#051c3d] text-white text-sm font-semibold transition-colors shadow-md min-h-[48px]"
              >
                {submitting
                  ? "Verifying Payment Signature..."
                  : `Authorize & Pay ${formatPrice(cartTotal)}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
