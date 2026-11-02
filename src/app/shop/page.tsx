"use client";

import React, { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { ProductCard } from "@/components/ProductCard";
import { Category, Product } from "@/types/store";

function ShopCatalogueContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [selectedCategory, setSelectedCategory] = useState(
    searchParams.get("category") || "all"
  );
  const [selectedSize, setSelectedSize] = useState(
    searchParams.get("size") || ""
  );
  const [selectedColor, setSelectedColor] = useState(
    searchParams.get("color") || ""
  );
  const [priceRange, setPriceRange] = useState("all");
  const [sortBy, setSortBy] = useState("featured");
  const [inStockOnly, setInStockOnly] = useState(false);

  useEffect(() => {
    const qParam = searchParams.get("q");
    const catParam = searchParams.get("category");
    if (qParam !== null) setSearchQuery(qParam);
    if (catParam !== null) setSelectedCategory(catParam);
  }, [searchParams]);

  useEffect(() => {
    async function loadInitial() {
      setLoading(true);
      try {
        const [prodRes, catRes] = await Promise.all([
          fetch("/api/products", { cache: "no-store" }),
          fetch("/api/categories", { cache: "no-store" }),
        ]);
        const prodData = await prodRes.json();
        const catData = await catRes.json();
        setProducts(prodData.products || []);
        setCategories(catData.categories || []);
      } finally {
        setLoading(false);
      }
    }
    loadInitial();
  }, []);

  const allSizes = ["XS", "S", "M", "L", "XL"];
  const allColors = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => p.variants.forEach((v) => set.add(v.color)));
    return Array.from(set);
  }, [products]);

  const filteredProducts = useMemo(() => {
    let list = [...products];

    if (selectedCategory && selectedCategory !== "all") {
      list = list.filter(
        (p) =>
          p.categorySlug.toLowerCase() === selectedCategory.toLowerCase() ||
          p.categoryId.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    const q = searchQuery.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.categoryName.toLowerCase().includes(q)
      );
    }

    if (selectedSize) {
      list = list.filter((p) =>
        p.variants.some(
          (v) =>
            v.size.toUpperCase() === selectedSize.toUpperCase() && v.stock > 0
        )
      );
    }

    if (selectedColor) {
      list = list.filter((p) =>
        p.variants.some(
          (v) => v.color.toLowerCase() === selectedColor.toLowerCase()
        )
      );
    }

    if (priceRange === "under-2000") {
      list = list.filter((p) => p.price < 2000);
    } else if (priceRange === "2000-4000") {
      list = list.filter((p) => p.price >= 2000 && p.price <= 4000);
    } else if (priceRange === "above-4000") {
      list = list.filter((p) => p.price > 4000);
    }

    if (inStockOnly) {
      list = list.filter((p) => p.variants.some((v) => v.stock > 0));
    }

    if (sortBy === "price-asc") {
      list.sort((a, b) => a.price - b.price);
    } else if (sortBy === "price-desc") {
      list.sort((a, b) => b.price - a.price);
    } else if (sortBy === "newest") {
      list.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    } else if (sortBy === "name-asc") {
      list.sort((a, b) => a.title.localeCompare(b.title));
    } else {
      list.sort((a, b) => Number(b.isFeatured) - Number(a.isFeatured));
    }

    return list;
  }, [
    products,
    selectedCategory,
    searchQuery,
    selectedSize,
    selectedColor,
    priceRange,
    inStockOnly,
    sortBy,
  ]);

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("all");
    setSelectedSize("");
    setSelectedColor("");
    setPriceRange("all");
    setInStockOnly(false);
    setSortBy("featured");
    router.replace("/shop");
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Page Header */}
      <div className="border-b border-stone-200 pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-brand-700">
            Store Catalogue
          </p>
          <h1
            data-testid="catalogue-heading"
            className="text-3xl sm:text-4xl font-serif text-stone-900 mt-1"
          >
            {selectedCategory === "all"
              ? "All Clothing & Essentials"
              : categories.find((c) => c.slug === selectedCategory)?.name ||
                "Collection"}
          </h1>
        </div>
        <p
          data-testid="catalogue-count"
          className="text-sm text-stone-600 font-medium"
        >
          Showing {filteredProducts.length} of {products.length} garments
        </p>
      </div>

      {/* Search & Filter Controls */}
      <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-sm space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          {/* Keyword Search */}
          <div className="md:col-span-5 relative">
            <Search className="h-4 w-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="search"
              data-testid="shop-search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by garment name, fabric, or style..."
              className="w-full pl-10 pr-4 py-2.5 text-sm border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-900"
            />
          </div>

          {/* Price Filter */}
          <div className="md:col-span-3">
            <select
              aria-label="Filter by Price"
              data-testid="shop-price-filter"
              value={priceRange}
              onChange={(e) => setPriceRange(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm border border-stone-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-stone-900"
            >
              <option value="all">All Prices</option>
              <option value="under-2000">Under ₹2,000</option>
              <option value="2000-4000">₹2,000 – ₹4,000</option>
              <option value="above-4000">Above ₹4,000</option>
            </select>
          </div>

          {/* Sort Select */}
          <div className="md:col-span-4">
            <select
              aria-label="Sort Products"
              data-testid="shop-sort-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm border border-stone-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-stone-900"
            >
              <option value="featured">Sort by: Featured</option>
              <option value="newest">Sort by: Newest Arrivals</option>
              <option value="price-asc">Sort by: Price (Low to High)</option>
              <option value="price-desc">Sort by: Price (High to Low)</option>
              <option value="name-asc">Sort by: Name (A – Z)</option>
            </select>
          </div>
        </div>

        {/* Category Pills, Size Pills, Color Pills */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-stone-100">
          {/* Categories */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-stone-500 mr-1 flex items-center gap-1">
              <SlidersHorizontal className="h-3.5 w-3.5" />
              Category:
            </span>
            <button
              type="button"
              data-testid="filter-category-all"
              onClick={() => setSelectedCategory("all")}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                selectedCategory === "all"
                  ? "bg-stone-900 text-white"
                  : "bg-stone-100 text-stone-700 hover:bg-stone-200"
              }`}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                data-testid={`filter-category-${cat.slug}`}
                onClick={() => setSelectedCategory(cat.slug)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  selectedCategory === cat.slug
                    ? "bg-stone-900 text-white"
                    : "bg-stone-100 text-stone-700 hover:bg-stone-200"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Size & Color Filters */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-stone-500 font-medium">Size:</span>
              {allSizes.map((sz) => (
                <button
                  key={sz}
                  type="button"
                  data-testid={`filter-size-${sz}`}
                  onClick={() =>
                    setSelectedSize(selectedSize === sz ? "" : sz)
                  }
                  className={`w-7 h-7 rounded text-xs font-semibold border transition-colors ${
                    selectedSize === sz
                      ? "bg-stone-900 text-white border-stone-900"
                      : "bg-white text-stone-700 border-stone-300 hover:border-stone-500"
                  }`}
                >
                  {sz}
                </button>
              ))}
            </div>

            <select
              aria-label="Filter by Colour"
              data-testid="shop-color-filter"
              value={selectedColor}
              onChange={(e) => setSelectedColor(e.target.value)}
              className="px-2.5 py-1.5 text-xs border border-stone-300 rounded-md bg-white"
            >
              <option value="">All Colours</option>
              {allColors.map((color) => (
                <option key={color} value={color}>
                  {color}
                </option>
              ))}
            </select>

            <label className="inline-flex items-center gap-1.5 text-xs text-stone-700 cursor-pointer">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => setInStockOnly(e.target.checked)}
                className="rounded border-stone-300 text-stone-900 focus:ring-stone-900"
              />
              In Stock Only
            </label>

            {(searchQuery ||
              selectedCategory !== "all" ||
              selectedSize ||
              selectedColor ||
              priceRange !== "all" ||
              inStockOnly) && (
              <button
                type="button"
                data-testid="clear-filters-button"
                onClick={clearFilters}
                className="inline-flex items-center gap-1 text-xs font-semibold text-red-700 hover:text-red-900"
              >
                <X className="h-3.5 w-3.5" />
                Reset Filters
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Product Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((n) => (
            <div
              key={n}
              className="aspect-[4/5] rounded-xl bg-stone-200 animate-pulse"
            />
          ))}
        </div>
      ) : filteredProducts.length === 0 ? (
        <div
          data-testid="empty-catalogue-state"
          className="bg-white rounded-2xl border border-stone-200 p-12 text-center space-y-4"
        >
          <p className="text-lg font-serif text-stone-800">
            No garments match your current search or filter criteria.
          </p>
          <p className="text-sm text-stone-500">
            Try clearing one or more filters or searching for another keyword.
          </p>
          <button
            type="button"
            onClick={clearFilters}
            className="px-5 py-2.5 bg-stone-900 text-white text-sm font-medium rounded-md hover:bg-stone-800"
          >
            View All Garments
          </button>
        </div>
      ) : (
        <div
          data-testid="product-catalogue-grid"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-7xl mx-auto px-4 py-12 text-sm text-stone-500">
          Loading collection...
        </div>
      }
    >
      <ShopCatalogueContent />
    </Suspense>
  );
}

