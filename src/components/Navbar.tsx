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
  ChevronRight,
  Sparkles,
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
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200">
      {/* Top Promo Banner - compact on mobile */}
      <div className="bg-brand-900 text-stone-100 text-[11px] sm:text-xs py-1.5 px-3 text-center tracking-wide flex items-center justify-center gap-1.5">
        <Sparkles className="h-3 w-3 text-amber-300 shrink-0 hidden sm:inline" />
        <span>
          Complimentary Delivery over{" "}
          <strong className="font-semibold text-white">
            {formatPrice(siteConfig.freeShippingThreshold)}
          </strong>{" "}
          <span className="hidden sm:inline">• 14-Day Easy Returns</span>
        </span>
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16">
          {/* Mobile menu trigger */}
          <div className="flex items-center lg:hidden">
            <button
              type="button"
              data-testid="mobile-menu-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2.5 -ml-2 text-stone-800 hover:text-stone-950 focus:outline-none focus:ring-2 focus:ring-stone-900 rounded-md min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label="Toggle Navigation Menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>

          {/* Brand Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link
              href="/"
              data-testid="brand-logo"
              className="text-lg sm:text-2xl font-serif tracking-[0.16em] sm:tracking-[0.18em] font-semibold text-stone-900 active:opacity-80"
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
          <div className="flex items-center space-x-1 sm:space-x-3">
            <button
              type="button"
              data-testid="header-search-toggle"
              onClick={() => setSearchOpen(!searchOpen)}
              className="p-2 sm:p-2.5 text-stone-700 hover:text-stone-950 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
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
              <div className="flex items-center">
                <Link
                  href="/account"
                  data-testid="nav-account-link"
                  className="p-2 sm:p-2.5 text-stone-700 hover:text-stone-950 flex items-center gap-1.5 text-sm font-medium min-h-[44px] min-w-[44px]"
                  aria-label="My Account"
                >
                  <UserIcon className="h-5 w-5" />
                  <span className="hidden md:inline max-w-[100px] truncate">
                    {user.name.split(" ")[0]}
                  </span>
                </Link>
                <button
                  type="button"
                  data-testid="nav-logout-button"
                  onClick={() => logout()}
                  title="Sign Out"
                  className="hidden sm:inline-flex p-2 text-stone-400 hover:text-red-600 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                data-testid="nav-login-link"
                className="p-2 sm:p-2.5 text-stone-700 hover:text-stone-950 flex items-center gap-1.5 text-sm font-medium min-h-[44px] min-w-[44px]"
              >
                <UserIcon className="h-5 w-5" />
                <span className="hidden sm:inline text-xs font-medium">
                  Sign In
                </span>
              </Link>
            )}

            <Link
              href="/cart"
              data-testid="nav-cart-link"
              className="relative p-2 sm:p-2.5 text-stone-700 hover:text-stone-950 transition-colors flex items-center min-h-[44px] min-w-[44px] justify-center"
              aria-label="Shopping Cart"
            >
              <ShoppingBag className="h-5 w-5" />
              <span
                data-testid="cart-badge-count"
                className="ml-1 inline-flex items-center justify-center px-1.5 py-0.5 text-[11px] font-semibold rounded-full bg-stone-900 text-white min-w-[18px] sm:min-w-[20px]"
              >
                {cartCount}
              </span>
            </Link>
          </div>
        </div>

        {/* Expandable Search Bar */}
        {searchOpen && (
          <div className="py-2.5 sm:py-3 border-t border-stone-100 animate-in fade-in slide-in-from-top-1 duration-150">
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
                  className="w-full pl-10 pr-4 py-2 text-base sm:text-sm border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-900"
                  autoFocus
                />
              </div>
              <button
                type="submit"
                data-testid="header-search-submit"
                className="px-4 py-2 bg-stone-900 text-white text-sm font-medium rounded-lg hover:bg-stone-800 min-h-[40px]"
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
          className="lg:hidden border-t border-stone-200 bg-white/98 backdrop-blur-md px-4 pt-4 pb-8 space-y-4 shadow-xl max-h-[85vh] overflow-y-auto animate-in slide-in-from-top-2 duration-200"
        >
          <form onSubmit={handleSearchSubmit} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="h-4 w-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search garments..."
                className="w-full pl-9 pr-3 py-2.5 text-base sm:text-sm border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-900"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2.5 bg-stone-900 text-white text-sm font-medium rounded-lg"
            >
              Go
            </button>
          </form>

          <div className="flex flex-col divide-y divide-stone-100 text-stone-800 font-medium">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="py-3 flex items-center justify-between text-base hover:text-stone-950 active:bg-stone-50"
              >
                <span>{link.label}</span>
                <ChevronRight className="h-4 w-4 text-stone-400" />
              </Link>
            ))}

            {user?.role === "ADMIN" && (
              <Link
                href="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="py-3 flex items-center justify-between text-base font-semibold text-amber-900"
              >
                <span className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-amber-700" />
                  Admin Dashboard
                </span>
                <ChevronRight className="h-4 w-4 text-amber-700" />
              </Link>
            )}

            <div className="pt-3 flex flex-col gap-2">
              {user ? (
                <>
                  <Link
                    href="/account"
                    onClick={() => setMobileMenuOpen(false)}
                    className="py-2.5 text-sm text-stone-700 font-normal flex items-center justify-between"
                  >
                    <span>My Account ({user.name})</span>
                    <ChevronRight className="h-4 w-4 text-stone-400" />
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                    }}
                    className="py-2 text-sm text-red-700 text-left flex items-center gap-2"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </button>
                </>
              ) : (
                <div className="grid grid-cols-2 gap-2 pt-2">
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="py-2.5 text-center text-sm font-semibold border border-stone-300 rounded-lg text-stone-800"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="py-2.5 text-center text-sm font-semibold bg-stone-900 text-white rounded-lg"
                  >
                    Create Account
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
