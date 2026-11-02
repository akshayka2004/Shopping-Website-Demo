"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Compass, ShoppingBag, User as UserIcon, ShieldCheck } from "lucide-react";
import { useStore } from "@/context/StoreContext";

export function MobileBottomNav() {
  const pathname = usePathname();
  const { user, cartCount } = useStore();

  const navItems = [
    {
      href: "/",
      label: "Home",
      icon: Home,
      isActive: pathname === "/",
    },
    {
      href: "/shop",
      label: "Shop",
      icon: Compass,
      isActive: pathname.startsWith("/shop") || pathname.startsWith("/product/"),
    },
    {
      href: "/cart",
      label: "Bag",
      icon: ShoppingBag,
      isActive: pathname === "/cart" || pathname === "/checkout",
      badge: cartCount,
    },
    {
      href: user ? "/account" : "/login",
      label: user ? "Account" : "Sign In",
      icon: UserIcon,
      isActive:
        pathname === "/account" ||
        pathname === "/login" ||
        pathname === "/register",
    },
  ];

  if (user?.role === "ADMIN") {
    navItems.push({
      href: "/admin",
      label: "Admin",
      icon: ShieldCheck,
      isActive: pathname.startsWith("/admin"),
      badge: undefined,
    });
  }

  return (
    <nav
      data-testid="mobile-bottom-nav"
      aria-label="Mobile Navigation"
      className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-white/95 backdrop-blur-md border-t border-stone-200 px-2 py-1.5 shadow-[0_-4px_16px_rgba(0,0,0,0.04)]"
      style={{ paddingBottom: "max(0.375rem, env(safe-area-inset-bottom))" }}
    >
      <div className="grid grid-flow-col auto-cols-fr items-center text-center">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              data-testid={`mobile-nav-${item.label.toLowerCase().replace(/\s+/g, "-")}`}
              className={`relative flex flex-col items-center justify-center py-1.5 px-1 min-h-[44px] transition-colors ${
                item.isActive
                  ? "text-stone-950 font-semibold"
                  : "text-stone-500 hover:text-stone-900"
              }`}
            >
              <div className="relative">
                <Icon
                  className={`h-5 w-5 ${
                    item.isActive ? "stroke-[2.2]" : "stroke-[1.7]"
                  }`}
                />
                {typeof item.badge === "number" && item.badge > 0 && (
                  <span
                    data-testid="mobile-bottom-badge"
                    className="absolute -top-1.5 -right-2 bg-stone-900 text-white text-[10px] font-bold rounded-full h-4 min-w-[16px] px-1 flex items-center justify-center"
                  >
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight">
                {item.label}
              </span>
              {item.isActive && (
                <span className="absolute bottom-0.5 w-6 h-0.5 bg-stone-900 rounded-full" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
