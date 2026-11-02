import React from "react";
import Link from "next/link";
import { siteConfig } from "@/config/site";

export function Footer() {
  return (
    <footer className="bg-stone-950 text-stone-300 border-t border-stone-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand Column */}
          <div className="space-y-4">
            <Link
              href="/"
              className="text-xl font-serif tracking-[0.18em] font-semibold text-white"
            >
              {siteConfig.name}
            </Link>
            <p className="text-sm text-stone-400 leading-relaxed">
              {siteConfig.description}
            </p>
            <div className="text-xs text-stone-400 space-y-1 pt-1">
              <p>{siteConfig.contact.address}</p>
              <p>
                Email:{" "}
                <a
                  href={`mailto:${siteConfig.contact.email}`}
                  className="underline hover:text-white"
                >
                  {siteConfig.contact.email}
                </a>
              </p>
              <p>Tel: {siteConfig.contact.phone}</p>
            </div>
          </div>

          {/* Collections */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-white mb-4">
              Collections
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link
                  href="/shop"
                  className="hover:text-white transition-colors"
                >
                  All Clothing
                </Link>
              </li>
              <li>
                <Link
                  href="/shop?category=essentials"
                  className="hover:text-white transition-colors"
                >
                  Wardrobe Essentials
                </Link>
              </li>
              <li>
                <Link
                  href="/shop?category=menswear"
                  className="hover:text-white transition-colors"
                >
                  Menswear Collection
                </Link>
              </li>
              <li>
                <Link
                  href="/shop?category=womenswear"
                  className="hover:text-white transition-colors"
                >
                  Womenswear Collection
                </Link>
              </li>
              <li>
                <Link
                  href="/shop?category=outerwear"
                  className="hover:text-white transition-colors"
                >
                  Outerwear & Knitwear
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Care */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-white mb-4">
              Customer Care & Info
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link
                  href="/about"
                  className="hover:text-white transition-colors"
                >
                  About Our Atelier
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="hover:text-white transition-colors"
                >
                  Contact & Store Hours
                </Link>
              </li>
              <li>
                <Link
                  href="/account"
                  className="hover:text-white transition-colors"
                >
                  My Account & Order History
                </Link>
              </li>
              <li>
                <Link
                  href="/admin"
                  className="hover:text-white transition-colors"
                >
                  Store Management Portal
                </Link>
              </li>
            </ul>
          </div>

          {/* Store Policies */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-white mb-4">
              Policies & Legal
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link
                  href="/policies/shipping"
                  className="hover:text-white transition-colors"
                >
                  Shipping & Delivery Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/policies/returns"
                  className="hover:text-white transition-colors"
                >
                  Returns, Exchanges & Refunds
                </Link>
              </li>
              <li>
                <Link
                  href="/policies/privacy"
                  className="hover:text-white transition-colors"
                >
                  Privacy & Data Handling
                </Link>
              </li>
              <li>
                <Link
                  href="/policies/terms"
                  className="hover:text-white transition-colors"
                >
                  Terms & Conditions
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-stone-800 flex flex-col sm:flex-row items-center justify-between text-xs text-stone-500 gap-4">
          <p>
            © {new Date().getFullYear()} {siteConfig.name}. All rights reserved.
          </p>
          <p>
            Secured with SSL Encryption • Payments processed via Razorpay
          </p>
        </div>
      </div>
    </footer>
  );
}

