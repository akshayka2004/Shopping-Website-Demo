"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ShoppingBag,
  User as UserIcon,
  Search,
  Menu,
  X,
  ShieldCheck,
  LogOut,
} from "lucide-react";
import { siteConfig, formatPrice } from "@/config/site";
import { useStore } from "@/context/StoreContext";

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, cartCount, logout } = useStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchQuery.trim();
    setSearchOpen(false);
    setMobileMenuOpen(false);
    if (q) {
      router.push(`/shop?q=${encodeURIComponent(q)}`);
    } else {
      router.push("/shop");
    }
  };

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/shop", label: "All Collection" },
    { href: "/shop?category=essentials", label: "Essentials" },
    { href: "/shop?category=menswear", label: "Menswear" },
    { href: "/shop?category=womenswear", label: "Womenswear" },
    { href: "/shop?category=outerwear", label: "Outerwear" },
    { href: "/about", label: "Our Story" },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-stone-200">
      {/* Top Promo Banner */}
      <div className="bg-brand-900 text-stone-100 text-xs py-2 px-4 text-center tracking-wide">
        Complimentary Express Delivery on all orders above{" "}
        <span className="font-semibold">
          {formatPrice(siteConfig.freeShippingThreshold)}
        </span>{" "}
        • 14-Day Easy Returns & Exchanges
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Mobile menu button */}
          <div className="flex items-center lg:hidden">
            <button
              type="button"
              data-testid="mobile-menu-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 -ml-2 text-stone-700 hover:text-stone-950"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>

          {/* Brand Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link
              href="/"
              data-testid="brand-logo"
              className="text-xl sm:text-2xl font-serif tracking-[0.18em] font-semibold text-stone-900"
            >
              {siteConfig.name}
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav
            aria-label="Main Navigation"
            className="hidden lg:flex lg:items-center lg:space-x-7"
          >
            {navLinks.map((link) => {
              const isActive =
                link.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(link.href.split("?")[0]) &&
                    link.href !== "/shop";
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-sm font-medium transition-colors ${
                    isActive
                      ? "text-stone-950 underline underline-offset-8 decoration-2"
                      : "text-stone-600 hover:text-stone-950"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Right Action Icons */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            <button
              type="button"
              data-testid="header-search-toggle"
              onClick={() => setSearchOpen(!searchOpen)}
              className="p-2 text-stone-700 hover:text-stone-950 transition-colors"
              aria-label="Search Products"
            >
              <Search className="h-5 w-5" />
            </button>

            {user?.role === "ADMIN" && (
              <Link
                href="/admin"
                data-testid="nav-admin-link"
                className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider px-3 py-1.5 rounded-full bg-amber-100 text-amber-900 hover:bg-amber-200 transition-colors"
              >
                <ShieldCheck className="h-3.5 w-3.5" />
                Admin Panel
              </Link>
            )}

            {user ? (
              <div className="flex items-center gap-2">
                <Link
                  href="/account"
                  data-testid="nav-account-link"
                  className="p-2 text-stone-700 hover:text-stone-950 flex items-center gap-1.5 text-sm font-medium"
                >
                  <UserIcon className="h-5 w-5" />
                  <span className="hidden md:inline max-w-[110px] truncate">
                    {user.name.split(" ")[0]}
                  </span>
                </Link>
                <button
                  type="button"
                  data-testid="nav-logout-button"
                  onClick={() => logout()}
                  title="Sign Out"
                  className="p-2 text-stone-500 hover:text-red-600 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                data-testid="nav-login-link"
                className="p-2 text-stone-700 hover:text-stone-950 flex items-center gap-1.5 text-sm font-medium"
              >
                <UserIcon className="h-5 w-5" />
                <span className="hidden sm:inline">Sign In</span>
              </Link>
            )}

            <Link
              href="/cart"
              data-testid="nav-cart-link"
              className="relative p-2 text-stone-700 hover:text-stone-950 transition-colors flex items-center"
              aria-label="Shopping Cart"
            >
              <ShoppingBag className="h-5 w-5" />
              <span
                data-testid="cart-badge-count"
                className="ml-1 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-semibold rounded-full bg-stone-900 text-white min-w-[20px]"
              >
                {cartCount}
              </span>
            </Link>
          </div>
        </div>

        {/* Expandable Search Bar */}
        {searchOpen && (
          <div className="py-3 border-t border-stone-100">
            <form
              onSubmit={handleSearchSubmit}
              className="flex items-center gap-2 max-w-xl mx-auto"
            >
              <div className="relative flex-1">
                <Search className="h-4 w-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="search"
                  data-testid="header-search-input"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search shirts, trousers, linen, merino, dresses..."
                  className="w-full pl-10 pr-4 py-2 text-sm border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-stone-900"
                  autoFocus
                />
              </div>
              <button
                type="submit"
                data-testid="header-search-submit"
                className="px-4 py-2 bg-stone-900 text-white text-sm font-medium rounded-md hover:bg-stone-800"
              >
                Search
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div
          data-testid="mobile-nav-drawer"
          className="lg:hidden border-t border-stone-200 bg-white px-4 pt-3 pb-6 space-y-3"
        >
          <form onSubmit={handleSearchSubmit} className="flex gap-2 mb-3">
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search catalogue..."
              className="flex-1 px-3 py-2 text-sm border border-stone-300 rounded-md"
            />
            <button
              type="submit"
              className="px-3 py-2 bg-stone-900 text-white text-sm rounded-md"
            >
              Go
            </button>
          </form>
          <div className="flex flex-col space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="py-2 text-base font-medium text-stone-800 hover:text-stone-950 border-b border-stone-100"
              >
                {link.label}
              </Link>
            ))}
            {user?.role === "ADMIN" && (
              <Link
                href="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2 text-base font-semibold text-amber-800"
              >
                Admin Dashboard
              </Link>
            )}
            <Link
              href={user ? "/account" : "/login"}
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 text-base font-medium text-stone-700"
            >
              {user ? `My Account (${user.name})` : "Customer Sign In / Register"}
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

