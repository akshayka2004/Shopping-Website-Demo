"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  Check,
  ChevronRight,
  Minus,
  Plus,
  ShieldCheck,
  ShoppingBag,
  Truck,
  RefreshCw,
} from "lucide-react";
import { formatPrice, siteConfig } from "@/config/site";
import { useStore } from "@/context/StoreContext";
import { Product } from "@/types/store";
import { ProductCard } from "@/components/ProductCard";

export default function ProductDetailPage() {
  const params = useParams<{ slug: string }>();
  const router = useRouter();
  const { addToCart } = useStore();

  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedColor, setSelectedColor] = useState<string>("");
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [quantity, setQuantity] = useState<number>(1);
  const [activeImage, setActiveImage] = useState<string>("");

  useEffect(() => {
    async function loadProduct() {
      setLoading(true);
      try {
        const res = await fetch(`/api/products/${params.slug}`, {
          cache: "no-store",
        });
        if (!res.ok) {
          setProduct(null);
          return;
        }
        const data = await res.json();
        const loaded: Product = data.product;
        setProduct(loaded);
        setActiveImage(
          loaded.images[0] || "/images/products/heavyweight-tee.jpg"
        );

        const firstAvailable =
          loaded.variants.find((v) => v.stock > 0) || loaded.variants[0];
        if (firstAvailable) {
          setSelectedColor(firstAvailable.color);
          setSelectedSize(firstAvailable.size);
        }

        const allRes = await fetch("/api/products", { cache: "no-store" });
        const allData = await allRes.json();
        const others = (allData.products || [])
          .filter((p: Product) => p.id !== loaded.id)
          .slice(0, 4);
        setRelatedProducts(others);
      } finally {
        setLoading(false);
      }
    }
    if (params.slug) {
      loadProduct();
    }
  }, [params.slug]);

  const uniqueColors = useMemo(() => {
    if (!product) return [];
    return Array.from(
      new Map(
        product.variants.map((v) => [
          v.color,
          { color: v.color, colorHex: v.colorHex },
        ])
      ).values()
    );
  }, [product]);

  const availableSizesForColor = useMemo(() => {
    if (!product) return [];
    return product.variants.filter((v) => v.color === selectedColor);
  }, [product, selectedColor]);

  const currentVariant = useMemo(() => {
    if (!product) return null;
    return (
      product.variants.find(
        (v) => v.color === selectedColor && v.size === selectedSize
      ) ||
      availableSizesForColor[0] ||
      product.variants[0] ||
      null
    );
  }, [product, selectedColor, selectedSize, availableSizesForColor]);

  useEffect(() => {
    if (currentVariant && quantity > currentVariant.stock) {
      setQuantity(Math.max(1, currentVariant.stock));
    }
  }, [currentVariant, quantity]);

  const handleColorChange = (color: string) => {
    setSelectedColor(color);
    if (!product) return;
    const matching = product.variants.find(
      (v) => v.color === color && v.size === selectedSize
    );
    if (!matching) {
      const firstForColor = product.variants.find((v) => v.color === color);
      if (firstForColor) setSelectedSize(firstForColor.size);
    }
  };

  const handleAddToCart = (redirectToCheckout = false) => {
    if (!product || !currentVariant || currentVariant.stock <= 0) return;

    addToCart({
      productId: product.id,
      productSlug: product.slug,
      title: product.title,
      image: product.images[0] || "/images/products/heavyweight-tee.jpg",
      price: product.price,
      variantId: currentVariant.id,
      size: currentVariant.size,
      color: currentVariant.color,
      colorHex: currentVariant.colorHex,
      sku: currentVariant.sku,
      quantity,
      maxStock: currentVariant.stock,
    });

    if (redirectToCheckout) {
      router.push("/checkout");
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="aspect-[4/5] bg-stone-200 rounded-2xl animate-pulse" />
          <div className="space-y-6">
            <div className="h-8 bg-stone-200 rounded w-3/4 animate-pulse" />
            <div className="h-6 bg-stone-200 rounded w-1/4 animate-pulse" />
            <div className="h-32 bg-stone-200 rounded animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-4">
        <h1 className="text-2xl font-serif text-stone-900">
          Garment Not Found
        </h1>
        <p className="text-sm text-stone-500">
          The product you are looking for may have been moved or discontinued.
        </p>
        <Link
          href="/shop"
          className="inline-block px-6 py-3 bg-stone-900 text-white text-sm font-medium rounded-md"
        >
          Return to Catalogue
        </Link>
      </div>
    );
  }

  const inStock = currentVariant ? currentVariant.stock > 0 : false;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-16">
      {/* Breadcrumb */}
      <nav
        aria-label="Breadcrumb"
        className="flex items-center gap-2 text-xs text-stone-500"
      >
        <Link href="/" className="hover:text-stone-900">
          Home
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link href="/shop" className="hover:text-stone-900">
          Shop
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link
          href={`/shop?category=${product.categorySlug}`}
          className="hover:text-stone-900"
        >
          {product.categoryName}
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-stone-900 font-medium truncate">
          {product.title}
        </span>
      </nav>

      {/* Main Product Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14">
        {/* Image Gallery */}
        <div className="lg:col-span-6 space-y-4">
          <div className="aspect-[4/5] rounded-2xl overflow-hidden bg-stone-100 border border-stone-200">
            <img
              src={activeImage}
              alt={product.title}
              data-testid="product-main-image"
              className="w-full h-full object-cover object-center"
            />
          </div>
          {product.images.length > 1 && (
            <div className="flex gap-3">
              {product.images.map((img) => (
                <button
                  key={img}
                  type="button"
                  onClick={() => setActiveImage(img)}
                  className={`w-20 aspect-[4/5] rounded-lg overflow-hidden border-2 ${
                    activeImage === img
                      ? "border-stone-900"
                      : "border-transparent opacity-70"
                  }`}
                >
                  <img
                    src={img}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info & Variant Selector */}
        <div className="lg:col-span-6 space-y-6">
          <div className="space-y-2 border-b border-stone-200 pb-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-widest text-brand-700">
                {product.categoryName}
              </span>
              {currentVariant && (
                <span className="text-xs text-stone-400 font-mono">
                  SKU: {currentVariant.sku}
                </span>
              )}
            </div>

            <h1
              data-testid="product-detail-title"
              className="text-2xl sm:text-3xl font-serif text-stone-900"
            >
              {product.title}
            </h1>

            <div className="flex items-baseline gap-3 pt-1">
              <span
                data-testid="product-detail-price"
                className="text-2xl font-semibold text-stone-900"
              >
                {formatPrice(product.price)}
              </span>
              {product.compareAtPrice &&
                product.compareAtPrice > product.price && (
                  <span className="text-sm text-stone-400 line-through">
                    {formatPrice(product.compareAtPrice)}
                  </span>
                )}
              <span className="text-xs text-stone-500">
                (Inclusive of all taxes)
              </span>
            </div>
          </div>

          <p className="text-sm sm:text-base text-stone-600 leading-relaxed">
            {product.description}
          </p>

          {/* Colour Selection */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-stone-900">
                Colour:{" "}
                <span
                  data-testid="selected-color-label"
                  className="text-stone-600 font-normal"
                >
                  {selectedColor}
                </span>
              </span>
            </div>
            <div className="flex flex-wrap gap-3">
              {uniqueColors.map((c) => {
                const isSelected = c.color === selectedColor;
                return (
                  <button
                    key={c.color}
                    type="button"
                    data-testid={`variant-color-${c.color.toLowerCase()}`}
                    onClick={() => handleColorChange(c.color)}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-lg border text-xs font-medium transition-all ${
                      isSelected
                        ? "border-stone-900 bg-stone-900 text-white shadow-sm"
                        : "border-stone-300 bg-white text-stone-800 hover:border-stone-500"
                    }`}
                  >
                    <span
                      className="w-3.5 h-3.5 rounded-full border border-white/40"
                      style={{ backgroundColor: c.colorHex }}
                    />
                    {c.color}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Size Selection */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-stone-900">
                Size:{" "}
                <span
                  data-testid="selected-size-label"
                  className="text-stone-600 font-normal"
                >
                  {selectedSize}
                </span>
              </span>
              <span className="text-xs text-stone-500">
                Standard Contemporary Fit
              </span>
            </div>
            <div className="flex flex-wrap gap-2.5">
              {availableSizesForColor.map((v) => {
                const isSelected = v.size === selectedSize;
                const isOut = v.stock <= 0;
                return (
                  <button
                    key={v.id}
                    type="button"
                    data-testid={`variant-size-${v.size.toLowerCase()}`}
                    onClick={() => setSelectedSize(v.size)}
                    className={`min-w-[52px] px-4 py-2.5 rounded-lg border text-xs font-semibold transition-all ${
                      isSelected
                        ? "border-stone-900 bg-stone-900 text-white"
                        : isOut
                        ? "border-stone-200 bg-stone-100 text-stone-400 line-through"
                        : "border-stone-300 bg-white text-stone-800 hover:border-stone-600"
                    }`}
                  >
                    {v.size}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Stock Status Indicator */}
          <div
            data-testid="variant-stock-status"
            className="flex items-center gap-2 text-xs font-medium"
          >
            {inStock && currentVariant ? (
              <>
                <span className="w-2 h-2 rounded-full bg-emerald-600" />
                <span className="text-emerald-800">
                  In Stock — {currentVariant.stock} units available in{" "}
                  {currentVariant.size} / {currentVariant.color}
                </span>
              </>
            ) : (
              <>
                <span className="w-2 h-2 rounded-full bg-red-600" />
                <span className="text-red-700">
                  Currently Out of Stock in this variant
                </span>
              </>
            )}
          </div>

          {/* Quantity & Actions */}
          <div className="pt-2 space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center border border-stone-300 rounded-lg bg-white">
                <button
                  type="button"
                  data-testid="qty-decrease-btn"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={!inStock || quantity <= 1}
                  className="p-3 text-stone-700 hover:text-stone-950 disabled:opacity-40"
                  aria-label="Decrease Quantity"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span
                  data-testid="product-quantity-value"
                  className="w-10 text-center text-sm font-semibold"
                >
                  {quantity}
                </span>
                <button
                  type="button"
                  data-testid="qty-increase-btn"
                  onClick={() =>
                    setQuantity((q) =>
                      currentVariant ? Math.min(currentVariant.stock, q + 1) : q
                    )
                  }
                  disabled={
                    !inStock ||
                    (currentVariant ? quantity >= currentVariant.stock : true)
                  }
                  className="p-3 text-stone-700 hover:text-stone-950 disabled:opacity-40"
                  aria-label="Increase Quantity"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>

              <button
                type="button"
                data-testid="add-to-cart-button"
                disabled={!inStock}
                onClick={() => handleAddToCart(false)}
                className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg bg-stone-900 text-white text-sm font-medium hover:bg-stone-800 disabled:bg-stone-300 disabled:cursor-not-allowed transition-colors"
              >
                <ShoppingBag className="h-4 w-4" />
                {inStock ? "Add to Cart" : "Out of Stock"}
              </button>
            </div>

            {inStock && (
              <button
                type="button"
                data-testid="buy-now-button"
                onClick={() => handleAddToCart(true)}
                className="w-full py-3 rounded-lg border border-stone-900 text-stone-900 text-sm font-medium hover:bg-stone-100 transition-colors"
              >
                Buy It Now — Instant Checkout
              </button>
            )}
          </div>

          {/* Fabric & Care Details */}
          <div className="border-t border-stone-200 pt-5 space-y-3 text-xs text-stone-600">
            <div>
              <h3 className="font-semibold uppercase tracking-wider text-stone-900 mb-1">
                Fabric & Care Instructions
              </h3>
              <p>{product.fabricAndCare}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3">
              <div className="flex items-center gap-2 bg-stone-100 p-3 rounded-lg">
                <Truck className="h-4 w-4 text-stone-700 shrink-0" />
                <span>
                  Free shipping over{" "}
                  {formatPrice(siteConfig.freeShippingThreshold)}
                </span>
              </div>
              <div className="flex items-center gap-2 bg-stone-100 p-3 rounded-lg">
                <RefreshCw className="h-4 w-4 text-stone-700 shrink-0" />
                <span>14-day hassle-free size exchange</span>
              </div>
              <div className="flex items-center gap-2 bg-stone-100 p-3 rounded-lg">
                <ShieldCheck className="h-4 w-4 text-stone-700 shrink-0" />
                <span>Quality checked before dispatch</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="pt-10 border-t border-stone-200 space-y-6">
          <h2 className="text-2xl font-serif text-stone-900">
            You May Also Like
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((rel) => (
              <ProductCard key={rel.id} product={rel} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

