"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  User as UserIcon,
  MapPin,
  Package,
  Plus,
  Trash2,
  LogOut,
  ShieldCheck,
} from "lucide-react";
import { formatPrice } from "@/config/site";
import { useStore } from "@/context/StoreContext";
import { Order } from "@/types/store";

export default function AccountPage() {
  const router = useRouter();
  const { user, authLoading, setUser, logout, showToast } = useStore();

  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Profile Edit State
  const [profileName, setProfileName] = useState("");
  const [profilePhone, setProfilePhone] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);

  // New Address State
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [addrLabel, setAddrLabel] = useState("Home");
  const [addrFullName, setAddrFullName] = useState("");
  const [addrPhone, setAddrPhone] = useState("");
  const [addrLine1, setAddrLine1] = useState("");
  const [addrLine2, setAddrLine2] = useState("");
  const [addrCity, setAddrCity] = useState("");
  const [addrState, setAddrState] = useState("");
  const [addrPostalCode, setAddrPostalCode] = useState("");

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    if (user) {
      setProfileName(user.name);
      setProfilePhone(user.phone || "");
      setAddrFullName(user.name);
      setAddrPhone(user.phone || "");

      fetch("/api/orders", { cache: "no-store" })
        .then((r) => r.json())
        .then((d) => setOrders(d.orders || []))
        .finally(() => setOrdersLoading(false));
    }
  }, [user]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const res = await fetch("/api/auth/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update-profile",
          name: profileName,
          phone: profilePhone,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setUser(data.user);
        showToast("Profile updated successfully.");
      } else {
        showToast(data.error || "Could not update profile.", "error");
      }
    } finally {
      setSavingProfile(false);
    }
  };

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/auth/me", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "add-address",
        label: addrLabel,
        fullName: addrFullName,
        phone: addrPhone,
        addressLine1: addrLine1,
        addressLine2: addrLine2,
        city: addrCity,
        state: addrState,
        postalCode: addrPostalCode,
        isDefault: true,
      }),
    });
    const data = await res.json();
    if (res.ok) {
      setUser(data.user);
      setShowAddressForm(false);
      setAddrLine1("");
      setAddrLine2("");
      setAddrCity("");
      setAddrState("");
      setAddrPostalCode("");
      showToast("Delivery address saved.");
    } else {
      showToast(data.error || "Please complete all required address fields.", "error");
    }
  };

  const handleDeleteAddress = async (addressId: string) => {
    const res = await fetch("/api/auth/me", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "delete-address", addressId }),
    });
    const data = await res.json();
    if (res.ok) {
      setUser(data.user);
      showToast("Address removed.", "info");
    }
  };

  if (authLoading || !user) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center text-sm text-stone-500">
        Loading your account...
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 pb-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-brand-700">
            Customer Portal
          </p>
          <h1
            data-testid="account-heading"
            className="text-3xl font-serif text-stone-900 mt-1"
          >
            Hello, {user.name}
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">{user.email}</p>
        </div>

        <div className="flex items-center gap-3">
          {user.role === "ADMIN" && (
            <Link
              href="/admin"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-amber-100 text-amber-900 text-xs font-semibold hover:bg-amber-200"
            >
              <ShieldCheck className="h-4 w-4" />
              Open Admin Dashboard
            </Link>
          )}
          <button
            type="button"
            data-testid="account-logout-btn"
            onClick={async () => {
              await logout();
              router.push("/login");
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-stone-300 bg-white text-xs font-medium text-stone-700 hover:text-red-700 hover:border-red-300"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Profile & Addresses */}
        <div className="lg:col-span-5 space-y-6">
          {/* Profile Card */}
          <div className="bg-white rounded-2xl border border-stone-200 p-6 space-y-4">
            <div className="flex items-center gap-2 border-b border-stone-100 pb-3">
              <UserIcon className="h-4 w-4 text-stone-700" />
              <h2 className="text-base font-serif text-stone-900">
                Profile Details
              </h2>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-stone-600 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  data-testid="profile-name-input"
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-stone-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-stone-600 mb-1">
                  Mobile Number
                </label>
                <input
                  type="tel"
                  data-testid="profile-phone-input"
                  value={profilePhone}
                  onChange={(e) => setProfilePhone(e.target.value)}
                  placeholder="9820112233"
                  className="w-full px-3 py-2 text-sm border border-stone-300 rounded-lg"
                />
              </div>
              <button
                type="submit"
                data-testid="save-profile-button"
                disabled={savingProfile}
                className="px-4 py-2 rounded-lg bg-stone-900 text-white text-xs font-medium hover:bg-stone-800"
              >
                {savingProfile ? "Saving..." : "Update Profile"}
              </button>
            </form>
          </div>

          {/* Delivery Addresses Card */}
          <div className="bg-white rounded-2xl border border-stone-200 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-stone-700" />
                <h2 className="text-base font-serif text-stone-900">
                  Saved Addresses
                </h2>
              </div>
              <button
                type="button"
                data-testid="toggle-add-address-btn"
                onClick={() => setShowAddressForm(!showAddressForm)}
                className="inline-flex items-center gap-1 text-xs font-semibold text-stone-900 hover:text-brand-700"
              >
                <Plus className="h-3.5 w-3.5" />
                Add New
              </button>
            </div>

            {showAddressForm && (
              <form
                onSubmit={handleAddAddress}
                className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-3"
              >
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-medium text-stone-600 mb-1">
                      Label
                    </label>
                    <input
                      type="text"
                      value={addrLabel}
                      onChange={(e) => setAddrLabel(e.target.value)}
                      placeholder="Home / Office"
                      className="w-full px-2.5 py-1.5 text-xs border border-stone-300 rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-stone-600 mb-1">
                      Phone *
                    </label>
                    <input
                      type="text"
                      data-testid="new-addr-phone"
                      value={addrPhone}
                      onChange={(e) => setAddrPhone(e.target.value)}
                      required
                      className="w-full px-2.5 py-1.5 text-xs border border-stone-300 rounded"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-stone-600 mb-1">
                    Recipient Full Name *
                  </label>
                  <input
                    type="text"
                    data-testid="new-addr-name"
                    value={addrFullName}
                    onChange={(e) => setAddrFullName(e.target.value)}
                    required
                    className="w-full px-2.5 py-1.5 text-xs border border-stone-300 rounded"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-stone-600 mb-1">
                    Street Address *
                  </label>
                  <input
                    type="text"
                    data-testid="new-addr-line1"
                    value={addrLine1}
                    onChange={(e) => setAddrLine1(e.target.value)}
                    required
                    className="w-full px-2.5 py-1.5 text-xs border border-stone-300 rounded"
                  />
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <input
                    type="text"
                    data-testid="new-addr-city"
                    value={addrCity}
                    onChange={(e) => setAddrCity(e.target.value)}
                    placeholder="City *"
                    required
                    className="px-2.5 py-1.5 text-xs border border-stone-300 rounded"
                  />
                  <input
                    type="text"
                    data-testid="new-addr-state"
                    value={addrState}
                    onChange={(e) => setAddrState(e.target.value)}
                    placeholder="State *"
                    required
                    className="px-2.5 py-1.5 text-xs border border-stone-300 rounded"
                  />
                  <input
                    type="text"
                    data-testid="new-addr-pin"
                    value={addrPostalCode}
                    onChange={(e) => setAddrPostalCode(e.target.value)}
                    placeholder="PIN *"
                    required
                    className="px-2.5 py-1.5 text-xs border border-stone-300 rounded"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAddressForm(false)}
                    className="px-3 py-1.5 text-xs text-stone-600"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    data-testid="save-new-addr-btn"
                    className="px-3.5 py-1.5 rounded bg-stone-900 text-white text-xs font-medium"
                  >
                    Save Address
                  </button>
                </div>
              </form>
            )}

            {user.addresses.length === 0 ? (
              <p className="text-xs text-stone-500">
                No delivery addresses saved yet.
              </p>
            ) : (
              <div className="space-y-3">
                {user.addresses.map((addr) => (
                  <div
                    key={addr.id}
                    className="p-3.5 rounded-xl border border-stone-200 flex items-start justify-between gap-3 text-xs"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-stone-900">
                          {addr.label}
                        </span>
                        {addr.isDefault && (
                          <span className="px-2 py-0.5 rounded bg-stone-100 text-stone-700 text-[10px] font-semibold">
                            Default
                          </span>
                        )}
                      </div>
                      <p className="text-stone-700">{addr.fullName}</p>
                      <p className="text-stone-500">
                        {addr.addressLine1}, {addr.city}, {addr.state}{" "}
                        {addr.postalCode}
                      </p>
                      <p className="text-stone-400">Tel: {addr.phone}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteAddress(addr.id)}
                      className="text-stone-400 hover:text-red-600 p-1"
                      aria-label="Delete address"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Order History */}
        <div className="lg:col-span-7">
          <div className="bg-white rounded-2xl border border-stone-200 p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-stone-700" />
                <h2 className="text-base font-serif text-stone-900">
                  Order History ({orders.length})
                </h2>
              </div>
            </div>

            {ordersLoading ? (
              <p className="text-xs text-stone-500 py-8 text-center">
                Loading your orders...
              </p>
            ) : orders.length === 0 ? (
              <div className="text-center py-12 space-y-3">
                <p className="text-sm text-stone-600">
                  You have not placed any orders yet.
                </p>
                <Link
                  href="/shop"
                  className="inline-block px-5 py-2.5 rounded-lg bg-stone-900 text-white text-xs font-medium"
                >
                  Browse Collection
                </Link>
              </div>
            ) : (
              <div
                data-testid="account-orders-list"
                className="space-y-4"
              >
                {orders.map((ord) => (
                  <div
                    key={ord.id}
                    data-testid={`account-order-${ord.orderNumber}`}
                    className="rounded-xl border border-stone-200 p-4 space-y-3 hover:border-stone-400 transition-colors"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-100 pb-3">
                      <div>
                        <span className="font-mono text-xs font-semibold text-stone-900">
                          {ord.orderNumber}
                        </span>
                        <span className="text-xs text-stone-400 ml-2">
                          • {new Date(ord.createdAt).toLocaleDateString("en-IN")}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                            ord.paymentStatus === "PAID"
                              ? "bg-emerald-100 text-emerald-900"
                              : "bg-amber-100 text-amber-900"
                          }`}
                        >
                          {ord.paymentStatus}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-stone-900 text-white">
                          {ord.fulfilmentStatus}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <div className="text-stone-600">
                        {ord.items.length}{" "}
                        {ord.items.length === 1 ? "item" : "items"}:{" "}
                        {ord.items.map((i) => i.productName).join(", ")}
                      </div>
                      <div className="text-sm font-semibold text-stone-900 shrink-0 ml-4">
                        {formatPrice(ord.totalAmount)}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <button
                        type="button"
                        onClick={() =>
                          setSelectedOrder(
                            selectedOrder?.id === ord.id ? null : ord
                          )
                        }
                        className="text-xs font-medium text-stone-700 underline hover:text-stone-950"
                      >
                        {selectedOrder?.id === ord.id
                          ? "Hide Order Summary"
                          : "Inspect Order Details"}
                      </button>
                      <Link
                        href={`/orders/${ord.orderNumber}/confirmation`}
                        className="text-xs font-medium text-brand-700 hover:underline"
                      >
                        Full Receipt →
                      </Link>
                    </div>

                    {selectedOrder?.id === ord.id && (
                      <div className="mt-3 pt-3 border-t border-stone-100 bg-stone-50 p-3.5 rounded-lg space-y-2 text-xs">
                        {ord.items.map((item) => (
                          <div
                            key={item.id}
                            className="flex justify-between text-stone-700"
                          >
                            <span>
                              {item.productName} ({item.size}/{item.color}) ×{" "}
                              {item.quantity}
                            </span>
                            <span className="font-medium">
                              {formatPrice(item.lineTotal)}
                            </span>
                          </div>
                        ))}
                        <div className="border-t border-stone-200 pt-2 flex justify-between text-stone-500">
                          <span>
                            Ship to: {ord.shippingAddress.addressLine1},{" "}
                            {ord.shippingAddress.city}
                          </span>
                          <span>Ref: {ord.paymentReference || "N/A"}</span>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

