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
      >
        <img
          src={product.images[0] || "/images/products/heavyweight-tee.jpg"}
          alt={product.title}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
        />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {totalStock === 0 ? (
            <span className="px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider bg-red-900 text-white rounded">
              Sold Out
            </span>
          ) : totalStock <= 10 ? (
            <span className="px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider bg-amber-800 text-white rounded">
              Low Stock
            </span>
          ) : product.isFeatured ? (
            <span className="px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider bg-stone-900/90 text-white rounded">
              Featured
            </span>
          ) : null}
        </div>
      </Link>

      <div className="p-4 flex flex-col flex-1 justify-between space-y-3">
        <div>
          <p className="text-xs uppercase tracking-wider text-stone-500 mb-1">
            {product.categoryName}
          </p>
          <Link
            href={`/product/${product.slug}`}
            className="text-base font-medium text-stone-900 group-hover:text-brand-700 transition-colors line-clamp-1"
          >
            {product.title}
          </Link>
        </div>

        <div className="space-y-2.5">
          <div className="flex items-baseline gap-2">
            <span className="text-base font-semibold text-stone-900">
              {formatPrice(product.price)}
            </span>
            {product.compareAtPrice && product.compareAtPrice > product.price && (
              <span className="text-xs text-stone-400 line-through">
                {formatPrice(product.compareAtPrice)}
              </span>
            )}
          </div>

          <div className="flex items-center justify-between pt-1 border-t border-stone-100 text-xs text-stone-500">
            <div className="flex items-center gap-1.5">
              {uniqueColors.map((c) => (
                <span
                  key={c.name}
                  title={c.name}
                  className="w-3.5 h-3.5 rounded-full border border-stone-300 inline-block"
                  style={{ backgroundColor: c.hex }}
                />
              ))}
            </div>
            <span>Sizes: {uniqueSizes.join(", ")}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

