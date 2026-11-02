"use client";

import React from "react";
import Link from "next/link";
import { formatPrice } from "@/config/site";
import { Product } from "@/types/store";

export function ProductCard({ product }: { product: Product }) {
  const totalStock = product.variants.reduce((sum, v) => sum + v.stock, 0);
  const uniqueSizes = Array.from(new Set(product.variants.map((v) => v.size)));
  const uniqueColors = Array.from(
    new Map(
      product.variants.map((v) => [
        v.color,
        { name: v.color, hex: v.colorHex },
      ])
    ).values()
  );

  return (
    <div
      data-testid={`product-card-${product.slug}`}
      className="group flex flex-col bg-white rounded-xl overflow-hidden border border-stone-200/80 hover:border-stone-400 transition-all hover:shadow-md"
    >
      <Link
        href={`/product/${product.slug}`}
        className="relative aspect-[4/5] bg-stone-100 overflow-hidden block"
        aria-label={product.title}
      >
        <img
          src={product.images[0] || "/images/products/heavyweight-tee.jpg"}
          alt={product.title}
          loading="lazy"
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
        />

        {/* Badges */}
        <div className="absolute top-2.5 left-2.5 sm:top-3 sm:left-3 flex flex-col gap-1">
          {totalStock === 0 ? (
            <span className="px-2 py-0.5 text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider bg-red-900 text-white rounded">
              Sold Out
            </span>
          ) : totalStock <= 10 ? (
            <span className="px-2 py-0.5 text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider bg-amber-800 text-white rounded">
              Low Stock
            </span>
          ) : product.isFeatured ? (
            <span className="px-2 py-0.5 text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider bg-stone-900/90 text-white rounded">
              Featured
            </span>
          ) : null}
        </div>
      </Link>

      <div className="p-3 sm:p-4 flex flex-col flex-1 justify-between space-y-2.5 sm:space-y-3">
        <div>
          <p className="text-[10px] sm:text-xs uppercase tracking-wider text-stone-500 mb-0.5 truncate">
            {product.categoryName}
          </p>
          <Link
            href={`/product/${product.slug}`}
            className="text-xs sm:text-base font-medium text-stone-900 group-hover:text-brand-700 transition-colors line-clamp-2 leading-snug"
          >
            {product.title}
          </Link>
        </div>

        <div className="space-y-2">
          <div className="flex items-baseline gap-1.5 sm:gap-2">
            <span className="text-sm sm:text-base font-semibold text-stone-900">
              {formatPrice(product.price)}
            </span>
            {product.compareAtPrice && product.compareAtPrice > product.price && (
              <span className="text-[11px] sm:text-xs text-stone-400 line-through">
                {formatPrice(product.compareAtPrice)}
              </span>
            )}
          </div>

          <div className="flex items-center justify-between pt-1 border-t border-stone-100 text-[10px] sm:text-xs text-stone-500 gap-1">
            <div className="flex items-center gap-1 shrink-0">
              {uniqueColors.slice(0, 3).map((c) => (
                <span
                  key={c.name}
                  title={c.name}
                  className="w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full border border-stone-300 inline-block"
                  style={{ backgroundColor: c.hex }}
                />
              ))}
              {uniqueColors.length > 3 && (
                <span className="text-[9px] text-stone-400">
                  +{uniqueColors.length - 3}
                </span>
              )}
            </div>
            <span className="truncate">
              Sizes: {uniqueSizes.slice(0, 3).join(",")}{uniqueSizes.length > 3 ? "…" : ""}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
