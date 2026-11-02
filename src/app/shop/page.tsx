"use client";

import React, { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Search, SlidersHorizontal, X, Check, ArrowUpDown } from "lucide-react";
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

  // Mobile Filter Drawer State
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

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

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (selectedCategory !== "all") count++;
    if (selectedSize) count++;
    if (selectedColor) count++;
    if (priceRange !== "all") count++;
    if (inStockOnly) count++;
    if (searchQuery.trim()) count++;
    return count;
  }, [selectedCategory, selectedSize, selectedColor, priceRange, inStockOnly, searchQuery]);

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
    setMobileFilterOpen(false);
    router.replace("/shop");
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-6 sm:space-y-8">
      {/* Page Header */}
      <div className="border-b border-stone-200 pb-4 sm:pb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-2 sm:gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-brand-700">
            Store Catalogue
          </p>
          <h1
            data-testid="catalogue-heading"
            className="text-2xl sm:text-4xl font-serif text-stone-900 mt-0.5 sm:mt-1"
          >
            {selectedCategory === "all"
              ? "All Clothing & Essentials"
              : categories.find((c) => c.slug === selectedCategory)?.name ||
                "Collection"}
          </h1>
        </div>
        <p
          data-testid="catalogue-count"
          className="text-xs sm:text-sm text-stone-600 font-medium"
        >
          Showing {filteredProducts.length} of {products.length} garments
        </p>
      </div>

      {/* Horizontal Category Scroll Bar (Mobile & Tablet) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none -mx-3 px-3 sm:mx-0 sm:px-0">
        <button
          type="button"
          data-testid="filter-category-all"
          onClick={() => setSelectedCategory("all")}
          className={`shrink-0 px-3.5 py-2 rounded-full text-xs font-medium min-h-[40px] transition-colors ${
            selectedCategory === "all"
              ? "bg-stone-900 text-white"
              : "bg-white text-stone-700 border border-stone-300 hover:bg-stone-100"
          }`}
        >
          All Categories
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            type="button"
            data-testid={`filter-category-${cat.slug}`}
            onClick={() => setSelectedCategory(cat.slug)}
            className={`shrink-0 px-3.5 py-2 rounded-full text-xs font-medium min-h-[40px] transition-colors ${
              selectedCategory === cat.slug
                ? "bg-stone-900 text-white"
                : "bg-white text-stone-700 border border-stone-300 hover:bg-stone-100"
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Mobile Sticky Quick Action Filter Bar (< md) */}
      <div className="md:hidden flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="h-4 w-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search garments..."
            className="w-full pl-9 pr-3 py-2.5 text-base border border-stone-300 rounded-lg bg-white"
          />
        </div>
        <button
          type="button"
          data-testid="mobile-filter-open-btn"
          onClick={() => setMobileFilterOpen(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg border border-stone-300 bg-white text-xs font-semibold text-stone-900 shrink-0 min-h-[44px]"
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filters
          {activeFiltersCount > 0 && (
            <span className="w-5 h-5 rounded-full bg-stone-900 text-white text-[10px] flex items-center justify-center font-bold">
              {activeFiltersCount}
            </span>
          )}
        </button>
      </div>

      {/* Desktop Search & Filter Controls (hidden on mobile, visible md+) */}
      <div className="hidden md:block bg-white p-5 rounded-xl border border-stone-200 shadow-sm space-y-5">
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

        {/* Size, Color, Stock Filters */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-stone-100">
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
          </div>

          {activeFiltersCount > 0 && (
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

      {/* Active Filter Chips (Mobile & Desktop) */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-xs text-stone-500 font-medium">Active:</span>
          {selectedCategory !== "all" && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-stone-200 text-stone-800 text-xs">
              Category: {categories.find((c) => c.slug === selectedCategory)?.name || selectedCategory}
              <button
                type="button"
                onClick={() => setSelectedCategory("all")}
                className="hover:text-red-700"
              >
                ✕
              </button>
            </span>
          )}
          {selectedSize && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-stone-200 text-stone-800 text-xs">
              Size: {selectedSize}
              <button
                type="button"
                onClick={() => setSelectedSize("")}
                className="hover:text-red-700"
              >
                ✕
              </button>
            </span>
          )}
          {selectedColor && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-stone-200 text-stone-800 text-xs">
              Colour: {selectedColor}
              <button
                type="button"
                onClick={() => setSelectedColor("")}
                className="hover:text-red-700"
              >
                ✕
              </button>
            </span>
          )}
          {priceRange !== "all" && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-stone-200 text-stone-800 text-xs">
              Price: {priceRange}
              <button
                type="button"
                onClick={() => setPriceRange("all")}
                className="hover:text-red-700"
              >
                ✕
              </button>
            </span>
          )}
          {inStockOnly && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-stone-200 text-stone-800 text-xs">
              In Stock Only
              <button
                type="button"
                onClick={() => setInStockOnly(false)}
                className="hover:text-red-700"
              >
                ✕
              </button>
            </span>
          )}
          <button
            type="button"
            onClick={clearFilters}
            className="text-xs text-red-700 font-semibold underline ml-1"
          >
            Clear All
          </button>
        </div>
      )}

      {/* Product Grid - 2-Column on Mobile, 4-Column on Desktop */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
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
          className="bg-white rounded-2xl border border-stone-200 p-8 sm:p-12 text-center space-y-4"
        >
          <p className="text-base sm:text-lg font-serif text-stone-800">
            No garments match your current search or filter criteria.
          </p>
          <p className="text-xs sm:text-sm text-stone-500">
            Try clearing one or more filters or searching for another keyword.
          </p>
          <button
            type="button"
            onClick={clearFilters}
            className="px-5 py-2.5 bg-stone-900 text-white text-xs sm:text-sm font-medium rounded-lg hover:bg-stone-800 min-h-[44px]"
          >
            View All Garments
          </button>
        </div>
      ) : (
        <div
          data-testid="product-catalogue-grid"
          className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6"
        >
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

      {/* Mobile Filter Slide-Over Drawer */}
      {mobileFilterOpen && (
        <div
          data-testid="mobile-filter-drawer"
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-end animate-in fade-in duration-200"
        >
          <div className="bg-white w-full max-w-xs h-full flex flex-col justify-between p-5 space-y-6 overflow-y-auto shadow-2xl">
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-stone-200 pb-3">
                <h3 className="font-serif text-lg text-stone-900">
                  Filters & Sorting
                </h3>
                <button
                  type="button"
                  onClick={() => setMobileFilterOpen(false)}
                  className="p-2 text-stone-500 hover:text-stone-900"
                  aria-label="Close filters"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Categories */}
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-stone-600">
                  Category
                </label>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    data-testid="mobile-filter-category-all"
                    onClick={() => setSelectedCategory("all")}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium border ${
                      selectedCategory === "all"
                        ? "bg-stone-900 text-white border-stone-900"
                        : "bg-white text-stone-700 border-stone-300"
                    }`}
                  >
                    All
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      data-testid={`mobile-filter-category-${cat.slug}`}
                      onClick={() => setSelectedCategory(cat.slug)}
                      className={`px-3 py-1.5 rounded-md text-xs font-medium border ${
                        selectedCategory === cat.slug
                          ? "bg-stone-900 text-white border-stone-900"
                          : "bg-white text-stone-700 border-stone-300"
                      }`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sort Order */}
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-stone-600">
                  Sort By
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm border border-stone-300 rounded-lg bg-white"
                >
                  <option value="featured">Featured</option>
                  <option value="newest">Newest Arrivals</option>
                  <option value="price-asc">Price (Low to High)</option>
                  <option value="price-desc">Price (High to Low)</option>
                  <option value="name-asc">Name (A – Z)</option>
                </select>
              </div>

              {/* Price Range */}
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-stone-600">
                  Price Range
                </label>
                <select
                  value={priceRange}
                  onChange={(e) => setPriceRange(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm border border-stone-300 rounded-lg bg-white"
                >
                  <option value="all">All Prices</option>
                  <option value="under-2000">Under ₹2,000</option>
                  <option value="2000-4000">₹2,000 – ₹4,000</option>
                  <option value="above-4000">Above ₹4,000</option>
                </select>
              </div>

              {/* Size */}
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-stone-600">
                  Size
                </label>
                <div className="flex flex-wrap gap-2">
                  {allSizes.map((sz) => (
                    <button
                      key={sz}
                      type="button"
                      onClick={() =>
                        setSelectedSize(selectedSize === sz ? "" : sz)
                      }
                      className={`min-w-[44px] min-h-[44px] rounded-lg text-xs font-semibold border ${
                        selectedSize === sz
                          ? "bg-stone-900 text-white border-stone-900"
                          : "bg-white text-stone-700 border-stone-300"
                      }`}
                    >
                      {sz}
                    </button>
                  ))}
                </div>
              </div>

              {/* Colour */}
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-stone-600">
                  Colour
                </label>
                <select
                  value={selectedColor}
                  onChange={(e) => setSelectedColor(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm border border-stone-300 rounded-lg bg-white"
                >
                  <option value="">All Colours</option>
                  {allColors.map((color) => (
                    <option key={color} value={color}>
                      {color}
                    </option>
                  ))}
                </select>
              </div>

              {/* In Stock */}
              <label className="flex items-center gap-2 text-sm text-stone-700 cursor-pointer pt-2">
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={(e) => setInStockOnly(e.target.checked)}
                  className="rounded border-stone-300 text-stone-900 h-4 w-4"
                />
                In Stock Garments Only
              </label>
            </div>

            <div className="pt-4 border-t border-stone-200 space-y-2">
              <button
                type="button"
                data-testid="mobile-filter-drawer-apply-btn"
                onClick={() => setMobileFilterOpen(false)}
                className="w-full py-3 bg-stone-900 text-white text-sm font-semibold rounded-lg"
              >
                Apply Filters ({filteredProducts.length})
              </button>
              <button
                type="button"
                onClick={clearFilters}
                className="w-full py-2.5 text-xs text-stone-500 font-medium text-center hover:text-stone-900"
              >
                Reset All Filters
              </button>
            </div>
          </div>
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
